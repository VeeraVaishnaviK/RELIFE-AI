# 🎬 ReLife AI — Official Live Judging Demo Script

This document details the exact, step-by-step click-path to demonstrate the full capabilities of **ReLife AI** in front of judges in 5-7 minutes.

---

## ⚡ Fast Demo Access Credentials

| Role | Email | Password | Primary Demo Screen |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@relife.ai` | `Admin@123` | Executive Dashboard & 5-Pathway Decision Engine |
| **Inspector** | `inspector@relife.ai` | `Inspector@123` | AR Guided Capture & Vision Diagnosis |
| **Reseller** | `reseller@relife.ai` | `Reseller@123` | Reverse Component Auctions & Allocations |
| **Consumer** | `customer@relife.ai` | `Customer@123` | Storefront & Instant Device Trade-In |
| **Repair Partner** | `repair@relife.ai` | `Repair@123` | Diagnostic Repair Bench Tickets |
| **Recycler** | `recycler@relife.ai` | `Recycler@123` | Scrap & E-Waste Recovery Auctions |

> **Tip for Judges**: The `/login` page features **1-Click Quick-Fill Demo buttons** for all 6 roles.

---

## 📍 Step-by-Step Live Judging Walkthrough

### Step 1: Public Marketing Landing Page (`/`)
1. Open `http://localhost:3000`.
2. **Highlight to Judges**:
   - Clean enterprise SaaS aesthetic with generous whitespace, forest green primary brand (#16A34A), and deep slate navy typography.
   - Interactive hero product mockup showing live YOLOv8 mAP metrics and 5-pathway decision breakdown.
   - 4-step circular recovery workflow (QR Intake → CV Defect Diagnosis → 5-Pathway Engine → Reverse Marketplaces).
3. Click **"Sign In"** or **"Launch Inspection Camera"**.

---

### Step 2: Inspector Sign-In & Product Intake (`/inspector/products/new`)
1. Log in using the **Inspector** 1-click pill (`inspector@relife.ai`).
2. Complete the **Asset Intake Manifest**:
   - Category: `Laptop / Ultrabook`
   - Manufacturer: `Apple`
   - Model: `MacBook Pro 14 (M1 Pro)`
   - MSRP: `₹149,900`
   - Stated Reason: `Minor screen scratch and sticky spacebar key`
3. Click **"Register Unit & Generate QR Passport"**.
4. **Show Judges**: The instant, serialized cryptographic QR Code rendered in real-time (`qrcode.react`).
5. Click **"Launch Vision Inspection"**.

---

### Step 3: AR-Guided Capture & Defect Detection (`/inspector/inspections/[productId]`)
1. **Guided Capture Experience**:
   - Note the translucent overlay viewfinder frames per device angle (`Display Panel`, `Keyboard & Palmrest`, `Hinge & Frame`, `Bottom Casing`).
   - Automated client-side blur check alerts technicians if lighting is suboptimal.
2. Click **"Capture Photo / Upload Image"** or select a sample image.
3. Click **"Analyze with YOLOv8 Vision"**:
   - The `<canvas>` overlay instantly renders colored bounding boxes with calibrated confidence percentages.
   - Distinct color-coded pills: **Green** (≥80% confidence), **Amber** (50-80%), **Red** (<50%).
4. **Demonstrate Voice-to-Defect Logger (`VoiceInspectionInput`)**:
   - Click the prominent **"Start Dictation"** button (pulses red while recording).
   - Dictate or click any preset chip: *"Noticeable dent on rear aluminium edge, keyboard spacebar is sticky and missing keycap"*.
   - Click **"Parse NLP Defects"** — NLP instantly extracts structured defect entities with location and severity tags.
5. Complete the **Hardware Diagnostics**:
   - Toggle Power Boot, Display Panel, Touchpad, Audio.
   - Adjust the **Battery Health Capacity slider** to `88%`.
6. Click **"Proceed to Cost & Valuation"**.

---

### Step 4: Cost & Valuation Matrix (`/inspector/inspections/[productId]/costs`)
1. **Show Judges**:
   - Comparison between **Estimated** vs **Confirmed** badges.
   - Component Repair BOM (OEM Display panel + 3 technician bench hours at ₹450/hr).
   - Secondary market price tiers: Grade A (₹64,728), Grade B, Grade C, Component Harvest lot, and E-Waste scrap value.
2. Click **"Launch 5-Pathway Decision Engine"**.

---

### Step 5: 🌟 FLAGSHIP SCREEN — 5-Pathway Decision Dashboard (`/admin/products/[productId]/decision`)
1. **5 Pathway Cards in Responsive Grid**:
   - `Direct Resale`
   - `Targeted Repair & Resale`
   - `Certified Deep Refurbishment`
   - `Component Harvesting & B2B Auction`
   - `Compliance Scrap & Material Recovery`
2. **Winning Pathway Highlight**:
   - Highlighted with green glowing border and an emerald **"Recommended Choice"** ribbon badge.
   - Shows Net Recovery Value (NRV), ADEME avoided CO2 emissions, cycle turnaround days, and risk tier.
3. Click the chevron on any card to reveal the **full cost/revenue/LCA breakdown**.
4. **What-If Decision Simulator**:
   - Live-adjust the sliders: **Profit Weight**, **Environmental Weight**, **Turnaround Speed**, **Risk Tolerance**.
   - **Show Judges**: Watch the pathway cards smoothly animate and re-order in real time via **Framer Motion**!
5. **Interactive AI Decision Explainer Chatbot**:
   - Click the **"Ask AI Why"** floating bubble in the bottom-right corner.
   - Click prompt chips or type *"Why was this winning pathway chosen?"* or *"What is the CO2 difference?"*
   - Chatbot answers with exact contextual reasoning from the recommendation explanation data.
6. Click **"Approve Pathway"** (commits the circular decision to database).

---

### Step 6: Human Review Queue (`/admin/review-queue`)
1. Open the **Human Review Queue** from the navigation.
2. Explain to judges how borderline confidence cases (<65%) or test sensor conflicts are automatically escalated for human technician arbitration.
3. Click **"Resolve Case"** on a flagged item.
4. Show the resolution modal: choose *"Confirm Defect & Approve"* or *"Dismiss False Positive"*, enter technician remarks, and commit with confirmation toast.

---

### Step 7: Analytics Dashboard & ESG Scorecard
1. Navigate to `/admin/analytics`:
   - Interactive Recharts bar chart comparing **Recovery Revenue vs Repair Cost**.
   - Pathway distribution donut chart.
   - Hardware category efficiency metrics.
2. Click **"ESG Circularity Scorecard"** (`/admin/analytics/environmental`):
   - Large hero circularity scorecard designed like an annual ESG corporate sustainability report.
   - Real-world carbon equivalencies: **842 Trees planted for 10 years**, **45,800 passenger car miles averted**, **22.4 MWh clean energy conserved**.
   - Verified against ISO 14040/14044 and ADEME Base Empreinte LCA standards.

---

### Step 8: Reseller Marketplace & Reverse Dutch Auctions (`/reseller/marketplace`)
1. Log in as **Reseller** (`reseller@relife.ai`).
2. Show the **AuctionCard grid**:
   - Live countdown clocks that shift to **pulsing red** as time runs below 5 minutes.
   - Current leading bid, activity trend, and condition pills.
3. Click **"Place Outbid"**:
   - Bid modal validates minimum increment in real-time.
   - Place a bid: note the green card flash animation upon submission.
4. Open `/reseller/allocations`:
   - Show pre-demand matched devices held for 24 hours.
   - Click **"Confirm & Purchase"** to lock inventory.

---

### Step 9: Public Ecommerce Storefront (`/store`)
1. Open the public storefront (no login required).
2. Filter by Category (`Laptops`, `Smartphones`) and Condition Grade.
3. Notice the circular **Trust Score progress ring (e.g. 94/100)** on every device card.
4. Click **"Digital Passport"** on any product:
   - Displays the cryptographic chain-of-custody timeline: Intake → YOLOv8 vision scan → repairs performed → battery test results → warranty.
5. Click **"Set Stock Alerts"** and submit email for instant drop notifications.

---

### Step 10: Instant Customer Trade-In (`/store/trade-in`)
1. Click **"Trade-In Your Device"**.
2. Select device specs (e.g. `Apple MacBook Air M1, 256GB`).
3. Complete the guided camera scan.
4. **Grand Finale**: A celebratory card pops up with a burst of **confetti animation (`canvas-confetti`)**, locking an instant cash trade-in payout with transparent appraisal disclosure.

---

### Step 11: 🌟 FLAGSHIP SALES PAGE — Enterprise ROI Calculator (`/roi-calculator`)
1. Open `/roi-calculator` (public sales page).
2. Drag the large sliders:
   - Annual Return Volume: `25,000 units/year`
   - Average MSRP: `₹45,000`
   - Current Recovery Rate: `30%` → Target ReLife Rate: `72%`
3. Watch the large result counters update live:
   - **₹64.6M+ Net Incremental Cash Recovery**
   - **2,520 Metric Tons CO₂e Avoided**
   - **33,300 kg E-Waste Diverted from Landfills**
4. Click **"Export Audit PDF (jsPDF)"**:
   - Generates and downloads a clean, publication-ready executive business case PDF in seconds!

---

## 🏆 Summary Checklist for Judges
- [x] Full-stack architecture (FastAPI + MongoDB Beanie ODM + Next.js App Router).
- [x] Trained YOLOv8 defect detection model integrated end-to-end with bounding box overlay.
- [x] 5-Pathway Decision Simulator with live What-If criteria sliders and Framer Motion reordering.
- [x] Floating Decision Auditor chatbot.
- [x] Voice-to-Defect NLP speech logger.
- [x] Reverse component Dutch auctions with live countdown timers and anti-sniping.
- [x] Digital Recovery Passport with circular Trust Score ring.
- [x] Interactive Enterprise ROI Calculator with client-side PDF export.
- [x] ADEME Scope 3 lifecycle carbon accounting.
- [x] 100% white-themed, responsive SaaS design system.
