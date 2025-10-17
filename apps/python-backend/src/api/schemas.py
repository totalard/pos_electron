"""
Pydantic schemas for API request/response validation
"""
from datetime import datetime
from typing import Optional, Any, Dict, List
from pydantic import BaseModel, Field, field_validator


# User Schemas
class UserCreate(BaseModel):
    """Schema for creating a new user"""
    full_name: str = Field(..., min_length=1, max_length=255)
    mobile_number: Optional[str] = Field(None, max_length=20)
    pin: str = Field(..., min_length=6, max_length=6, pattern=r'^\d{6}$')
    email: Optional[str] = Field(None, max_length=255)
    avatar_color: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = None

    @field_validator('pin')
    @classmethod
    def validate_pin(cls, v: str) -> str:
        """Validate PIN is numeric and exactly 6 digits"""
        if not v.isdigit():
            raise ValueError('PIN must contain only digits')
        if len(v) != 6:
            raise ValueError('PIN must be exactly 6 digits')
        return v


class UserUpdate(BaseModel):
    """Schema for updating a user"""
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    mobile_number: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, max_length=255)
    avatar_color: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = None
    is_active: Optional[bool] = None


class UserChangePIN(BaseModel):
    """Schema for changing user PIN"""
    old_pin: str = Field(..., min_length=6, max_length=6)
    new_pin: str = Field(..., min_length=6, max_length=6, pattern=r'^\d{6}$')

    @field_validator('new_pin')
    @classmethod
    def validate_new_pin(cls, v: str) -> str:
        """Validate new PIN is numeric and exactly 6 digits"""
        if not v.isdigit():
            raise ValueError('PIN must contain only digits')
        if len(v) != 6:
            raise ValueError('PIN must be exactly 6 digits')
        return v


class UserResponse(BaseModel):
    """Schema for user response"""
    id: int
    full_name: str
    mobile_number: Optional[str]
    email: Optional[str]
    avatar_color: Optional[str]
    role: str
    is_active: bool
    notes: Optional[str]
    last_login: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    """Schema for user login"""
    pin: str = Field(..., min_length=6, max_length=6, pattern=r'^\d{6}$')

    @field_validator('pin')
    @classmethod
    def validate_pin(cls, v: str) -> str:
        """Validate PIN is numeric and exactly 6 digits"""
        if not v.isdigit():
            raise ValueError('PIN must contain only digits')
        if len(v) != 6:
            raise ValueError('PIN must be exactly 6 digits')
        return v


class UserLoginResponse(BaseModel):
    """Schema for login response"""
    success: bool
    message: str
    user: Optional[UserResponse] = None
    token: Optional[str] = None  # For future JWT implementation


# Product Schemas
class ProductCreate(BaseModel):
    """Schema for creating a new product"""
    name: str = Field(..., min_length=1, max_length=255)
    sku: Optional[str] = Field(None, max_length=100)
    barcode: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    item_type: str = Field(default="product")
    category: str = Field(default="general")
    cost_price: float = Field(default=0, ge=0)
    selling_price: float = Field(..., ge=0)
    tax_rate: float = Field(default=0, ge=0, le=100)
    track_inventory: bool = Field(default=True)
    current_stock: int = Field(default=0, ge=0)
    min_stock_level: int = Field(default=0, ge=0)
    max_stock_level: int = Field(default=0, ge=0)
    is_active: bool = Field(default=True)
    image_url: Optional[str] = Field(None, max_length=500)
    notes: Optional[str] = None


class ProductUpdate(BaseModel):
    """Schema for updating a product"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    sku: Optional[str] = Field(None, max_length=100)
    barcode: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    item_type: Optional[str] = None
    category: Optional[str] = None
    cost_price: Optional[float] = Field(None, ge=0)
    selling_price: Optional[float] = Field(None, ge=0)
    tax_rate: Optional[float] = Field(None, ge=0, le=100)
    track_inventory: Optional[bool] = None
    min_stock_level: Optional[int] = Field(None, ge=0)
    max_stock_level: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None
    image_url: Optional[str] = Field(None, max_length=500)
    notes: Optional[str] = None


class ProductResponse(BaseModel):
    """Schema for product response"""
    id: int
    name: str
    sku: Optional[str]
    barcode: Optional[str]
    description: Optional[str]
    item_type: str
    category: str
    cost_price: float
    selling_price: float
    tax_rate: float
    track_inventory: bool
    current_stock: int
    min_stock_level: int
    max_stock_level: int
    is_active: bool
    image_url: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Stock Transaction Schemas
class StockTransactionCreate(BaseModel):
    """Schema for creating a stock transaction"""
    product_id: int
    transaction_type: str
    quantity: int
    unit_cost: Optional[float] = Field(None, ge=0)
    reference_number: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = None


class StockTransactionResponse(BaseModel):
    """Schema for stock transaction response"""
    id: int
    transaction_type: str
    product_id: int
    quantity: int
    stock_before: int
    stock_after: int
    unit_cost: Optional[float]
    total_cost: Optional[float]
    reference_number: Optional[str]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# Stock Adjustment Schemas
class StockAdjustmentLineCreate(BaseModel):
    """Schema for stock adjustment line item"""
    product_id: int
    expected_quantity: int
    actual_quantity: int
    notes: Optional[str] = None


class StockAdjustmentCreate(BaseModel):
    """Schema for creating a stock adjustment"""
    reason: str = Field(..., min_length=1, max_length=255)
    notes: Optional[str] = None
    lines: list[StockAdjustmentLineCreate] = Field(..., min_items=1)


class StockAdjustmentLineResponse(BaseModel):
    """Schema for stock adjustment line response"""
    id: int
    product_id: int
    expected_quantity: int
    actual_quantity: int
    difference: int
    notes: Optional[str]

    class Config:
        from_attributes = True


class StockAdjustmentResponse(BaseModel):
    """Schema for stock adjustment response"""
    id: int
    adjustment_date: datetime
    reason: str
    notes: Optional[str]
    is_completed: bool
    lines: list[StockAdjustmentLineResponse]
    created_at: datetime

    class Config:
        from_attributes = True


# Settings Schemas
class GeneralSettings(BaseModel):
    """Schema for general settings"""
    storeName: str = Field(default="MidLogic POS")
    businessName: str = Field(default="")
    storeAddress: str = Field(default="")
    storeCity: str = Field(default="")
    storeState: str = Field(default="")
    storeZip: str = Field(default="")
    storeCountry: str = Field(default="")
    storePhone: str = Field(default="")
    storeEmail: str = Field(default="")
    storeWebsite: str = Field(default="")
    logoUrl: str = Field(default="")
    operatingHours: dict = Field(default_factory=dict)
    currency: str = Field(default="USD")
    language: str = Field(default="en")
    timezone: str = Field(default="UTC")


class BusinessSettings(BaseModel):
    """Schema for business settings"""
    mode: str = Field(default="retail")
    enableTableManagement: bool = Field(default=False)
    enableReservations: bool = Field(default=False)
    enableKitchenDisplay: bool = Field(default=False)
    enableBarcodeScanner: bool = Field(default=True)
    enableLoyaltyProgram: bool = Field(default=False)
    enableQuickCheckout: bool = Field(default=True)
    currencyConfig: dict = Field(default_factory=dict)


class TaxSettings(BaseModel):
    """Schema for tax settings"""
    defaultTaxRate: float = Field(default=0, ge=0, le=100)
    taxInclusive: bool = Field(default=False)
    taxLabel: str = Field(default="Tax")
    enableMultipleTaxRates: bool = Field(default=False)


class HardwareSettings(BaseModel):
    """Schema for hardware settings"""
    printerEnabled: bool = Field(default=False)
    printerName: str = Field(default="")
    cashDrawerEnabled: bool = Field(default=False)
    barcodeReaderEnabled: bool = Field(default=False)
    displayEnabled: bool = Field(default=False)


class ReceiptSettings(BaseModel):
    """Schema for receipt settings"""
    showLogo: bool = Field(default=False)
    logoUrl: str = Field(default="")
    headerText: str = Field(default="Thank you for your purchase!")
    footerText: str = Field(default="Please come again!")
    customHeader: str = Field(default="")
    customFooter: str = Field(default="")
    showTaxBreakdown: bool = Field(default=True)
    showBarcode: bool = Field(default=False)
    showQRCode: bool = Field(default=False)
    paperSize: str = Field(default="A4")


class InventorySettings(BaseModel):
    """Schema for comprehensive inventory settings"""
    # Stock Tracking Configuration
    enableStockTracking: bool = Field(default=True, description="Enable global inventory tracking")
    trackBySerialNumber: bool = Field(default=False, description="Track items by serial number")
    trackByBatchNumber: bool = Field(default=False, description="Track items by batch/lot number")
    trackByExpiryDate: bool = Field(default=False, description="Track items by expiry date")

    # Alert & Notification Settings
    enableLowStockAlerts: bool = Field(default=True, description="Enable low stock alerts")
    lowStockThreshold: int = Field(default=10, ge=0, description="Low stock threshold value")
    lowStockThresholdType: str = Field(default='absolute', description="Threshold type: 'absolute' or 'percentage'")
    enableOutOfStockAlerts: bool = Field(default=True, description="Enable out of stock alerts")
    alertRecipients: list = Field(default_factory=list, description="Email addresses for alerts")

    # Stock Deduction Settings
    stockDeductionMode: str = Field(default='automatic', description="Stock deduction mode: 'automatic' or 'manual'")
    allowNegativeStock: bool = Field(default=False, description="Allow selling items with negative stock")
    deductOnSale: bool = Field(default=True, description="Deduct stock on sale completion")
    deductOnOrder: bool = Field(default=False, description="Deduct stock on order placement")

    # Reorder Point Settings
    enableAutoReorder: bool = Field(default=False, description="Enable automatic reorder suggestions")
    autoReorderThreshold: int = Field(default=5, ge=0, description="Threshold for auto reorder")
    autoReorderQuantity: int = Field(default=20, ge=1, description="Default reorder quantity")
    enableReorderPointCalculation: bool = Field(default=False, description="Enable automatic reorder point calculation")

    # Unit of Measurement Settings
    defaultUOM: str = Field(default='pieces', description="Default unit of measurement")
    enableMultipleUOM: bool = Field(default=False, description="Enable multiple units of measurement")
    uomConversionEnabled: bool = Field(default=False, description="Enable UOM conversion")

    # Barcode Settings
    enableBarcodeScanning: bool = Field(default=True, description="Enable barcode scanning")
    barcodeFormat: str = Field(default='EAN13', description="Barcode format: EAN13, UPC, CODE128, QR")
    autoGenerateBarcode: bool = Field(default=False, description="Auto-generate barcodes for new items")
    barcodePrefix: str = Field(default='', description="Prefix for auto-generated barcodes")

    # Multi-Location Settings
    enableMultiLocation: bool = Field(default=False, description="Enable multiple storage locations")
    defaultLocation: str = Field(default='Main Warehouse', description="Default storage location")
    transferBetweenLocations: bool = Field(default=False, description="Allow stock transfers between locations")

    # Stock Valuation Method
    valuationMethod: str = Field(default='FIFO', description="Stock valuation method: FIFO, LIFO, Weighted Average")
    enableCostTracking: bool = Field(default=True, description="Enable cost tracking for inventory")

    # Waste & Adjustment Tracking
    enableWasteTracking: bool = Field(default=False, description="Enable waste/damaged inventory tracking")
    wasteReasons: list = Field(default_factory=lambda: ['Damaged', 'Expired', 'Lost', 'Other'], description="Predefined waste reasons")
    requireWasteApproval: bool = Field(default=False, description="Require approval for waste entries")
    enableStockAdjustment: bool = Field(default=True, description="Enable manual stock adjustments")
    requireAdjustmentReason: bool = Field(default=True, description="Require reason for stock adjustments")

    # Restaurant-Specific Settings
    enableRecipeManagement: bool = Field(default=False, description="Enable recipe/ingredient management")
    enablePortionControl: bool = Field(default=False, description="Enable portion control tracking")
    enablePrepItemTracking: bool = Field(default=False, description="Enable prep item tracking")
    ingredientCostTracking: bool = Field(default=True, description="Track ingredient costs")

    # Retail-Specific Settings
    enableVariantTracking: bool = Field(default=True, description="Enable product variant tracking")
    enableSKUManagement: bool = Field(default=True, description="Enable SKU management")
    enableSizeColorTracking: bool = Field(default=False, description="Enable size/color variant tracking")


class IntegrationSettings(BaseModel):
    """Schema for integration settings"""
    enableCloudSync: bool = Field(default=False)
    cloudSyncInterval: int = Field(default=60, ge=1)
    enableEmailReceipts: bool = Field(default=False)
    smtpServer: str = Field(default="")
    smtpPort: int = Field(default=587, ge=1, le=65535)
    smtpUsername: str = Field(default="")


class BackupSettings(BaseModel):
    """Schema for backup settings"""
    enableAutoBackup: bool = Field(default=False)
    backupInterval: int = Field(default=24, ge=1)
    backupLocation: str = Field(default="")
    lastBackupDate: Optional[str] = None


class DisplaySettings(BaseModel):
    """Schema for display settings"""
    theme: str = Field(default="light")
    fontSize: str = Field(default="medium")
    screenTimeout: int = Field(default=0, ge=0)


class SecuritySettings(BaseModel):
    """Schema for security settings"""
    sessionTimeout: int = Field(default=0, ge=0)
    requirePinForRefunds: bool = Field(default=True)
    requirePinForVoids: bool = Field(default=True)
    requirePinForDiscounts: bool = Field(default=False)


class SystemInfo(BaseModel):
    """Schema for system information"""
    appVersion: str = Field(default="1.0.0")
    buildNumber: str = Field(default="1")
    lastUpdateCheck: Optional[str] = None
    databaseVersion: str = Field(default="1.0.0")


class SettingsResponse(BaseModel):
    """Schema for settings response"""
    id: int
    general: GeneralSettings
    business: BusinessSettings
    taxes: TaxSettings
    hardware: HardwareSettings
    receipts: ReceiptSettings
    inventory: InventorySettings
    integration: IntegrationSettings
    backup: BackupSettings
    display: DisplaySettings
    security: SecuritySettings
    about: SystemInfo
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SettingsUpdate(BaseModel):
    """Schema for updating settings"""
    general: Optional[GeneralSettings] = None
    business: Optional[BusinessSettings] = None
    taxes: Optional[TaxSettings] = None
    hardware: Optional[HardwareSettings] = None
    receipts: Optional[ReceiptSettings] = None
    inventory: Optional[InventorySettings] = None
    integration: Optional[IntegrationSettings] = None
    backup: Optional[BackupSettings] = None
    display: Optional[DisplaySettings] = None
    security: Optional[SecuritySettings] = None
    about: Optional[SystemInfo] = None


# New Normalized Setting Schemas
class SettingItemResponse(BaseModel):
    """Schema for individual setting item response"""
    id: int
    section: str
    key: str
    value: str
    default_value: str
    data_type: str
    description: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SettingItemUpdate(BaseModel):
    """Schema for updating an individual setting"""
    value: Any  # Will be converted to string based on data_type


class SectionSettingsResponse(BaseModel):
    """Schema for all settings in a section"""
    section: str
    settings: Dict[str, Any]  # Key-value pairs with typed values


class BulkSettingsUpdate(BaseModel):
    """Schema for bulk updating multiple settings"""
    updates: List[Dict[str, Any]]  # List of {section, key, value} dicts


# Tax Rule Schemas
class TaxRuleCreate(BaseModel):
    """Schema for creating a tax rule"""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    tax_type: str = Field(default="simple")
    rate: float = Field(default=0, ge=0, le=100)
    hsn_code: Optional[str] = Field(None, max_length=20)
    sac_code: Optional[str] = Field(None, max_length=20)
    cgst_rate: Optional[float] = Field(None, ge=0, le=100)
    sgst_rate: Optional[float] = Field(None, ge=0, le=100)
    igst_rate: Optional[float] = Field(None, ge=0, le=100)
    cess_rate: Optional[float] = Field(None, ge=0, le=100)
    applies_to_categories: list = Field(default_factory=list)
    min_amount: Optional[float] = Field(None, ge=0)
    max_amount: Optional[float] = Field(None, ge=0)
    customer_types: list = Field(default_factory=list)
    is_compound: bool = Field(default=False)
    compound_on_taxes: list = Field(default_factory=list)
    is_active: bool = Field(default=True)
    priority: int = Field(default=0)


class TaxRuleUpdate(BaseModel):
    """Schema for updating a tax rule"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    tax_type: Optional[str] = None
    rate: Optional[float] = Field(None, ge=0, le=100)
    hsn_code: Optional[str] = Field(None, max_length=20)
    sac_code: Optional[str] = Field(None, max_length=20)
    cgst_rate: Optional[float] = Field(None, ge=0, le=100)
    sgst_rate: Optional[float] = Field(None, ge=0, le=100)
    igst_rate: Optional[float] = Field(None, ge=0, le=100)
    cess_rate: Optional[float] = Field(None, ge=0, le=100)
    applies_to_categories: Optional[list] = None
    min_amount: Optional[float] = Field(None, ge=0)
    max_amount: Optional[float] = Field(None, ge=0)
    customer_types: Optional[list] = None
    is_compound: Optional[bool] = None
    compound_on_taxes: Optional[list] = None
    is_active: Optional[bool] = None
    priority: Optional[int] = None


class TaxRuleResponse(BaseModel):
    """Schema for tax rule response"""
    id: int
    name: str
    description: Optional[str]
    tax_type: str
    rate: float
    hsn_code: Optional[str]
    sac_code: Optional[str]
    cgst_rate: Optional[float]
    sgst_rate: Optional[float]
    igst_rate: Optional[float]
    cess_rate: Optional[float]
    applies_to_categories: list
    min_amount: Optional[float]
    max_amount: Optional[float]
    customer_types: list
    is_compound: bool
    compound_on_taxes: list
    is_active: bool
    priority: int
    created_at: str
    updated_at: str
    created_by: Optional[int]

    class Config:
        from_attributes = True

class BackupRequest(BaseModel):
    """Schema for backup request"""
    location: Optional[str] = None


class RestoreRequest(BaseModel):
    """Schema for restore request"""
    filePath: str = Field(..., min_length=1)
