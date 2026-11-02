from datetime import datetime
from typing import List, Dict, Any
from app.config.cost_constants import (
    BASE_LOGISTICS_COST,
    INSPECTION_BASE_FEE,
    CLEANING_PACKAGING_COST,
    DEFECT_REPAIR_COSTS,
    HOURLY_LABOR_RATE,
    HARVESTING_LABOR_COST,
    RECYCLING_PROCESSING_FEE,
    RECYCLING_MATERIAL_SCRAP_VALUE
)
from app.models.recovery import CostItem, RecoveryOption
from app.models.product import Product
from app.models.inspection import Inspection

class CostEngine:
    @staticmethod
    def estimate_costs_for_product(product: Product, inspection: Inspection = None) -> Dict[str, Dict[str, Any]]:
        category = product.category.lower() if product.category else "default"
        defects = inspection.defects if inspection else []
        
        logistics = BASE_LOGISTICS_COST.get(category, BASE_LOGISTICS_COST["default"])
        inspection_cost = INSPECTION_BASE_FEE
        cleaning = CLEANING_PACKAGING_COST.get(category, CLEANING_PACKAGING_COST["default"])
        
        # Calculate defect repair total
        repair_parts_cost = 0.0
        labor_hours = 0.5
        for d in defects:
            cat = d.defect_category.lower()
            cat_costs = DEFECT_REPAIR_COSTS.get(cat, DEFECT_REPAIR_COSTS["scratch"])
            base_defect_cost = cat_costs.get(category, cat_costs.get("default", 500.0))
            
            # Severity multiplier
            sev = d.severity_estimate.lower()
            multiplier = 1.6 if sev == "high" else (1.0 if sev == "medium" else 0.6)
            repair_parts_cost += base_defect_cost * multiplier
            labor_hours += 1.2 if sev == "high" else 0.6

        repair_labor_cost = round(labor_hours * HOURLY_LABOR_RATE, 2)
        
        # 1. Resale costs
        resale_costs = [
            CostItem(cost_category="logistics", amount=logistics, status="confirmed", source="carrier_rate"),
            CostItem(cost_category="inspection", amount=inspection_cost, status="confirmed", source="qa_fee"),
            CostItem(cost_category="cleaning_packaging", amount=cleaning, status="estimated", source="warehouse_standard")
        ]
        
        # 2. Repair costs
        repair_costs = [
            CostItem(cost_category="logistics", amount=logistics, status="confirmed", source="carrier_rate"),
            CostItem(cost_category="inspection", amount=inspection_cost, status="confirmed", source="qa_fee"),
            CostItem(cost_category="parts", amount=round(repair_parts_cost, 2), status="estimated", source="parts_catalog"),
            CostItem(cost_category="labor", amount=repair_labor_cost, status="estimated", source="service_rate"),
            CostItem(cost_category="cleaning_packaging", amount=cleaning, status="estimated", source="warehouse_standard")
        ]
        
        # 3. Refurbish costs (comprehensive overhaul + battery/cosmetics replacement)
        refurb_parts = max(repair_parts_cost * 1.35, 1800.0)
        refurb_labor = round((labor_hours + 1.5) * HOURLY_LABOR_RATE, 2)
        refurb_costs = [
            CostItem(cost_category="logistics", amount=logistics, status="confirmed", source="carrier_rate"),
            CostItem(cost_category="inspection", amount=inspection_cost, status="confirmed", source="qa_fee"),
            CostItem(cost_category="parts", amount=round(refurb_parts, 2), status="estimated", source="oem_refurb_kit"),
            CostItem(cost_category="labor", amount=refurb_labor, status="estimated", source="specialist_rate"),
            CostItem(cost_category="cleaning_packaging", amount=round(cleaning * 1.3, 2), status="estimated", source="premium_packaging")
        ]
        
        # 4. Harvest costs (teardown & component harvesting)
        harvest_labor = HARVESTING_LABOR_COST.get(category, HARVESTING_LABOR_COST["default"])
        harvest_costs = [
            CostItem(cost_category="logistics", amount=logistics, status="confirmed", source="carrier_rate"),
            CostItem(cost_category="inspection", amount=inspection_cost, status="confirmed", source="qa_fee"),
            CostItem(cost_category="disassembly_labor", amount=harvest_labor, status="estimated", source="technician_benchmark"),
            CostItem(cost_category="component_testing", amount=350.0, status="estimated", source="test_rig_fee")
        ]
        
        # 5. Recycle costs (shredding, sorting, chemical refining - metal scrap offset)
        recycle_processing = RECYCLING_PROCESSING_FEE.get(category, RECYCLING_PROCESSING_FEE["default"])
        scrap_offset = RECYCLING_MATERIAL_SCRAP_VALUE.get(category, RECYCLING_MATERIAL_SCRAP_VALUE["default"])
        recycle_costs = [
            CostItem(cost_category="logistics", amount=logistics, status="confirmed", source="carrier_rate"),
            CostItem(cost_category="processing_compliance", amount=recycle_processing, status="estimated", source="ewaste_facility"),
            CostItem(cost_category="scrap_recovery_offset", amount=-scrap_offset, status="estimated", source="commodity_spot_price")
        ]
        
        return {
            "resale": {
                "total_cost": round(sum(c.amount for c in resale_costs), 2),
                "breakdown": resale_costs
            },
            "repair": {
                "total_cost": round(sum(c.amount for c in repair_costs), 2),
                "breakdown": repair_costs
            },
            "refurbish": {
                "total_cost": round(sum(c.amount for c in refurb_costs), 2),
                "breakdown": refurb_costs
            },
            "harvest": {
                "total_cost": round(sum(c.amount for c in harvest_costs), 2),
                "breakdown": harvest_costs
            },
            "recycle": {
                "total_cost": round(max(sum(c.amount for c in recycle_costs), 80.0), 2),
                "breakdown": recycle_costs
            }
        }
