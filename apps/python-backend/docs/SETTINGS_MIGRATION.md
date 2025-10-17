# Settings Storage Migration Guide

## Overview

The POS Electron application has migrated from a JSON-based settings storage system to a normalized relational database structure. This document explains the changes, benefits, and how to work with the new system.

## What Changed?

### Old System (Deprecated)
- **Model**: `Settings` (plural) in `src/database/models/settings.py`
- **Storage**: All settings stored as JSON fields in a single database row
- **Structure**: One table with columns like `general_settings`, `business_settings`, `tax_settings`, etc.
- **Example**:
  ```json
  {
    "general_settings": {"storeName": "My Store", "currency": "USD", ...},
    "display_settings": {"theme": "light", "fontSize": "medium", ...}
  }
  ```

### New System (Current)
- **Model**: `Setting` (singular) in `src/database/models/setting.py`
- **Storage**: Each setting stored as an individual row in the database
- **Structure**: One table with columns: `section`, `key`, `value`, `default_value`, `data_type`, `description`
- **Example**:
  ```
  | section | key       | value     | default_value | data_type | description          |
  |---------|-----------|-----------|---------------|-----------|----------------------|
  | general | storeName | My Store  | My Store      | string    | Name of the store    |
  | display | theme     | light     | light         | string    | UI theme: light/dark |
  ```

## Benefits of the New System

1. **Better Organization**: Settings are clearly separated by section and key
2. **Easier Querying**: Can query specific settings or sections without parsing JSON
3. **Type Safety**: Each setting has a defined data type (string, number, boolean, json)
4. **Default Values**: Built-in default value management for easy reset functionality
5. **Extensibility**: Add new settings without schema changes
6. **Change Tracking**: Individual setting updates tracked with timestamps
7. **Granular Access**: New API endpoints for accessing individual settings

## Database Schema

### Setting Model

```python
class Setting(BaseModel):
    id: int                          # Primary key
    section: str                     # Section name (e.g., 'display', 'security')
    key: str                         # Setting key (e.g., 'theme', 'sessionTimeout')
    value: str                       # Current value (stored as string)
    default_value: str               # Default value (for reset functionality)
    data_type: SettingDataType       # Data type: STRING, NUMBER, BOOLEAN, JSON
    description: str                 # Human-readable description
    created_at: datetime             # Creation timestamp
    updated_at: datetime             # Last update timestamp
    
    # Unique constraint on (section, key)
```

### Data Types

- **STRING**: Text values (e.g., "light", "USD", "My Store")
- **NUMBER**: Numeric values (e.g., 10, 0.15, 24)
- **BOOLEAN**: True/false values (stored as "true"/"false" strings)
- **JSON**: Complex objects/arrays (stored as JSON strings)

## Migration Process

### Automatic Migration

The migration runs automatically on application startup when:
1. Old `settings` table exists with data
2. New `setting` table exists but is empty
3. Migration hasn't been run before

**Migration Steps**:
1. Detects old Settings table
2. Extracts all JSON fields
3. Converts each key-value pair to individual rows
4. Preserves existing values
5. Uses defaults for missing values
6. Handles nested JSON objects (e.g., operatingHours, currencyConfig)

**Migration Log Example**:
```
INFO - Found old settings data, starting migration...
INFO - Extracted 15 settings from general
INFO - Extracted 8 settings from business
INFO - Extracted 4 settings from taxes
...
INFO - Settings migration completed: 67 migrated, 0 skipped
```

### Manual Migration

If needed, you can trigger migration manually:

```python
from src.database.migrations import migrate_settings_to_normalized

stats = await migrate_settings_to_normalized()
print(f"Migrated {stats['settings_migrated']} settings")
```

## API Changes

### Backward Compatible Endpoints

These endpoints maintain the old API contract for frontend compatibility:

#### GET /api/settings/
Returns all settings aggregated by section (same format as before):
```json
{
  "id": 1,
  "general": {"storeName": "...", "currency": "...", ...},
  "display": {"theme": "...", "fontSize": "...", ...},
  ...
}
```

#### PUT /api/settings/
Update settings by section (same format as before):
```json
{
  "display": {"theme": "dark", "fontSize": "large"},
  "security": {"sessionTimeout": 30}
}
```

### New Granular Endpoints

#### GET /api/settings/{section}
Get all settings for a specific section:
```bash
curl http://localhost:8001/api/settings/display
```
Response:
```json
{
  "section": "display",
  "settings": {
    "theme": "light",
    "fontSize": "medium",
    "screenTimeout": 0
  }
}
```

#### GET /api/settings/{section}/{key}
Get an individual setting with metadata:
```bash
curl http://localhost:8001/api/settings/display/theme
```
Response:
```json
{
  "id": 57,
  "section": "display",
  "key": "theme",
  "value": "light",
  "default_value": "light",
  "data_type": "string",
  "description": "UI theme: light or dark",
  "created_at": "2025-10-17T16:41:36Z",
  "updated_at": "2025-10-17T16:41:36Z"
}
```

#### PUT /api/settings/{section}/{key}
Update an individual setting:
```bash
curl -X PUT http://localhost:8001/api/settings/display/theme \
  -H "Content-Type: application/json" \
  -d '{"value": "dark"}'
```

#### POST /api/settings/bulk
Bulk update multiple settings across sections:
```bash
curl -X POST http://localhost:8001/api/settings/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "updates": [
      {"section": "display", "key": "theme", "value": "dark"},
      {"section": "display", "key": "fontSize", "value": "small"},
      {"section": "security", "key": "sessionTimeout", "value": "30"}
    ]
  }'
```

## Working with Settings in Code

### Get a Setting

```python
from src.database.models import Setting

# Get typed value
setting = await Setting.get_setting('display', 'theme')
print(setting)  # "light"

# Get with metadata
setting_obj = await Setting.get(section='display', key='theme')
print(setting_obj.value)  # "light"
print(setting_obj.data_type)  # SettingDataType.STRING
```

### Get Section Settings

```python
# Get all settings in a section as dict
display_settings = await Setting.get_section('display')
print(display_settings)
# {'theme': 'light', 'fontSize': 'medium', 'screenTimeout': 0}
```

### Update a Setting

```python
# Update single setting
await Setting.update_setting('display', 'theme', 'dark')

# Update multiple settings in a section
await Setting.update_section('display', {
    'theme': 'dark',
    'fontSize': 'large'
})

# Bulk update across sections
await Setting.bulk_update([
    {'section': 'display', 'key': 'theme', 'value': 'dark'},
    {'section': 'security', 'key': 'sessionTimeout', 'value': 30}
])
```

### Reset to Defaults

```python
# Reset single setting
await Setting.reset_to_default('display', 'theme')

# Reset entire section
await Setting.reset_section_to_defaults('display')
```

## Adding New Settings

### 1. Add to Defaults

Edit `src/database/defaults/settings_defaults.py`:

```python
{
    'section': 'display',
    'key': 'newSetting',
    'value': 'default_value',
    'default_value': 'default_value',
    'data_type': 'string',
    'description': 'Description of the new setting'
}
```

### 2. Add to Schema (if needed)

If the setting is part of a section schema, update `src/api/schemas.py`:

```python
class DisplaySettings(BaseModel):
    theme: str = "light"
    fontSize: str = "medium"
    screenTimeout: int = 0
    newSetting: str = "default_value"  # Add here
```

### 3. Initialize on Startup

The setting will be automatically created when:
- Fresh database initialization
- Calling `Setting.initialize_defaults()`

## Testing

### Test Migration
```bash
# Start backend and check logs
cd apps/python-backend
source venv/bin/activate
python -m uvicorn src.main:app --host 0.0.0.0 --port 8001

# Look for migration logs:
# INFO - Settings migration completed: X migrated, Y skipped
```

### Test API Endpoints
```bash
# Get all settings
curl http://localhost:8001/api/settings/

# Get section
curl http://localhost:8001/api/settings/display

# Get individual setting
curl http://localhost:8001/api/settings/display/theme

# Update setting
curl -X PUT http://localhost:8001/api/settings/display/theme \
  -H "Content-Type: application/json" \
  -d '{"value": "dark"}'
```

## Troubleshooting

### Migration Doesn't Run
- Check logs for "Settings normalization migration needed"
- Verify old `settings` table exists with data
- Check migration status in database

### Settings Not Appearing
- Verify defaults are defined in `settings_defaults.py`
- Check `Setting.initialize_defaults()` was called
- Query database directly to verify data

### Type Conversion Issues
- Ensure `data_type` matches actual value type
- Use `get_typed_value()` method for automatic conversion
- Check boolean values are "true"/"false" strings

## Future Enhancements

- Setting validation rules
- Setting change history/audit log
- Setting groups and dependencies
- User-specific setting overrides
- Setting import/export functionality

## References

- **Setting Model**: `apps/python-backend/src/database/models/setting.py`
- **Defaults**: `apps/python-backend/src/database/defaults/settings_defaults.py`
- **Migration**: `apps/python-backend/src/database/migrations.py`
- **API**: `apps/python-backend/src/api/settings.py`
- **Schemas**: `apps/python-backend/src/api/schemas.py`

