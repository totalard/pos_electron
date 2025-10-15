"""
API routes module
"""
from fastapi import APIRouter
from .auth import router as auth_router
from .products import router as products_router
from .enhanced_products import router as enhanced_products_router
from .settings import router as settings_router

# Create main API router
router = APIRouter()

# Include sub-routers
router.include_router(auth_router, prefix="/auth", tags=["authentication"])
router.include_router(products_router, prefix="/products", tags=["products"])
router.include_router(enhanced_products_router, tags=["enhanced-products"])
router.include_router(settings_router, tags=["settings"])