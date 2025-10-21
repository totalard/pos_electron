"""
Schema backup and restore utilities.

Provides functionality to backup schemas before regeneration and restore if needed.
"""
import logging
import shutil
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)


class SchemaBackupManager:
    """
    Manages schema file backups with rotation and restore capabilities.
    """
    
    def __init__(
        self,
        backup_dir: Optional[Path] = None,
        max_backups: int = 10,
        compression: bool = False
    ):
        """
        Initialize backup manager.
        
        Args:
            backup_dir: Directory to store backups (default: backups/schemas)
            max_backups: Maximum number of backups to keep
            compression: Whether to compress backups
        """
        self.backup_dir = backup_dir or (
            Path(__file__).parent.parent.parent / "backups" / "schemas"
        )
        self.max_backups = max_backups
        self.compression = compression
        
        # Ensure backup directory exists
        self.backup_dir.mkdir(parents=True, exist_ok=True)
        
    def create_backup(
        self,
        source_files: List[Path],
        backup_name: Optional[str] = None
    ) -> Dict[str, any]:
        """
        Create backup of schema files.
        
        Args:
            source_files: List of files to backup
            backup_name: Optional custom backup name
            
        Returns:
            Backup result dictionary
        """
        result = {
            'success': False,
            'backup_path': None,
            'files_backed_up': [],
            'timestamp': datetime.now().isoformat(),
            'error': None
        }
        
        try:
            # Generate backup name
            if backup_name is None:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                backup_name = f"schema_backup_{timestamp}"
            
            # Create backup subdirectory
            backup_path = self.backup_dir / backup_name
            backup_path.mkdir(parents=True, exist_ok=True)
            
            # Backup each file
            for source_file in source_files:
                if not source_file.exists():
                    logger.warning(f"Source file not found, skipping: {source_file}")
                    continue
                
                dest_file = backup_path / source_file.name
                shutil.copy2(source_file, dest_file)
                result['files_backed_up'].append(str(source_file))
                logger.debug(f"Backed up: {source_file} -> {dest_file}")
            
            # Create metadata file
            metadata = {
                'timestamp': result['timestamp'],
                'files': result['files_backed_up'],
                'backup_name': backup_name
            }
            
            metadata_file = backup_path / "backup_metadata.txt"
            metadata_file.write_text(
                f"Backup created: {metadata['timestamp']}\n"
                f"Files backed up:\n" +
                "\n".join(f"  - {f}" for f in metadata['files'])
            )
            
            result['success'] = True
            result['backup_path'] = str(backup_path)
            
            logger.info(f"Schema backup created: {backup_path}")
            
            # Rotate old backups
            self._rotate_backups()
            
        except Exception as e:
            logger.error(f"Failed to create schema backup: {e}", exc_info=True)
            result['error'] = str(e)
            
        return result
    
    def restore_backup(
        self,
        backup_name: str,
        target_dir: Optional[Path] = None
    ) -> Dict[str, any]:
        """
        Restore schemas from a backup.
        
        Args:
            backup_name: Name of backup to restore
            target_dir: Optional target directory (default: original locations)
            
        Returns:
            Restore result dictionary
        """
        result = {
            'success': False,
            'files_restored': [],
            'error': None
        }
        
        try:
            backup_path = self.backup_dir / backup_name
            
            if not backup_path.exists():
                result['error'] = f"Backup not found: {backup_name}"
                return result
            
            # Restore each file
            for backup_file in backup_path.glob("*.py"):
                if target_dir:
                    dest_file = target_dir / backup_file.name
                else:
                    # Restore to original location (src/api/)
                    dest_file = Path(__file__).parent.parent / "api" / backup_file.name
                
                shutil.copy2(backup_file, dest_file)
                result['files_restored'].append(str(dest_file))
                logger.debug(f"Restored: {backup_file} -> {dest_file}")
            
            result['success'] = True
            logger.info(f"Schema backup restored: {backup_name}")
            
        except Exception as e:
            logger.error(f"Failed to restore schema backup: {e}", exc_info=True)
            result['error'] = str(e)
            
        return result
    
    def list_backups(self) -> List[Dict[str, any]]:
        """
        List all available backups.
        
        Returns:
            List of backup information dictionaries
        """
        backups = []
        
        try:
            for backup_dir in sorted(self.backup_dir.iterdir(), reverse=True):
                if not backup_dir.is_dir():
                    continue
                
                backup_info = {
                    'name': backup_dir.name,
                    'path': str(backup_dir),
                    'created': datetime.fromtimestamp(
                        backup_dir.stat().st_mtime
                    ).isoformat(),
                    'files': []
                }
                
                # List files in backup
                for file in backup_dir.glob("*.py"):
                    backup_info['files'].append(file.name)
                
                backups.append(backup_info)
                
        except Exception as e:
            logger.error(f"Failed to list backups: {e}")
            
        return backups
    
    def delete_backup(self, backup_name: str) -> bool:
        """
        Delete a specific backup.
        
        Args:
            backup_name: Name of backup to delete
            
        Returns:
            True if successful
        """
        try:
            backup_path = self.backup_dir / backup_name
            
            if not backup_path.exists():
                logger.warning(f"Backup not found: {backup_name}")
                return False
            
            shutil.rmtree(backup_path)
            logger.info(f"Deleted backup: {backup_name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete backup: {e}")
            return False
    
    def _rotate_backups(self):
        """
        Remove old backups to maintain max_backups limit.
        """
        try:
            backups = sorted(
                [d for d in self.backup_dir.iterdir() if d.is_dir()],
                key=lambda d: d.stat().st_mtime,
                reverse=True
            )
            
            # Remove excess backups
            for old_backup in backups[self.max_backups:]:
                logger.info(f"Rotating out old backup: {old_backup.name}")
                shutil.rmtree(old_backup)
                
        except Exception as e:
            logger.error(f"Failed to rotate backups: {e}")
    
    def get_latest_backup(self) -> Optional[Dict[str, any]]:
        """
        Get information about the most recent backup.
        
        Returns:
            Backup info dictionary or None
        """
        backups = self.list_backups()
        return backups[0] if backups else None


# Global backup manager instance
_backup_manager: Optional[SchemaBackupManager] = None


def get_backup_manager() -> SchemaBackupManager:
    """
    Get or create global backup manager instance.
    
    Returns:
        SchemaBackupManager instance
    """
    global _backup_manager
    
    if _backup_manager is None:
        _backup_manager = SchemaBackupManager()
        
    return _backup_manager


async def create_schema_backup(
    *source_files: Path,
    backup_name: Optional[str] = None
) -> Dict[str, any]:
    """
    Convenience function to create schema backup.
    
    Args:
        source_files: Files to backup
        backup_name: Optional custom backup name
        
    Returns:
        Backup result dictionary
    """
    manager = get_backup_manager()
    return manager.create_backup(list(source_files), backup_name)


async def restore_schema_backup(backup_name: str) -> Dict[str, any]:
    """
    Convenience function to restore schema backup.
    
    Args:
        backup_name: Name of backup to restore
        
    Returns:
        Restore result dictionary
    """
    manager = get_backup_manager()
    return manager.restore_backup(backup_name)


def list_schema_backups() -> List[Dict[str, any]]:
    """
    Convenience function to list schema backups.
    
    Returns:
        List of backup information
    """
    manager = get_backup_manager()
    return manager.list_backups()
