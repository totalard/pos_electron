"""
Product and Service models for inventory management
"""
from enum import Enum
from tortoise import fields
from .base import BaseModel


class ItemType(str, Enum):
    """Item type enumeration"""
    PRODUCT = "product"  # Physical product with inventory
    SERVICE = "service"  # Service without inventory tracking


class ProductCategory(str, Enum):
    """Product category enumeration"""
    GENERAL = "general"
    FOOD = "food"
    BEVERAGE = "beverage"
    ELECTRONICS = "electronics"
    CLOTHING = "clothing"
    ACCESSORIES = "accessories"
    OTHER = "other"


class Product(BaseModel):
    """
    Product/Service model for items that can be sold.
    
    This model handles both physical products (with inventory) and services
    (without inventory tracking).
    """
    
    # Basic information
    name = fields.CharField(
        max_length=255,
        description="Product/Service name"
    )
    
    sku = fields.CharField(
        max_length=100,
        unique=True,
        null=True,
        description="Stock Keeping Unit (SKU) - unique identifier"
    )
    
    barcode = fields.CharField(
        max_length=100,
        unique=True,
        null=True,
        description="Barcode for scanning"
    )
    
    description = fields.TextField(
        null=True,
        description="Detailed description"
    )
    
    # Type and category
    item_type = fields.CharEnumField(
        ItemType,
        default=ItemType.PRODUCT,
        description="Type: product or service"
    )
    
    category = fields.CharEnumField(
        ProductCategory,
        default=ProductCategory.GENERAL,
        description="Product category"
    )
    
    # Pricing
    cost_price = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        description="Cost price (purchase price)"
    )
    
    selling_price = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        description="Selling price"
    )
    
    tax_rate = fields.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        description="Tax rate percentage (e.g., 18.00 for 18%)"
    )
    
    # Inventory (only for products, not services)
    track_inventory = fields.BooleanField(
        default=True,
        description="Whether to track inventory for this item"
    )
    
    current_stock = fields.IntField(
        default=0,
        description="Current stock quantity"
    )
    
    min_stock_level = fields.IntField(
        default=0,
        description="Minimum stock level for alerts"
    )
    
    max_stock_level = fields.IntField(
        default=0,
        description="Maximum stock level"
    )
    
    # Status
    is_active = fields.BooleanField(
        default=True,
        description="Whether the product is active and available for sale"
    )
    
    # Additional fields
    image_url = fields.CharField(
        max_length=500,
        null=True,
        description="Product image URL or path"
    )
    
    notes = fields.TextField(
        null=True,
        description="Additional notes"
    )
    
    # Relationships
    created_by = fields.ForeignKeyField(
        'models.User',
        related_name='created_products',
        null=True,
        on_delete=fields.SET_NULL,
        description="User who created this product"
    )
    
    class Meta:
        table = "products"
        indexes = [
            ("name",),
            ("sku",),
            ("barcode",),
            ("item_type",),
            ("category",),
            ("is_active",),
        ]
    
    def __str__(self) -> str:
        return f"{self.name} ({self.sku or 'No SKU'})"
    
    @property
    def is_low_stock(self) -> bool:
        """Check if product is below minimum stock level"""
        if not self.track_inventory or self.item_type == ItemType.SERVICE:
            return False
        return self.current_stock <= self.min_stock_level
    
    @property
    def profit_margin(self) -> float:
        """Calculate profit margin percentage"""
        if self.cost_price == 0:
            return 0
        return float(((self.selling_price - self.cost_price) / self.cost_price) * 100)

