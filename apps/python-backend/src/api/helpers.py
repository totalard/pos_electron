"""
Helper functions for API endpoints
"""
from ..database.models import User, Product, StockTransaction, Settings
from .schemas import (
    UserResponse,
    ProductResponse,
    StockTransactionResponse,
    SettingsResponse,
    GeneralSettings,
    BusinessSettings,
    TaxSettings,
    HardwareSettings,
    ReceiptSettings,
    InventorySettings,
    IntegrationSettings,
    BackupSettings,
    DisplaySettings,
    SecuritySettings,
    SystemInfo
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


def settings_to_response(settings: Settings) -> SettingsResponse:
    """Convert Settings model to SettingsResponse schema"""
    return SettingsResponse(
        id=settings.id,
        general=GeneralSettings(**settings.general_settings),
        business=BusinessSettings(**settings.business_settings),
        taxes=TaxSettings(**settings.tax_settings),
        hardware=HardwareSettings(**settings.hardware_settings),
        receipts=ReceiptSettings(**settings.receipt_settings),
        inventory=InventorySettings(**settings.inventory_settings),
        integration=IntegrationSettings(**settings.integration_settings),
        backup=BackupSettings(**settings.backup_settings),
        display=DisplaySettings(**settings.display_settings),
        security=SecuritySettings(**settings.security_settings),
        about=SystemInfo(**settings.system_info),
        created_at=settings.created_at,
        updated_at=settings.updated_at
    )
