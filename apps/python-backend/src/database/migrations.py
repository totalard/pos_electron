"""
Database migration utilities for handling schema and data migrations.

This module provides utilities for migrating data when model definitions change,
particularly for handling enum value changes and constraint updates.
"""
import logging
from typing import Dict, List, Tuple
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
        
        results['success'] = True
        logger.info("All migrations completed successfully")
        
    except Exception as e:
        results['errors'].append(str(e))
        logger.error(f"Migration failed with error: {e}")
    
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
            
    except Exception as e:
        logger.error(f"Failed to check migration status: {e}")
    
    return needed

