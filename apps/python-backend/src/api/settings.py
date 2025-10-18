"""
Settings API endpoints

This module provides API endpoints for managing application settings.
It uses the new normalized Setting model while maintaining backward
compatibility with the old JSON-based Settings model API.

Enhanced backup/restore functionality includes:
- Advanced backup options (compression, encryption, selective tables)
- Backup history and metadata tracking
- Automatic backup scheduling
- Progress tracking
- Integrity verification
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
from ..utils.backup_manager import BackupManager
from ..utils.backup_scheduler import BackupScheduler, BackupProgressTracker
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
    BulkSettingsUpdate,
    AdvancedBackupRequest,
    BackupListResponse,
    BackupMetadata,
    BackupVerificationResult,
    RetentionPolicy,
    ScheduleConfiguration
)

router = APIRouter()
logger = logging.getLogger(__name__)

# Global backup manager instance
_backup_manager: BackupManager = None
_backup_scheduler: BackupScheduler = None
_progress_tracker: BackupProgressTracker = None


def get_backup_manager() -> BackupManager:
    """Get or create backup manager instance"""
    global _backup_manager
    if _backup_manager is None:
        from ..database.config import DB_PATH
        _backup_manager = BackupManager(DB_PATH)
    return _backup_manager


def get_backup_scheduler() -> BackupScheduler:
    """Get or create backup scheduler instance"""
    global _backup_scheduler
    if _backup_scheduler is None:
        from ..database.config import DB_PATH
        backup_manager = get_backup_manager()
        _backup_scheduler = BackupScheduler(backup_manager, DB_PATH)
    return _backup_scheduler


def get_progress_tracker() -> BackupProgressTracker:
    """Get or create progress tracker instance"""
    global _progress_tracker
    if _progress_tracker is None:
        _progress_tracker = BackupProgressTracker()
    return _progress_tracker


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
    Perform database backup (basic, for backward compatibility).
    
    Creates a backup of the SQLite database file.
    Use /backup/advanced for enhanced backup options.
    """
    try:
        backup_manager = get_backup_manager()
        
        # Determine backup location
        if backup_request.location:
            backup_manager.backup_dir = Path(backup_request.location)
            backup_manager.backup_dir.mkdir(parents=True, exist_ok=True)
        
        # Create basic backup
        metadata = backup_manager.create_backup(compression=True, backup_type='full')
        
        # Update lastBackupDate setting
        await Setting.update_setting('backup', 'lastBackupDate', datetime.now().isoformat())
        
        logger.info(f"Backup created successfully: {metadata.filename}")
        
        return {
            "success": True,
            "message": "Backup created successfully",
            "backup_file": str(backup_manager.backup_dir / metadata.filename),
            "timestamp": metadata.created_at
        }
        
    except Exception as e:
        logger.error(f"Failed to create backup: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create backup: {str(e)}"
        )


@router.post("/backup/advanced", status_code=status.HTTP_200_OK)
async def perform_advanced_backup(backup_request: AdvancedBackupRequest):
    """
    Perform advanced database backup with options.
    
    Supports:
    - Compression and encryption
    - Selective table backup
    - Different backup types
    """
    try:
        backup_manager = get_backup_manager()
        
        # Determine backup location
        if backup_request.location:
            backup_manager.backup_dir = Path(backup_request.location)
            backup_manager.backup_dir.mkdir(parents=True, exist_ok=True)
        
        # Create advanced backup
        metadata = backup_manager.create_backup(
            compression=backup_request.compression,
            encryption=backup_request.encryption,
            backup_type=backup_request.backup_type,
            selected_tables=backup_request.selected_tables
        )
        
        # Update lastBackupDate setting
        await Setting.update_setting('backup', 'lastBackupDate', datetime.now().isoformat())
        
        logger.info(f"Advanced backup created: {metadata.filename}")
        
        return {
            "success": True,
            "message": "Backup created successfully",
            "backup_file": str(backup_manager.backup_dir / metadata.filename),
            "metadata": metadata.to_dict()
        }
        
    except Exception as e:
        logger.error(f"Failed to create advanced backup: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create backup: {str(e)}"
        )


@router.post("/restore", status_code=status.HTTP_200_OK)
async def restore_backup(restore_request: RestoreRequest):
    """
    Restore database from backup with integrity verification.
    
    WARNING: This will replace the current database with the backup file.
    The application should be restarted after restore.
    
    Features:
    - Automatic pre-restore backup creation
    - Integrity verification
    - Support for compressed backups
    """
    try:
        backup_file = Path(restore_request.filePath)
        
        if not backup_file.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Backup file not found: {restore_request.filePath}"
            )
        
        backup_manager = get_backup_manager()
        result = backup_manager.restore_backup(backup_file, verify_checksum=True)
        
        logger.info(f"Database restored from: {backup_file}")
        
        return result
        
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Backup verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Backup verification failed: {str(e)}"
        )
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


# ============================================================================
# Enhanced Backup Management Endpoints
# ============================================================================

@router.get("/backups", response_model=BackupListResponse, status_code=status.HTTP_200_OK)
async def list_backups():
    """
    List all available backups with metadata.
    
    Returns:
        List of backup files with detailed information
    """
    try:
        backup_manager = get_backup_manager()
        backups = backup_manager.list_backups()
        
        return BackupListResponse(
            total=len(backups),
            backups=backups
        )
        
    except Exception as e:
        logger.error(f"Failed to list backups: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list backups: {str(e)}"
        )


@router.delete("/backups/{filename}", status_code=status.HTTP_200_OK)
async def delete_backup(filename: str):
    """
    Delete a specific backup file.
    
    Args:
        filename: Name of backup file to delete
    """
    try:
        backup_manager = get_backup_manager()
        backup_manager.delete_backup(filename)
        
        return {
            "success": True,
            "message": f"Backup deleted: {filename}"
        }
        
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Backup not found: {filename}"
        )
    except Exception as e:
        logger.error(f"Failed to delete backup: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete backup: {str(e)}"
        )


@router.post("/backups/{filename}/verify", response_model=BackupVerificationResult)
async def verify_backup(filename: str):
    """
    Verify integrity of a backup file.
    
    Args:
        filename: Name of backup file to verify
        
    Returns:
        Verification result with checksum status
    """
    try:
        backup_manager = get_backup_manager()
        result = backup_manager.verify_backup(filename)
        
        return BackupVerificationResult(**result)
        
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Backup not found: {filename}"
        )
    except Exception as e:
        logger.error(f"Failed to verify backup: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to verify backup: {str(e)}"
        )


@router.post("/backups/cleanup", status_code=status.HTTP_200_OK)
async def cleanup_backups(retention_policy: RetentionPolicy):
    """
    Clean up old backups based on retention policy.
    
    Args:
        retention_policy: Policy defining retention days and max count
        
    Returns:
        Number of backups deleted
    """
    try:
        backup_manager = get_backup_manager()
        deleted_count = backup_manager.cleanup_old_backups(
            retention_days=retention_policy.retention_days,
            max_backups=retention_policy.max_backup_count
        )
        
        return {
            "success": True,
            "deleted_count": deleted_count,
            "message": f"Cleanup completed: {deleted_count} backups deleted"
        }
        
    except Exception as e:
        logger.error(f"Failed to cleanup backups: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cleanup backups: {str(e)}"
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
