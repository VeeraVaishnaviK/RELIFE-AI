from fastapi import APIRouter, HTTPException, status
from beanie import PydanticObjectId

from app.models.product import Product
from app.models.inspection import Inspection
from app.models.marketplace import MarketData
from app.services.valuation_engine import ValuationEngine
from app.services.pricing_validator import PricingValidator

router = APIRouter(prefix="/valuation", tags=["Resale & Recovery Valuation"])

@router.get("/cost-matrix/{product_id}")
async def get_cost_validation_matrix(product_id: str):
    """
    Looks up verified original retail value (MSRP) and returns full financial appraisal matrix.
    """
    prod = None
    if PydanticObjectId.is_valid(product_id):
        prod = await Product.get(PydanticObjectId(product_id))
    if not prod:
        prod = await Product.find_one(Product.product_uid == product_id)
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    inspection = await Inspection.find_one(Inspection.product_id == prod.id)
    matrix = PricingValidator.generate_cost_validation_matrix(prod, inspection)

    # Sync verified MSRP to product record
    if matrix["original_msrp"] and prod.purchase_price != matrix["original_msrp"]:
        prod.purchase_price = matrix["original_msrp"]
        await prod.save()

    return matrix

@router.get("/{product_id}")
async def get_valuation(product_id: str):
    prod = None
    if PydanticObjectId.is_valid(product_id):
        prod = await Product.get(PydanticObjectId(product_id))
    if not prod:
        prod = await Product.find_one(Product.product_uid == product_id)
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    # Resolve accurate MSRP if purchase_price is missing or zero
    if not prod.purchase_price or prod.purchase_price < 15000:
        real_msrp = PricingValidator.resolve_original_msrp(prod.brand, prod.model, prod.category, prod.purchase_price)
        prod.purchase_price = real_msrp
        await prod.save()

    inspection = await Inspection.find_one(Inspection.product_id == prod.id)
    market_data = await MarketData.find_one(MarketData.product_category == prod.category)

    val_result = ValuationEngine.compute_valuation(prod, inspection, market_data)
    return {
        "product_id": str(prod.id),
        "product_uid": prod.product_uid,
        "brand": prod.brand,
        "model": prod.model,
        "category": prod.category,
        "age_months": prod.age_months,
        "purchase_price": prod.purchase_price,
        "original_msrp": prod.purchase_price,
        "valuation": val_result
    }
