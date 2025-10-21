"""
Demo data API endpoints.
"""
import logging
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from ..database.demo_data import generate_all_demo_data, clear_demo_data

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/demo", tags=["demo"])


class DemoDataResponse(BaseModel):
    """Response model for demo data generation."""
    success: bool
    message: str
    data: dict


@router.post("/generate", response_model=DemoDataResponse)
async def generate_demo_data():
    """
    Generate comprehensive demo data.
    
    Creates:
    - Product categories (hierarchical)
    - Products of all types (simple, variation, bundle, service)
    - Customers
    - Stock transactions
    - Stock adjustments
    
    **Warning**: This will create a lot of data. Use only in development/demo environments.
    """
    try:
        logger.info("Starting demo data generation...")
        result = await generate_all_demo_data()
        
        return DemoDataResponse(
            success=True,
            message="Demo data generated successfully",
            data=result
        )
    except Exception as e:
        logger.error(f"Failed to generate demo data: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate demo data: {str(e)}"
        )


@router.delete("/clear", response_model=DemoDataResponse)
async def clear_all_demo_data():
    """
    Clear all demo data.
    
    **Warning**: This will delete ALL products, categories, customers, and transactions.
    Use with extreme caution!
    """
    try:
        logger.warning("Clearing all demo data...")
        await clear_demo_data()
        
        return DemoDataResponse(
            success=True,
            message="Demo data cleared successfully",
            data={}
        )
    except Exception as e:
        logger.error(f"Failed to clear demo data: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear demo data: {str(e)}"
        )


@router.get("/status")
async def get_demo_status():
    """
    Check if demo data exists.
    """
    from ..database.models import Product, Customer, StockTransaction
    
    try:
        product_count = await Product.all().count()
        customer_count = await Customer.all().count()
        transaction_count = await StockTransaction.all().count()
        
        return {
            "has_demo_data": product_count > 0,
            "products": product_count,
            "customers": customer_count,
            "transactions": transaction_count
        }
    except Exception as e:
        logger.error(f"Failed to check demo status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check demo status: {str(e)}"
        )
