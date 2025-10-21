"""
Schema comparison engine for detecting differences between model and database schemas.

Compares expected schema from models with actual database schema to identify:
- Missing tables
- Missing columns
- Type mismatches
- Constraint differences
"""
import logging
from typing import Dict, List, Optional, Any
from .schema_introspection import TableSchema, ColumnInfo, get_introspector
from .model_analyzer import ModelSchema, ModelFieldInfo, get_analyzer

logger = logging.getLogger(__name__)


class SchemaDifference:
    """Represents a difference between model and database schema."""
    
    def __init__(
        self,
        diff_type: str,
        table_name: str,
        description: str,
        severity: str = 'info',
        details: Optional[Dict[str, Any]] = None
    ):
        self.diff_type = diff_type  # 'missing_table', 'missing_column', 'type_mismatch', etc.
        self.table_name = table_name
        self.description = description
        self.severity = severity  # 'info', 'warning', 'error'
        self.details = details or {}
    
    def __repr__(self) -> str:
        return f"SchemaDifference({self.diff_type}, {self.table_name}, {self.severity})"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary representation."""
        return {
            'type': self.diff_type,
            'table': self.table_name,
            'description': self.description,
            'severity': self.severity,
            'details': self.details
        }


class SchemaComparator:
    """
    Compares model schemas with database schemas to detect differences.
    
    Identifies missing tables, columns, type mismatches, and constraint differences.
    """
    
    def __init__(self):
        self.introspector = get_introspector()
        self.analyzer = get_analyzer()
        self.differences: List[SchemaDifference] = []
    
    async def compare_all_schemas(self) -> List[SchemaDifference]:
        """
        Compare all model schemas with database schemas.
        
        Returns:
            List of SchemaDifference objects
        """
        self.differences = []
        
        # Analyze all models first
        logger.info("Analyzing all models...")
        model_schemas = self.analyzer.analyze_all_models()
        logger.info(f"Found {len(model_schemas)} models to analyze")
        
        # Get all database schemas
        logger.info("Introspecting database schemas...")
        db_schemas = await self.introspector.get_all_schemas()
        logger.info(f"Found {len(db_schemas)} tables in database")
        
        # Compare each model with database
        for table_name, model_schema in model_schemas.items():
            # Skip aerich tables (managed by migration tool)
            if table_name.startswith('aerich'):
                continue
            await self._compare_table(table_name, model_schema, db_schemas.get(table_name))
        
        # Check for extra tables in database (not in models)
        for table_name in db_schemas.keys():
            # Skip aerich tables
            if table_name.startswith('aerich'):
                continue
            if table_name not in model_schemas:
                self.differences.append(SchemaDifference(
                    diff_type='extra_table',
                    table_name=table_name,
                    description=f"Table '{table_name}' exists in database but has no corresponding model",
                    severity='warning'
                ))
        
        return self.differences
    
    async def _compare_table(
        self,
        table_name: str,
        model_schema: ModelSchema,
        db_schema: Optional[TableSchema]
    ):
        """
        Compare a single table's model schema with database schema.
        
        Args:
            table_name: Name of the table
            model_schema: Expected schema from model
            db_schema: Actual schema from database (None if table doesn't exist)
        """
        # Check if table exists
        if db_schema is None:
            self.differences.append(SchemaDifference(
                diff_type='missing_table',
                table_name=table_name,
                description=f"Table '{table_name}' is defined in model but doesn't exist in database",
                severity='error',
                details={'model': model_schema.model_class.__name__}
            ))
            return
        
        # Compare columns
        await self._compare_columns(table_name, model_schema, db_schema)
        
        # Compare indexes
        self._compare_indexes(table_name, model_schema, db_schema)
    
    async def _compare_columns(
        self,
        table_name: str,
        model_schema: ModelSchema,
        db_schema: TableSchema
    ):
        """
        Compare columns between model and database.
        
        Args:
            table_name: Name of the table
            model_schema: Expected schema from model
            db_schema: Actual schema from database
        """
        # Check for missing columns
        for field_name, field_info in model_schema.fields.items():
            # Skip relation fields (they don't create columns in this table)
            if field_info.is_relation and not field_info.name.endswith('_id'):
                continue
            
            # Adjust field name for foreign keys
            db_field_name = field_name
            if field_info.is_relation and not field_name.endswith('_id'):
                db_field_name = f"{field_name}_id"
            
            if db_field_name not in db_schema.columns:
                self.differences.append(SchemaDifference(
                    diff_type='missing_column',
                    table_name=table_name,
                    description=f"Column '{db_field_name}' is missing in table '{table_name}'",
                    severity='error',
                    details={
                        'field_name': field_name,
                        'expected_type': field_info.sql_type,
                        'nullable': field_info.nullable,
                        'default': field_info.default
                    }
                ))
            else:
                # Column exists, compare properties
                db_column = db_schema.columns[db_field_name]
                self._compare_column_properties(
                    table_name,
                    db_field_name,
                    field_info,
                    db_column
                )
        
        # Check for extra columns in database
        for column_name, column_info in db_schema.columns.items():
            # Skip system columns
            if column_name in ['id', 'created_at', 'updated_at']:
                continue
            
            # Check if column exists in model
            model_field_name = column_name
            if column_name.endswith('_id'):
                # Could be a foreign key, check both with and without _id
                base_name = column_name[:-3]
                if base_name not in model_schema.fields and column_name not in model_schema.fields:
                    self.differences.append(SchemaDifference(
                        diff_type='extra_column',
                        table_name=table_name,
                        description=f"Column '{column_name}' exists in database but not in model",
                        severity='warning',
                        details={'column_type': column_info.data_type}
                    ))
            elif column_name not in model_schema.fields:
                self.differences.append(SchemaDifference(
                    diff_type='extra_column',
                    table_name=table_name,
                    description=f"Column '{column_name}' exists in database but not in model",
                    severity='warning',
                    details={'column_type': column_info.data_type}
                ))
    
    def _compare_column_properties(
        self,
        table_name: str,
        column_name: str,
        field_info: ModelFieldInfo,
        column_info: ColumnInfo
    ):
        """
        Compare properties of a column between model and database.
        
        Args:
            table_name: Name of the table
            column_name: Name of the column
            field_info: Expected field info from model
            column_info: Actual column info from database
        """
        # Compare data types
        if not self._types_match(field_info.sql_type, column_info.data_type):
            self.differences.append(SchemaDifference(
                diff_type='type_mismatch',
                table_name=table_name,
                description=f"Column '{column_name}' type mismatch in table '{table_name}'",
                severity='warning',
                details={
                    'column': column_name,
                    'expected_type': field_info.sql_type,
                    'actual_type': column_info.data_type
                }
            ))
        
        # Compare nullable constraint
        # Note: Primary keys are always NOT NULL in SQLite
        if not column_info.primary_key:
            expected_not_null = not field_info.nullable
            actual_not_null = column_info.not_null
            
            if expected_not_null != actual_not_null:
                self.differences.append(SchemaDifference(
                    diff_type='constraint_mismatch',
                    table_name=table_name,
                    description=f"Column '{column_name}' nullable constraint mismatch in table '{table_name}'",
                    severity='warning',
                    details={
                        'column': column_name,
                        'expected_nullable': field_info.nullable,
                        'actual_nullable': not column_info.not_null
                    }
                ))
    
    def _types_match(self, model_type: str, db_type: str) -> bool:
        """
        Check if model type matches database type.
        
        Args:
            model_type: Expected SQL type from model
            db_type: Actual SQL type from database
            
        Returns:
            True if types match or are compatible
        """
        # Normalize types for comparison
        model_type_upper = model_type.upper().strip()
        db_type_upper = db_type.upper().strip()
        
        # Exact match
        if model_type_upper == db_type_upper:
            return True
        
        # Extract base type (remove length/precision)
        model_base = model_type_upper.split('(')[0]
        db_base = db_type_upper.split('(')[0]
        
        # Check if base types match
        if model_base == db_base:
            return True
        
        # Type compatibility mappings
        compatible_types = {
            'INTEGER': ['INT', 'BIGINT', 'SMALLINT', 'TINYINT'],
            'VARCHAR': ['TEXT', 'CHAR'],
            'TEXT': ['VARCHAR', 'CHAR', 'CLOB'],
            'REAL': ['FLOAT', 'DOUBLE'],
            'TIMESTAMP': ['DATETIME'],
            'DECIMAL': ['NUMERIC', 'REAL'],
        }
        
        # Check compatibility
        for base_type, compatible in compatible_types.items():
            if model_base == base_type and db_base in compatible:
                return True
            if db_base == base_type and model_base in compatible:
                return True
        
        return False
    
    def _compare_indexes(
        self,
        table_name: str,
        model_schema: ModelSchema,
        db_schema: TableSchema
    ):
        """
        Compare indexes between model and database.
        
        Args:
            table_name: Name of the table
            model_schema: Expected schema from model
            db_schema: Actual schema from database
        """
        # Get expected indexes from model
        expected_indexes = set()
        
        # Add indexes from model Meta.indexes
        for index_def in model_schema.indexes:
            if isinstance(index_def, tuple):
                expected_indexes.add(tuple(sorted(index_def)))
        
        # Add unique fields as indexes
        for field_name, field_info in model_schema.fields.items():
            if field_info.unique and not field_info.primary_key:
                expected_indexes.add((field_name,))
        
        # Get actual indexes from database
        actual_indexes = set()
        for index_name, index_info in db_schema.indexes.items():
            actual_indexes.add(tuple(sorted(index_info.columns)))
        
        # Compare indexes (informational only, not critical)
        missing_indexes = expected_indexes - actual_indexes
        for index_columns in missing_indexes:
            self.differences.append(SchemaDifference(
                diff_type='missing_index',
                table_name=table_name,
                description=f"Index on columns {index_columns} is missing in table '{table_name}'",
                severity='info',
                details={'columns': list(index_columns)}
            ))
    
    def get_critical_differences(self) -> List[SchemaDifference]:
        """
        Get only critical differences (errors).
        
        Returns:
            List of critical SchemaDifference objects
        """
        return [diff for diff in self.differences if diff.severity == 'error']
    
    def get_differences_by_type(self, diff_type: str) -> List[SchemaDifference]:
        """
        Get differences of a specific type.
        
        Args:
            diff_type: Type of difference to filter
            
        Returns:
            List of SchemaDifference objects
        """
        return [diff for diff in self.differences if diff.diff_type == diff_type]
    
    def has_differences(self) -> bool:
        """
        Check if any differences were found.
        
        Returns:
            True if differences exist
        """
        return len(self.differences) > 0
    
    def has_critical_differences(self) -> bool:
        """
        Check if any critical differences were found.
        
        Returns:
            True if critical differences exist
        """
        return len(self.get_critical_differences()) > 0


# Global comparator instance
_comparator: Optional[SchemaComparator] = None


def get_comparator() -> SchemaComparator:
    """
    Get or create global schema comparator instance.
    
    Returns:
        SchemaComparator instance
    """
    global _comparator
    
    if _comparator is None:
        _comparator = SchemaComparator()
    
    return _comparator
