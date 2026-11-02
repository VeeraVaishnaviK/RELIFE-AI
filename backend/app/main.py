import os
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"))
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.config.settings import settings
from app.database import init_db, close_db
from app.services.auction_engine import AuctionEngine
from app.services.allocation_engine import AllocationEngine

# Routers
from app.routers.auth import router as auth_router
from app.routers.products import router as products_router
from app.routers.inspections import router as inspections_router
from app.routers.costs import router as costs_router
from app.routers.valuation import router as valuation_router
from app.routers.decisions import router as decisions_router
from app.routers.review_queue import router as review_queue_router
from app.routers.recommendations import router as recommendations_router
from app.routers.outcomes import router as outcomes_router
from app.routers.auctions import router as auctions_router
from app.routers.enquiries import router as enquiries_router
from app.routers.voice_inspection import router as voice_inspection_router
from app.routers.roi_calculator import router as roi_calculator_router
from app.routers.trust_score import router as trust_score_router
from app.routers.repair_jobs import router as repair_jobs_router

scheduler = AsyncIOScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Init Beanie with all Document models
    await init_db()
    
    # Configure and start background scheduler jobs
    scheduler.add_job(
        AuctionEngine.check_dutch_decay_and_expiry,
        "interval",
        minutes=1,
        id="dutch_auction_decay"
    )
    scheduler.add_job(
        AllocationEngine.check_allocation_expiries,
        "interval",
        minutes=1,
        id="allocation_expiry_cascade"
    )
    scheduler.start()
    
    yield
    
    # Shutdown
    if scheduler.running:
        scheduler.shutdown(wait=False)
    await close_db()

app = FastAPI(
    title="ReLife AI Circular Economy Platform API",
    description="Intelligent product recovery, computer vision defect inspection, 5-pathway decision engine, and reverse auction marketplace.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploaded image directory
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Health check endpoints
@app.get("/", tags=["Health"])
async def root():
    return {
        "platform": "ReLife AI Circular Economy Platform",
        "status": "operational",
        "docs_url": "/docs",
        "version": "1.0.0"
    }

@app.get("/api/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "database": "connected"}

@app.get("/api/network-info", tags=["Health"])
async def get_network_info():
    """Returns dynamic local IP and active cloudflared tunnel URL for QR pairing."""
    import socket
    import urllib.request
    import re

    # Detect local IP
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
    except Exception:
        local_ip = "127.0.0.1"
    finally:
        s.close()

    # Query local cloudflared metrics endpoint
    tunnel_url = None
    try:
        resp = urllib.request.urlopen("http://127.0.0.1:20241/metrics", timeout=1.5)
        text = resp.read().decode("utf-8")
        match = re.search(r'userHostname="(https://[^\"]+)"', text)
        if match:
            tunnel_url = match.group(1)
    except Exception:
        pass

    return {
        "local_ip": local_ip,
        "tunnel_url": tunnel_url,
        "frontend_port": 3000
    }

# Register all API routers under API_V1_PREFIX
api_prefix = settings.API_V1_PREFIX
app.include_router(auth_router, prefix=api_prefix)
app.include_router(products_router, prefix=api_prefix)
app.include_router(inspections_router, prefix=api_prefix)
app.include_router(costs_router, prefix=api_prefix)
app.include_router(valuation_router, prefix=api_prefix)
app.include_router(decisions_router, prefix=api_prefix)
app.include_router(review_queue_router, prefix=api_prefix)
app.include_router(recommendations_router, prefix=api_prefix)
app.include_router(outcomes_router, prefix=api_prefix)
app.include_router(auctions_router, prefix=api_prefix)
app.include_router(enquiries_router, prefix=api_prefix)
app.include_router(voice_inspection_router, prefix=api_prefix)
app.include_router(roi_calculator_router, prefix=api_prefix)
app.include_router(trust_score_router, prefix=api_prefix)
app.include_router(repair_jobs_router, prefix=api_prefix)
