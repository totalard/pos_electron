"""
Application configuration settings
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings"""
    
    APP_NAME: str = "POS Backend"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # CORS settings
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]
    
    # Database settings (add when needed)
    # DATABASE_URL: str = "sqlite:///./pos.db"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

