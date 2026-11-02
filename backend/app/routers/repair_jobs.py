from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
from beanie import PydanticObjectId

from app.models.recovery import RepairPartnerJob, RecoveryOption
from app.models.product import Product
from app.models.user import User
from app.core.security import get_current_user, require_role

router = APIRouter(prefix="/repair-jobs", tags=["Repair Partner Dispatch"])

class UpdateStatusRequest(BaseModel):
    status: str  # assigned, in_progress, completed

@router.post("/dispatch/{product_id}")
async def dispatch_repair_job(
    product_id: str,
    current_user: User = Depends(require_role(["admin", "inspector"]))
):
    if not PydanticObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID")

    prod = await Product.get(PydanticObjectId(product_id))
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    # Find recovery option for repair
    opt = await RecoveryOption.find_one(
        RecoveryOption.product_id == prod.id,
        RecoveryOption.pathway == "repair"
    )
    if not opt:
        # Create default repair recovery option
        opt = RecoveryOption(
            product_id=prod.id,
            pathway="repair",
            expected_revenue=prod.purchase_price * 0.70,
            estimated_total_cost=2500.0,
            net_recovery_value=(prod.purchase_price * 0.70) - 2500.0
        )
        await opt.insert()

    # Find available repair partner (round-robin / first available)
    repair_partners = await User.find(User.role == "repair_partner").to_list()
    if not repair_partners:
        raise HTTPException(status_code=404, detail="No active repair partner accounts registered")

    chosen_partner = repair_partners[0]

    job = RepairPartnerJob(
        recovery_option_id=opt.id,
        repair_partner_id=chosen_partner.id,
        status="assigned",
        eta_date=datetime.utcnow() + timedelta(days=4),
        parts_required=["Display Panel Assembly", "Adhesive Strip Kit"] if prod.category == "smartphone" else ["Thermal Paste", "Keyboard Assembly"]
    )
    await job.insert()

    return {
        "success": True,
        "job_id": str(job.id),
        "assigned_partner": chosen_partner.name,
        "eta_date": job.eta_date,
        "parts_required": job.parts_required
    }

@router.get("/my")
async def get_my_repair_jobs(current_user: User = Depends(get_current_user)):
    jobs = await RepairPartnerJob.find(RepairPartnerJob.repair_partner_id == current_user.id).to_list()
    enriched = []
    for j in jobs:
        opt = await RecoveryOption.get(j.recovery_option_id)
        prod = await Product.get(opt.product_id) if opt else None
        enriched.append({
            "job": j,
            "product": prod,
            "recovery_option": opt
        })
    return {"total": len(enriched), "jobs": enriched}

@router.post("/{job_id}/status")
async def update_job_status(
    job_id: str,
    req: UpdateStatusRequest,
    current_user: User = Depends(get_current_user)
):
    if not PydanticObjectId.is_valid(job_id):
        raise HTTPException(status_code=400, detail="Invalid job ID")

    job = await RepairPartnerJob.get(PydanticObjectId(job_id))
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    job.status = req.status
    await job.save()

    return {"success": True, "job": job}
