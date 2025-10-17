"""
Settings model for application configuration
"""
from tortoise import fields
from .base import BaseModel


class Settings(BaseModel):
    """
    Settings model for storing application configuration.
    
    This model uses a singleton pattern - only one settings record should exist.
    All settings are stored as JSON fields for flexibility.
    """
    
    # General Settings
    general_settings = fields.JSONField(
        default={
            'storeName': 'MidLogic POS',
            'storeAddress': '',
            'storePhone': '',
            'storeEmail': '',
            'currency': 'USD',
            'language': 'en',
            'timezone': 'UTC'
        },
        description="General store and regional settings"
    )
    
    # Business Settings
    business_settings = fields.JSONField(
        default={
            'mode': 'retail',
            'enableTableManagement': False,
            'enableReservations': False,
            'enableKitchenDisplay': False,
            'enableBarcodeScanner': True,
            'enableLoyaltyProgram': False,
            'enableQuickCheckout': True
        },
        description="Business mode and feature settings"
    )
    
    # Tax Settings
    tax_settings = fields.JSONField(
        default={
            'defaultTaxRate': 0,
            'taxInclusive': False,
            'taxLabel': 'Tax',
            'enableMultipleTaxRates': False
        },
        description="Tax configuration settings"
    )
    
    # Hardware Settings
    hardware_settings = fields.JSONField(
        default={
            'printerEnabled': False,
            'printerName': '',
            'cashDrawerEnabled': False,
            'barcodeReaderEnabled': False,
            'displayEnabled': False
        },
        description="Hardware and peripheral settings"
    )
    
    # Receipt Settings
    receipt_settings = fields.JSONField(
        default={
            'showLogo': False,
            'logoUrl': '',
            'headerText': 'Thank you for your purchase!',
            'footerText': 'Please come again!',
            'showTaxBreakdown': True,
            'showBarcode': False
        },
        description="Receipt template and printing settings"
    )
    
    # Inventory Settings
    inventory_settings = fields.JSONField(
        default={
            'enableLowStockAlerts': True,
            'lowStockThreshold': 10,
            'enableAutoReorder': False,
            'autoReorderThreshold': 5
        },
        description="Inventory management settings"
    )
    
    # Integration Settings
    integration_settings = fields.JSONField(
        default={
            'enableCloudSync': False,
            'cloudSyncInterval': 60,
            'enableEmailReceipts': False,
            'smtpServer': '',
            'smtpPort': 587,
            'smtpUsername': ''
        },
        description="Integration and sync settings"
    )
    
    # Backup Settings
    backup_settings = fields.JSONField(
        default={
            'enableAutoBackup': False,
            'backupInterval': 24,
            'backupLocation': '',
            'lastBackupDate': None
        },
        description="Backup and restore settings"
    )
    
    # Display Settings
    display_settings = fields.JSONField(
        default={
            'theme': 'light',
            'fontSize': 'medium',
            'screenTimeout': 0
        },
        description="Display and UI settings"
    )
    
    # Security Settings
    security_settings = fields.JSONField(
        default={
            'sessionTimeout': 0,
            'requirePinForRefunds': True,
            'requirePinForVoids': True,
            'requirePinForDiscounts': False
        },
        description="Security and access control settings"
    )
    
    # System Information
    system_info = fields.JSONField(
        default={
            'appVersion': '1.0.0',
            'buildNumber': '1',
            'lastUpdateCheck': None,
            'databaseVersion': '1.0.0'
        },
        description="System information and metadata"
    )
    
    class Meta:
        table = "settings"
    
    def __str__(self) -> str:
        return f"Settings (ID: {self.id})"
    
    @classmethod
    async def get_settings(cls):
        """
        Get the singleton settings instance.
        Creates default settings if none exist.
        """
        settings = await cls.first()
        if not settings:
            settings = await cls.create()
        return settings
    
    @classmethod
    async def update_settings(cls, **kwargs):
        """
        Update settings fields.
        Accepts partial updates for any settings category.
        """
        settings = await cls.get_settings()
        
        # Update each settings category if provided
        if 'general_settings' in kwargs:
            current = settings.general_settings or {}
            current.update(kwargs['general_settings'])
            settings.general_settings = current
        
        if 'business_settings' in kwargs:
            current = settings.business_settings or {}
            current.update(kwargs['business_settings'])
            settings.business_settings = current
        
        if 'tax_settings' in kwargs:
            current = settings.tax_settings or {}
            current.update(kwargs['tax_settings'])
            settings.tax_settings = current
        
        if 'hardware_settings' in kwargs:
            current = settings.hardware_settings or {}
            current.update(kwargs['hardware_settings'])
            settings.hardware_settings = current
        
        if 'receipt_settings' in kwargs:
            current = settings.receipt_settings or {}
            current.update(kwargs['receipt_settings'])
            settings.receipt_settings = current
        
        if 'inventory_settings' in kwargs:
            current = settings.inventory_settings or {}
            current.update(kwargs['inventory_settings'])
            settings.inventory_settings = current
        
        if 'integration_settings' in kwargs:
            current = settings.integration_settings or {}
            current.update(kwargs['integration_settings'])
            settings.integration_settings = current
        
        if 'backup_settings' in kwargs:
            current = settings.backup_settings or {}
            current.update(kwargs['backup_settings'])
            settings.backup_settings = current
        
        if 'display_settings' in kwargs:
            current = settings.display_settings or {}
            current.update(kwargs['display_settings'])
            settings.display_settings = current
        
        if 'security_settings' in kwargs:
            current = settings.security_settings or {}
            current.update(kwargs['security_settings'])
            settings.security_settings = current
        
        if 'system_info' in kwargs:
            current = settings.system_info or {}
            current.update(kwargs['system_info'])
            settings.system_info = current
        
        await settings.save()
        return settings

