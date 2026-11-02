from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from beanie import PydanticObjectId

from app.models.operations import Enquiry, Allocation
from app.models.product import Product
from app.models.user import User
from app.services.allocation_engine import AllocationEngine
from app.core.security import get_current_user

router = APIRouter(prefix="", tags=["Pre-Demand & Auto-Allocation Engine"])

class CreateEnquiryRequest(BaseModel):
    product_category: str
    max_price: float
    quantity_needed: int = 1
    urgency_flag: bool = False

@router.post("/enquiries", status_code=status.HTTP_201_CREATED)
async def create_enquiry(
    req: CreateEnquiryRequest,
    current_user: User = Depends(get_current_user)
):
    enquiry = Enquiry(
        product_category=req.product_category.lower(),
        customer_id=current_user.id,
        max_price=req.max_price,
        quantity_needed=req.quantity_needed,
        urgency_flag=req.urgency_flag,
        status="waiting"
    )
    await enquiry.insert()
    return enquiry

@router.get("/enquiries/my")
async def get_my_enquiries(current_user: User = Depends(get_current_user)):
    enquiries = await Enquiry.find(Enquiry.customer_id == current_user.id).sort("-created_at").to_list()
    return {"total": len(enquiries), "enquiries": enquiries}

@router.get("/allocations/my")
async def get_my_allocations(current_user: User = Depends(get_current_user)):
    # Find enquiries belonging to current user
    user_enquiries = await Enquiry.find(Enquiry.customer_id == current_user.id).to_list()
    enq_ids = [e.id for e in user_enquiries]
    
    allocations = await Allocation.find({"enquiry_id": {"$in": enq_ids}}).sort("-reservation_expiry").to_list()
    enriched = []
    for a in allocations:
        prod = await Product.get(a.product_id)
        enq = next((e for e in user_enquiries if e.id == a.enquiry_id), None)
        enriched.append({
            "allocation": a,
            "product": prod,
            "enquiry": enq
        })
    return {"total": len(enriched), "allocations": enriched}

@router.post("/allocations/{allocation_id}/confirm")
async def confirm_allocation(
    allocation_id: str,
    current_user: User = Depends(get_current_user)
):
    if not PydanticObjectId.is_valid(allocation_id):
        raise HTTPException(status_code=400, detail="Invalid allocation ID")

    alloc = await Allocation.get(PydanticObjectId(allocation_id))
    if not alloc:
        raise HTTPException(status_code=404, detail="Allocation not found")

    if alloc.status != "pending_confirmation":
        raise HTTPException(status_code=400, detail=f"Allocation is already {alloc.status}")

    if datetime.utcnow() > alloc.reservation_expiry:
        alloc.status = "expired"
        await alloc.save()
        raise HTTPException(status_code=400, detail="Reservation expired")

    alloc.status = "confirmed"
    await alloc.save()

    # Update product status to sold
    prod = await Product.get(alloc.product_id)
    if prod:
        prod.status = "sold"
        await prod.save()

    return {"success": True, "message": "Product allocation confirmed successfully!", "allocation": alloc}

@router.post("/allocations/{allocation_id}/decline")
async def decline_allocation(
    allocation_id: str,
    current_user: User = Depends(get_current_user)
):
    if not PydanticObjectId.is_valid(allocation_id):
        raise HTTPException(status_code=400, detail="Invalid allocation ID")

    alloc = await Allocation.get(PydanticObjectId(allocation_id))
    if not alloc:
        raise HTTPException(status_code=404, detail="Allocation not found")

    alloc.status = "declined"
    await alloc.save()

    # Cascade allocation to next waiting enquiry
    prod = await Product.get(alloc.product_id)
    new_alloc = None
    if prod:
        new_alloc = await AllocationEngine.run_allocation(prod)

    return {
        "success": True,
        "message": "Allocation declined and released back to market",
        "cascaded_allocation": new_alloc
    }
