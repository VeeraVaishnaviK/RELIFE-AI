from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from beanie import PydanticObjectId
from app.models.marketplace import Component, ComponentAuction, AuctionBid
from app.models.user import User

class AuctionEngine:
    @staticmethod
    def auto_suggest_pricing(estimated_value: float) -> Dict[str, float]:
        """
        Calculates optimal reverse/forward auction price bands based on component market benchmarks.
        """
        starting_price = round(estimated_value * 0.85, 2)
        reserve_price = round(estimated_value * 0.65, 2)
        min_increment = max(round(estimated_value * 0.03, 2), 50.0)
        return {
            "starting_price": starting_price,
            "reserve_price": reserve_price,
            "min_increment": min_increment
        }

    @staticmethod
    async def place_bid(auction: ComponentAuction, bidder: User, bid_amount: float) -> Dict[str, Any]:
        """
        Validates bid, appends to embedded bids list, and applies anti-sniping extension.
        """
        now = datetime.utcnow()
        if auction.status != "open":
            raise ValueError(f"Auction is already {auction.status}")
        if now > auction.end_time:
            auction.status = "closed"
            await auction.save()
            raise ValueError("Auction has ended")
        
        min_required = max(auction.current_highest_bid + 50.0, auction.starting_price)
        if bid_amount < min_required:
            raise ValueError(f"Bid amount ₹{bid_amount:,.2f} must be at least ₹{min_required:,.2f}")

        # Mark previous highest bid as outbid
        for b in auction.bids:
            if b.status == "active":
                b.status = "outbid"

        # Anti-sniping: If bid placed within last 5 minutes of end_time, extend by 5 minutes
        time_remaining = (auction.end_time - now).total_seconds()
        sniping_extended = False
        if time_remaining < 300:  # 5 minutes
            auction.end_time = auction.end_time + timedelta(minutes=5)
            sniping_extended = True

        new_bid = AuctionBid(
            bidder_id=bidder.id,
            bid_amount=round(bid_amount, 2),
            bid_time=now,
            status="active"
        )
        auction.bids.append(new_bid)
        auction.current_highest_bid = round(bid_amount, 2)
        auction.current_highest_bidder_id = bidder.id
        await auction.save()

        return {
            "success": True,
            "current_highest_bid": auction.current_highest_bid,
            "anti_sniping_extended": sniping_extended,
            "new_end_time": auction.end_time
        }

    @staticmethod
    async def check_dutch_decay_and_expiry():
        """
        Periodic scheduler task:
        1. Decays price for zero-bid auctions nearing expiry (Dutch auction mechanics)
        2. Closes expired auctions and awards to highest bidder if reserve met
        """
        now = datetime.utcnow()
        open_auctions = await ComponentAuction.find(ComponentAuction.status == "open").to_list()
        
        for auction in open_auctions:
            # Check expiry
            if now >= auction.end_time:
                auction.status = "awarded" if (auction.current_highest_bid >= auction.reserve_price and auction.current_highest_bidder_id) else "closed"
                # Mark winning bid
                for b in auction.bids:
                    if b.bidder_id == auction.current_highest_bidder_id and b.bid_amount == auction.current_highest_bid:
                        b.status = "won"
                    elif b.status == "active":
                        b.status = "lost"
                await auction.save()
                continue

            # Dutch price decay: If no bids placed and less than 50% time left
            total_duration = (auction.end_time - auction.start_time).total_seconds()
            time_left = (auction.end_time - now).total_seconds()
            if len(auction.bids) == 0 and time_left < (total_duration * 0.5):
                # Decay starting price by 2.5% towards reserve price
                decayed = auction.starting_price * 0.975
                if decayed >= auction.reserve_price:
                    auction.starting_price = round(decayed, 2)
                    await auction.save()
