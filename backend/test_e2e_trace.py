import requests
import json
import os
import sys

BASE_URL = "http://127.0.0.1:8000"
API_URL = f"{BASE_URL}/api"

def print_step(title):
    print("\n" + "="*70)
    print(f"🔹 {title}")
    print("="*70)

def run_e2e_test():
    print("🚀 STARTING RELIFE AI FULL END-TO-END BACKEND API TRACE\n")

    # 1. Health check & Swagger Docs
    print_step("1. Health Check & OpenAPI Docs")
    r = requests.get(f"{API_URL}/health")
    assert r.status_code == 200, f"Health check failed: {r.text}"
    print(f"✅ Health Check Status: {r.json()}")

    r = requests.get(f"{BASE_URL}/openapi.json")
    assert r.status_code == 200, "OpenAPI docs not found"
    openapi = r.json()
    print(f"✅ OpenAPI Schema generated with {len(openapi.get('paths', {}))} endpoints documented")

    # 2. Login as Inspector
    print_step("2. Login (Inspector Role)")
    login_payload = {
        "email": "inspector@relife.ai",
        "password": "Inspector@123"
    }
    r = requests.post(f"{API_URL}/auth/login", json=login_payload)
    assert r.status_code == 200, f"Login failed: {r.text}"
    auth_data = r.json()
    token = auth_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"✅ Inspector Login successful: {auth_data['user']['name']} ({auth_data['user']['role']})")

    # 3. Register New Returned Product
    print_step("3. Register Product & Generate QR Code")
    prod_payload = {
        "brand": "Lenovo",
        "model": "ThinkPad X1 Carbon Gen 10",
        "category": "laptop",
        "age_months": 7,
        "purchase_price": 115000.0,
        "return_reason": "Customer trade-in with suspected screen crack",
        "customer_reported_issue": "Fissure on glass display, turns on normally",
        "warranty_status": "In Warranty"
    }
    r = requests.post(f"{API_URL}/products", json=prod_payload, headers=headers)
    assert r.status_code == 201, f"Product creation failed: {r.text}"
    product = r.json()
    product_id = product["_id"]
    product_uid = product["product_uid"]
    has_qr = bool(product.get("qr_code_base64"))
    print(f"✅ Product registered: UID={product_uid} | ID={product_id} | QR Present={has_qr}")

    # 4. Upload Inspection Image & Run Real YOLOv8 Computer Vision Defect Detection
    print_step("4. Upload Image & Run Real CV Defect Detection")
    test_image_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "ml", "dataset", "test", "images")
    import glob
    test_images = sorted(glob.glob(os.path.join(test_image_path, "*.jpg")))
    assert len(test_images) > 0, "No test images found"
    sample_img = test_images[0]

    with open(sample_img, "rb") as f:
        files = {"image": ("test_defect.jpg", f, "image/jpeg")}
        data = {"product_id": product_id}
        r = requests.post(f"{API_URL}/inspections/upload-image", files=files, data=data, headers=headers)
    assert r.status_code == 200, f"Inspection upload failed: {r.text}"
    insp_result = r.json()
    print(f"✅ Image Preprocessed & Inspected:")
    print(f"   Quality Pass: {insp_result['quality_check']['pass_quality']} (Blur Var: {insp_result['quality_check']['blur']['score']})")
    print(f"   Defects Detected: {len(insp_result['defects'])}")
    for d in insp_result['defects']:
        print(f"     - Category: {d['defect_category']:<15} | Severity: {d['severity_estimate']:<6} | Conf: {d['detection_confidence']:.2f} | BBox: {d['bounding_box']}")
    print(f"   Overall Confidence: {insp_result['overall_confidence']:.2f}")
    print(f"   Requires Human Review: {insp_result['requires_human_review']}")

    # 5. Get Valuation
    print_step("5. Valuation Engine Analysis")
    r = requests.get(f"{API_URL}/valuation/{product_id}")
    assert r.status_code == 200, f"Valuation failed: {r.text}"
    val_data = r.json()
    print(f"✅ Valuation Benchmark computed:")
    print(f"   Base Price: ₹{val_data['valuation']['base_market_price']:,.2f}")
    print(f"   Condition Multiplier: {val_data['valuation']['condition_multiplier']}")
    print(f"   Projected Revenues: {val_data['valuation']['projected_revenues']}")

    # 6. Estimate Recovery Costs Across All 5 Pathways
    print_step("6. Cost Engine Estimation (All 5 Pathways)")
    r = requests.post(f"{API_URL}/costs/estimate/{product_id}", headers=headers)
    assert r.status_code == 200, f"Cost estimate failed: {r.text}"
    cost_data = r.json()
    print(f"✅ Costs Estimated for 5 Pathways:")
    for opt in cost_data["options"]:
        print(f"   Pathway: {opt['pathway']:<10} | Cost: ₹{opt['estimated_total_cost']:>8,.2f} | Rev: ₹{opt['expected_revenue']:>9,.2f} | NRV: ₹{opt['net_recovery_value']:>9,.2f}")

    # 7. Five-Pathway Decision Engine Ranking & Explanation
    print_step("7. Multi-Criteria Decision Engine Evaluation")
    decision_payload = {
        "profit_weight": 0.40,
        "env_weight": 0.30,
        "speed_weight": 0.15,
        "risk_weight": 0.15
    }
    r = requests.post(f"{API_URL}/decisions/evaluate/{product_id}", json=decision_payload, headers=headers)
    assert r.status_code == 200, f"Decision evaluation failed: {r.text}"
    decision = r.json()
    print(f"✅ Decision Engine Recommendation:")
    print(f"   Winning Pathway: {decision['recommended_pathway'].upper()} (Score: {decision['top_composite_score']}/100)")
    print(f"   Explanation: {decision['explanation']}")
    print(f"   Ranked Pathways:")
    for idx, opt in enumerate(decision['ranked_options']):
        print(f"     #{idx+1} {opt['pathway']:<10} | Score: {opt['composite_score']:>5.1f} | NRV: ₹{opt['net_recovery_value']:>9,.2f} | Feasible: {opt['feasibility_flag']}")

    # 8. Human Review Queue Check & Resolve
    print_step("8. Human Review Queue Workflow")
    r = requests.get(f"{API_URL}/review-queue", headers=headers)
    assert r.status_code == 200, f"Review queue list failed: {r.text}"
    queue_data = r.json()
    print(f"✅ Items in Review Queue: {queue_data['total_queued']}")
    target_item = next((item for item in queue_data["queue"] if item["product_id"] == product_id), None)
    if target_item:
        print(f"   Resolving queued item for product {product_uid}...")
        resolve_payload = {
            "reviewer_notes": "Senior inspector confirmed defect severity is moderate; approved for repair dispatch.",
            "selected_pathway": "repair"
        }
        r = requests.post(f"{API_URL}/review-queue/{target_item['inspection_id']}/resolve", json=resolve_payload, headers=headers)
        assert r.status_code == 200, f"Resolve review failed: {r.text}"
        print(f"✅ Successfully resolved flagged inspection!")
    else:
        print(f"   Product {product_uid} did not require human review (confidence was high).")

    # 9. Trust Score & Digital Recovery Passport
    print_step("9. Digital Product Passport Trust Score")
    r = requests.get(f"{API_URL}/trust-score/{product_id}")
    assert r.status_code == 200, f"Trust score failed: {r.text}"
    ts_data = r.json()
    print(f"✅ Calibrated Trust Score: {ts_data['trust_score']}/100")
    print(f"   Breakdown: {ts_data['score_breakdown']}")

    # 10. Voice-to-Defect NLP Parser
    print_step("10. Voice Inspection Natural Language Parser")
    voice_payload = {
        "raw_transcript": "Found severe hairline crack on the screen glass and minor scratch on bottom casing lid"
    }
    r = requests.post(f"{API_URL}/voice-inspection/parse", json=voice_payload, headers=headers)
    assert r.status_code == 200, f"Voice parse failed: {r.text}"
    v_result = r.json()["parsed_output"]
    print(f"✅ Voice Transcript: '{v_result['raw_transcript']}'")
    print(f"   Extracted Defects: {len(v_result['defects'])}")
    for d in v_result["defects"]:
        print(f"     - {d['severity_estimate'].upper()} {d['defect_category']} on {d['location']} (matched phrase: '{d['source_phrase']}')")

    # 11. Component Reverse Auction Flow
    print_step("11. Component Reverse Auction & Bidding")
    r = requests.get(f"{API_URL}/auctions/active")
    assert r.status_code == 200, f"Active auctions fetch failed: {r.text}"
    active_auctions = r.json()["auctions"]
    assert len(active_auctions) > 0, "No active auctions found"
    target_auction = active_auctions[0]["auction"]
    target_comp = active_auctions[0]["component"]
    auction_id = target_auction["_id"]
    current_high_bid = target_auction["current_highest_bid"]

    print(f"   Active Auction ID: {auction_id} | Component: {target_comp['component_name']} | Current Bid: ₹{current_high_bid:,.2f}")
    
    # Place higher bid as Reseller
    reseller_login = requests.post(f"{API_URL}/auth/login", json={"email": "reseller@relife.ai", "password": "Reseller@123"}).json()
    reseller_headers = {"Authorization": f"Bearer {reseller_login['access_token']}"}
    
    new_bid_amount = current_high_bid + 250.0
    r = requests.post(f"{API_URL}/auctions/{auction_id}/bid", json={"bid_amount": new_bid_amount}, headers=reseller_headers)
    assert r.status_code == 200, f"Bid failed: {r.text}"
    bid_res = r.json()
    print(f"✅ Bid Placed Successfully: New High Bid = ₹{bid_res['current_highest_bid']:,.2f} | Anti-Sniping Extended = {bid_res['anti_sniping_extended']}")

    # 12. Pre-Demand Auto-Allocation Flow
    print_step("12. Pre-Demand Auto-Allocation Engine")
    enquiry_payload = {
        "product_category": "laptop",
        "max_price": 75000.0,
        "quantity_needed": 1,
        "urgency_flag": True
    }
    r = requests.post(f"{API_URL}/enquiries", json=enquiry_payload, headers=reseller_headers)
    assert r.status_code == 201, f"Enquiry creation failed: {r.text}"
    new_enquiry = r.json()
    print(f"✅ Buyer Enquiry Created: ID={new_enquiry['_id']} | Category={new_enquiry['product_category']} | Max Price=₹{new_enquiry['max_price']:,.2f}")

    r = requests.get(f"{API_URL}/allocations/my", headers=reseller_headers)
    assert r.status_code == 200, f"Get allocations failed: {r.text}"
    my_allocations = r.json()["allocations"]
    print(f"✅ My Active Allocations: {len(my_allocations)}")
    if my_allocations:
        first_alloc = my_allocations[0]["allocation"]
        print(f"   Confirming allocation {first_alloc['_id']} (Score: {first_alloc['allocation_score']})...")
        r = requests.post(f"{API_URL}/allocations/{first_alloc['_id']}/confirm", headers=reseller_headers)
        assert r.status_code == 200, f"Confirm allocation failed: {r.text}"
        print(f"✅ Allocation Confirmed! Product reserved and sold.")

    # 13. ROI Calculator Engine
    print_step("13. Enterprise ROI Calculator")
    roi_payload = {
        "monthly_returns": 800.0,
        "avg_product_value": 42000.0,
        "current_disposal_rate": 0.45,
        "manual_inspection_cost": 500.0,
        "repair_success_rate": 0.60
    }
    r = requests.post(f"{API_URL}/roi-calculator/compute", json=roi_payload)
    assert r.status_code == 200, f"ROI computation failed: {r.text}"
    roi_res = r.json()["results"]
    print(f"✅ Enterprise ROI Model:")
    print(f"   Annual Value Recovered: ₹{roi_res['annual_value_recovered']:,.2f}")
    print(f"   Annual Cost Saved:      ₹{roi_res['annual_cost_saved']:,.2f}")
    print(f"   Annual CO2 Avoided:     {roi_res['annual_co2_saved_tons']} metric tons")
    print(f"   Total Economic Impact:  ₹{roi_res['total_annual_economic_benefit']:,.2f} ({roi_res['estimated_roi_multiple']} ROI)")
    print(f"   Recovery Rate Lift:     {roi_res['recovery_rate']['before_relife_pct']}% ➡️ {roi_res['recovery_rate']['after_relife_pct']}% (+{roi_res['recovery_rate']['net_lift_pct']}%)")

    # 14. Outcomes & Analytics Aggregation
    print_step("14. Outcomes Tracking & Analytics Aggregation")
    outcome_payload = {
        "product_id": product_id,
        "recommended_pathway": decision["recommended_pathway"],
        "selected_pathway": decision["recommended_pathway"],
        "override_reason": None,
        "actual_cost": 2800.0,
        "realized_revenue": 72000.0,
        "completion_time_days": 4.0
    }
    r = requests.post(f"{API_URL}/outcomes", json=outcome_payload, headers=headers)
    assert r.status_code == 201, f"Outcome creation failed: {r.text}"
    
    r = requests.get(f"{API_URL}/outcomes/analytics")
    assert r.status_code == 200, f"Outcome analytics failed: {r.text}"
    analytics = r.json()
    print(f"✅ Prediction vs Actual Analytics:")
    print(f"   Total Processed: {analytics['analytics_summary']['total_outcomes']}")
    print(f"   Total Realized Revenue: ₹{analytics['analytics_summary']['total_actual_revenue']:,.2f}")
    print(f"   Pathway Adherence: {analytics['pathway_adherence_rate_pct']}%")

    print("\n" + "="*70)
    print("🎉 FULL END-TO-END TRACE COMPLETED WITH ZERO ERRORS!")
    print("="*70 + "\n")

if __name__ == "__main__":
    run_e2e_test()
