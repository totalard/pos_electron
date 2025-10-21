"""
Tortoise ORM configuration for SQLite database
"""
from pathlib import Path

# Get the project root directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Database file path
DB_PATH = BASE_DIR / "data" / "pos.db"

# Ensure data directory exists
DB_PATH.parent.mkdir(parents=True, exist_ok=True)

# Tortoise ORM configuration
TORTOISE_ORM = {
    "connections": {
        "default": {
            "engine": "tortoise.backends.sqlite",
            "credentials": {
                "file_path": str(DB_PATH),
                # SQLite PRAGMA settings for better performance and reliability
                "journal_mode": "WAL",  # Write-Ahead Logging for better concurrency
                "journal_size_limit": 16384,  # 16KB journal size limit
                "foreign_keys": "ON",  # Enforce referential integrity
            }
        }
    },
    "apps": {
        "models": {
            "models": [
                "src.database.models.user",
                "src.database.models.user_activity",
                "src.database.models.customer",
                "src.database.models.customer_transaction",
                "src.database.models.product",
                "src.database.models.inventory",
                "src.database.models.settings",  # Old JSON-based settings (deprecated)
                "src.database.models.setting",   # New normalized settings
                "src.database.models.tax_rule",
                "src.database.models.sale",
                "src.database.models.cash_transaction",
                "src.database.models.expense",
                "src.database.models.discount",
                "src.database.models.pos_session",  # POS Session management
                "aerich.models"  # Required for Aerich migrations
            ],
            "default_connection": "default",
        }
    },
    # Timezone settings
    "use_tz": True,
    "timezone": "UTC"
}
