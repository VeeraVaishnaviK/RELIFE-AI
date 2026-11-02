"""
ReLife AI — Fast Distillation & Fine-Tuning Pipeline
Collects annotations from Roboflow dual-model serverless endpoints
(mobile-damage-diagnosis-ouwm3/8 + cracked-phone-takl6/2) on real product photos,
builds an augmented dataset, fine-tunes YOLOv8n, and deploys best.pt.
"""
import os
import glob
import shutil
import yaml
import cv2
import numpy as np
from pathlib import Path
from ultralytics import YOLO
from inference_sdk import InferenceHTTPClient, InferenceConfiguration

BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent
UPLOADS_DIR = PROJECT_DIR / "uploads"
DISTILL_DIR = BASE_DIR / "dataset_distill"
TRAIN_IMG = DISTILL_DIR / "train" / "images"
TRAIN_LBL = DISTILL_DIR / "train" / "labels"
VAL_IMG = DISTILL_DIR / "val" / "images"
VAL_LBL = DISTILL_DIR / "val" / "labels"

CLASS_NAMES = [
    "scratch",          # 0
    "dent",             # 1
    "crack",            # 2
    "missing_component",# 3
    "deformation",      # 4
    "burn_mark",        # 5
    "corrosion",        # 6
    "water_damage",     # 7
    "display_crack"     # 8
]

CLASS_MAP = {
    "scratch": 0,
    "dent": 1,
    "crack": 2,
    "display_crack": 8,
    "fissure": 8,
    "multi-fissure": 8,
    "broken screen": 8,
    "vertical line defect": 8
}

def map_class_to_id(class_str: str) -> int:
    s = class_str.lower().strip()
    if any(k in s for k in ["crack", "fissure", "broken", "glass", "spider", "line", "lcd"]):
        return 8 # display_crack
    elif "scratch" in s:
        return 0
    elif "dent" in s:
        return 1
    return 2 # fallback to crack

def build_distilled_dataset():
    for p in [TRAIN_IMG, TRAIN_LBL, VAL_IMG, VAL_LBL]:
        p.mkdir(parents=True, exist_ok=True)

    client = InferenceHTTPClient(
        api_url="https://serverless.roboflow.com",
        api_key="EicdRGwaJds1ZZKSEWCg"
    ).configure(InferenceConfiguration(api_key_transport="header"))

    models = ["mobile-damage-diagnosis-ouwm3/8", "cracked-phone-takl6/2"]
    
    # Also pull synthetic images from dataset/train if available
    orig_train_imgs = list((BASE_DIR / "dataset" / "train" / "images").glob("*.jpg"))[:40]
    for s_img in orig_train_imgs:
        s_lbl = BASE_DIR / "dataset" / "train" / "labels" / f"{s_img.stem}.txt"
        if s_lbl.exists():
            shutil.copy2(str(s_img), str(TRAIN_IMG / s_img.name))
            shutil.copy2(str(s_lbl), str(TRAIN_LBL / s_lbl.name))

    upload_images = sorted(list(UPLOADS_DIR.glob("*.jpg")))
    print(f"[Distill] Annotating {len(upload_images)} real upload images with Roboflow models...")

    annotated_count = 0
    for idx, img_path in enumerate(upload_images):
        img = cv2.imread(str(img_path))
        if img is None:
            continue
        h, w = img.shape[:2]

        all_boxes = []
        for mid in models:
            try:
                res = client.infer(str(img_path), model_id=mid)
                for pred in res.get("predictions", []):
                    cls_id = map_class_to_id(pred.get("class", "crack"))
                    cx = pred["x"] / float(w)
                    cy = pred["y"] / float(h)
                    bw = pred["width"] / float(w)
                    bh = pred["height"] / float(h)
                    # clamp
                    cx = max(0.01, min(0.99, cx))
                    cy = max(0.01, min(0.99, cy))
                    bw = max(0.01, min(0.99, bw))
                    bh = max(0.01, min(0.99, bh))
                    all_boxes.append(f"{cls_id} {cx:.4f} {cy:.4f} {bw:.4f} {bh:.4f}")
            except Exception as e:
                pass

        # Split 80% train, 20% val
        target_img_dir = VAL_IMG if idx % 5 == 0 else TRAIN_IMG
        target_lbl_dir = VAL_LBL if idx % 5 == 0 else TRAIN_LBL

        out_img_name = f"real_{img_path.name}"
        shutil.copy2(str(img_path), str(target_img_dir / out_img_name))
        
        lbl_file = target_lbl_dir / f"real_{img_path.stem}.txt"
        with open(lbl_file, "w") as f:
            f.write("\n".join(all_boxes))
        
        if all_boxes:
            annotated_count += 1

    print(f"[Distill] Successfully prepared dataset with {annotated_count} active real-world annotated samples.")

    # Write dataset yaml
    yaml_dict = {
        "path": str(DISTILL_DIR.resolve()),
        "train": "train/images",
        "val": "val/images",
        "names": {i: name for i, name in enumerate(CLASS_NAMES)}
    }
    yaml_path = DISTILL_DIR / "dataset.yaml"
    with open(yaml_path, "w") as f:
        yaml.dump(yaml_dict, f, default_flow_style=False)

    return yaml_path

def train():
    yaml_path = build_distilled_dataset()

    print("[Distill] Starting YOLOv8n fine-tuning on mobile crack & defect dataset...")
    model = YOLO("yolov8n.pt")
    results = model.train(
        data=str(yaml_path),
        epochs=8,
        batch=8,
        imgsz=640,
        project=str(BASE_DIR / "runs"),
        name="relife_distill_v1",
        exist_ok=True,
        verbose=True,
        workers=2
    )

    best_src = BASE_DIR / "runs" / "relife_distill_v1" / "weights" / "best.pt"
    deploy_dst = PROJECT_DIR / "app" / "services" / "cv" / "best.pt"
    if best_src.exists():
        shutil.copy2(str(best_src), str(deploy_dst))
        print(f"[Distill] Model fine-tuning complete! Deployed to {deploy_dst}")
    else:
        print(f"[Distill] Note: weights saved at {best_src}")

if __name__ == "__main__":
    train()
