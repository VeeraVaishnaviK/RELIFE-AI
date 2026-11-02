from typing import Dict, Any, Optional
from datetime import datetime
from app.models.product import Product
from app.models.inspection import Inspection
from app.models.inspection import TrustScore

class TrustScoreEngine:
    @staticmethod
    async def compute_and_save(product: Product, inspection: Optional[Inspection] = None) -> TrustScore:
        """
        Computes calibrated 0-100 Trust Score based on:
        - Inspection completeness (25 pts)
        - Defect severity & detection confidence (35 pts)
        - Functional test coverage & pass rate (25 pts)
        - Product provenance / return warranty history (15 pts)
        """
        breakdown = {}
        total_score = 0.0

        # 1. Inspection completeness (25 pts)
        if inspection:
            insp_score = 25.0
            breakdown["inspection_completeness"] = 100
        else:
            insp_score = 10.0
            breakdown["inspection_completeness"] = 40
        total_score += insp_score

        # 2. Defect & Visual Integrity (35 pts)
        visual_integrity = 35.0
        if inspection and inspection.defects:
            for d in inspection.defects:
                sev = d.severity_estimate.lower()
                cat = d.defect_category.lower()
                penalty = 8.0 if sev == "high" else (4.0 if sev == "medium" else 2.0)
                if cat in ["crack", "deformation"]:
                    penalty *= 1.4
                visual_integrity = max(visual_integrity - penalty, 5.0)
        breakdown["visual_integrity"] = round((visual_integrity / 35.0) * 100, 1)
        total_score += visual_integrity

        # 3. Functional hardware tests (25 pts)
        test_score = 25.0
        if inspection and inspection.test_results:
            results = inspection.test_results
            passed_count = sum(1 for v in results.values() if v is True or (isinstance(v, (int, float)) and v >= 80))
            test_ratio = passed_count / max(len(results), 1)
            test_score = test_score * test_ratio
            breakdown["hardware_test_pass_rate"] = round(test_ratio * 100, 1)
        else:
            test_score = 15.0
            breakdown["hardware_test_pass_rate"] = 60.0
        total_score += test_score

        # 4. Provenance & return history (15 pts)
        prov_score = 15.0
        if product.return_info and product.return_info.warranty_status == "In Warranty":
            prov_score = 15.0
        elif product.age_months < 18:
            prov_score = 12.0
        else:
            prov_score = 9.0
        breakdown["provenance_score"] = round((prov_score / 15.0) * 100, 1)
        total_score += prov_score

        final_val = int(round(min(max(total_score, 10.0), 100.0)))

        # Update or create TrustScore document
        existing = await TrustScore.find_one(TrustScore.product_id == product.id)
        if existing:
            existing.score_value = final_val
            existing.score_breakdown = breakdown
            existing.computed_at = datetime.utcnow()
            await existing.save()
            return existing
        else:
            ts = TrustScore(
                product_id=product.id,
                score_value=final_val,
                score_breakdown=breakdown,
                computed_at=datetime.utcnow()
            )
            await ts.insert()
            return ts
