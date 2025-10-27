"""
Purchase model for tracking inventory purchases
"""
from decimal import Decimal
from enum import Enum
from tortoise import fields
from .base import BaseModel


class PurchaseStatus(str, Enum):
    """Purchase status enumeration"""
    DRAFT = "draft"
    ORDERED = "ordered"
    RECEIVED = "received"
    PARTIAL = "partial"
    CANCELLED = "cancelled"


class Purchase(BaseModel):
    """
    Purchase model for tracking inventory purchases from vendors.
    
    Integrates with stock management and accounting system.
    """
    
    # Purchase identification
    purchase_number = fields.CharField(
        max_length=100,
        unique=True,
        description="Unique purchase order number"
    )
    
    # Vendor information
    vendor_name = fields.CharField(
        max_length=255,
        description="Vendor/Supplier name"
    )
    
    vendor_contact = fields.CharField(
        max_length=100,
        null=True,
        description="Vendor contact information"
    )
    
    vendor_address = fields.TextField(
        null=True,
        description="Vendor address"
    )
    
    # Purchase details
    purchase_date = fields.DatetimeField(
        description="Date of purchase"
    )
    
    expected_delivery_date = fields.DatetimeField(
        null=True,
        description="Expected delivery date"
    )
    
    actual_delivery_date = fields.DatetimeField(
        null=True,
        description="Actual delivery date"
    )
    
    # Financial details
    subtotal = fields.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        description="Subtotal before tax"
    )
    
    tax_amount = fields.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        description="Total tax amount"
    )
    
    shipping_cost = fields.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        description="Shipping/delivery cost"
    )
    
    other_charges = fields.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        description="Other charges"
    )
    
    total_amount = fields.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        description="Total purchase amount"
    )
    
    # Payment information
    payment_method = fields.CharField(
        max_length=50,
        null=True,
        description="Payment method"
    )
    
    payment_reference = fields.CharField(
        max_length=100,
        null=True,
        description="Payment reference number"
    )
    
    payment_status = fields.CharField(
        max_length=50,
        default="unpaid",
        description="Payment status (unpaid, partial, paid)"
    )
    
    amount_paid = fields.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        description="Amount paid"
    )
    
    # Status
    status = fields.CharEnumField(
        PurchaseStatus,
        default=PurchaseStatus.DRAFT,
        description="Purchase status"
    )
    
    # Items (stored as JSON for flexibility)
    items = fields.JSONField(
        default=list,
        description="List of purchased items with details"
    )
    
    # Reference information
    invoice_number = fields.CharField(
        max_length=100,
        null=True,
        description="Vendor invoice number"
    )
    
    notes = fields.TextField(
        null=True,
        description="Additional notes"
    )
    
    # User tracking
    created_by = fields.ForeignKeyField(
        'models.User',
        related_name='purchases_created',
        null=True,
        on_delete=fields.SET_NULL,
        description="User who created this purchase"
    )
    
    received_by = fields.ForeignKeyField(
        'models.User',
        related_name='purchases_received',
        null=True,
        on_delete=fields.SET_NULL,
        description="User who received this purchase"
    )
    
    class Meta:
        table = "purchases"
        indexes = [
            ("purchase_number",),
            ("vendor_name",),
            ("purchase_date",),
            ("status",),
            ("payment_status",),
        ]
        ordering = ["-purchase_date"]
    
    def __str__(self) -> str:
        return f"{self.purchase_number} - {self.vendor_name} - {self.total_amount}"
