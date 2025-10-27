"""
Products and Inventory API endpoints
"""
import logging
from typing import List, Optional
from decimal import Decimal
from fastapi import APIRouter, HTTPException, status, Query
from tortoise.exceptions import DoesNotExist, IntegrityError

from ..database.models import (
    Product,
    StockTransaction,
    StockAdjustment,
    StockAdjustmentLine,
    TransactionType,
    User
)
from .schemas import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    StockTransactionCreate,
    StockTransactionResponse,
    StockAdjustmentCreate,
    StockAdjustmentResponse,
    StockAdjustmentLineResponse
)
from .helpers import product_to_response, stock_transaction_to_response

router = APIRouter()
logger = logging.getLogger(__name__)


# ============================================================================
# Stock Transaction Endpoints (MUST come before /{product_id} route)
# ============================================================================

@router.post("/stock-transactions", response_model=StockTransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_stock_transaction(transaction_data: StockTransactionCreate, performed_by_id: int = 1):
    """
    Create a new stock transaction.

    This endpoint handles all types of stock movements including purchases,
    sales, adjustments, returns, damages, and transfers.
    """
    try:
        # Get the product
        product = await Product.get(id=transaction_data.product_id)

        # Check if product tracks inventory
        if not product.track_inventory:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This product does not track inventory"
            )

        # Get the user performing the transaction
        user = await User.get(id=performed_by_id)

        # Calculate stock changes
        stock_before = product.current_stock
        stock_after = stock_before + transaction_data.quantity

        # Validate stock levels
        if stock_after < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock. Current stock: {stock_before}, Requested: {abs(transaction_data.quantity)}"
            )

        # Calculate total cost
        unit_cost = transaction_data.unit_cost if transaction_data.unit_cost is not None else product.cost_price
        total_cost = Decimal(str(unit_cost)) * abs(transaction_data.quantity)

        # Create transaction
        transaction = await StockTransaction.create(
            transaction_type=transaction_data.transaction_type,
            product=product,
            quantity=transaction_data.quantity,
            stock_before=stock_before,
            stock_after=stock_after,
            unit_cost=Decimal(str(unit_cost)),
            total_cost=total_cost,
            reference_number=transaction_data.reference_number,
            notes=transaction_data.notes,
            performed_by=user
        )

        # Update product stock
        product.current_stock = stock_after
        await product.save()

        logger.info(f"Stock transaction created: {transaction.id} for product {product.name}")

        return stock_transaction_to_response(transaction)

    except DoesNotExist as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product or User not found: {str(e)}"
        )


@router.get("/stock-transactions", response_model=List[StockTransactionResponse])
async def get_stock_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    product_id: Optional[int] = None,
    transaction_type: Optional[str] = None
):
    """
    Get stock transactions with optional filtering.
    """
    query = StockTransaction.all()

    if product_id:
        query = query.filter(product_id=product_id)

    if transaction_type:
        query = query.filter(transaction_type=transaction_type)

    transactions = await query.offset(skip).limit(limit).all()

    return [stock_transaction_to_response(t) for t in transactions]


# ============================================================================
# Stock Adjustment Endpoints (MUST come before /{product_id} route)
# ============================================================================

@router.post("/stock-adjustments", response_model=StockAdjustmentResponse, status_code=status.HTTP_201_CREATED)
async def create_stock_adjustment(adjustment_data: StockAdjustmentCreate, performed_by_id: int = 1):
    """
    Create a bulk stock adjustment with multiple line items.

    This is useful for physical inventory counts or bulk updates.
    """
    try:
        # Get the user performing the adjustment
        user = await User.get(id=performed_by_id)

        # Create the adjustment header
        adjustment = await StockAdjustment.create(
            reason=adjustment_data.reason,
            notes=adjustment_data.notes,
            performed_by=user,
            is_completed=False
        )

        # Create adjustment lines and update stock
        lines = []
        for line_data in adjustment_data.lines:
            # Get the product
            product = await Product.get(id=line_data.product_id)

            # Calculate difference
            difference = line_data.actual_quantity - line_data.expected_quantity

            # Create adjustment line
            line = await StockAdjustmentLine.create(
                adjustment=adjustment,
                product=product,
                expected_quantity=line_data.expected_quantity,
                actual_quantity=line_data.actual_quantity,
                difference=difference,
                notes=line_data.notes
            )

            # Update product stock
            product.current_stock = line_data.actual_quantity
            await product.save()

            # Create corresponding stock transaction
            await StockTransaction.create(
                transaction_type=TransactionType.ADJUSTMENT,
                product=product,
                quantity=difference,
                stock_before=line_data.expected_quantity,
                stock_after=line_data.actual_quantity,
                reference_number=f"ADJ-{adjustment.id}",
                notes=f"Stock adjustment: {adjustment_data.reason}",
                performed_by=user
            )

            lines.append(line)

        # Mark adjustment as completed
        adjustment.is_completed = True
        await adjustment.save()

        logger.info(f"Stock adjustment created: {adjustment.id} with {len(lines)} lines")

        # Fetch the adjustment with lines for response
        adjustment_with_lines = await StockAdjustment.get(id=adjustment.id).prefetch_related('lines')

        return StockAdjustmentResponse(
            id=adjustment_with_lines.id,
            adjustment_date=adjustment_with_lines.adjustment_date,
            reason=adjustment_with_lines.reason,
            notes=adjustment_with_lines.notes,
            is_completed=adjustment_with_lines.is_completed,
            created_at=adjustment_with_lines.created_at,
            lines=[
                StockAdjustmentLineResponse(
                    id=line.id,
                    product_id=line.product_id,
                    expected_quantity=line.expected_quantity,
                    actual_quantity=line.actual_quantity,
                    difference=line.difference,
                    notes=line.notes
                )
                for line in lines
            ]
        )

    except DoesNotExist as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product or User not found: {str(e)}"
        )


@router.get("/stock-adjustments", response_model=List[StockAdjustmentResponse])
async def get_stock_adjustments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    """
    Get all stock adjustments with their line items.
    """
    adjustments = await StockAdjustment.all().offset(skip).limit(limit).prefetch_related('lines')

    result = []
    for adjustment in adjustments:
        lines = await StockAdjustmentLine.filter(adjustment_id=adjustment.id).all()

        result.append(StockAdjustmentResponse(
            id=adjustment.id,
            adjustment_date=adjustment.adjustment_date,
            reason=adjustment.reason,
            notes=adjustment.notes,
            is_completed=adjustment.is_completed,
            created_at=adjustment.created_at,
            lines=[
                StockAdjustmentLineResponse(
                    id=line.id,
                    product_id=line.product_id,
                    expected_quantity=line.expected_quantity,
                    actual_quantity=line.actual_quantity,
                    difference=line.difference,
                    notes=line.notes
                )
                for line in lines
            ]
        ))

    return result


# ============================================================================
# Product Endpoints
# ============================================================================

@router.get("/", response_model=List[ProductResponse])
async def get_all_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    is_active: Optional[bool] = None,
    item_type: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None
):
    """
    Get all products with optional filtering and pagination.

    - **skip**: Number of records to skip (for pagination)
    - **limit**: Maximum number of records to return
    - **is_active**: Filter by active status
    - **item_type**: Filter by item type (product/service)
    - **category**: Filter by category
    - **search**: Search in name, SKU, or barcode
    """
    query = Product.all()

    # Apply filters
    if is_active is not None:
        query = query.filter(is_active=is_active)

    if item_type:
        query = query.filter(item_type=item_type)

    if category:
        query = query.filter(category=category)

    if search:
        query = query.filter(
            name__icontains=search
        ) | query.filter(
            sku__icontains=search
        ) | query.filter(
            barcode__icontains=search
        )

    # Apply pagination
    products = await query.offset(skip).limit(limit).all()

    return [product_to_response(product) for product in products]


@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(product_data: ProductCreate, created_by_id: int = 1):
    """
    Create a new product or service.

    Note: In production, created_by_id should come from the authenticated session.
    """
    try:
        # Get the creator user
        creator = await User.get(id=created_by_id)

        # Create product
        new_product = await Product.create(
            name=product_data.name,
            sku=product_data.sku,
            barcode=product_data.barcode,
            description=product_data.description,
            item_type=product_data.item_type,
            category=product_data.category,
            cost_price=Decimal(str(product_data.cost_price)),
            selling_price=Decimal(str(product_data.selling_price)),
            tax_rate=Decimal(str(product_data.tax_rate)),
            track_inventory=product_data.track_inventory,
            current_stock=product_data.current_stock,
            min_stock_level=product_data.min_stock_level,
            max_stock_level=product_data.max_stock_level,
            is_active=product_data.is_active,
            image_url=product_data.image_url,
            notes=product_data.notes,
            created_by=creator
        )

        logger.info(f"New product created: {new_product.name} (ID: {new_product.id})")

        return product_to_response(new_product)

    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Creator user with ID {created_by_id} not found"
        )
    except IntegrityError as e:
        logger.error(f"Failed to create product: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create product. SKU or barcode may already exist."
        )


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int):
    """Get a specific product by ID"""
    try:
        product = await Product.get(id=product_id)
        return product_to_response(product)
    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found"
        )


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(product_id: int, product_data: ProductUpdate):
    """Update product information"""
    try:
        product = await Product.get(id=product_id)

        # Update only provided fields
        update_data = product_data.model_dump(exclude_unset=True)

        # Convert float to Decimal for price fields
        for field in ['cost_price', 'selling_price', 'tax_rate']:
            if field in update_data and update_data[field] is not None:
                update_data[field] = Decimal(str(update_data[field]))

        for field, value in update_data.items():
            setattr(product, field, value)

        await product.save()

        logger.info(f"Product {product_id} updated successfully")

        return product_to_response(product)

    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found"
        )
    except IntegrityError as e:
        logger.error(f"Failed to update product: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update product. SKU or barcode may already exist."
        )


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: int):
    """
    Delete a product (soft delete by setting is_active to False).
    """
    try:
        product = await Product.get(id=product_id)

        # Soft delete
        product.is_active = False
        await product.save()

        logger.info(f"Product {product_id} deactivated")

        return None

    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found"
        )
