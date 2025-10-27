"""
Fiscal Year model for year-end closing
"""
from decimal import Decimal
from enum import Enum
from tortoise import fields
from .base import BaseModel


class FiscalYearStatus(str, Enum):
    """Fiscal year status enumeration"""
    OPEN = "open"
    CLOSED = "closed"
    LOCKED = "locked"


class FiscalYear(BaseModel):
    """
    Fiscal Year model for managing accounting periods and year-end closing.
    
    Tracks fiscal year periods and closing balances.
    """
    
    # Fiscal year identification
    year_name = fields.CharField(
        max_length=100,
        unique=True,
        description="Fiscal year name (e.g., 'FY 2024-2025')"
    )
    
    # Period dates
    start_date = fields.DateField(
        description="Fiscal year start date"
    )
    
    end_date = fields.DateField(
        description="Fiscal year end date"
    )
    
    # Status
    status = fields.CharEnumField(
        FiscalYearStatus,
        default=FiscalYearStatus.OPEN,
        description="Fiscal year status"
    )
    
    # Financial summary
    opening_balance = fields.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        description="Opening balance (retained earnings)"
    )
    
    closing_balance = fields.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        description="Closing balance (net profit/loss)"
    )
    
    total_income = fields.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        description="Total income for the year"
    )
    
    total_expenses = fields.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        description="Total expenses for the year"
    )
    
    net_profit_loss = fields.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        description="Net profit or loss"
    )
    
    # Closing information
    closed_at = fields.DatetimeField(
        null=True,
        description="Date and time when year was closed"
    )
    
    closed_by = fields.ForeignKeyField(
        'models.User',
        related_name='fiscal_years_closed',
        null=True,
        on_delete=fields.SET_NULL,
        description="User who closed the fiscal year"
    )
    
    closing_notes = fields.TextField(
        null=True,
        description="Notes about the closing process"
    )
    
    # Metadata
    created_by = fields.ForeignKeyField(
        'models.User',
        related_name='fiscal_years_created',
        null=True,
        on_delete=fields.SET_NULL,
        description="User who created this fiscal year"
    )
    
    class Meta:
        table = "fiscal_years"
        indexes = [
            ("year_name",),
            ("start_date",),
            ("end_date",),
            ("status",),
        ]
        ordering = ["-start_date"]
    
    def __str__(self) -> str:
        return f"{self.year_name} ({self.status.value})"
