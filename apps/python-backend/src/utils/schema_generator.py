"""
Automatic Pydantic schema generator from Tortoise ORM models.

This module provides utilities to introspect Tortoise ORM models and automatically
generate corresponding Pydantic schemas for API validation.
"""
import inspect
import logging
from datetime import datetime
from decimal import Decimal
from enum import Enum
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Type, get_args, get_origin

from tortoise import fields
from tortoise.models import Model
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


class SchemaGenerator:
    """
    Generates Pydantic schemas from Tortoise ORM models.
    
    Supports:
    - Field type mapping (Tortoise → Pydantic)
    - Relationships (ForeignKey, ManyToMany, OneToOne)
    - Enums and custom types
    - Create/Update/Response schema variants
    - Custom validators and field configurations
    """
    
    # Tortoise field type to Python type mapping
    FIELD_TYPE_MAP = {
        fields.IntField: int,
        fields.BigIntField: int,
        fields.SmallIntField: int,
        fields.CharField: str,
        fields.TextField: str,
        fields.BooleanField: bool,
        fields.FloatField: float,
        fields.DecimalField: Decimal,
        fields.DateField: datetime,
        fields.DatetimeField: datetime,
        fields.TimeField: datetime,
        fields.TimeDeltaField: int,
        fields.JSONField: Dict[str, Any],
        fields.UUIDField: str,
        fields.BinaryField: bytes,
    }
    
    def __init__(self, models: List[Type[Model]], output_path: Optional[Path] = None):
        """
        Initialize schema generator.
        
        Args:
            models: List of Tortoise ORM model classes to generate schemas for
            output_path: Optional path to write generated schemas (default: src/api/schemas_generated.py)
        """
        self.models = models
        self.output_path = output_path or Path(__file__).parent.parent / "api" / "schemas_generated.py"
        self.generated_schemas: Dict[str, str] = {}
        self.imports: Set[str] = {
            "from datetime import datetime",
            "from decimal import Decimal",
            "from typing import Optional, Any, Dict, List",
            "from pydantic import BaseModel, Field, field_validator",
        }
        
    def get_python_type(self, field: fields.Field) -> str:
        """
        Get Python type annotation for a Tortoise field.
        
        Args:
            field: Tortoise field instance
            
        Returns:
            Python type annotation as string
        """
        field_class = type(field)
        
        # Handle ForeignKey relationships
        if isinstance(field, fields.relational.ForeignKeyFieldInstance):
            return "int"  # Foreign keys are represented by their ID
            
        # Handle enum fields (CharEnumField, IntEnumField)
        if hasattr(field, 'enum_type') and field.enum_type:
            enum_name = field.enum_type.__name__
            self.imports.add(f"from enum import Enum")
            return enum_name
            
        # Standard field type mapping
        python_type = self.FIELD_TYPE_MAP.get(field_class, Any)
        
        if python_type == Any:
            logger.warning(f"Unknown field type: {field_class}, using Any")
            
        return python_type.__name__ if hasattr(python_type, '__name__') else str(python_type)
    
    def get_field_constraints(self, field: fields.Field) -> Dict[str, Any]:
        """
        Extract field constraints for Pydantic Field().
        
        Args:
            field: Tortoise field instance
            
        Returns:
            Dictionary of field constraints
        """
        constraints = {}
        
        # String length constraints
        if isinstance(field, (fields.CharField, fields.TextField)):
            if hasattr(field, 'max_length') and field.max_length:
                constraints['max_length'] = field.max_length
                
        # Numeric constraints
        if isinstance(field, (fields.IntField, fields.FloatField, fields.DecimalField)):
            if hasattr(field, 'ge') and field.ge is not None:
                constraints['ge'] = field.ge
            if hasattr(field, 'le') and field.le is not None:
                constraints['le'] = field.le
                
        # Decimal precision
        if isinstance(field, fields.DecimalField):
            if hasattr(field, 'max_digits'):
                constraints['max_digits'] = field.max_digits
            if hasattr(field, 'decimal_places'):
                constraints['decimal_places'] = field.decimal_places
                
        # Description
        if hasattr(field, 'description') and field.description:
            constraints['description'] = field.description
            
        return constraints
    
    def generate_field_definition(
        self, 
        field_name: str, 
        field: fields.Field, 
        is_optional: bool = False,
        is_create: bool = False,
        is_update: bool = False
    ) -> str:
        """
        Generate Pydantic field definition.
        
        Args:
            field_name: Name of the field
            field: Tortoise field instance
            is_optional: Whether field should be Optional
            is_create: Whether this is for a Create schema
            is_update: Whether this is for an Update schema
            
        Returns:
            Field definition as string
        """
        python_type = self.get_python_type(field)
        constraints = self.get_field_constraints(field)
        
        # Determine if field is nullable
        nullable = getattr(field, 'null', False) or is_optional or is_update
        
        # Build type annotation
        if nullable:
            type_annotation = f"Optional[{python_type}]"
        else:
            type_annotation = python_type
            
        # Build Field() arguments
        field_args = []
        
        # Default value
        if is_update:
            field_args.append("None")
        elif hasattr(field, 'default') and field.default is not None:
            default_val = field.default
            if callable(default_val):
                field_args.append("default_factory=" + default_val.__name__)
            elif isinstance(default_val, str):
                field_args.append(f'default="{default_val}"')
            elif isinstance(default_val, bool):
                field_args.append(f'default={default_val}')
            else:
                field_args.append(f'default={default_val}')
        elif not nullable and not is_update:
            field_args.append("...")
        else:
            field_args.append("None")
            
        # Add constraints
        for key, value in constraints.items():
            if isinstance(value, str):
                field_args.append(f'{key}="{value}"')
            else:
                field_args.append(f'{key}={value}')
                
        # Build final field definition
        if field_args:
            return f"    {field_name}: {type_annotation} = Field({', '.join(field_args)})"
        else:
            return f"    {field_name}: {type_annotation}"
    
    def generate_create_schema(self, model: Type[Model]) -> str:
        """
        Generate Create schema for a model.
        
        Args:
            model: Tortoise model class
            
        Returns:
            Schema class definition as string
        """
        model_name = model.__name__
        schema_name = f"{model_name}Create"
        
        lines = [
            f"class {schema_name}(BaseModel):",
            f'    """Schema for creating a new {model_name.lower()}"""',
        ]
        
        # Get all fields except auto-generated ones
        for field_name, field in model._meta.fields_map.items():
            # Skip auto-generated fields
            if field_name in ['id', 'created_at', 'updated_at']:
                continue
                
            # Skip reverse relations
            if isinstance(field, (fields.relational.BackwardFKRelation, 
                                 fields.relational.ManyToManyRelation)):
                continue
                
            field_def = self.generate_field_definition(
                field_name, field, is_create=True
            )
            lines.append(field_def)
            
        # Add empty body if no fields
        if len(lines) == 2:
            lines.append("    pass")
            
        return "\n".join(lines)
    
    def generate_update_schema(self, model: Type[Model]) -> str:
        """
        Generate Update schema for a model.
        
        Args:
            model: Tortoise model class
            
        Returns:
            Schema class definition as string
        """
        model_name = model.__name__
        schema_name = f"{model_name}Update"
        
        lines = [
            f"class {schema_name}(BaseModel):",
            f'    """Schema for updating a {model_name.lower()}"""',
        ]
        
        # Get all fields except auto-generated ones
        for field_name, field in model._meta.fields_map.items():
            # Skip auto-generated fields
            if field_name in ['id', 'created_at', 'updated_at']:
                continue
                
            # Skip reverse relations
            if isinstance(field, (fields.relational.BackwardFKRelation, 
                                 fields.relational.ManyToManyRelation)):
                continue
                
            field_def = self.generate_field_definition(
                field_name, field, is_update=True
            )
            lines.append(field_def)
            
        # Add empty body if no fields
        if len(lines) == 2:
            lines.append("    pass")
            
        return "\n".join(lines)
    
    def generate_response_schema(self, model: Type[Model]) -> str:
        """
        Generate Response schema for a model.
        
        Args:
            model: Tortoise model class
            
        Returns:
            Schema class definition as string
        """
        model_name = model.__name__
        schema_name = f"{model_name}Response"
        
        lines = [
            f"class {schema_name}(BaseModel):",
            f'    """Schema for {model_name.lower()} response"""',
        ]
        
        # Get all fields including auto-generated ones
        for field_name, field in model._meta.fields_map.items():
            # Skip reverse relations
            if isinstance(field, (fields.relational.BackwardFKRelation, 
                                 fields.relational.ManyToManyRelation)):
                continue
                
            field_def = self.generate_field_definition(
                field_name, field, is_optional=False
            )
            lines.append(field_def)
            
        # Add Config class
        lines.extend([
            "",
            "    class Config:",
            "        from_attributes = True",
        ])
            
        return "\n".join(lines)
    
    def generate_enum_definitions(self, model: Type[Model]) -> List[str]:
        """
        Generate enum definitions used by the model.
        
        Args:
            model: Tortoise model class
            
        Returns:
            List of enum definition strings
        """
        enum_defs = []
        
        for field_name, field in model._meta.fields_map.items():
            if hasattr(field, 'enum_type') and field.enum_type:
                enum_type = field.enum_type
                if inspect.isclass(enum_type) and issubclass(enum_type, Enum):
                    enum_name = enum_type.__name__
                    lines = [f"class {enum_name}(str, Enum):"]
                    lines.append(f'    """Enum for {field_name}"""')
                    
                    for member in enum_type:
                        lines.append(f'    {member.name} = "{member.value}"')
                        
                    enum_defs.append("\n".join(lines))
                    
        return enum_defs
    
    def generate_schemas_for_model(self, model: Type[Model]) -> Dict[str, str]:
        """
        Generate all schemas for a single model.
        
        Args:
            model: Tortoise model class
            
        Returns:
            Dictionary mapping schema names to their definitions
        """
        schemas = {}
        
        # Generate enum definitions first
        enum_defs = self.generate_enum_definitions(model)
        if enum_defs:
            schemas['enums'] = "\n\n".join(enum_defs)
            
        # Generate schemas
        schemas['create'] = self.generate_create_schema(model)
        schemas['update'] = self.generate_update_schema(model)
        schemas['response'] = self.generate_response_schema(model)
        
        return schemas
    
    def generate_all_schemas(self) -> str:
        """
        Generate schemas for all models.
        
        Returns:
            Complete schema file content as string
        """
        lines = [
            '"""',
            'Auto-generated Pydantic schemas from Tortoise ORM models.',
            '',
            'This file is automatically generated by the schema sync system.',
            'DO NOT EDIT MANUALLY - Changes will be overwritten.',
            '',
            f'Generated at: {datetime.now().isoformat()}',
            '"""',
        ]
        
        # Add imports
        lines.extend(sorted(self.imports))
        lines.append("")
        
        # Generate schemas for each model
        for model in self.models:
            model_name = model.__name__
            logger.info(f"Generating schemas for model: {model_name}")
            
            lines.append(f"\n# {'=' * 80}")
            lines.append(f"# {model_name} Schemas")
            lines.append(f"# {'=' * 80}\n")
            
            schemas = self.generate_schemas_for_model(model)
            
            # Add enum definitions
            if 'enums' in schemas:
                lines.append(schemas['enums'])
                lines.append("")
                
            # Add Create schema
            lines.append(schemas['create'])
            lines.append("")
            
            # Add Update schema
            lines.append(schemas['update'])
            lines.append("")
            
            # Add Response schema
            lines.append(schemas['response'])
            lines.append("")
            
        return "\n".join(lines)
    
    def write_schemas(self) -> Path:
        """
        Generate and write schemas to file.
        
        Returns:
            Path to the generated schema file
        """
        logger.info(f"Generating schemas for {len(self.models)} models...")
        
        content = self.generate_all_schemas()
        
        # Ensure output directory exists
        self.output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Write to file
        self.output_path.write_text(content)
        
        logger.info(f"Schemas written to: {self.output_path}")
        
        return self.output_path


def get_all_models() -> List[Type[Model]]:
    """
    Get all Tortoise ORM models from the application.
    
    Returns:
        List of model classes
    """
    from src.database.models import (
        user, customer, customer_transaction, product, inventory,
        setting, settings, tax_rule, sale, cash_transaction, expense, discount,
        user_activity
    )
    
    models = []
    
    # Collect all model classes from each module
    for module in [user, customer, customer_transaction, product, inventory,
                   setting, settings, tax_rule, sale, cash_transaction, expense, 
                   discount, user_activity]:
        for name in dir(module):
            obj = getattr(module, name)
            if (inspect.isclass(obj) and 
                issubclass(obj, Model) and 
                obj is not Model and
                not obj._meta.abstract):
                models.append(obj)
                
    return models


async def generate_schemas_from_models(output_path: Optional[Path] = None) -> Path:
    """
    Main entry point for schema generation.
    
    Args:
        output_path: Optional custom output path
        
    Returns:
        Path to generated schema file
    """
    models = get_all_models()
    generator = SchemaGenerator(models, output_path)
    return generator.write_schemas()
