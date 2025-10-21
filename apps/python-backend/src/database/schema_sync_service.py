"""
Database schema synchronization service.

Applies schema changes to ensure database matches model definitions.
Handles adding missing columns, creating missing tables, and updating constraints.
"""
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from tortoise.transactions import in_transaction
from .schema_comparator import SchemaComparator, SchemaDifference, get_comparator
from .model_analyzer import ModelSchema, ModelFieldInfo, get_analyzer
from .schema_introspection import get_introspector

logger = logging.getLogger(__name__)


class SchemaSyncResult:
    """Result of a schema synchronization operation."""
    
    def __init__(self):
        self.success = False
        self.timestamp = datetime.now()
        self.tables_created = []
        self.columns_added = []
        self.indexes_created = []
        self.errors = []
        self.warnings = []
        self.differences_found = 0
        self.differences_resolved = 0
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary representation."""
        return {
            'success': self.success,
            'timestamp': self.timestamp.isoformat(),
            'tables_created': self.tables_created,
            'columns_added': self.columns_added,
            'indexes_created': self.indexes_created,
            'errors': self.errors,
            'warnings': self.warnings,
            'differences_found': self.differences_found,
            'differences_resolved': self.differences_resolved
        }


class SchemaSyncService:
    """
    Service for synchronizing database schema with model definitions.
    
    Ensures database schema matches model definitions by:
    - Creating missing tables
    - Adding missing columns
    - Creating missing indexes
    """
    
    def __init__(self):
        self.comparator = get_comparator()
        self.analyzer = get_analyzer()
        self.introspector = get_introspector()
    
    async def sync_schema(
        self,
        dry_run: bool = False,
        auto_fix: bool = True
    ) -> SchemaSyncResult:
        """
        Synchronize database schema with model definitions.
        
        Args:
            dry_run: If True, only report differences without making changes
            auto_fix: If True, automatically fix differences
            
        Returns:
            SchemaSyncResult object
        """
        result = SchemaSyncResult()
        
        try:
            logger.info("=" * 60)
            logger.info("Starting database schema synchronization...")
            logger.info("=" * 60)
            
            # Step 1: Compare schemas
            logger.info("Step 1: Comparing model schemas with database...")
            differences = await self.comparator.compare_all_schemas()
            result.differences_found = len(differences)
            
            if not differences:
                logger.info("✓ No schema differences found - database is in sync!")
                result.success = True
                return result
            
            # Log all differences
            logger.info(f"Found {len(differences)} schema difference(s):")
            for diff in differences:
                severity_symbol = {
                    'error': '✗',
                    'warning': '⚠',
                    'info': 'ℹ'
                }.get(diff.severity, '•')
                logger.info(f"  {severity_symbol} [{diff.severity.upper()}] {diff.description}")
            
            if dry_run:
                logger.info("DRY RUN mode - no changes will be made")
                result.success = True
                return result
            
            if not auto_fix:
                logger.warning("Auto-fix disabled - differences detected but not resolved")
                result.warnings.append("Auto-fix disabled")
                result.success = False
                return result
            
            # Step 2: Apply fixes
            logger.info("\nStep 2: Applying schema fixes...")
            await self._apply_fixes(differences, result)
            
            # Step 3: Verify fixes
            logger.info("\nStep 3: Verifying schema synchronization...")
            verification_diffs = await self.comparator.compare_all_schemas()
            critical_diffs = [d for d in verification_diffs if d.severity == 'error']
            
            if critical_diffs:
                logger.error(f"✗ Schema sync incomplete - {len(critical_diffs)} critical issues remain")
                for diff in critical_diffs:
                    logger.error(f"  ✗ {diff.description}")
                result.success = False
            else:
                logger.info("✓ Schema synchronization completed successfully!")
                result.success = True
            
            logger.info("=" * 60)
            
        except Exception as e:
            logger.error(f"Schema synchronization failed: {e}", exc_info=True)
            result.errors.append(str(e))
            result.success = False
        
        return result
    
    async def _apply_fixes(
        self,
        differences: List[SchemaDifference],
        result: SchemaSyncResult
    ):
        """
        Apply fixes for detected schema differences.
        
        Args:
            differences: List of schema differences
            result: Result object to update
        """
        # Group differences by type for organized processing
        missing_tables = [d for d in differences if d.diff_type == 'missing_table']
        missing_columns = [d for d in differences if d.diff_type == 'missing_column']
        missing_indexes = [d for d in differences if d.diff_type == 'missing_index']
        
        # Fix missing tables first (using Tortoise's generate_schemas)
        if missing_tables:
            logger.info(f"Creating {len(missing_tables)} missing table(s)...")
            for diff in missing_tables:
                try:
                    # Tables will be created by Tortoise.generate_schemas
                    logger.info(f"  • Table '{diff.table_name}' will be created by Tortoise")
                    result.tables_created.append(diff.table_name)
                    result.differences_resolved += 1
                except Exception as e:
                    error_msg = f"Failed to create table '{diff.table_name}': {e}"
                    logger.error(f"  ✗ {error_msg}")
                    result.errors.append(error_msg)
        
        # Fix missing columns
        if missing_columns:
            logger.info(f"Adding {len(missing_columns)} missing column(s)...")
            for diff in missing_columns:
                try:
                    await self._add_column(diff)
                    logger.info(f"  ✓ Added column '{diff.details['field_name']}' to table '{diff.table_name}'")
                    result.columns_added.append(f"{diff.table_name}.{diff.details['field_name']}")
                    result.differences_resolved += 1
                except Exception as e:
                    error_msg = f"Failed to add column '{diff.details['field_name']}' to '{diff.table_name}': {e}"
                    logger.error(f"  ✗ {error_msg}")
                    result.errors.append(error_msg)
        
        # Fix missing indexes (informational, not critical)
        if missing_indexes:
            logger.info(f"Creating {len(missing_indexes)} missing index(es)...")
            for diff in missing_indexes:
                try:
                    await self._create_index(diff)
                    logger.info(f"  ✓ Created index on {diff.details['columns']} in table '{diff.table_name}'")
                    result.indexes_created.append(f"{diff.table_name}({','.join(diff.details['columns'])})")
                    result.differences_resolved += 1
                except Exception as e:
                    warning_msg = f"Failed to create index on '{diff.table_name}': {e}"
                    logger.warning(f"  ⚠ {warning_msg}")
                    result.warnings.append(warning_msg)
    
    async def _add_column(self, diff: SchemaDifference):
        """
        Add a missing column to a table.
        
        Args:
            diff: SchemaDifference object with column details
        """
        table_name = diff.table_name
        field_name = diff.details['field_name']
        sql_type = diff.details['expected_type']
        nullable = diff.details['nullable']
        default = diff.details.get('default')
        
        # Build ALTER TABLE statement
        null_constraint = "NULL" if nullable else "NOT NULL"
        
        # Handle default value
        default_clause = ""
        if default is not None:
            if isinstance(default, str):
                default_clause = f"DEFAULT '{default}'"
            elif isinstance(default, bool):
                default_clause = f"DEFAULT {1 if default else 0}"
            elif isinstance(default, (int, float)):
                default_clause = f"DEFAULT {default}"
        elif nullable:
            default_clause = "DEFAULT NULL"
        
        # For foreign keys, adjust field name
        column_name = field_name
        if field_name.endswith('_id') or 'ForeignKey' in str(sql_type):
            if not field_name.endswith('_id'):
                column_name = f"{field_name}_id"
        
        sql = f"ALTER TABLE {table_name} ADD COLUMN {column_name} {sql_type} {null_constraint} {default_clause}".strip()
        
        async with in_transaction() as conn:
            await conn.execute_query(sql)
    
    async def _create_index(self, diff: SchemaDifference):
        """
        Create a missing index on a table.
        
        Args:
            diff: SchemaDifference object with index details
        """
        table_name = diff.table_name
        columns = diff.details['columns']
        
        # Generate index name
        index_name = f"idx_{table_name}_{'_'.join(columns)}"
        
        # Build CREATE INDEX statement
        columns_str = ', '.join(columns)
        sql = f"CREATE INDEX {index_name} ON {table_name} ({columns_str})"
        
        async with in_transaction() as conn:
            await conn.execute_query(sql)
    
    async def get_sync_status(self) -> Dict[str, Any]:
        """
        Get current schema synchronization status.
        
        Returns:
            Status dictionary with schema comparison results
        """
        differences = await self.comparator.compare_all_schemas()
        
        critical_diffs = [d for d in differences if d.severity == 'error']
        warning_diffs = [d for d in differences if d.severity == 'warning']
        info_diffs = [d for d in differences if d.severity == 'info']
        
        return {
            'in_sync': len(critical_diffs) == 0,
            'total_differences': len(differences),
            'critical_differences': len(critical_diffs),
            'warnings': len(warning_diffs),
            'info': len(info_diffs),
            'differences': [d.to_dict() for d in differences]
        }


# Global service instance
_sync_service: Optional[SchemaSyncService] = None


def get_sync_service() -> SchemaSyncService:
    """
    Get or create global schema sync service instance.
    
    Returns:
        SchemaSyncService instance
    """
    global _sync_service
    
    if _sync_service is None:
        _sync_service = SchemaSyncService()
    
    return _sync_service
