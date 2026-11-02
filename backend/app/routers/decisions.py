from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from beanie import PydanticObjectId
from datetime import datetime

from app.models.product import Product
from app.models.inspection import Inspection
from app.models.recovery import Recommendation, RecoveryOption
from app.models.marketplace import MarketData
from app.services.decision_engine import DecisionEngine
from app.core.security import get_current_user, get_current_user_optional

router = APIRouter(prefix="/decisions", tags=["Five-Pathway Decision Engine"])

class EvaluateDecisionRequest(BaseModel):
    profit_weight: float = Field(0.40, ge=0.0, le=1.0)
    env_weight: float = Field(0.30, ge=0.0, le=1.0)
    speed_weight: float = Field(0.15, ge=0.0, le=1.0)
    risk_weight: float = Field(0.15, ge=0.0, le=1.0)

@router.post("/evaluate/{product_id}")
async def evaluate_product_decision(
    product_id: str,
    req: EvaluateDecisionRequest,
    current_user = Depends(get_current_user_optional)
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

    decision_res = DecisionEngine.evaluate(
        product=prod,
        inspection=inspection,
        market_data=market_data,
        profit_weight=req.profit_weight,
        env_weight=req.env_weight,
        speed_weight=req.speed_weight,
        risk_weight=req.risk_weight
    )

    # Save Recommendation document
    existing_rec = await Recommendation.find_one(Recommendation.product_id == prod.id)
    if existing_rec:
        existing_rec.ranked_options = decision_res["ranked_options"]
        existing_rec.explanation_text = decision_res["explanation"]
        existing_rec.created_at = datetime.utcnow()
        await existing_rec.save()
    else:
        new_rec = Recommendation(
            product_id=prod.id,
            ranked_options=decision_res["ranked_options"],
            explanation_text=decision_res["explanation"],
            model_version="v1.0-decision-engine",
            confidence=0.91,
            missing_info=[]
        )
        await new_rec.insert()

    # Update Product status to 'decided' if registered or inspected
    if prod.status in ["registered", "inspected"]:
        prod.status = "decided"
        await prod.save()

    return decision_res

@router.get("/{product_id}")
async def get_decision(product_id: str):
    prod = None
    if PydanticObjectId.is_valid(product_id):
        prod = await Product.get(PydanticObjectId(product_id))
    if not prod:
        prod = await Product.find_one(Product.product_uid == product_id)
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    inspection = await Inspection.find_one(Inspection.product_id == prod.id)
    market_data = await MarketData.find_one(MarketData.product_category == prod.category)
    return DecisionEngine.evaluate(prod, inspection, market_data)
