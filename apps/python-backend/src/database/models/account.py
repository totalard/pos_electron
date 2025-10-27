"""
Account model for Chart of Accounts
Implements minimal double-entry accounting system
"""
from decimal import Decimal
from enum import Enum
from tortoise import fields
from .base import BaseModel


class AccountType(str, Enum):
    """Account type enumeration following standard accounting categories"""
    ASSET = "asset"
    LIABILITY = "liability"
    EQUITY = "equity"
    INCOME = "income"
    EXPENSE = "expense"


class AccountSubType(str, Enum):
    """Account sub-type for more granular categorization"""
    # Assets
    CASH = "cash"
    BANK = "bank"
    INVENTORY = "inventory"
    ACCOUNTS_RECEIVABLE = "accounts_receivable"
    
    # Liabilities
    ACCOUNTS_PAYABLE = "accounts_payable"
    
    # Equity
    OWNERS_CAPITAL = "owners_capital"
    RETAINED_EARNINGS = "retained_earnings"
    
    # Income
    SALES_REVENUE = "sales_revenue"
    OTHER_INCOME = "other_income"
    
    # Expenses
    COST_OF_GOODS_SOLD = "cost_of_goods_sold"
    OPERATING_EXPENSES = "operating_expenses"
    RENT = "rent"
    UTILITIES = "utilities"
    SALARIES = "salaries"
    SUPPLIES = "supplies"
    MARKETING = "marketing"
    MAINTENANCE = "maintenance"
    TRANSPORTATION = "transportation"
    INSURANCE = "insurance"
    TAXES = "taxes"
    OTHER_EXPENSES = "other_expenses"


class Account(BaseModel):
    """
    Account model representing Chart of Accounts.
    
    Implements a minimal yet comprehensive chart of accounts for small business.
    Each account tracks its balance and supports double-entry bookkeeping.
    """
    
    # Account identification
    account_code = fields.CharField(
        max_length=20,
        unique=True,
        description="Unique account code (e.g., 1000, 2000, 3000)"
    )
    
    account_name = fields.CharField(
        max_length=255,
        description="Account name (e.g., 'Cash', 'Sales Revenue')"
    )
    
    # Account classification
    account_type = fields.CharEnumField(
        AccountType,
        description="Primary account type"
    )
    
    account_subtype = fields.CharEnumField(
        AccountSubType,
        null=True,
        description="Account sub-type for categorization"
    )
    
    # Account details
    description = fields.TextField(
        null=True,
        description="Detailed description of the account"
    )
    
    # Balance tracking
    current_balance = fields.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        description="Current account balance"
    )
    
    # Account status
    is_active = fields.BooleanField(
        default=True,
        description="Whether the account is active"
    )
    
    is_system = fields.BooleanField(
        default=False,
        description="System account (cannot be deleted)"
    )
    
    # Parent account for hierarchical structure
    parent_account = fields.ForeignKeyField(
        'models.Account',
        related_name='sub_accounts',
        null=True,
        on_delete=fields.SET_NULL,
        description="Parent account for hierarchical structure"
    )
    
    # Metadata
    created_by = fields.ForeignKeyField(
        'models.User',
        related_name='accounts_created',
        null=True,
        on_delete=fields.SET_NULL,
        description="User who created this account"
    )
    
    class Meta:
        table = "accounts"
        indexes = [
            ("account_code",),
            ("account_type",),
            ("account_subtype",),
            ("is_active",),
        ]
        ordering = ["account_code"]
    
    def __str__(self) -> str:
        return f"{self.account_code} - {self.account_name}"
    
    def update_balance(self, amount: Decimal, is_debit: bool):
        """
        Update account balance based on debit/credit and account type.
        
        Debit increases: Assets, Expenses
        Credit increases: Liabilities, Equity, Income
        """
        if self.account_type in [AccountType.ASSET, AccountType.EXPENSE]:
            # Debit increases, Credit decreases
            if is_debit:
                self.current_balance += amount
            else:
                self.current_balance -= amount
        else:
            # Credit increases, Debit decreases (Liabilities, Equity, Income)
            if is_debit:
                self.current_balance -= amount
            else:
                self.current_balance += amount
