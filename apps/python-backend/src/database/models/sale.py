"""
Sales Transaction model for tracking POS sales
"""
from decimal import Decimal
from enum import Enum
from tortoise import fields
from .base import BaseModel


class PaymentMethod(str, Enum):
    """Payment method enumeration"""
    CASH = "cash"
    CARD = "card"
    MOBILE = "mobile"
    CREDIT = "credit"
    MIXED = "mixed"


class SaleStatus(str, Enum):
    """Sale status enumeration"""
    COMPLETED = "completed"
    PENDING = "pending"
    REFUNDED = "refunded"
    PARTIALLY_REFUNDED = "partially_refunded"
    CANCELLED = "cancelled"


class Sale(BaseModel):
    """
    Sales Transaction model for tracking all POS sales.
    
    Records complete sale information including items, payments, and customer details.
    """
    
    # Sale identification
    invoice_number = fields.CharField(
        max_length=100,
        unique=True,
        description="Unique invoice number"
    )
    
    # Customer information
    customer = fields.ForeignKeyField(
        'models.Customer',
        related_name='sales',
        null=True,
        on_delete=fields.SET_NULL,
        description="Customer associated with this sale"
    )
    
    # Financial details
    subtotal = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        description="Subtotal before tax and discounts"
    )
    
    tax_amount = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        description="Total tax amount"
    )
    
    discount_amount = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        description="Total discount amount"
    )
    
    total_amount = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        description="Final total amount"
    )
    
    # Payment information
    payment_method = fields.CharEnumField(
        PaymentMethod,
        default=PaymentMethod.CASH,
        description="Payment method used"
    )
    
    amount_paid = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        description="Amount paid by customer"
    )
    
    change_given = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        description="Change given to customer"
    )
    
    # Status
    status = fields.CharEnumField(
        SaleStatus,
        default=SaleStatus.COMPLETED,
        description="Sale status"
    )
    
    # Additional information
    notes = fields.TextField(
        null=True,
        description="Additional notes about the sale"
    )
    
    # Sale items (stored as JSON for flexibility)
    items = fields.JSONField(
        default=list,
        description="List of items sold with details"
    )
    
    # User tracking
    sold_by = fields.ForeignKeyField(
        'models.User',
        related_name='sales',
        null=True,
        on_delete=fields.SET_NULL,
        description="User who processed this sale"
    )
    
    # Timestamps
    sale_date = fields.DatetimeField(
        auto_now_add=True,
        description="Date and time of sale"
    )
    
    class Meta:
        table = "sales"
        indexes = [
            ("invoice_number",),
            ("customer_id",),
            ("status",),
            ("payment_method",),
            ("sale_date",),
            ("sold_by_id",),
        ]
        ordering = ["-sale_date"]
    
    def __str__(self) -> str:
        return f"Sale {self.invoice_number} - {self.total_amount}"
