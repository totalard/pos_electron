"""
CLI commands for schema synchronization.

Provides command-line interface for manual schema sync operations.
"""
import asyncio
import logging
import sys
from pathlib import Path
from typing import Optional

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

logger = logging.getLogger(__name__)


def setup_logging(verbose: bool = False):
    """
    Setup logging configuration.
    
    Args:
        verbose: Enable verbose logging
    """
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )


async def sync_command(
    force: bool = False,
    dry_run: bool = False,
    verbose: bool = False
):
    """
    Synchronize schemas from models.
    
    Args:
        force: Force regeneration even if no changes detected
        dry_run: Preview changes without writing files
        verbose: Enable verbose logging
    """
    setup_logging(verbose)
    
    try:
        from src.services.schema_sync import sync_schemas_from_models
        
        logger.info("Starting schema synchronization...")
        
        if dry_run:
            logger.info("DRY RUN MODE - No files will be modified")
        
        result = await sync_schemas_from_models(force=force, dry_run=dry_run)
        
        # Print results
        print("\n" + "=" * 80)
        print("SCHEMA SYNCHRONIZATION RESULTS")
        print("=" * 80)
        print(f"Status: {'SUCCESS' if result['success'] else 'FAILED'}")
        print(f"Timestamp: {result['timestamp']}")
        print(f"Backup Created: {result.get('backup_created', False)}")
        print(f"Schemas Generated: {result.get('schemas_generated', False)}")
        print(f"Changes Detected: {result.get('changes_detected', False)}")
        
        if result.get('generated_path'):
            print(f"Generated Path: {result['generated_path']}")
        
        # Print comparison results
        if 'comparison' in result:
            comp = result['comparison']
            if comp.get('added_schemas'):
                print(f"\nAdded Schemas ({len(comp['added_schemas'])}):")
                for schema in comp['added_schemas']:
                    print(f"  + {schema}")
            
            if comp.get('removed_schemas'):
                print(f"\nRemoved Schemas ({len(comp['removed_schemas'])}):")
                for schema in comp['removed_schemas']:
                    print(f"  - {schema}")
            
            if comp.get('modified_schemas'):
                print(f"\nModified Schemas ({len(comp['modified_schemas'])}):")
                for schema in comp['modified_schemas']:
                    print(f"  ~ {schema}")
            
            if comp.get('conflicts'):
                print(f"\nConflicts ({len(comp['conflicts'])}):")
                for conflict in comp['conflicts']:
                    print(f"  ! {conflict['schema']}: {conflict['reason']}")
        
        # Print warnings
        if result.get('warnings'):
            print(f"\nWarnings ({len(result['warnings'])}):")
            for warning in result['warnings']:
                print(f"  ⚠ {warning}")
        
        # Print errors
        if result.get('errors'):
            print(f"\nErrors ({len(result['errors'])}):")
            for error in result['errors']:
                print(f"  ✗ {error}")
        
        print("=" * 80 + "\n")
        
        return 0 if result['success'] else 1
        
    except Exception as e:
        logger.error(f"Schema sync failed: {e}", exc_info=True)
        print(f"\n✗ ERROR: {e}\n")
        return 1


async def validate_command(verbose: bool = False):
    """
    Validate generated schemas.
    
    Args:
        verbose: Enable verbose logging
    """
    setup_logging(verbose)
    
    try:
        from src.services.schema_sync import get_sync_service
        
        logger.info("Validating schemas...")
        
        service = get_sync_service()
        validation = await service._validate_schemas()
        
        print("\n" + "=" * 80)
        print("SCHEMA VALIDATION RESULTS")
        print("=" * 80)
        print(f"Status: {'VALID' if validation['valid'] else 'INVALID'}")
        
        if validation.get('errors'):
            print(f"\nErrors ({len(validation['errors'])}):")
            for error in validation['errors']:
                print(f"  ✗ {error}")
        
        if validation.get('warnings'):
            print(f"\nWarnings ({len(validation['warnings'])}):")
            for warning in validation['warnings']:
                print(f"  ⚠ {warning}")
        
        print("=" * 80 + "\n")
        
        return 0 if validation['valid'] else 1
        
    except Exception as e:
        logger.error(f"Schema validation failed: {e}", exc_info=True)
        print(f"\n✗ ERROR: {e}\n")
        return 1


async def status_command(verbose: bool = False):
    """
    Show schema synchronization status.
    
    Args:
        verbose: Enable verbose logging
    """
    setup_logging(verbose)
    
    try:
        from src.services.schema_sync import get_sync_service
        
        service = get_sync_service()
        status = await service.get_sync_status()
        
        print("\n" + "=" * 80)
        print("SCHEMA SYNC STATUS")
        print("=" * 80)
        print(f"Last Sync: {status['last_sync'] or 'Never'}")
        print(f"Manual Schema Exists: {status['manual_schema_exists']}")
        print(f"Generated Schema Exists: {status['generated_schema_exists']}")
        print(f"Manual Schema Path: {status['manual_schema_path']}")
        print(f"Generated Schema Path: {status['generated_schema_path']}")
        print(f"Backup Enabled: {status['backup_enabled']}")
        print(f"Auto Merge: {status['auto_merge']}")
        print("=" * 80 + "\n")
        
        return 0
        
    except Exception as e:
        logger.error(f"Failed to get status: {e}", exc_info=True)
        print(f"\n✗ ERROR: {e}\n")
        return 1


async def backup_command(
    action: str = "list",
    backup_name: Optional[str] = None,
    verbose: bool = False
):
    """
    Manage schema backups.
    
    Args:
        action: Action to perform (list, restore, delete)
        backup_name: Name of backup for restore/delete actions
        verbose: Enable verbose logging
    """
    setup_logging(verbose)
    
    try:
        from src.utils.schema_backup import (
            list_schema_backups,
            restore_schema_backup,
            get_backup_manager
        )
        
        if action == "list":
            backups = list_schema_backups()
            
            print("\n" + "=" * 80)
            print("SCHEMA BACKUPS")
            print("=" * 80)
            
            if not backups:
                print("No backups found")
            else:
                for backup in backups:
                    print(f"\n{backup['name']}")
                    print(f"  Created: {backup['created']}")
                    print(f"  Files: {', '.join(backup['files'])}")
            
            print("=" * 80 + "\n")
            
        elif action == "restore":
            if not backup_name:
                print("✗ ERROR: backup_name required for restore action")
                return 1
            
            logger.info(f"Restoring backup: {backup_name}")
            result = await restore_schema_backup(backup_name)
            
            if result['success']:
                print(f"\n✓ Backup restored successfully")
                print(f"Files restored: {len(result['files_restored'])}")
                for file in result['files_restored']:
                    print(f"  - {file}")
            else:
                print(f"\n✗ Restore failed: {result['error']}")
                return 1
            
        elif action == "delete":
            if not backup_name:
                print("✗ ERROR: backup_name required for delete action")
                return 1
            
            manager = get_backup_manager()
            success = manager.delete_backup(backup_name)
            
            if success:
                print(f"\n✓ Backup deleted: {backup_name}")
            else:
                print(f"\n✗ Failed to delete backup: {backup_name}")
                return 1
        
        else:
            print(f"✗ ERROR: Unknown action: {action}")
            return 1
        
        return 0
        
    except Exception as e:
        logger.error(f"Backup command failed: {e}", exc_info=True)
        print(f"\n✗ ERROR: {e}\n")
        return 1


def main():
    """
    Main CLI entry point.
    """
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Schema Synchronization CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    parser.add_argument(
        '-v', '--verbose',
        action='store_true',
        help='Enable verbose logging'
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Commands')
    
    # Sync command
    sync_parser = subparsers.add_parser('sync', help='Synchronize schemas from models')
    sync_parser.add_argument(
        '--force',
        action='store_true',
        help='Force regeneration even if no changes detected'
    )
    sync_parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Preview changes without writing files'
    )
    
    # Validate command
    subparsers.add_parser('validate', help='Validate generated schemas')
    
    # Status command
    subparsers.add_parser('status', help='Show synchronization status')
    
    # Backup command
    backup_parser = subparsers.add_parser('backup', help='Manage schema backups')
    backup_parser.add_argument(
        'action',
        choices=['list', 'restore', 'delete'],
        help='Backup action to perform'
    )
    backup_parser.add_argument(
        '--name',
        help='Backup name for restore/delete actions'
    )
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return 1
    
    # Execute command
    if args.command == 'sync':
        exit_code = asyncio.run(sync_command(
            force=args.force,
            dry_run=args.dry_run,
            verbose=args.verbose
        ))
    elif args.command == 'validate':
        exit_code = asyncio.run(validate_command(verbose=args.verbose))
    elif args.command == 'status':
        exit_code = asyncio.run(status_command(verbose=args.verbose))
    elif args.command == 'backup':
        exit_code = asyncio.run(backup_command(
            action=args.action,
            backup_name=args.name,
            verbose=args.verbose
        ))
    else:
        parser.print_help()
        exit_code = 1
    
    return exit_code


if __name__ == '__main__':
    sys.exit(main())
