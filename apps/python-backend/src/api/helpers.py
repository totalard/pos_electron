"""
Helper functions for API endpoints
"""
from ..database.models import User, Product, StockTransaction, Setting
from .schemas import (
    UserResponse,
    ProductResponse,
    StockTransactionResponse,
    SettingItemResponse
)


def user_to_response(user: User) -> UserResponse:
    """Convert User model to UserResponse schema"""
    return UserResponse(
        id=user.id,
        full_name=user.full_name,
        mobile_number=user.mobile_number,
        email=user.email,
        avatar_color=user.avatar_color,
        role=user.role.value,
        is_active=user.is_active,
        notes=user.notes,
        last_login=user.last_login,
        created_at=user.created_at,
        updated_at=user.updated_at
    )


def product_to_response(product: Product) -> ProductResponse:
    """Convert Product model to ProductResponse schema"""
    return ProductResponse(
        id=product.id,
        name=product.name,
        sku=product.sku,
        barcode=product.barcode,
        description=product.description,
        item_type=product.item_type.value,
        category=product.category.value,
        cost_price=float(product.cost_price),
        selling_price=float(product.selling_price),
        tax_rate=float(product.tax_rate),
        track_inventory=product.track_inventory,
        current_stock=product.current_stock,
        min_stock_level=product.min_stock_level,
        max_stock_level=product.max_stock_level,
        is_active=product.is_active,
        image_url=product.image_url,
        notes=product.notes,
        created_at=product.created_at,
        updated_at=product.updated_at
    )


def stock_transaction_to_response(transaction: StockTransaction) -> StockTransactionResponse:
    """Convert StockTransaction model to StockTransactionResponse schema"""
    return StockTransactionResponse(
        id=transaction.id,
        transaction_type=transaction.transaction_type.value,
        product_id=transaction.product_id,
        quantity=transaction.quantity,
        stock_before=transaction.stock_before,
        stock_after=transaction.stock_after,
        unit_cost=float(transaction.unit_cost) if transaction.unit_cost else None,
        total_cost=float(transaction.total_cost) if transaction.total_cost else None,
        reference_number=transaction.reference_number,
        notes=transaction.notes,
        created_at=transaction.created_at
    )


def setting_to_response(setting: Setting) -> SettingItemResponse:
    """
    Convert Setting model to SettingItemResponse schema.

    Note: The main settings endpoints in settings.py handle aggregation
    of Setting rows into the old SettingsResponse format for backward compatibility.
    This helper is for the new granular endpoints.
    """
    return SettingItemResponse(
        id=setting.id,
        section=setting.section,
        key=setting.key,
        value=setting.value,
        default_value=setting.default_value,
        data_type=setting.data_type.value,
        description=setting.description,
        created_at=setting.created_at,
        updated_at=setting.updated_at
    )
