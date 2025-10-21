"""
Expense model for tracking business expenses
"""
from decimal import Decimal
from enum import Enum
from tortoise import fields
from .base import BaseModel


class ExpenseCategory(str, Enum):
    """Expense category enumeration"""
    RENT = "rent"
    UTILITIES = "utilities"
    SALARIES = "salaries"
    SUPPLIES = "supplies"
    MARKETING = "marketing"
    MAINTENANCE = "maintenance"
    TRANSPORTATION = "transportation"
    INSURANCE = "insurance"
    TAXES = "taxes"
    OTHER = "other"


class ExpenseStatus(str, Enum):
    """Expense status enumeration"""
    PENDING = "pending"
    APPROVED = "approved"
    PAID = "paid"
    REJECTED = "rejected"


class Expense(BaseModel):
    """
    Expense model for tracking all business expenses.
    
    Records expense details, categories, and payment status.
    """
    
    # Expense details
    expense_number = fields.CharField(
        max_length=100,
        unique=True,
        description="Unique expense reference number"
    )
    
    title = fields.CharField(
        max_length=255,
        description="Expense title/name"
    )
    
    description = fields.TextField(
        null=True,
        description="Detailed description of the expense"
    )
    
    # Financial details
    amount = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        description="Expense amount"
    )
    
    category = fields.CharEnumField(
        ExpenseCategory,
        default=ExpenseCategory.OTHER,
        description="Expense category"
    )
    
    # Status and approval
    status = fields.CharEnumField(
        ExpenseStatus,
        default=ExpenseStatus.PENDING,
        description="Expense status"
    )
    
    # Vendor/Payee information
    vendor_name = fields.CharField(
        max_length=255,
        null=True,
        description="Vendor or payee name"
    )
    
    vendor_contact = fields.CharField(
        max_length=100,
        null=True,
        description="Vendor contact information"
    )
    
    # Payment information
    payment_method = fields.CharField(
        max_length=50,
        null=True,
        description="Payment method used"
    )
    
    payment_reference = fields.CharField(
        max_length=100,
        null=True,
        description="Payment reference number"
    )
    
    payment_date = fields.DatetimeField(
        null=True,
        description="Date when payment was made"
    )
    
    # Dates
    expense_date = fields.DatetimeField(
        description="Date when expense was incurred"
    )
    
    due_date = fields.DatetimeField(
        null=True,
        description="Payment due date"
    )
    
    # Attachments (file paths or URLs)
    attachments = fields.JSONField(
        default=list,
        description="List of attachment file paths or URLs"
    )
    
    # User tracking
    created_by = fields.ForeignKeyField(
        'models.User',
        related_name='expenses_created',
        null=True,
        on_delete=fields.SET_NULL,
        description="User who created this expense"
    )
    
    approved_by = fields.ForeignKeyField(
        'models.User',
        related_name='expenses_approved',
        null=True,
        on_delete=fields.SET_NULL,
        description="User who approved this expense"
    )
    
    notes = fields.TextField(
        null=True,
        description="Additional notes"
    )
    
    class Meta:
        table = "expenses"
        indexes = [
            ("expense_number",),
            ("category",),
            ("status",),
            ("expense_date",),
            ("created_by_id",),
        ]
        ordering = ["-expense_date"]
    
    def __str__(self) -> str:
        return f"{self.expense_number} - {self.title} - {self.amount}"
