from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from beanie import PydanticObjectId
from app.models.product import Product
from app.models.operations import Enquiry, Allocation
from app.models.user import User
from app.models.marketplace import MarketData

class AllocationEngine:
    @staticmethod
    async def score_enquiry(enquiry: Enquiry, product: Product, market_price: float = 30000.0) -> float:
        """
        Computes multi-factor allocation score:
        score = w1*reseller_tier + w2*recency + w3*user.reliability_score + w4*(max_price/market_price) - w5*cancellation_rate
        """
        user = await User.get(enquiry.customer_id)
        reliability = user.reliability_score if user else 100.0
        
        # Reseller tier proxy (resellers get higher priority batch scoring)
        is_reseller = (user.role == "reseller") if user else False
        reseller_tier_score = 95.0 if is_reseller else 80.0
        
        # Recency bonus: max 100, decays over 14 days
        age_hours = (datetime.utcnow() - enquiry.created_at).total_seconds() / 3600.0
        recency_score = max(100.0 - (age_hours * 0.2), 20.0)
        
        # Price ratio (willingness to pay vs benchmark)
        price_ratio = min((enquiry.max_price / max(market_price, 1.0)) * 100.0, 150.0)
        
        # Urgency multiplier
        urgency_bonus = 15.0 if enquiry.urgency_flag else 0.0
        
        # Weighted composite
        score = (
            (0.20 * reseller_tier_score) +
            (0.20 * recency_score) +
            (0.30 * reliability) +
            (0.30 * price_ratio) +
            urgency_bonus
        )
        return round(score, 2)

    @classmethod
    async def run_allocation(cls, product: Product) -> Optional[Allocation]:
        """
        When Product enters 'resale_listed', scores open Enquiries for matching category
        and creates an Allocation with 30-min expiry window.
        """
        # Find open waiting enquiries matching category
        waiting_enquiries = await Enquiry.find(
            Enquiry.product_category == product.category,
            Enquiry.status == "waiting"
        ).to_list()

        if not waiting_enquiries:
            return None

        # Fetch market price benchmark
        md = await MarketData.find_one(MarketData.product_category == product.category)
        market_price = md.resale_price if md else product.purchase_price * 0.60

        scored_candidates = []
        for enq in waiting_enquiries:
            score = await cls.score_enquiry(enq, product, market_price)
            scored_candidates.append((score, enq))

        # Sort highest score first
        scored_candidates.sort(key=lambda x: x[0], reverse=True)
        best_score, top_enquiry = scored_candidates[0]

        # Create allocation with 30-minute reservation expiry
        reservation_expiry = datetime.utcnow() + timedelta(minutes=30)
        allocation = Allocation(
            enquiry_id=top_enquiry.id,
            product_id=product.id,
            allocation_score=best_score,
            status="pending_confirmation",
            reservation_expiry=reservation_expiry
        )
        await allocation.insert()

        top_enquiry.status = "allocated"
        await top_enquiry.save()

        return allocation

    @classmethod
    async def check_allocation_expiries(cls):
        """
        APScheduler periodic job:
        Checks for expired allocations (reservation_expiry passed without confirmation),
        marks them expired and cascades to the next eligible enquiry.
        """
        now = datetime.utcnow()
        expired_allocations = await Allocation.find(
            Allocation.status == "pending_confirmation",
            Allocation.reservation_expiry < now
        ).to_list()

        for alloc in expired_allocations:
            alloc.status = "expired"
            await alloc.save()

            # Mark enquiry back to expired or waiting
            enq = await Enquiry.get(alloc.enquiry_id)
            if enq:
                enq.status = "expired"
                await enq.save()

            # Re-run allocation for product
            prod = await Product.get(alloc.product_id)
            if prod and prod.status == "resale_listed":
                await cls.run_allocation(prod)
