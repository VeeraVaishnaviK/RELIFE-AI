from typing import List, Dict, Any, Optional
from app.models.product import Product
from app.models.inspection import Inspection
from app.models.recovery import RecoveryOption, Recommendation
from app.models.marketplace import MarketData
from app.services.cost_engine import CostEngine
from app.services.valuation_engine import ValuationEngine
from app.services.environmental_engine import EnvironmentalEngine

class DecisionEngine:
    @staticmethod
    def evaluate(
        product: Product,
        inspection: Optional[Inspection] = None,
        market_data: Optional[MarketData] = None,
        profit_weight: float = 0.40,
        env_weight: float = 0.30,
        speed_weight: float = 0.15,
        risk_weight: float = 0.15
    ) -> Dict[str, Any]:
        """
        Five-Pathway Multi-Criteria Decision Engine for ReLife AI.
        Evaluates resale, repair, refurbish, harvest, and recycle against configurable weights.
        Enforces hard safety constraints (excludes direct resale if structural screen/casing cracks or high deformation).
        """
        # 1. Cost & Revenue Modeling
        cost_results = CostEngine.estimate_costs_for_product(product, inspection)
        val_results = ValuationEngine.compute_valuation(product, inspection, market_data)
        revenues = val_results["projected_revenues"]
        
        # 2. Hard Safety Constraint Check
        has_critical_defect = False
        critical_reasons = []
        if inspection and inspection.defects:
            for d in inspection.defects:
                cat = d.defect_category.lower()
                sev = d.severity_estimate.lower() if d.severity_estimate else "medium"
                conf = d.detection_confidence if d.detection_confidence else 0.5
                if cat in ["crack", "display_crack", "deformation", "water_damage", "burn_mark"]:
                    has_critical_defect = True
                    critical_reasons.append(f"{cat.replace('_', ' ').capitalize()} ({round(conf*100)}% conf)")
                elif cat == "missing_component" and sev in ["high", "critical"]:
                    has_critical_defect = True
                    critical_reasons.append(f"Critical {cat} missing")
                elif cat == "corrosion" and (sev in ["high", "critical"] or conf >= 0.50):
                    has_critical_defect = True
                    critical_reasons.append(f"Corrosion detected ({round(conf*100)}% conf)")

        # Turnaround speed benchmarks (normalized 0-100, where 100 is fastest)
        speed_scores = {
            "resale": 95.0,    # 1-2 days
            "harvest": 75.0,   # 3-4 days
            "recycle": 70.0,   # 3-5 days
            "repair": 55.0,    # 5-8 days
            "refurbish": 40.0  # 8-14 days
        }

        # Operational risk scores (0-100, where 0 is safest, 100 is highest risk)
        risk_scores = {
            "resale": 15.0 if not has_critical_defect else 85.0,
            "repair": 25.0,
            "refurbish": 20.0,
            "harvest": 30.0,
            "recycle": 10.0
        }

        pathways = ["resale", "repair", "refurbish", "harvest", "recycle"]
        options_data = []

        # Find maximum NRV for normalization
        nrv_dict = {}
        for p in pathways:
            cost = cost_results[p]["total_cost"]
            rev = revenues[p]
            nrv = round(rev - cost, 2)
            nrv_dict[p] = nrv

        max_nrv = max(max(nrv_dict.values()), 1.0)

        for p in pathways:
            cost = cost_results[p]["total_cost"]
            rev = revenues[p]
            nrv = nrv_dict[p]
            
            env_impact = EnvironmentalEngine.calculate_impact(product, p)
            env_score = env_impact["environmental_score"]
            speed = speed_scores[p]
            risk = risk_scores[p]

            # Feasibility flag & exclusion reason
            is_feasible = True
            exclusion_reason = None
            if p == "resale" and has_critical_defect:
                is_feasible = False
                exclusion_reason = f"Safety exclusion: {', '.join(critical_reasons)}. Direct resale prohibited until screen/chassis repaired."
            elif nrv < -500.0 and p not in ["recycle"]:
                is_feasible = False
                exclusion_reason = "Excluded: Negative net recovery value."

            # Normalized profit component (0 - 100)
            norm_profit = max(min((nrv / max_nrv) * 100.0, 100.0), 0.0)
            # Inverted risk (lower risk = higher score)
            risk_bonus = 100.0 - risk

            # Weighted composite score
            if is_feasible:
                composite_score = (
                    (profit_weight * norm_profit) +
                    (env_weight * env_score) +
                    (speed_weight * speed) +
                    (risk_weight * risk_bonus)
                )
            else:
                composite_score = 0.0

            options_data.append({
                "pathway": p,
                "feasibility_flag": is_feasible,
                "exclusion_reason": exclusion_reason,
                "expected_revenue": rev,
                "estimated_total_cost": cost,
                "net_recovery_value": nrv,
                "risk_score": risk,
                "environmental_score": env_score,
                "speed_score": speed,
                "composite_score": round(composite_score, 1),
                "cost_breakdown": cost_results[p]["breakdown"],
                "environmental_impact": env_impact
            })

        # Rank options: feasible first by composite score, then infeasible
        ranked_options = sorted(
            options_data,
            key=lambda x: (1 if x["feasibility_flag"] else 0, x["composite_score"]),
            reverse=True
        )
        feasible_options = [opt for opt in ranked_options if opt["feasibility_flag"]]
        top_option = feasible_options[0] if feasible_options else ranked_options[0]

        explanation = (
            f"Pathway '{top_option['pathway'].upper()}' is recommended with a score of {top_option['composite_score']}/100. "
            f"It yields an expected Net Recovery Value (NRV) of ₹{top_option['net_recovery_value']:,.2f} "
            f"(Revenue: ₹{top_option['expected_revenue']:,.2f} less Total Cost: ₹{top_option['estimated_total_cost']:,.2f}), "
            f"an environmental circularity score of {top_option['environmental_score']}/100 saving {top_option['environmental_impact']['co2_saved_kg']} kg CO2. "
        )
        if has_critical_defect:
            explanation += f"Direct resale was excluded due to safety-critical inspection flags: {', '.join(critical_reasons)}. "

        return {
            "product_id": str(product.id) if product.id else None,
            "recommended_pathway": top_option["pathway"],
            "top_composite_score": top_option["composite_score"],
            "explanation": explanation,
            "has_critical_defect": has_critical_defect,
            "ranked_options": ranked_options,
            "weights_used": {
                "profit": profit_weight,
                "environment": env_weight,
                "speed": speed_weight,
                "risk": risk_weight
            }
        }
