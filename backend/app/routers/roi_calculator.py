import uuid
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Dict, Any
from datetime import datetime

from app.models.operations import RoiCalculatorSession
from app.config.roi_constants import (
    DEFAULT_RECOVERY_RATE_IMPROVEMENT,
    INSPECTION_TIME_REDUCTION_FACTOR,
    PREVENTED_LANDFILL_FEE_PER_DEVICE,
    SECONDARY_MARKET_UPLIFT_FACTOR,
    AVERAGE_CARBON_CREDIT_VALUE_PER_TON
)

router = APIRouter(prefix="/roi-calculator", tags=["ROI Calculator"])

class RoiComputeRequest(BaseModel):
    monthly_returns: float = Field(500.0, description="Monthly returned units volume")
    avg_product_value: float = Field(35000.0, description="Average retail price of returned units")
    current_disposal_rate: float = Field(0.40, ge=0.0, le=1.0, description="Current scrap/waste disposal rate (0-1)")
    manual_inspection_cost: float = Field(450.0, description="Cost per unit for manual inspection")
    repair_success_rate: float = Field(0.65, ge=0.0, le=1.0, description="Current repair success rate (0-1)")

@router.post("/compute")
async def compute_roi(req: RoiComputeRequest):
    annual_volume = req.monthly_returns * 12.0
    
    # 1. Additional units recovered from disposal
    baseline_recovered_units = annual_volume * (1.0 - req.current_disposal_rate)
    relife_disposal_rate = max(req.current_disposal_rate * 0.35, 0.05)  # ReLife reduces scrap by 65%
    relife_recovered_units = annual_volume * (1.0 - relife_disposal_rate)
    additional_units_saved = relife_recovered_units - baseline_recovered_units

    # Average recovered value per unit (approx 55% of original retail)
    value_per_unit = req.avg_product_value * 0.55
    # Value uplift from trust score verified resale
    uplifted_value_per_unit = value_per_unit * (1.0 + SECONDARY_MARKET_UPLIFT_FACTOR)
    
    annual_value_recovered = round(
        (additional_units_saved * uplifted_value_per_unit) +
        (baseline_recovered_units * (uplifted_value_per_unit - value_per_unit)),
        2
    )

    # 2. Operational cost savings (AI automated inspection vs manual)
    inspection_savings_per_unit = req.manual_inspection_cost * INSPECTION_TIME_REDUCTION_FACTOR
    landfill_fees_avoided = additional_units_saved * PREVENTED_LANDFILL_FEE_PER_DEVICE
    annual_cost_saved = round((annual_volume * inspection_savings_per_unit) + landfill_fees_avoided, 2)

    # 3. Environmental CO2 savings (average ~120kg CO2 per electronics device saved from landfill)
    annual_co2_saved_kg = additional_units_saved * 125.0
    annual_co2_saved_tons = round(annual_co2_saved_kg / 1000.0, 2)
    carbon_credit_value = round(annual_co2_saved_tons * AVERAGE_CARBON_CREDIT_VALUE_PER_TON, 2)

    total_annual_economic_benefit = round(annual_value_recovered + annual_cost_saved + carbon_credit_value, 2)
    roi_multiple = round(total_annual_economic_benefit / max(annual_volume * 180.0, 1.0), 1)  # ROI vs platform license proxy

    results = {
        "annual_value_recovered": annual_value_recovered,
        "annual_cost_saved": annual_cost_saved,
        "annual_co2_saved_tons": annual_co2_saved_tons,
        "carbon_credit_value": carbon_credit_value,
        "total_annual_economic_benefit": total_annual_economic_benefit,
        "estimated_roi_multiple": f"{roi_multiple}x",
        "recovery_rate": {
            "before_relife_pct": round((1.0 - req.current_disposal_rate) * 100, 1),
            "after_relife_pct": round((1.0 - relife_disposal_rate) * 100, 1),
            "net_lift_pct": round((relife_disposal_rate - req.current_disposal_rate) * -100, 1)
        },
        "breakdown": {
            "additional_devices_circulated": int(additional_units_saved),
            "inspection_efficiency_gain_pct": 70.0,
            "landfill_fees_prevented": round(landfill_fees_avoided, 2)
        }
    }

    # Log session
    session_token = uuid.uuid4().hex
    session_record = RoiCalculatorSession(
        session_token=session_token,
        input_params=req.dict(),
        output_results=results,
        created_at=datetime.utcnow()
    )
    await session_record.insert()

    return {
        "session_token": session_token,
        "inputs": req.dict(),
        "results": results
    }
