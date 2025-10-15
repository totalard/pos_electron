"""
Enhanced Product models for comprehensive inventory management
"""
from enum import Enum
from typing import Optional, List
from tortoise import fields
from .base import BaseModel


class ProductType(str, Enum):
    """Enhanced product type enumeration"""
    SIMPLE = "simple"        # Standard single-item products
    VARIABLE = "variable"    # Products with variations (size, color, etc.)
    BUNDLE = "bundle"        # Products composed of multiple items
    SERVICE = "service"      # Non-physical products/services


class ProductCategory(BaseModel):
    """
    Hierarchical product categories with unlimited depth
    """
    name = fields.CharField(
        max_length=255,
        description="Category name"
    )
    
    slug = fields.CharField(
        max_length=255,
        unique=True,
        description="URL-friendly category identifier"
    )
    
    description = fields.TextField(
        null=True,
        description="Category description"
    )
    
    # Self-referencing foreign key for hierarchy
    parent = fields.ForeignKeyField(
        'models.ProductCategory',
        related_name='children',
        null=True,
        on_delete=fields.CASCADE,
        description="Parent category for hierarchy"
    )
    
    # Display order within parent category
    sort_order = fields.IntField(
        default=0,
        description="Sort order within parent category"
    )
    
    is_active = fields.BooleanField(
        default=True,
        description="Whether category is active"
    )
    
    # SEO and metadata
    meta_title = fields.CharField(
        max_length=255,
        null=True,
        description="SEO meta title"
    )
    
    meta_description = fields.TextField(
        null=True,
        description="SEO meta description"
    )
    
    class Meta:
        table = "product_categories"
        indexes = [
            ("name",),
            ("slug",),
            ("parent_id",),
            ("is_active",),
            ("sort_order",),
        ]
    
    def __str__(self) -> str:
        return self.name
    
    @property
    def full_path(self) -> str:
        """Get full category path (e.g., 'Electronics > Phones > Smartphones')"""
        if self.parent:
            return f"{self.parent.full_path} > {self.name}"
        return self.name


class TaxRate(BaseModel):
    """
    Tax rates that can be applied to products
    """
    name = fields.CharField(
        max_length=255,
        description="Tax rate name (e.g., 'GST 18%', 'VAT 20%')"
    )
    
    rate = fields.DecimalField(
        max_digits=5,
        decimal_places=2,
        description="Tax rate percentage (e.g., 18.00 for 18%)"
    )
    
    description = fields.TextField(
        null=True,
        description="Tax rate description"
    )
    
    is_compound = fields.BooleanField(
        default=False,
        description="Whether this tax compounds on other taxes"
    )
    
    is_active = fields.BooleanField(
        default=True,
        description="Whether tax rate is active"
    )
    
    # HSN code compatibility
    applicable_hsn_codes = fields.JSONField(
        default=list,
        description="List of HSN codes this tax rate applies to"
    )
    
    class Meta:
        table = "tax_rates"
        indexes = [
            ("name",),
            ("rate",),
            ("is_active",),
        ]
    
    def __str__(self) -> str:
        return f"{self.name} ({self.rate}%)"


class EnhancedProduct(BaseModel):
    """
    Enhanced Product model with comprehensive inventory management features
    """
    
    # Basic Information
    name = fields.CharField(
        max_length=255,
        description="Product name"
    )
    
    sku = fields.CharField(
        max_length=100,
        unique=True,
        null=True,
        description="Stock Keeping Unit (SKU)"
    )
    
    barcode = fields.CharField(
        max_length=100,
        unique=True,
        null=True,
        description="Barcode for scanning"
    )
    
    hsn_code = fields.CharField(
        max_length=20,
        null=True,
        description="Harmonized System Nomenclature code"
    )
    
    description = fields.TextField(
        null=True,
        description="Product description"
    )
    
    short_description = fields.CharField(
        max_length=500,
        null=True,
        description="Short product description"
    )
    
    # Product Type and Categories
    product_type = fields.CharEnumField(
        ProductType,
        default=ProductType.SIMPLE,
        description="Product type"
    )
    
    # Many-to-many relationship with categories
    categories = fields.ManyToManyField(
        'models.ProductCategory',
        related_name='products',
        description="Product categories"
    )
    
    # Pricing
    maximum_price = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        description="Maximum Retail Price (MRP)"
    )
    
    sale_price = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        description="Sale/Selling price"
    )
    
    cost_price = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        description="Cost price (purchase price)"
    )
    
    # Tax Management - Many-to-many for multiple taxes
    tax_rates = fields.ManyToManyField(
        'models.TaxRate',
        related_name='products',
        description="Applied tax rates"
    )
    
    # Inventory Management
    track_inventory = fields.BooleanField(
        default=True,
        description="Whether to track inventory"
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
    
    # Status and Visibility
    is_active = fields.BooleanField(
        default=True,
        description="Whether product is active"
    )
    
    is_featured = fields.BooleanField(
        default=False,
        description="Whether product is featured"
    )
    
    # SEO and Metadata
    meta_title = fields.CharField(
        max_length=255,
        null=True,
        description="SEO meta title"
    )
    
    meta_description = fields.TextField(
        null=True,
        description="SEO meta description"
    )
    
    # Additional Information
    weight = fields.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        description="Product weight"
    )
    
    dimensions = fields.JSONField(
        default=dict,
        description="Product dimensions (length, width, height)"
    )
    
    notes = fields.TextField(
        null=True,
        description="Internal notes"
    )
    
    # Relationships
    created_by = fields.ForeignKeyField(
        'models.User',
        related_name='created_enhanced_products',
        null=True,
        on_delete=fields.SET_NULL,
        description="User who created this product"
    )
    
    class Meta:
        table = "enhanced_products"
        indexes = [
            ("name",),
            ("sku",),
            ("barcode",),
            ("hsn_code",),
            ("product_type",),
            ("is_active",),
            ("is_featured",),
        ]
    
    def __str__(self) -> str:
        return f"{self.name} ({self.sku or 'No SKU'})"
    
    @property
    def is_low_stock(self) -> bool:
        """Check if product is below minimum stock level"""
        if not self.track_inventory or self.product_type == ProductType.SERVICE:
            return False
        return self.current_stock <= self.min_stock_level
    
    @property
    def profit_margin(self) -> float:
        """Calculate profit margin percentage"""
        if self.cost_price == 0:
            return 0
        return float(((self.sale_price - self.cost_price) / self.cost_price) * 100)
    
    @property
    def discount_percentage(self) -> float:
        """Calculate discount percentage from MRP"""
        if not self.maximum_price or self.maximum_price == 0:
            return 0
        return float(((self.maximum_price - self.sale_price) / self.maximum_price) * 100)


class ProductImage(BaseModel):
    """
    Product images with support for multiple images per product
    """
    product = fields.ForeignKeyField(
        'models.EnhancedProduct',
        related_name='images',
        on_delete=fields.CASCADE,
        description="Associated product"
    )

    image_url = fields.CharField(
        max_length=500,
        description="Image URL or file path"
    )

    alt_text = fields.CharField(
        max_length=255,
        null=True,
        description="Alt text for accessibility"
    )

    is_primary = fields.BooleanField(
        default=False,
        description="Whether this is the primary product image"
    )

    sort_order = fields.IntField(
        default=0,
        description="Display order of images"
    )

    class Meta:
        table = "product_images"
        indexes = [
            ("product_id",),
            ("is_primary",),
            ("sort_order",),
        ]


class ProductAttribute(BaseModel):
    """
    Product attributes for variations (e.g., Size, Color, Material)
    """
    name = fields.CharField(
        max_length=100,
        unique=True,
        description="Attribute name (e.g., 'Size', 'Color')"
    )

    slug = fields.CharField(
        max_length=100,
        unique=True,
        description="URL-friendly attribute identifier"
    )

    description = fields.TextField(
        null=True,
        description="Attribute description"
    )

    is_active = fields.BooleanField(
        default=True,
        description="Whether attribute is active"
    )

    class Meta:
        table = "product_attributes"
        indexes = [
            ("name",),
            ("slug",),
            ("is_active",),
        ]

    def __str__(self) -> str:
        return self.name


class ProductAttributeValue(BaseModel):
    """
    Values for product attributes (e.g., 'Small', 'Medium', 'Large' for Size)
    """
    attribute = fields.ForeignKeyField(
        'models.ProductAttribute',
        related_name='values',
        on_delete=fields.CASCADE,
        description="Associated attribute"
    )

    value = fields.CharField(
        max_length=100,
        description="Attribute value (e.g., 'Red', 'Large', 'Cotton')"
    )

    slug = fields.CharField(
        max_length=100,
        description="URL-friendly value identifier"
    )

    sort_order = fields.IntField(
        default=0,
        description="Display order of values"
    )

    is_active = fields.BooleanField(
        default=True,
        description="Whether value is active"
    )

    class Meta:
        table = "product_attribute_values"
        indexes = [
            ("attribute_id",),
            ("value",),
            ("slug",),
            ("is_active",),
        ]
        unique_together = [("attribute", "value")]

    def __str__(self) -> str:
        return f"{self.attribute.name}: {self.value}"


class ProductVariation(BaseModel):
    """
    Product variations for variable products
    Each variation has its own inventory and pricing
    """
    parent_product = fields.ForeignKeyField(
        'models.EnhancedProduct',
        related_name='variations',
        on_delete=fields.CASCADE,
        description="Parent variable product"
    )

    sku = fields.CharField(
        max_length=100,
        unique=True,
        null=True,
        description="Variation-specific SKU"
    )

    barcode = fields.CharField(
        max_length=100,
        unique=True,
        null=True,
        description="Variation-specific barcode"
    )

    # Variation-specific pricing
    maximum_price = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        description="Variation maximum price (MRP)"
    )

    sale_price = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        description="Variation sale price"
    )

    cost_price = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        description="Variation cost price"
    )

    # Variation-specific inventory
    current_stock = fields.IntField(
        default=0,
        description="Current stock for this variation"
    )

    min_stock_level = fields.IntField(
        default=0,
        description="Minimum stock level for this variation"
    )

    max_stock_level = fields.IntField(
        default=0,
        description="Maximum stock level for this variation"
    )

    # Status
    is_active = fields.BooleanField(
        default=True,
        description="Whether variation is active"
    )

    # Variation attributes (many-to-many with attribute values)
    attribute_values = fields.ManyToManyField(
        'models.ProductAttributeValue',
        related_name='variations',
        description="Attribute values that define this variation"
    )

    class Meta:
        table = "product_variations"
        indexes = [
            ("parent_product_id",),
            ("sku",),
            ("barcode",),
            ("is_active",),
        ]

    def __str__(self) -> str:
        return f"{self.parent_product.name} - Variation {self.id}"

    @property
    def is_low_stock(self) -> bool:
        """Check if variation is below minimum stock level"""
        return self.current_stock <= self.min_stock_level

    @property
    def variation_name(self) -> str:
        """Generate variation name from attribute values"""
        # This will be populated after attribute values are loaded
        return f"Variation {self.id}"


class BundleItem(BaseModel):
    """
    Items that make up a bundle product
    """
    bundle_product = fields.ForeignKeyField(
        'models.EnhancedProduct',
        related_name='bundle_items',
        on_delete=fields.CASCADE,
        description="Bundle product"
    )

    item_product = fields.ForeignKeyField(
        'models.EnhancedProduct',
        related_name='bundle_inclusions',
        on_delete=fields.CASCADE,
        description="Product included in bundle"
    )

    quantity = fields.IntField(
        default=1,
        description="Quantity of item in bundle"
    )

    # Optional: Override pricing for bundle items
    override_price = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        description="Override price for this item in bundle"
    )

    class Meta:
        table = "bundle_items"
        indexes = [
            ("bundle_product_id",),
            ("item_product_id",),
        ]
        unique_together = [("bundle_product", "item_product")]

    def __str__(self) -> str:
        return f"{self.bundle_product.name} includes {self.quantity}x {self.item_product.name}"
