import cv2
import numpy as np
from typing import Dict, Any, Tuple, List

class ImagePreprocessor:
    """
    OpenCV preprocessing and image quality validation pipeline for ReLife AI inspection.
    """
    def __init__(self, blur_threshold: float = 100.0, min_brightness: float = 40.0, max_brightness: float = 225.0):
        self.blur_threshold = blur_threshold
        self.min_brightness = min_brightness
        self.max_brightness = max_brightness
        self.clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))

    def check_blur(self, image: np.ndarray) -> Tuple[bool, float]:
        """
        Calculates Laplacian variance to detect out-of-focus or motion-blurred captures.
        Returns: (is_sharp: bool, score: float)
        """
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image
        variance = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        is_sharp = variance >= self.blur_threshold
        return is_sharp, variance

    def check_lighting(self, image: np.ndarray) -> Tuple[bool, float, str]:
        """
        Checks mean brightness and histogram distribution.
        Returns: (is_good: bool, mean_brightness: float, status: str)
        """
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image
        mean_b = float(np.mean(gray))
        if mean_b < self.min_brightness:
            return False, mean_b, "underexposed"
        elif mean_b > self.max_brightness:
            return False, mean_b, "overexposed"
        else:
            return True, mean_b, "optimal"

    def enhance(self, image: np.ndarray) -> np.ndarray:
        """
        Applies Contrast Limited Adaptive Histogram Equalization (CLAHE) on LAB color space,
        followed by bilateral filtering to preserve edge detail while denoising surface reflections.
        """
        if len(image.shape) != 3:
            return self.clahe.apply(image)

        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        l_clahe = self.clahe.apply(l)
        enhanced_lab = cv2.merge((l_clahe, a, b))
        enhanced_bgr = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)
        
        # Bilateral filter reduces sensor noise while preserving sharp crack/scratch edges
        denoised = cv2.bilateralFilter(enhanced_bgr, d=5, sigmaColor=50, sigmaSpace=50)
        return denoised

    def detect_edges_fallback(self, image: np.ndarray) -> Dict[str, Any]:
        """
        Backup edge detection via Canny + contour morphology.
        Used as a secondary signal to verify surface fissures or frame deformations.
        """
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image
            
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blurred, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        significant_contours = [c for c in contours if cv2.contourArea(c) > 50]
        total_edge_density = float(np.sum(edges > 0) / (image.shape[0] * image.shape[1]))
        
        return {
            "edge_density": round(total_edge_density, 4),
            "contour_count": len(significant_contours),
            "potential_anomaly_detected": total_edge_density > 0.035 or len(significant_contours) > 15
        }

    def validate_and_preprocess(self, image: np.ndarray) -> Dict[str, Any]:
        """
        Full pipeline: quality checks + enhancement.
        """
        is_sharp, blur_score = self.check_blur(image)
        is_light_good, brightness_score, light_status = self.check_lighting(image)
        pass_quality = is_sharp and is_light_good
        
        enhanced_img = self.enhance(image)
        edge_data = self.detect_edges_fallback(enhanced_img)
        
        return {
            "pass_quality": pass_quality,
            "blur": {"is_sharp": is_sharp, "score": round(blur_score, 2)},
            "lighting": {"is_good": is_light_good, "brightness": round(brightness_score, 2), "status": light_status},
            "edge_analysis": edge_data,
            "enhanced_image": enhanced_img
        }
