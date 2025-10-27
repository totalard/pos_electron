"""
Journal Entry models for double-entry bookkeeping
"""
from decimal import Decimal
from enum import Enum
from tortoise import fields
from .base import BaseModel


class JournalEntryStatus(str, Enum):
    """Journal entry status enumeration"""
    DRAFT = "draft"
    POSTED = "posted"
    VOID = "void"


class JournalEntryType(str, Enum):
    """Journal entry type enumeration"""
    GENERAL = "general"
    SALES = "sales"
    PURCHASE = "purchase"
    PAYMENT = "payment"
    RECEIPT = "receipt"
    ADJUSTMENT = "adjustment"
    CLOSING = "closing"
    OPENING = "opening"


class JournalEntry(BaseModel):
    """
    Journal Entry model representing a complete accounting transaction.
    
    Each journal entry contains multiple line items (debits and credits)
    that must balance according to double-entry bookkeeping principles.
    """
    
    # Entry identification
    entry_number = fields.CharField(
        max_length=100,
        unique=True,
        description="Unique journal entry number"
    )
    
    # Entry details
    entry_date = fields.DatetimeField(
        description="Date of the journal entry"
    )
    
    entry_type = fields.CharEnumField(
        JournalEntryType,
        default=JournalEntryType.GENERAL,
        description="Type of journal entry"
    )
    
    description = fields.TextField(
        description="Description of the transaction"
    )
    
    # Reference to source transaction
    reference_type = fields.CharField(
        max_length=50,
        null=True,
        description="Type of source transaction (e.g., 'sale', 'expense', 'purchase')"
    )
    
    reference_id = fields.IntField(
        null=True,
        description="ID of the source transaction"
    )
    
    reference_number = fields.CharField(
        max_length=100,
        null=True,
        description="Reference number from source transaction"
    )
    
    # Status
    status = fields.CharEnumField(
        JournalEntryStatus,
        default=JournalEntryStatus.DRAFT,
        description="Entry status"
    )
    
    posted_at = fields.DatetimeField(
        null=True,
        description="Date and time when entry was posted"
    )
    
    # Totals (for validation)
    total_debit = fields.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        description="Total debit amount"
    )
    
    total_credit = fields.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        description="Total credit amount"
    )
    
    # User tracking
    created_by = fields.ForeignKeyField(
        'models.User',
        related_name='journal_entries_created',
        null=True,
        on_delete=fields.SET_NULL,
        description="User who created this entry"
    )
    
    posted_by = fields.ForeignKeyField(
        'models.User',
        related_name='journal_entries_posted',
        null=True,
        on_delete=fields.SET_NULL,
        description="User who posted this entry"
    )
    
    notes = fields.TextField(
        null=True,
        description="Additional notes"
    )
    
    class Meta:
        table = "journal_entries"
        indexes = [
            ("entry_number",),
            ("entry_date",),
            ("entry_type",),
            ("status",),
            ("reference_type", "reference_id"),
        ]
        ordering = ["-entry_date", "-entry_number"]
    
    def __str__(self) -> str:
        return f"{self.entry_number} - {self.description}"
    
    def is_balanced(self) -> bool:
        """Check if the journal entry is balanced (debits = credits)"""
        return self.total_debit == self.total_credit


class JournalEntryLine(BaseModel):
    """
    Journal Entry Line model representing individual debit/credit lines.
    
    Each line represents either a debit or credit to a specific account.
    """
    
    # Link to journal entry
    journal_entry = fields.ForeignKeyField(
        'models.JournalEntry',
        related_name='lines',
        on_delete=fields.CASCADE,
        description="Parent journal entry"
    )
    
    # Account reference
    account = fields.ForeignKeyField(
        'models.Account',
        related_name='journal_lines',
        on_delete=fields.RESTRICT,
        description="Account affected by this line"
    )
    
    # Line details
    description = fields.TextField(
        null=True,
        description="Line item description"
    )
    
    # Debit or Credit
    debit_amount = fields.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        description="Debit amount"
    )
    
    credit_amount = fields.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        description="Credit amount"
    )
    
    # Line order
    line_number = fields.IntField(
        default=1,
        description="Line number for ordering"
    )
    
    class Meta:
        table = "journal_entry_lines"
        indexes = [
            ("journal_entry_id",),
            ("account_id",),
        ]
        ordering = ["journal_entry_id", "line_number"]
    
    def __str__(self) -> str:
        amount = self.debit_amount if self.debit_amount > 0 else self.credit_amount
        type_str = "DR" if self.debit_amount > 0 else "CR"
        return f"{self.account.account_name if self.account else 'Unknown'} - {type_str} {amount}"
