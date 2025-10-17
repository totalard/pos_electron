"""
API routes module
"""
from fastapi import APIRouter
from .auth import router as auth_router
from .products import router as products_router
from .settings import router as settings_router
from .tax_rules import router as tax_rules_router

# Create main API router
router = APIRouter()

# Include sub-routers
router.include_router(auth_router, prefix="/auth", tags=["authentication"])
router.include_router(products_router, prefix="/products", tags=["products"])
router.include_router(settings_router, prefix="/settings", tags=["settings"])
router.include_router(tax_rules_router)