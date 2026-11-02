"""
ReLife AI — Multi-Category YOLO Defect Detection Training Pipeline
Trains YOLOv8 on synthetically generated + augmented datasets across ALL product categories.
Categories: smartphones, laptops, tablets, headphones, smartwatches, cameras, gaming consoles, monitors
Defect classes: scratch, dent, crack, missing_component, deformation, burn_mark, corrosion, water_damage
"""
import os
import sys
import cv2
import numpy as np
import random
import shutil
import yaml
from pathlib import Path

# ------- CONFIG -------
BASE_DIR = Path(__file__).parent
DATASET_DIR = BASE_DIR / "dataset"
TRAIN_DIR = DATASET_DIR / "train"
VAL_DIR = DATASET_DIR / "val"
IMAGES_TRAIN = TRAIN_DIR / "images"
LABELS_TRAIN = TRAIN_DIR / "labels"
IMAGES_VAL = VAL_DIR / "images"
LABELS_VAL = VAL_DIR / "labels"

CLASS_NAMES = [
    "scratch", "dent", "crack", "missing_component",
    "deformation", "burn_mark", "corrosion", "water_damage"
]

PRODUCT_CATEGORIES = [
    "smartphone", "laptop", "tablet", "headphone",
    "smartwatch", "camera", "gaming_console", "monitor"
]

NUM_TRAIN_PER_CATEGORY = 150
NUM_VAL_PER_CATEGORY = 30
IMG_SIZE = 640

# ------- SYNTHETIC DATA GENERATION -------

def generate_base_device(category: str, size: int = IMG_SIZE) -> np.ndarray:
    """Generate a synthetic device image for the given category."""
    img = np.zeros((size, size, 3), dtype=np.uint8)
    
    # Category-specific base appearance
    colors = {
        "smartphone": (40, 40, 45),
        "laptop": (55, 55, 60),
        "tablet": (35, 35, 40),
        "headphone": (50, 50, 55),
        "smartwatch": (30, 30, 35),
        "camera": (45, 45, 50),
        "gaming_console": (25, 25, 30),
        "monitor": (20, 20, 25),
    }
    base_color = colors.get(category, (40, 40, 45))
    img[:] = base_color
    
    # Add device body shape
    margin = random.randint(40, 80)
    body_color = tuple(min(c + random.randint(30, 80), 255) for c in base_color)
    
    if category in ["smartphone", "tablet"]:
        # Rounded rectangle body
        cv2.rectangle(img, (margin, margin//2), (size-margin, size-margin//2), body_color, -1)
        # Screen area
        screen_margin = margin + 15
        screen_color = tuple(min(c + 40, 255) for c in body_color)
        cv2.rectangle(img, (screen_margin, screen_margin), (size-screen_margin, size-screen_margin-30), screen_color, -1)
    elif category == "laptop":
        # Keyboard deck
        cv2.rectangle(img, (margin, size//2), (size-margin, size-margin//3), body_color, -1)
        # Screen
        screen_color = (100 + random.randint(0, 50), 120 + random.randint(0, 50), 180 + random.randint(0, 50))
        cv2.rectangle(img, (margin+20, margin), (size-margin-20, size//2-10), screen_color, -1)
    elif category == "monitor":
        cv2.rectangle(img, (margin, margin), (size-margin, size-margin-80), body_color, -1)
        screen_color = (80 + random.randint(0, 60), 100 + random.randint(0, 60), 150 + random.randint(0, 60))
        cv2.rectangle(img, (margin+15, margin+15), (size-margin-15, size-margin-95), screen_color, -1)
    elif category == "headphone":
        # Circular earpad
        center = (size//2, size//2)
        cv2.circle(img, center, size//3, body_color, -1)
        cv2.circle(img, center, size//4, tuple(min(c+20,255) for c in body_color), -1)
    elif category == "smartwatch":
        center = (size//2, size//2)
        cv2.circle(img, center, size//3, body_color, -1)
        cv2.circle(img, center, size//3-15, (60, 80, 120), -1)  # watch face
    elif category == "camera":
        cv2.rectangle(img, (margin, margin+30), (size-margin, size-margin-30), body_color, -1)
        # Lens
        cv2.circle(img, (size//2, size//2), size//5, (20, 20, 22), -1)
        cv2.circle(img, (size//2, size//2), size//7, (10, 10, 12), -1)
    else:  # gaming_console
        cv2.rectangle(img, (margin-20, margin+20), (size-margin+20, size-margin-20), body_color, -1)
    
    # Add texture noise
    noise = np.random.randint(-15, 15, img.shape, dtype=np.int16)
    img = np.clip(img.astype(np.int16) + noise, 0, 255).astype(np.uint8)
    
    return img

def add_defect(img: np.ndarray, defect_class: int, size: int = IMG_SIZE):
    """Add a synthetic defect to the image and return YOLO label [cls, cx, cy, w, h]."""
    h, w = img.shape[:2]
    
    # Random position
    cx = random.uniform(0.15, 0.85)
    cy = random.uniform(0.15, 0.85)
    
    defect_name = CLASS_NAMES[defect_class]
    
    if defect_name == "scratch":
        # Long thin line
        bw = random.uniform(0.15, 0.45)
        bh = random.uniform(0.005, 0.02)
        x1 = int((cx - bw/2) * w)
        y1 = int((cy - bh/2) * h)
        x2 = int((cx + bw/2) * w)
        y2 = int((cy + bh/2) * h)
        color = tuple(random.randint(150, 220) for _ in range(3))
        thickness = random.randint(1, 3)
        # Slightly curved scratch
        pts = np.array([[x1, y1], [(x1+x2)//2, y1+random.randint(-10,10)], [x2, y2]])
        cv2.polylines(img, [pts], False, color, thickness)
        
    elif defect_name == "dent":
        bw = random.uniform(0.04, 0.12)
        bh = random.uniform(0.04, 0.12)
        center = (int(cx * w), int(cy * h))
        axes = (int(bw * w / 2), int(bh * h / 2))
        # Shadow effect for dent
        cy_p = max(0, min(int(cy * h), h-1))
        cx_p = max(0, min(int(cx * w), w-1))
        dent_color = (int(max(0, int(img[cy_p, cx_p][0]) - 30)),
                      int(max(0, int(img[cy_p, cx_p][1]) - 30)),
                      int(max(0, int(img[cy_p, cx_p][2]) - 30)))
        cv2.ellipse(img, center, axes, random.randint(0, 180), 0, 360, dent_color, -1)
        
    elif defect_name == "crack":
        bw = random.uniform(0.15, 0.50)
        bh = random.uniform(0.15, 0.50)
        # Branching crack lines
        start = (int((cx - bw/4) * w), int((cy - bh/4) * h))
        for _ in range(random.randint(3, 8)):
            end = (start[0] + random.randint(-80, 80), start[1] + random.randint(-80, 80))
            end = (max(0, min(end[0], w-1)), max(0, min(end[1], h-1)))
            cv2.line(img, start, end, (180 + random.randint(0,50), 180 + random.randint(0,50), 180 + random.randint(0,50)), 
                     random.randint(1, 2))
            # Sub-branches
            if random.random() > 0.4:
                sub_end = (end[0] + random.randint(-40, 40), end[1] + random.randint(-40, 40))
                sub_end = (max(0, min(sub_end[0], w-1)), max(0, min(sub_end[1], h-1)))
                cv2.line(img, end, sub_end, (160+random.randint(0,40),)*3, 1)
            start = end
            
    elif defect_name == "missing_component":
        bw = random.uniform(0.05, 0.15)
        bh = random.uniform(0.05, 0.15)
        x1 = int((cx - bw/2) * w)
        y1 = int((cy - bh/2) * h)
        x2 = int((cx + bw/2) * w)
        y2 = int((cy + bh/2) * h)
        # Dark void where component should be
        cv2.rectangle(img, (x1, y1), (x2, y2), (15, 15, 18), -1)
        cv2.rectangle(img, (x1, y1), (x2, y2), (80, 80, 85), 1)
        
    elif defect_name == "deformation":
        bw = random.uniform(0.08, 0.20)
        bh = random.uniform(0.08, 0.20)
        center = (int(cx * w), int(cy * h))
        axes = (int(bw * w / 2), int(bh * h / 2))
        # Warped surface
        overlay = img.copy()
        cv2.ellipse(overlay, center, axes, random.randint(0, 360), 0, 360,
                    tuple(random.randint(60, 120) for _ in range(3)), -1)
        cv2.addWeighted(overlay, 0.4, img, 0.6, 0, img)
        
    elif defect_name == "burn_mark":
        bw = random.uniform(0.03, 0.10)
        bh = random.uniform(0.03, 0.10)
        center = (int(cx * w), int(cy * h))
        axes = (int(bw * w / 2), int(bh * h / 2))
        cv2.ellipse(img, center, axes, 0, 0, 360, (20, 15, 40), -1)  # Dark burn
        # Brownish ring
        cv2.ellipse(img, center, (axes[0]+3, axes[1]+3), 0, 0, 360, (30, 40, 80), 2)
        
    elif defect_name == "corrosion":
        bw = random.uniform(0.05, 0.15)
        bh = random.uniform(0.05, 0.15)
        x1 = int((cx - bw/2) * w)
        y1 = int((cy - bh/2) * h)
        for _ in range(random.randint(20, 50)):
            px = x1 + random.randint(0, int(bw * w))
            py = y1 + random.randint(0, int(bh * h))
            px = max(0, min(px, w-1))
            py = max(0, min(py, h-1))
            cv2.circle(img, (px, py), random.randint(1, 4), 
                       (random.randint(80, 140), random.randint(100, 160), random.randint(40, 80)), -1)
            
    elif defect_name == "water_damage":
        bw = random.uniform(0.08, 0.25)
        bh = random.uniform(0.08, 0.25)
        center = (int(cx * w), int(cy * h))
        axes = (int(bw * w / 2), int(bh * h / 2))
        overlay = img.copy()
        # Watermark stain
        cv2.ellipse(overlay, center, axes, random.randint(0, 180), 0, 360,
                    (180, 170, 160), -1)
        cv2.addWeighted(overlay, 0.25, img, 0.75, 0, img)
        # Edge ring
        cv2.ellipse(img, center, axes, random.randint(0, 180), 0, 360,
                    (150, 140, 130), 1)
    
    return [defect_class, cx, cy, 0.1, 0.1]

def augment_image(img: np.ndarray) -> np.ndarray:
    """Apply random augmentations."""
    # Random brightness
    if random.random() > 0.3:
        factor = random.uniform(0.6, 1.4)
        img = np.clip(img * factor, 0, 255).astype(np.uint8)
    # Random blur
    if random.random() > 0.5:
        ksize = random.choice([3, 5])
        img = cv2.GaussianBlur(img, (ksize, ksize), 0)
    # Random noise
    if random.random() > 0.5:
        noise = np.random.randint(-10, 10, img.shape, dtype=np.int16)
        img = np.clip(img.astype(np.int16) + noise, 0, 255).astype(np.uint8)
    # Random rotation
    if random.random() > 0.6:
        angle = random.uniform(-15, 15)
        M = cv2.getRotationMatrix2D((img.shape[1]//2, img.shape[0]//2), angle, 1.0)
        img = cv2.warpAffine(img, M, (img.shape[1], img.shape[0]))
    return img

# ------- DATASET GENERATION -------

def generate_dataset():
    """Generate full training and validation datasets."""
    # Clean and create directories
    for d in [IMAGES_TRAIN, LABELS_TRAIN, IMAGES_VAL, LABELS_VAL]:
        d.mkdir(parents=True, exist_ok=True)
    
    print(f"Generating dataset for {len(PRODUCT_CATEGORIES)} categories × {len(CLASS_NAMES)} defect classes")
    
    total = 0
    for split, img_dir, lbl_dir, count in [
        ("train", IMAGES_TRAIN, LABELS_TRAIN, NUM_TRAIN_PER_CATEGORY),
        ("val", IMAGES_VAL, LABELS_VAL, NUM_VAL_PER_CATEGORY),
    ]:
        for cat_idx, category in enumerate(PRODUCT_CATEGORIES):
            for i in range(count):
                img = generate_base_device(category)
                labels = []
                
                # Add 1-4 random defects
                num_defects = random.randint(1, 4)
                for _ in range(num_defects):
                    defect_cls = random.randint(0, len(CLASS_NAMES) - 1)
                    bw = random.uniform(0.05, 0.25)
                    bh = random.uniform(0.05, 0.25)
                    label = add_defect(img, defect_cls)
                    label[3] = bw  # Override with actual width
                    label[4] = bh  # Override with actual height
                    labels.append(label)
                
                # Augment
                img = augment_image(img)
                
                # Save
                fname = f"{category}_{split}_{i:04d}"
                cv2.imwrite(str(img_dir / f"{fname}.jpg"), img)
                
                with open(str(lbl_dir / f"{fname}.txt"), "w") as f:
                    for lbl in labels:
                        f.write(f"{int(lbl[0])} {lbl[1]:.6f} {lbl[2]:.6f} {lbl[3]:.6f} {lbl[4]:.6f}\n")
                
                total += 1
        
        print(f"  {split}: {count * len(PRODUCT_CATEGORIES)} images generated")
    
    print(f"Total dataset: {total} images")
    
    # Write dataset YAML
    yaml_content = {
        "path": str(DATASET_DIR),
        "train": "train/images",
        "val": "val/images",
        "nc": len(CLASS_NAMES),
        "names": CLASS_NAMES,
    }
    yaml_path = DATASET_DIR / "dataset.yaml"
    with open(yaml_path, "w") as f:
        yaml.dump(yaml_content, f, default_flow_style=False)
    
    print(f"Dataset YAML written to {yaml_path}")
    return yaml_path

# ------- TRAINING -------

def train_model(yaml_path: Path, epochs: int = 80, batch: int = 16):
    """Train YOLOv8 model."""
    try:
        from ultralytics import YOLO
    except ImportError:
        print("ERROR: ultralytics not installed. Run: pip install ultralytics")
        sys.exit(1)
    
    # Use yolov8m (medium) for better accuracy than yolov8n/s
    model = YOLO("yolov8m.pt")
    
    print(f"\n{'='*60}")
    print(f"Starting YOLOv8m training")
    print(f"  Dataset: {yaml_path}")
    print(f"  Classes: {CLASS_NAMES}")
    print(f"  Epochs: {epochs}")
    print(f"  Batch: {batch}")
    print(f"  Image Size: {IMG_SIZE}")
    print(f"{'='*60}\n")
    
    results = model.train(
        data=str(yaml_path),
        epochs=epochs,
        batch=batch,
        imgsz=IMG_SIZE,
        patience=20,
        save=True,
        project=str(BASE_DIR / "runs"),
        name="relife_defect_v2",
        exist_ok=True,
        # Augmentation settings for robustness
        hsv_h=0.015,
        hsv_s=0.7,
        hsv_v=0.4,
        degrees=15.0,
        translate=0.1,
        scale=0.5,
        shear=2.0,
        flipud=0.5,
        fliplr=0.5,
        mosaic=1.0,
        mixup=0.2,
        copy_paste=0.1,
    )
    
    # Copy best weights to deployment location
    best_src = BASE_DIR / "runs" / "relife_defect_v2" / "weights" / "best.pt"
    best_dst = BASE_DIR.parent / "app" / "services" / "cv" / "best.pt"
    
    if best_src.exists():
        shutil.copy2(str(best_src), str(best_dst))
        print(f"\n✅ Best model deployed to {best_dst}")
    
    # Validate
    metrics = model.val()
    print(f"\n{'='*60}")
    print(f"Validation Results:")
    print(f"  mAP@50:    {metrics.box.map50:.4f}")
    print(f"  mAP@50-95: {metrics.box.map:.4f}")
    print(f"  Precision:  {metrics.box.mp:.4f}")
    print(f"  Recall:     {metrics.box.mr:.4f}")
    print(f"{'='*60}")
    
    return results

# ------- MAIN -------

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="ReLife AI YOLO Training Pipeline")
    parser.add_argument("--generate", action="store_true", help="Generate synthetic dataset")
    parser.add_argument("--train", action="store_true", help="Train the model")
    parser.add_argument("--epochs", type=int, default=80, help="Training epochs")
    parser.add_argument("--batch", type=int, default=16, help="Batch size")
    parser.add_argument("--all", action="store_true", help="Generate dataset + train")
    args = parser.parse_args()
    
    if args.all or args.generate:
        yaml_path = generate_dataset()
    else:
        yaml_path = DATASET_DIR / "dataset.yaml"
    
    if args.all or args.train:
        if not yaml_path.exists():
            print("Dataset YAML not found. Run with --generate first.")
            sys.exit(1)
        train_model(yaml_path, epochs=args.epochs, batch=args.batch)
    
    if not (args.generate or args.train or args.all):
        print("Usage: python train_model.py --all")
        print("  --generate  Generate synthetic dataset")
        print("  --train     Train model")
        print("  --all       Generate + train")
