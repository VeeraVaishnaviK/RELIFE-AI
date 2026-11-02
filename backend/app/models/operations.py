from datetime import datetime
from typing import Dict, Any, Optional
from beanie import Document, Indexed, PydanticObjectId
from pydantic import BaseModel, Field

class Enquiry(Document):
    product_category: Indexed(str)
    customer_id: PydanticObjectId
    max_price: float
    quantity_needed: int = 1
    urgency_flag: bool = False
    status: str = Field(default="waiting", description="waiting, allocated, expired")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "enquiries"
        indexes = [
            "product_category",
            "customer_id",
            "status",
            "created_at"
        ]

class Allocation(Document):
    enquiry_id: PydanticObjectId
    product_id: PydanticObjectId
    allocation_score: float = 0.0
    status: str = Field(
        default="pending_confirmation",
        description="pending_confirmation, confirmed, declined, expired"
    )
    reservation_expiry: datetime

    class Settings:
        name = "allocations"
        indexes = [
            "enquiry_id",
            "product_id",
            "status",
            "reservation_expiry"
        ]

class LeaseAgreement(Document):
    product_id: PydanticObjectId
    customer_id: PydanticObjectId
    monthly_fee: float
    start_date: datetime = Field(default_factory=datetime.utcnow)
    end_date: datetime
    status: str = Field(default="active", description="active, completed, overdue")

    class Settings:
        name = "lease_agreements"
        indexes = [
            "product_id",
            "customer_id",
            "status"
        ]

class RoiCalculatorSession(Document):
    session_token: str
    input_params: Dict[str, Any] = Field(default_factory=dict)
    output_results: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "roi_calculator_sessions"
        indexes = [
            "session_token",
            "created_at"
        ]
