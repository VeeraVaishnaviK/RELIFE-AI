from datetime import datetime
from typing import List, Dict, Any, Optional
from beanie import Document, Indexed, PydanticObjectId
from pydantic import BaseModel, Field

class CostItem(BaseModel):
    cost_category: str = Field(description="logistics, inspection, parts, labor, cleaning, recycling")
    amount: float
    status: str = Field(default="estimated", description="estimated, confirmed")
    source: str = Field(default="rule_engine")
    date_recorded: datetime = Field(default_factory=datetime.utcnow)

class RecoveryOption(Document):
    product_id: Indexed(PydanticObjectId)
    pathway: str = Field(description="resale, repair, refurbish, harvest, recycle")
    feasibility_flag: bool = True
    expected_revenue: float = 0.0
    estimated_total_cost: float = 0.0
    net_recovery_value: float = 0.0
    risk_score: float = 0.0
    environmental_score: float = 0.0
    cost_breakdown: List[CostItem] = Field(default_factory=list)

    class Settings:
        name = "recovery_options"
        indexes = [
            "product_id",
            "pathway",
            "net_recovery_value"
        ]

class Recommendation(Document):
    product_id: Indexed(PydanticObjectId)
    ranked_options: List[Dict[str, Any]] = Field(default_factory=list)
    explanation_text: str = ""
    model_version: str = "v1.0-decision-engine"
    confidence: float = 0.90
    missing_info: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "recommendations"
        indexes = [
            "product_id",
            "created_at"
        ]

class RecoveryOutcome(Document):
    product_id: PydanticObjectId
    recommended_pathway: str
    selected_pathway: str
    override_reason: Optional[str] = None
    actual_cost: float = 0.0
    realized_revenue: float = 0.0
    completion_time_days: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "recovery_outcomes"
        indexes = [
            "product_id",
            "selected_pathway",
            "created_at"
        ]

class EnvironmentalRecord(Document):
    product_id: PydanticObjectId
    material_recovered_kg: float = 0.0
    co2_saved_kg: float = 0.0
    waste_diverted_kg: float = 0.0
    assumptions_used: Dict[str, Any] = Field(default_factory=dict)

    class Settings:
        name = "environmental_records"
        indexes = [
            "product_id"
        ]

class RepairPartnerJob(Document):
    recovery_option_id: PydanticObjectId
    repair_partner_id: PydanticObjectId
    status: str = Field(default="assigned", description="assigned, in_progress, completed")
    eta_date: Optional[datetime] = None
    parts_required: List[str] = Field(default_factory=list)

    class Settings:
        name = "repair_partner_jobs"
        indexes = [
            "recovery_option_id",
            "repair_partner_id",
            "status"
        ]
