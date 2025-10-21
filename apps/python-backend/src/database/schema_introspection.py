"""
Database schema introspection utility for SQLite.

Reads actual table structure from the database to compare with model definitions.
"""
import logging
from typing import Dict, List, Optional, Any
from tortoise import Tortoise
from tortoise.transactions import in_transaction

logger = logging.getLogger(__name__)


class ColumnInfo:
    """Represents a database column's metadata."""
    
    def __init__(
        self,
        name: str,
        data_type: str,
        not_null: bool,
        default_value: Optional[str],
        primary_key: bool
    ):
        self.name = name
        self.data_type = data_type.upper()
        self.not_null = not_null
        self.default_value = default_value
        self.primary_key = primary_key
    
    def __repr__(self) -> str:
        return (
            f"ColumnInfo(name='{self.name}', type='{self.data_type}', "
            f"not_null={self.not_null}, pk={self.primary_key})"
        )
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary representation."""
        return {
            'name': self.name,
            'data_type': self.data_type,
            'not_null': self.not_null,
            'default_value': self.default_value,
            'primary_key': self.primary_key
        }


class IndexInfo:
    """Represents a database index's metadata."""
    
    def __init__(
        self,
        name: str,
        columns: List[str],
        unique: bool
    ):
        self.name = name
        self.columns = columns
        self.unique = unique
    
    def __repr__(self) -> str:
        return f"IndexInfo(name='{self.name}', columns={self.columns}, unique={self.unique})"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary representation."""
        return {
            'name': self.name,
            'columns': self.columns,
            'unique': self.unique
        }


class TableSchema:
    """Represents a complete table schema."""
    
    def __init__(self, table_name: str):
        self.table_name = table_name
        self.columns: Dict[str, ColumnInfo] = {}
        self.indexes: Dict[str, IndexInfo] = {}
        self.foreign_keys: List[Dict[str, Any]] = []
    
    def add_column(self, column: ColumnInfo):
        """Add a column to the schema."""
        self.columns[column.name] = column
    
    def add_index(self, index: IndexInfo):
        """Add an index to the schema."""
        self.indexes[index.name] = index
    
    def add_foreign_key(self, fk_info: Dict[str, Any]):
        """Add a foreign key constraint."""
        self.foreign_keys.append(fk_info)
    
    def __repr__(self) -> str:
        return (
            f"TableSchema(table='{self.table_name}', "
            f"columns={len(self.columns)}, indexes={len(self.indexes)})"
        )
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary representation."""
        return {
            'table_name': self.table_name,
            'columns': {name: col.to_dict() for name, col in self.columns.items()},
            'indexes': {name: idx.to_dict() for name, idx in self.indexes.items()},
            'foreign_keys': self.foreign_keys
        }


class SchemaIntrospector:
    """
    Introspects database schema from SQLite database.
    
    Reads actual table structures, columns, indexes, and constraints
    to compare with model definitions.
    """
    
    async def get_all_tables(self) -> List[str]:
        """
        Get list of all tables in the database.
        
        Returns:
            List of table names
        """
        async with in_transaction() as conn:
            result = await conn.execute_query_dict(
                """
                SELECT name FROM sqlite_master 
                WHERE type='table' 
                AND name NOT LIKE 'sqlite_%'
                AND name NOT LIKE 'aerich%'
                ORDER BY name
                """
            )
            return [row['name'] for row in result]
    
    async def get_table_schema(self, table_name: str) -> Optional[TableSchema]:
        """
        Get complete schema information for a table.
        
        Args:
            table_name: Name of the table
            
        Returns:
            TableSchema object or None if table doesn't exist
        """
        try:
            schema = TableSchema(table_name)
            
            # Get column information
            columns = await self._get_table_columns(table_name)
            for col in columns:
                schema.add_column(col)
            
            # Get index information
            indexes = await self._get_table_indexes(table_name)
            for idx in indexes:
                schema.add_index(idx)
            
            # Get foreign key information
            foreign_keys = await self._get_table_foreign_keys(table_name)
            for fk in foreign_keys:
                schema.add_foreign_key(fk)
            
            return schema
            
        except Exception as e:
            logger.error(f"Failed to get schema for table '{table_name}': {e}")
            return None
    
    async def _get_table_columns(self, table_name: str) -> List[ColumnInfo]:
        """
        Get column information for a table using PRAGMA table_info.
        
        Args:
            table_name: Name of the table
            
        Returns:
            List of ColumnInfo objects
        """
        async with in_transaction() as conn:
            result = await conn.execute_query_dict(
                f"PRAGMA table_info({table_name})"
            )
            
            columns = []
            for row in result:
                column = ColumnInfo(
                    name=row['name'],
                    data_type=row['type'],
                    not_null=bool(row['notnull']),
                    default_value=row['dflt_value'],
                    primary_key=bool(row['pk'])
                )
                columns.append(column)
            
            return columns
    
    async def _get_table_indexes(self, table_name: str) -> List[IndexInfo]:
        """
        Get index information for a table.
        
        Args:
            table_name: Name of the table
            
        Returns:
            List of IndexInfo objects
        """
        async with in_transaction() as conn:
            # Get list of indexes
            indexes_result = await conn.execute_query_dict(
                f"PRAGMA index_list({table_name})"
            )
            
            indexes = []
            for idx_row in indexes_result:
                idx_name = idx_row['name']
                
                # Skip auto-generated indexes for primary keys
                if idx_name.startswith('sqlite_autoindex_'):
                    continue
                
                # Get columns in this index
                columns_result = await conn.execute_query_dict(
                    f"PRAGMA index_info({idx_name})"
                )
                
                columns = [col['name'] for col in columns_result]
                
                index = IndexInfo(
                    name=idx_name,
                    columns=columns,
                    unique=bool(idx_row['unique'])
                )
                indexes.append(index)
            
            return indexes
    
    async def _get_table_foreign_keys(self, table_name: str) -> List[Dict[str, Any]]:
        """
        Get foreign key constraints for a table.
        
        Args:
            table_name: Name of the table
            
        Returns:
            List of foreign key information dictionaries
        """
        async with in_transaction() as conn:
            result = await conn.execute_query_dict(
                f"PRAGMA foreign_key_list({table_name})"
            )
            
            foreign_keys = []
            for row in result:
                fk_info = {
                    'id': row['id'],
                    'table': row['table'],
                    'from_column': row['from'],
                    'to_column': row['to'],
                    'on_update': row['on_update'],
                    'on_delete': row['on_delete']
                }
                foreign_keys.append(fk_info)
            
            return foreign_keys
    
    async def get_all_schemas(self) -> Dict[str, TableSchema]:
        """
        Get schemas for all tables in the database.
        
        Returns:
            Dictionary mapping table names to TableSchema objects
        """
        tables = await self.get_all_tables()
        schemas = {}
        
        for table_name in tables:
            schema = await self.get_table_schema(table_name)
            if schema:
                schemas[table_name] = schema
        
        return schemas
    
    async def table_exists(self, table_name: str) -> bool:
        """
        Check if a table exists in the database.
        
        Args:
            table_name: Name of the table
            
        Returns:
            True if table exists, False otherwise
        """
        async with in_transaction() as conn:
            result = await conn.execute_query_dict(
                """
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name=?
                """,
                [table_name]
            )
            return len(result) > 0
    
    async def column_exists(self, table_name: str, column_name: str) -> bool:
        """
        Check if a column exists in a table.
        
        Args:
            table_name: Name of the table
            column_name: Name of the column
            
        Returns:
            True if column exists, False otherwise
        """
        try:
            columns = await self._get_table_columns(table_name)
            return any(col.name == column_name for col in columns)
        except Exception:
            return False


# Global introspector instance
_introspector: Optional[SchemaIntrospector] = None


def get_introspector() -> SchemaIntrospector:
    """
    Get or create global schema introspector instance.
    
    Returns:
        SchemaIntrospector instance
    """
    global _introspector
    
    if _introspector is None:
        _introspector = SchemaIntrospector()
    
    return _introspector
