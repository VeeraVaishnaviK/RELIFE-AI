import numpy as np
from typing import Dict, Any, List

class PostProcessor:
    """
    Confidence calibration and defect severity estimation for ReLife AI vision pipeline.
    """
    def __init__(self, temperature: float = 1.15):
        # Temperature scaling factor calibrated on validation split
        self.temperature = temperature

    def calibrate_confidence(self, raw_confidence: float, defect_category: str) -> float:
        """
        Applies temperature-scaled sigmoid calibration to avoid overconfident false positives.
        Category-specific adjustments account for high-variance classes (e.g. micro-scratches vs cracks).
        """
        # Clamp raw confidence to avoid extreme logit calculations
        conf = max(min(raw_confidence, 0.999), 0.001)
        
        # Logit transformation
        logit = np.log(conf / (1.0 - conf))
        scaled_logit = logit / self.temperature
        
        # Sigmoidal output
        calibrated = 1.0 / (1.0 + np.exp(-scaled_logit))
        
        # Class-specific calibration offsets
        class_offsets = {
            "crack": 1.02,
            "deformation": 0.98,
            "missing_component": 1.01,
            "scratch": 0.96,
            "dent": 0.97
        }
        factor = class_offsets.get(defect_category, 1.0)
        final_conf = min(max(calibrated * factor, 0.05), 0.99)
        return float(round(final_conf, 3))

    def estimate_severity(self, bbox: List[float], img_width: int = 640, img_height: int = 640, category: str = "scratch") -> str:
        """
        Estimates defect severity based on relative bounding box area and category weight.
        bbox: [x1, y1, x2, y2]
        Area ratio = (w * h) / (img_w * img_h)
        """
        x1, y1, x2, y2 = bbox
        box_w = abs(x2 - x1)
        box_h = abs(y2 - y1)
        
        # If coordinates are normalized [0, 1]
        if max(x1, y1, x2, y2) <= 1.05:
            area_ratio = box_w * box_h
        else:
            area_ratio = (box_w * box_h) / (float(img_width) * float(img_height) + 1e-6)

        # Categorical thresholds
        if category in ["crack", "deformation"]:
            # Structural defects are severe even at smaller surface areas
            if area_ratio > 0.12:
                return "high"
            elif area_ratio > 0.035:
                return "medium"
            else:
                return "low"
        elif category == "missing_component":
            # Missing critical component is always medium or high
            return "high" if area_ratio > 0.08 else "medium"
        else: # scratch, dent
            if area_ratio > 0.18:
                return "high"
            elif area_ratio > 0.05:
                return "medium"
            else:
                return "low"
