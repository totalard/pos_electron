# Quick Start: Automatic Schema Synchronization

## What is it?

The automatic schema synchronization system generates Pydantic schemas from your Tortoise ORM models, eliminating the need to manually maintain schema definitions.

## 5-Minute Setup

### 1. Install Dependencies

```bash
cd apps/python-backend
pip install -r requirements.txt
```

This installs `watchdog` for file watching.

### 2. Start the Server

```bash
python -m uvicorn src.main:app --reload
```

On startup, you'll see:

```
INFO - Running automatic schema synchronization...
INFO - Generating schemas for 15 models...
INFO - Schemas written to: src/api/schemas_generated.py
INFO - Schema synchronization completed successfully
INFO - Starting file watcher for automatic schema regeneration...
```

### 3. Check Generated Schemas

```bash
cat src/api/schemas_generated.py
```

You'll see auto-generated schemas like:

```python
class ProductCreate(BaseModel):
    """Schema for creating a new product"""
    name: str = Field(..., min_length=1, max_length=255)
    base_price: float = Field(..., ge=0)
    # ...

class ProductUpdate(BaseModel):
    """Schema for updating a product"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    # ...

class ProductResponse(BaseModel):
    """Schema for product response"""
    id: int
    name: str
    created_at: datetime
    # ...
```

### 4. Test File Watching

Edit a model file:

```bash
# Edit a model
nano src/database/models/product.py

# Add a new field
# new_field = fields.CharField(max_length=100, null=True)

# Save the file
```

Within 2 seconds, schemas will automatically regenerate:

```
INFO - Model file modified: src/database/models/product.py
INFO - Triggering schema regeneration after debounce period
INFO - Generating schemas for 15 models...
INFO - Schemas written to: src/api/schemas_generated.py
```

## Common Commands

### Manual Sync

```bash
# Sync schemas manually
python -m src.cli.schema_sync_cli sync

# Preview changes without writing
python -m src.cli.schema_sync_cli sync --dry-run

# Force regeneration
python -m src.cli.schema_sync_cli sync --force
```

### Check Status

```bash
python -m src.cli.schema_sync_cli status
```

Output:
```
================================================================================
SCHEMA SYNC STATUS
================================================================================
Last Sync: 2025-01-21T12:00:00
Manual Schema Exists: True
Generated Schema Exists: True
Manual Schema Path: src/api/schemas.py
Generated Schema Path: src/api/schemas_generated.py
Backup Enabled: True
Auto Merge: False
================================================================================
```

### Manage Backups

```bash
# List backups
python -m src.cli.schema_sync_cli backup list

# Restore a backup
python -m src.cli.schema_sync_cli backup restore --name schema_backup_20250121_120000

# Delete a backup
python -m src.cli.schema_sync_cli backup delete --name schema_backup_20250121_120000
```

### Validate Schemas

```bash
python -m src.cli.schema_sync_cli validate
```

## Configuration

Create `.env` file or set environment variables:

```bash
# Enable/disable features
SCHEMA_SYNC_AUTO_SYNC_ENABLED=true
SCHEMA_SYNC_WATCH_ENABLED=true
SCHEMA_SYNC_BACKUP_ENABLED=true

# Environment
SCHEMA_SYNC_ENVIRONMENT=development

# Behavior
SCHEMA_SYNC_WATCH_DEBOUNCE_SECONDS=2.0
SCHEMA_SYNC_MAX_BACKUPS=10
```

## Using Generated Schemas

### In API Routes

```python
from src.api.schemas_generated import (
    ProductCreate,
    ProductUpdate,
    ProductResponse
)

@router.post("/products", response_model=ProductResponse)
async def create_product(product: ProductCreate):
    # Create product logic
    pass
```

### Extending Generated Schemas

If you need custom validators:

```python
# src/api/schemas.py
from .schemas_generated import ProductCreate as BaseProductCreate

class ProductCreate(BaseProductCreate):
    """Extended product schema with custom validation"""
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        if 'forbidden' in v.lower():
            raise ValueError('Name contains forbidden word')
        return v
```

## Disabling Auto-Sync

### For Production

```bash
SCHEMA_SYNC_AUTO_SYNC_ENABLED=false \
SCHEMA_SYNC_WATCH_ENABLED=false \
python -m uvicorn src.main:app
```

### Temporarily

```bash
# Disable in .env
SCHEMA_SYNC_AUTO_SYNC_ENABLED=false

# Or set environment variable
export SCHEMA_SYNC_AUTO_SYNC_ENABLED=false
```

## Troubleshooting

### Schemas Not Generating

**Check logs:**
```bash
# Look for errors in startup logs
python -m uvicorn src.main:app --reload 2>&1 | grep -i schema
```

**Run test:**
```bash
python test_schema_sync.py
```

### File Watcher Not Working

**Check if watchdog is installed:**
```bash
pip list | grep watchdog
```

**Install if missing:**
```bash
pip install watchdog==6.0.0
```

### Validation Errors

**Run validation manually:**
```bash
python -m src.cli.schema_sync_cli validate
```

**Check generated file:**
```bash
python -c "import ast; ast.parse(open('src/api/schemas_generated.py').read())"
```

## Testing

Run the test suite:

```bash
python test_schema_sync.py
```

Expected output:
```
================================================================================
SCHEMA SYNCHRONIZATION SYSTEM TEST SUITE
================================================================================

✓ PASS: config
✓ PASS: backup
✓ PASS: generation
✓ PASS: sync

================================================================================
Overall: ✓ ALL TESTS PASSED
================================================================================
```

## Next Steps

1. **Review Generated Schemas**: Check `src/api/schemas_generated.py`
2. **Update API Routes**: Use generated schemas in your endpoints
3. **Add Custom Validators**: Extend schemas as needed
4. **Configure for Production**: Disable auto-sync and file watching
5. **Read Full Documentation**: See [SCHEMA_SYNC.md](SCHEMA_SYNC.md)

## Benefits

- ✅ **No Manual Maintenance**: Schemas auto-update when models change
- ✅ **Always in Sync**: Eliminates schema/model drift
- ✅ **Type Safety**: Full Pydantic validation
- ✅ **Development Speed**: Focus on models, schemas follow
- ✅ **Backup Safety**: Automatic backups before changes
- ✅ **Flexible**: Extend generated schemas as needed

## Support

- **Documentation**: [SCHEMA_SYNC.md](SCHEMA_SYNC.md)
- **Test Suite**: `python test_schema_sync.py`
- **CLI Help**: `python -m src.cli.schema_sync_cli --help`
- **Status Check**: `python -m src.cli.schema_sync_cli status`
