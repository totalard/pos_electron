"""
Products API endpoints
"""
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


class Product(BaseModel):
    """Product model"""
    id: int
    name: str
    price: float
    description: Optional[str] = None
    stock: int = 0


# Mock data for demonstration
PRODUCTS_DB = [
    Product(id=1, name="Product 1", price=19.99, description="Sample product 1", stock=100),
    Product(id=2, name="Product 2", price=29.99, description="Sample product 2", stock=50),
    Product(id=3, name="Product 3", price=39.99, description="Sample product 3", stock=75),
]


@router.get("/", response_model=List[Product])
async def get_products():
    """Get all products"""
    return PRODUCTS_DB


@router.get("/{product_id}", response_model=Product)
async def get_product(product_id: int):
    """Get a specific product by ID"""
    for product in PRODUCTS_DB:
        if product.id == product_id:
            return product
    raise HTTPException(status_code=404, detail="Product not found")


@router.post("/", response_model=Product)
async def create_product(product: Product):
    """Create a new product"""
    PRODUCTS_DB.append(product)
    return product


@router.put("/{product_id}", response_model=Product)
async def update_product(product_id: int, updated_product: Product):
    """Update an existing product"""
    for idx, product in enumerate(PRODUCTS_DB):
        if product.id == product_id:
            PRODUCTS_DB[idx] = updated_product
            return updated_product
    raise HTTPException(status_code=404, detail="Product not found")


@router.delete("/{product_id}")
async def delete_product(product_id: int):
    """Delete a product"""
    for idx, product in enumerate(PRODUCTS_DB):
        if product.id == product_id:
            PRODUCTS_DB.pop(idx)
            return {"message": "Product deleted successfully"}
    raise HTTPException(status_code=404, detail="Product not found")
