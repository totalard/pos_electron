"""
POS Session model for tracking point of sale sessions
"""
from decimal import Decimal
from enum import Enum
from tortoise import fields
from .base import BaseModel


class SessionStatus(str, Enum):
    """Session status enumeration"""
    ACTIVE = "active"
    CLOSED = "closed"
    SUSPENDED = "suspended"


class POSSession(BaseModel):
    """
    POS Session model for tracking point of sale sessions.
    
    Each session represents a cashier's shift with opening and closing cash counts,
    denomination tracking, and sales reconciliation.
    """
    
    # Session identification
    session_number = fields.CharField(
        max_length=100,
        unique=True,
        description="Unique session number (e.g., SES-20240121-001)"
    )
    
    # User tracking
    user = fields.ForeignKeyField(
        'models.User',
        related_name='pos_sessions',
        on_delete=fields.CASCADE,
        description="User who owns this session"
    )
    
    # Session status
    status = fields.CharEnumField(
        SessionStatus,
        default=SessionStatus.ACTIVE,
        description="Current session status"
    )
    
    # Opening cash details
    opening_cash = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        description="Total opening cash amount"
    )
    
    opening_denominations = fields.JSONField(
        default=dict,
        description="Opening cash denomination breakdown (bills and coins)"
    )
    
    # Closing cash details
    closing_cash = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        description="Total closing cash amount"
    )
    
    closing_denominations = fields.JSONField(
        null=True,
        description="Closing cash denomination breakdown (bills and coins)"
    )
    
    # Expected vs actual cash
    expected_cash = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        description="Expected cash based on sales and transactions"
    )
    
    cash_variance = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        description="Difference between expected and actual closing cash"
    )
    
    # Session totals
    total_sales = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        description="Total sales amount during session"
    )
    
    total_cash_in = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        description="Total cash in transactions"
    )
    
    total_cash_out = fields.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        description="Total cash out transactions"
    )
    
    # Payment method breakdown (stored as JSON)
    payment_summary = fields.JSONField(
        default=dict,
        description="Sales breakdown by payment method"
    )
    
    # Session timestamps
    opened_at = fields.DatetimeField(
        auto_now_add=True,
        description="Session opening timestamp"
    )
    
    closed_at = fields.DatetimeField(
        null=True,
        description="Session closing timestamp"
    )
    
    # Additional information
    opening_notes = fields.TextField(
        null=True,
        description="Notes entered when opening session"
    )
    
    closing_notes = fields.TextField(
        null=True,
        description="Notes entered when closing session"
    )
    
    class Meta:
        table = "pos_sessions"
        indexes = [
            ("session_number",),
            ("user_id",),
            ("status",),
            ("opened_at",),
            ("closed_at",),
        ]
        ordering = ["-opened_at"]
    
    def __str__(self) -> str:
        return f"Session {self.session_number} - {self.user.full_name if self.user else 'Unknown'} ({self.status.value})"
    
    def calculate_expected_cash(self) -> Decimal:
        """
        Calculate expected cash based on opening cash, sales, and cash movements.
        Expected = Opening + Cash Sales + Cash In - Cash Out
        """
        cash_sales = Decimal(str(self.payment_summary.get('cash', 0)))
        expected = self.opening_cash + cash_sales + self.total_cash_in - self.total_cash_out
        return expected
    
    def calculate_variance(self, actual_closing: Decimal) -> Decimal:
        """
        Calculate cash variance.
        Variance = Actual Closing - Expected Closing
        Positive = overage, Negative = shortage
        """
        expected = self.calculate_expected_cash()
        return actual_closing - expected
