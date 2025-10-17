"""
Settings API endpoints

This module provides API endpoints for managing application settings.
It uses the new normalized Setting model while maintaining backward
compatibility with the old JSON-based Settings model API.
"""
import logging
import shutil
from datetime import datetime
from pathlib import Path
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, status
from tortoise.exceptions import DoesNotExist

from ..database.models.setting import Setting
from ..database.defaults import get_default_settings
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
    SystemInfo,
    SettingItemResponse,
    SettingItemUpdate,
    SectionSettingsResponse,
    BulkSettingsUpdate
)

router = APIRouter()
logger = logging.getLogger(__name__)


async def ensure_settings_initialized():
    """
    Ensure settings are initialized with defaults.
    Called on first access to settings.
    """
    count = await Setting.all().count()
    if count == 0:
        logger.info("Initializing settings with defaults...")
        defaults = get_default_settings()
        created = await Setting.initialize_defaults(defaults)
        logger.info(f"Initialized {created} default settings")


async def aggregate_settings_by_section() -> Dict[str, Dict[str, Any]]:
    """
    Aggregate all settings grouped by section with typed values.

    Returns:
        Dictionary mapping section names to setting dictionaries
    """
    sections = {}
    all_settings = await Setting.all()

    for setting in all_settings:
        if setting.section not in sections:
            sections[setting.section] = {}
        sections[setting.section][setting.key] = setting.get_typed_value()

    return sections


@router.get("/", response_model=SettingsResponse)
async def get_settings():
    """
    Get application settings.

    Returns all settings aggregated by section, maintaining backward
    compatibility with the old JSON-based Settings model API.
    """
    try:
        # Ensure settings are initialized
        await ensure_settings_initialized()

        # Get all settings aggregated by section
        sections = await aggregate_settings_by_section()

        # Get first setting's timestamps (or use current time if none exist)
        first_setting = await Setting.first()
        if first_setting:
            created_at = first_setting.created_at
            updated_at = first_setting.updated_at
            setting_id = first_setting.id
        else:
            created_at = datetime.now()
            updated_at = datetime.now()
            setting_id = 1

        # Build response matching old format
        response = SettingsResponse(
            id=setting_id,
            general=GeneralSettings(**sections.get('general', {})),
            business=BusinessSettings(**sections.get('business', {})),
            taxes=TaxSettings(**sections.get('taxes', {})),
            hardware=HardwareSettings(**sections.get('hardware', {})),
            receipts=ReceiptSettings(**sections.get('receipts', {})),
            inventory=InventorySettings(**sections.get('inventory', {})),
            integration=IntegrationSettings(**sections.get('integration', {})),
            backup=BackupSettings(**sections.get('backup', {})),
            display=DisplaySettings(**sections.get('display', {})),
            security=SecuritySettings(**sections.get('security', {})),
            about=SystemInfo(**sections.get('about', {})),
            created_at=created_at,
            updated_at=updated_at
        )

        logger.info("Settings retrieved successfully")
        return response

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
    Decomposes section updates into individual setting updates.
    Maintains backward compatibility with old API.
    """
    try:
        # Map section names to update data
        section_mapping = {
            'general': settings_data.general,
            'business': settings_data.business,
            'taxes': settings_data.taxes,
            'hardware': settings_data.hardware,
            'receipts': settings_data.receipts,
            'inventory': settings_data.inventory,
            'integration': settings_data.integration,
            'backup': settings_data.backup,
            'display': settings_data.display,
            'security': settings_data.security,
            'about': settings_data.about
        }

        # Update each section that has data
        for section, data in section_mapping.items():
            if data is not None:
                settings_dict = data.model_dump()
                await Setting.update_section(section, settings_dict)
                logger.info(f"Updated {section} settings: {len(settings_dict)} values")

        # Return updated settings in old format
        return await get_settings()

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
        
        # Update lastBackupDate setting
        await Setting.update_setting('backup', 'lastBackupDate', datetime.now().isoformat())
        
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

# ===== NEW GRANULAR SETTINGS ENDPOINTS =====

@router.get("/{section}", response_model=SectionSettingsResponse)
async def get_section_settings(section: str):
    """
    Get all settings for a specific section.

    Args:
        section: Section name (e.g., 'display', 'security', 'inventory')

    Returns:
        All settings in the section as key-value pairs
    """
    try:
        settings = await Setting.get_section(section)

        if not settings:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Section '{section}' not found or has no settings"
            )

        return SectionSettingsResponse(
            section=section,
            settings=settings
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get section settings: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get section settings: {str(e)}"
        )


@router.get("/{section}/{key}", response_model=SettingItemResponse)
async def get_individual_setting(section: str, key: str):
    """
    Get an individual setting by section and key.

    Args:
        section: Section name
        key: Setting key

    Returns:
        Individual setting details
    """
    try:
        setting = await Setting.get(section=section, key=key)
        return setting

    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Setting '{section}.{key}' not found"
        )
    except Exception as e:
        logger.error(f"Failed to get setting: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get setting: {str(e)}"
        )


@router.put("/{section}/{key}", response_model=SettingItemResponse)
async def update_individual_setting(section: str, key: str, update: SettingItemUpdate):
    """
    Update an individual setting.

    Args:
        section: Section name
        key: Setting key
        update: New value

    Returns:
        Updated setting
    """
    try:
        setting = await Setting.update_setting(section, key, update.value)
        logger.info(f"Updated setting {section}.{key}")
        return setting

    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Setting '{section}.{key}' not found"
        )
    except Exception as e:
        logger.error(f"Failed to update setting: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update setting: {str(e)}"
        )


@router.post("/bulk", status_code=status.HTTP_200_OK)
async def bulk_update_settings(bulk_update: BulkSettingsUpdate):
    """
    Bulk update multiple settings across sections.

    Args:
        bulk_update: List of setting updates with section, key, and value

    Returns:
        Number of settings updated
    """
    try:
        updated = await Setting.bulk_update(bulk_update.updates)
        logger.info(f"Bulk updated {len(updated)} settings")

        return {
            "success": True,
            "updated_count": len(updated),
            "message": f"Successfully updated {len(updated)} settings"
        }

    except Exception as e:
        logger.error(f"Failed to bulk update settings: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to bulk update settings: {str(e)}"
        )
