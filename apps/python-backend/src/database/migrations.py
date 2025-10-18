"""
Database migration utilities for handling schema and data migrations.

This module provides utilities for migrating data when model definitions change,
particularly for handling enum value changes and constraint updates.
"""
import json
import logging
from typing import Dict, List, Tuple, Any
from tortoise import Tortoise
from tortoise.transactions import in_transaction

logger = logging.getLogger(__name__)


async def migrate_user_roles() -> Dict[str, int]:
    """
    Migrate user roles from old PRIMARY/STAFF system to new ADMIN/USER system.
    
    This migration:
    1. Updates 'primary' role values to 'admin'
    2. Updates 'staff' role values to 'user'
    3. Handles any other legacy role values
    
    Returns:
        Dict with migration statistics (updated_count, skipped_count, error_count)
    
    Raises:
        Exception: If migration fails critically
    """
    stats = {
        'updated_count': 0,
        'skipped_count': 0,
        'error_count': 0,
        'migrations': []
    }
    
    try:
        # Use raw SQL to avoid Tortoise ORM validation during migration
        async with in_transaction() as conn:
            # Get all users with their current roles
            users = await conn.execute_query_dict(
                "SELECT id, full_name, role FROM users"
            )
            
            logger.info(f"Found {len(users)} user(s) to check for migration")
            
            # Define role migration mapping
            role_mapping = {
                'primary': 'admin',
                'staff': 'user',
                # Add any other legacy values if needed
            }
            
            for user in users:
                user_id = user['id']
                current_role = user['role']
                full_name = user['full_name']
                
                # Check if role needs migration
                if current_role in role_mapping:
                    new_role = role_mapping[current_role]
                    
                    try:
                        # Update the role using raw SQL
                        await conn.execute_query(
                            "UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                            [new_role, user_id]
                        )
                        
                        stats['updated_count'] += 1
                        stats['migrations'].append({
                            'user_id': user_id,
                            'name': full_name,
                            'old_role': current_role,
                            'new_role': new_role
                        })
                        
                        logger.info(
                            f"Migrated user {user_id} ('{full_name}'): "
                            f"'{current_role}' -> '{new_role}'"
                        )
                        
                    except Exception as e:
                        stats['error_count'] += 1
                        logger.error(
                            f"Failed to migrate user {user_id} ('{full_name}'): {e}"
                        )
                        
                elif current_role in ['admin', 'user']:
                    # Already using new role system
                    stats['skipped_count'] += 1
                    logger.debug(
                        f"User {user_id} ('{full_name}') already has valid role: '{current_role}'"
                    )
                    
                else:
                    # Unknown role value - log warning but don't fail
                    stats['error_count'] += 1
                    logger.warning(
                        f"User {user_id} ('{full_name}') has unknown role: '{current_role}'. "
                        f"Manual intervention may be required."
                    )
            
            logger.info(
                f"Role migration complete: "
                f"{stats['updated_count']} updated, "
                f"{stats['skipped_count']} skipped, "
                f"{stats['error_count']} errors"
            )
            
    except Exception as e:
        logger.error(f"Critical error during role migration: {e}")
        raise
    
    return stats


async def update_role_column_constraints() -> bool:
    """
    Update the role column constraints to match the new enum definition.
    
    This updates:
    - Column type to VARCHAR(5) to accommodate 'admin' and 'user'
    - Default value to 'user'
    
    Returns:
        True if successful, False otherwise
    """
    try:
        async with in_transaction() as conn:
            # SQLite doesn't support ALTER COLUMN directly, so we need to:
            # 1. Create a new table with correct schema
            # 2. Copy data
            # 3. Drop old table
            # 4. Rename new table
            
            # However, since Tortoise ORM will handle schema generation,
            # we just need to ensure the data is compatible
            
            # Verify all roles are now valid (5 chars or less)
            result = await conn.execute_query_dict(
                "SELECT role, LENGTH(role) as len FROM users WHERE LENGTH(role) > 5"
            )
            
            if result:
                logger.error(
                    f"Found {len(result)} user(s) with role length > 5. "
                    f"Run migrate_user_roles() first."
                )
                return False
            
            logger.info("All user roles are within the new constraint (max_length=5)")
            return True
            
    except Exception as e:
        logger.error(f"Failed to verify role constraints: {e}")
        return False


async def migrate_settings_to_normalized() -> Dict[str, Any]:
    """
    Migrate settings from old JSON-based Settings model to new normalized Setting model.

    This migration:
    1. Checks if old Settings table exists and has data
    2. Extracts all JSON fields from the old Settings model
    3. Converts each setting to individual rows in the new Setting table
    4. Preserves existing values, uses defaults for missing values
    5. Handles nested JSON objects appropriately

    Returns:
        Dict with migration statistics
    """
    stats = {
        'settings_migrated': 0,
        'settings_skipped': 0,
        'errors': [],
        'old_settings_found': False
    }

    try:
        async with in_transaction() as conn:
            # Check if old settings table exists
            tables = await conn.execute_query_dict(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='settings'"
            )

            if not tables:
                logger.info("Old settings table not found, skipping migration")
                return stats

            # Check if old settings has data
            old_settings = await conn.execute_query_dict(
                "SELECT * FROM settings LIMIT 1"
            )

            if not old_settings:
                logger.info("No data in old settings table, skipping migration")
                return stats

            stats['old_settings_found'] = True
            old_setting = old_settings[0]
            logger.info("Found old settings data, starting migration...")

            # Import defaults to get data type information
            from .defaults import get_default_settings
            defaults_list = get_default_settings()
            defaults_map = {
                f"{d['section']}.{d['key']}": d for d in defaults_list
            }

            # Helper function to extract and migrate settings from JSON field
            def extract_settings(section: str, json_data: Any) -> List[Dict[str, Any]]:
                """Extract individual settings from JSON data"""
                settings = []

                if not json_data:
                    return settings

                # Parse JSON if it's a string
                if isinstance(json_data, str):
                    try:
                        json_data = json.loads(json_data)
                    except json.JSONDecodeError:
                        logger.warning(f"Failed to parse JSON for section {section}")
                        return settings

                # Extract each key-value pair
                for key, value in json_data.items():
                    default_key = f"{section}.{key}"
                    default_info = defaults_map.get(default_key, {})

                    # Determine data type
                    data_type = default_info.get('data_type', 'string')
                    if isinstance(value, bool):
                        data_type = 'boolean'
                    elif isinstance(value, (int, float)):
                        data_type = 'number'
                    elif isinstance(value, (dict, list)):
                        data_type = 'json'

                    # Convert value to string for storage
                    if data_type == 'boolean':
                        value_str = 'true' if value else 'false'
                    elif data_type == 'json':
                        value_str = json.dumps(value)
                    else:
                        value_str = str(value) if value is not None else ''

                    # Get default value
                    default_value = default_info.get('default_value', value_str)
                    description = default_info.get('description', f'{section} setting: {key}')

                    settings.append({
                        'section': section,
                        'key': key,
                        'value': value_str,
                        'default_value': default_value,
                        'data_type': data_type,
                        'description': description
                    })

                return settings

            # Map old JSON field names to section names
            field_mapping = {
                'general_settings': 'general',
                'business_settings': 'business',
                'tax_settings': 'taxes',
                'hardware_settings': 'hardware',
                'receipt_settings': 'receipts',
                'inventory_settings': 'inventory',
                'integration_settings': 'integration',
                'backup_settings': 'backup',
                'display_settings': 'display',
                'security_settings': 'security',
                'system_info': 'about'
            }

            # Extract all settings
            all_settings = []
            for field_name, section in field_mapping.items():
                if field_name in old_setting and old_setting[field_name]:
                    section_settings = extract_settings(section, old_setting[field_name])
                    all_settings.extend(section_settings)
                    logger.info(f"Extracted {len(section_settings)} settings from {section}")

            # Insert settings into new table
            for setting in all_settings:
                try:
                    # Check if setting already exists
                    existing = await conn.execute_query_dict(
                        "SELECT id FROM setting WHERE section = ? AND key = ?",
                        [setting['section'], setting['key']]
                    )

                    if existing:
                        stats['settings_skipped'] += 1
                        continue

                    # Insert new setting
                    await conn.execute_query(
                        """
                        INSERT INTO setting (section, key, value, default_value, data_type, description, created_at, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                        """,
                        [
                            setting['section'],
                            setting['key'],
                            setting['value'],
                            setting['default_value'],
                            setting['data_type'],
                            setting['description']
                        ]
                    )
                    stats['settings_migrated'] += 1

                except Exception as e:
                    stats['errors'].append(f"Failed to migrate {setting['section']}.{setting['key']}: {e}")
                    logger.error(f"Failed to migrate setting {setting['section']}.{setting['key']}: {e}")

            logger.info(f"Settings migration completed: {stats['settings_migrated']} migrated, {stats['settings_skipped']} skipped")

    except Exception as e:
        stats['errors'].append(f"Settings migration failed: {e}")
        logger.error(f"Settings migration failed: {e}")

    return stats


async def remove_deprecated_inventory_settings() -> Dict[str, Any]:
    """
    Remove deprecated inventory settings (waste tracking and multi-location).

    This migration removes settings that are no longer supported in the freeware version:
    - enableWasteTracking
    - wasteReasons
    - requireWasteApproval
    - enableStockAdjustment
    - requireAdjustmentReason
    - enableMultiLocation
    - defaultLocation
    - transferBetweenLocations

    Returns:
        Dict with migration statistics
    """
    stats = {
        'settings_removed': 0,
        'errors': []
    }

    deprecated_keys = [
        'enableWasteTracking',
        'wasteReasons',
        'requireWasteApproval',
        'enableStockAdjustment',
        'requireAdjustmentReason',
        'enableMultiLocation',
        'defaultLocation',
        'transferBetweenLocations'
    ]

    try:
        from .models.setting import Setting

        for key in deprecated_keys:
            try:
                # Delete the setting if it exists
                deleted_count = await Setting.filter(section='inventory', key=key).delete()
                if deleted_count > 0:
                    stats['settings_removed'] += deleted_count
                    logger.info(f"Removed deprecated inventory setting: {key}")
            except Exception as e:
                stats['errors'].append(f"Failed to remove {key}: {e}")
                logger.error(f"Failed to remove deprecated setting {key}: {e}")

        logger.info(f"Deprecated inventory settings cleanup completed: {stats['settings_removed']} removed")

    except Exception as e:
        stats['errors'].append(f"Deprecated settings cleanup failed: {e}")
        logger.error(f"Deprecated settings cleanup failed: {e}")

    return stats


async def add_tax_rule_columns() -> Dict[str, any]:
    """
    Add new columns to tax_rules table for enhanced tax configuration.

    Adds:
    - calculation_method (percentage/fixed_amount)
    - fixed_amount
    - inclusion_type (inclusive/exclusive)
    - rounding_method
    - applies_to_products
    - is_tax_exempt
    - effective_from
    - effective_to

    Returns:
        Dict with migration statistics
    """
    stats = {
        'columns_added': 0,
        'columns_skipped': 0,
        'errors': []
    }

    try:
        async with in_transaction() as conn:
            # Check if tax_rules table exists
            table_check = await conn.execute_query_dict(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='tax_rules'"
            )

            if not table_check:
                logger.info("tax_rules table does not exist yet, skipping migration")
                return stats

            # Get existing columns
            columns_result = await conn.execute_query_dict("PRAGMA table_info(tax_rules)")
            existing_columns = {col['name'] for col in columns_result}

            # Define new columns to add
            new_columns = {
                'calculation_method': "ALTER TABLE tax_rules ADD COLUMN calculation_method VARCHAR(20) DEFAULT 'percentage'",
                'fixed_amount': "ALTER TABLE tax_rules ADD COLUMN fixed_amount DECIMAL(10,2)",
                'inclusion_type': "ALTER TABLE tax_rules ADD COLUMN inclusion_type VARCHAR(20) DEFAULT 'exclusive'",
                'rounding_method': "ALTER TABLE tax_rules ADD COLUMN rounding_method VARCHAR(20) DEFAULT 'round_half_up'",
                'applies_to_products': "ALTER TABLE tax_rules ADD COLUMN applies_to_products TEXT DEFAULT '[]'",
                'is_tax_exempt': "ALTER TABLE tax_rules ADD COLUMN is_tax_exempt INTEGER DEFAULT 0",
                'effective_from': "ALTER TABLE tax_rules ADD COLUMN effective_from DATE",
                'effective_to': "ALTER TABLE tax_rules ADD COLUMN effective_to DATE"
            }

            # Add missing columns
            for column_name, alter_sql in new_columns.items():
                if column_name not in existing_columns:
                    try:
                        await conn.execute_query(alter_sql)
                        stats['columns_added'] += 1
                        logger.info(f"Added column '{column_name}' to tax_rules table")
                    except Exception as e:
                        stats['errors'].append(f"Failed to add column '{column_name}': {e}")
                        logger.error(f"Failed to add column '{column_name}': {e}")
                else:
                    stats['columns_skipped'] += 1
                    logger.debug(f"Column '{column_name}' already exists in tax_rules table")

            logger.info(f"Tax rules migration completed: {stats['columns_added']} columns added, {stats['columns_skipped']} skipped")

    except Exception as e:
        stats['errors'].append(f"Tax rules migration failed: {e}")
        logger.error(f"Tax rules migration failed: {e}")

    return stats


async def run_all_migrations() -> Dict[str, any]:
    """
    Run all pending migrations in the correct order.

    This is the main entry point for running migrations during app startup.

    Returns:
        Dict with overall migration results
    """
    results = {
        'success': False,
        'migrations_run': [],
        'errors': []
    }

    try:
        logger.info("Starting database migrations...")

        # Migration 0: Add missing columns
        logger.info("Running migration: Add missing columns")
        columns_result = await add_missing_columns()
        results['migrations_run'].append({
            'name': 'add_missing_columns',
            'stats': columns_result
        })

        if columns_result['errors']:
            logger.warning(f"Column migration had errors: {columns_result['errors']}")

        # Migration 1: Migrate user roles from PRIMARY/STAFF to ADMIN/USER
        logger.info("Running migration: User role migration (PRIMARY/STAFF -> ADMIN/USER)")
        role_stats = await migrate_user_roles()
        results['migrations_run'].append({
            'name': 'user_role_migration',
            'stats': role_stats
        })

        # Migration 2: Verify role column constraints
        logger.info("Running migration: Verify role column constraints")
        constraints_ok = await update_role_column_constraints()
        results['migrations_run'].append({
            'name': 'role_constraints_verification',
            'success': constraints_ok
        })

        if not constraints_ok:
            results['errors'].append("Role constraint verification failed")
            logger.error("Migration failed: Role constraints are not valid")
            return results

        # Migration 3: Migrate settings from JSON to normalized table
        logger.info("Running migration: Settings normalization (JSON -> relational)")
        settings_stats = await migrate_settings_to_normalized()
        results['migrations_run'].append({
            'name': 'settings_normalization',
            'stats': settings_stats
        })

        if settings_stats['errors']:
            logger.warning(f"Settings migration had errors: {settings_stats['errors']}")

        # Migration 4: Remove deprecated inventory settings
        logger.info("Running migration: Remove deprecated inventory settings")
        cleanup_stats = await remove_deprecated_inventory_settings()
        results['migrations_run'].append({
            'name': 'remove_deprecated_inventory_settings',
            'stats': cleanup_stats
        })

        if cleanup_stats['errors']:
            logger.warning(f"Deprecated settings cleanup had errors: {cleanup_stats['errors']}")

        # Migration 5: Add tax rule columns for enhanced tax configuration
        logger.info("Running migration: Add tax rule columns")
        tax_columns_stats = await add_tax_rule_columns()
        results['migrations_run'].append({
            'name': 'add_tax_rule_columns',
            'stats': tax_columns_stats
        })

        if tax_columns_stats['errors']:
            logger.warning(f"Tax rule columns migration had errors: {tax_columns_stats['errors']}")

        results['success'] = True
        logger.info("All migrations completed successfully")

    except Exception as e:
        results['errors'].append(str(e))
        logger.error(f"Migration failed with error: {e}")

    return results


async def add_missing_columns() -> Dict[str, any]:
    """
    Add missing columns to existing tables.

    This migration handles adding new columns that were added to models
    but don't exist in the database schema yet.

    Returns:
        Dict with migration results
    """
    results = {
        'columns_added': [],
        'columns_skipped': [],
        'errors': []
    }

    try:
        async with in_transaction() as conn:
            # Check if avatar_color column exists in users table
            columns = await conn.execute_query_dict(
                "PRAGMA table_info(users)"
            )

            column_names = [col['name'] for col in columns]

            # Add avatar_color if it doesn't exist
            if 'avatar_color' not in column_names:
                try:
                    await conn.execute_query(
                        "ALTER TABLE users ADD COLUMN avatar_color VARCHAR(50) NULL"
                    )
                    results['columns_added'].append('users.avatar_color')
                    logger.info("Added missing column: users.avatar_color")
                except Exception as e:
                    results['errors'].append(f"Failed to add avatar_color: {e}")
                    logger.error(f"Failed to add avatar_color column: {e}")
            else:
                results['columns_skipped'].append('users.avatar_color')
                logger.debug("Column users.avatar_color already exists")

    except Exception as e:
        results['errors'].append(f"Failed to check/add columns: {e}")
        logger.error(f"Failed to check/add missing columns: {e}")

    return results


async def check_migrations_needed() -> List[str]:
    """
    Check if any migrations are needed without running them.

    Returns:
        List of migration names that need to be run
    """
    needed = []

    try:
        async with in_transaction() as conn:
            # Check for old role values
            result = await conn.execute_query_dict(
                "SELECT COUNT(*) as count FROM users WHERE role IN ('primary', 'staff')"
            )

            if result and result[0]['count'] > 0:
                needed.append('user_role_migration')
                logger.info(f"Found {result[0]['count']} user(s) with old role values")

            # Check for missing columns
            try:
                columns = await conn.execute_query_dict(
                    "PRAGMA table_info(users)"
                )
                column_names = [col['name'] for col in columns]

                if 'avatar_color' not in column_names:
                    needed.append('add_missing_columns')
                    logger.info("Missing column detected: avatar_color")
            except Exception as e:
                logger.debug(f"Could not check for missing columns: {e}")

            # Check if settings migration is needed
            try:
                # Check if old settings table exists and has data
                tables = await conn.execute_query_dict(
                    "SELECT name FROM sqlite_master WHERE type='table' AND name='settings'"
                )

                if tables:
                    # Check if new setting table exists
                    new_tables = await conn.execute_query_dict(
                        "SELECT name FROM sqlite_master WHERE type='table' AND name='setting'"
                    )

                    if new_tables:
                        # Check if new table is empty (migration not done yet)
                        count = await conn.execute_query_dict(
                            "SELECT COUNT(*) as count FROM setting"
                        )

                        if count and count[0]['count'] == 0:
                            needed.append('settings_normalization')
                            logger.info("Settings normalization migration needed")
                    else:
                        # New table doesn't exist yet, migration will be needed after schema generation
                        logger.debug("New setting table doesn't exist yet")
            except Exception as e:
                logger.debug(f"Could not check for settings migration: {e}")

            # Check if tax_rules columns migration is needed
            try:
                tax_tables = await conn.execute_query_dict(
                    "SELECT name FROM sqlite_master WHERE type='table' AND name='tax_rules'"
                )

                if tax_tables:
                    columns = await conn.execute_query_dict("PRAGMA table_info(tax_rules)")
                    column_names = [col['name'] for col in columns]

                    # Check for new tax rule columns
                    new_tax_columns = ['calculation_method', 'fixed_amount', 'inclusion_type',
                                      'rounding_method', 'applies_to_products', 'is_tax_exempt',
                                      'effective_from', 'effective_to']

                    missing_columns = [col for col in new_tax_columns if col not in column_names]

                    if missing_columns:
                        needed.append('add_tax_rule_columns')
                        logger.info(f"Tax rules columns migration needed: {', '.join(missing_columns)}")
            except Exception as e:
                logger.debug(f"Could not check for tax rules migration: {e}")

    except Exception as e:
        logger.error(f"Failed to check migration status: {e}")

    return needed

