"""
Main FastAPI application entry point for POS backend
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import router as api_router
from .config import settings
from .database import init_db, close_db, get_db_info

# Configure logging - only if not already configured (avoid duplicates with uvicorn)
if not logging.getLogger().handlers:
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """
    Application lifespan manager for startup and shutdown events.

    Handles:
    - Schema synchronization (development mode)
    - Database initialization on startup
    - Database connection closure on shutdown
    """
    # Startup
    logger.info("Starting POS Backend API...")
    
    # Database schema synchronization will be handled in init_db()
    
    # Database initialization
    try:
        await init_db()
        db_info = await get_db_info()
        logger.info("Database initialized: %s", db_info)
    except Exception as e:
        logger.error("Failed to initialize database: %s", e)
        raise

    yield

    # Shutdown
    logger.info("Shutting down POS Backend API...")
    
    # Close database
    try:
        await close_db()
    except Exception as e:
        logger.error("Failed to close database: %s", e)

# Create FastAPI application with lifespan manager
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="POS Application Backend API",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "POS Backend API",
        "version": settings.VERSION,
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint with database status"""
    try:
        db_info = await get_db_info()
        return {
            "status": "healthy",
            "service": settings.APP_NAME,
            "database": {
                "engine": db_info["engine"],
                "connected": True
            }
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "service": settings.APP_NAME,
            "database": {
                "connected": False,
                "error": str(e)
            }
        }
