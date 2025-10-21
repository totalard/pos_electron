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
    
    # Schema synchronization (development mode)
    try:
        from .schema_config.schema_sync_config import get_config as get_sync_config
        from .services.schema_sync import sync_schemas_from_models
        from .utils.file_watcher import watch_models_for_changes
        
        sync_config = get_sync_config()
        
        if sync_config.should_run_sync():
            logger.info("Running automatic schema synchronization...")
            sync_result = await sync_schemas_from_models()
            
            if sync_result['success']:
                logger.info("Schema synchronization completed successfully")
            else:
                logger.warning("Schema synchronization completed with warnings")
                if sync_config.fail_on_validation_error and sync_result.get('errors'):
                    logger.error("Schema sync errors: %s", sync_result['errors'])
                    if sync_config.environment.lower() != "production":
                        raise Exception("Schema synchronization failed")
        
        # Start file watcher for development
        file_watcher = None
        if sync_config.should_watch_files():
            logger.info("Starting file watcher for automatic schema regeneration...")
            try:
                file_watcher = await watch_models_for_changes(
                    debounce_seconds=sync_config.watch_debounce_seconds
                )
                if file_watcher:
                    logger.info("File watcher started successfully")
            except ImportError:
                logger.warning("watchdog not installed, file watching disabled")
            except Exception as e:
                logger.warning(f"Failed to start file watcher: {e}")
        
    except Exception as e:
        logger.warning(f"Schema sync initialization failed: {e}")
        # Don't fail startup for schema sync issues in production
        if settings.ENVIRONMENT == "production":
            logger.info("Continuing startup despite schema sync failure (production mode)")
        else:
            logger.error("Schema sync failed in development mode")
    
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
    
    # Stop file watcher if running
    try:
        if 'file_watcher' in locals() and file_watcher:
            file_watcher.stop()
            logger.info("File watcher stopped")
    except Exception as e:
        logger.warning(f"Error stopping file watcher: {e}")
    
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
