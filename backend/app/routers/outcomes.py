from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from beanie import PydanticObjectId
from datetime import datetime

from app.models.recovery import RecoveryOutcome
from app.models.product import Product
from app.core.security import get_current_user

router = APIRouter(prefix="/outcomes", tags=["Outcome Tracking & Feedback Loop"])

class CreateOutcomeRequest(BaseModel):
    product_id: str
    recommended_pathway: str
    selected_pathway: str
    override_reason: Optional[str] = None
    actual_cost: float
    realized_revenue: float
    completion_time_days: float = 3.0

@router.post("", status_code=status.HTTP_201_CREATED)
async def record_outcome(
    req: CreateOutcomeRequest,
    current_user = Depends(get_current_user)
):
    prod = None
    if PydanticObjectId.is_valid(req.product_id):
        prod = await Product.get(PydanticObjectId(req.product_id))
    if not prod:
        prod = await Product.find_one(Product.product_uid == req.product_id)
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    outcome = RecoveryOutcome(
        product_id=prod.id,
        recommended_pathway=req.recommended_pathway.lower(),
        selected_pathway=req.selected_pathway.lower(),
        override_reason=req.override_reason,
        actual_cost=req.actual_cost,
        realized_revenue=req.realized_revenue,
        completion_time_days=req.completion_time_days,
        created_at=datetime.utcnow()
    )
    await outcome.insert()

    # Update product status
    if req.selected_pathway.lower() == "recycle":
        prod.status = "recycled"
    elif req.selected_pathway.lower() in ["resale", "repair", "refurbish"]:
        prod.status = "sold"
    await prod.save()

    return outcome

@router.get("/analytics")
async def get_outcomes_analytics():
    """
    MongoDB aggregation pipeline:
    Calculates prediction-vs-actual performance, revenue realization rate,
    pathway adherence rate, and average completion cycles.
    """
    pipeline = [
        {
            "$group": {
                "_id": None,
                "total_outcomes": {"$sum": 1},
                "total_actual_revenue": {"$sum": "$realized_revenue"},
                "total_actual_cost": {"$sum": "$actual_cost"},
                "avg_turnaround_days": {"$avg": "$completion_time_days"},
                "total_net_recovery": {
                    "$sum": {"$subtract": ["$realized_revenue", "$actual_cost"]}
                }
            }
        }
    ]
    summary = await RecoveryOutcome.aggregate(pipeline).to_list()
    outcomes = await RecoveryOutcome.find_all().to_list()
    
    total = len(outcomes)
    adherence_count = sum(1 for o in outcomes if o.recommended_pathway == o.selected_pathway)
    adherence_rate = round((adherence_count / max(total, 1)) * 100, 1)

    pathway_counts = {}
    for o in outcomes:
        pathway_counts[o.selected_pathway] = pathway_counts.get(o.selected_pathway, 0) + 1

    stats = summary[0] if summary else {
        "total_outcomes": total,
        "total_actual_revenue": 0.0,
        "total_actual_cost": 0.0,
        "avg_turnaround_days": 0.0,
        "total_net_recovery": 0.0
    }

    return {
        "analytics_summary": stats,
        "pathway_adherence_rate_pct": adherence_rate,
        "pathway_distribution": pathway_counts,
        "recent_outcomes": outcomes[-10:]
    }
