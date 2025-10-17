"""
Setting model for normalized application configuration storage.

This model replaces the JSON-based Settings model with a normalized
relational structure where each setting is stored as an individual row.
"""
import json
from enum import Enum
from typing import Any, Dict, List, Optional
from tortoise import fields
from tortoise.exceptions import DoesNotExist
from .base import BaseModel


class SettingDataType(str, Enum):
    """Data type enumeration for settings"""
    STRING = "string"
    NUMBER = "number"
    BOOLEAN = "boolean"
    JSON = "json"


class Setting(BaseModel):
    """
    Normalized setting model for storing individual configuration values.
    
    Each setting is stored as a separate row with:
    - section: Category/group (e.g., 'display', 'security', 'inventory')
    - key: Setting name (e.g., 'theme', 'sessionTimeout', 'enableStockTracking')
    - value: Current value (stored as string, converted based on data_type)
    - default_value: Default value for reset functionality
    - data_type: Type indicator for proper conversion (string, number, boolean, json)
    - description: Human-readable description
    
    Benefits over JSON-based approach:
    - Better organization and separation by section
    - Easier querying and filtering
    - Individual setting change tracking
    - Type safety with data_type field
    - Built-in default value management
    - No schema changes needed to add new settings
    """
    
    # Setting identification
    section = fields.CharField(
        max_length=50,
        description="Setting section/category (e.g., 'display', 'security', 'inventory')"
    )
    
    key = fields.CharField(
        max_length=100,
        description="Setting key/name (e.g., 'theme', 'sessionTimeout')"
    )
    
    # Setting values
    value = fields.TextField(
        description="Current setting value (stored as string, converted based on data_type)"
    )
    
    default_value = fields.TextField(
        description="Default setting value for reset functionality"
    )
    
    # Metadata
    data_type = fields.CharEnumField(
        SettingDataType,
        default=SettingDataType.STRING,
        description="Data type for proper value conversion"
    )
    
    description = fields.TextField(
        null=True,
        description="Human-readable description of the setting"
    )
    
    class Meta:
        table = "setting"
        unique_together = (("section", "key"),)
        indexes = [
            ("section",),
            ("section", "key"),
        ]
    
    def __str__(self) -> str:
        return f"{self.section}.{self.key} = {self.value}"
    
    def get_typed_value(self) -> Any:
        """
        Get the value converted to its proper type based on data_type.
        
        Returns:
            The value converted to the appropriate Python type
        """
        if self.data_type == SettingDataType.BOOLEAN:
            return self.value.lower() in ('true', '1', 'yes', 'on')
        elif self.data_type == SettingDataType.NUMBER:
            # Try int first, then float
            try:
                return int(self.value)
            except ValueError:
                return float(self.value)
        elif self.data_type == SettingDataType.JSON:
            return json.loads(self.value)
        else:  # STRING
            return self.value
    
    def get_typed_default(self) -> Any:
        """
        Get the default value converted to its proper type.
        
        Returns:
            The default value converted to the appropriate Python type
        """
        if self.data_type == SettingDataType.BOOLEAN:
            return self.default_value.lower() in ('true', '1', 'yes', 'on')
        elif self.data_type == SettingDataType.NUMBER:
            try:
                return int(self.default_value)
            except ValueError:
                return float(self.default_value)
        elif self.data_type == SettingDataType.JSON:
            return json.loads(self.default_value)
        else:  # STRING
            return self.default_value
    
    @staticmethod
    def value_to_string(value: Any, data_type: SettingDataType) -> str:
        """
        Convert a Python value to string for storage.
        
        Args:
            value: The value to convert
            data_type: The data type of the setting
            
        Returns:
            String representation of the value
        """
        if data_type == SettingDataType.BOOLEAN:
            return 'true' if value else 'false'
        elif data_type == SettingDataType.JSON:
            return json.dumps(value)
        else:
            return str(value)
    
    @classmethod
    async def get_setting(cls, section: str, key: str, default: Any = None) -> Optional[Any]:
        """
        Get a single setting value by section and key.
        
        Args:
            section: Setting section
            key: Setting key
            default: Default value to return if setting doesn't exist
            
        Returns:
            The typed setting value or default if not found
        """
        try:
            setting = await cls.get(section=section, key=key)
            return setting.get_typed_value()
        except DoesNotExist:
            return default
    
    @classmethod
    async def get_section(cls, section: str) -> Dict[str, Any]:
        """
        Get all settings for a section as a dictionary.
        
        Args:
            section: Setting section name
            
        Returns:
            Dictionary mapping keys to typed values
        """
        settings = await cls.filter(section=section).all()
        return {setting.key: setting.get_typed_value() for setting in settings}
    
    @classmethod
    async def update_setting(cls, section: str, key: str, value: Any) -> 'Setting':
        """
        Update a single setting value.
        
        Args:
            section: Setting section
            key: Setting key
            value: New value (will be converted to string based on data_type)
            
        Returns:
            Updated Setting instance
            
        Raises:
            DoesNotExist: If setting doesn't exist
        """
        setting = await cls.get(section=section, key=key)
        setting.value = cls.value_to_string(value, setting.data_type)
        await setting.save()
        return setting
    
    @classmethod
    async def update_section(cls, section: str, settings_dict: Dict[str, Any]) -> List['Setting']:
        """
        Update multiple settings in a section.
        
        Args:
            section: Setting section
            settings_dict: Dictionary mapping keys to new values
            
        Returns:
            List of updated Setting instances
        """
        updated = []
        for key, value in settings_dict.items():
            try:
                setting = await cls.update_setting(section, key, value)
                updated.append(setting)
            except DoesNotExist:
                # Skip settings that don't exist
                continue
        return updated
    
    @classmethod
    async def bulk_update(cls, updates: List[Dict[str, Any]]) -> List['Setting']:
        """
        Bulk update multiple settings across sections.
        
        Args:
            updates: List of dicts with 'section', 'key', and 'value' keys
            
        Returns:
            List of updated Setting instances
        """
        updated = []
        for update in updates:
            try:
                setting = await cls.update_setting(
                    update['section'],
                    update['key'],
                    update['value']
                )
                updated.append(setting)
            except (DoesNotExist, KeyError):
                continue
        return updated
    
    @classmethod
    async def initialize_defaults(cls, defaults: List[Dict[str, Any]]) -> int:
        """
        Initialize settings from a list of default configurations.
        Only creates settings that don't already exist.
        
        Args:
            defaults: List of dicts with setting configuration
                     (section, key, value, default_value, data_type, description)
            
        Returns:
            Number of settings created
        """
        created_count = 0
        for default in defaults:
            # Check if setting already exists
            exists = await cls.filter(
                section=default['section'],
                key=default['key']
            ).exists()
            
            if not exists:
                await cls.create(
                    section=default['section'],
                    key=default['key'],
                    value=default.get('value', default['default_value']),
                    default_value=default['default_value'],
                    data_type=default.get('data_type', SettingDataType.STRING),
                    description=default.get('description', '')
                )
                created_count += 1
        
        return created_count
    
    @classmethod
    async def reset_to_default(cls, section: str, key: str) -> 'Setting':
        """
        Reset a setting to its default value.
        
        Args:
            section: Setting section
            key: Setting key
            
        Returns:
            Updated Setting instance
        """
        setting = await cls.get(section=section, key=key)
        setting.value = setting.default_value
        await setting.save()
        return setting
    
    @classmethod
    async def reset_section_to_defaults(cls, section: str) -> List['Setting']:
        """
        Reset all settings in a section to their default values.
        
        Args:
            section: Setting section
            
        Returns:
            List of updated Setting instances
        """
        settings = await cls.filter(section=section).all()
        for setting in settings:
            setting.value = setting.default_value
            await setting.save()
        return settings

