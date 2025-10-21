"""
Customer Management API endpoints
"""
import logging
from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Query
from tortoise.exceptions import DoesNotExist, IntegrityError

from ..database.models import Customer, User, CustomerTransaction, CustomerTransactionType
from .schemas import (
    CustomerCreate,
    CustomerUpdate,
    CustomerResponse,
    CustomerCreditOperation,
    CustomerLoyaltyOperation,
    CustomerTransactionResponse,
    CustomerStatementRequest,
    CustomerStatementResponse
)

logger = logging.getLogger(__name__)

# Create router
router = APIRouter()


# Helper functions
def customer_to_response(customer: Customer) -> CustomerResponse:
    """Convert Customer model to CustomerResponse schema"""
    return CustomerResponse(
        id=customer.id,
        name=customer.name,
        phone=customer.phone,
        email=customer.email,
        address=customer.address,
        loyalty_points=customer.loyalty_points,
        credit_limit=float(customer.credit_limit),
        credit_balance=float(customer.credit_balance),
        credit_status=customer.credit_status,
        created_at=customer.created_at,
        updated_at=customer.updated_at
    )


def transaction_to_response(transaction: CustomerTransaction) -> CustomerTransactionResponse:
    """Convert CustomerTransaction model to CustomerTransactionResponse schema"""
    return CustomerTransactionResponse(
        id=transaction.id,
        customer_id=transaction.customer_id,
        transaction_type=transaction.transaction_type,
        amount=float(transaction.amount),
        loyalty_points=transaction.loyalty_points,
        balance_before=float(transaction.balance_before),
        balance_after=float(transaction.balance_after),
        loyalty_points_before=transaction.loyalty_points_before,
        loyalty_points_after=transaction.loyalty_points_after,
        reference_number=transaction.reference_number,
        notes=transaction.notes,
        created_at=transaction.created_at,
        created_by_id=transaction.created_by_id
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


# ============================================================================
# Credit Management Endpoints
# ============================================================================

@router.post("/{customer_id}/credit/add", response_model=CustomerResponse)
async def add_credit(customer_id: int, operation: CustomerCreditOperation, created_by_id: int = 1):
    """
    Add credit to a customer (customer makes a purchase on credit).

    This increases the customer's credit balance.
    """
    try:
        customer = await Customer.get(id=customer_id)
        creator = await User.get(id=created_by_id)

        # Record balance before
        balance_before = customer.credit_balance

        # Add to credit balance
        customer.credit_balance += Decimal(str(operation.amount))

        # Update credit status
        customer.update_credit_status()
        await customer.save()

        # Create transaction record
        await CustomerTransaction.create(
            customer=customer,
            transaction_type=CustomerTransactionType.CREDIT_SALE,
            amount=Decimal(str(operation.amount)),
            balance_before=balance_before,
            balance_after=customer.credit_balance,
            loyalty_points_before=customer.loyalty_points,
            loyalty_points_after=customer.loyalty_points,
            reference_number=operation.reference_number,
            notes=operation.notes,
            created_by=creator
        )

        logger.info(f"Added credit of {operation.amount} to customer: {customer.name} (ID: {customer.id})")
        return customer_to_response(customer)

    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer or User not found"
        )


@router.post("/{customer_id}/credit/payment", response_model=CustomerResponse)
async def record_payment(customer_id: int, operation: CustomerCreditOperation, created_by_id: int = 1):
    """
    Record a payment from a customer (reduces credit balance).
    """
    try:
        customer = await Customer.get(id=customer_id)
        creator = await User.get(id=created_by_id)

        # Record balance before
        balance_before = customer.credit_balance

        # Subtract from credit balance
        customer.credit_balance -= Decimal(str(operation.amount))

        # Ensure balance doesn't go negative
        if customer.credit_balance < 0:
            customer.credit_balance = Decimal('0.00')

        # Update credit status
        customer.update_credit_status()
        await customer.save()

        # Create transaction record
        await CustomerTransaction.create(
            customer=customer,
            transaction_type=CustomerTransactionType.PAYMENT,
            amount=Decimal(str(operation.amount)),
            balance_before=balance_before,
            balance_after=customer.credit_balance,
            loyalty_points_before=customer.loyalty_points,
            loyalty_points_after=customer.loyalty_points,
            reference_number=operation.reference_number,
            notes=operation.notes,
            created_by=creator
        )

        logger.info(f"Recorded payment of {operation.amount} from customer: {customer.name} (ID: {customer.id})")
        return customer_to_response(customer)

    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer or User not found"
        )


@router.put("/{customer_id}/credit/limit", response_model=CustomerResponse)
async def update_credit_limit(customer_id: int, limit: float = Query(..., ge=0)):
    """
    Update customer's credit limit.
    """
    try:
        customer = await Customer.get(id=customer_id)
        customer.credit_limit = Decimal(str(limit))
        customer.update_credit_status()
        await customer.save()

        logger.info(f"Updated credit limit to {limit} for customer: {customer.name} (ID: {customer.id})")
        return customer_to_response(customer)

    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID {customer_id} not found"
        )


# ============================================================================
# Transaction History Endpoints
# ============================================================================

@router.get("/{customer_id}/transactions", response_model=List[CustomerTransactionResponse])
async def get_customer_transactions(
    customer_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    transaction_type: Optional[str] = None
):
    """
    Get transaction history for a customer.
    """
    try:
        customer = await Customer.get(id=customer_id)

        query = CustomerTransaction.filter(customer=customer)

        if transaction_type:
            query = query.filter(transaction_type=transaction_type)

        transactions = await query.offset(skip).limit(limit).all()

        return [transaction_to_response(t) for t in transactions]

    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID {customer_id} not found"
        )


@router.post("/{customer_id}/statement", response_model=CustomerStatementResponse)
async def generate_statement(customer_id: int, request: CustomerStatementRequest):
    """
    Generate a customer statement for a date range.
    """
    try:
        customer = await Customer.get(id=customer_id)

        # Build query
        query = CustomerTransaction.filter(customer=customer)

        # Apply date filters
        if request.start_date:
            query = query.filter(created_at__gte=request.start_date)
        if request.end_date:
            query = query.filter(created_at__lte=request.end_date)

        transactions = await query.all()

        # Calculate totals
        total_credits = sum(
            float(t.amount) for t in transactions
            if t.transaction_type == CustomerTransactionType.CREDIT_SALE
        )
        total_payments = sum(
            float(t.amount) for t in transactions
            if t.transaction_type == CustomerTransactionType.PAYMENT
        )

        # Get opening balance (balance before first transaction in period)
        opening_balance = float(transactions[0].balance_before) if transactions else float(customer.credit_balance)
        closing_balance = float(customer.credit_balance)

        return CustomerStatementResponse(
            customer=customer_to_response(customer),
            transactions=[transaction_to_response(t) for t in transactions],
            opening_balance=opening_balance,
            closing_balance=closing_balance,
            total_credits=total_credits,
            total_payments=total_payments,
            statement_period={
                "start_date": request.start_date,
                "end_date": request.end_date
            }
        )

    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID {customer_id} not found"
        )


# ============================================================================
# Loyalty Management Endpoints
# ============================================================================

@router.post("/{customer_id}/loyalty/adjust", response_model=CustomerResponse)
async def adjust_loyalty_points(customer_id: int, operation: CustomerLoyaltyOperation, created_by_id: int = 1):
    """
    Adjust loyalty points (add or redeem).

    Use positive values to add points, negative values to redeem.
    """
    try:
        customer = await Customer.get(id=customer_id)
        creator = await User.get(id=created_by_id)

        # Record points before
        points_before = customer.loyalty_points

        # Adjust points
        customer.loyalty_points += operation.points

        # Ensure points don't go negative
        if customer.loyalty_points < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient loyalty points. Available: {points_before}, Requested: {abs(operation.points)}"
            )

        await customer.save()

        # Determine transaction type
        if operation.points > 0:
            transaction_type = CustomerTransactionType.LOYALTY_EARNED
        elif operation.points < 0:
            transaction_type = CustomerTransactionType.LOYALTY_REDEEMED
        else:
            transaction_type = CustomerTransactionType.LOYALTY_ADJUSTMENT

        # Create transaction record
        await CustomerTransaction.create(
            customer=customer,
            transaction_type=transaction_type,
            loyalty_points=operation.points,
            balance_before=customer.credit_balance,
            balance_after=customer.credit_balance,
            loyalty_points_before=points_before,
            loyalty_points_after=customer.loyalty_points,
            notes=operation.notes,
            created_by=creator
        )

        logger.info(f"Adjusted loyalty points by {operation.points} for customer: {customer.name} (ID: {customer.id})")
        return customer_to_response(customer)

    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer or User not found"
        )

