"""
Customer Transaction model for tracking customer credit and loyalty transactions
"""
from decimal import Decimal
from tortoise import fields
from .base import BaseModel


class TransactionType(str):
    """Transaction type enum"""
    CREDIT_SALE = "credit_sale"
    PAYMENT = "payment"
    CREDIT_ADJUSTMENT = "credit_adjustment"
    LOYALTY_EARNED = "loyalty_earned"
    LOYALTY_REDEEMED = "loyalty_redeemed"
    LOYALTY_ADJUSTMENT = "loyalty_adjustment"


class CustomerTransaction(BaseModel):
    """
    Customer Transaction model for tracking all customer-related transactions.
    
    Tracks credit sales, payments, credit adjustments, and loyalty point changes.
    """
    
    # Transaction details
    customer = fields.ForeignKeyField(
        'models.Customer',
        related_name='transactions',
        on_delete=fields.CASCADE,
        description="Customer associated with this transaction"
    )
    
    transaction_type = fields.CharField(
        max_length=50,
        description="Type of transaction"
    )
    
    amount = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        description="Transaction amount (for credit/payment transactions)"
    )
    
    loyalty_points = fields.IntField(
        default=0,
        description="Loyalty points affected by this transaction"
    )
    
    balance_before = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        description="Credit balance before this transaction"
    )
    
    balance_after = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        description="Credit balance after this transaction"
    )
    
    loyalty_points_before = fields.IntField(
        default=0,
        description="Loyalty points before this transaction"
    )
    
    loyalty_points_after = fields.IntField(
        default=0,
        description="Loyalty points after this transaction"
    )
    
    reference_number = fields.CharField(
        max_length=100,
        null=True,
        description="Reference number (invoice, receipt, etc.)"
    )
    
    notes = fields.TextField(
        null=True,
        description="Additional notes about the transaction"
    )
    
    # Metadata
    created_by = fields.ForeignKeyField(
        'models.User',
        related_name='customer_transactions',
        null=True,
        on_delete=fields.SET_NULL,
        description="User who created this transaction"
    )
    
    class Meta:
        table = "customer_transactions"
        indexes = [
            ("customer_id",),
            ("transaction_type",),
            ("created_at",),
        ]
        ordering = ["-created_at"]
    
    def __str__(self) -> str:
        return f"{self.transaction_type} - {self.customer.name if self.customer else 'Unknown'} - {self.amount}"

