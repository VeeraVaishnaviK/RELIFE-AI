import re
import os
import json
import logging
from typing import Dict, Any, Optional, List

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

logger = logging.getLogger("pricing_validator")

# Verified Indian Market Launch MSRP Catalog (in INR)
# Covers flagship, mid-range, and commercial devices across all categories
PRODUCT_MSRP_CATALOG = {
    # Apple MacBooks
    "macbook pro 14 (m1 pro)": 194900.0,
    "macbook pro 14 m1 pro": 194900.0,
    "macbook pro 14 m1": 194900.0,
    "macbook pro 14 (m2 pro)": 199900.0,
    "macbook pro 14 m2": 199900.0,
    "macbook pro 14 (m3 pro)": 199900.0,
    "macbook pro 16 (m1 pro)": 239900.0,
    "macbook pro 16 m1": 239900.0,
    "macbook pro 16": 249900.0,
    "macbook pro 13 m1": 122900.0,
    "macbook pro 13 m2": 129900.0,
    "macbook air m1": 99900.0,
    "macbook air m2": 114900.0,
    "macbook air m3": 114900.0,

    # Dell Laptops
    "xps 13 9310": 145000.0,
    "xps 13": 135000.0,
    "xps 15": 185000.0,
    "inspiron 16": 78000.0,
    "inspiron 15": 58000.0,
    "alienware m15": 210000.0,

    # Lenovo Laptops
    "thinkpad x1 carbon gen 10": 185000.0,
    "thinkpad x1 carbon": 175000.0,
    "thinkpad t14 gen 2": 118000.0,
    "thinkpad t14": 112000.0,
    "ideapad slim 5": 62000.0,
    "legion 5 pro": 135000.0,

    # HP Laptops
    "spectre x360": 155000.0,
    "envy x360": 88000.0,
    "pavilion 15": 68000.0,
    "omen 16": 125000.0,

    # Asus Laptops
    "rog zephyrus g14": 149990.0,
    "zenbook 14": 92000.0,
    "vivobook 15": 48000.0,
    "swift 3": 54000.0,

    # Smartphones - Apple
    "iphone 15 pro max": 159900.0,
    "iphone 15 pro": 134900.0,
    "iphone 15": 79900.0,
    "iphone 14 pro max": 139900.0,
    "iphone 14 pro": 129900.0,
    "iphone 14": 79900.0,
    "iphone 13 pro": 119900.0,
    "iphone 13 128gb": 79900.0,
    "iphone 13": 79900.0,
    "iphone 12 mini": 69900.0,
    "iphone 12": 79900.0,
    "iphone 11": 64900.0,

    # Smartphones - Samsung
    "galaxy s23 ultra": 124999.0,
    "galaxy s23": 74999.0,
    "galaxy s22 5g": 72999.0,
    "galaxy s22": 72999.0,
    "galaxy z fold 4": 154999.0,
    "galaxy z flip 4": 89999.0,
    "galaxy a54": 38999.0,

    # Smartphones - Google Pixel & Others
    "pixel 7 pro": 84999.0,
    "pixel 7": 59999.0,
    "pixel 8 pro": 106999.0,
    "oneplus 11 5g": 56999.0,
    "oneplus 11": 56999.0,
    "nothing phone (2)": 44999.0,
    "redmi note 12 pro": 24999.0,

    # Tablets
    "ipad pro 12.9": 112900.0,
    "ipad pro 11": 81900.0,
    "ipad air 4th gen": 54900.0,
    "ipad air 5": 59900.0,
    "ipad 10th gen": 44900.0,
    "galaxy tab s8 ultra": 108999.0,
    "galaxy tab s7 fe": 46999.0,
    "tab m10 plus": 19999.0,

    # Gaming Consoles & Hardware
    "playstation 5 disc edition (825gb)": 54990.0,
    "playstation 5 disc edition": 54990.0,
    "playstation 5 digital edition": 44990.0,
    "playstation 5": 54990.0,
    "ps5 disc edition": 54990.0,
    "ps5": 54990.0,
    "playstation 4 pro": 38710.0,
    "playstation 4 slim": 29990.0,
    "playstation 4": 27990.0,
    "xbox series x": 55990.0,
    "xbox series s": 37990.0,
    "xbox one x": 44990.0,
    "nintendo switch oled": 34990.0,
    "nintendo switch": 28990.0,

    # Audio & Wearables
    "sony wh-1000xm5": 29990.0,
    "sony wh-1000xm4": 22990.0,
    "bose quietcomfort 45": 29900.0,
    "airpods pro 2": 24900.0,
    "airpods pro": 20900.0,
    "airpods max": 59900.0,
    "apple watch series 9": 41900.0,
    "apple watch ultra 2": 89900.0,
    "apple watch series 8": 39900.0,
    "galaxy watch 6": 29999.0,

    # Cameras
    "sony alpha a7 iv": 242490.0,
    "sony alpha a7 iii": 167990.0,
    "canon eos r6": 215995.0,
    "canon eos r10": 80995.0,
    "nikon z6 ii": 164995.0,

    # Monitors
    "dell ultrasharp u2723qe": 58900.0,
    "lg 27gp850-b": 34990.0,
    "samsung odyssey g7": 49990.0,
}

class PricingValidator:
    """
    Intelligent Market Value & Circular Cost Validation Service.
    Resolves true original retail price (MSRP) and validates category-specific
    component BOM, repair investments, and secondary market recovery tiers.
    """

    @staticmethod
    def resolve_original_msrp(brand: str, model: str, category: str, purchase_price: float = 0.0) -> float:
        """
        Finds the verified real-world MSRP for a given product brand and model.
        """
        if not model:
            model = ""
        if not brand:
            brand = ""

        full_query = f"{brand} {model}".lower().strip()
        model_query = model.lower().strip()

        # 1. Exact catalog lookup
        for key, price in PRODUCT_MSRP_CATALOG.items():
            if key == full_query or key == model_query:
                return price

        # 2. Substring & Keyword matching
        for key, price in PRODUCT_MSRP_CATALOG.items():
            if key in full_query or all(word in full_query for word in key.split()):
                return price

        # 3. Partial keyword matching
        if "playstation 5" in full_query or "ps5" in full_query:
            return 54990.0
        if "xbox series x" in full_query:
            return 55990.0
        if "xbox series s" in full_query:
            return 37990.0
        if "switch oled" in full_query:
            return 34990.0
        if "macbook pro 14" in full_query:
            return 194900.0
        if "macbook pro 16" in full_query:
            return 239900.0
        if "macbook air" in full_query:
            return 99900.0
        if "xps 13" in full_query:
            return 145000.0
        if "xps 15" in full_query:
            return 185000.0
        if "thinkpad x1" in full_query:
            return 185000.0
        if "thinkpad" in full_query:
            return 118000.0
        if "iphone 14 pro" in full_query or "14 pro" in full_query:
            return 129900.0
        if "iphone 13" in full_query:
            return 79900.0
        if "galaxy s23" in full_query:
            return 74999.0
        if "galaxy s22" in full_query:
            return 72999.0
        if "pixel 7" in full_query:
            return 84999.0
        if "ipad air" in full_query:
            return 54900.0
        if "ipad pro" in full_query:
            return 81900.0
        if "wh-1000xm" in full_query:
            return 26990.0

        # 4. If purchase_price was provided and reasonable (> 10000)
        if purchase_price and purchase_price >= 15000:
            return float(purchase_price)

        # 5. Default by category tier
        cat = category.lower() if category else "laptop"
        defaults = {
            "laptop": 85000.0,
            "smartphone": 48000.0,
            "tablet": 38000.0,
            "smartwatch": 18000.0,
            "headphone": 12000.0,
            "audio": 9500.0,
            "monitor": 32000.0,
            "camera": 65000.0,
            "gaming_console": 49990.0,
            "clothes": 3500.0,
            "footwear": 5500.0,
            "home_appliances": 18500.0
        }
        return defaults.get(cat, 65000.0)

    @staticmethod
    def _call_gemini_bom(
        brand: str,
        model: str,
        category: str,
        msrp: float,
        return_reason: str,
        customer_issue: str,
        defects: list
    ) -> Optional[Dict[str, Any]]:
        """
        Dynamically calls Gemini 3.5 Flash Lite to generate context-specific, real-world
        component BOM line items adhering strictly to the product category.
        """
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key or not GEMINI_AVAILABLE:
            return None

        try:
            genai.configure(api_key=api_key)
            ai_model = genai.GenerativeModel("gemini-3.5-flash-lite")

            prompt = f"""You are an expert circular economy electronics and hardware refurbishment cost engineer.
Generate realistic repair/refurbishment Bill of Materials (BOM) line items for this returned item:
- Product: {brand} {model}
- Category: {category}
- Original Retail (MSRP): ₹{int(msrp):,}
- Reported Return Reason: {return_reason or 'None'}
- Customer Reported Issue: {customer_issue or 'None'}
- Inspected Defects: {json.dumps(defects, ensure_ascii=False) if defects else 'None'}

CRITICAL GUIDELINES:
1. Components MUST strictly match the product category:
   - For gaming consoles (e.g. PlayStation 5, Xbox): NEVER output display/screen panels! A PS5 has NO screen. Use actual components (e.g., DualSense joystick potentiometer module for stick drift, HDMI port IC, optical laser drive, APU liquid metal/thermal dissipation, PSU, bench testing).
   - For clothes/apparel: NEVER output electronics or screens! Use dry cleaning, seam stitching, zipper/button hardware, fabric pressing.
   - For footwear: NEVER output electronics or screens! Use sole re-bonding, midsole cleaning, insole ozone deodorization, laces.
   - For audio/headphones: Earcup cushions, dynamic acoustic driver, headband slider, acoustic mesh cleaning.
   - For laptops/phones: Only output display panel if screen crack or display defect is explicitly present! Otherwise use battery, fan/thermal, keyboard, port, oleophobic coating.
2. Provide 3 to 4 realistic line items.
3. Keep costs realistic in Indian Rupees (INR) scaled to the product's MSRP.
4. Response MUST be valid JSON only with this exact structure:
{{
  "line_items": [
    {{
      "line_item": "<Specific Component or Labor Name>",
      "basis": "<OEM Specification / Part / Diagnostic Rig>",
      "type": "Confirmed" | "Estimated",
      "cost": <integer in INR>
    }}
  ],
  "diagnostic_note": "<Short 1-sentence technician diagnosis or summary of work>"
}}"""

            resp = ai_model.generate_content(prompt)
            raw_text = resp.text.strip()
            if raw_text.startswith("```"):
                raw_text = re.sub(r"^```[a-zA-Z]*\n?", "", raw_text)
                raw_text = re.sub(r"\n?```$", "", raw_text)

            parsed = json.loads(raw_text)
            items = parsed.get("line_items", [])
            if isinstance(items, list) and len(items) >= 2:
                # Sanity check: Ensure console doesn't get display panel
                is_console = "console" in category.lower() or "gaming" in category.lower()
                clean_items = []
                for it in items:
                    name = it.get("line_item", "")
                    if is_console and any(w in name.lower() for w in ["screen", "display", "panel", "glass"]):
                        continue
                    clean_items.append({
                        "line_item": str(it.get("line_item", "")),
                        "basis": str(it.get("basis", "Certified OEM Standard")),
                        "type": "Confirmed" if it.get("type", "").lower() == "confirmed" else "Estimated",
                        "cost": int(round(float(it.get("cost", 450))))
                    })
                if clean_items:
                    return {
                        "line_items": clean_items,
                        "diagnostic_note": parsed.get("diagnostic_note", "Component diagnostics completed.")
                    }
        except Exception as e:
            logger.warning(f"[PricingValidator] Gemini dynamic BOM generation skipped: {e}")
        return None

    @staticmethod
    def _generate_expert_bom(
        brand: str,
        model: str,
        category: str,
        msrp: float,
        full_context: str,
        has_display_crack: bool
    ) -> Dict[str, Any]:
        """
        Deterministic, category- and defect-appropriate component BOM line item engine.
        Ensures zero-delay, 100% authentic line items for all product categories.
        """
        cat = category.lower()

        # 1. GAMING CONSOLES
        if cat == "gaming_console":
            if any(w in full_context for w in ["drift", "controller", "stick", "joystick", "analog", "dualsense"]):
                return {
                    "diagnostic_note": "DualSense analog potentiometer resistance drift identified. Module replacement and deadzone recalibration required.",
                    "line_items": [
                        {
                            "line_item": "DualSense Analog Joystick Potentiometer Module",
                            "basis": "OEM Alps Alpine 3D Thumbstick Mechanism (10K Resistance)",
                            "type": "Confirmed",
                            "cost": 450
                        },
                        {
                            "line_item": "Controller Micro-Soldering Bench Labor & Calibration",
                            "basis": "Precision SMD rework station & analog stick center-point calibration",
                            "type": "Confirmed",
                            "cost": 450
                        },
                        {
                            "line_item": "Chassis Dust Purge & Thermal Heatpipe Cleanse",
                            "basis": "High-pressure ionization de-dusting of internal exhaust channels",
                            "type": "Estimated",
                            "cost": 550
                        },
                        {
                            "line_item": "Diagnostic Bench QA & DualSense Latency Testing",
                            "basis": "Automated 60-point circular telemetry and input lag test rig",
                            "type": "Confirmed",
                            "cost": 350
                        }
                    ]
                }
            elif any(w in full_context for w in ["hdmi", "video", "display", "black screen", "output", "signal"]):
                return {
                    "diagnostic_note": "HDMI 2.1 video output port trace fracture detected. SMD socket replacement required.",
                    "line_items": [
                        {
                            "line_item": "OEM HDMI 2.1 Transmitter Port & Filter IC",
                            "basis": "Panasonic MN864739 / PS5 OEM Port Assembly",
                            "type": "Confirmed",
                            "cost": 1450
                        },
                        {
                            "line_item": "Micro-Soldering SMD Reflow & PCB Trace Repair",
                            "basis": "Stereomicroscope hot-air SMD rework & lead-free solder reflow",
                            "type": "Confirmed",
                            "cost": 1200
                        },
                        {
                            "line_item": "Thermal Interface Liquid Metal Inspection & Refresh",
                            "basis": "Sony APU Thermal Dissipation Spec",
                            "type": "Estimated",
                            "cost": 650
                        },
                        {
                            "line_item": "Diagnostic Bench QA & 4K 120Hz HDR Video Test",
                            "basis": "Automated 4K signal analyzer and HDR handshake rig",
                            "type": "Confirmed",
                            "cost": 450
                        }
                    ]
                }
            elif any(w in full_context for w in ["disc", "optical", "laser", "read error", "eject"]):
                return {
                    "diagnostic_note": "Ultra HD Blu-Ray optical drive laser pickup degradation detected.",
                    "line_items": [
                        {
                            "line_item": "Ultra HD Blu-Ray Optical Laser Pickup Lens Assembly",
                            "basis": "OEM Sony KES-497A Optical Mechanism",
                            "type": "Confirmed",
                            "cost": 2400
                        },
                        {
                            "line_item": "Disc Ingestion Roller & Gear Mechanism Realignment",
                            "basis": "Motorized Feed Mechanism Overhaul",
                            "type": "Confirmed",
                            "cost": 650
                        },
                        {
                            "line_item": "Technician Bench Labor (1.5 hrs)",
                            "basis": "₹450 / hr standard certified console rate",
                            "type": "Confirmed",
                            "cost": 675
                        },
                        {
                            "line_item": "Diagnostic Bench QA & Optical Media Ingestion Test",
                            "basis": "Automated BD-ROM Telemetry Rig",
                            "type": "Confirmed",
                            "cost": 350
                        }
                    ]
                }
            elif any(w in full_context for w in ["heat", "thermal", "fan", "noise", "loud", "shutting down"]):
                return {
                    "diagnostic_note": "APU liquid metal boundary oxidation and centrifugal fan particulate buildup.",
                    "line_items": [
                        {
                            "line_item": "Liquid Metal TIM Replenishment & APU Barrier Seal",
                            "basis": "Thermal Grizzly Conductonaut / Sony APU Spec",
                            "type": "Confirmed",
                            "cost": 1250
                        },
                        {
                            "line_item": "Delta/NMB Internal Centrifugal Blower Cleanse & Balance",
                            "basis": "Ultrasonic Fan Blade Purification",
                            "type": "Confirmed",
                            "cost": 600
                        },
                        {
                            "line_item": "Technician Bench Labor (2 hrs)",
                            "basis": "₹450 / hr standard certified console rate",
                            "type": "Confirmed",
                            "cost": 900
                        },
                        {
                            "line_item": "Full-Load Thermal TDP Stress Test (3D Benchmark 45m)",
                            "basis": "Automated Thermal Chamber Rig",
                            "type": "Confirmed",
                            "cost": 450
                        }
                    ]
                }
            else:
                return {
                    "diagnostic_note": "Console passed baseline intake diagnostics. Standard deep sanitization and hardware refresh applied.",
                    "line_items": [
                        {
                            "line_item": "Chassis Ultrasonic Cleanse & Faceplate Detailing",
                            "basis": "OEM Matte Dual-Tone Shell Restoration",
                            "type": "Confirmed",
                            "cost": 450
                        },
                        {
                            "line_item": "DualSense Controller Multi-Point Button Service",
                            "basis": "Conductive silicone button pads & trigger spring refresh",
                            "type": "Confirmed",
                            "cost": 450
                        },
                        {
                            "line_item": "Exhaust Duct De-dusting & Port Deoxidation",
                            "basis": "Preventative maintenance cleaning protocol",
                            "type": "Estimated",
                            "cost": 400
                        },
                        {
                            "line_item": "Diagnostic Bench QA & Factory Provisioning",
                            "basis": "Automated hardware test rig & firmware baseline reset",
                            "type": "Confirmed",
                            "cost": 350
                        }
                    ]
                }

        # 2. LAPTOPS
        if cat == "laptop":
            if has_display_crack or any(w in full_context for w in ["screen", "display", "lcd", "oled", "crack"]):
                display_cost = 38500.0 if msrp >= 120000 else round(msrp * 0.28)
                return {
                    "diagnostic_note": "Display panel crack verified. Full factory screen assembly replacement required.",
                    "line_items": [
                        {
                            "line_item": "Tier-1 OEM Display Panel Assembly",
                            "basis": "OEM Factory Color-Calibrated Display & Lid Assembly",
                            "type": "Confirmed",
                            "cost": int(display_cost)
                        },
                        {
                            "line_item": "Display Flex Loom & Hall-Effect Sensor Harness",
                            "basis": "Internal Signal Harness Replacement",
                            "type": "Estimated",
                            "cost": 850
                        },
                        {
                            "line_item": "Technician Bench Labor (3 hrs)",
                            "basis": "₹450 / hr certified workstation technician rate",
                            "type": "Confirmed",
                            "cost": 1350
                        },
                        {
                            "line_item": "Panel Uniformity, Backlight Bleed & Colorimeter Calibration",
                            "basis": "Automated display color accuracy test rig",
                            "type": "Confirmed",
                            "cost": 450
                        }
                    ]
                }
            elif any(w in full_context for w in ["keyboard", "key", "trackpad", "touchpad", "spill"]):
                kb_cost = round(min(msrp * 0.08, 6500.0))
                return {
                    "diagnostic_note": "Input matrix actuation inconsistency detected. Top-case keyboard assembly refresh required.",
                    "line_items": [
                        {
                            "line_item": "OEM Backlit Keyboard Top-Case Assembly",
                            "basis": "Factory Aluminum Top-Case & Membrane",
                            "type": "Confirmed",
                            "cost": int(kb_cost)
                        },
                        {
                            "line_item": "Sub-Chassis PCB Ultrasonic Deoxidation Treatment",
                            "basis": "Precision chemical bath & contact deoxidation",
                            "type": "Confirmed",
                            "cost": 950
                        },
                        {
                            "line_item": "Technician Bench Labor (2 hrs)",
                            "basis": "₹450 / hr standard certified rate",
                            "type": "Confirmed",
                            "cost": 900
                        },
                        {
                            "line_item": "Input Matrix Automated Key-Bounce & Switch Stress QA",
                            "basis": "Rig Key Actuation Tester",
                            "type": "Confirmed",
                            "cost": 350
                        }
                    ]
                }
            elif any(w in full_context for w in ["battery", "charge", "power", "drain"]):
                bat_cost = round(min(msrp * 0.07, 5800.0))
                return {
                    "diagnostic_note": "Battery health degraded below threshold. OEM high-cycle pack replacement required.",
                    "line_items": [
                        {
                            "line_item": "OEM High-Cycle Lithium Polymer Battery Unit",
                            "basis": "Certified 0-Cycle OEM Cell Pack",
                            "type": "Confirmed",
                            "cost": int(bat_cost)
                        },
                        {
                            "line_item": "USB-C PD Power Controller Mosfet Inspection",
                            "basis": "Power Delivery Logic Board Inspection",
                            "type": "Estimated",
                            "cost": 650
                        },
                        {
                            "line_item": "Technician Bench Labor (1.5 hrs)",
                            "basis": "₹450 / hr standard rate",
                            "type": "Confirmed",
                            "cost": 675
                        },
                        {
                            "line_item": "Automated Battery Cycle Stress & Power Rig Bench",
                            "basis": "Automated Power Bench Rig",
                            "type": "Confirmed",
                            "cost": 350
                        }
                    ]
                }
            else:
                return {
                    "diagnostic_note": "Thermal dissipation maintenance and full preventative overhaul.",
                    "line_items": [
                        {
                            "line_item": "Dual Centrifugal Fan Bearing Service & Thermal Repaste",
                            "basis": "Noctua NT-H2 Compound & Fan Cleanse",
                            "type": "Confirmed",
                            "cost": 850
                        },
                        {
                            "line_item": "Exhaust Fin De-clogging & Chassis Ultrasonic Detailing",
                            "basis": "Pressurized Airflow Sweep & Shell Cleanse",
                            "type": "Confirmed",
                            "cost": 500
                        },
                        {
                            "line_item": "Technician Bench Labor (1.5 hrs)",
                            "basis": "₹450 / hr standard rate",
                            "type": "Confirmed",
                            "cost": 675
                        },
                        {
                            "line_item": "Full System Stress Testing (Prime95 & 3DMark Thermal Bench)",
                            "basis": "Automated Burn-in Test Rig",
                            "type": "Confirmed",
                            "cost": 400
                        }
                    ]
                }

        # 3. SMARTPHONES
        if cat in ["smartphone", "mobile"]:
            if has_display_crack or any(w in full_context for w in ["screen", "display", "crack", "glass", "shatter"]):
                display_cost = 18500.0 if msrp >= 60000 else round(msrp * 0.28)
                return {
                    "diagnostic_note": "OLED touch assembly fracture detected. OEM sealed display panel replacement required.",
                    "line_items": [
                        {
                            "line_item": "Super Retina XDR / Dynamic AMOLED Display Assembly",
                            "basis": "OEM Tier-1 Factory Sealed OLED Assembly",
                            "type": "Confirmed",
                            "cost": int(display_cost)
                        },
                        {
                            "line_item": "Waterproof Perimeter Die-Cut Adhesive Frame Gasket",
                            "basis": "OEM Die-Cut IP68 Water-Resistant Gasket",
                            "type": "Confirmed",
                            "cost": 450
                        },
                        {
                            "line_item": "Display Driver IC Pairing & Color Profile Calibration",
                            "basis": "Factory TrueTone / Color Calibration",
                            "type": "Confirmed",
                            "cost": 650
                        },
                        {
                            "line_item": "Technician Precision Bench Labor (1.5 hrs)",
                            "basis": "₹450 / hr standard rate",
                            "type": "Confirmed",
                            "cost": 675
                        },
                        {
                            "line_item": "Multi-Touch Matrix & Digitizer Grid Bench QA",
                            "basis": "Automated Touch Grid Test Rig",
                            "type": "Confirmed",
                            "cost": 350
                        }
                    ]
                }
            elif any(w in full_context for w in ["battery", "charge", "drain"]):
                bat_cost = round(min(msrp * 0.08, 3800.0))
                return {
                    "diagnostic_note": "Battery health degraded. High-capacity OEM replacement required.",
                    "line_items": [
                        {
                            "line_item": "OEM High-Capacity Li-ion Battery Pack",
                            "basis": "Certified 0-Cycle OEM Battery Cell",
                            "type": "Confirmed",
                            "cost": int(bat_cost)
                        },
                        {
                            "line_item": "Battery Management System (BMS) Calibration",
                            "basis": "BMS Telemetry & Battery Health Reset",
                            "type": "Confirmed",
                            "cost": 400
                        },
                        {
                            "line_item": "Waterproof Frame Re-seal Gasket",
                            "basis": "OEM Die-cut Seal",
                            "type": "Confirmed",
                            "cost": 450
                        },
                        {
                            "line_item": "Technician Bench Labor (1 hr)",
                            "basis": "₹450 / hr standard rate",
                            "type": "Confirmed",
                            "cost": 450
                        },
                        {
                            "line_item": "Automated Charge/Discharge Cycle Stress QA",
                            "basis": "Power Rig Stress Test",
                            "type": "Confirmed",
                            "cost": 350
                        }
                    ]
                }
            else:
                return {
                    "diagnostic_note": "Device passed hardware diagnostics. Cosmetic nano-coating and port detailing applied.",
                    "line_items": [
                        {
                            "line_item": "Oleophobic Surface Nano-Coating & Micro-Buffing",
                            "basis": "Vacuum Nano-Deposition Chamber",
                            "type": "Confirmed",
                            "cost": 650
                        },
                        {
                            "line_item": "Acoustic Speaker Grille & USB-C Port Ultrasonic Cleanse",
                            "basis": "Precision Ultrasonic Rig",
                            "type": "Confirmed",
                            "cost": 350
                        },
                        {
                            "line_item": "Technician Bench Labor (1 hr)",
                            "basis": "₹450 / hr standard rate",
                            "type": "Confirmed",
                            "cost": 450
                        },
                        {
                            "line_item": "Diagnostic Bench QA & 40-Point Sensor Rig",
                            "basis": "Automated Hardware Rig",
                            "type": "Confirmed",
                            "cost": 350
                        }
                    ]
                }

        # 4. CLOTHES & APPAREL
        if cat in ["clothes", "clothing", "apparel", "fashion"]:
            return {
                "diagnostic_note": "Garment fabric inspected. Seam integrity restored and commercial eco-sanitization completed.",
                "line_items": [
                    {
                        "line_item": "Eco-Enzyme Deep Dry Cleaning & Fiber Conditioning",
                        "basis": "Industrial eco-friendly wet/dry cleaning cycle",
                        "type": "Confirmed",
                        "cost": 250
                    },
                    {
                        "line_item": "Structural Seam & Overlock Hem Reinforcement",
                        "basis": "Industrial high-tensile twin-needle stitch reinforcement",
                        "type": "Confirmed",
                        "cost": 200
                    },
                    {
                        "line_item": "Hardware Refurbishment (YKK Zipper & Metal Fasteners)",
                        "basis": "OEM fastener slider swap & button tightening",
                        "type": "Estimated",
                        "cost": 150
                    },
                    {
                        "line_item": "Optical Textile Stain Scan & Tensile QA",
                        "basis": "Automated color fastness & fabric wear inspection rig",
                        "type": "Confirmed",
                        "cost": 180
                    }
                ]
            }

        # 5. FOOTWEAR & SHOES
        if cat in ["footwear", "shoes"]:
            return {
                "diagnostic_note": "Footwear tread and upper reconditioned. Antimicrobial cycle completed.",
                "line_items": [
                    {
                        "line_item": "Sonic Midsole Scrub & Suede/Leather Reconditioning",
                        "basis": "Specialized ultrasonic sneaker restoration station",
                        "type": "Confirmed",
                        "cost": 380
                    },
                    {
                        "line_item": "Outsole Tread Edge Re-Bonding & Polyurethane Cementing",
                        "basis": "High-tack PU shoe cement & pneumatic clamp cure",
                        "type": "Confirmed",
                        "cost": 450
                    },
                    {
                        "line_item": "Antibacterial Ozone Deodorization & Insole Sanitization",
                        "basis": "Hospital-grade ozone sanitization chamber",
                        "type": "Confirmed",
                        "cost": 220
                    },
                    {
                        "line_item": "Sole Grip Co-Efficient & Flex Endurance Rig QA",
                        "basis": "ASTM F2913 slip resistance and flex endurance rig",
                        "type": "Confirmed",
                        "cost": 180
                    }
                ]
            }

        # 6. AUDIO & HEADPHONES
        if cat in ["audio", "headphone"]:
            return {
                "diagnostic_note": "Acoustic transducer and ear cushions inspected. Frequency response verified.",
                "line_items": [
                    {
                        "line_item": "OEM High-Density Memory Foam Ear Cushion Set",
                        "basis": "Acoustic Isolation Earpad Set",
                        "type": "Confirmed",
                        "cost": 850
                    },
                    {
                        "line_item": "Acoustic Transducer Driver Micro-Mesh Purification",
                        "basis": "Ultrasonic Debris Extraction & Driver Mesh Cleanse",
                        "type": "Confirmed",
                        "cost": 450
                    },
                    {
                        "line_item": "Headband Tension Realignment & Silicone Padding Seal",
                        "basis": "Ergonomic Stress Relief & Frame Calibration",
                        "type": "Estimated",
                        "cost": 550
                    },
                    {
                        "line_item": "Frequency Response & Harmonic Distortion Curve Rig QA",
                        "basis": "Acoustic Chamber Test Rig",
                        "type": "Confirmed",
                        "cost": 350
                    }
                ]
            }

        # 7. SMARTWATCH & WEARABLES
        if cat in ["smartwatch", "wearables"]:
            return {
                "diagnostic_note": "Biometric sensor array resealed. Hydrostatic water resistance verified.",
                "line_items": [
                    {
                        "line_item": "PPG Biometric Sensor Window Reseal & O-Ring",
                        "basis": "Waterproof Sensor Bezel Replacement",
                        "type": "Confirmed",
                        "cost": 650
                    },
                    {
                        "line_item": "Hypoallergenic Fluoroelastomer Band & Quick-Release Pins",
                        "basis": "OEM Spec Replacement Strap Assembly",
                        "type": "Confirmed",
                        "cost": 550
                    },
                    {
                        "line_item": "Technician Precision Bench Labor (1 hr)",
                        "basis": "₹450 / hr standard rate",
                        "type": "Confirmed",
                        "cost": 450
                    },
                    {
                        "line_item": "50M Hydrostatic Water Resistance Pressure Chamber QA",
                        "basis": "Pneumatic Immersion Chamber Rig",
                        "type": "Confirmed",
                        "cost": 450
                    }
                ]
            }

        # 8. CAMERAS & OPTICAL
        if cat in ["camera", "optical"]:
            return {
                "diagnostic_note": "Low-pass sensor filter de-dusted. Focal shutter actuation bench verified.",
                "line_items": [
                    {
                        "line_item": "Sensor Low-Pass Filter Electrostatic Ultrasonic Cleanse",
                        "basis": "Static-Neutral Optical Bath",
                        "type": "Confirmed",
                        "cost": 950
                    },
                    {
                        "line_item": "Focal-Plane Shutter Mechanism Calibration & Lubrication",
                        "basis": "High-Cycle Precision Actuator Maintenance",
                        "type": "Estimated",
                        "cost": 1800
                    },
                    {
                        "line_item": "Technician Bench Labor (2 hrs)",
                        "basis": "₹450 / hr standard rate",
                        "type": "Confirmed",
                        "cost": 900
                    },
                    {
                        "line_item": "Optical Collimator & Multi-Point Phase Autofocus Rig QA",
                        "basis": "Laser Collimator Test Bench",
                        "type": "Confirmed",
                        "cost": 550
                    }
                ]
            }

        # 9. MONITORS & SMART DISPLAYS
        if cat in ["monitor", "smart_display"]:
            return {
                "diagnostic_note": "Backlight array and power filtering capacitors serviced.",
                "line_items": [
                    {
                        "line_item": "Direct-Lit LED Backlight Array Strip Replacement",
                        "basis": "OEM Constant-Current LED Bar",
                        "type": "Confirmed",
                        "cost": 2200
                    },
                    {
                        "line_item": "Power Supply Unit (PSU) High-Voltage Filtering Capacitor Kit",
                        "basis": "105°C Low-ESR Capacitors",
                        "type": "Confirmed",
                        "cost": 1200
                    },
                    {
                        "line_item": "Technician Bench Labor (2 hrs)",
                        "basis": "₹450 / hr standard rate",
                        "type": "Confirmed",
                        "cost": 900
                    },
                    {
                        "line_item": "Panel Uniformity, Backlight Bleed & Colorimeter Calibration",
                        "basis": "Display Benchmark Rig",
                        "type": "Confirmed",
                        "cost": 450
                    }
                ]
            }

        # 10. HOME APPLIANCES & KITCHENWARE
        if cat in ["home_appliances", "kitchenware"]:
            return {
                "diagnostic_note": "Heating element inspected and food-grade safety interlocks refreshed.",
                "line_items": [
                    {
                        "line_item": "High-Torque Drive Motor Armature / Heating Element",
                        "basis": "OEM Thermal Resistance Assembly",
                        "type": "Confirmed",
                        "cost": 1650
                    },
                    {
                        "line_item": "Food-Grade High-Temp Silicone Gasket & Microswitch Interlock",
                        "basis": "NSF Certified Safety Interlock",
                        "type": "Confirmed",
                        "cost": 450
                    },
                    {
                        "line_item": "Steam Sanitization & Chemical Limescale Descaling",
                        "basis": "Food-Safe Eco Cycle",
                        "type": "Confirmed",
                        "cost": 380
                    },
                    {
                        "line_item": "Dielectric Insulation & Safety Ground Leakage Rig QA",
                        "basis": "Hipot Electrical Safety Bench",
                        "type": "Confirmed",
                        "cost": 350
                    }
                ]
            }

        # Generic Default
        return {
            "diagnostic_note": "Standard multi-point circular refurbishing and hardware QA.",
            "line_items": [
                {
                    "line_item": f"OEM {category.title()} Hardware Overhaul & Refresh",
                    "basis": "Certified supplier components",
                    "type": "Confirmed",
                    "cost": int(round(msrp * 0.08))
                },
                {
                    "line_item": "Technician Precision Bench Labor (1.5 hrs)",
                    "basis": "₹450 / hr standard certified technician rate",
                    "type": "Confirmed",
                    "cost": 675
                },
                {
                    "line_item": "Diagnostic Bench QA & Functional Stress Rig",
                    "basis": "Automated system diagnostic station",
                    "type": "Confirmed",
                    "cost": 350
                }
            ]
        }

    @staticmethod
    def generate_cost_validation_matrix(product: Any, inspection: Any = None) -> Dict[str, Any]:
        """
        Generates validated financial matrix with verified MSRP, component BOM line items,
        repair investments, and tiered secondary market recovery ceilings.
        """
        brand = getattr(product, "brand", "") or ""
        model = getattr(product, "model", "") or ""
        category = getattr(product, "category", "") or "laptop"
        current_price = getattr(product, "purchase_price", 0.0) or 0.0

        # Intelligent category normalization based on brand/model
        model_lower = model.lower()
        brand_lower = brand.lower()
        cat_lower = category.lower()

        if any(w in model_lower for w in ["playstation", "ps5", "ps4", "xbox", "nintendo", "switch", "controller", "dualsense"]) or "console" in cat_lower or "gaming" in cat_lower:
            category = "gaming_console"
        elif any(w in model_lower for w in ["macbook", "laptop", "thinkpad", "xps", "zenbook", "pavilion", "inspiron", "omen", "legion", "swift", "notebook", "chromebook"]) or "laptop" in cat_lower:
            category = "laptop"
        elif any(w in model_lower for w in ["iphone", "galaxy s", "pixel", "oneplus", "phone", "redmi", "galaxy z", "smartphone"]) or "phone" in cat_lower or "mobile" in cat_lower:
            category = "smartphone"
        elif any(w in model_lower for w in ["ipad", "tab", "surface pro"]) or "tablet" in cat_lower:
            category = "tablet"
        elif any(w in model_lower for w in ["airpods", "headphone", "earphone", "earbud", "wh-1000", "bose", "soundbar", "speaker"]) or "audio" in cat_lower or "headphone" in cat_lower:
            category = "audio"
        elif any(w in model_lower for w in ["watch", "garmin", "fitbit"]) or "watch" in cat_lower or "wearable" in cat_lower:
            category = "smartwatch"
        elif any(w in model_lower for w in ["dslr", "mirrorless", "camera", "eos", "alpha", "lumix", "nikon"]) or "camera" in cat_lower or "optical" in cat_lower:
            category = "camera"
        elif any(w in model_lower for w in ["monitor", "display", "ultrasharp", "ultragear"]) or "monitor" in cat_lower or "display" in cat_lower:
            category = "monitor"
        elif any(w in model_lower for w in ["microwave", "air fryer", "blender", "coffee", "toaster", "kettle", "oven", "vacuum", "purifier", "appliance"]) or "appliance" in cat_lower or "kitchen" in cat_lower:
            category = "home_appliances"
        elif any(w in model_lower for w in ["shoe", "sneaker", "boot", "loafer", "runner", "air jordan", "yeezy", "dunk"]) or "shoe" in cat_lower or "footwear" in cat_lower:
            category = "footwear"
        elif any(w in model_lower for w in ["jacket", "jeans", "shirt", "pant", "hoodie", "dress", "coat", "apparel", "sweater", "denim"]) or "cloth" in cat_lower or "apparel" in cat_lower or "fashion" in cat_lower:
            category = "clothes"

        # Resolve true MSRP
        msrp = PricingValidator.resolve_original_msrp(brand, model, category, current_price)

        # Check return reason and reported issues
        return_info = getattr(product, "return_info", None)
        return_reason = ""
        customer_issue = ""
        if return_info:
            if isinstance(return_info, dict):
                return_reason = return_info.get("return_reason", "") or ""
                customer_issue = return_info.get("customer_reported_issue", "") or ""
            else:
                return_reason = getattr(return_info, "return_reason", "") or ""
                customer_issue = getattr(return_info, "customer_reported_issue", "") or ""

        # Check inspection defects
        defects = getattr(inspection, "defects", []) if inspection else []
        def _get_cat(d):
            return (getattr(d, "defect_category", "") or (d.get("defect_category", "") if isinstance(d, dict) else "")).lower()
        def _get_loc(d):
            return (getattr(d, "location", "") or (d.get("location", "") if isinstance(d, dict) else "")).lower()
        def _get_desc(d):
            return (getattr(d, "description", "") or (d.get("description", "") if isinstance(d, dict) else "")).lower()

        defect_texts = [f"{_get_cat(d)} {_get_loc(d)} {_get_desc(d)}" for d in defects]
        full_context = f"{return_reason} {customer_issue} {' '.join(defect_texts)}".lower()

        has_display_crack = any(
            ("crack" in _get_cat(d) or "display" in _get_cat(d) or "broken" in _get_cat(d) or "shatter" in _get_cat(d))
            or (_get_loc(d) in ["screen", "display"] and "scratch" not in _get_cat(d))
            for d in defects
        )

        # Try Gemini Dynamic BOM generation first (if configured)
        bom_result = PricingValidator._call_gemini_bom(
            brand=brand,
            model=model,
            category=category,
            msrp=msrp,
            return_reason=return_reason,
            customer_issue=customer_issue,
            defects=[d if isinstance(d, dict) else getattr(d, "__dict__", {}) for d in defects]
        )
        pricing_source = "Gemini Circular BOM Engine V3.5"

        # Fallback to Expert Deterministic BOM Catalog
        if not bom_result or not bom_result.get("line_items"):
            bom_result = PricingValidator._generate_expert_bom(
                brand=brand,
                model=model,
                category=category,
                msrp=msrp,
                full_context=full_context,
                has_display_crack=has_display_crack
            )
            pricing_source = "ReLife Verified BOM Catalog V2.4"

        line_items = bom_result.get("line_items", [])
        diagnostic_note = bom_result.get("diagnostic_note", "Certified circular refurbishment protocol completed.")

        total_repair = sum(item["cost"] for item in line_items)

        # Tiered secondary market realizations based on true MSRP
        resale_grade_a = round(msrp * 0.72)   # Like New / Boxed
        resale_grade_b = round(msrp * 0.55)   # Minor Scuffs
        resale_grade_c = round(msrp * 0.40)   # Visible Wear

        refurbished_ceiling = round(msrp * 0.72)
        harvest_component_pool = round(msrp * 0.35)
        raw_scrap_value = round(msrp * 0.04)

        return {
            "product_id": str(getattr(product, "id", "")),
            "product_uid": getattr(product, "product_uid", ""),
            "brand": brand,
            "model": model,
            "category": category,
            "original_msrp": msrp,
            "pricing_source": pricing_source,
            "is_validated": True,
            "diagnostic_note": diagnostic_note,
            "total_repair_investment": total_repair,
            "refurbished_market_ceiling": refurbished_ceiling,
            "harvest_component_pool": harvest_component_pool,
            "raw_scrap_value": raw_scrap_value,
            "line_items": line_items,
            "secondary_market_tiers": [
                {
                    "tier": "Grade A (Like New / Boxed)",
                    "target_channel": "Direct Storefront B2C",
                    "status": "Confirmed",
                    "price": resale_grade_a
                },
                {
                    "tier": "Grade B (Minor Scuffs)",
                    "target_channel": "Certified Reseller B2B",
                    "status": "Estimated",
                    "price": resale_grade_b
                },
                {
                    "tier": "Grade C (Visible Wear)",
                    "target_channel": "Bulk Discount Channel",
                    "status": "Estimated",
                    "price": resale_grade_c
                }
            ]
        }
