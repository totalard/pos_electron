"""
Pydantic schemas for API request/response validation
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator


# User Schemas
class UserCreate(BaseModel):
    """Schema for creating a new user"""
    full_name: str = Field(..., min_length=1, max_length=255)
    mobile_number: Optional[str] = Field(None, max_length=20)
    pin: str = Field(..., min_length=6, max_length=6, pattern=r'^\d{6}$')
    email: Optional[str] = Field(None, max_length=255)
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
    user_id: Optional[int] = Field(None, description="User ID for specific user authentication")

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
class CompanySettingsUpdate(BaseModel):
    """Schema for updating company settings"""
    # General Settings
    business_type: Optional[str] = None
    language: Optional[str] = None
    timezone: Optional[str] = None
    number_format: Optional[str] = None

    # Company Information
    company_name: Optional[str] = None
    company_email: Optional[str] = None
    company_phone: Optional[str] = None
    company_address_street: Optional[str] = None
    company_address_city: Optional[str] = None
    company_address_state: Optional[str] = None
    company_address_zip: Optional[str] = None
    company_address_country: Optional[str] = None
    currency: Optional[str] = None

    # Multiple Locations/Branches
    enable_multi_location: Optional[bool] = None
    locations: Optional[list] = None

    # Fiscal Year Settings
    fiscal_year_start_month: Optional[int] = Field(None, ge=1, le=12)
    fiscal_year_start_day: Optional[int] = Field(None, ge=1, le=31)

    # Business Hours
    business_hours: Optional[dict] = None

    # Tax Settings
    tax_rates: Optional[list] = None
    enable_tax_exemptions: Optional[bool] = None
    tax_exemption_codes: Optional[list] = None
    enable_compound_tax: Optional[bool] = None
    tax_reporting_frequency: Optional[str] = None

    # Inventory Settings
    track_inventory: Optional[bool] = None
    low_stock_threshold: Optional[int] = None
    enable_low_stock_alerts: Optional[bool] = None
    auto_reorder_enabled: Optional[bool] = None
    auto_reorder_threshold: Optional[int] = None
    default_reorder_quantity: Optional[int] = None

    # Barcode Settings
    barcode_format: Optional[str] = None
    auto_generate_barcodes: Optional[bool] = None

    # Unit of Measure
    enable_uom_conversions: Optional[bool] = None
    uom_conversions: Optional[list] = None

    # Batch/Serial Number Tracking
    enable_batch_tracking: Optional[bool] = None
    enable_serial_tracking: Optional[bool] = None


class CompanySettingsResponse(BaseModel):
    """Schema for company settings response"""
    id: int
    # General Settings
    business_type: str
    language: str
    timezone: str
    number_format: str

    # Company Information
    company_name: Optional[str]
    company_email: Optional[str]
    company_phone: Optional[str]
    company_address_street: Optional[str]
    company_address_city: Optional[str]
    company_address_state: Optional[str]
    company_address_zip: Optional[str]
    company_address_country: Optional[str]
    currency: str

    # Multiple Locations/Branches
    enable_multi_location: bool
    locations: list

    # Fiscal Year Settings
    fiscal_year_start_month: int
    fiscal_year_start_day: int

    # Business Hours
    business_hours: dict

    # Tax Settings
    tax_rates: list
    enable_tax_exemptions: bool
    tax_exemption_codes: list
    enable_compound_tax: bool
    tax_reporting_frequency: str

    # Inventory Settings
    track_inventory: bool
    low_stock_threshold: int
    enable_low_stock_alerts: bool
    auto_reorder_enabled: bool
    auto_reorder_threshold: int
    default_reorder_quantity: int

    # Barcode Settings
    barcode_format: str
    auto_generate_barcodes: bool

    # Unit of Measure
    enable_uom_conversions: bool
    uom_conversions: list

    # Batch/Serial Number Tracking
    enable_batch_tracking: bool
    enable_serial_tracking: bool

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserSettingsUpdate(BaseModel):
    """Schema for updating user settings"""
    # Accessibility Settings
    date_format: Optional[str] = None
    font_size: Optional[str] = None
    high_contrast: Optional[bool] = None
    reduced_motion: Optional[bool] = None

    # Color Blind Modes
    color_blind_mode: Optional[str] = None

    # Screen Reader Support
    enable_screen_reader: Optional[bool] = None

    # Keyboard Shortcuts
    keyboard_shortcuts: Optional[dict] = None
    enable_keyboard_shortcuts: Optional[bool] = None

    # Language Override
    language_override: Optional[str] = None

    # Timezone Override
    timezone_override: Optional[str] = None

    # Notification Preferences
    enable_notifications: Optional[bool] = None
    notification_sound: Optional[bool] = None

    # Dashboard Preferences
    dashboard_layout: Optional[dict] = None


class UserSettingsResponse(BaseModel):
    """Schema for user settings response"""
    id: int
    user_id: int

    # Accessibility Settings
    date_format: str
    font_size: str
    high_contrast: bool
    reduced_motion: bool

    # Color Blind Modes
    color_blind_mode: str

    # Screen Reader Support
    enable_screen_reader: bool

    # Keyboard Shortcuts
    keyboard_shortcuts: dict
    enable_keyboard_shortcuts: bool

    # Language Override
    language_override: Optional[str]

    # Timezone Override
    timezone_override: Optional[str]

    # Notification Preferences
    enable_notifications: bool
    notification_sound: bool

    # Dashboard Preferences
    dashboard_layout: dict

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
