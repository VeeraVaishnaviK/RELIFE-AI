from datetime import datetime
from typing import List, Dict, Any, Optional
from beanie import Document, Indexed, PydanticObjectId
from pydantic import BaseModel, Field

class MarketData(Document):
    product_category: Indexed(str)
    resale_price: float
    demand_index: float = 1.0  # 0.5 (low) to 1.5 (high)
    sale_probability: float = 0.85
    recorded_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "market_data"
        indexes = [
            "product_category",
            "recorded_at"
        ]

class Component(Document):
    product_id: PydanticObjectId
    component_name: str
    compatibility_tags: List[str] = Field(default_factory=list)
    condition: str = "Working / Tested"
    test_status: str = "Passed"
    estimated_value: float = 0.0
    status: str = Field(default="available", description="available, reserved, sold")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "components"
        indexes = [
            "product_id",
            "status",
            "component_name"
        ]

class Buyer(Document):
    buyer_type: str = Field(description="repair_shop, refurbisher, recycler, individual")
    component_requirements: Dict[str, Any] = Field(default_factory=dict)
    indicative_price: float = 0.0
    location: str = "National"

    class Settings:
        name = "buyers"
        indexes = [
            "buyer_type"
        ]

class AuctionBid(BaseModel):
    bidder_id: PydanticObjectId
    bid_amount: float
    bid_time: datetime = Field(default_factory=datetime.utcnow)
    status: str = Field(default="active", description="active, outbid, won, lost")

class ComponentAuction(Document):
    component_id: Indexed(PydanticObjectId)
    starting_price: float
    reserve_price: float
    current_highest_bid: float = 0.0
    current_highest_bidder_id: Optional[PydanticObjectId] = None
    start_time: datetime = Field(default_factory=datetime.utcnow)
    end_time: datetime
    status: str = Field(default="open", description="open, closed, awarded")
    bids: List[AuctionBid] = Field(default_factory=list)

    class Settings:
        name = "component_auctions"
        indexes = [
            "component_id",
            "status",
            "end_time"
        ]
