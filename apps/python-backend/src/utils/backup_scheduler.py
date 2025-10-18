"""
Background backup scheduler for automated backups.

Handles:
- Scheduled backup execution
- Progress tracking
- Retention policy enforcement
- Error handling and notifications
"""

import asyncio
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, Callable, Dict, Any

logger = logging.getLogger(__name__)


class BackupScheduler:
    """Manages scheduled backup operations"""
    
    def __init__(self, backup_manager, database_path: Path):
        """
        Initialize backup scheduler.
        
        Args:
            backup_manager: BackupManager instance
            database_path: Path to database
        """
        self.backup_manager = backup_manager
        self.database_path = database_path
        self.is_running = False
        self.current_task: Optional[asyncio.Task] = None
        self.progress_callback: Optional[Callable] = None
        self.error_callback: Optional[Callable] = None
        self.last_backup_time: Optional[datetime] = None
        
    def set_progress_callback(self, callback: Callable[[Dict[str, Any]], None]) -> None:
        """Set callback for progress updates"""
        self.progress_callback = callback
    
    def set_error_callback(self, callback: Callable[[str], None]) -> None:
        """Set callback for error notifications"""
        self.error_callback = callback
    
    def _emit_progress(self, status: str, progress: int = 0, message: str = "") -> None:
        """Emit progress update"""
        if self.progress_callback:
            self.progress_callback({
                "status": status,  # 'pending', 'in_progress', 'completed', 'failed'
                "progress": progress,  # 0-100
                "message": message,
                "timestamp": datetime.now().isoformat()
            })
    
    def _emit_error(self, message: str) -> None:
        """Emit error notification"""
        logger.error(message)
        if self.error_callback:
            self.error_callback(message)
    
    async def start_scheduler(self, check_interval: int = 60) -> None:
        """
        Start the backup scheduler.
        
        Args:
            check_interval: Check interval in seconds
        """
        if self.is_running:
            logger.warning("Scheduler already running")
            return
        
        self.is_running = True
        self._emit_progress("started", 0, "Backup scheduler started")
        
        try:
            while self.is_running:
                try:
                    # Check if backup is needed
                    if self._should_backup():
                        await self._perform_scheduled_backup()
                    
                    # Sleep before next check
                    await asyncio.sleep(check_interval)
                    
                except Exception as e:
                    self._emit_error(f"Scheduler error: {e}")
                    await asyncio.sleep(check_interval)
                    
        except asyncio.CancelledError:
            logger.info("Backup scheduler cancelled")
        finally:
            self.is_running = False
            self._emit_progress("stopped", 100, "Backup scheduler stopped")
    
    def stop_scheduler(self) -> None:
        """Stop the backup scheduler"""
        self.is_running = False
        if self.current_task:
            self.current_task.cancel()
    
    def _should_backup(self) -> bool:
        """Determine if backup should be performed"""
        # This will be implemented with actual schedule logic
        # For now, simple time-based check
        if not self.last_backup_time:
            return True
        
        # Check if 24 hours have passed since last backup
        elapsed = datetime.now() - self.last_backup_time
        return elapsed >= timedelta(hours=24)
    
    async def _perform_scheduled_backup(self) -> None:
        """Perform a scheduled backup"""
        try:
            self._emit_progress("in_progress", 10, "Starting backup...")
            
            # Perform backup
            self._emit_progress("in_progress", 50, "Backing up database...")
            metadata = self.backup_manager.create_backup(
                compression=True,
                backup_type='full'
            )
            
            self._emit_progress("in_progress", 80, "Finalizing backup...")
            
            # Cleanup old backups
            self.backup_manager.cleanup_old_backups(retention_days=30, max_backups=10)
            
            self.last_backup_time = datetime.now()
            self._emit_progress(
                "completed",
                100,
                f"Backup completed: {metadata.filename}"
            )
            
            logger.info(f"Scheduled backup completed: {metadata.filename}")
            
        except Exception as e:
            self._emit_error(f"Scheduled backup failed: {e}")
            self._emit_progress("failed", 0, str(e))
    
    async def execute_backup_now(
        self,
        compression: bool = True,
        backup_type: str = 'full',
        selected_tables: Optional[list] = None
    ) -> Dict[str, Any]:
        """
        Manually trigger a backup with progress tracking.
        
        Args:
            compression: Enable compression
            backup_type: Type of backup
            selected_tables: For selective backup
            
        Returns:
            Backup metadata
        """
        try:
            self._emit_progress("in_progress", 10, "Preparing backup...")
            
            # Run backup in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            metadata = await loop.run_in_executor(
                None,
                self.backup_manager.create_backup,
                compression,
                False,  # encryption
                backup_type,
                selected_tables
            )
            
            self._emit_progress("in_progress", 90, "Finalizing...")
            
            self.last_backup_time = datetime.now()
            
            self._emit_progress(
                "completed",
                100,
                f"Backup completed: {metadata.filename}"
            )
            
            return metadata.to_dict()
            
        except Exception as e:
            error_msg = f"Backup failed: {e}"
            self._emit_error(error_msg)
            self._emit_progress("failed", 0, error_msg)
            raise
    
    async def execute_restore(
        self,
        backup_file: Path,
        verify: bool = True
    ) -> Dict[str, Any]:
        """
        Restore from backup with progress tracking.
        
        Args:
            backup_file: Path to backup file
            verify: Verify backup before restore
            
        Returns:
            Restore result
        """
        try:
            self._emit_progress("in_progress", 10, "Verifying backup...")
            
            if verify:
                verification = self.backup_manager.verify_backup(backup_file.name)
                if not verification['valid']:
                    raise ValueError(f"Backup verification failed: {verification['error']}")
            
            self._emit_progress("in_progress", 40, "Creating pre-restore backup...")
            
            # Run restore in thread pool
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None,
                self.backup_manager.restore_backup,
                backup_file,
                verify
            )
            
            self._emit_progress("completed", 100, "Restore completed successfully")
            
            return result
            
        except Exception as e:
            error_msg = f"Restore failed: {e}"
            self._emit_error(error_msg)
            self._emit_progress("failed", 0, error_msg)
            raise


class BackupProgressTracker:
    """Tracks backup progress for real-time updates"""
    
    def __init__(self):
        """Initialize progress tracker"""
        self.current_operation: Optional[str] = None
        self.progress: int = 0
        self.message: str = ""
        self.status: str = "idle"  # idle, pending, in_progress, completed, failed, cancelled
        self.start_time: Optional[datetime] = None
        self.estimated_remaining: Optional[timedelta] = None
        
    def start(self, operation: str) -> None:
        """Start tracking an operation"""
        self.current_operation = operation
        self.progress = 0
        self.status = "pending"
        self.start_time = datetime.now()
        self.message = f"{operation} started"
    
    def update(self, progress: int, message: str = "") -> None:
        """Update progress"""
        self.progress = min(100, max(0, progress))
        self.status = "in_progress"
        if message:
            self.message = message
        
        # Calculate estimated time remaining
        if self.start_time and self.progress > 0:
            elapsed = datetime.now() - self.start_time
            total_estimated = elapsed * (100 / self.progress)
            self.estimated_remaining = total_estimated - elapsed
    
    def complete(self, message: str = "") -> None:
        """Mark operation as complete"""
        self.progress = 100
        self.status = "completed"
        self.message = message or f"{self.current_operation} completed"
    
    def fail(self, message: str = "") -> None:
        """Mark operation as failed"""
        self.status = "failed"
        self.message = message or f"{self.current_operation} failed"
    
    def cancel(self) -> None:
        """Cancel operation"""
        self.status = "cancelled"
        self.message = f"{self.current_operation} cancelled"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "operation": self.current_operation,
            "progress": self.progress,
            "status": self.status,
            "message": self.message,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "estimated_remaining": str(self.estimated_remaining) if self.estimated_remaining else None
        }