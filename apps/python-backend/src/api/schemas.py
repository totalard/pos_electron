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
    pin: str = Field(..., min_length=4, max_length=6, pattern=r'^\d+$')
    email: Optional[str] = Field(None, max_length=255)
    notes: Optional[str] = None
    
    @field_validator('pin')
    @classmethod
    def validate_pin(cls, v: str) -> str:
        """Validate PIN is numeric and correct length"""
        if not v.isdigit():
            raise ValueError('PIN must contain only digits')
        if len(v) < 4 or len(v) > 6:
            raise ValueError('PIN must be between 4 and 6 digits')
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
    old_pin: str = Field(..., min_length=4, max_length=6)
    new_pin: str = Field(..., min_length=4, max_length=6, pattern=r'^\d+$')
    
    @field_validator('new_pin')
    @classmethod
    def validate_new_pin(cls, v: str) -> str:
        """Validate new PIN is numeric and correct length"""
        if not v.isdigit():
            raise ValueError('PIN must contain only digits')
        if len(v) < 4 or len(v) > 6:
            raise ValueError('PIN must be between 4 and 6 digits')
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
    pin: str = Field(..., min_length=4, max_length=6)


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

