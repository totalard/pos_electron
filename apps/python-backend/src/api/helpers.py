"""
Helper functions for API endpoints
"""
from ..database.models import (
    User,
    Product,
    ProductCategory,
    ProductVariation,
    ProductBundle,
    StockTransaction,
    Setting
)
from .schemas import (
    UserResponse,
    ProductResponse,
    ProductCategoryResponse,
    ProductVariationResponse,
    ProductBundleComponentResponse,
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
    # Handle category - it might be a ForeignKey or None
    category_value = None
    category_id = None
    category_name = None
    
    if hasattr(product, 'category_id') and product.category_id:
        category_id = product.category_id
        # If category is loaded, use its value and name
        if hasattr(product, 'category') and hasattr(product.category, 'value'):
            category_value = product.category.value
            category_name = product.category.name if hasattr(product.category, 'name') else None
        else:
            # Fallback to category_id if category object not loaded
            category_value = str(product.category_id)
    
    item_type_value = product.item_type.value if hasattr(product.item_type, 'value') else str(product.item_type)
    
    return ProductResponse(
        # Primary fields
        id=product.id,
        name=product.name,
        sku=product.sku,
        barcode=product.barcode,
        description=product.description,
        
        # New schema fields (required)
        product_type=item_type_value,
        category_id=category_id,
        category_name=category_name,
        base_price=float(product.selling_price),  # Map selling_price to base_price
        cost_price=float(product.cost_price),
        tax_id=None,  # Not implemented yet
        tax_name=None,  # Not implemented yet
        is_active=product.is_active,
        track_inventory=product.track_inventory,
        stock_quantity=product.current_stock,
        low_stock_threshold=product.min_stock_level if product.min_stock_level else 0,
        max_stock_level=product.max_stock_level if product.max_stock_level else 0,
        image_paths=[product.image_url] if product.image_url else [],
        notes=product.notes,
        created_at=product.created_at,
        updated_at=product.updated_at,
        
        # Backward compatibility fields
        item_type=item_type_value,
        category=category_value,
        selling_price=float(product.selling_price),
        tax_rate=float(product.tax_rate),
        current_stock=product.current_stock,
        min_stock_level=product.min_stock_level if product.min_stock_level else 0,
        image_url=product.image_url
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
