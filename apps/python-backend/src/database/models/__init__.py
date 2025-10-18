"""
Database models package
"""
from .base import BaseModel
from .user import User, UserRole
from .customer import Customer
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

__all__ = [
    "BaseModel",
    "User",
    "UserRole",
    "Customer",
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
]

