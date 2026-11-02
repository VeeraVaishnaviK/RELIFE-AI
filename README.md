# ♻️ ReLife AI — Autonomous Circular Economy & Product Recovery Platform

> **An AI-powered multi-pathway reverse logistics decision platform that transforms consumer electronics returns into maximum value and verified zero-landfill circularity.**

---

##  Executive Overview

Consumer electronics returns cause over **$500 Billion** in annual value erosion, and electronic waste remains the fastest-growing solid waste stream on earth. Traditional reverse logistics relies on manual inspections, static spreadsheets, and blanket liquidation at single-digit recovery rates.

**ReLife AI** automates this entire lifecycle:
1. **Automated Optical Diagnostics**: Trained **YOLOv8** computer vision localizes hairline scratches, casing cracks, dents, and missing components with temperature-calibrated confidence scores.
2. **Dynamic 5-Pathway Decision Engine**: Simultaneously evaluates five circular pathways (**Direct Resale**, **Targeted Repair**, **Certified Refurbishment**, **Component Harvesting**, and **Compliance Recycling**) to maximize Net Recovery Value (NRV).
3. **Executive "What-If" Simulator**: Sliders allow operators to live-adjust corporate trade-offs between profit margin, carbon avoidance, turnaround velocity, and execution risk.
4. **Transparent Secondary Marketplaces**: Real-time reverse Dutch auctions for harvested modules and a public refurbished storefront featuring cryptographically verifiable **Digital Recovery Passports** and circular **Trust Scores**.
5. **Certified ESG Accounting**: Quantifies Scope 3 carbon avoidance and landfill diversion calibrated to **ISO 14040/14044** and **ADEME Base Empreinte 2024** life-cycle benchmarks.

---

##  Architecture & Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Backend API** | **FastAPI** (Python 3.10+), Pydantic v2, Uvicorn (ASGI) |
| **Database & ODM** | **MongoDB**, **Beanie ODM** (async Motor driver) |
| **Computer Vision / ML** | **YOLOv8s** (Ultralytics PyTorch), OpenCV, CLAHE preprocessing |
| **Frontend Web App** | **Next.js 16** (App Router, Turbopack, React 19, TypeScript) |
| **UI & Styling** | **Tailwind CSS**, Lucide Icons, Framer Motion animations |
| **Data Visualization** | **Recharts** (Area, Bar, Pie, Composed Charts) |
| **Document Generation** | **jsPDF** (Client-side Executive ROI Audit PDF generation) |
| **Barcodes & Confetti** | `qrcode.react`, `canvas-confetti` |

---

##  Features Mapping Table

### Mandatory Hackathon Features

| Mandatory Feature | Description | Status | Implementation Details |
| :--- | :--- | :--- | :--- |
| **Product Registration** | Intake manifest for returned devices with auto-generated serialized barcodes | ✅ Complete | [`/inspector/products/new`](frontend/app/inspector/products/new/page.tsx) with `qrcode.react` |
| **Computer Vision Inspection** | Trained YOLOv8 defect detection identifying scratches, cracks, and dents | ✅ Complete | [`/inspector/inspections/[id]`](frontend/app/inspector/inspections/[productId]/page.tsx) + Canvas bounding boxes |
| **Dual Diagnostic Verification** | Optical vision scan combined with functional hardware & battery health tests | ✅ Complete | Hardware tests form with battery health slider & blur quality gate |
| **Cost & Valuation Engine** | OEM parts lookup, labor rates, and resale tier estimation (Grades A/B/C/Scrap) | ✅ Complete | [`/inspector/inspections/[id]/costs`](frontend/app/inspector/inspections/[productId]/costs/page.tsx) |
| **5-Pathway Decision Engine** | Real-time Net Recovery Value optimization across Resale, Repair, Refurbish, Harvest, Recycle | ✅ Complete | [`/admin/products/[id]/decision`](frontend/app/admin/products/[productId]/decision/page.tsx) |
| **Interactive What-If Simulator** | Dynamic slider panel reordering pathway priority rankings live | ✅ Complete | Live weight recalculation with smooth **Framer Motion** animation |
| **Human Review Queue** | Arbitration queue for low-confidence detections and edge-case exceptions | ✅ Complete | [`/admin/review-queue`](frontend/app/admin/review-queue/page.tsx) with resolution modal flow |
| **Executive Analytics** | Recharts telemetry tracking realized revenue, turnaround velocity, and pathways | ✅ Complete | [`/admin/analytics`](frontend/app/admin/analytics/page.tsx) |
| **Scope 3 Carbon Accounting** | Avoided manufacturing CO2 calculations verified against ADEME LCA factors | ✅ Complete | [`/admin/analytics/environmental`](frontend/app/admin/analytics/environmental/page.tsx) |
| **Reverse Component Auctions** | B2B auction portal for harvested display assemblies and logic boards | ✅ Complete | [`/reseller/marketplace`](frontend/app/reseller/marketplace/page.tsx) with Dutch decay timers |
| **Certified Storefront** | Refurbished electronics consumer catalog with Trust Score progress rings | ✅ Complete | [`/store`](frontend/app/store/page.tsx) |
| **Role-Aware Dashboards** | Dedicated workstations for Admin, Inspector, Reseller, Repair Partner, Recycler, Customer | ✅ Complete | Sidebar role switcher with customized views per persona |

### New Features

| Innovation Feature | Value Proposition | Status | Implementation Details |
| :--- | :--- | :--- | :--- |
| **Voice-to-Defect Logger** | Dictate inspection findings; NLP extracts structured defect records | ✅ Complete | [`VoiceInspectionInput.tsx`](frontend/components/inspection/VoiceInspectionInput.tsx) |
| **Decision Explainer Chatbot** | Floating conversational agent answering "why" pathways were selected | ✅ Complete | [`RecommendationChatbot.tsx`](frontend/components/decision/RecommendationChatbot.tsx) |
| **AR Guided Camera Capture** | Translucent guide overlays per device angle with sharpness validation | ✅ Complete | [`GuidedCaptureCamera.tsx`](frontend/components/capture/GuidedCaptureCamera.tsx) |
| **Digital Recovery Passport** | Immutable timeline detailing chain-of-custody, repairs, and battery health | ✅ Complete | Interactive passport drawer on storefront and products |
| **Instant Customer Trade-In** | Consumer appraisal with instant cash offer and celebratory confetti | ✅ Complete | [`/store/trade-in`](frontend/app/store/trade-in/page.tsx) with `canvas-confetti` |
| **Enterprise ROI Calculator** | Interactive business case simulator with client-side PDF export | ✅ Complete | [`/roi-calculator`](frontend/app/roi-calculator/page.tsx) with `jsPDF` |
| **Pre-Demand Auto-Allocation** | Match newly inspected returns directly to standing purchase orders | ✅ Complete | [`/reseller/enquiries`](frontend/app/reseller/enquiries/page.tsx) + Allocations list |

---

##  Local Run Setup (No Docker Required)

Follow these simple steps to run both backend and frontend on your local system:

### 1. Prerequisites
- **Python 3.10+** (with `pip` and `venv`)
- **Node.js 18+** or **Node.js 20+** (with `npm`)
- **MongoDB** running locally (`mongodb://localhost:27017`) or a free MongoDB Atlas connection string.

---

### 2. Backend Setup & Seeding

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a Python virtual environment
# Windows (PowerShell):
python -m venv venv
.\venv\Scripts\Activate.ps1
# Mac/Linux:
# python3 -m venv venv && source venv/bin/activate

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Configure environment variables
# Copy .env.example to .env (defaults to mongodb://localhost:27017)
cp .env.example .env

# 5. Populate realistic demo data (users, 18 products, inspections, auctions)
python -m app.seed

# 6. Launch the FastAPI development server
uvicorn app.main:app --reload --port 8000
```

> **Backend API is now live at:** `http://localhost:8000`  
> **Interactive Swagger API Docs:** `http://localhost:8000/docs`

---

### 3. Frontend Setup

In a new terminal window:

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install Node.js dependencies
npm install

# 3. Configure environment variables
# (Create .env.local with backend URL)
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# 4. Start Next.js development server
npm run dev
```

> **Frontend Web App is now live at:** `http://localhost:3000`

---

##  Test Credentials (1-Click Fast Login)

All demo accounts come pre-configured in the seeded database:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@relife.ai` | `Admin@123` |
| **Inspector** | `inspector@relife.ai` | `Inspector@123` |
| **Reseller** | `reseller@relife.ai` | `Reseller@123` |
| **Customer** | `customer@relife.ai` | `Customer@123` |
| **Repair Partner** | `repair@relife.ai` | `Repair@123` |
| **Recycler** | `recycler@relife.ai` | `Recycler@123` |

---

##  Live Demo Guide

For the exact 5-minute live demonstration script, see:  
👉 **[docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md)**

---

## 📄 License
ReLife AI is distributed under the MIT License.
