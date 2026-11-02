from fastapi import APIRouter, HTTPException
from beanie import PydanticObjectId

from app.models.inspection import TrustScore, Inspection
from app.models.product import Product
from app.services.trust_score_engine import TrustScoreEngine

router = APIRouter(prefix="/trust-score", tags=["Digital Product Passport & Trust Score"])

@router.get("/{product_id}")
async def get_product_trust_score(product_id: str):
    prod = None
    if PydanticObjectId.is_valid(product_id):
        prod = await Product.get(PydanticObjectId(product_id))
    if not prod:
        prod = await Product.find_one(Product.product_uid == product_id)
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    ts = await TrustScore.find_one(TrustScore.product_id == prod.id)
    if not ts:
        inspection = await Inspection.find_one(Inspection.product_id == prod.id)
        ts = await TrustScoreEngine.compute_and_save(prod, inspection)

    return {
        "product_id": str(prod.id),
        "product_uid": prod.product_uid,
        "brand": prod.brand,
        "model": prod.model,
        "trust_score": ts.score_value,
        "score_breakdown": ts.score_breakdown,
        "computed_at": ts.computed_at
    }
