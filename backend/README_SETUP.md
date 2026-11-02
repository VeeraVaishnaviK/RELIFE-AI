# ReLife AI Backend Setup Guide

ReLife AI is an intelligent product recovery and circular-economy decision platform backend powered by FastAPI, Motor, Beanie ODM, and YOLOv8 computer vision.

---

## 1. Prerequisites
- Python 3.10+ (tested on Python 3.10)
- MongoDB instance (Local MongoDB service or MongoDB Atlas cloud cluster)

---

## 2. Virtual Environment Setup
Open a terminal in the `backend/` directory:

```bash
# Windows (PowerShell)
python -m venv venv
.\venv\Scripts\Activate.ps1

# Linux / macOS
python3 -m venv venv
source venv/bin/activate
```

---

## 3. Install Dependencies
```bash
pip install -r requirements.txt
```

---

## 4. Environment Configuration (.env)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` to configure your MongoDB connection:

### Local MongoDB
If running a local MongoDB community server on the default port:
```ini
MONGO_URI=mongodb://localhost:27017
DB_NAME=relife_db
```

### MongoDB Atlas (Cloud)
If connecting to MongoDB Atlas:
1. Obtain your connection string from the Atlas dashboard under **Connect > Drivers**.
2. Replace credentials and set in `.env`:
```ini
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/?retryWrites=true&w=majority
DB_NAME=relife_db
```

Both local MongoDB and Atlas are supported seamlessly by Motor/Beanie without code modifications.

---

## 5. Seed Initial Data
Seed standard test users for each role (admin, inspector, reseller, customer, repair_partner, recycler), sample products with QR codes, market valuation benchmarks, component reverse auctions, and enquiries:

```bash
python -m app.seed
```

Test credentials will be logged to your console.

---

## 6. Run the Backend API
Start the FastAPI server with auto-reload:
```bash
uvicorn app.main:app --reload --port 8000
```

- API Base URL: `http://localhost:8000`
- Interactive Swagger UI: `http://localhost:8000/docs`
- Redoc API Docs: `http://localhost:8000/redoc`
