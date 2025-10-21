"""
Configuration for schema synchronization system.

Provides flexible configuration options via environment variables and settings.
"""
import os
from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import Field


class SchemaSyncConfig(BaseSettings):
    """
    Schema synchronization configuration settings.
    
    All settings can be overridden via environment variables with SCHEMA_SYNC_ prefix.
    """
    
    # Enable/Disable Features
    auto_sync_enabled: bool = Field(
        default=True,
        description="Enable automatic schema synchronization on startup"
    )
    
    watch_enabled: bool = Field(
        default=True,
        description="Enable file watching for automatic regeneration during development"
    )
    
    backup_enabled: bool = Field(
        default=True,
        description="Create backups before schema regeneration"
    )
    
    validation_enabled: bool = Field(
        default=True,
        description="Validate generated schemas before writing"
    )
    
    # Paths
    models_path: Optional[str] = Field(
        default=None,
        description="Path to models directory (default: src/database/models)"
    )
    
    manual_schema_path: Optional[str] = Field(
        default=None,
        description="Path to manual schemas file (default: src/api/schemas.py)"
    )
    
    generated_schema_path: Optional[str] = Field(
        default=None,
        description="Path for generated schemas (default: src/api/schemas_generated.py)"
    )
    
    backup_dir: Optional[str] = Field(
        default=None,
        description="Directory for schema backups (default: backups/schemas)"
    )
    
    # Behavior Settings
    auto_merge: bool = Field(
        default=False,
        description="Automatically merge custom schema extensions"
    )
    
    force_regenerate: bool = Field(
        default=False,
        description="Force regeneration even if no changes detected"
    )
    
    fail_on_validation_error: bool = Field(
        default=True,
        description="Fail startup if schema validation fails"
    )
    
    # File Watcher Settings
    watch_debounce_seconds: float = Field(
        default=2.0,
        ge=0.1,
        le=60.0,
        description="Debounce period for file watcher (seconds)"
    )
    
    watch_recursive: bool = Field(
        default=True,
        description="Watch subdirectories recursively"
    )
    
    # Backup Settings
    max_backups: int = Field(
        default=10,
        ge=1,
        le=100,
        description="Maximum number of backups to keep"
    )
    
    backup_compression: bool = Field(
        default=False,
        description="Compress backup files"
    )
    
    # Environment-Specific Settings
    enable_in_production: bool = Field(
        default=False,
        description="Enable schema sync in production (not recommended)"
    )
    
    environment: str = Field(
        default="development",
        description="Current environment (development, staging, production)"
    )
    
    # Logging
    log_level: str = Field(
        default="INFO",
        description="Logging level for schema sync operations"
    )
    
    verbose_logging: bool = Field(
        default=False,
        description="Enable verbose logging for debugging"
    )
    
    class Config:
        env_prefix = "SCHEMA_SYNC_"
        case_sensitive = False
        env_file = ".env"
        env_file_encoding = "utf-8"
    
    def get_models_path(self) -> Path:
        """
        Get models directory path.
        
        Returns:
            Path to models directory
        """
        if self.models_path:
            return Path(self.models_path)
        
        # Default path
        return Path(__file__).parent.parent / "database" / "models"
    
    def get_manual_schema_path(self) -> Path:
        """
        Get manual schema file path.
        
        Returns:
            Path to manual schemas
        """
        if self.manual_schema_path:
            return Path(self.manual_schema_path)
        
        # Default path
        return Path(__file__).parent.parent / "api" / "schemas.py"
    
    def get_generated_schema_path(self) -> Path:
        """
        Get generated schema file path.
        
        Returns:
            Path for generated schemas
        """
        if self.generated_schema_path:
            return Path(self.generated_schema_path)
        
        # Default path
        return Path(__file__).parent.parent / "api" / "schemas_generated.py"
    
    def get_backup_dir(self) -> Path:
        """
        Get backup directory path.
        
        Returns:
            Path to backup directory
        """
        if self.backup_dir:
            return Path(self.backup_dir)
        
        # Default path
        return Path(__file__).parent.parent.parent / "backups" / "schemas"
    
    def should_run_sync(self) -> bool:
        """
        Determine if schema sync should run based on configuration.
        
        Returns:
            True if sync should run
        """
        # Don't run in production unless explicitly enabled
        if self.environment.lower() == "production" and not self.enable_in_production:
            return False
        
        # Check if auto sync is enabled
        return self.auto_sync_enabled
    
    def should_watch_files(self) -> bool:
        """
        Determine if file watching should be enabled.
        
        Returns:
            True if file watching should be enabled
        """
        # Only watch in development
        if self.environment.lower() != "development":
            return False
        
        return self.watch_enabled


# Global configuration instance
_config: Optional[SchemaSyncConfig] = None


def get_config() -> SchemaSyncConfig:
    """
    Get or create global configuration instance.
    
    Returns:
        SchemaSyncConfig instance
    """
    global _config
    
    if _config is None:
        _config = SchemaSyncConfig()
    
    return _config


def reload_config() -> SchemaSyncConfig:
    """
    Reload configuration from environment.
    
    Returns:
        New SchemaSyncConfig instance
    """
    global _config
    _config = SchemaSyncConfig()
    return _config


# Convenience functions
def is_auto_sync_enabled() -> bool:
    """Check if auto sync is enabled."""
    return get_config().should_run_sync()


def is_watch_enabled() -> bool:
    """Check if file watching is enabled."""
    return get_config().should_watch_files()


def is_backup_enabled() -> bool:
    """Check if backup is enabled."""
    return get_config().backup_enabled
