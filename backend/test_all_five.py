import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from app.services.cv.defect_detector import DefectDetector

folder = r"C:\Users\vaish\OneDrive\clg\tsesting data"
detector = DefectDetector(model_path="app/services/cv/best.pt", confidence_threshold=0.15)

files = [
    "cracked laptop.jpeg",
    "cracked phone img1.jpeg",
    "strain image.jpeg",
    "strain img 2.jpeg",
    "strain img 3.jpeg"
]

for fname in files:
    fpath = os.path.join(folder, fname)
    res = detector.predict(fpath)
    print("=" * 60)
    print(f"IMAGE: {fname}")
    print("=" * 60)
    print("Category:             ", res.get("detected_category"))
    print("Category Label:       ", res.get("category_label"))
    print("Identification Source:", res.get("identification_source"))
    print("Pipeline Path:        ", res.get("pipeline_path"))
    print("Overall Confidence:   ", res.get("overall_confidence"))
    print("Condition Score:      ", res.get("condition_score"))
    print("Defects Count:        ", len(res.get("defects", [])))
    for i, d in enumerate(res.get("defects", []), 1):
        print(f"  [{i}] Defect: {d['defect_category']} | Part/Location: {d['location']} | Conf: {d['detection_confidence']} | Severity: {d['severity_estimate']} | Box: {d['bounding_box']}")
    print()
