from datetime import datetime
from typing import List, Dict, Any, Optional
from beanie import Document, Indexed, PydanticObjectId
from pydantic import BaseModel, Field

class DefectItem(BaseModel):
    defect_category: str = Field(description="scratch, dent, crack, missing_component, deformation")
    location: str = Field(default="front", description="screen, casing, keyboard, hinge, back, edge")
    severity_estimate: str = Field(default="medium", description="low, medium, high")
    detection_confidence: float = 0.85
    bounding_box: List[float] = Field(default_factory=list, description="[x1, y1, x2, y2] normalized or pixels")
    image_url: Optional[str] = None

class Inspection(Document):
    product_id: Indexed(PydanticObjectId)
    inspector_id: PydanticObjectId
    condition_summary: str = "Inspection completed"
    confidence_score: float = 0.90
    test_results: Dict[str, Any] = Field(default_factory=dict)
    requires_human_review: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    defects: List[DefectItem] = Field(default_factory=list)
    image_url: Optional[str] = None

    class Settings:
        name = "inspections"
        indexes = [
            "product_id",
            "inspector_id",
            "requires_human_review",
            "created_at"
        ]

class VoiceInspectionLog(Document):
    inspection_id: PydanticObjectId
    raw_transcript: str
    parsed_output: Dict[str, Any] = Field(default_factory=dict)
    inspector_id: PydanticObjectId
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "voice_inspection_logs"
        indexes = [
            "inspection_id",
            "inspector_id"
        ]

class TrustScore(Document):
    product_id: Indexed(PydanticObjectId)
    score_value: int = Field(ge=0, le=100)
    score_breakdown: Dict[str, Any] = Field(default_factory=dict)
    computed_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "trust_scores"
        indexes = [
            "product_id",
            "score_value"
        ]
