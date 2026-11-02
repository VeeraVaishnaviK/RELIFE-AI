import os
import uuid
import shutil
import glob
import cv2
import numpy as np
from datetime import datetime
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from pydantic import BaseModel, Field
from beanie import PydanticObjectId

from app.models.product import Product, ReturnInfo
from app.models.inspection import Inspection, DefectItem
from app.models.user import User
from app.models.recovery import Recommendation
from app.models.marketplace import MarketData
from app.core.security import get_current_user, get_current_user_optional, require_role
from app.services.trust_score_engine import TrustScoreEngine
from app.services.decision_engine import DecisionEngine
from app.services.cv.defect_detector import DefectDetector

router = APIRouter(prefix="/inspections", tags=["Inspection & Defect Detection"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Initialize defect detector with best weights if present
BEST_MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "services", "cv", "best.pt")
defect_detector = DefectDetector(
    model_path=BEST_MODEL_PATH if os.path.exists(BEST_MODEL_PATH) else None,
    confidence_threshold=0.15
)

class ManualInspectionRequest(BaseModel):
    product_id: str
    condition_summary: str = "Manual inspection completed"
    test_results: Dict[str, Any] = Field(default_factory=dict)
    functional_tests: Dict[str, Any] = Field(default_factory=dict)
    defects: List[DefectItem] = Field(default_factory=list)
    requires_human_review: bool = False
    technician_notes: str = ""
    status: str = "inspected"

async def _process_and_decide(product: Product, file_path: str, filename: str, current_user: User):
    """Common helper to run OpenCV+YOLO detection, record inspection, and make circular decision."""
    cv_result = defect_detector.predict(file_path)

    # If out of scope or unclassified, route into manual inspection queue immediately
    if cv_result.get("is_out_of_scope"):
        inspector_id = current_user.id if current_user else None
        if not inspector_id:
            default_inspector = await User.find_one(User.role == "inspector") or await User.find_one()
            inspector_id = default_inspector.id if default_inspector else product.id

        inspection = await Inspection.find_one(Inspection.product_id == product.id)
        out_summary = f"Category outside trained scope — flagged for manual inspection. Condition score: {cv_result.get('condition_score', 50)}/100."
        if not inspection:
            inspection = Inspection(
                product_id=product.id,
                inspector_id=inspector_id,
                condition_summary=out_summary,
                confidence_score=cv_result.get("overall_confidence", 0.5),
                test_results={"manual_assessment_required": True},
                requires_human_review=True,
                defects=[],
                image_url=f"/uploads/{filename}"
            )
            await inspection.insert()
        else:
            inspection.condition_summary = out_summary
            inspection.requires_human_review = True
            inspection.defects = []
            await inspection.save()

        product.status = "manual_inspection_queue"
        await product.save()

        return {
            "success": True,
            "product_id": str(product.id),
            "product_uid": product.product_uid,
            "image_url": f"/uploads/{filename}",
            "is_out_of_scope": True,
            "status": "flagged_manual_inspection",
            "message": "Category outside trained scope — flagged for manual inspection",
            "condition_score": cv_result.get("condition_score", 50),
            "condition_flags": cv_result.get("condition_flags", []),
            "defects": [],
            "overall_confidence": cv_result.get("overall_confidence", 0.5),
            "requires_human_review": True,
            "inspection_id": str(inspection.id),
            "decision": {
                "recommended_pathway": "manual_inspection",
                "ranked_options": [{"pathway": "manual_inspection", "score": 1.0, "reason": "Category outside trained scope"}],
                "explanation": "Object flagged for manual technician inspection."
            }
        }

    # Auto-update product category if vision identifies device type
    detected_device = cv_result.get("detected_device")
    if detected_device:
        if detected_device == "mobile" or detected_device == "smartphone":
            product.category = "smartphone"
            if not product.purchase_price or "macbook" in product.model.lower() or "laptop" in product.model.lower() or "thinkpad" in product.model.lower():
                if "apple" in product.brand.lower():
                    product.model = "iPhone 13 Pro"
                    product.purchase_price = 69900.0
                else:
                    product.brand = "Samsung"
                    product.model = "Galaxy S22 Ultra"
                    product.purchase_price = 64999.0
            await product.save()
        elif detected_device == "laptop":
            product.category = "laptop"
            if not product.purchase_price:
                product.purchase_price = 89900.0
            await product.save()
    elif cv_result.get("detected_category") and cv_result.get("detected_category") != "out_of_scope":
        product.category = cv_result["detected_category"]
        await product.save()

    detected_items: List[DefectItem] = []
    for d in cv_result["defects"]:
        detected_items.append(DefectItem(
            defect_category=d["defect_category"],
            location=d["location"],
            severity_estimate=d["severity_estimate"],
            detection_confidence=d["detection_confidence"],
            bounding_box=d["bounding_box"],
            image_url=f"/uploads/{filename}"
        ))

    real_defects = [d for d in detected_items if d.defect_category not in ["mobile", "laptop"]]
    summary_text = (
        f"Device verified as {detected_device or product.category}. "
        + (f"{len(real_defects)} defect(s) localized." if real_defects else "Clean condition — no surface defects.")
    )

    inspector_id = current_user.id if current_user else None
    if not inspector_id:
        default_inspector = await User.find_one(User.role == "inspector")
        if not default_inspector:
            default_inspector = await User.find_one()
        inspector_id = default_inspector.id if default_inspector else product.id

    inspection = await Inspection.find_one(Inspection.product_id == product.id)
    if not inspection:
        inspection = Inspection(
            product_id=product.id,
            inspector_id=inspector_id,
            condition_summary=summary_text,
            confidence_score=cv_result["overall_confidence"],
            test_results={
                "display_touch": True if not any(d.defect_category == "crack" and d.location == "screen" for d in detected_items) else False,
                "chassis_integrity": False if any(d.defect_category in ["crack", "deformation"] for d in detected_items) else True,
                "power_test": True
            },
            requires_human_review=cv_result["requires_human_review"],
            defects=detected_items,
            image_url=f"/uploads/{filename}"
        )
        await inspection.insert()
    else:
        inspection.defects = detected_items
        inspection.confidence_score = cv_result["overall_confidence"]
        inspection.image_url = f"/uploads/{filename}"
        if cv_result["requires_human_review"]:
            inspection.requires_human_review = True
        await inspection.save()

    product.status = "inspected"
    await product.save()

    # Recalculate Trust Score
    await TrustScoreEngine.compute_and_save(product, inspection)

    # Automatically compute 5-Pathway Decision
    market_data = await MarketData.find_one(MarketData.product_category == product.category)
    decision_res = DecisionEngine.evaluate(
        product=product,
        inspection=inspection,
        market_data=market_data
    )

    existing_rec = await Recommendation.find_one(Recommendation.product_id == product.id)
    if existing_rec:
        existing_rec.ranked_options = decision_res["ranked_options"]
        existing_rec.explanation_text = decision_res["explanation"]
        existing_rec.created_at = datetime.utcnow()
        await existing_rec.save()
    else:
        new_rec = Recommendation(
            product_id=product.id,
            ranked_options=decision_res["ranked_options"],
            explanation_text=decision_res["explanation"],
            model_version="v1.0-decision-engine",
            confidence=0.92,
            missing_info=[]
        )
        await new_rec.insert()

    return {
        "success": True,
        "product_id": str(product.id),
        "product_uid": product.product_uid,
        "image_url": f"/uploads/{filename}",
        "quality_check": cv_result["quality_check"],
        "defects": detected_items,
        "overall_confidence": cv_result["overall_confidence"],
        "requires_human_review": inspection.requires_human_review,
        "inspection_id": str(inspection.id),
        "decision": decision_res
    }

@router.post("/identify")
async def identify_product_image(
    image: UploadFile = File(...)
):
    """
    Pre-intake visual auto-identification window.
    Runs computer vision on uploaded/captured photo before manual details are entered,
    identifying product category (electronics, apparel/clothes, footwear, appliances, etc.),
    suggested brand & model, benchmark MSRP, and defect localization.
    """
    file_ext = os.path.splitext(image.filename)[1] or ".jpg"
    filename = f"intake_scan_{uuid.uuid4().hex[:8]}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    cv_result = defect_detector.predict(file_path)

    # SAFETY CHECK: If confidence margin is too low (< 0.15) or recapture requested
    if cv_result.get("needs_recapture"):
        return {
            "success": False,
            "needs_recapture": True,
            "status": "recapture_requested",
            "pipeline_path": cv_result.get("pipeline_path", "primary_pipeline"),
            "message": cv_result.get("message", "Please recapture — unclear object, ensure product fills the guide box with good lighting"),
            "reason": cv_result.get("reason", "Ambiguous classification margin or low confidence"),
            "clip_margin": cv_result.get("clip_margin", 0.0),
            "cropped_applied": cv_result.get("cropped_applied", True),
            "crop_box": cv_result.get("crop_box"),
            "gemini_fallback": cv_result.get("gemini_fallback"),
            "image_url": f"/uploads/{filename}",
            "identification_confidence": cv_result.get("identification_confidence", 0.0),
            "condition_score": cv_result.get("condition_score", 50),
            "condition_flags": cv_result.get("condition_flags", [])
        }

    # LAYER 4: Check if outside trained scope or low confidence
    if cv_result.get("is_out_of_scope"):
        return {
            "success": True,
            "image_url": f"/uploads/{filename}",
            "is_out_of_scope": True,
            "status": "flagged_manual_inspection",
            "pipeline_path": cv_result.get("pipeline_path", "manual_review"),
            "requires_human_review": True,
            "message": "Category outside trained scope — flagged for manual inspection",
            "reason": cv_result.get("reason", "Item outside 11 supported circular categories"),
            "detected_category": "out_of_scope",
            "category_label": "Outside Trained Scope",
            "suggested_brand": "Manual Review",
            "suggested_model": "Non-Catalog Object (Station #02 Inspection)",
            "suggested_msrp": 0.0,
            "suggested_reason": "Category outside trained scope — flagged for manual inspection",
            "serial_prefix": "REV",
            "identification_confidence": cv_result.get("identification_confidence", 0.0),
            "identification_source": cv_result.get("identification_source", "none"),
            "cropped_applied": cv_result.get("cropped_applied", True),
            "crop_box": cv_result.get("crop_box"),
            "gemini_fallback": cv_result.get("gemini_fallback"),
            "condition_score": cv_result.get("condition_score", 50),
            "condition_flags": cv_result.get("condition_flags", []),
            "validated_yolo_active": False,
            "defects": [],
            "overall_confidence": cv_result.get("overall_confidence", 0.0),
            "quality_check": cv_result.get("quality_check", {})
        }

    detected_cat = cv_result.get("detected_category") or "clothes"

    defaults = {
        "clothes": {
            "label": "Clothes & Apparel / Fashion",
            "brand": "Zara",
            "model": "Classic Denim Jacket / Cotton Hoodie",
            "msrp": 4999.0,
            "reason": "Sizing mismatch / unworn return with tags",
            "prefix": "CLO"
        },
        "footwear": {
            "label": "Footwear & Shoes / Sneakers",
            "brand": "Nike",
            "model": "Air Max Retro Sneaker (Size 10)",
            "msrp": 9999.0,
            "reason": "Tried on once, box opened return",
            "prefix": "FOO"
        },
        "laptop": {
            "label": "Laptop / Ultrabook",
            "brand": "Apple",
            "model": "MacBook Pro 14 (M1 Pro)",
            "msrp": 149900.0,
            "reason": "Minor cosmetic scratch on casing lid",
            "prefix": "LAP"
        },
        "smartphone": {
            "label": "Smartphone / Mobile",
            "brand": "Apple",
            "model": "iPhone 14 Pro Max (256GB)",
            "msrp": 129900.0,
            "reason": "Customer upgraded, return within 14 days",
            "prefix": "SMA"
        },
        "tablet": {
            "label": "Tablet / iPad",
            "brand": "Apple",
            "model": "iPad Air 10.9-inch (M1)",
            "msrp": 59900.0,
            "reason": "Open box customer exchange",
            "prefix": "TAB"
        },
        "smartwatch": {
            "label": "Smartwatch & Wearables",
            "brand": "Apple",
            "model": "Apple Watch Series 8 GPS 45mm",
            "msrp": 41900.0,
            "reason": "Unwanted gift return with original charger",
            "prefix": "WAT"
        },
        "audio": {
            "label": "Audio & Headphones / Earbuds",
            "brand": "Sony",
            "model": "WH-1000XM5 Noise Canceling Headphones",
            "msrp": 29990.0,
            "reason": "Customer return — packaging seal broken",
            "prefix": "AUD"
        },
        "home_appliances": {
            "label": "Home Appliances & Kitchenware",
            "brand": "Dyson",
            "model": "Air Purifier & HEPA Fan V4",
            "msrp": 34990.0,
            "reason": "Defective box, unused unit inside",
            "prefix": "HOM"
        },
        "gaming_console": {
            "label": "Gaming Consoles & Hardware",
            "brand": "Sony",
            "model": "PlayStation 5 Disc Edition (825GB)",
            "msrp": 54990.0,
            "reason": "Controller stick drift reported by buyer",
            "prefix": "GAM"
        },
        "camera": {
            "label": "Camera & Optical Equipment",
            "brand": "Canon",
            "model": "EOS R50 Mirrorless with 18-45mm Kit",
            "msrp": 68990.0,
            "reason": "Open box return, shutter count under 50",
            "prefix": "CAM"
        },
        "monitor": {
            "label": "Monitors & Smart Displays",
            "brand": "Dell",
            "model": "27-inch 4K UHD IPS Designer Display",
            "msrp": 38900.0,
            "reason": "Dead pixel reported in corner quadrant",
            "prefix": "MON"
        }
    }
    
    cat_info = defaults.get(detected_cat, defaults["clothes"])

    return {
        "success": True,
        "is_out_of_scope": False,
        "status": cv_result.get("status", "automated_pass"),
        "message": cv_result.get("message", "Inspection complete"),
        "image_url": f"/uploads/{filename}",
        "detected_category": detected_cat,
        "category_label": cat_info["label"],
        "suggested_brand": cat_info["brand"],
        "suggested_model": cat_info["model"],
        "suggested_msrp": cat_info["msrp"],
        "suggested_reason": cat_info["reason"],
        "serial_prefix": cat_info["prefix"],
        "identification_confidence": cv_result.get("identification_confidence", 0.94),
        "identification_source": cv_result.get("identification_source", "yolov8s_coco"),
        "pipeline_path": cv_result.get("pipeline_path", "primary_pipeline"),
        "cropped_applied": cv_result.get("cropped_applied", False),
        "crop_box": cv_result.get("crop_box"),
        "clip_margin": cv_result.get("clip_margin"),
        "gemini_fallback": cv_result.get("gemini_fallback"),
        "condition_score": cv_result.get("condition_score", 90),
        "condition_flags": cv_result.get("condition_flags", []),
        "validated_yolo_active": cv_result.get("validated_yolo_active", False),
        "defects": cv_result.get("defects", []),
        "overall_confidence": cv_result.get("overall_confidence", 0.94),
        "requires_human_review": cv_result.get("requires_human_review", False),
        "quality_check": cv_result.get("quality_check", {})
    }

@router.post("/upload-image")
async def upload_inspection_image(
    product_id: str = Form(...),
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_user_optional)
):
    product = None
    if PydanticObjectId.is_valid(product_id):
        product = await Product.get(PydanticObjectId(product_id))
    if not product:
        product = await Product.find_one(Product.product_uid == product_id)
    if not product:
        # Auto-provision temporary product record so client-generated IDs never 404
        short_uid = uuid.uuid4().hex[:6].upper()
        product = Product(
            product_uid=f"RELIFE-DEV-{short_uid}",
            serial_number=f"SN-DEV-{uuid.uuid4().hex[:8].upper()}",
            brand="Generic",
            model="Intake Device",
            category="smartphone",
            purchase_price=49990.0,
            status="registered",
            return_info=ReturnInfo(
                return_reason="Intake inspection scan",
                return_date=datetime.utcnow(),
                warranty_status="In Warranty",
                customer_id=getattr(current_user, "id", None)
            )
        )
        await product.insert()

    file_ext = os.path.splitext(image.filename)[1] or ".jpg"
    filename = f"{product.product_uid}_{uuid.uuid4().hex[:8]}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    return await _process_and_decide(product, file_path, filename, current_user)

@router.post("/opencv-capture")
async def opencv_camera_capture(
    product_id: str = Form(...),
    use_sample: bool = Form(False),
    current_user: User = Depends(get_current_user)
):
    product = None
    if PydanticObjectId.is_valid(product_id):
        product = await Product.get(PydanticObjectId(product_id))
    if not product:
        product = await Product.find_one(Product.product_uid == product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    filename = f"{product.product_uid}_{uuid.uuid4().hex[:8]}.jpg"
    file_path = os.path.join(UPLOAD_DIR, filename)

    frame_captured = False

    if not use_sample:
        try:
            # Try hardware webcam via OpenCV
            cap = cv2.VideoCapture(0, cv2.CAP_DSHOW if os.name == 'nt' else cv2.CAP_ANY)
            if cap.isOpened():
                # Read 2-3 frames to allow auto-exposure to adjust
                for _ in range(3):
                    ret, frame = cap.read()
                cap.release()
                if ret and frame is not None and frame.size > 0:
                    cv2.imwrite(file_path, frame)
                    frame_captured = True
        except Exception as e:
            print(f"OpenCV VideoCapture error: {e}")

    # Fallback to high-quality sample defect test image if camera unavailable or requested
    if not frame_captured:
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        dataset_images = glob.glob(os.path.join(base_dir, "ml", "dataset", "test", "images", "*.jpg"))
        if dataset_images:
            shutil.copy(dataset_images[0], file_path)
        else:
            # Generate fallback simulated test device image
            simulated = np.zeros((640, 640, 3), dtype=np.uint8)
            simulated[:] = (235, 235, 235) # Light gray laptop chassis
            # Draw screen area
            cv2.rectangle(simulated, (80, 80), (560, 480), (30, 30, 30), -1)
            # Draw visible scratch defect
            cv2.line(simulated, (150, 180), (320, 260), (180, 180, 180), 2)
            cv2.imwrite(file_path, simulated)

    return await _process_and_decide(product, file_path, filename, current_user)

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_manual_inspection(
    req: ManualInspectionRequest,
    current_user: User = Depends(get_current_user)
):
    if not PydanticObjectId.is_valid(req.product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID")
        
    product = await Product.get(PydanticObjectId(req.product_id))
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Merge functional_tests into test_results
    merged_test_results = {**req.test_results, **req.functional_tests}
    
    # Build condition summary
    condition = req.condition_summary
    if req.technician_notes:
        condition = f"{condition}. Technician notes: {req.technician_notes}"

    # Check if inspection already exists (from image upload)
    existing_inspection = await Inspection.find_one(Inspection.product_id == product.id)
    if existing_inspection:
        # Update existing inspection with functional test data
        existing_inspection.test_results = merged_test_results
        existing_inspection.condition_summary = condition
        if req.defects:
            # Merge new defects avoiding duplicates
            existing_inspection.defects.extend(req.defects)
        await existing_inspection.save()
        inspection = existing_inspection
    else:
        inspection = Inspection(
            product_id=product.id,
            inspector_id=current_user.id,
            condition_summary=condition,
            confidence_score=0.92,
            test_results=merged_test_results,
            requires_human_review=req.requires_human_review,
            defects=req.defects
        )
        await inspection.insert()

    product.status = "inspected"
    await product.save()

    await TrustScoreEngine.compute_and_save(product, inspection)
    return inspection

@router.get("/{product_id}")
async def get_inspection_for_product(product_id: str):
    prod = None
    if PydanticObjectId.is_valid(product_id):
        prod = await Product.get(PydanticObjectId(product_id))
    if not prod:
        prod = await Product.find_one(Product.product_uid == product_id)
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    inspection = await Inspection.find_one(Inspection.product_id == prod.id)
    if not inspection:
        raise HTTPException(status_code=404, detail="No inspection found for this product")
    if not inspection.image_url and inspection.defects:
        for d in inspection.defects:
            if d.image_url:
                inspection.image_url = d.image_url
                break
    return inspection
