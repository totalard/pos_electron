"""
Settings API endpoints
"""
import logging
import shutil
from datetime import datetime
from pathlib import Path
from fastapi import APIRouter, HTTPException, status
from tortoise.exceptions import DoesNotExist

from ..database.models import Settings
from .schemas import (
    SettingsResponse,
    SettingsUpdate,
    BackupRequest,
    RestoreRequest,
    GeneralSettings,
    BusinessSettings,
    TaxSettings,
    HardwareSettings,
    ReceiptSettings,
    InventorySettings,
    IntegrationSettings,
    BackupSettings,
    DisplaySettings,
    SecuritySettings,
    SystemInfo
)

router = APIRouter()
logger = logging.getLogger(__name__)


def settings_to_response(settings: Settings) -> SettingsResponse:
    """Convert Settings model to SettingsResponse schema"""
    return SettingsResponse(
        id=settings.id,
        general=GeneralSettings(**settings.general_settings),
        business=BusinessSettings(**settings.business_settings),
        taxes=TaxSettings(**settings.tax_settings),
        hardware=HardwareSettings(**settings.hardware_settings),
        receipts=ReceiptSettings(**settings.receipt_settings),
        inventory=InventorySettings(**settings.inventory_settings),
        integration=IntegrationSettings(**settings.integration_settings),
        backup=BackupSettings(**settings.backup_settings),
        display=DisplaySettings(**settings.display_settings),
        security=SecuritySettings(**settings.security_settings),
        about=SystemInfo(**settings.system_info),
        created_at=settings.created_at,
        updated_at=settings.updated_at
    )


@router.get("/", response_model=SettingsResponse)
async def get_settings():
    """
    Get application settings.
    
    Returns the singleton settings instance. Creates default settings if none exist.
    """
    try:
        settings = await Settings.get_settings()
        logger.info("Settings retrieved successfully")
        return settings_to_response(settings)
    except Exception as e:
        logger.error(f"Failed to retrieve settings: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve settings: {str(e)}"
        )


@router.put("/", response_model=SettingsResponse)
async def update_settings(settings_data: SettingsUpdate):
    """
    Update application settings.
    
    Accepts partial updates for any settings category.
    Only provided fields will be updated.
    """
    try:
        # Prepare update data
        update_data = {}
        
        if settings_data.general is not None:
            update_data['general_settings'] = settings_data.general.model_dump()
        
        if settings_data.business is not None:
            update_data['business_settings'] = settings_data.business.model_dump()
        
        if settings_data.taxes is not None:
            update_data['tax_settings'] = settings_data.taxes.model_dump()
        
        if settings_data.hardware is not None:
            update_data['hardware_settings'] = settings_data.hardware.model_dump()
        
        if settings_data.receipts is not None:
            update_data['receipt_settings'] = settings_data.receipts.model_dump()
        
        if settings_data.inventory is not None:
            update_data['inventory_settings'] = settings_data.inventory.model_dump()
        
        if settings_data.integration is not None:
            update_data['integration_settings'] = settings_data.integration.model_dump()
        
        if settings_data.backup is not None:
            update_data['backup_settings'] = settings_data.backup.model_dump()
        
        if settings_data.display is not None:
            update_data['display_settings'] = settings_data.display.model_dump()
        
        if settings_data.security is not None:
            update_data['security_settings'] = settings_data.security.model_dump()
        
        if settings_data.about is not None:
            update_data['system_info'] = settings_data.about.model_dump()
        
        # Update settings
        settings = await Settings.update_settings(**update_data)
        
        logger.info("Settings updated successfully")
        return settings_to_response(settings)
        
    except Exception as e:
        logger.error(f"Failed to update settings: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update settings: {str(e)}"
        )


@router.post("/backup", status_code=status.HTTP_200_OK)
async def perform_backup(backup_request: BackupRequest):
    """
    Perform database backup.
    
    Creates a backup of the SQLite database file.
    """
    try:
        # Get database path
        from ..database.config import DB_PATH
        
        # Determine backup location
        if backup_request.location:
            backup_dir = Path(backup_request.location)
        else:
            backup_dir = DB_PATH.parent / "backups"
        
        # Create backup directory if it doesn't exist
        backup_dir.mkdir(parents=True, exist_ok=True)
        
        # Create backup filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_file = backup_dir / f"pos_backup_{timestamp}.db"
        
        # Copy database file
        shutil.copy2(DB_PATH, backup_file)
        
        # Update backup settings
        settings = await Settings.get_settings()
        backup_settings = settings.backup_settings or {}
        backup_settings['lastBackupDate'] = datetime.now().isoformat()
        await Settings.update_settings(backup_settings=backup_settings)
        
        logger.info(f"Backup created successfully: {backup_file}")
        
        return {
            "success": True,
            "message": "Backup created successfully",
            "backup_file": str(backup_file),
            "timestamp": timestamp
        }
        
    except Exception as e:
        logger.error(f"Failed to create backup: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create backup: {str(e)}"
        )


@router.post("/restore", status_code=status.HTTP_200_OK)
async def restore_backup(restore_request: RestoreRequest):
    """
    Restore database from backup.
    
    WARNING: This will replace the current database with the backup file.
    The application should be restarted after restore.
    """
    try:
        # Get database path
        from ..database.config import DB_PATH
        
        # Validate backup file exists
        backup_file = Path(restore_request.filePath)
        if not backup_file.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Backup file not found: {restore_request.filePath}"
            )
        
        # Create a backup of current database before restore
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        pre_restore_backup = DB_PATH.parent / f"pre_restore_backup_{timestamp}.db"
        shutil.copy2(DB_PATH, pre_restore_backup)
        
        # Restore from backup
        shutil.copy2(backup_file, DB_PATH)
        
        logger.info(f"Database restored from: {backup_file}")
        logger.info(f"Pre-restore backup saved to: {pre_restore_backup}")
        
        return {
            "success": True,
            "message": "Database restored successfully. Please restart the application.",
            "restored_from": str(backup_file),
            "pre_restore_backup": str(pre_restore_backup)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to restore backup: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to restore backup: {str(e)}"
        )


@router.get("/database-info", status_code=status.HTTP_200_OK)
async def get_database_info():
    """
    Get database information including size and location.
    """
    try:
        from ..database.config import DB_PATH
        
        if DB_PATH.exists():
            size_bytes = DB_PATH.stat().st_size
            size_mb = size_bytes / (1024 * 1024)
            
            return {
                "path": str(DB_PATH),
                "size_bytes": size_bytes,
                "size_mb": round(size_mb, 2),
                "exists": True
            }
        else:
            return {
                "path": str(DB_PATH),
                "exists": False
            }
            
    except Exception as e:
        logger.error(f"Failed to get database info: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get database info: {str(e)}"
        )

