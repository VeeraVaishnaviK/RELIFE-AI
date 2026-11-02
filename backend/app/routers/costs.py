from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from beanie import PydanticObjectId

from app.models.product import Product
from app.models.inspection import Inspection
from app.models.recovery import RecoveryOption, CostItem
from app.services.cost_engine import CostEngine
from app.services.environmental_engine import EnvironmentalEngine
from app.services.valuation_engine import ValuationEngine
from app.core.security import get_current_user

router = APIRouter(prefix="/costs", tags=["Cost Estimation"])

@router.post("/estimate/{product_id}")
async def estimate_product_costs(
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
    cost_data = CostEngine.estimate_costs_for_product(prod, inspection)
    val_data = ValuationEngine.compute_valuation(prod, inspection)

    saved_options: List[RecoveryOption] = []
    pathways = ["resale", "repair", "refurbish", "harvest", "recycle"]

    for p in pathways:
        p_cost = cost_data[p]["total_cost"]
        p_breakdown = cost_data[p]["breakdown"]
        p_rev = val_data["projected_revenues"].get(p, 0.0)
        p_nrv = round(p_rev - p_cost, 2)
        env_impact = EnvironmentalEngine.calculate_impact(prod, p)

        existing = await RecoveryOption.find_one(
            RecoveryOption.product_id == prod.id,
            RecoveryOption.pathway == p
        )
        if existing:
            existing.estimated_total_cost = p_cost
            existing.expected_revenue = p_rev
            existing.net_recovery_value = p_nrv
            existing.cost_breakdown = p_breakdown
            existing.environmental_score = env_impact["environmental_score"]
            await existing.save()
            saved_options.append(existing)
        else:
            opt = RecoveryOption(
                product_id=prod.id,
                pathway=p,
                feasibility_flag=True,
                expected_revenue=p_rev,
                estimated_total_cost=p_cost,
                net_recovery_value=p_nrv,
                risk_score=20.0,
                environmental_score=env_impact["environmental_score"],
                cost_breakdown=p_breakdown
            )
            await opt.insert()
            saved_options.append(opt)

    return {
        "success": True,
        "product_id": str(prod.id),
        "product_uid": prod.product_uid,
        "options": saved_options
    }

@router.get("/{product_id}")
async def get_product_costs(product_id: str):
    prod = None
    if PydanticObjectId.is_valid(product_id):
        prod = await Product.get(PydanticObjectId(product_id))
    if not prod:
        prod = await Product.find_one(Product.product_uid == product_id)
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    options = await RecoveryOption.find(RecoveryOption.product_id == prod.id).to_list()
    return {"product_id": str(prod.id), "recovery_options": options}
