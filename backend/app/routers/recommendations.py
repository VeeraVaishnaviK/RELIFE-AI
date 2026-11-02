from fastapi import APIRouter, Depends, HTTPException, status
from beanie import PydanticObjectId
from datetime import datetime

from app.models.product import Product
from app.models.inspection import Inspection
from app.models.recovery import Recommendation, RecoveryOption
from app.models.marketplace import MarketData
from app.services.decision_engine import DecisionEngine
from app.core.security import get_current_user

router = APIRouter(prefix="/recommendations", tags=["Recommendation Reports"])

@router.post("/generate/{product_id}")
async def generate_recommendation_report(
    product_id: str,
    current_user = Depends(get_current_user)
):
    prod = None
    if PydanticObjectId.is_valid(product_id):
        prod = await Product.get(PydanticObjectId(product_id))
    if not prod:
        prod = await Product.find_one(Product.product_uid == product_id)
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    inspection = await Inspection.find_one(Inspection.product_id == prod.id)
    market_data = await MarketData.find_one(MarketData.product_category == prod.category)

    decision_res = DecisionEngine.evaluate(prod, inspection, market_data)

    rec = await Recommendation.find_one(Recommendation.product_id == prod.id)
    if rec:
        rec.ranked_options = decision_res["ranked_options"]
        rec.explanation_text = decision_res["explanation"]
        rec.created_at = datetime.utcnow()
        await rec.save()
    else:
        rec = Recommendation(
            product_id=prod.id,
            ranked_options=decision_res["ranked_options"],
            explanation_text=decision_res["explanation"],
            model_version="v1.0-decision-engine",
            confidence=0.91,
            missing_info=[]
        )
        await rec.insert()

    return {
        "success": True,
        "product_id": str(prod.id),
        "product_uid": prod.product_uid,
        "recommendation": rec,
        "decision_summary": decision_res
    }

@router.get("/{product_id}")
async def get_recommendation(product_id: str):
    prod = None
    if PydanticObjectId.is_valid(product_id):
        prod = await Product.get(PydanticObjectId(product_id))
    if not prod:
        prod = await Product.find_one(Product.product_uid == product_id)
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    rec = await Recommendation.find_one(Recommendation.product_id == prod.id)
    if not rec:
        raise HTTPException(status_code=404, detail="No recommendation generated for this product")
    return rec
