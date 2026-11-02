import asyncio
import io
import os
import sys
import base64
from datetime import datetime, timedelta

# Ensure UTF-8 output on Windows consoles
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

import qrcode

from app.database import init_db, close_db
from app.core.security import get_password_hash
from app.models import (
    User,
    Product,
    ReturnInfo,
    ServiceRecord,
    HealthCheck,
    Inspection,
    DefectItem,
    MarketData,
    Component,
    ComponentAuction,
    AuctionBid,
    Enquiry,
    Allocation,
    RecoveryOption,
    CostItem,
    Recommendation,
    RecoveryOutcome,
    EnvironmentalRecord,
    TrustScore
)

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

async def seed():
    await init_db()
    print("🌱 Clearing existing collections for fresh seed...")
    await User.find_all().delete()
    await Product.find_all().delete()
    await Inspection.find_all().delete()
    await MarketData.find_all().delete()
    await Component.find_all().delete()
    await ComponentAuction.find_all().delete()
    await Enquiry.find_all().delete()
    await Allocation.find_all().delete()
    await RecoveryOption.find_all().delete()
    await Recommendation.find_all().delete()
    await RecoveryOutcome.find_all().delete()
    await EnvironmentalRecord.find_all().delete()
    await TrustScore.find_all().delete()

    print("👤 Seeding 6 Users (1 per role)...")
    roles = [
        {"name": "Alice Admin", "email": "admin@relife.ai", "role": "admin", "password": "Admin@123", "phone": "+91 9876543210"},
        {"name": "Bob Inspector", "email": "inspector@relife.ai", "role": "inspector", "password": "Inspector@123", "phone": "+91 9876543211"},
        {"name": "CyberTech Resellers", "email": "reseller@relife.ai", "role": "reseller", "password": "Reseller@123", "phone": "+91 9876543212"},
        {"name": "Priya Sharma", "email": "customer@relife.ai", "role": "customer", "password": "Customer@123", "phone": "+91 9876543213"},
        {"name": "Apex Fix Services", "email": "repair@relife.ai", "role": "repair_partner", "password": "Repair@123", "phone": "+91 9876543214"},
        {"name": "EcoRefine Recyclers", "email": "recycler@relife.ai", "role": "recycler", "password": "Recycler@123", "phone": "+91 9876543215"},
    ]

    created_users = {}
    for r in roles:
        user = User(
            name=r["name"],
            email=r["email"],
            password_hash=get_password_hash(r["password"]),
            role=r["role"],
            phone=r["phone"],
            reliability_score=96.5 if r["role"] == "reseller" else 100.0,
            created_at=datetime.utcnow() - timedelta(days=30)
        )
        await user.insert()
        created_users[r["role"]] = user

    print("📊 Seeding MarketData per category...")
    market_categories = [
        {"product_category": "laptop", "resale_price": 38000.0, "demand_index": 1.25, "sale_probability": 0.88},
        {"product_category": "smartphone", "resale_price": 24000.0, "demand_index": 1.40, "sale_probability": 0.92},
        {"product_category": "tablet", "resale_price": 18000.0, "demand_index": 1.05, "sale_probability": 0.78},
        {"product_category": "audio", "resale_price": 7500.0, "demand_index": 0.95, "sale_probability": 0.82},
        {"product_category": "smartwatch", "resale_price": 9500.0, "demand_index": 1.15, "sale_probability": 0.85},
    ]
    for m in market_categories:
        md = MarketData(**m, recorded_at=datetime.utcnow())
        await md.insert()

    print("💻 Seeding 18 Products across varied categories & conditions...")
    sample_products_data = [
        {"uid": "RELIFE-LAP-001", "serial": "SN-DL-890214", "condition": "Grade B (Minor Scratches)", "brand": "Dell", "model": "XPS 13 9310", "category": "laptop", "age": 8, "price": 85000.0, "status": "decided", "reason": "Slight cosmetic scratch on lid", "issue": "Cosmetic issue, functions perfectly"},
        {"uid": "RELIFE-LAP-002", "serial": "SN-AP-991204", "condition": "Grade A (Like New)", "brand": "Apple", "model": "MacBook Air M1", "category": "laptop", "age": 14, "price": 72000.0, "status": "resale_listed", "reason": "Buyer upgraded to M3", "issue": "Minor scratch on bottom plate"},
        {"uid": "RELIFE-LAP-003", "serial": "SN-LN-442190", "condition": "Grade C (Display Cracked)", "brand": "Lenovo", "model": "ThinkPad T14 Gen 2", "category": "laptop", "age": 18, "price": 68000.0, "status": "inspected", "reason": "Screen cracked during shipment", "issue": "Cracked display panel, powers on"},
        {"uid": "RELIFE-LAP-004", "serial": "SN-HP-309182", "condition": "Grade A (Refurbished)", "brand": "HP", "model": "Pavilion 15", "category": "laptop", "age": 22, "price": 52000.0, "status": "registered", "reason": "Customer return - slow boot", "issue": "OS reinstall needed, no physical damage"},
        {"uid": "RELIFE-PHN-005", "serial": "IMEI-3548901239812", "condition": "Grade A- (Good Battery)", "brand": "Apple", "model": "iPhone 13 128GB", "category": "smartphone", "age": 16, "price": 54000.0, "status": "resale_listed", "reason": "Trade-in trade-up", "issue": "Battery health 86%, flawless screen"},
        {"uid": "RELIFE-PHN-006", "serial": "IMEI-8692340518291", "condition": "Grade B (Rear Glass Scratched)", "brand": "Samsung", "model": "Galaxy S22 5G", "category": "smartphone", "age": 12, "price": 48000.0, "status": "decided", "reason": "Camera lens glass scratched", "issue": "Defect on rear glass cover"},
        {"uid": "RELIFE-PHN-007", "serial": "IMEI-9902341872341", "condition": "Grade C (Back Glass Shattered)", "brand": "Google", "model": "Pixel 7 Pro", "category": "smartphone", "age": 10, "price": 56000.0, "status": "inspected", "reason": "Back panel shattered", "issue": "Cracked rear glass, display fine"},
        {"uid": "RELIFE-PHN-008", "serial": "IMEI-8601928374619", "condition": "Grade A+ (Near Mint)", "brand": "OnePlus", "model": "11 5G", "category": "smartphone", "age": 7, "price": 46000.0, "status": "sold", "reason": "Exchange program", "issue": "Near mint condition"},
        {"uid": "RELIFE-TAB-009", "serial": "SN-AP-773419", "condition": "Grade B (Chassis Dent)", "brand": "Apple", "model": "iPad Air 4th Gen", "category": "tablet", "age": 20, "price": 44000.0, "status": "decided", "reason": "Dented aluminium chassis corner", "issue": "Corner dent, screen intact"},
        {"uid": "RELIFE-TAB-010", "serial": "SN-SM-902184", "condition": "Grade A (Open Box)", "brand": "Samsung", "model": "Galaxy Tab S7 FE", "category": "tablet", "age": 15, "price": 36000.0, "status": "registered", "reason": "Unwanted gift return", "issue": "Open box condition"},
        {"uid": "RELIFE-LAP-011", "serial": "SN-AS-612984", "condition": "Grade C (Missing Parts)", "brand": "Asus", "model": "ROG Zephyrus G14", "category": "laptop", "age": 19, "price": 95000.0, "status": "decided", "reason": "Missing charger and RAM module", "issue": "Missing component, tested motherboard OK"},
        {"uid": "RELIFE-LAP-012", "serial": "SN-AC-192834", "condition": "Grade D (Water Damaged)", "brand": "Acer", "model": "Swift 3", "category": "laptop", "age": 32, "price": 38000.0, "status": "recycled", "reason": "Water damage and severe motherboard corrosion", "issue": "Unrepairable motherboard"},
        {"uid": "RELIFE-PHN-013", "serial": "IMEI-8671928301924", "condition": "Grade A (Like New)", "brand": "Xiaomi", "model": "Redmi Note 12 Pro", "category": "smartphone", "age": 9, "price": 21000.0, "status": "resale_listed", "reason": "Returned within 7 days", "issue": "Like-new condition"},
        {"uid": "RELIFE-PHN-014", "serial": "IMEI-3529182374619", "condition": "Grade C (Cracked Screen)", "brand": "Apple", "model": "iPhone 12 Mini", "category": "smartphone", "age": 30, "price": 42000.0, "status": "decided", "reason": "Dented edge and cracked screen", "issue": "Multiple visible defects"},
        {"uid": "RELIFE-TAB-015", "serial": "SN-LN-192847", "condition": "Grade A- (Open Box)", "brand": "Lenovo", "model": "Tab M10 Plus", "category": "tablet", "age": 11, "price": 16000.0, "status": "inspected", "reason": "Returned open box", "issue": "Minor scratch on bezel"},
        {"uid": "RELIFE-LAP-016", "serial": "SN-DL-109283", "condition": "Grade A+ (Pristine Sealed)", "brand": "Dell", "model": "Inspiron 16", "category": "laptop", "age": 5, "price": 62000.0, "status": "registered", "reason": "Buyer change of mind", "issue": "Pristine unopened package"},
        {"uid": "RELIFE-PHN-017", "serial": "IMEI-8691029384756", "condition": "Grade A- (Micro Scratches)", "brand": "Nothing", "model": "Phone (2)", "category": "smartphone", "age": 6, "price": 39000.0, "status": "resale_listed", "reason": "Exchange program", "issue": "Very light surface micro-scratches"},
        {"uid": "RELIFE-LAP-018", "serial": "SN-AP-884920", "condition": "Grade B- (Sticky Key)", "brand": "Apple", "model": "MacBook Pro 14 M2", "category": "laptop", "age": 10, "price": 140000.0, "status": "decided", "reason": "Keyboard sticky key", "issue": "Hinge deformation and spacebar issue"}
    ]

    created_products = []
    for sp in sample_products_data:
        qr_code = generate_qr_base64(f"RELIFE://product/{sp['uid']}")
        purchase_dt = datetime.utcnow() - timedelta(days=sp["age"] * 30)
        purchase_date_str = purchase_dt.strftime("%Y-%m-%d")
        
        # Calculate battery health & health score based on age & status
        bat_health = max(72, min(99, 100 - (sp["age"] * 1)))
        health_score = 95 if "Grade A" in sp["condition"] else (85 if "Grade B" in sp["condition"] else 68)
        diag_status = "Optimal" if health_score >= 90 else ("Attention Required" if health_score < 75 else "Good")

        health_check = HealthCheck(
            score=health_score,
            battery_health=bat_health,
            status="Passed Diagnostics" if health_score >= 80 else "Flagged for Repair",
            diagnostics={
                "display": "Pass" if "Cracked" not in sp["condition"] else "Fail / Cracked",
                "battery": f"{bat_health}%",
                "thermals": "Normal",
                "motherboard": "Pass" if "Water" not in sp["condition"] else "Corrosion Detected",
                "ports": "Pass",
                "sensors": "Pass"
            },
            last_checked=(datetime.utcnow() - timedelta(days=2)).strftime("%Y-%m-%d")
        )

        # Service records history
        service_records = [
            ServiceRecord(
                service_id=f"SRV-{sp['uid'][-3:]}-01",
                date=purchase_date_str,
                service_type="Factory QA & Initial Provisioning",
                provider=f"{sp['brand']} Authorized Manufacturing",
                status="Completed",
                notes="Passed initial OEM factory QA certification.",
                cost=0.0
            ),
            ServiceRecord(
                service_id=f"SRV-{sp['uid'][-3:]}-02",
                date=(datetime.utcnow() - timedelta(days=sp["age"] * 10)).strftime("%Y-%m-%d"),
                service_type="Scheduled Maintenance / Diagnostic Health Check",
                provider=f"{sp['brand']} Care Partner",
                status="Completed",
                notes=f"Diagnostics run: Battery {bat_health}%, thermal scan {diag_status}.",
                cost=1200.0 if sp["age"] > 12 else 0.0
            )
        ]
        if "inspected" in sp["status"] or "decided" in sp["status"]:
            service_records.append(
                ServiceRecord(
                    service_id=f"SRV-{sp['uid'][-3:]}-03",
                    date=(datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d"),
                    service_type="ReLife AI Optical Intake & Defect Mapping",
                    provider="ReLife Automated Neural Station #4",
                    status="Completed",
                    notes=f"Computer vision inspection completed. Condition verified as {sp['condition']}.",
                    cost=450.0
                )
            )

        ret_info = ReturnInfo(
            return_reason=sp["reason"],
            return_date=datetime.utcnow() - timedelta(days=sp["age"] * 2),
            customer_reported_issue=sp["issue"],
            warranty_status="In Warranty" if sp["age"] <= 12 else "Expired",
            customer_id=created_users["customer"].id
        )
        prod = Product(
            product_uid=sp["uid"],
            serial_number=sp["serial"],
            brand=sp["brand"],
            model=sp["model"],
            category=sp["category"],
            age_months=sp["age"],
            purchase_price=sp["price"],
            purchase_date=purchase_date_str,
            condition=sp["condition"],
            health_check=health_check,
            service_records=service_records,
            qr_code_base64=qr_code,
            status=sp["status"],
            created_at=datetime.utcnow() - timedelta(days=sp["age"] * 3),
            return_info=ret_info
        )
        await prod.insert()
        created_products.append(prod)

    print("🔍 Seeding Inspections & Defect records...")
    inspector = created_users["inspector"]
    for i, prod in enumerate(created_products[:12]):
        defects = []
        requires_review = False
        if i % 3 == 0:
            defects.append(DefectItem(
                defect_category="scratch",
                location="screen" if "PHN" in prod.product_uid else "casing",
                severity_estimate="low",
                detection_confidence=0.92,
                bounding_box=[0.24, 0.35, 0.42, 0.58],
                image_url=None
            ))
        elif i % 3 == 1:
            defects.append(DefectItem(
                defect_category="crack",
                location="screen",
                severity_estimate="high",
                detection_confidence=0.88,
                bounding_box=[0.15, 0.20, 0.75, 0.80],
                image_url=None
            ))
            requires_review = True
        else:
            defects.append(DefectItem(
                defect_category="dent",
                location="edge",
                severity_estimate="medium",
                detection_confidence=0.84,
                bounding_box=[0.70, 0.10, 0.88, 0.25],
                image_url=None
            ))

        inspection = Inspection(
            product_id=prod.id,
            inspector_id=inspector.id,
            condition_summary=f"Automated AI visual inspection completed with {len(defects)} defects identified.",
            confidence_score=0.91 if not requires_review else 0.74,
            test_results={
                "battery_health_pct": 89 - (i * 2),
                "display_touch": True if i % 3 != 1 else False,
                "ports_working": True,
                "camera_working": True,
                "audio_working": True
            },
            requires_human_review=requires_review,
            created_at=datetime.utcnow() - timedelta(days=2),
            defects=defects
        )
        await inspection.insert()

        # Seed Trust Score
        score = 88 if not requires_review else 68
        ts = TrustScore(
            product_id=prod.id,
            score_value=score,
            score_breakdown={
                "inspection_completeness": 95,
                "defect_penalty": 12 if not requires_review else 32,
                "test_pass_rate": 90,
                "provenance_score": 92
            },
            computed_at=datetime.utcnow()
        )
        await ts.insert()

        # Seed Decision & Recovery Options for decided products
        if prod.status in ["decided", "resale_listed", "sold", "recycled"]:
            pathways = ["resale", "repair", "refurbish", "harvest", "recycle"]
            recovery_options = []
            resale_rev = prod.purchase_price * 0.65
            for p in pathways:
                if p == "resale":
                    cost = 450.0
                    rev = resale_rev
                    env = 95.0
                    risk = 15.0 if not requires_review else 65.0
                    feasible = not requires_review
                elif p == "repair":
                    cost = 3200.0
                    rev = resale_rev * 1.15
                    env = 88.0
                    risk = 25.0
                    feasible = True
                elif p == "refurbish":
                    cost = 4800.0
                    rev = resale_rev * 1.25
                    env = 82.0
                    risk = 20.0
                    feasible = True
                elif p == "harvest":
                    cost = 650.0
                    rev = resale_rev * 0.45
                    env = 70.0
                    risk = 30.0
                    feasible = True
                else:  # recycle
                    cost = 250.0
                    rev = 450.0
                    env = 55.0
                    risk = 10.0
                    feasible = True

                nrv = rev - cost
                opt = RecoveryOption(
                    product_id=prod.id,
                    pathway=p,
                    feasibility_flag=feasible,
                    expected_revenue=round(rev, 2),
                    estimated_total_cost=round(cost, 2),
                    net_recovery_value=round(nrv, 2),
                    risk_score=risk,
                    environmental_score=env,
                    cost_breakdown=[
                        CostItem(cost_category="logistics", amount=250.0, status="confirmed"),
                        CostItem(cost_category="inspection", amount=150.0, status="confirmed"),
                        CostItem(cost_category="processing", amount=round(cost - 400.0, 2), status="estimated")
                    ]
                )
                await opt.insert()
                recovery_options.append(opt)

            # Recommendation
            rec = Recommendation(
                product_id=prod.id,
                ranked_options=[
                    {"pathway": "resale" if not requires_review else "repair", "score": 92.4, "nrv": round(resale_rev - 450.0, 2)},
                    {"pathway": "repair" if not requires_review else "refurbish", "score": 84.1, "nrv": round(resale_rev * 1.15 - 3200.0, 2)},
                    {"pathway": "refurbish" if not requires_review else "harvest", "score": 76.5, "nrv": round(resale_rev * 1.25 - 4800.0, 2)},
                    {"pathway": "harvest", "score": 62.0, "nrv": round(resale_rev * 0.45 - 650.0, 2)},
                    {"pathway": "recycle", "score": 48.0, "nrv": 200.0}
                ],
                explanation_text=f"AI Decision Engine recommends {'Resale' if not requires_review else 'Repair'} pathway based on high Net Recovery Value (NRV) and low critical risk profile.",
                model_version="v1.0-decision-engine",
                confidence=0.91,
                missing_info=[],
                created_at=datetime.utcnow() - timedelta(days=1)
            )
            await rec.insert()

            # Environmental record
            co2 = 210.0 if prod.category == "laptop" else 65.0
            er = EnvironmentalRecord(
                product_id=prod.id,
                material_recovered_kg=1.85 if prod.category == "laptop" else 0.20,
                co2_saved_kg=co2,
                waste_diverted_kg=2.1 if prod.category == "laptop" else 0.22,
                assumptions_used={"lca_model": "ADEME-2024", "grid_factor": "National Average"}
            )
            await er.insert()

            if prod.status in ["sold", "recycled"]:
                ro = RecoveryOutcome(
                    product_id=prod.id,
                    recommended_pathway="resale" if prod.status == "sold" else "recycle",
                    selected_pathway="resale" if prod.status == "sold" else "recycle",
                    override_reason=None,
                    actual_cost=420.0 if prod.status == "sold" else 240.0,
                    realized_revenue=resale_rev if prod.status == "sold" else 450.0,
                    completion_time_days=4.5,
                    created_at=datetime.utcnow()
                )
                await ro.insert()

    print("⚙️ Seeding Components & Reverse ComponentAuctions...")
    sample_components_data = [
        {"name": "Apple M1 Logic Board 8GB", "tags": ["macbook", "m1", "logicboard"], "cond": "Tested Working", "val": 18500.0, "prod_idx": 1},
        {"name": "Dell XPS 13 4K Touch Display Assembly", "tags": ["dell", "xps", "screen", "4k"], "cond": "Like New", "val": 14000.0, "prod_idx": 0},
        {"name": "ThinkPad T14 Backlit Keyboard & TrackPoint", "tags": ["lenovo", "keyboard", "thinkpad"], "cond": "Working", "val": 3200.0, "prod_idx": 2},
        {"name": "Samsung Galaxy S22 AMOLED Display Panel", "tags": ["samsung", "s22", "oled"], "cond": "Flawless", "val": 8500.0, "prod_idx": 5},
    ]

    reseller = created_users["reseller"]
    repair_user = created_users["repair_partner"]
    recycler_user = created_users["recycler"]

    for sc in sample_components_data:
        comp = Component(
            product_id=created_products[sc["prod_idx"]].id,
            component_name=sc["name"],
            compatibility_tags=sc["tags"],
            condition=sc["cond"],
            test_status="Passed",
            estimated_value=sc["val"],
            status="available",
            created_at=datetime.utcnow() - timedelta(days=3)
        )
        await comp.insert()

        # Create Component Auction with embedded bids
        start_price = round(sc["val"] * 0.80, 2)
        reserve_price = round(sc["val"] * 0.65, 2)
        current_bid = round(sc["val"] * 0.85, 2)
        auction = ComponentAuction(
            component_id=comp.id,
            starting_price=start_price,
            reserve_price=reserve_price,
            current_highest_bid=current_bid,
            current_highest_bidder_id=reseller.id,
            start_time=datetime.utcnow() - timedelta(hours=18),
            end_time=datetime.utcnow() + timedelta(hours=30),
            status="open",
            bids=[
                AuctionBid(bidder_id=repair_user.id, bid_amount=start_price, bid_time=datetime.utcnow() - timedelta(hours=12), status="outbid"),
                AuctionBid(bidder_id=recycler_user.id, bid_amount=round(start_price * 1.04, 2), bid_time=datetime.utcnow() - timedelta(hours=6), status="outbid"),
                AuctionBid(bidder_id=reseller.id, bid_amount=current_bid, bid_time=datetime.utcnow() - timedelta(hours=1), status="active")
            ]
        )
        await auction.insert()

    print("📬 Seeding Pre-demand Enquiries & Auto-Allocations...")
    sample_enquiries = [
        {"cat": "laptop", "max_p": 45000.0, "qty": 2, "urgent": True, "status": "allocated"},
        {"cat": "smartphone", "max_p": 30000.0, "qty": 1, "urgent": False, "status": "waiting"},
        {"cat": "tablet", "max_p": 25000.0, "qty": 3, "urgent": True, "status": "waiting"},
    ]
    for idx, se in enumerate(sample_enquiries):
        enq = Enquiry(
            product_category=se["cat"],
            customer_id=reseller.id if idx == 0 else created_users["customer"].id,
            max_price=se["max_p"],
            quantity_needed=se["qty"],
            urgency_flag=se["urgent"],
            status=se["status"],
            created_at=datetime.utcnow() - timedelta(days=2)
        )
        await enq.insert()

        if se["status"] == "allocated":
            alloc = Allocation(
                enquiry_id=enq.id,
                product_id=created_products[1].id,  # MacBook Air
                allocation_score=94.5,
                status="pending_confirmation",
                reservation_expiry=datetime.utcnow() + timedelta(minutes=28)
            )
            await alloc.insert()

    await close_db()

    print("\n" + "=" * 65)
    print("✨ SEEDING COMPLETE! TEST CREDENTIALS:")
    print("=" * 65)
    for r in roles:
        print(f"Role: {r['role']:<15} | Email: {r['email']:<24} | Password: {r['password']}")
    print("=" * 65 + "\n")

if __name__ == "__main__":
    asyncio.run(seed())
