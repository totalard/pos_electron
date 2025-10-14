"""
Database initialization and lifecycle management for Tortoise ORM
"""
import logging

from tortoise import Tortoise
from .config import TORTOISE_ORM

logger = logging.getLogger(__name__)


async def init_db() -> None:
    """
    Initialize Tortoise ORM database connection and generate schemas.
    
    This function:
    - Establishes connection to the SQLite database
    - Registers all models from the configuration
    - Generates database schemas if they don't exist (safe mode)
    - Sets up connection pooling and lifecycle management
    
    Raises:
        Exception: If database initialization fails
    """
    try:
        logger.info("Initializing Tortoise ORM...")

        # Initialize Tortoise ORM with configuration
        await Tortoise.init(config=TORTOISE_ORM)

        # Generate schemas safely (only creates tables if they don't exist)
        # This is idempotent and safe to run on every startup
        await Tortoise.generate_schemas(safe=True)

        logger.info("Tortoise ORM initialized successfully")
        logger.info("Database location: %s",
                   TORTOISE_ORM['connections']['default']['credentials']['file_path'])
    except Exception as e:
        logger.error("Failed to initialize database: %s", e)
        raise


async def close_db() -> None:
    """
    Close all database connections gracefully.
    
    This function should be called during application shutdown to ensure
    all database connections are properly closed and resources are released.
    
    Raises:
        Exception: If database closure fails
    """
    try:
        logger.info("Closing Tortoise ORM connections...")
        await Tortoise.close_connections()
        logger.info("Tortoise ORM connections closed successfully")
    except Exception as e:
        logger.error("Failed to close database connections: %s", e)
        raise


async def get_db_info() -> dict:
    """
    Get information about the current database connection.
    
    Returns:
        dict: Database connection information including:
            - engine: Database engine type
            - file_path: Path to the database file
            - apps: Registered application models
    """
    return {
        "engine": "SQLite",
        "file_path": TORTOISE_ORM['connections']['default']['credentials']['file_path'],
        "apps": list(TORTOISE_ORM['apps'].keys()),
        "models": TORTOISE_ORM['apps']['models']['models']
    }