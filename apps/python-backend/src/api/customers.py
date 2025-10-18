"""
Customer Management API endpoints
"""
import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Query
from tortoise.exceptions import DoesNotExist, IntegrityError

from ..database.models import Customer, User
from .schemas import (
    CustomerCreate,
    CustomerUpdate,
    CustomerResponse
)

logger = logging.getLogger(__name__)

# Create router
router = APIRouter()


# Helper function to convert Customer model to response
def customer_to_response(customer: Customer) -> CustomerResponse:
    """Convert Customer model to CustomerResponse schema"""
    return CustomerResponse(
        id=customer.id,
        name=customer.name,
        phone=customer.phone,
        email=customer.email,
        address=customer.address,
        loyalty_points=customer.loyalty_points,
        created_at=customer.created_at,
        updated_at=customer.updated_at
    )


@router.get("/", response_model=List[CustomerResponse])
async def get_all_customers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = None
):
    """
    Get all customers with optional filtering and pagination.

    - **skip**: Number of records to skip (for pagination)
    - **limit**: Maximum number of records to return
    - **search**: Search in name, phone, or email
    """
    query = Customer.all()

    # Apply search filter
    if search:
        query = query.filter(
            name__icontains=search
        ) | query.filter(
            phone__icontains=search
        ) | query.filter(
            email__icontains=search
        )

    # Apply pagination
    customers = await query.offset(skip).limit(limit).all()

    return [customer_to_response(customer) for customer in customers]


@router.get("/{customer_id}", response_model=CustomerResponse)
async def get_customer(customer_id: int):
    """Get a specific customer by ID"""
    try:
        customer = await Customer.get(id=customer_id)
        return customer_to_response(customer)
    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID {customer_id} not found"
        )


@router.post("/", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
async def create_customer(customer_data: CustomerCreate, created_by_id: int = 1):
    """
    Create a new customer.

    Note: In production, created_by_id should come from the authenticated session.
    """
    try:
        # Get the creator user
        creator = await User.get(id=created_by_id)

        # Create customer
        customer = await Customer.create(
            name=customer_data.name,
            phone=customer_data.phone,
            email=customer_data.email,
            address=customer_data.address,
            loyalty_points=customer_data.loyalty_points,
            created_by=creator
        )

        logger.info(f"Created customer: {customer.name} (ID: {customer.id})")
        return customer_to_response(customer)

    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {created_by_id} not found"
        )
    except IntegrityError as e:
        logger.error(f"Failed to create customer: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create customer. Please check the data."
        )


@router.put("/{customer_id}", response_model=CustomerResponse)
async def update_customer(customer_id: int, customer_data: CustomerUpdate):
    """
    Update an existing customer.

    Only provided fields will be updated.
    """
    try:
        customer = await Customer.get(id=customer_id)

        # Update only provided fields
        update_data = customer_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(customer, field, value)

        await customer.save()

        logger.info(f"Updated customer: {customer.name} (ID: {customer.id})")
        return customer_to_response(customer)

    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID {customer_id} not found"
        )
    except IntegrityError as e:
        logger.error(f"Failed to update customer: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update customer. Please check the data."
        )


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_customer(customer_id: int):
    """
    Delete a customer.

    This is a hard delete and cannot be undone.
    """
    try:
        customer = await Customer.get(id=customer_id)
        customer_name = customer.name

        await customer.delete()

        logger.info(f"Deleted customer: {customer_name} (ID: {customer_id})")

    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID {customer_id} not found"
        )


@router.post("/{customer_id}/loyalty-points", response_model=CustomerResponse)
async def add_loyalty_points(customer_id: int, points: int = Query(..., ge=0)):
    """
    Add loyalty points to a customer.

    - **points**: Number of points to add (must be non-negative)
    """
    try:
        customer = await Customer.get(id=customer_id)
        customer.loyalty_points += points
        await customer.save()

        logger.info(f"Added {points} loyalty points to customer: {customer.name} (ID: {customer.id})")
        return customer_to_response(customer)

    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID {customer_id} not found"
        )


@router.post("/{customer_id}/redeem-points", response_model=CustomerResponse)
async def redeem_loyalty_points(customer_id: int, points: int = Query(..., ge=0)):
    """
    Redeem loyalty points from a customer.

    - **points**: Number of points to redeem (must be non-negative and not exceed available points)
    """
    try:
        customer = await Customer.get(id=customer_id)

        if customer.loyalty_points < points:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient loyalty points. Available: {customer.loyalty_points}, Requested: {points}"
            )

        customer.loyalty_points -= points
        await customer.save()

        logger.info(f"Redeemed {points} loyalty points from customer: {customer.name} (ID: {customer.id})")
        return customer_to_response(customer)

    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID {customer_id} not found"
        )

