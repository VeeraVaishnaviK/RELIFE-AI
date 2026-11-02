from datetime import datetime
from typing import Optional, List, Dict, Any
from beanie import Document, Indexed, PydanticObjectId
from pydantic import BaseModel, Field

class ServiceRecord(BaseModel):
    service_id: str
    date: str
    service_type: str
    provider: str
    status: str = "Completed"
    notes: Optional[str] = None
    cost: Optional[float] = 0.0

class HealthCheck(BaseModel):
    score: int = 92
    battery_health: Optional[int] = 88
    status: str = "Passed Diagnostics"
    diagnostics: Dict[str, Any] = Field(default_factory=lambda: {
        "display": "Pass",
        "battery": "Good",
        "internals": "Nominal",
        "ports": "Pass",
        "sensors": "Pass"
    })
    last_checked: Optional[str] = None

class ReturnInfo(BaseModel):
    return_reason: Optional[str] = "Defective / Return"
    return_date: datetime = Field(default_factory=datetime.utcnow)
    customer_reported_issue: Optional[str] = None
    warranty_status: Optional[str] = "In Warranty"
    customer_id: Optional[PydanticObjectId] = None

class Product(Document):
    product_uid: Indexed(str, unique=True)
    serial_number: Optional[str] = None
    brand: str
    model: str
    category: str = Field(description="laptop, smartphone, tablet, etc.")
    age_months: int = 6
    purchase_price: float = 0.0
    purchase_date: Optional[str] = None
    condition: Optional[str] = "Grade A (Like New)"
    health_check: Optional[HealthCheck] = None
    service_records: List[ServiceRecord] = Field(default_factory=list)
    qr_code_base64: Optional[str] = None
    status: str = Field(
        default="registered",
        description="registered, inspected, decided, resale_listed, sold, recycled, leased"
    )
    created_at: datetime = Field(default_factory=datetime.utcnow)
    return_info: ReturnInfo = Field(default_factory=ReturnInfo)

    class Settings:
        name = "products"
        indexes = [
            "product_uid",
            "serial_number",
            "category",
            "status",
            "created_at"
        ]
