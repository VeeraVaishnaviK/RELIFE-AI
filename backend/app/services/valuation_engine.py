from typing import Dict, Any
from app.models.product import Product
from app.models.inspection import Inspection
from app.models.marketplace import MarketData

class ValuationEngine:
    # Scrap recycling value by category (INR)
    SCRAP_VALUES = {
        "laptop": 450.0,
        "smartphone": 200.0,
        "tablet": 280.0,
        "headphone": 80.0,
        "smartwatch": 120.0,
        "camera": 350.0,
        "gaming_console": 400.0,
        "monitor": 500.0,
    }

    @staticmethod
    def compute_valuation(product: Product, inspection: Inspection = None, market_data: MarketData = None) -> Dict[str, Any]:
        # Baseline market price benchmark based on verified product original value
        if product.purchase_price and product.purchase_price > 15000:
            benchmark_price = product.purchase_price * 0.72
            demand_index = market_data.demand_index if market_data else 1.15
        elif market_data:
            benchmark_price = market_data.resale_price
            demand_index = market_data.demand_index
        else:
            benchmark_price = product.purchase_price * 0.60 if product.purchase_price else 65000.0
            demand_index = 1.10

        # Age depreciation: -1.5% per month of age up to 36 months
        age_factor = max(1.0 - (product.age_months * 0.015), 0.35)
        base_price = benchmark_price * age_factor

        # Condition multiplier based on REAL inspection defects
        condition_multiplier = 1.00
        has_severe_defect = False
        defect_penalty_detail = []
        
        if inspection and inspection.defects:
            for d in inspection.defects:
                sev = d.severity_estimate.lower() if d.severity_estimate else "medium"
                cat = d.defect_category.lower() if d.defect_category else "scratch"
                conf = d.detection_confidence if d.detection_confidence else 0.5
                
                # Only penalize high-confidence detections
                if conf < 0.20:
                    continue
                
                penalty = 0.0
                if cat in ["crack", "display_crack", "deformation", "water_damage", "burn_mark"]:
                    has_severe_defect = True
                    penalty = 0.28 if sev in ["high", "critical"] else 0.15
                elif cat == "missing_component":
                    penalty = 0.20 if sev in ["high", "critical"] else 0.10
                    if sev in ["high", "critical"]:
                        has_severe_defect = True
                elif cat in ["dent", "corrosion"]:
                    penalty = 0.12 if sev in ["high", "critical"] else 0.06
                else:  # scratch
                    penalty = 0.08 if sev in ["high", "critical"] else 0.04
                
                # Scale penalty by confidence
                penalty *= min(conf / 0.8, 1.0)
                condition_multiplier -= penalty
                defect_penalty_detail.append({
                    "defect": cat, "severity": sev, "confidence": round(conf, 2),
                    "penalty": round(penalty, 3)
                })
                    
        condition_multiplier = max(condition_multiplier, 0.15)
        
        # As-is Direct Resale Value
        as_is_resale = round(base_price * condition_multiplier * demand_index, 2)
        
        # Post-Repair Value (defect resolved, good condition)
        repaired_val = round(base_price * 0.88 * demand_index, 2)
        
        # Certified Refurbished Value (like-new warranty condition)
        refurbished_val = round(base_price * 1.05 * demand_index, 2)
        
        # Harvested Components Value
        harvest_val = round(base_price * 0.45 * demand_index, 2)
        
        # Raw Scrap Recycling Value
        category = product.category.lower() if product.category else "default"
        recycle_val = ValuationEngine.SCRAP_VALUES.get(category, 200.0)

        return {
            "base_market_price": round(base_price, 2),
            "demand_index": round(demand_index, 2),
            "condition_multiplier": round(condition_multiplier, 3),
            "has_severe_defect": has_severe_defect,
            "defect_penalties": defect_penalty_detail,
            "projected_revenues": {
                "resale": as_is_resale,
                "repair": repaired_val,
                "refurbish": refurbished_val,
                "harvest": harvest_val,
                "recycle": recycle_val
            }
        }
