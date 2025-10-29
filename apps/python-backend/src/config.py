"""
Application configuration settings
"""
from pathlib import Path
from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""

    APP_NAME: str = "POS Backend"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"  # development, staging, production

    # CORS settings
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    # Database settings
    DATABASE_URL: str = "sqlite:///./data/pos.db"
    DATABASE_ECHO: bool = False  # Set to True for SQL query logging

    # Database connection settings
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30

    @property
    def database_path(self) -> Path:
        """Get the absolute path to the database file"""
        base_dir = Path(__file__).resolve().parent.parent.parent
        return base_dir / "data" / "pos.db"

    class Config:
        """Pydantic configuration"""
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra environment variables


settings = Settings()