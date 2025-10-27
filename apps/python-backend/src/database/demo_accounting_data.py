"""
Comprehensive accounting demo data for POS system.
Includes accounts, journal entries, fiscal years, and purchases with edge cases.
"""
import random
from decimal import Decimal
from datetime import datetime, timedelta
from typing import List

from .models import (
    Account,
    AccountType,
    AccountSubType,
    JournalEntry,
    JournalEntryLine,
    JournalEntryStatus,
    JournalEntryType,
    FiscalYear,
    FiscalYearStatus,
    Purchase,
    PurchaseStatus,
    Product,
    ProductType,
    User
)


async def create_demo_accounts() -> List[Account]:
    """Create comprehensive chart of accounts with realistic balances and edge cases."""
    print("Creating demo accounts...")
    accounts = []
    
    user = await User.first()
    if not user:
        print("No user found, skipping accounts")
        return accounts
    
    # Check if accounts already exist (from init_accounts)
    existing_count = await Account.all().count()
    if existing_count > 0:
        print(f"Accounts already exist ({existing_count} accounts), loading them...")
        return await Account.all()
    
    # If no accounts exist, create comprehensive chart of accounts
    account_data = [
        # ASSETS (1000-1999)
        {"code": "1000", "name": "Cash", "type": AccountType.ASSET, "subtype": AccountSubType.CASH, 
         "balance": Decimal("15000.00"), "desc": "Cash on hand and in registers", "system": True},
        {"code": "1010", "name": "Petty Cash", "type": AccountType.ASSET, "subtype": AccountSubType.CASH, 
         "balance": Decimal("500.00"), "desc": "Petty cash fund", "system": False},
        {"code": "1100", "name": "Bank Account - Checking", "type": AccountType.ASSET, "subtype": AccountSubType.BANK, 
         "balance": Decimal("45000.00"), "desc": "Primary checking account", "system": True},
        {"code": "1110", "name": "Bank Account - Savings", "type": AccountType.ASSET, "subtype": AccountSubType.BANK, 
         "balance": Decimal("25000.00"), "desc": "Savings account", "system": False},
        {"code": "1200", "name": "Inventory", "type": AccountType.ASSET, "subtype": AccountSubType.INVENTORY, 
         "balance": Decimal("35000.00"), "desc": "Inventory on hand", "system": True},
        {"code": "1300", "name": "Accounts Receivable", "type": AccountType.ASSET, "subtype": AccountSubType.ACCOUNTS_RECEIVABLE, 
         "balance": Decimal("8500.00"), "desc": "Money owed by customers", "system": True},
        {"code": "1400", "name": "Prepaid Expenses", "type": AccountType.ASSET, "subtype": None, 
         "balance": Decimal("2400.00"), "desc": "Prepaid rent and insurance", "system": False},
        {"code": "1500", "name": "Equipment", "type": AccountType.ASSET, "subtype": None, 
         "balance": Decimal("12000.00"), "desc": "POS equipment and fixtures", "system": False},
        {"code": "1510", "name": "Accumulated Depreciation - Equipment", "type": AccountType.ASSET, "subtype": None, 
         "balance": Decimal("-2400.00"), "desc": "Accumulated depreciation", "system": False},
        
        # LIABILITIES (2000-2999)
        {"code": "2000", "name": "Accounts Payable", "type": AccountType.LIABILITY, "subtype": AccountSubType.ACCOUNTS_PAYABLE, 
         "balance": Decimal("12500.00"), "desc": "Money owed to suppliers", "system": True},
        {"code": "2100", "name": "Sales Tax Payable", "type": AccountType.LIABILITY, "subtype": None, 
         "balance": Decimal("1850.00"), "desc": "Sales tax collected", "system": False},
        {"code": "2200", "name": "Credit Card Payable", "type": AccountType.LIABILITY, "subtype": None, 
         "balance": Decimal("3200.00"), "desc": "Credit card liabilities", "system": False},
        {"code": "2300", "name": "Loan Payable", "type": AccountType.LIABILITY, "subtype": None, 
         "balance": Decimal("20000.00"), "desc": "Business loan", "system": False},
        {"code": "2400", "name": "Unearned Revenue", "type": AccountType.LIABILITY, "subtype": None, 
         "balance": Decimal("1500.00"), "desc": "Prepaid customer deposits", "system": False},
        
        # EQUITY (3000-3999)
        {"code": "3000", "name": "Owner's Capital", "type": AccountType.EQUITY, "subtype": AccountSubType.OWNERS_CAPITAL, 
         "balance": Decimal("80000.00"), "desc": "Owner's investment", "system": True},
        {"code": "3100", "name": "Retained Earnings", "type": AccountType.EQUITY, "subtype": AccountSubType.RETAINED_EARNINGS, 
         "balance": Decimal("15450.00"), "desc": "Accumulated profits", "system": True},
        {"code": "3200", "name": "Owner's Drawings", "type": AccountType.EQUITY, "subtype": None, 
         "balance": Decimal("-5000.00"), "desc": "Owner withdrawals", "system": False},
        
        # INCOME (4000-4999)
        {"code": "4000", "name": "Sales Revenue", "type": AccountType.INCOME, "subtype": AccountSubType.SALES_REVENUE, 
         "balance": Decimal("125000.00"), "desc": "Product sales revenue", "system": True},
        {"code": "4100", "name": "Service Revenue", "type": AccountType.INCOME, "subtype": AccountSubType.OTHER_INCOME, 
         "balance": Decimal("15000.00"), "desc": "Service revenue", "system": False},
        {"code": "4200", "name": "Interest Income", "type": AccountType.INCOME, "subtype": AccountSubType.OTHER_INCOME, 
         "balance": Decimal("250.00"), "desc": "Bank interest earned", "system": False},
        {"code": "4300", "name": "Discount Forfeited", "type": AccountType.INCOME, "subtype": AccountSubType.OTHER_INCOME, 
         "balance": Decimal("0.00"), "desc": "Discounts not taken by customers", "system": False},
        
        # EXPENSES (5000-5999)
        {"code": "5000", "name": "Cost of Goods Sold", "type": AccountType.EXPENSE, "subtype": AccountSubType.COST_OF_GOODS_SOLD, 
         "balance": Decimal("65000.00"), "desc": "Direct cost of products sold", "system": True},
        {"code": "5100", "name": "Rent Expense", "type": AccountType.EXPENSE, "subtype": AccountSubType.RENT, 
         "balance": Decimal("18000.00"), "desc": "Monthly rent payments", "system": False},
        {"code": "5200", "name": "Utilities Expense", "type": AccountType.EXPENSE, "subtype": AccountSubType.UTILITIES, 
         "balance": Decimal("2400.00"), "desc": "Electricity, water, internet", "system": False},
        {"code": "5300", "name": "Salaries & Wages", "type": AccountType.EXPENSE, "subtype": AccountSubType.SALARIES, 
         "balance": Decimal("42000.00"), "desc": "Employee salaries", "system": False},
        {"code": "5400", "name": "Supplies Expense", "type": AccountType.EXPENSE, "subtype": AccountSubType.SUPPLIES, 
         "balance": Decimal("1500.00"), "desc": "Office supplies", "system": False},
        {"code": "5500", "name": "Marketing & Advertising", "type": AccountType.EXPENSE, "subtype": AccountSubType.MARKETING, 
         "balance": Decimal("3200.00"), "desc": "Marketing costs", "system": False},
        {"code": "5600", "name": "Maintenance & Repairs", "type": AccountType.EXPENSE, "subtype": AccountSubType.MAINTENANCE, 
         "balance": Decimal("850.00"), "desc": "Maintenance costs", "system": False},
        {"code": "5700", "name": "Transportation", "type": AccountType.EXPENSE, "subtype": AccountSubType.TRANSPORTATION, 
         "balance": Decimal("1200.00"), "desc": "Delivery and transport", "system": False},
        {"code": "5800", "name": "Insurance", "type": AccountType.EXPENSE, "subtype": AccountSubType.INSURANCE, 
         "balance": Decimal("2400.00"), "desc": "Business insurance", "system": False},
        {"code": "5900", "name": "Taxes & Licenses", "type": AccountType.EXPENSE, "subtype": AccountSubType.TAXES, 
         "balance": Decimal("1800.00"), "desc": "Business taxes", "system": False},
        {"code": "5910", "name": "Bank Fees", "type": AccountType.EXPENSE, "subtype": AccountSubType.OTHER_EXPENSES, 
         "balance": Decimal("150.00"), "desc": "Bank service charges", "system": False},
        {"code": "5920", "name": "Depreciation Expense", "type": AccountType.EXPENSE, "subtype": AccountSubType.OTHER_EXPENSES, 
         "balance": Decimal("2400.00"), "desc": "Equipment depreciation", "system": False},
        {"code": "5930", "name": "Bad Debt Expense", "type": AccountType.EXPENSE, "subtype": AccountSubType.OTHER_EXPENSES, 
         "balance": Decimal("500.00"), "desc": "Uncollectible receivables", "system": False},
        {"code": "5999", "name": "Other Expenses", "type": AccountType.EXPENSE, "subtype": AccountSubType.OTHER_EXPENSES, 
         "balance": Decimal("750.00"), "desc": "Miscellaneous expenses", "system": False},
    ]
    
    for acc_data in account_data:
        account = await Account.create(
            account_code=acc_data["code"],
            account_name=acc_data["name"],
            account_type=acc_data["type"],
            account_subtype=acc_data["subtype"],
            description=acc_data["desc"],
            current_balance=acc_data["balance"],
            is_active=True,
            is_system=acc_data["system"],
            created_by=user
        )
        accounts.append(account)
    
    # Edge case: Inactive account
    inactive_account = await Account.create(
        account_code="9999",
        account_name="Inactive Account",
        account_type=AccountType.EXPENSE,
        account_subtype=AccountSubType.OTHER_EXPENSES,
        description="Inactive account for testing",
        current_balance=Decimal("0.00"),
        is_active=False,
        is_system=False,
        created_by=user
    )
    accounts.append(inactive_account)
    
    print(f"Created {len(accounts)} accounts with comprehensive balances")
    return accounts


async def create_demo_fiscal_years() -> List[FiscalYear]:
    """Create fiscal years with various statuses and edge cases."""
    print("Creating demo fiscal years...")
    fiscal_years = []
    
    user = await User.first()
    if not user:
        print("No user found, skipping fiscal years")
        return fiscal_years
    
    # Closed fiscal year (last year)
    last_year = datetime.now().year - 1
    fy_closed = await FiscalYear.create(
        year_name=f"FY {last_year}-{last_year + 1}",
        start_date=datetime(last_year, 4, 1).date(),
        end_date=datetime(last_year + 1, 3, 31).date(),
        status=FiscalYearStatus.CLOSED,
        opening_balance=Decimal("50000.00"),
        closing_balance=Decimal("65450.00"),
        total_income=Decimal("180000.00"),
        total_expenses=Decimal("164550.00"),
        net_profit_loss=Decimal("15450.00"),
        closed_at=datetime(last_year + 1, 4, 15),
        closed_by=user,
        closing_notes="Year-end closing completed. Net profit transferred to retained earnings.",
        created_by=user
    )
    fiscal_years.append(fy_closed)
    
    # Locked fiscal year (2 years ago)
    two_years_ago = datetime.now().year - 2
    fy_locked = await FiscalYear.create(
        year_name=f"FY {two_years_ago}-{two_years_ago + 1}",
        start_date=datetime(two_years_ago, 4, 1).date(),
        end_date=datetime(two_years_ago + 1, 3, 31).date(),
        status=FiscalYearStatus.LOCKED,
        opening_balance=Decimal("35000.00"),
        closing_balance=Decimal("50000.00"),
        total_income=Decimal("150000.00"),
        total_expenses=Decimal("135000.00"),
        net_profit_loss=Decimal("15000.00"),
        closed_at=datetime(two_years_ago + 1, 4, 10),
        closed_by=user,
        closing_notes="Year-end closing completed and locked. Audited and finalized.",
        created_by=user
    )
    fiscal_years.append(fy_locked)
    
    # Open fiscal year (current year)
    current_year = datetime.now().year
    fy_open = await FiscalYear.create(
        year_name=f"FY {current_year}-{current_year + 1}",
        start_date=datetime(current_year, 4, 1).date(),
        end_date=datetime(current_year + 1, 3, 31).date(),
        status=FiscalYearStatus.OPEN,
        opening_balance=Decimal("65450.00"),
        closing_balance=Decimal("0.00"),
        total_income=Decimal("0.00"),
        total_expenses=Decimal("0.00"),
        net_profit_loss=Decimal("0.00"),
        closing_notes="Current fiscal year in progress",
        created_by=user
    )
    fiscal_years.append(fy_open)
    
    # Edge case: Fiscal year with loss
    loss_year = datetime.now().year - 3
    fy_loss = await FiscalYear.create(
        year_name=f"FY {loss_year}-{loss_year + 1}",
        start_date=datetime(loss_year, 4, 1).date(),
        end_date=datetime(loss_year + 1, 3, 31).date(),
        status=FiscalYearStatus.CLOSED,
        opening_balance=Decimal("40000.00"),
        closing_balance=Decimal("35000.00"),
        total_income=Decimal("100000.00"),
        total_expenses=Decimal("105000.00"),
        net_profit_loss=Decimal("-5000.00"),
        closed_at=datetime(loss_year + 1, 4, 20),
        closed_by=user,
        closing_notes="Year-end closing with net loss. Challenging market conditions.",
        created_by=user
    )
    fiscal_years.append(fy_loss)
    
    print(f"Created {len(fiscal_years)} fiscal years with various statuses")
    return fiscal_years
