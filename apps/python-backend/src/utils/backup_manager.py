"""
Backup and restore management utilities for POS database.

Provides functionality for:
- Creating compressed backups with optional encryption
- Restoring backups with integrity verification
- Managing backup history and metadata
- Automatic cleanup based on retention policies
- Backup scheduling and monitoring
"""

import json
import logging
import shutil
import sqlite3
import hashlib
import gzip
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict

logger = logging.getLogger(__name__)


@dataclass
class BackupMetadata:
    """Metadata for a backup file"""
    filename: str
    created_at: str
    size_bytes: int
    size_mb: float
    database_size_bytes: int
    database_size_mb: float
    checksum: str
    compression_enabled: bool
    encryption_enabled: bool
    backup_type: str  # 'full', 'incremental', 'selective'
    selected_tables: Optional[List[str]] = None
    status: str = 'success'  # 'success', 'partial', 'failed'
    error_message: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return asdict(self)


class BackupManager:
    """Manages backup and restore operations"""
    
    DEFAULT_BACKUP_DIR = Path("backups")
    METADATA_FILE = "backup_manifest.json"
    COMPRESSION_LEVEL = 6
    
    def __init__(self, database_path: Path, backup_dir: Optional[Path] = None):
        """
        Initialize backup manager.
        
        Args:
            database_path: Path to the SQLite database
            backup_dir: Directory to store backups (defaults to './backups')
        """
        self.database_path = database_path
        self.backup_dir = backup_dir or self.DEFAULT_BACKUP_DIR
        self.backup_dir = Path(self.backup_dir)
        self.backup_dir.mkdir(parents=True, exist_ok=True)
        
    def _calculate_checksum(self, file_path: Path) -> str:
        """Calculate SHA256 checksum of a file"""
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()
    
    def _get_database_size(self) -> tuple[int, float]:
        """Get database file size in bytes and MB"""
        if self.database_path.exists():
            size_bytes = self.database_path.stat().st_size
            size_mb = size_bytes / (1024 * 1024)
            return size_bytes, size_mb
        return 0, 0.0
    
    def create_backup(
        self,
        compression: bool = True,
        encryption: bool = False,
        backup_type: str = 'full',
        selected_tables: Optional[List[str]] = None
    ) -> BackupMetadata:
        """
        Create a backup of the database.
        
        Args:
            compression: Enable gzip compression
            encryption: Enable encryption (reserved for future use)
            backup_type: Type of backup ('full', 'incremental', 'selective')
            selected_tables: List of tables to backup (for selective backup)
            
        Returns:
            BackupMetadata object with backup information
            
        Raises:
            FileNotFoundError: If database file doesn't exist
            Exception: If backup creation fails
        """
        if not self.database_path.exists():
            raise FileNotFoundError(f"Database not found: {self.database_path}")
        
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            base_name = f"pos_backup_{timestamp}"
            
            # Get database size before backup
            db_size_bytes, db_size_mb = self._get_database_size()
            
            # Prepare backup file path
            temp_backup_path = self.backup_dir / f"{base_name}.db"
            final_backup_path = temp_backup_path
            
            # Create the backup
            if backup_type == 'selective' and selected_tables:
                self._backup_selected_tables(self.database_path, temp_backup_path, selected_tables)
            else:
                # Full backup - simple file copy
                shutil.copy2(self.database_path, temp_backup_path)
            
            # Apply compression if enabled
            if compression:
                final_backup_path = self._compress_backup(temp_backup_path, base_name)
                temp_backup_path.unlink()  # Delete uncompressed version
            
            # Calculate checksum
            checksum = self._calculate_checksum(final_backup_path)
            backup_size_bytes = final_backup_path.stat().st_size
            backup_size_mb = backup_size_bytes / (1024 * 1024)
            
            # Create metadata
            metadata = BackupMetadata(
                filename=final_backup_path.name,
                created_at=datetime.now().isoformat(),
                size_bytes=backup_size_bytes,
                size_mb=round(backup_size_mb, 2),
                database_size_bytes=db_size_bytes,
                database_size_mb=round(db_size_mb, 2),
                checksum=checksum,
                compression_enabled=compression,
                encryption_enabled=encryption,
                backup_type=backup_type,
                selected_tables=selected_tables,
                status='success'
            )
            
            # Save metadata
            self._save_metadata(metadata)
            
            logger.info(f"Backup created successfully: {final_backup_path.name}")
            return metadata
            
        except Exception as e:
            logger.error(f"Failed to create backup: {e}")
            raise
    
    def _compress_backup(self, source_path: Path, base_name: str) -> Path:
        """Compress backup file with gzip"""
        compressed_path = self.backup_dir / f"{base_name}.db.gz"
        
        with open(source_path, 'rb') as f_in:
            with gzip.open(compressed_path, 'wb', compresslevel=self.COMPRESSION_LEVEL) as f_out:
                shutil.copyfileobj(f_in, f_out)
        
        return compressed_path
    
    def _decompress_backup(self, compressed_path: Path, output_path: Path) -> None:
        """Decompress a gzip backup file"""
        with gzip.open(compressed_path, 'rb') as f_in:
            with open(output_path, 'wb') as f_out:
                shutil.copyfileobj(f_in, f_out)
    
    def _backup_selected_tables(
        self,
        source_db: Path,
        dest_db: Path,
        selected_tables: List[str]
    ) -> None:
        """Create a backup with only selected tables"""
        # Connect to source database
        source_conn = sqlite3.connect(source_db)
        source_cursor = source_conn.cursor()
        
        # Create new backup database
        dest_conn = sqlite3.connect(dest_db)
        dest_cursor = dest_conn.cursor()
        
        try:
            # Get all table names
            source_cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            all_tables = [row[0] for row in source_cursor.fetchall()]
            
            # Filter to selected tables
            tables_to_backup = [t for t in all_tables if t in selected_tables]
            
            # Copy schema and data for selected tables
            for table in tables_to_backup:
                # Get CREATE TABLE statement
                source_cursor.execute(f"SELECT sql FROM sqlite_master WHERE type='table' AND name=?", (table,))
                create_stmt = source_cursor.fetchone()[0]
                
                # Create table in destination
                dest_cursor.execute(create_stmt)
                
                # Copy data
                source_cursor.execute(f"SELECT * FROM {table}")
                rows = source_cursor.fetchall()
                
                if rows:
                    placeholders = ','.join(['?' for _ in range(len(rows[0]))])
                    dest_cursor.execute(f"INSERT INTO {table} VALUES ({placeholders})", rows[0])
                    for row in rows[1:]:
                        dest_cursor.execute(f"INSERT INTO {table} VALUES ({placeholders})", row)
            
            dest_conn.commit()
            
        finally:
            source_conn.close()
            dest_conn.close()
    
    def restore_backup(
        self,
        backup_file: Path,
        verify_checksum: bool = True
    ) -> Dict[str, Any]:
        """
        Restore database from backup file.
        
        Args:
            backup_file: Path to the backup file
            verify_checksum: Verify backup integrity before restore
            
        Returns:
            Dictionary with restore results including paths
            
        Raises:
            FileNotFoundError: If backup file doesn't exist
            ValueError: If checksum verification fails
            Exception: If restore fails
        """
        backup_file = Path(backup_file)
        
        if not backup_file.exists():
            raise FileNotFoundError(f"Backup file not found: {backup_file}")
        
        try:
            # Load and verify metadata if available
            metadata = self.get_backup_metadata(backup_file.name)
            if metadata and verify_checksum:
                current_checksum = self._calculate_checksum(backup_file)
                if current_checksum != metadata['checksum']:
                    raise ValueError(
                        f"Backup integrity check failed. "
                        f"Expected: {metadata['checksum']}, "
                        f"Got: {current_checksum}"
                    )
            
            # Create pre-restore backup
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            pre_restore_path = self.backup_dir / f"pre_restore_backup_{timestamp}.db"
            shutil.copy2(self.database_path, pre_restore_path)
            
            # Prepare backup file (decompress if needed)
            restore_source = backup_file
            if backup_file.suffix == '.gz':
                restore_source = self.backup_dir / f"temp_restore_{timestamp}.db"
                self._decompress_backup(backup_file, restore_source)
            
            # Restore database
            shutil.copy2(restore_source, self.database_path)
            
            # Cleanup temp file
            if restore_source != backup_file:
                restore_source.unlink()
            
            logger.info(f"Database restored from: {backup_file}")
            
            return {
                "success": True,
                "message": "Database restored successfully",
                "restored_from": str(backup_file),
                "restored_to": str(self.database_path),
                "pre_restore_backup": str(pre_restore_path)
            }
            
        except Exception as e:
            logger.error(f"Failed to restore backup: {e}")
            raise
    
    def list_backups(self) -> List[Dict[str, Any]]:
        """List all available backups with metadata"""
        backups = []
        
        # Find all backup files
        for backup_file in sorted(self.backup_dir.glob("pos_backup_*.db*")):
            try:
                # Get file info
                stat_info = backup_file.stat()
                size_mb = stat_info.st_size / (1024 * 1024)
                
                # Try to load metadata
                metadata = self.get_backup_metadata(backup_file.name)
                
                backup_info = {
                    "filename": backup_file.name,
                    "path": str(backup_file),
                    "size_bytes": stat_info.st_size,
                    "size_mb": round(size_mb, 2),
                    "created_at": datetime.fromtimestamp(stat_info.st_ctime).isoformat(),
                    "is_compressed": backup_file.suffix == '.gz',
                    "metadata": metadata
                }
                backups.append(backup_info)
                
            except Exception as e:
                logger.warning(f"Error reading backup {backup_file.name}: {e}")
        
        # Sort by creation time descending
        backups.sort(key=lambda x: x['created_at'], reverse=True)
        return backups
    
    def delete_backup(self, filename: str) -> bool:
        """Delete a backup file and its metadata"""
        backup_path = self.backup_dir / filename
        
        if not backup_path.exists():
            raise FileNotFoundError(f"Backup not found: {filename}")
        
        try:
            backup_path.unlink()
            
            # Try to delete metadata entry
            manifest_path = self.backup_dir / self.METADATA_FILE
            if manifest_path.exists():
                try:
                    with open(manifest_path, 'r') as f:
                        manifest = json.load(f)
                    
                    manifest = [m for m in manifest if m['filename'] != filename]
                    
                    with open(manifest_path, 'w') as f:
                        json.dump(manifest, f, indent=2)
                except Exception as e:
                    logger.warning(f"Failed to update metadata: {e}")
            
            logger.info(f"Backup deleted: {filename}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete backup: {e}")
            raise
    
    def cleanup_old_backups(self, retention_days: int = 30, max_backups: int = 10) -> int:
        """
        Clean up old backups based on retention policy.
        
        Args:
            retention_days: Delete backups older than this (default 30 days)
            max_backups: Keep maximum this many backups
            
        Returns:
            Number of backups deleted
        """
        deleted_count = 0
        backups = self.list_backups()
        
        if not backups:
            return 0
        
        cutoff_date = datetime.now() - timedelta(days=retention_days)
        
        for backup_info in backups:
            backup_path = Path(backup_info['path'])
            created_at = datetime.fromisoformat(backup_info['created_at'])
            
            # Delete if older than retention period
            if created_at < cutoff_date:
                try:
                    self.delete_backup(backup_info['filename'])
                    deleted_count += 1
                except Exception as e:
                    logger.warning(f"Failed to delete old backup: {e}")
            
            # Delete if exceeds max count
            if deleted_count + (len(backups) - backups.index(backup_info)) > max_backups:
                try:
                    self.delete_backup(backup_info['filename'])
                    deleted_count += 1
                except Exception as e:
                    logger.warning(f"Failed to delete excess backup: {e}")
        
        logger.info(f"Cleanup completed: {deleted_count} backups deleted")
        return deleted_count
    
    def _save_metadata(self, metadata: BackupMetadata) -> None:
        """Save backup metadata to manifest file"""
        manifest_path = self.backup_dir / self.METADATA_FILE
        
        try:
            # Load existing manifest
            manifest = []
            if manifest_path.exists():
                with open(manifest_path, 'r') as f:
                    manifest = json.load(f)
            
            # Add new metadata
            manifest.append(metadata.to_dict())
            
            # Save manifest
            with open(manifest_path, 'w') as f:
                json.dump(manifest, f, indent=2)
                
        except Exception as e:
            logger.warning(f"Failed to save backup metadata: {e}")
    
    def get_backup_metadata(self, filename: str) -> Optional[Dict[str, Any]]:
        """Get metadata for a specific backup"""
        manifest_path = self.backup_dir / self.METADATA_FILE
        
        if not manifest_path.exists():
            return None
        
        try:
            with open(manifest_path, 'r') as f:
                manifest = json.load(f)
            
            for metadata in manifest:
                if metadata['filename'] == filename:
                    return metadata
                    
        except Exception as e:
            logger.warning(f"Failed to read backup metadata: {e}")
        
        return None
    
    def verify_backup(self, filename: str) -> Dict[str, Any]:
        """Verify integrity of a backup file"""
        backup_path = self.backup_dir / filename
        
        if not backup_path.exists():
            raise FileNotFoundError(f"Backup not found: {filename}")
        
        result = {
            "filename": filename,
            "valid": False,
            "checksum_match": False,
            "error": None
        }
        
        try:
            metadata = self.get_backup_metadata(filename)
            
            if not metadata:
                result["error"] = "No metadata found for backup"
                return result
            
            # Calculate current checksum
            current_checksum = self._calculate_checksum(backup_path)
            
            # Compare with stored checksum
            result["checksum_match"] = current_checksum == metadata['checksum']
            result["valid"] = result["checksum_match"]
            
            if not result["checksum_match"]:
                result["error"] = "Checksum mismatch - backup may be corrupted"
            
        except Exception as e:
            result["error"] = str(e)
        
        return result