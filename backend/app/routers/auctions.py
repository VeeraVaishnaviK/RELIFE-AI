from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from beanie import PydanticObjectId

from app.models.marketplace import Component, ComponentAuction, AuctionBid
from app.models.user import User
from app.services.auction_engine import AuctionEngine
from app.core.security import get_current_user, require_role

router = APIRouter(prefix="/auctions", tags=["Component Marketplace & Reverse Auctions"])

class CreateAuctionRequest(BaseModel):
    component_id: str
    starting_price: Optional[float] = None
    reserve_price: Optional[float] = None
    duration_hours: float = 24.0

class PlaceBidRequest(BaseModel):
    bid_amount: float

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_auction(
    req: CreateAuctionRequest,
    current_user: User = Depends(require_role(["admin", "inspector", "reseller", "recycler"]))
):
    if not PydanticObjectId.is_valid(req.component_id):
        raise HTTPException(status_code=400, detail="Invalid component ID")

    comp = await Component.get(PydanticObjectId(req.component_id))
    if not comp:
        raise HTTPException(status_code=404, detail="Component not found")

    pricing = AuctionEngine.auto_suggest_pricing(comp.estimated_value)
    starting = req.starting_price if req.starting_price is not None else pricing["starting_price"]
    reserve = req.reserve_price if req.reserve_price is not None else pricing["reserve_price"]

    now = datetime.utcnow()
    auction = ComponentAuction(
        component_id=comp.id,
        starting_price=starting,
        reserve_price=reserve,
        current_highest_bid=starting,
        current_highest_bidder_id=None,
        start_time=now,
        end_time=now + timedelta(hours=req.duration_hours),
        status="open",
        bids=[]
    )
    await auction.insert()
    return auction

@router.post("/{auction_id}/bid")
async def place_bid(
    auction_id: str,
    req: PlaceBidRequest,
    current_user: User = Depends(get_current_user)
):
    if not PydanticObjectId.is_valid(auction_id):
        raise HTTPException(status_code=400, detail="Invalid auction ID")

    auction = await ComponentAuction.get(PydanticObjectId(auction_id))
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")

    try:
        result = await AuctionEngine.place_bid(auction, current_user, req.bid_amount)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{auction_id}/close")
async def close_auction(
    auction_id: str,
    current_user: User = Depends(require_role(["admin"]))
):
    if not PydanticObjectId.is_valid(auction_id):
        raise HTTPException(status_code=400, detail="Invalid auction ID")

    auction = await ComponentAuction.get(PydanticObjectId(auction_id))
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")

    auction.status = "awarded" if (auction.current_highest_bid >= auction.reserve_price and auction.current_highest_bidder_id) else "closed"
    for b in auction.bids:
        if b.bidder_id == auction.current_highest_bidder_id and b.bid_amount == auction.current_highest_bid:
            b.status = "won"
        elif b.status == "active":
            b.status = "lost"

    await auction.save()
    return {"success": True, "auction": auction}

@router.get("/active")
async def list_active_auctions():
    auctions = await ComponentAuction.find(ComponentAuction.status == "open").sort("-end_time").to_list()
    enriched = []
    for a in auctions:
        comp = await Component.get(a.component_id)
        enriched.append({
            "auction": a,
            "component": comp
        })
    return {"total": len(enriched), "auctions": enriched}

@router.get("/{auction_id}")
async def get_auction(auction_id: str):
    if not PydanticObjectId.is_valid(auction_id):
        raise HTTPException(status_code=400, detail="Invalid auction ID")

    auction = await ComponentAuction.get(PydanticObjectId(auction_id))
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")

    comp = await Component.get(auction.component_id)
    return {"auction": auction, "component": comp}
