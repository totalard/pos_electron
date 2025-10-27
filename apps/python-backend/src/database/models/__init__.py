"""
Database models package
"""
from .base import BaseModel
from .user import User, UserRole
from .user_activity import UserActivityLog, ActivityType
from .customer import Customer, CreditStatus
from .customer_transaction import CustomerTransaction, TransactionType as CustomerTransactionType
from .product import (
    Product,
    ProductCategory,
    ProductVariation,
    ProductBundle,
    ProductType,
    ItemType  # DEPRECATED - kept for backward compatibility
)
from .inventory import (
    StockTransaction,
    StockAdjustment,
    StockAdjustmentLine,
    TransactionType
)
from .settings import Settings  # DEPRECATED: Use Setting (singular) instead
from .setting import Setting, SettingDataType  # New normalized settings model
from .tax_rule import (
    TaxRule,
    TaxType,
    TaxCalculationMethod,
    TaxInclusionType,
    RoundingMethod
)
from .sale import Sale, PaymentMethod, SaleStatus
from .cash_transaction import CashTransaction, CashTransactionType
from .expense import Expense, ExpenseCategory, ExpenseStatus
from .discount import (
    Discount,
    DiscountUsage,
    DiscountType,
    DiscountConditionType,
    DiscountStatus
)
from .pos_session import POSSession, SessionStatus
from .account import Account, AccountType, AccountSubType
from .journal_entry import (
    JournalEntry,
    JournalEntryLine,
    JournalEntryStatus,
    JournalEntryType
)
from .purchase import Purchase, PurchaseStatus
from .fiscal_year import FiscalYear, FiscalYearStatus

__all__ = [
    "BaseModel",
    "User",
    "UserRole",
    "UserActivityLog",
    "ActivityType",
    "Customer",
    "CreditStatus",
    "CustomerTransaction",
    "CustomerTransactionType",
    "Product",
    "ProductCategory",
    "ProductVariation",
    "ProductBundle",
    "ProductType",
    "ItemType",  # DEPRECATED
    "StockTransaction",
    "StockAdjustment",
    "StockAdjustmentLine",
    "TransactionType",
    "Settings",  # DEPRECATED
    "Setting",  # New normalized model
    "SettingDataType",
    "TaxRule",
    "TaxType",
    "TaxCalculationMethod",
    "TaxInclusionType",
    "RoundingMethod",
    "Sale",
    "PaymentMethod",
    "SaleStatus",
    "CashTransaction",
    "CashTransactionType",
    "Expense",
    "ExpenseCategory",
    "ExpenseStatus",
    "Discount",
    "DiscountUsage",
    "DiscountType",
    "DiscountConditionType",
    "DiscountStatus",
    "POSSession",
    "SessionStatus",
    "Account",
    "AccountType",
    "AccountSubType",
    "JournalEntry",
    "JournalEntryLine",
    "JournalEntryStatus",
    "JournalEntryType",
    "Purchase",
    "PurchaseStatus",
    "FiscalYear",
    "FiscalYearStatus",
]

