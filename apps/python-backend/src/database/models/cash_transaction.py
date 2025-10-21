"""
Cash Transaction model for tracking cash in/out movements
"""
from decimal import Decimal
from enum import Enum
from tortoise import fields
from .base import BaseModel


class CashTransactionType(str, Enum):
    """Cash transaction type enumeration"""
    CASH_IN = "cash_in"
    CASH_OUT = "cash_out"
    OPENING_BALANCE = "opening_balance"
    CLOSING_BALANCE = "closing_balance"


class CashTransaction(BaseModel):
    """
    Cash Transaction model for tracking all cash movements.
    
    Records cash in/out transactions, opening/closing balances, and cash drawer activities.
    """
    
    # Transaction details
    transaction_type = fields.CharEnumField(
        CashTransactionType,
        description="Type of cash transaction"
    )
    
    amount = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        description="Transaction amount"
    )
    
    # Balance tracking
    balance_before = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        description="Cash balance before transaction"
    )
    
    balance_after = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        description="Cash balance after transaction"
    )
    
    # Reference information
    reference_number = fields.CharField(
        max_length=100,
        null=True,
        description="Reference number (receipt, invoice, etc.)"
    )
    
    category = fields.CharField(
        max_length=100,
        null=True,
        description="Transaction category (e.g., 'Sales', 'Supplier Payment', 'Petty Cash')"
    )
    
    description = fields.TextField(
        null=True,
        description="Description of the transaction"
    )
    
    notes = fields.TextField(
        null=True,
        description="Additional notes"
    )
    
    # Session tracking
    session = fields.ForeignKeyField(
        'models.POSSession',
        related_name='cash_transactions',
        null=True,
        on_delete=fields.SET_NULL,
        description="POS session this transaction belongs to"
    )
    
    # User tracking
    performed_by = fields.ForeignKeyField(
        'models.User',
        related_name='cash_transactions',
        null=True,
        on_delete=fields.SET_NULL,
        description="User who performed this transaction"
    )
    
    # Timestamps
    transaction_date = fields.DatetimeField(
        auto_now_add=True,
        description="Date and time of transaction"
    )
    
    class Meta:
        table = "cash_transactions"
        indexes = [
            ("transaction_type",),
            ("transaction_date",),
            ("performed_by_id",),
            ("category",),
        ]
        ordering = ["-transaction_date"]
    
    def __str__(self) -> str:
        return f"{self.transaction_type.value} - {self.amount} - {self.transaction_date}"
