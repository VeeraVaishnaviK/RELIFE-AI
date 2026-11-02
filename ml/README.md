# ReLife AI Computer Vision: Defect Detection Engine

## Overview
This module trains and validates an accurate hybrid computer vision detector combining:
1. **OpenCV Preprocessing Pipeline (`preprocessor.py`)**:
   - Laplacian variance blur detection (threshold: 100.0)
   - Histogram brightness & exposure validation (40.0 - 225.0 range)
   - CLAHE (Contrast Limited Adaptive Histogram Equalization) on LAB color space + bilateral edge-preserving denoising
   - Canny + contour morphology fallback edge detection for secondary structural verification
2. **YOLOv8s Detector (`train.py`, `evaluate.py`)**:
   - Specialized 5-class detection: `scratch`, `dent`, `crack`, `missing_component`, `deformation`
   - Pretrained weights transfer + warehouse camera augmentations (random rotate, perspective, sensor noise, blur)
3. **Confidence Calibration & Severity Estimation (`postprocess.py`)**:
   - Temperature scaling on validation logits to minimize false positives
   - Relative bounding box area ratio mapping to `low`, `medium`, `high` severity
4. **Packaged Inference Engine (`defect_detector.py`)**:
   - Production inference class returning structured JSON matching the Beanie ODM `Inspection.defects` schema

## Target Performance & Evaluation Metrics
- **mAP@0.5:** >= 0.70
- **Per-class F1:** >= 0.50 across all 5 classes
- **Inference Latency:** < 45ms per frame on CPU / GPU

## Limitations & Operational Boundaries
- Images with extreme blur (Laplacian score < 100) or severe underexposure (< 40 mean brightness) trigger the `requires_human_review: true` flag.
- Transparent adhesive residue may occasionally produce low-confidence scratch candidates; these are automatically routed to human inspection review.
