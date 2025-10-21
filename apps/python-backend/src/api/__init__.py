"""
API routes module
"""
from fastapi import APIRouter
from .auth import router as auth_router
from .customers import router as customers_router
from .user_activity import router as user_activity_router
from .products import router as products_router
from .product_management import router as product_management_router
from .settings import router as settings_router
from .tax_rules import router as tax_rules_router
from .demo import router as demo_router
from .transactions import router as transactions_router
from .discounts import router as discounts_router

# Create main API router
router = APIRouter()

# Include sub-routers
router.include_router(auth_router, prefix="/auth", tags=["authentication"])
router.include_router(customers_router, prefix="/customers", tags=["customers"])
router.include_router(user_activity_router, prefix="/user-activity", tags=["user-activity"])
router.include_router(products_router, prefix="/products", tags=["products"])  # Legacy endpoints
router.include_router(product_management_router, prefix="/product-management", tags=["product-management"])  # New comprehensive endpoints
router.include_router(settings_router, prefix="/settings", tags=["settings"])
router.include_router(tax_rules_router)
router.include_router(transactions_router, prefix="/transactions", tags=["transactions"])
router.include_router(discounts_router, prefix="/discounts", tags=["discounts"])
router.include_router(demo_router, prefix="/demo", tags=["demo"])