"""
Database initialization and lifecycle management for Tortoise ORM
"""
import logging

from tortoise import Tortoise
from .config import TORTOISE_ORM
from .migrations import run_all_migrations, check_migrations_needed

logger = logging.getLogger(__name__)


async def init_db() -> None:
    """
    Initialize Tortoise ORM database connection and generate schemas.

    This function:
    - Establishes connection to the SQLite database
    - Registers all models from the configuration
    - Generates database schemas if they don't exist (safe mode)
    - Synchronizes schema with model definitions (adds missing columns, etc.)
    - Runs any pending data migrations (e.g., role value updates)
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
        logger.info("Base schemas generated")

        # Synchronize schema with model definitions
        logger.info("Synchronizing database schema with models...")
        from .schema_sync_service import get_sync_service
        
        sync_service = get_sync_service()
        sync_result = await sync_service.sync_schema(dry_run=False, auto_fix=True)
        
        if sync_result.success:
            if sync_result.differences_found > 0:
                logger.info(f"Schema sync completed: {sync_result.differences_resolved}/{sync_result.differences_found} differences resolved")
                if sync_result.columns_added:
                    logger.info(f"  • Columns added: {', '.join(sync_result.columns_added)}")
                if sync_result.tables_created:
                    logger.info(f"  • Tables created: {', '.join(sync_result.tables_created)}")
                if sync_result.indexes_created:
                    logger.info(f"  • Indexes created: {', '.join(sync_result.indexes_created)}")
            else:
                logger.info("Schema is already in sync with models")
        else:
            logger.warning("Schema synchronization completed with errors")
            if sync_result.errors:
                for error in sync_result.errors:
                    logger.error(f"  • {error}")

        # Check if migrations are needed
        migrations_needed = await check_migrations_needed()
        if migrations_needed:
            logger.info(f"Pending migrations detected: {', '.join(migrations_needed)}")

            # Run migrations AFTER schema sync to ensure schema is ready
            migration_results = await run_all_migrations()

            if migration_results['success']:
                logger.info("All migrations completed successfully")
                for migration in migration_results['migrations_run']:
                    logger.info(f"  - {migration['name']}: {migration.get('stats', migration.get('success'))}")
            else:
                logger.error("Migration failed!")
                for error in migration_results['errors']:
                    logger.error(f"  - {error}")
                raise Exception("Database migration failed. See logs for details.")
        else:
            logger.info("No pending migrations detected")

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