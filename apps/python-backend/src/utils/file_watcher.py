"""
File watcher for automatic schema regeneration on model changes.

Monitors model files and triggers schema regeneration when changes are detected.
"""
import asyncio
import logging
from pathlib import Path
from typing import Callable, Optional, Set
from datetime import datetime, timedelta

try:
    from watchdog.observers import Observer
    from watchdog.events import FileSystemEventHandler, FileSystemEvent
    WATCHDOG_AVAILABLE = True
except ImportError:
    WATCHDOG_AVAILABLE = False
    Observer = None
    FileSystemEventHandler = None
    FileSystemEvent = None

logger = logging.getLogger(__name__)


class ModelFileHandler(FileSystemEventHandler):
    """
    File system event handler for model file changes.
    
    Implements debouncing to avoid excessive regeneration on rapid file changes.
    """
    
    def __init__(
        self, 
        callback: Callable[[], None], 
        debounce_seconds: float = 2.0,
        watch_patterns: Optional[Set[str]] = None
    ):
        """
        Initialize file handler.
        
        Args:
            callback: Function to call when model files change
            debounce_seconds: Seconds to wait before triggering callback
            watch_patterns: Set of file patterns to watch (e.g., {'.py'})
        """
        super().__init__()
        self.callback = callback
        self.debounce_seconds = debounce_seconds
        self.watch_patterns = watch_patterns or {'.py'}
        self.last_trigger: Optional[datetime] = None
        self.pending_trigger: Optional[asyncio.Task] = None
        self._lock = asyncio.Lock()
        
    def should_process_event(self, event: 'FileSystemEvent') -> bool:
        """
        Determine if an event should trigger schema regeneration.
        
        Args:
            event: File system event
            
        Returns:
            True if event should be processed
        """
        if event.is_directory:
            return False
            
        # Check file extension
        file_path = Path(event.src_path)
        if file_path.suffix not in self.watch_patterns:
            return False
            
        # Ignore __pycache__ and other generated files
        if '__pycache__' in file_path.parts:
            return False
            
        # Ignore temporary files
        if file_path.name.startswith('.') or file_path.name.endswith('~'):
            return False
            
        return True
    
    async def trigger_callback_debounced(self):
        """
        Trigger callback after debounce period.
        """
        await asyncio.sleep(self.debounce_seconds)
        
        async with self._lock:
            logger.info("Triggering schema regeneration after debounce period")
            try:
                if asyncio.iscoroutinefunction(self.callback):
                    await self.callback()
                else:
                    self.callback()
                self.last_trigger = datetime.now()
            except Exception as e:
                logger.error(f"Error in schema regeneration callback: {e}", exc_info=True)
            finally:
                self.pending_trigger = None
    
    def on_modified(self, event: 'FileSystemEvent'):
        """Handle file modification events."""
        if not self.should_process_event(event):
            return
            
        logger.debug(f"Model file modified: {event.src_path}")
        self.schedule_trigger()
    
    def on_created(self, event: 'FileSystemEvent'):
        """Handle file creation events."""
        if not self.should_process_event(event):
            return
            
        logger.debug(f"Model file created: {event.src_path}")
        self.schedule_trigger()
    
    def on_deleted(self, event: 'FileSystemEvent'):
        """Handle file deletion events."""
        if not self.should_process_event(event):
            return
            
        logger.debug(f"Model file deleted: {event.src_path}")
        self.schedule_trigger()
    
    def schedule_trigger(self):
        """
        Schedule callback trigger with debouncing.
        """
        # Cancel pending trigger if exists
        if self.pending_trigger and not self.pending_trigger.done():
            self.pending_trigger.cancel()
            
        # Schedule new trigger
        self.pending_trigger = asyncio.create_task(self.trigger_callback_debounced())


class ModelFileWatcher:
    """
    Watches model files for changes and triggers schema regeneration.
    
    Uses watchdog library for efficient file system monitoring.
    """
    
    def __init__(
        self,
        models_path: Path,
        callback: Callable[[], None],
        debounce_seconds: float = 2.0,
        recursive: bool = True
    ):
        """
        Initialize file watcher.
        
        Args:
            models_path: Path to models directory to watch
            callback: Function to call when changes detected
            debounce_seconds: Seconds to wait before triggering callback
            recursive: Whether to watch subdirectories
        """
        if not WATCHDOG_AVAILABLE:
            raise ImportError(
                "watchdog package is required for file watching. "
                "Install it with: pip install watchdog"
            )
            
        self.models_path = models_path
        self.callback = callback
        self.debounce_seconds = debounce_seconds
        self.recursive = recursive
        
        self.observer: Optional[Observer] = None
        self.event_handler: Optional[ModelFileHandler] = None
        self._running = False
        
    def start(self):
        """
        Start watching for file changes.
        """
        if self._running:
            logger.warning("File watcher is already running")
            return
            
        if not self.models_path.exists():
            logger.error(f"Models path does not exist: {self.models_path}")
            return
            
        logger.info(f"Starting file watcher for: {self.models_path}")
        
        # Create event handler
        self.event_handler = ModelFileHandler(
            callback=self.callback,
            debounce_seconds=self.debounce_seconds
        )
        
        # Create and start observer
        self.observer = Observer()
        self.observer.schedule(
            self.event_handler,
            str(self.models_path),
            recursive=self.recursive
        )
        self.observer.start()
        
        self._running = True
        logger.info("File watcher started successfully")
    
    def stop(self):
        """
        Stop watching for file changes.
        """
        if not self._running:
            return
            
        logger.info("Stopping file watcher...")
        
        if self.observer:
            self.observer.stop()
            self.observer.join(timeout=5)
            
        self._running = False
        logger.info("File watcher stopped")
    
    def is_running(self) -> bool:
        """
        Check if watcher is currently running.
        
        Returns:
            True if watcher is running
        """
        return self._running
    
    def __enter__(self):
        """Context manager entry."""
        self.start()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.stop()


async def watch_models_for_changes(
    models_path: Optional[Path] = None,
    callback: Optional[Callable] = None,
    debounce_seconds: float = 2.0
) -> ModelFileWatcher:
    """
    Convenience function to start watching model files.
    
    Args:
        models_path: Path to models directory (default: src/database/models)
        callback: Callback function (default: regenerate schemas)
        debounce_seconds: Debounce period in seconds
        
    Returns:
        ModelFileWatcher instance
    """
    if not WATCHDOG_AVAILABLE:
        logger.warning(
            "watchdog package not available. File watching disabled. "
            "Install with: pip install watchdog"
        )
        return None
        
    # Default paths
    if models_path is None:
        models_path = Path(__file__).parent.parent / "database" / "models"
        
    # Default callback
    if callback is None:
        from .schema_generator import generate_schemas_from_models
        callback = generate_schemas_from_models
        
    # Create and start watcher
    watcher = ModelFileWatcher(
        models_path=models_path,
        callback=callback,
        debounce_seconds=debounce_seconds
    )
    
    watcher.start()
    
    return watcher
