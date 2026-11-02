from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from beanie import PydanticObjectId

from app.models.inspection import Inspection, DefectItem
from app.models.product import Product
from app.models.user import User
from app.core.security import get_current_user, get_current_user_optional, require_role
from app.services.decision_engine import DecisionEngine
from app.services.trust_score_engine import TrustScoreEngine

router = APIRouter(prefix="/review-queue", tags=["Human Review Queue"])

class ResolveReviewRequest(BaseModel):
    override_defects: Optional[List[DefectItem]] = None
    reviewer_notes: Optional[str] = "Human QA inspection verified and approved"
    selected_pathway: Optional[str] = None

@router.get("")
async def list_review_queue(current_user: Optional[User] = Depends(get_current_user_optional)):
    # Find all inspections requiring human review
    inspections = await Inspection.find(Inspection.requires_human_review == True).to_list()
    
    items = []
    for insp in inspections:
        prod = await Product.get(insp.product_id)
        if not prod:
            continue
            
        reasons = []
        if insp.confidence_score < 0.75:
            reasons.append(f"Low overall confidence ({round(insp.confidence_score*100)}%)")
        for d in insp.defects:
            if d.severity_estimate == "high":
                reasons.append(f"High severity {d.defect_category} on {d.location}")
            if d.detection_confidence < 0.60:
                reasons.append(f"Uncertain defect: {d.defect_category} ({round(d.detection_confidence*100)}%)")
                
        if not reasons:
            reasons.append("Flagged for manual verification")

        items.append({
            "inspection_id": str(insp.id),
            "product_id": str(prod.id),
            "product_uid": prod.product_uid,
            "brand": prod.brand,
            "model": prod.model,
            "category": prod.category,
            "flagged_reasons": reasons,
            "confidence_score": insp.confidence_score,
            "defects_count": len(insp.defects),
            "created_at": insp.created_at,
            "defects": insp.defects
        })
        
    return {"total_queued": len(items), "queue": items, "items": items}

@router.post("/{inspection_id}/resolve")
async def resolve_review_item(
    inspection_id: str,
    req: ResolveReviewRequest,
    current_user: User = Depends(require_role(["admin", "inspector"]))
):
    if not PydanticObjectId.is_valid(inspection_id):
        raise HTTPException(status_code=400, detail="Invalid inspection ID")
        
    insp = await Inspection.get(PydanticObjectId(inspection_id))
    if not insp:
        raise HTTPException(status_code=404, detail="Inspection not found")

    prod = await Product.get(insp.product_id)
    if not prod:
        raise HTTPException(status_code=404, detail="Associated product not found")

    # Update defects if reviewer provided manual corrections
    if req.override_defects is not None:
        insp.defects = req.override_defects

    insp.requires_human_review = False
    insp.condition_summary += f" | Resolved by {current_user.name}: {req.reviewer_notes}"
    insp.confidence_score = 0.98  # Human-verified high confidence
    await insp.save()

    # Recalculate Trust Score
    await TrustScoreEngine.compute_and_save(prod, insp)

    # Re-trigger decision engine with clean verified data
    decision = DecisionEngine.evaluate(product=prod, inspection=insp)

    return {
        "success": True,
        "message": f"Inspection for {prod.product_uid} successfully resolved",
        "updated_decision": decision
    }
