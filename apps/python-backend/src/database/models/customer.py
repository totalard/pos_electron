"""
Customer model for customer management
"""
from decimal import Decimal
from tortoise import fields
from .base import BaseModel


class CreditStatus(str):
    """Credit status enum"""
    GOOD = "good"
    WARNING = "warning"
    EXCEEDED = "exceeded"
    BLOCKED = "blocked"


class Customer(BaseModel):
    """
    Customer model for managing customer information, loyalty, and credit.

    Stores customer details including contact information, address,
    loyalty points for rewards programs, and credit management.
    """

    # Customer information
    name = fields.CharField(
        max_length=255,
        description="Customer full name"
    )

    phone = fields.CharField(
        max_length=20,
        null=True,
        description="Customer phone number"
    )

    email = fields.CharField(
        max_length=255,
        null=True,
        description="Customer email address"
    )

    address = fields.TextField(
        null=True,
        description="Customer address"
    )

    # Loyalty program
    loyalty_points = fields.IntField(
        default=0,
        description="Loyalty points accumulated"
    )

    # Credit management
    credit_limit = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        description="Maximum credit limit allowed for this customer"
    )

    credit_balance = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        description="Current credit balance (amount owed by customer)"
    )

    credit_status = fields.CharField(
        max_length=20,
        default=CreditStatus.GOOD,
        description="Credit status: good, warning, exceeded, blocked"
    )

    # Metadata
    created_by = fields.ForeignKeyField(
        'models.User',
        related_name='created_customers',
        null=True,
        on_delete=fields.SET_NULL,
        description="User who created this customer record"
    )

    class Meta:
        table = "customers"
        indexes = [
            ("name",),
            ("phone",),
            ("email",),
            ("credit_status",),
        ]

    def __str__(self) -> str:
        return f"{self.name} ({self.phone or self.email or 'No contact'})"

    def update_credit_status(self) -> None:
        """Update credit status based on current balance and limit"""
        if self.credit_balance <= 0:
            self.credit_status = CreditStatus.GOOD
        elif self.credit_limit == 0:
            self.credit_status = CreditStatus.BLOCKED
        elif self.credit_balance >= self.credit_limit:
            self.credit_status = CreditStatus.EXCEEDED
        elif self.credit_balance >= (self.credit_limit * Decimal('0.8')):
            self.credit_status = CreditStatus.WARNING
        else:
            self.credit_status = CreditStatus.GOOD

