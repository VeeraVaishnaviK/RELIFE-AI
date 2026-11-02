from datetime import datetime
from typing import Optional
from beanie import Document, Indexed
from pydantic import BaseModel, Field

class User(Document):
    name: str
    email: Indexed(str, unique=True)
    password_hash: str
    role: str = Field(description="Role: admin, inspector, reseller, customer, repair_partner, recycler")
    phone: Optional[str] = None
    reliability_score: float = 100.0
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"
        indexes = [
            "email",
            "role"
        ]
