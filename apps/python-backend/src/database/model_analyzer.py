"""
Model schema analyzer for Tortoise ORM models.

Extracts expected schema from model definitions to compare with actual database schema.
"""
import logging
from typing import Dict, List, Optional, Any, Type
from tortoise import Model, fields
from tortoise.fields.relational import RelationalField

logger = logging.getLogger(__name__)


class ModelFieldInfo:
    """Represents expected field metadata from a Tortoise ORM model."""
    
    def __init__(
        self,
        name: str,
        field_type: str,
        sql_type: str,
        nullable: bool,
        default: Any,
        primary_key: bool,
        unique: bool,
        max_length: Optional[int] = None,
        is_relation: bool = False
    ):
        self.name = name
        self.field_type = field_type
        self.sql_type = sql_type
        self.nullable = nullable
        self.default = default
        self.primary_key = primary_key
        self.unique = unique
        self.max_length = max_length
        self.is_relation = is_relation
    
    def __repr__(self) -> str:
        return (
            f"ModelFieldInfo(name='{self.name}', type='{self.field_type}', "
            f"sql='{self.sql_type}', nullable={self.nullable}, pk={self.primary_key})"
        )
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary representation."""
        return {
            'name': self.name,
            'field_type': self.field_type,
            'sql_type': self.sql_type,
            'nullable': self.nullable,
            'default': self.default,
            'primary_key': self.primary_key,
            'unique': self.unique,
            'max_length': self.max_length,
            'is_relation': self.is_relation
        }


class ModelSchema:
    """Represents expected schema from a Tortoise ORM model."""
    
    def __init__(self, model_class: Type[Model]):
        self.model_class = model_class
        self.table_name = model_class._meta.db_table or model_class.__name__.lower()
        self.fields: Dict[str, ModelFieldInfo] = {}
        self.indexes: List[tuple] = []
        self.unique_together: List[tuple] = []
        
        self._analyze_model()
    
    def _analyze_model(self):
        """Analyze the model and extract field information."""
        meta = self.model_class._meta
        
        # Extract field information
        for field_name, field_obj in meta.fields_map.items():
            # Skip backward relations (reverse foreign keys, many-to-many reverse)
            field_type_name = type(field_obj).__name__
            if field_type_name in ['BackwardFKRelation', 'BackwardOneToOneRelation', 'ManyToManyRelation']:
                continue
            
            field_info = self._extract_field_info(field_name, field_obj)
            if field_info:
                self.fields[field_name] = field_info
        
        # Extract indexes
        if hasattr(meta, 'indexes') and meta.indexes:
            self.indexes = meta.indexes
        
        # Extract unique_together constraints
        if hasattr(meta, 'unique_together') and meta.unique_together:
            self.unique_together = meta.unique_together
    
    def _extract_field_info(self, field_name: str, field_obj) -> Optional[ModelFieldInfo]:
        """
        Extract field information from a Tortoise field object.
        
        Args:
            field_name: Name of the field
            field_obj: Tortoise field object
            
        Returns:
            ModelFieldInfo object or None
        """
        try:
            # Determine field type
            field_type = type(field_obj).__name__
            
            # Check if it's a relation field
            is_relation = isinstance(field_obj, RelationalField)
            
            # Get SQL type
            sql_type = self._get_sql_type(field_obj)
            
            # Get nullable status
            nullable = getattr(field_obj, 'null', False)
            
            # Get default value
            default = getattr(field_obj, 'default', None)
            
            # Get primary key status
            primary_key = getattr(field_obj, 'pk', False)
            
            # Get unique status
            unique = getattr(field_obj, 'unique', False)
            
            # Get max_length for string fields
            max_length = getattr(field_obj, 'max_length', None)
            
            return ModelFieldInfo(
                name=field_name,
                field_type=field_type,
                sql_type=sql_type,
                nullable=nullable,
                default=default,
                primary_key=primary_key,
                unique=unique,
                max_length=max_length,
                is_relation=is_relation
            )
            
        except Exception as e:
            logger.warning(f"Failed to extract field info for '{field_name}': {e}")
            return None
    
    def _get_sql_type(self, field_obj) -> str:
        """
        Determine SQL type for a field.
        
        Args:
            field_obj: Tortoise field object
            
        Returns:
            SQL type string
        """
        field_type = type(field_obj).__name__
        
        # Map Tortoise field types to SQLite types
        type_mapping = {
            'IntField': 'INTEGER',
            'BigIntField': 'BIGINT',
            'SmallIntField': 'SMALLINT',
            'CharField': 'VARCHAR',
            'TextField': 'TEXT',
            'BooleanField': 'INTEGER',  # SQLite uses INTEGER for boolean
            'DecimalField': 'DECIMAL',
            'FloatField': 'REAL',
            'DateField': 'DATE',
            'DatetimeField': 'TIMESTAMP',
            'TimeField': 'TIME',
            'TimeDeltaField': 'BIGINT',
            'JSONField': 'TEXT',
            'UUIDField': 'CHAR',
            'BinaryField': 'BLOB',
            'CharEnumField': 'VARCHAR',
            'IntEnumField': 'INTEGER',
            'ForeignKeyField': 'INTEGER',
            'OneToOneField': 'INTEGER',
        }
        
        sql_type = type_mapping.get(field_type, 'TEXT')
        
        # Add length for VARCHAR fields
        if sql_type == 'VARCHAR':
            max_length = getattr(field_obj, 'max_length', 255)
            sql_type = f'VARCHAR({max_length})'
        
        # Add precision for DECIMAL fields
        if sql_type == 'DECIMAL':
            max_digits = getattr(field_obj, 'max_digits', 10)
            decimal_places = getattr(field_obj, 'decimal_places', 2)
            sql_type = f'DECIMAL({max_digits},{decimal_places})'
        
        # Add length for UUID fields
        if sql_type == 'CHAR' and field_type == 'UUIDField':
            sql_type = 'CHAR(36)'
        
        return sql_type
    
    def __repr__(self) -> str:
        return (
            f"ModelSchema(table='{self.table_name}', "
            f"model='{self.model_class.__name__}', fields={len(self.fields)})"
        )
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary representation."""
        return {
            'table_name': self.table_name,
            'model_name': self.model_class.__name__,
            'fields': {name: field.to_dict() for name, field in self.fields.items()},
            'indexes': self.indexes,
            'unique_together': self.unique_together
        }


class ModelAnalyzer:
    """
    Analyzes Tortoise ORM models to extract expected schema.
    
    Reads model definitions and generates expected database schema
    to compare with actual database structure.
    """
    
    def __init__(self):
        self.models: Dict[str, Type[Model]] = {}
        self.schemas: Dict[str, ModelSchema] = {}
    
    def register_model(self, model_class: Type[Model]):
        """
        Register a model for analysis.
        
        Args:
            model_class: Tortoise Model class
        """
        table_name = model_class._meta.db_table or model_class.__name__.lower()
        self.models[table_name] = model_class
    
    def analyze_model(self, model_class: Type[Model]) -> ModelSchema:
        """
        Analyze a single model and return its schema.
        
        Args:
            model_class: Tortoise Model class
            
        Returns:
            ModelSchema object
        """
        schema = ModelSchema(model_class)
        self.schemas[schema.table_name] = schema
        return schema
    
    def analyze_all_models(self) -> Dict[str, ModelSchema]:
        """
        Analyze all registered models.
        
        Returns:
            Dictionary mapping table names to ModelSchema objects
        """
        from tortoise import Tortoise
        
        # Get all registered models from Tortoise
        for app_name, app_models in Tortoise.apps.items():
            for model_name, model_class in app_models.items():
                # Skip aerich models
                if model_name.startswith('aerich'):
                    continue
                
                try:
                    schema = self.analyze_model(model_class)
                    logger.debug(f"Analyzed model: {model_name} -> {schema.table_name}")
                except Exception as e:
                    logger.error(f"Failed to analyze model '{model_name}': {e}")
        
        return self.schemas
    
    def get_model_schema(self, table_name: str) -> Optional[ModelSchema]:
        """
        Get schema for a specific table.
        
        Args:
            table_name: Name of the table
            
        Returns:
            ModelSchema object or None if not found
        """
        return self.schemas.get(table_name)
    
    def get_all_table_names(self) -> List[str]:
        """
        Get list of all table names from analyzed models.
        
        Returns:
            List of table names
        """
        return list(self.schemas.keys())


# Global analyzer instance
_analyzer: Optional[ModelAnalyzer] = None


def get_analyzer() -> ModelAnalyzer:
    """
    Get or create global model analyzer instance.
    
    Returns:
        ModelAnalyzer instance
    """
    global _analyzer
    
    if _analyzer is None:
        _analyzer = ModelAnalyzer()
    
    return _analyzer
