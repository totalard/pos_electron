"""
API routes module
"""
from fastapi import APIRouter
from .products import router as products_router

# Create main API router
router = APIRouter()

# Include sub-routers
router.include_router(products_router, prefix="/products", tags=["products"])