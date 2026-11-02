import io
import uuid
import base64
from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
import qrcode
from beanie import PydanticObjectId

from app.models.product import Product, ReturnInfo, ServiceRecord, HealthCheck
from app.models.user import User
from app.core.security import get_current_user, get_current_user_optional, require_role
from app.services.trust_score_engine import TrustScoreEngine

router = APIRouter(prefix="/products", tags=["Products & Returns Management"])

def generate_qr_base64(data: str) -> str:
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=6,
        border=2,
    )
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{img_str}"

class ReturnInfoInput(BaseModel):
    return_reason: Optional[str] = "Customer Return"
    return_channel: Optional[str] = "ecommerce_return"
    customer_notes: Optional[str] = None

class ProductCreateRequest(BaseModel):
    brand: str
    model: str
    category: str = "laptop"
    serial_number: Optional[str] = None
    age_months: int = 6
    purchase_price: Optional[float] = None
    original_msrp: Optional[float] = None
    purchase_date: Optional[str] = None
    condition: Optional[str] = None
    health_check: Optional[HealthCheck] = None
    service_records: Optional[List[ServiceRecord]] = None
    return_reason: Optional[str] = "Customer Return"
    customer_reported_issue: Optional[str] = None
    warranty_status: Optional[str] = "In Warranty"
    return_info: Optional[ReturnInfoInput] = None

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_product(
    req: ProductCreateRequest,
    current_user: User = Depends(get_current_user_optional)
):
    cat_prefix = req.category[:3].upper() if req.category else "DEV"
    short_uuid = uuid.uuid4().hex[:6].upper()
    product_uid = f"RELIFE-{cat_prefix}-{short_uuid}"
    
    qr_code_b64 = generate_qr_base64(f"RELIFE://product/{product_uid}")
    
    # Support both nested return_info and flat return_reason
    reason = req.return_reason or "Customer Return"
    customer_issue = req.customer_reported_issue
    if req.return_info:
        reason = req.return_info.return_reason or reason
        customer_issue = req.return_info.customer_notes or customer_issue
    
    return_info = ReturnInfo(
        return_reason=reason,
        return_date=datetime.utcnow(),
        customer_reported_issue=customer_issue,
        warranty_status=req.warranty_status,
        customer_id=current_user.id
    )
    
    # Support both original_msrp and purchase_price
    price = req.original_msrp or req.purchase_price or 50000.0

    # Auto-generate serial if absent
    serial = req.serial_number or f"SN-{req.brand[:3].upper()}-{uuid.uuid4().hex[:8].upper()}"

    # Auto-generate purchase date if absent based on age_months
    if not req.purchase_date:
        from datetime import timedelta
        p_date = datetime.utcnow() - timedelta(days=max(req.age_months * 30, 15))
        purchase_date_str = p_date.strftime("%Y-%m-%d")
    else:
        purchase_date_str = req.purchase_date

    # Condition
    condition_str = req.condition or "Grade A (Like New)"

    # Health check default
    health = req.health_check or HealthCheck(
        score=94,
        battery_health=92,
        status="Passed Diagnostics",
        diagnostics={
            "display": "Pass",
            "battery": "92%",
            "internals": "Optimal",
            "ports": "Pass",
            "sensors": "Pass"
        },
        last_checked=datetime.utcnow().strftime("%Y-%m-%d")
    )

    # Initial service record if none provided
    srv_records = req.service_records or [
        ServiceRecord(
            service_id=f"SRV-{uuid.uuid4().hex[:6].upper()}",
            date=purchase_date_str,
            service_type="Factory QA & Initial Provisioning",
            provider=f"{req.brand} Authorized Facility",
            status="Completed",
            notes="Passed factory diagnostic baseline test.",
            cost=0.0
        )
    ]
    
    product = Product(
        product_uid=product_uid,
        serial_number=serial,
        brand=req.brand,
        model=req.model,
        category=req.category.lower(),
        age_months=req.age_months,
        purchase_price=price,
        purchase_date=purchase_date_str,
        condition=condition_str,
        health_check=health,
        service_records=srv_records,
        qr_code_base64=qr_code_b64,
        status="registered",
        return_info=return_info
    )
    await product.insert()
    
    # Initialize initial baseline trust score
    await TrustScoreEngine.compute_and_save(product)
    
    return product

@router.get("")
async def list_products(
    category: Optional[str] = None,
    status: Optional[str] = None,
    brand: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100),
    skip: int = Query(0, ge=0)
):
    query = {}
    if category:
        query["category"] = category.lower()
    if status:
        query["status"] = status
    if brand:
        query["brand"] = {"$regex": brand, "$options": "i"}
        
    products = await Product.find(query).skip(skip).limit(limit).sort("-created_at").to_list()
    total = await Product.find(query).count()
    return {"total": total, "products": products}

@router.get("/{product_id}")
async def get_product(product_id: str):
    product = None
    if PydanticObjectId.is_valid(product_id):
        product = await Product.get(PydanticObjectId(product_id))
    if not product:
        product = await Product.find_one(Product.product_uid == product_id)
        
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
