"""
Discount Management models for POS system
Handles discount rules, conditions, and usage tracking
"""
from decimal import Decimal
from enum import Enum
from tortoise import fields
from .base import BaseModel


class DiscountType(str, Enum):
    """Discount type enumeration"""
    PERCENTAGE = "percentage"
    FIXED_AMOUNT = "fixed_amount"
    BUY_X_GET_Y = "buy_x_get_y"
    BUNDLE = "bundle"
    FREE_SHIPPING = "free_shipping"


class DiscountConditionType(str, Enum):
    """Discount condition type enumeration"""
    MIN_PURCHASE = "min_purchase"
    MIN_QUANTITY = "min_quantity"
    SPECIFIC_PRODUCTS = "specific_products"
    SPECIFIC_CATEGORIES = "specific_categories"
    CUSTOMER_SEGMENT = "customer_segment"
    FIRST_PURCHASE = "first_purchase"
    TIME_BASED = "time_based"


class DiscountStatus(str, Enum):
    """Discount status enumeration"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SCHEDULED = "scheduled"
    EXPIRED = "expired"
    DRAFT = "draft"


class Discount(BaseModel):
    """
    Discount model for managing promotional discounts.
    
    Supports various discount types with flexible conditions and rules.
    """
    
    # Basic information
    code = fields.CharField(
        max_length=50,
        unique=True,
        description="Unique discount code"
    )
    
    name = fields.CharField(
        max_length=200,
        description="Display name for the discount"
    )
    
    description = fields.TextField(
        null=True,
        description="Detailed description of the discount"
    )
    
    # Discount type and value
    discount_type = fields.CharEnumField(
        DiscountType,
        default=DiscountType.PERCENTAGE,
        description="Type of discount"
    )
    
    value = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        description="Discount value (percentage or fixed amount)"
    )
    
    # Maximum discount cap (for percentage discounts)
    max_discount_amount = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        description="Maximum discount amount cap"
    )
    
    # Conditions
    min_purchase_amount = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        description="Minimum purchase amount required"
    )
    
    min_quantity = fields.IntField(
        null=True,
        description="Minimum quantity of items required"
    )
    
    # Applicable items (stored as JSON arrays)
    applicable_products = fields.JSONField(
        default=list,
        description="List of product IDs this discount applies to"
    )
    
    applicable_categories = fields.JSONField(
        default=list,
        description="List of category IDs this discount applies to"
    )
    
    # Customer restrictions
    applicable_customer_segments = fields.JSONField(
        default=list,
        description="Customer segments eligible for this discount"
    )
    
    first_purchase_only = fields.BooleanField(
        default=False,
        description="Only applicable to first-time customers"
    )
    
    # Buy X Get Y specific fields
    buy_quantity = fields.IntField(
        null=True,
        description="Buy X quantity (for buy_x_get_y type)"
    )
    
    get_quantity = fields.IntField(
        null=True,
        description="Get Y quantity free (for buy_x_get_y type)"
    )
    
    # Bundle discount specific
    bundle_products = fields.JSONField(
        default=list,
        description="Products required in bundle"
    )
    
    # Usage limits
    usage_limit = fields.IntField(
        null=True,
        description="Maximum number of times this discount can be used"
    )
    
    usage_limit_per_customer = fields.IntField(
        null=True,
        description="Maximum uses per customer"
    )
    
    usage_count = fields.IntField(
        default=0,
        description="Current usage count"
    )
    
    # Time restrictions
    valid_from = fields.DatetimeField(
        null=True,
        description="Start date/time for discount validity"
    )
    
    valid_until = fields.DatetimeField(
        null=True,
        description="End date/time for discount validity"
    )
    
    # Time-based conditions (e.g., happy hours)
    time_restrictions = fields.JSONField(
        default=dict,
        description="Time-based restrictions (days, hours)"
    )
    
    # Priority and stacking
    priority = fields.IntField(
        default=0,
        description="Priority for applying multiple discounts (higher = first)"
    )
    
    can_stack = fields.BooleanField(
        default=False,
        description="Can be combined with other discounts"
    )
    
    stackable_with = fields.JSONField(
        default=list,
        description="List of discount IDs this can stack with"
    )
    
    # Auto-apply
    auto_apply = fields.BooleanField(
        default=False,
        description="Automatically apply if conditions are met"
    )
    
    # Status
    status = fields.CharEnumField(
        DiscountStatus,
        default=DiscountStatus.DRAFT,
        description="Current status of the discount"
    )
    
    is_active = fields.BooleanField(
        default=True,
        description="Whether the discount is currently active"
    )
    
    # Tracking
    created_by = fields.ForeignKeyField(
        'models.User',
        related_name='created_discounts',
        null=True,
        on_delete=fields.SET_NULL,
        description="User who created this discount"
    )
    
    # Analytics fields
    total_revenue_impact = fields.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        description="Total revenue impact (discount amount given)"
    )
    
    total_orders = fields.IntField(
        default=0,
        description="Total number of orders using this discount"
    )
    
    # Additional metadata
    notes = fields.TextField(
        null=True,
        description="Internal notes about the discount"
    )
    
    tags = fields.JSONField(
        default=list,
        description="Tags for categorizing discounts"
    )
    
    class Meta:
        table = "discounts"
        indexes = [
            ("code",),
            ("status",),
            ("discount_type",),
            ("is_active",),
            ("valid_from",),
            ("valid_until",),
            ("priority",),
        ]
        ordering = ["-priority", "-created_at"]
    
    def __str__(self) -> str:
        return f"Discount {self.code} - {self.name}"


class DiscountUsage(BaseModel):
    """
    Tracks individual usage of discounts for analytics and limits.
    """
    
    discount = fields.ForeignKeyField(
        'models.Discount',
        related_name='usages',
        on_delete=fields.CASCADE,
        description="Discount that was used"
    )
    
    sale = fields.ForeignKeyField(
        'models.Sale',
        related_name='discount_usages',
        null=True,
        on_delete=fields.SET_NULL,
        description="Sale where discount was applied"
    )
    
    customer = fields.ForeignKeyField(
        'models.Customer',
        related_name='discount_usages',
        null=True,
        on_delete=fields.SET_NULL,
        description="Customer who used the discount"
    )
    
    # Usage details
    discount_amount = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        description="Actual discount amount applied"
    )
    
    original_amount = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        description="Original amount before discount"
    )
    
    final_amount = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        description="Final amount after discount"
    )
    
    # Context
    applied_by = fields.ForeignKeyField(
        'models.User',
        related_name='applied_discounts',
        null=True,
        on_delete=fields.SET_NULL,
        description="User who applied the discount"
    )
    
    usage_date = fields.DatetimeField(
        auto_now_add=True,
        description="When the discount was used"
    )
    
    # Additional context
    metadata = fields.JSONField(
        default=dict,
        description="Additional context about the usage"
    )
    
    class Meta:
        table = "discount_usages"
        indexes = [
            ("discount_id",),
            ("sale_id",),
            ("customer_id",),
            ("usage_date",),
        ]
        ordering = ["-usage_date"]
    
    def __str__(self) -> str:
        return f"DiscountUsage {self.discount.code} - {self.discount_amount}"
