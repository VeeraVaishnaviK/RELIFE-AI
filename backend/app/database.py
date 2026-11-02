import logging
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.config.settings import settings
from app.models import DOCUMENT_MODELS

logger = logging.getLogger("relife.database")

client: AsyncIOMotorClient = None

async def init_db():
    global client
    logger.info(f"Connecting to MongoDB at {settings.MONGO_URI} (db: {settings.DB_NAME})...")
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.DB_NAME]
    
    await init_beanie(
        database=db,
        document_models=DOCUMENT_MODELS
    )
    logger.info("Beanie ODM successfully initialized with all 18 models and indexes.")

async def close_db():
    global client
    if client:
        client.close()
        logger.info("MongoDB connection closed.")
