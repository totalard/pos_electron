"""
Enhanced Product API schemas for comprehensive inventory management
"""
from typing import List, Optional, Dict, Any
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, Field


# Base schemas
class ProductCategoryBase(BaseModel):
    """Base schema for product categories"""
    name: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    parent_id: Optional[int] = None
    sort_order: int = Field(default=0)
    is_active: bool = Field(default=True)
    meta_title: Optional[str] = Field(None, max_length=255)
    meta_description: Optional[str] = None


class ProductCategoryCreate(ProductCategoryBase):
    """Schema for creating product categories"""
    pass


class ProductCategoryUpdate(BaseModel):
    """Schema for updating product categories"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    slug: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    parent_id: Optional[int] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None
    meta_title: Optional[str] = Field(None, max_length=255)
    meta_description: Optional[str] = None


class ProductCategoryResponse(ProductCategoryBase):
    """Schema for product category responses"""
    id: int
    full_path: str
    children_count: int = 0
    products_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Tax Rate schemas
class TaxRateBase(BaseModel):
    """Base schema for tax rates"""
    name: str = Field(..., min_length=1, max_length=255)
    rate: Decimal = Field(..., ge=0, le=100)
    description: Optional[str] = None
    is_compound: bool = Field(default=False)
    is_active: bool = Field(default=True)
    applicable_hsn_codes: List[str] = Field(default_factory=list)


class TaxRateCreate(TaxRateBase):
    """Schema for creating tax rates"""
    pass


class TaxRateUpdate(BaseModel):
    """Schema for updating tax rates"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    rate: Optional[Decimal] = Field(None, ge=0, le=100)
    description: Optional[str] = None
    is_compound: Optional[bool] = None
    is_active: Optional[bool] = None
    applicable_hsn_codes: Optional[List[str]] = None


class TaxRateResponse(TaxRateBase):
    """Schema for tax rate responses"""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Product Image schemas
class ProductImageBase(BaseModel):
    """Base schema for product images"""
    image_url: str = Field(..., max_length=500)
    alt_text: Optional[str] = Field(None, max_length=255)
    is_primary: bool = Field(default=False)
    sort_order: int = Field(default=0)


class ProductImageCreate(ProductImageBase):
    """Schema for creating product images"""
    pass


class ProductImageUpdate(BaseModel):
    """Schema for updating product images"""
    image_url: Optional[str] = Field(None, max_length=500)
    alt_text: Optional[str] = Field(None, max_length=255)
    is_primary: Optional[bool] = None
    sort_order: Optional[int] = None


class ProductImageResponse(ProductImageBase):
    """Schema for product image responses"""
    id: int
    product_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Product Attribute schemas
class ProductAttributeBase(BaseModel):
    """Base schema for product attributes"""
    name: str = Field(..., min_length=1, max_length=100)
    slug: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    is_active: bool = Field(default=True)


class ProductAttributeCreate(ProductAttributeBase):
    """Schema for creating product attributes"""
    pass


class ProductAttributeUpdate(BaseModel):
    """Schema for updating product attributes"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    slug: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    is_active: Optional[bool] = None


class ProductAttributeValueBase(BaseModel):
    """Base schema for product attribute values"""
    value: str = Field(..., min_length=1, max_length=100)
    slug: str = Field(..., min_length=1, max_length=100)
    sort_order: int = Field(default=0)
    is_active: bool = Field(default=True)


class ProductAttributeValueCreate(ProductAttributeValueBase):
    """Schema for creating product attribute values"""
    attribute_id: int


class ProductAttributeValueUpdate(BaseModel):
    """Schema for updating product attribute values"""
    value: Optional[str] = Field(None, min_length=1, max_length=100)
    slug: Optional[str] = Field(None, min_length=1, max_length=100)
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class ProductAttributeValueResponse(ProductAttributeValueBase):
    """Schema for product attribute value responses"""
    id: int
    attribute_id: int
    attribute_name: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProductAttributeResponse(ProductAttributeBase):
    """Schema for product attribute responses"""
    id: int
    values: List[ProductAttributeValueResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Enhanced Product schemas
class EnhancedProductBase(BaseModel):
    """Base schema for enhanced products"""
    name: str = Field(..., min_length=1, max_length=255)
    sku: Optional[str] = Field(None, max_length=100)
    barcode: Optional[str] = Field(None, max_length=100)
    hsn_code: Optional[str] = Field(None, max_length=20)
    description: Optional[str] = None
    short_description: Optional[str] = Field(None, max_length=500)
    product_type: str = Field(default="simple")
    maximum_price: Optional[Decimal] = Field(None, ge=0)
    sale_price: Decimal = Field(..., ge=0)
    cost_price: Decimal = Field(default=0, ge=0)
    track_inventory: bool = Field(default=True)
    current_stock: int = Field(default=0, ge=0)
    min_stock_level: int = Field(default=0, ge=0)
    max_stock_level: int = Field(default=0, ge=0)
    is_active: bool = Field(default=True)
    is_featured: bool = Field(default=False)
    meta_title: Optional[str] = Field(None, max_length=255)
    meta_description: Optional[str] = None
    weight: Optional[Decimal] = Field(None, ge=0)
    dimensions: Dict[str, Any] = Field(default_factory=dict)
    notes: Optional[str] = None


class EnhancedProductCreate(EnhancedProductBase):
    """Schema for creating enhanced products"""
    category_ids: List[int] = Field(default_factory=list)
    tax_rate_ids: List[int] = Field(default_factory=list)
    images: List[ProductImageCreate] = Field(default_factory=list)


class EnhancedProductUpdate(BaseModel):
    """Schema for updating enhanced products"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    sku: Optional[str] = Field(None, max_length=100)
    barcode: Optional[str] = Field(None, max_length=100)
    hsn_code: Optional[str] = Field(None, max_length=20)
    description: Optional[str] = None
    short_description: Optional[str] = Field(None, max_length=500)
    product_type: Optional[str] = None
    maximum_price: Optional[Decimal] = Field(None, ge=0)
    sale_price: Optional[Decimal] = Field(None, ge=0)
    cost_price: Optional[Decimal] = Field(None, ge=0)
    track_inventory: Optional[bool] = None
    current_stock: Optional[int] = Field(None, ge=0)
    min_stock_level: Optional[int] = Field(None, ge=0)
    max_stock_level: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    meta_title: Optional[str] = Field(None, max_length=255)
    meta_description: Optional[str] = None
    weight: Optional[Decimal] = Field(None, ge=0)
    dimensions: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None
    category_ids: Optional[List[int]] = None
    tax_rate_ids: Optional[List[int]] = None


class EnhancedProductResponse(EnhancedProductBase):
    """Schema for enhanced product responses"""
    id: int
    categories: List[ProductCategoryResponse] = []
    tax_rates: List[TaxRateResponse] = []
    images: List[ProductImageResponse] = []
    is_low_stock: bool
    profit_margin: float
    discount_percentage: float
    created_at: datetime
    updated_at: datetime
    created_by_id: Optional[int] = None

    class Config:
        from_attributes = True


# Product Variation schemas
class ProductVariationBase(BaseModel):
    """Base schema for product variations"""
    sku: Optional[str] = Field(None, max_length=100)
    barcode: Optional[str] = Field(None, max_length=100)
    maximum_price: Optional[Decimal] = Field(None, ge=0)
    sale_price: Decimal = Field(..., ge=0)
    cost_price: Decimal = Field(default=0, ge=0)
    current_stock: int = Field(default=0, ge=0)
    min_stock_level: int = Field(default=0, ge=0)
    max_stock_level: int = Field(default=0, ge=0)
    is_active: bool = Field(default=True)


class ProductVariationCreate(ProductVariationBase):
    """Schema for creating product variations"""
    parent_product_id: int
    attribute_value_ids: List[int] = Field(..., min_items=1)


class ProductVariationUpdate(BaseModel):
    """Schema for updating product variations"""
    sku: Optional[str] = Field(None, max_length=100)
    barcode: Optional[str] = Field(None, max_length=100)
    maximum_price: Optional[Decimal] = Field(None, ge=0)
    sale_price: Optional[Decimal] = Field(None, ge=0)
    cost_price: Optional[Decimal] = Field(None, ge=0)
    current_stock: Optional[int] = Field(None, ge=0)
    min_stock_level: Optional[int] = Field(None, ge=0)
    max_stock_level: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None
    attribute_value_ids: Optional[List[int]] = None


class ProductVariationResponse(ProductVariationBase):
    """Schema for product variation responses"""
    id: int
    parent_product_id: int
    parent_product_name: str
    attribute_values: List[ProductAttributeValueResponse] = []
    variation_name: str
    is_low_stock: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Bundle Item schemas
class BundleItemBase(BaseModel):
    """Base schema for bundle items"""
    quantity: int = Field(..., ge=1)
    override_price: Optional[Decimal] = Field(None, ge=0)


class BundleItemCreate(BundleItemBase):
    """Schema for creating bundle items"""
    item_product_id: int


class BundleItemUpdate(BaseModel):
    """Schema for updating bundle items"""
    quantity: Optional[int] = Field(None, ge=1)
    override_price: Optional[Decimal] = Field(None, ge=0)


class BundleItemResponse(BundleItemBase):
    """Schema for bundle item responses"""
    id: int
    bundle_product_id: int
    item_product_id: int
    item_product_name: str
    item_product_sku: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Enhanced Product with variations and bundle items
class EnhancedProductDetailResponse(EnhancedProductResponse):
    """Detailed schema for enhanced product responses with variations and bundle items"""
    variations: List[ProductVariationResponse] = []
    bundle_items: List[BundleItemResponse] = []
    total_stock: int = 0  # Sum of all variation stocks or main product stock

    class Config:
        from_attributes = True


# Bulk operations schemas
class BulkProductUpdate(BaseModel):
    """Schema for bulk product updates"""
    product_ids: List[int] = Field(..., min_items=1)
    updates: EnhancedProductUpdate


class BulkProductResponse(BaseModel):
    """Schema for bulk product operation responses"""
    success_count: int
    error_count: int
    errors: List[Dict[str, Any]] = []
    updated_products: List[EnhancedProductResponse] = []


# Search and filter schemas
class ProductSearchFilters(BaseModel):
    """Schema for product search and filtering"""
    search: Optional[str] = None
    category_ids: Optional[List[int]] = None
    product_type: Optional[str] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    is_low_stock: Optional[bool] = None
    min_price: Optional[Decimal] = None
    max_price: Optional[Decimal] = None
    hsn_code: Optional[str] = None
    skip: int = Field(default=0, ge=0)
    limit: int = Field(default=50, ge=1, le=1000)
    sort_by: str = Field(default="name")
    sort_order: str = Field(default="asc", pattern="^(asc|desc)$")


class ProductSearchResponse(BaseModel):
    """Schema for product search responses"""
    products: List[EnhancedProductResponse]
    total_count: int
    page: int
    page_size: int
    total_pages: int
    filters_applied: ProductSearchFilters
