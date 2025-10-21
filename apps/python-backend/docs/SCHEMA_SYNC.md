# Automatic Schema Synchronization System

## Overview

The automatic schema synchronization system eliminates the need for manual Pydantic schema maintenance by automatically generating schemas from Tortoise ORM models. This ensures that API schemas always stay in sync with database models.

## Features

- **Automatic Generation**: Schemas are generated from Tortoise ORM models using introspection
- **File Watching**: Monitors model files for changes and regenerates schemas automatically
- **Backup System**: Creates backups before regeneration with rotation
- **Validation**: Validates generated schemas before writing
- **CLI Commands**: Manual control via command-line interface
- **Configurable**: Flexible configuration via environment variables
- **Development Integration**: Seamlessly integrates with development workflow

## Architecture

### Components

1. **Schema Generator** (`src/utils/schema_generator.py`)
   - Introspects Tortoise ORM models
   - Maps field types (Tortoise → Pydantic)
   - Generates Create/Update/Response schema variants
   - Handles relationships and enums

2. **File Watcher** (`src/utils/file_watcher.py`)
   - Monitors model files for changes
   - Implements debouncing to avoid excessive regeneration
   - Uses watchdog library for efficient file system monitoring

3. **Schema Sync Service** (`src/services/schema_sync.py`)
   - Orchestrates synchronization process
   - Compares manual and generated schemas
   - Validates generated schemas
   - Manages backup creation

4. **Backup Manager** (`src/utils/schema_backup.py`)
   - Creates timestamped backups
   - Implements backup rotation
   - Provides restore functionality

5. **Configuration** (`src/config/schema_sync_config.py`)
   - Flexible settings via environment variables
   - Environment-specific behavior
   - Path configuration

6. **CLI Interface** (`src/cli/schema_sync_cli.py`)
   - Manual schema sync commands
   - Backup management
   - Status reporting

## Installation

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

The system requires the `watchdog` package for file watching:

```bash
pip install watchdog==6.0.0
```

### 2. Configuration

Create a `.env` file in the backend root or set environment variables:

```bash
# Enable/disable features
SCHEMA_SYNC_AUTO_SYNC_ENABLED=true
SCHEMA_SYNC_WATCH_ENABLED=true
SCHEMA_SYNC_BACKUP_ENABLED=true

# Environment
SCHEMA_SYNC_ENVIRONMENT=development

# Paths (optional, defaults are provided)
SCHEMA_SYNC_MODELS_PATH=src/database/models
SCHEMA_SYNC_MANUAL_SCHEMA_PATH=src/api/schemas.py
SCHEMA_SYNC_GENERATED_SCHEMA_PATH=src/api/schemas_generated.py
SCHEMA_SYNC_BACKUP_DIR=backups/schemas

# Behavior
SCHEMA_SYNC_WATCH_DEBOUNCE_SECONDS=2.0
SCHEMA_SYNC_MAX_BACKUPS=10
SCHEMA_SYNC_FAIL_ON_VALIDATION_ERROR=true
```

## Usage

### Automatic Synchronization

The system automatically runs on application startup in development mode:

```bash
python -m uvicorn src.main:app --reload
```

Output:
```
INFO - Running automatic schema synchronization...
INFO - Generating schemas for 15 models...
INFO - Schemas written to: src/api/schemas_generated.py
INFO - Schema synchronization completed successfully
INFO - Starting file watcher for automatic schema regeneration...
INFO - File watcher started successfully
```

### Manual Synchronization

Use the CLI for manual control:

```bash
# Sync schemas
python -m src.cli.schema_sync_cli sync

# Dry run (preview changes)
python -m src.cli.schema_sync_cli sync --dry-run

# Force regeneration
python -m src.cli.schema_sync_cli sync --force

# Validate schemas
python -m src.cli.schema_sync_cli validate

# Check status
python -m src.cli.schema_sync_cli status

# Manage backups
python -m src.cli.schema_sync_cli backup list
python -m src.cli.schema_sync_cli backup restore --name schema_backup_20250121_120000
python -m src.cli.schema_sync_cli backup delete --name schema_backup_20250121_120000
```

### Programmatic Usage

```python
from src.services.schema_sync import sync_schemas_from_models
from src.utils.schema_generator import generate_schemas_from_models

# Full synchronization
result = await sync_schemas_from_models(force=True)

# Just generate schemas
output_path = await generate_schemas_from_models()
```

## Configuration Options

### Environment Variables

All configuration options can be set via environment variables with the `SCHEMA_SYNC_` prefix:

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `AUTO_SYNC_ENABLED` | bool | true | Enable automatic sync on startup |
| `WATCH_ENABLED` | bool | true | Enable file watching |
| `BACKUP_ENABLED` | bool | true | Create backups before regeneration |
| `VALIDATION_ENABLED` | bool | true | Validate generated schemas |
| `ENVIRONMENT` | str | development | Current environment |
| `WATCH_DEBOUNCE_SECONDS` | float | 2.0 | Debounce period for file watcher |
| `MAX_BACKUPS` | int | 10 | Maximum backups to keep |
| `FAIL_ON_VALIDATION_ERROR` | bool | true | Fail startup on validation error |
| `ENABLE_IN_PRODUCTION` | bool | false | Enable in production (not recommended) |

### Python Configuration

```python
from src.config.schema_sync_config import get_config

config = get_config()

# Check settings
if config.should_run_sync():
    # Run synchronization
    pass

if config.should_watch_files():
    # Start file watcher
    pass
```

## Generated Schema Structure

For each Tortoise model, the system generates three schema variants:

### 1. Create Schema
Used for creating new records (excludes auto-generated fields):

```python
class ProductCreate(BaseModel):
    """Schema for creating a new product"""
    name: str = Field(..., min_length=1, max_length=255)
    base_price: float = Field(..., ge=0)
    # ... other fields
```

### 2. Update Schema
Used for updating records (all fields optional):

```python
class ProductUpdate(BaseModel):
    """Schema for updating a product"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    base_price: Optional[float] = Field(None, ge=0)
    # ... other fields
```

### 3. Response Schema
Used for API responses (includes all fields):

```python
class ProductResponse(BaseModel):
    """Schema for product response"""
    id: int
    name: str
    base_price: float
    created_at: datetime
    updated_at: datetime
    # ... other fields
    
    class Config:
        from_attributes = True
```

## Field Type Mapping

The system automatically maps Tortoise field types to Pydantic types:

| Tortoise Field | Python Type | Pydantic Type |
|----------------|-------------|---------------|
| IntField | int | int |
| CharField | str | str |
| TextField | str | str |
| BooleanField | bool | bool |
| FloatField | float | float |
| DecimalField | Decimal | Decimal |
| DatetimeField | datetime | datetime |
| JSONField | Dict[str, Any] | Dict[str, Any] |
| ForeignKeyField | int | int (ID reference) |
| CharEnumField | str | str (with enum) |

## File Watching

The file watcher monitors the models directory for changes:

- **Triggers**: File creation, modification, deletion
- **Debouncing**: 2-second delay to batch rapid changes
- **Filters**: Ignores `__pycache__`, temporary files, non-Python files
- **Automatic**: Runs in background during development

### Disable File Watching

```bash
SCHEMA_SYNC_WATCH_ENABLED=false python -m uvicorn src.main:app --reload
```

## Backup System

### Automatic Backups

Backups are created automatically before schema regeneration:

```
backups/schemas/
├── schema_backup_20250121_120000/
│   ├── schemas.py
│   ├── schemas_generated.py
│   └── backup_metadata.txt
├── schema_backup_20250121_130000/
│   └── ...
```

### Backup Rotation

The system maintains a maximum number of backups (default: 10) and automatically removes old backups.

### Restore from Backup

```bash
# List backups
python -m src.cli.schema_sync_cli backup list

# Restore specific backup
python -m src.cli.schema_sync_cli backup restore --name schema_backup_20250121_120000
```

## Validation

The system validates generated schemas before writing:

1. **Syntax Validation**: Ensures valid Python syntax
2. **Import Validation**: Checks for required imports
3. **Structure Validation**: Verifies schema structure

If validation fails:
- In development: Warning logged, can continue
- In production: Startup fails (if `FAIL_ON_VALIDATION_ERROR=true`)

## Customization

### Custom Field Validators

To add custom validators to generated schemas:

1. Generate base schemas automatically
2. Extend generated schemas in manual schema file
3. Import and use extended schemas in API routes

Example:

```python
# src/api/schemas.py
from .schemas_generated import ProductCreate as BaseProductCreate

class ProductCreate(BaseProductCreate):
    """Extended product create schema with custom validation"""
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        if 'forbidden' in v.lower():
            raise ValueError('Name contains forbidden word')
        return v
```

### Custom Schema Templates

Modify the generator to use custom templates:

```python
from src.utils.schema_generator import SchemaGenerator

class CustomSchemaGenerator(SchemaGenerator):
    def generate_create_schema(self, model):
        # Custom generation logic
        pass
```

## Troubleshooting

### Schema Generation Fails

**Problem**: Schema generation fails with import errors

**Solution**: Ensure all model dependencies are properly imported in `schema_generator.py`:

```python
from src.database.models import (
    user, customer, product, ...
)
```

### File Watcher Not Working

**Problem**: File changes not triggering regeneration

**Solution**: 
1. Check if watchdog is installed: `pip install watchdog`
2. Verify watch is enabled: `SCHEMA_SYNC_WATCH_ENABLED=true`
3. Check logs for watcher errors

### Validation Errors

**Problem**: Generated schemas fail validation

**Solution**:
1. Run validation manually: `python -m src.cli.schema_sync_cli validate`
2. Check generated file for syntax errors
3. Review model definitions for unsupported field types

### Backup Directory Full

**Problem**: Too many backups consuming disk space

**Solution**: Reduce `MAX_BACKUPS` setting or manually clean old backups:

```bash
python -m src.cli.schema_sync_cli backup list
python -m src.cli.schema_sync_cli backup delete --name old_backup_name
```

## Testing

Run the test suite to verify the system:

```bash
python test_schema_sync.py
```

This tests:
- Configuration loading
- Backup system
- Schema generation
- Full synchronization

## Production Deployment

### Recommendations

1. **Disable Auto-Sync**: Set `SCHEMA_SYNC_AUTO_SYNC_ENABLED=false`
2. **Disable File Watching**: Set `SCHEMA_SYNC_WATCH_ENABLED=false`
3. **Pre-generate Schemas**: Run sync during build/deployment
4. **Use Generated Schemas**: Commit generated schemas to version control

### Deployment Workflow

```bash
# During build/CI
SCHEMA_SYNC_ENVIRONMENT=production python -m src.cli.schema_sync_cli sync

# Commit generated schemas
git add src/api/schemas_generated.py
git commit -m "Update generated schemas"

# Deploy with auto-sync disabled
SCHEMA_SYNC_AUTO_SYNC_ENABLED=false python -m uvicorn src.main:app
```

## Performance

- **Generation Time**: ~100-500ms for 15-20 models
- **File Watching**: Minimal overhead (<1% CPU)
- **Backup Creation**: ~10-50ms per backup
- **Memory Usage**: <10MB additional memory

## Best Practices

1. **Version Control**: Commit generated schemas for production
2. **Review Changes**: Review generated schema diffs before committing
3. **Custom Validators**: Add custom validators in separate files
4. **Testing**: Test API with generated schemas before deployment
5. **Monitoring**: Monitor schema sync logs for errors
6. **Backups**: Keep backups for rollback capability

## Migration from Manual Schemas

### Step 1: Generate Initial Schemas

```bash
python -m src.cli.schema_sync_cli sync --dry-run
```

### Step 2: Compare with Manual Schemas

Review the comparison output to identify differences.

### Step 3: Extract Custom Logic

Move custom validators and methods to separate extension files.

### Step 4: Switch to Generated Schemas

Update imports to use generated schemas:

```python
# Before
from src.api.schemas import ProductCreate

# After
from src.api.schemas_generated import ProductCreate
```

### Step 5: Enable Auto-Sync

Set `SCHEMA_SYNC_AUTO_SYNC_ENABLED=true` and restart the server.

## Support

For issues or questions:
1. Check logs: `tail -f logs/schema_sync.log`
2. Run diagnostics: `python -m src.cli.schema_sync_cli status`
3. Test manually: `python test_schema_sync.py`
4. Review configuration: `python -m src.cli.schema_sync_cli status`

## Future Enhancements

Potential future improvements:
- GraphQL schema generation
- OpenAPI spec auto-generation
- Schema versioning and migration
- Custom field type plugins
- IDE integration for schema preview
- Real-time schema validation in editors
