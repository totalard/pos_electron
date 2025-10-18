"""
Product Management models for comprehensive inventory and catalog management
"""
from enum import Enum
from tortoise import fields
from .base import BaseModel


class ProductType(str, Enum):
    """Product type enumeration"""
    SIMPLE = "simple"        # Simple product with direct pricing and inventory
    BUNDLE = "bundle"        # Bundle of multiple products
    VARIATION = "variation"  # Product with variations (size, color, etc.)
    SERVICE = "service"      # Service without inventory tracking


# Keep old ItemType for backward compatibility
class ItemType(str, Enum):
    """Item type enumeration (DEPRECATED - use ProductType)"""
    PRODUCT = "product"  # Physical product with inventory
    SERVICE = "service"  # Service without inventory tracking


class ProductCategory(BaseModel):
    """
    Product Category model with hierarchical support.

    Supports nested categories with parent-child relationships.
    """

    # Basic information
    name = fields.CharField(
        max_length=255,
        description="Category name"
    )

    description = fields.TextField(
        null=True,
        description="Category description"
    )

    # Image
    image_path = fields.CharField(
        max_length=500,
        null=True,
        description="Category image path"
    )

    # Hierarchy
    parent_category = fields.ForeignKeyField(
        'models.ProductCategory',
        related_name='subcategories',
        null=True,
        on_delete=fields.CASCADE,
        description="Parent category for nested categories"
    )

    # Display
    display_order = fields.IntField(
        default=0,
        description="Display order for sorting"
    )

    # Status
    is_active = fields.BooleanField(
        default=True,
        description="Whether the category is active"
    )

    class Meta:
        table = "product_categories"
        indexes = [
            ("name",),
            ("parent_category_id",),
            ("is_active",),
            ("display_order",),
        ]
        ordering = ["display_order", "name"]

    def __str__(self) -> str:
        return self.name


class Product(BaseModel):
    """
    Enhanced Product model supporting multiple product types.

    Supports:
    - SIMPLE: Direct pricing and inventory
    - BUNDLE: Composed of multiple products
    - VARIATION: Has variants (size, color, etc.)
    - SERVICE: No inventory tracking
    """

    # Basic information
    name = fields.CharField(
        max_length=255,
        description="Product name"
    )

    description = fields.TextField(
        null=True,
        description="Detailed description"
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

    # Product type
    product_type = fields.CharEnumField(
        ProductType,
        default=ProductType.SIMPLE,
        description="Product type (simple/bundle/variation/service)"
    )

    # Keep old item_type for backward compatibility
    item_type = fields.CharEnumField(
        ItemType,
        default=ItemType.PRODUCT,
        description="DEPRECATED: Use product_type instead"
    )

    # Category relationship
    category = fields.ForeignKeyField(
        'models.ProductCategory',
        related_name='products',
        null=True,
        on_delete=fields.SET_NULL,
        description="Product category"
    )

    # Pricing
    base_price = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        description="Base selling price"
    )

    cost_price = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        description="Cost price (purchase price)"
    )

    # Keep old selling_price for backward compatibility
    selling_price = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        description="DEPRECATED: Use base_price instead"
    )

    # Tax
    tax = fields.ForeignKeyField(
        'models.TaxRule',
        related_name='products',
        null=True,
        on_delete=fields.SET_NULL,
        description="Tax rule applied to this product"
    )

    # Keep old tax_rate for backward compatibility
    tax_rate = fields.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        description="DEPRECATED: Use tax relationship instead"
    )

    # Status
    is_active = fields.BooleanField(
        default=True,
        description="Whether the product is active and available for sale"
    )

    # Inventory tracking (only for SIMPLE and VARIATION types)
    track_inventory = fields.BooleanField(
        default=True,
        description="Whether to track inventory for this item"
    )

    stock_quantity = fields.IntField(
        default=0,
        description="Current stock quantity"
    )

    # Keep old current_stock for backward compatibility
    current_stock = fields.IntField(
        default=0,
        description="DEPRECATED: Use stock_quantity instead"
    )

    low_stock_threshold = fields.IntField(
        default=0,
        description="Low stock alert threshold"
    )

    # Keep old min_stock_level for backward compatibility
    min_stock_level = fields.IntField(
        default=0,
        description="DEPRECATED: Use low_stock_threshold instead"
    )

    max_stock_level = fields.IntField(
        default=0,
        description="Maximum stock level"
    )

    # Images (JSON array of image paths)
    image_paths = fields.JSONField(
        default=list,
        description="Array of image paths for this product"
    )

    # Keep old image_url for backward compatibility
    image_url = fields.CharField(
        max_length=500,
        null=True,
        description="DEPRECATED: Use image_paths instead"
    )

    # Additional fields
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
            ("product_type",),
            ("item_type",),
            ("category_id",),
            ("is_active",),
        ]

    def __str__(self) -> str:
        return f"{self.name} ({self.sku or 'No SKU'})"

    @property
    def is_low_stock(self) -> bool:
        """Check if product is below minimum stock level"""
        if not self.track_inventory or self.product_type == ProductType.SERVICE:
            return False
        threshold = self.low_stock_threshold or self.min_stock_level
        current = self.stock_quantity or self.current_stock
        return current <= threshold

    @property
    def profit_margin(self) -> float:
        """Calculate profit margin percentage"""
        if self.cost_price == 0:
            return 0
        price = self.base_price or self.selling_price
        return float(((price - self.cost_price) / self.cost_price) * 100)


class ProductVariation(BaseModel):
    """
    Product Variation model for products with variants.

    Used when product_type = VARIATION to define individual variants
    with their own pricing, inventory, and attributes.
    """

    # Parent product relationship
    parent_product = fields.ForeignKeyField(
        'models.Product',
        related_name='variations',
        on_delete=fields.CASCADE,
        description="Parent product"
    )

    # Variation details
    variation_name = fields.CharField(
        max_length=255,
        description="Variation name (e.g., 'Large Red', 'Small Blue')"
    )

    sku = fields.CharField(
        max_length=100,
        unique=True,
        null=True,
        description="Unique SKU for this variation"
    )

    barcode = fields.CharField(
        max_length=100,
        unique=True,
        null=True,
        description="Unique barcode for this variation"
    )

    # Pricing
    price_adjustment = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        description="Price adjustment from base price (can be positive or negative)"
    )

    cost_price = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        description="Cost price for this variation (overrides parent if set)"
    )

    # Inventory
    stock_quantity = fields.IntField(
        default=0,
        description="Stock quantity for this variation"
    )

    # Attributes (JSON for flexible attribute storage)
    attributes = fields.JSONField(
        default=dict,
        description="Variation attributes (e.g., {'size': 'Large', 'color': 'Red'})"
    )

    # Status
    is_active = fields.BooleanField(
        default=True,
        description="Whether this variation is active"
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
        return f"{self.parent_product.name if self.parent_product else 'Unknown'} - {self.variation_name}"

    @property
    def final_price(self) -> float:
        """Calculate final price including adjustment"""
        if self.parent_product:
            base = self.parent_product.base_price or self.parent_product.selling_price
            return float(base + self.price_adjustment)
        return float(self.price_adjustment)


class ProductBundle(BaseModel):
    """
    Product Bundle model for bundled products.

    Defines which products are included in a bundle and their quantities.
    """

    # Bundle product (the product with product_type = BUNDLE)
    bundle_product = fields.ForeignKeyField(
        'models.Product',
        related_name='bundle_components',
        on_delete=fields.CASCADE,
        description="The bundle product"
    )

    # Component product (the product included in the bundle)
    component_product = fields.ForeignKeyField(
        'models.Product',
        related_name='included_in_bundles',
        on_delete=fields.CASCADE,
        description="Product included in the bundle"
    )

    # Quantity of component in bundle
    quantity = fields.IntField(
        default=1,
        description="Quantity of this component in the bundle"
    )

    class Meta:
        table = "product_bundles"
        indexes = [
            ("bundle_product_id",),
            ("component_product_id",),
        ]
        unique_together = (("bundle_product", "component_product"),)

    def __str__(self) -> str:
        bundle_name = self.bundle_product.name if self.bundle_product else 'Unknown'
        component_name = self.component_product.name if self.component_product else 'Unknown'
        return f"{bundle_name} includes {self.quantity}x {component_name}"

