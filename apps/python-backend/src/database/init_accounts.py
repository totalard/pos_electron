"""
Initialize default chart of accounts
Creates minimal yet comprehensive account structure for small business
"""
import logging
from decimal import Decimal
from .models import Account, AccountType, AccountSubType

logger = logging.getLogger(__name__)


async def initialize_default_accounts():
    """
    Initialize default chart of accounts.
    Creates a minimal yet complete account structure.
    """
    try:
        # Check if accounts already exist
        existing_count = await Account.all().count()
        if existing_count > 0:
            logger.info(f"Accounts already initialized ({existing_count} accounts exist)")
            return
        
        logger.info("Initializing default chart of accounts...")
        
        # Define default accounts
        default_accounts = [
            # ASSETS (1000-1999)
            {
                "account_code": "1000",
                "account_name": "Cash",
                "account_type": AccountType.ASSET,
                "account_subtype": AccountSubType.CASH,
                "description": "Cash on hand and in registers",
                "is_system": True
            },
            {
                "account_code": "1100",
                "account_name": "Bank Account",
                "account_type": AccountType.ASSET,
                "account_subtype": AccountSubType.BANK,
                "description": "Bank account balances",
                "is_system": True
            },
            {
                "account_code": "1200",
                "account_name": "Inventory",
                "account_type": AccountType.ASSET,
                "account_subtype": AccountSubType.INVENTORY,
                "description": "Inventory on hand",
                "is_system": True
            },
            {
                "account_code": "1300",
                "account_name": "Accounts Receivable",
                "account_type": AccountType.ASSET,
                "account_subtype": AccountSubType.ACCOUNTS_RECEIVABLE,
                "description": "Money owed by customers",
                "is_system": True
            },
            
            # LIABILITIES (2000-2999)
            {
                "account_code": "2000",
                "account_name": "Accounts Payable",
                "account_type": AccountType.LIABILITY,
                "account_subtype": AccountSubType.ACCOUNTS_PAYABLE,
                "description": "Money owed to suppliers",
                "is_system": True
            },
            
            # EQUITY (3000-3999)
            {
                "account_code": "3000",
                "account_name": "Owner's Capital",
                "account_type": AccountType.EQUITY,
                "account_subtype": AccountSubType.OWNERS_CAPITAL,
                "description": "Owner's investment in the business",
                "is_system": True
            },
            {
                "account_code": "3100",
                "account_name": "Retained Earnings",
                "account_type": AccountType.EQUITY,
                "account_subtype": AccountSubType.RETAINED_EARNINGS,
                "description": "Accumulated profits/losses",
                "is_system": True
            },
            
            # INCOME (4000-4999)
            {
                "account_code": "4000",
                "account_name": "Sales Revenue",
                "account_type": AccountType.INCOME,
                "account_subtype": AccountSubType.SALES_REVENUE,
                "description": "Revenue from sales",
                "is_system": True
            },
            {
                "account_code": "4100",
                "account_name": "Other Income",
                "account_type": AccountType.INCOME,
                "account_subtype": AccountSubType.OTHER_INCOME,
                "description": "Other sources of income",
                "is_system": True
            },
            
            # EXPENSES (5000-5999)
            {
                "account_code": "5000",
                "account_name": "Cost of Goods Sold",
                "account_type": AccountType.EXPENSE,
                "account_subtype": AccountSubType.COST_OF_GOODS_SOLD,
                "description": "Direct cost of products sold",
                "is_system": True
            },
            {
                "account_code": "5100",
                "account_name": "Rent Expense",
                "account_type": AccountType.EXPENSE,
                "account_subtype": AccountSubType.RENT,
                "description": "Rent and lease payments",
                "is_system": False
            },
            {
                "account_code": "5200",
                "account_name": "Utilities Expense",
                "account_type": AccountType.EXPENSE,
                "account_subtype": AccountSubType.UTILITIES,
                "description": "Electricity, water, internet, etc.",
                "is_system": False
            },
            {
                "account_code": "5300",
                "account_name": "Salaries & Wages",
                "account_type": AccountType.EXPENSE,
                "account_subtype": AccountSubType.SALARIES,
                "description": "Employee salaries and wages",
                "is_system": False
            },
            {
                "account_code": "5400",
                "account_name": "Supplies Expense",
                "account_type": AccountType.EXPENSE,
                "account_subtype": AccountSubType.SUPPLIES,
                "description": "Office and operational supplies",
                "is_system": False
            },
            {
                "account_code": "5500",
                "account_name": "Marketing & Advertising",
                "account_type": AccountType.EXPENSE,
                "account_subtype": AccountSubType.MARKETING,
                "description": "Marketing and advertising costs",
                "is_system": False
            },
            {
                "account_code": "5600",
                "account_name": "Maintenance & Repairs",
                "account_type": AccountType.EXPENSE,
                "account_subtype": AccountSubType.MAINTENANCE,
                "description": "Maintenance and repair costs",
                "is_system": False
            },
            {
                "account_code": "5700",
                "account_name": "Transportation",
                "account_type": AccountType.EXPENSE,
                "account_subtype": AccountSubType.TRANSPORTATION,
                "description": "Transportation and delivery costs",
                "is_system": False
            },
            {
                "account_code": "5800",
                "account_name": "Insurance",
                "account_type": AccountType.EXPENSE,
                "account_subtype": AccountSubType.INSURANCE,
                "description": "Insurance premiums",
                "is_system": False
            },
            {
                "account_code": "5900",
                "account_name": "Taxes",
                "account_type": AccountType.EXPENSE,
                "account_subtype": AccountSubType.TAXES,
                "description": "Business taxes",
                "is_system": False
            },
            {
                "account_code": "5999",
                "account_name": "Other Expenses",
                "account_type": AccountType.EXPENSE,
                "account_subtype": AccountSubType.OTHER_EXPENSES,
                "description": "Miscellaneous expenses",
                "is_system": False
            },
        ]
        
        # Create accounts
        created_count = 0
        for account_data in default_accounts:
            await Account.create(**account_data)
            created_count += 1
        
        logger.info(f"Successfully created {created_count} default accounts")
        return created_count
    
    except Exception as e:
        logger.error(f"Failed to initialize default accounts: {e}")
        raise
