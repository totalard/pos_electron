# Database Migrations Guide

## Overview

This document explains the database migration system implemented for the POS Electron application's Python backend.

## Why Migrations Are Needed

Tortoise ORM's `generate_schemas(safe=True)` has limitations:

- ✅ **Creates** new tables and columns if they don't exist
- ✅ **Safe** to run on every startup (idempotent)
- ❌ **Does NOT** migrate existing data when model definitions change
- ❌ **Does NOT** update column constraints automatically
- ❌ **Does NOT** transform old enum values to new ones

### Example Problem

When we changed the user role system from `PRIMARY/STAFF` to `ADMIN/USER`:

1. The model definition changed to use new enum values
2. The database still contained old values (`'primary'`, `'staff'`)
3. Tortoise ORM validation failed: `"Length of 'primary' 7 > 5"`
4. The application couldn't start

## Migration System Architecture

### Components

1. **`src/database/migrations.py`** - Migration functions and utilities
2. **`src/database/init.py`** - Database initialization with automatic migration detection
3. **Standalone scripts** - Optional manual migration tools

### How It Works

```
Application Startup
    ↓
Initialize Tortoise ORM
    ↓
Check for pending migrations
    ↓
Run migrations (if needed)
    ↓
Generate schemas (safe mode)
    ↓
Application ready
```

## Available Migrations

### 1. User Role Migration (PRIMARY/STAFF → ADMIN/USER)

**Purpose**: Migrate user roles from the old system to the new system.

**What it does**:
- Updates `'primary'` → `'admin'`
- Updates `'staff'` → `'user'`
- Skips users already using new roles
- Logs all changes for audit trail

**Function**: `migrate_user_roles()`

**Returns**:
```python
{
    'updated_count': 1,
    'skipped_count': 0,
    'error_count': 0,
    'migrations': [
        {
            'user_id': 1,
            'name': 'Primary User',
            'old_role': 'primary',
            'new_role': 'admin'
        }
    ]
}
```

### 2. Role Constraint Verification

**Purpose**: Verify all role values meet the new constraints.

**What it does**:
- Checks that all role values are ≤ 5 characters
- Ensures data compatibility with new schema
- Prevents validation errors on startup

**Function**: `update_role_column_constraints()`

## Automatic Migration on Startup

Migrations run automatically when the application starts:

```python
# In src/database/init.py
async def init_db():
    await Tortoise.init(config=TORTOISE_ORM)
    
    # Check for pending migrations
    migrations_needed = await check_migrations_needed()
    
    if migrations_needed:
        # Run migrations before schema generation
        await run_all_migrations()
    
    # Generate schemas (safe mode)
    await Tortoise.generate_schemas(safe=True)
```

### Startup Logs

**No migrations needed**:
```
INFO - Initializing Tortoise ORM...
INFO - No pending migrations detected
INFO - Tortoise ORM initialized successfully
```

**Migrations detected and run**:
```
INFO - Initializing Tortoise ORM...
INFO - Pending migrations detected: user_role_migration
INFO - Starting database migrations...
INFO - Running migration: User role migration (PRIMARY/STAFF -> ADMIN/USER)
INFO - Found 1 user(s) to check for migration
INFO - Migrated user 1 ('Primary User'): 'primary' -> 'admin'
INFO - Role migration complete: 1 updated, 0 skipped, 0 errors
INFO - All migrations completed successfully
INFO - Tortoise ORM initialized successfully
```

## Manual Migration

If you need to run migrations manually (e.g., before deployment):

### Using Python

```python
import asyncio
from tortoise import Tortoise
from src.database.config import TORTOISE_ORM
from src.database.migrations import run_all_migrations

async def migrate():
    await Tortoise.init(config=TORTOISE_ORM)
    results = await run_all_migrations()
    print(results)
    await Tortoise.close_connections()

asyncio.run(migrate())
```

### Check Migration Status

```python
from src.database.migrations import check_migrations_needed

migrations = await check_migrations_needed()
if migrations:
    print(f"Pending migrations: {migrations}")
else:
    print("No migrations needed")
```

## Adding New Migrations

To add a new migration:

### 1. Create Migration Function

Add to `src/database/migrations.py`:

```python
async def migrate_new_feature() -> Dict[str, any]:
    """
    Migrate data for new feature.
    
    Returns:
        Dict with migration statistics
    """
    stats = {'updated_count': 0, 'error_count': 0}
    
    try:
        async with in_transaction() as conn:
            # Your migration logic here
            await conn.execute_query(
                "UPDATE table SET field = ? WHERE condition",
                [new_value]
            )
            stats['updated_count'] += 1
            
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        stats['error_count'] += 1
        raise
    
    return stats
```

### 2. Add Detection Logic

Update `check_migrations_needed()`:

```python
async def check_migrations_needed() -> List[str]:
    needed = []
    
    async with in_transaction() as conn:
        # Check for your migration condition
        result = await conn.execute_query_dict(
            "SELECT COUNT(*) as count FROM table WHERE old_condition"
        )
        
        if result and result[0]['count'] > 0:
            needed.append('new_feature_migration')
    
    return needed
```

### 3. Add to Migration Runner

Update `run_all_migrations()`:

```python
async def run_all_migrations() -> Dict[str, any]:
    # ... existing code ...
    
    # Add your migration
    logger.info("Running migration: New feature migration")
    new_stats = await migrate_new_feature()
    results['migrations_run'].append({
        'name': 'new_feature_migration',
        'stats': new_stats
    })
    
    # ... rest of code ...
```

## Best Practices

### ✅ DO

- **Use transactions** - Wrap migrations in `in_transaction()` for atomicity
- **Log everything** - Use logger to track migration progress
- **Return statistics** - Provide detailed stats about what was changed
- **Handle errors gracefully** - Don't fail the entire migration for one record
- **Test migrations** - Test on a copy of production data first
- **Make migrations idempotent** - Safe to run multiple times

### ❌ DON'T

- **Don't use ORM models during migration** - Use raw SQL to avoid validation errors
- **Don't delete data** - Archive instead of delete when possible
- **Don't skip error handling** - Always catch and log exceptions
- **Don't assume data quality** - Validate data before and after migration
- **Don't run untested migrations in production** - Always test first

## Troubleshooting

### Migration Fails on Startup

**Symptom**: Application won't start, migration errors in logs

**Solution**:
1. Check the error message in logs
2. Fix the migration function
3. Restart the application

### Data Not Migrated

**Symptom**: Old data still present after migration

**Solution**:
1. Check if migration was detected: `await check_migrations_needed()`
2. Verify migration logic is correct
3. Check database directly to confirm data state

### Validation Errors After Migration

**Symptom**: Tortoise ORM validation fails even after migration

**Solution**:
1. Verify all data meets new constraints
2. Check for edge cases (NULL values, empty strings, etc.)
3. Update migration to handle all data variations

## Migration History

| Date | Migration | Description |
|------|-----------|-------------|
| 2025-10-17 | `user_role_migration` | Migrated user roles from PRIMARY/STAFF to ADMIN/USER system |

## Future Considerations

### Aerich Integration

For more complex migrations, consider using [Aerich](https://github.com/tortoise/aerich):

```bash
# Initialize Aerich
aerich init -t src.database.config.TORTOISE_ORM

# Create migration
aerich migrate --name "migration_name"

# Apply migration
aerich upgrade
```

**Note**: The current simple migration system is sufficient for this application's needs. Aerich should be considered if:
- Migrations become more complex
- Multiple developers need to coordinate schema changes
- Rollback capability is required
- Migration versioning is needed

