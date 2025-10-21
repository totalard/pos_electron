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


# ============================================================================
# Customer Schemas
# ============================================================================

class CustomerCreate(BaseModel):
    """Schema for creating a new customer"""
    name: str = Field(..., min_length=1, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, max_length=255)
    address: Optional[str] = None
    loyalty_points: int = Field(default=0, ge=0)


class CustomerUpdate(BaseModel):
    """Schema for updating a customer"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, max_length=255)
    address: Optional[str] = None
    loyalty_points: Optional[int] = Field(None, ge=0)


class CustomerResponse(BaseModel):
    """Schema for customer response"""
    id: int
    name: str
    phone: Optional[str]
    email: Optional[str]
    address: Optional[str]
    loyalty_points: int
    credit_limit: float
    credit_balance: float
    credit_status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CustomerCreditOperation(BaseModel):
    """Schema for customer credit operations (add credit/payment)"""
    amount: float = Field(..., gt=0, description="Amount to add or pay")
    reference_number: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = None


class CustomerLoyaltyOperation(BaseModel):
    """Schema for loyalty point operations"""
    points: int = Field(..., description="Points to add (positive) or redeem (negative)")
    notes: Optional[str] = None


class CustomerTransactionResponse(BaseModel):
    """Schema for customer transaction response"""
    id: int
    customer_id: int
    transaction_type: str
    amount: float
    loyalty_points: int
    balance_before: float
    balance_after: float
    loyalty_points_before: int
    loyalty_points_after: int
    reference_number: Optional[str]
    notes: Optional[str]
    created_at: datetime
    created_by_id: Optional[int]

    class Config:
        from_attributes = True


class CustomerStatementRequest(BaseModel):
    """Schema for customer statement request"""
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class CustomerStatementResponse(BaseModel):
    """Schema for customer statement response"""
    customer: CustomerResponse
    transactions: List['CustomerTransactionResponse']
    opening_balance: float
    closing_balance: float
    total_credits: float
    total_payments: float
    statement_period: Dict[str, Optional[datetime]]


# ============================================================================
# User Activity Schemas
# ============================================================================

class UserActivityLogCreate(BaseModel):
    """Schema for creating a user activity log"""
    activity_type: str = Field(..., max_length=50)
    description: Optional[str] = None
    session_id: Optional[str] = Field(None, max_length=100)
    ip_address: Optional[str] = Field(None, max_length=45)
    duration_ms: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None


class UserActivityLogResponse(BaseModel):
    """Schema for user activity log response"""
    id: int
    user_id: int
    activity_type: str
    description: Optional[str]
    session_id: Optional[str]
    ip_address: Optional[str]
    duration_ms: Optional[int]
    metadata: Optional[Dict[str, Any]]
    created_at: datetime

    class Config:
        from_attributes = True


class UserPerformanceMetrics(BaseModel):
    """Schema for user performance metrics"""
    user_id: int
    user_name: str
    total_sales: int
    total_transactions: int
    total_revenue: float
    average_transaction_value: float
    login_count: int
    last_login: Optional[datetime]
    period_start: datetime
    period_end: datetime


# ============================================================================
# Product Category Schemas
# ============================================================================

class ProductCategoryCreate(BaseModel):
    """Schema for creating a product category"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    parent_category_id: Optional[int] = None
    display_order: int = Field(default=0)
    is_active: bool = Field(default=True)


class ProductCategoryUpdate(BaseModel):
    """Schema for updating a product category"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    parent_category_id: Optional[int] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None


class ProductCategoryResponse(BaseModel):
    """Schema for product category response"""
    id: int
    name: str
    description: Optional[str]
    image_path: Optional[str]
    parent_category_id: Optional[int]
    display_order: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# Product Variation Schemas
# ============================================================================

class ProductVariationCreate(BaseModel):
    """Schema for creating a product variation"""
    variation_name: str = Field(..., min_length=1, max_length=255)
    sku: Optional[str] = Field(None, max_length=100)
    barcode: Optional[str] = Field(None, max_length=100)
    price_adjustment: float = Field(default=0)
    cost_price: Optional[float] = Field(None, ge=0)
    stock_quantity: int = Field(default=0, ge=0)
    attributes: Dict[str, Any] = Field(default_factory=dict)
    is_active: bool = Field(default=True)


class ProductVariationUpdate(BaseModel):
    """Schema for updating a product variation"""
    variation_name: Optional[str] = Field(None, min_length=1, max_length=255)
    sku: Optional[str] = Field(None, max_length=100)
    barcode: Optional[str] = Field(None, max_length=100)
    price_adjustment: Optional[float] = None
    cost_price: Optional[float] = Field(None, ge=0)
    stock_quantity: Optional[int] = Field(None, ge=0)
    attributes: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class ProductVariationResponse(BaseModel):
    """Schema for product variation response"""
    id: int
    parent_product_id: int
    variation_name: str
    sku: Optional[str]
    barcode: Optional[str]
    price_adjustment: float
    cost_price: Optional[float]
    stock_quantity: int
    attributes: Dict[str, Any]
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# Product Bundle Schemas
# ============================================================================

class ProductBundleComponentCreate(BaseModel):
    """Schema for creating a bundle component"""
    component_product_id: int
    quantity: int = Field(..., ge=1)


class ProductBundleComponentResponse(BaseModel):
    """Schema for bundle component response"""
    id: int
    bundle_product_id: int
    component_product_id: int
    quantity: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# Enhanced Product Schemas
# ============================================================================

class ProductCreate(BaseModel):
    """Schema for creating a new product"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    sku: Optional[str] = Field(None, max_length=100)
    barcode: Optional[str] = Field(None, max_length=100)
    product_type: str = Field(default="simple")  # simple/bundle/variation/service
    category_id: Optional[int] = None
    base_price: float = Field(..., ge=0)
    cost_price: float = Field(default=0, ge=0)
    tax_id: Optional[int] = None
    is_active: bool = Field(default=True)
    track_inventory: bool = Field(default=True)
    stock_quantity: int = Field(default=0, ge=0)
    low_stock_threshold: int = Field(default=0, ge=0)
    max_stock_level: int = Field(default=0, ge=0)
    image_paths: List[str] = Field(default_factory=list)
    notes: Optional[str] = None

    # For VARIATION type products
    variations: Optional[List[ProductVariationCreate]] = None

    # For BUNDLE type products
    bundle_components: Optional[List[ProductBundleComponentCreate]] = None

    # Backward compatibility fields
    item_type: Optional[str] = Field(default="product")
    selling_price: Optional[float] = None
    tax_rate: Optional[float] = None
    current_stock: Optional[int] = None
    min_stock_level: Optional[int] = None
    image_url: Optional[str] = None


class ProductUpdate(BaseModel):
    """Schema for updating a product"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    sku: Optional[str] = Field(None, max_length=100)
    barcode: Optional[str] = Field(None, max_length=100)
    product_type: Optional[str] = None
    category_id: Optional[int] = None
    base_price: Optional[float] = Field(None, ge=0)
    cost_price: Optional[float] = Field(None, ge=0)
    tax_id: Optional[int] = None
    is_active: Optional[bool] = None
    track_inventory: Optional[bool] = None
    stock_quantity: Optional[int] = Field(None, ge=0)
    low_stock_threshold: Optional[int] = Field(None, ge=0)
    max_stock_level: Optional[int] = Field(None, ge=0)
    image_paths: Optional[List[str]] = None
    notes: Optional[str] = None

    # Backward compatibility
    item_type: Optional[str] = None
    category: Optional[str] = None
    selling_price: Optional[float] = None
    tax_rate: Optional[float] = None
    current_stock: Optional[int] = None
    min_stock_level: Optional[int] = None
    image_url: Optional[str] = None


class ProductResponse(BaseModel):
    """Schema for product response"""
    id: int
    name: str
    description: Optional[str]
    sku: Optional[str]
    barcode: Optional[str]
    product_type: str
    category_id: Optional[int]
    category_name: Optional[str] = None
    base_price: float
    cost_price: float
    tax_id: Optional[int]
    tax_name: Optional[str] = None
    is_active: bool
    track_inventory: bool
    stock_quantity: int
    low_stock_threshold: int
    max_stock_level: int
    image_paths: List[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    # Include variations if product_type = variation
    variations: Optional[List[ProductVariationResponse]] = None

    # Include bundle components if product_type = bundle
    bundle_components: Optional[List[ProductBundleComponentResponse]] = None

    # Backward compatibility fields
    item_type: str
    category: str
    selling_price: float
    tax_rate: float
    current_stock: int
    min_stock_level: int
    image_url: Optional[str]

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

    # Tax calculation configuration
    calculation_method: str = Field(default="percentage")
    fixed_amount: Optional[float] = Field(None, ge=0)
    inclusion_type: str = Field(default="exclusive")
    rounding_method: str = Field(default="round_half_up")

    # GST fields
    hsn_code: Optional[str] = Field(None, max_length=20)
    sac_code: Optional[str] = Field(None, max_length=20)
    cgst_rate: Optional[float] = Field(None, ge=0, le=100)
    sgst_rate: Optional[float] = Field(None, ge=0, le=100)
    igst_rate: Optional[float] = Field(None, ge=0, le=100)
    cess_rate: Optional[float] = Field(None, ge=0, le=100)

    # Applicability rules
    applies_to_categories: list = Field(default_factory=list)
    applies_to_products: list = Field(default_factory=list)
    min_amount: Optional[float] = Field(None, ge=0)
    max_amount: Optional[float] = Field(None, ge=0)
    customer_types: list = Field(default_factory=list)

    # Tax exemption
    is_tax_exempt: bool = Field(default=False)

    # Date range
    effective_from: Optional[str] = None  # ISO date string
    effective_to: Optional[str] = None  # ISO date string

    # Compound tax
    is_compound: bool = Field(default=False)
    compound_on_taxes: list = Field(default_factory=list)

    # Status
    is_active: bool = Field(default=True)
    priority: int = Field(default=0)


class TaxRuleUpdate(BaseModel):
    """Schema for updating a tax rule"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    tax_type: Optional[str] = None
    rate: Optional[float] = Field(None, ge=0, le=100)

    # Tax calculation configuration
    calculation_method: Optional[str] = None
    fixed_amount: Optional[float] = Field(None, ge=0)
    inclusion_type: Optional[str] = None
    rounding_method: Optional[str] = None

    # GST fields
    hsn_code: Optional[str] = Field(None, max_length=20)
    sac_code: Optional[str] = Field(None, max_length=20)
    cgst_rate: Optional[float] = Field(None, ge=0, le=100)
    sgst_rate: Optional[float] = Field(None, ge=0, le=100)
    igst_rate: Optional[float] = Field(None, ge=0, le=100)
    cess_rate: Optional[float] = Field(None, ge=0, le=100)

    # Applicability rules
    applies_to_categories: Optional[list] = None
    applies_to_products: Optional[list] = None
    min_amount: Optional[float] = Field(None, ge=0)
    max_amount: Optional[float] = Field(None, ge=0)
    customer_types: Optional[list] = None

    # Tax exemption
    is_tax_exempt: Optional[bool] = None

    # Date range
    effective_from: Optional[str] = None
    effective_to: Optional[str] = None

    # Compound tax
    is_compound: Optional[bool] = None
    compound_on_taxes: Optional[list] = None

    # Status
    is_active: Optional[bool] = None
    priority: Optional[int] = None


class TaxRuleResponse(BaseModel):
    """Schema for tax rule response"""
    id: int
    name: str
    description: Optional[str]
    tax_type: str
    rate: float

    # Tax calculation configuration
    calculation_method: str
    fixed_amount: Optional[float]
    inclusion_type: str
    rounding_method: str

    # GST fields
    hsn_code: Optional[str]
    sac_code: Optional[str]
    cgst_rate: Optional[float]
    sgst_rate: Optional[float]
    igst_rate: Optional[float]
    cess_rate: Optional[float]

    # Applicability rules
    applies_to_categories: list
    applies_to_products: list
    min_amount: Optional[float]
    max_amount: Optional[float]
    customer_types: list

    # Tax exemption
    is_tax_exempt: bool

    # Date range
    effective_from: Optional[str]
    effective_to: Optional[str]

    # Compound tax
    is_compound: bool
    compound_on_taxes: list

    # Status
    is_active: bool
    priority: int

    # Metadata
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


# ============================================================================
# Enhanced Backup Schemas
# ============================================================================

class BackupSettingsEnhanced(BaseModel):
    """Enhanced backup settings with advanced features"""
    enableAutoBackup: bool = Field(default=False)
    backupInterval: int = Field(default=24, ge=1)
    backupLocation: str = Field(default="")
    lastBackupDate: Optional[str] = None
    
    # Advanced features
    compressionEnabled: bool = Field(default=True)
    encryptionEnabled: bool = Field(default=False)
    backupType: str = Field(default="full")  # full, incremental, selective
    retentionDays: int = Field(default=30, ge=1)
    maxBackupCount: int = Field(default=10, ge=1)
    
    class Config:
        from_attributes = True


class BackupMetadata(BaseModel):
    """Backup metadata"""
    filename: str
    created_at: str
    size_bytes: int
    size_mb: float
    database_size_bytes: int
    database_size_mb: float
    checksum: str
    compression_enabled: bool
    encryption_enabled: bool
    backup_type: str
    selected_tables: Optional[List[str]] = None
    status: str = "success"
    error_message: Optional[str] = None


class BackupInfo(BaseModel):
    """Information about a backup file"""
    filename: str
    path: str
    size_bytes: int
    size_mb: float
    created_at: str
    is_compressed: bool
    metadata: Optional[BackupMetadata] = None


class BackupListResponse(BaseModel):
    """Response for listing backups"""
    total: int
    backups: List[BackupInfo]


class AdvancedBackupRequest(BaseModel):
    """Advanced backup request with options"""
    location: Optional[str] = None
    compression: bool = Field(default=True)
    encryption: bool = Field(default=False)
    backup_type: str = Field(default="full")  # full, incremental, selective
    selected_tables: Optional[List[str]] = None


class BackupProgressUpdate(BaseModel):
    """Progress update during backup/restore"""
    status: str  # pending, in_progress, completed, failed, cancelled
    progress: int = Field(ge=0, le=100)
    message: str
    timestamp: str


class BackupVerificationResult(BaseModel):
    """Result of backup verification"""
    filename: str
    valid: bool
    checksum_match: bool
    error: Optional[str] = None


class RetentionPolicy(BaseModel):
    """Backup retention policy"""
    retention_days: int = Field(default=30, ge=1)
    max_backup_count: int = Field(default=10, ge=1)
    cleanup_on_backup: bool = Field(default=True)


class ScheduleConfiguration(BaseModel):
    """Backup schedule configuration"""
    enabled: bool = Field(default=False)
    schedule_type: str = Field(default="interval")  # interval, daily, weekly, monthly
    interval_hours: int = Field(default=24, ge=1)
    scheduled_time: Optional[str] = None  # HH:MM format
    scheduled_days: Optional[List[str]] = None  # ["mon", "tue", ...]
    
    # Retention and notifications
    retention_policy: RetentionPolicy = Field(default_factory=RetentionPolicy)
    notify_on_success: bool = Field(default=False)
    notify_on_failure: bool = Field(default=True)


# ============================================================================
# Transaction Management Schemas
# ============================================================================

class TransactionSummary(BaseModel):
    """Summary statistics for transactions"""
    total_sales: float
    total_cash_in: float
    total_cash_out: float
    total_expenses: float
    total_credit_sales: float
    total_payments: float
    net_cash_flow: float
    transaction_count: int


class TransactionFilter(BaseModel):
    """Filter parameters for transaction queries"""
    transaction_types: Optional[List[str]] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    min_amount: Optional[float] = None
    max_amount: Optional[float] = None
    user_id: Optional[int] = None
    customer_id: Optional[int] = None
    status: Optional[str] = None
    search_query: Optional[str] = None


class UnifiedTransactionResponse(BaseModel):
    """Unified transaction response for all transaction types"""
    id: int
    transaction_type: str  # sale, stock_in, stock_out, cash_in, cash_out, expense, credit, payment
    amount: float
    description: str
    reference_number: Optional[str] = None
    status: Optional[str] = None
    user_name: Optional[str] = None
    customer_name: Optional[str] = None
    created_at: datetime
    metadata: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class TransactionListResponse(BaseModel):
    """Paginated transaction list response"""
    total: int
    page: int
    page_size: int
    transactions: List[UnifiedTransactionResponse]
    summary: Optional[TransactionSummary] = None


# Sale Schemas
class SaleItemSchema(BaseModel):
    """Schema for sale line items"""
    product_id: int
    product_name: str
    quantity: int
    unit_price: float
    tax_amount: float
    discount_amount: float
    total: float


class SaleCreate(BaseModel):
    """Schema for creating a sale"""
    customer_id: Optional[int] = None
    items: List[SaleItemSchema]
    payment_method: str
    amount_paid: float
    notes: Optional[str] = None


class SaleResponse(BaseModel):
    """Schema for sale response"""
    id: int
    invoice_number: str
    customer_id: Optional[int] = None
    customer_name: Optional[str] = None
    subtotal: float
    tax_amount: float
    discount_amount: float
    total_amount: float
    payment_method: str
    amount_paid: float
    change_given: float
    status: str
    items: List[Dict[str, Any]]
    sold_by_id: Optional[int] = None
    sold_by_name: Optional[str] = None
    sale_date: datetime
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Cash Transaction Schemas
class CashTransactionCreate(BaseModel):
    """Schema for creating a cash transaction"""
    transaction_type: str  # cash_in, cash_out, opening_balance, closing_balance
    amount: float
    category: Optional[str] = None
    description: Optional[str] = None
    reference_number: Optional[str] = None
    notes: Optional[str] = None


class CashTransactionResponse(BaseModel):
    """Schema for cash transaction response"""
    id: int
    transaction_type: str
    amount: float
    balance_before: float
    balance_after: float
    category: Optional[str] = None
    description: Optional[str] = None
    reference_number: Optional[str] = None
    notes: Optional[str] = None
    performed_by_id: Optional[int] = None
    performed_by_name: Optional[str] = None
    transaction_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True


# Expense Schemas
class ExpenseCreate(BaseModel):
    """Schema for creating an expense"""
    title: str
    description: Optional[str] = None
    amount: float
    category: str
    vendor_name: Optional[str] = None
    vendor_contact: Optional[str] = None
    payment_method: Optional[str] = None
    payment_reference: Optional[str] = None
    expense_date: datetime
    due_date: Optional[datetime] = None
    notes: Optional[str] = None


class ExpenseUpdate(BaseModel):
    """Schema for updating an expense"""
    title: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    vendor_name: Optional[str] = None
    vendor_contact: Optional[str] = None
    payment_method: Optional[str] = None
    payment_reference: Optional[str] = None
    status: Optional[str] = None
    expense_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    payment_date: Optional[datetime] = None
    notes: Optional[str] = None


class ExpenseResponse(BaseModel):
    """Schema for expense response"""
    id: int
    expense_number: str
    title: str
    description: Optional[str] = None
    amount: float
    category: str
    status: str
    vendor_name: Optional[str] = None
    vendor_contact: Optional[str] = None
    payment_method: Optional[str] = None
    payment_reference: Optional[str] = None
    expense_date: datetime
    due_date: Optional[datetime] = None
    payment_date: Optional[datetime] = None
    created_by_id: Optional[int] = None
    created_by_name: Optional[str] = None
    approved_by_id: Optional[int] = None
    approved_by_name: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
