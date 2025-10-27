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
    transaction_type: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    reference_number: Optional[str] = None,
    search: Optional[str] = None
):
    """
    Get stock transactions with comprehensive filtering.
    
    - **product_id**: Filter by specific product
    - **transaction_type**: Filter by transaction type (purchase, sale, adjustment, etc.)
    - **start_date**: Filter transactions from this date (ISO format)
    - **end_date**: Filter transactions until this date (ISO format)
    - **reference_number**: Filter by reference number
    - **search**: Search in reference number or notes
    """
    from datetime import datetime
    
    query = StockTransaction.all()

    if product_id:
        query = query.filter(product_id=product_id)

    if transaction_type:
        query = query.filter(transaction_type=transaction_type)
    
    if start_date:
        query = query.filter(created_at__gte=datetime.fromisoformat(start_date))
    
    if end_date:
        query = query.filter(created_at__lte=datetime.fromisoformat(end_date))
    
    if reference_number:
        query = query.filter(reference_number__icontains=reference_number)
    
    if search:
        # Search in reference_number and notes
        query = query.filter(
            reference_number__icontains=search
        ) | query.filter(
            notes__icontains=search
        )

    transactions = await query.order_by('-created_at').offset(skip).limit(limit).all()

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


# ============================================================================
# Inventory Reports & Analytics Endpoints
# ============================================================================

@router.get("/inventory/low-stock", response_model=List[ProductResponse])
async def get_low_stock_products(
    threshold_type: str = Query('absolute', regex='^(absolute|percentage)$'),
    threshold_value: Optional[int] = None
):
    """
    Get products with low stock levels.
    
    - **threshold_type**: 'absolute' or 'percentage'
    - **threshold_value**: Override default threshold
    """
    query = Product.filter(is_active=True, track_inventory=True)
    products = await query.all()
    
    low_stock_products = []
    for product in products:
        if threshold_type == 'absolute':
            threshold = threshold_value if threshold_value is not None else product.min_stock_level
            if product.current_stock <= threshold:
                low_stock_products.append(product)
        else:  # percentage
            threshold = threshold_value if threshold_value is not None else 20
            if product.min_stock_level > 0:
                percentage = (product.current_stock / product.min_stock_level) * 100
                if percentage <= threshold:
                    low_stock_products.append(product)
    
    return [product_to_response(p) for p in low_stock_products]


@router.get("/inventory/out-of-stock", response_model=List[ProductResponse])
async def get_out_of_stock_products():
    """Get all products that are completely out of stock."""
    products = await Product.filter(
        is_active=True,
        track_inventory=True,
        current_stock=0
    ).all()
    
    return [product_to_response(p) for p in products]


@router.get("/inventory/valuation")
async def get_inventory_valuation():
    """
    Get total inventory valuation and breakdown by category.
    
    Returns total stock value, cost breakdown, and potential profit.
    """
    products = await Product.filter(is_active=True, track_inventory=True).all()
    
    total_cost_value = Decimal('0')
    total_selling_value = Decimal('0')
    category_breakdown = {}
    
    for product in products:
        cost_value = Decimal(str(product.cost_price or 0)) * product.current_stock
        selling_value = Decimal(str(product.selling_price or 0)) * product.current_stock
        
        total_cost_value += cost_value
        total_selling_value += selling_value
        
        category = product.category or 'Uncategorized'
        if category not in category_breakdown:
            category_breakdown[category] = {
                'cost_value': Decimal('0'),
                'selling_value': Decimal('0'),
                'quantity': 0,
                'products': 0
            }
        
        category_breakdown[category]['cost_value'] += cost_value
        category_breakdown[category]['selling_value'] += selling_value
        category_breakdown[category]['quantity'] += product.current_stock
        category_breakdown[category]['products'] += 1
    
    return {
        'total_cost_value': float(total_cost_value),
        'total_selling_value': float(total_selling_value),
        'potential_profit': float(total_selling_value - total_cost_value),
        'profit_margin_percentage': float((total_selling_value - total_cost_value) / total_selling_value * 100) if total_selling_value > 0 else 0,
        'total_products': len(products),
        'total_quantity': sum(p.current_stock for p in products),
        'category_breakdown': {
            cat: {
                'cost_value': float(data['cost_value']),
                'selling_value': float(data['selling_value']),
                'potential_profit': float(data['selling_value'] - data['cost_value']),
                'quantity': data['quantity'],
                'products': data['products']
            }
            for cat, data in category_breakdown.items()
        }
    }


@router.get("/inventory/stock-movement")
async def get_stock_movement_report(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    product_id: Optional[int] = None
):
    """
    Get stock movement report showing all transactions within a date range.
    
    Includes purchases, sales, adjustments, returns, damages, and transfers.
    """
    from datetime import datetime, timedelta
    
    query = StockTransaction.all()
    
    if product_id:
        query = query.filter(product_id=product_id)
    
    if start_date:
        query = query.filter(created_at__gte=datetime.fromisoformat(start_date))
    
    if end_date:
        query = query.filter(created_at__lte=datetime.fromisoformat(end_date))
    
    transactions = await query.order_by('-created_at').all()
    
    # Calculate summary by transaction type
    summary = {}
    for trans in transactions:
        trans_type = trans.transaction_type.value
        if trans_type not in summary:
            summary[trans_type] = {
                'count': 0,
                'total_quantity': 0,
                'total_value': Decimal('0')
            }
        summary[trans_type]['count'] += 1
        summary[trans_type]['total_quantity'] += abs(trans.quantity)
        summary[trans_type]['total_value'] += Decimal(str(trans.total_cost or 0))
    
    return {
        'transactions': [stock_transaction_to_response(t) for t in transactions],
        'summary': {
            trans_type: {
                'count': data['count'],
                'total_quantity': data['total_quantity'],
                'total_value': float(data['total_value'])
            }
            for trans_type, data in summary.items()
        },
        'total_transactions': len(transactions)
    }


@router.get("/inventory/reorder-suggestions")
async def get_reorder_suggestions():
    """
    Get products that need reordering based on current stock levels and reorder points.
    
    Returns products below reorder threshold with suggested quantities.
    """
    products = await Product.filter(
        is_active=True,
        track_inventory=True
    ).all()
    
    suggestions = []
    for product in products:
        # Check if below reorder point (using min_stock_level as reorder point)
        if product.current_stock <= product.min_stock_level:
            # Calculate suggested order quantity
            # Simple formula: (max_stock_level - current_stock) or 2x min_stock_level
            suggested_quantity = max(
                product.max_stock_level - product.current_stock if product.max_stock_level else 0,
                product.min_stock_level * 2
            )
            
            suggestions.append({
                'product_id': product.id,
                'product_name': product.name,
                'sku': product.sku,
                'current_stock': product.current_stock,
                'min_stock_level': product.min_stock_level,
                'max_stock_level': product.max_stock_level,
                'suggested_quantity': suggested_quantity,
                'estimated_cost': float(Decimal(str(product.cost_price or 0)) * suggested_quantity),
                'urgency': 'critical' if product.current_stock == 0 else 'high' if product.current_stock < product.min_stock_level * 0.5 else 'medium'
            })
    
    # Sort by urgency and current stock
    suggestions.sort(key=lambda x: (
        0 if x['urgency'] == 'critical' else 1 if x['urgency'] == 'high' else 2,
        x['current_stock']
    ))
    
    return {
        'suggestions': suggestions,
        'total_products': len(suggestions),
        'critical_count': sum(1 for s in suggestions if s['urgency'] == 'critical'),
        'high_priority_count': sum(1 for s in suggestions if s['urgency'] == 'high'),
        'total_estimated_cost': sum(s['estimated_cost'] for s in suggestions)
    }


@router.get("/inventory/abc-analysis")
async def get_abc_analysis():
    """
    Perform ABC analysis on inventory based on value.
    
    - A items: Top 20% of products by value (typically 80% of total value)
    - B items: Next 30% of products (typically 15% of total value)
    - C items: Remaining 50% of products (typically 5% of total value)
    """
    products = await Product.filter(is_active=True, track_inventory=True).all()
    
    # Calculate value for each product
    product_values = []
    for product in products:
        value = Decimal(str(product.cost_price or 0)) * product.current_stock
        product_values.append({
            'product': product,
            'value': value
        })
    
    # Sort by value descending
    product_values.sort(key=lambda x: x['value'], reverse=True)
    
    total_value = sum(pv['value'] for pv in product_values)
    cumulative_value = Decimal('0')
    
    a_items = []
    b_items = []
    c_items = []
    
    for pv in product_values:
        cumulative_value += pv['value']
        cumulative_percentage = float(cumulative_value / total_value * 100) if total_value > 0 else 0
        
        product_data = {
            **product_to_response(pv['product']),
            'stock_value': float(pv['value']),
            'cumulative_percentage': cumulative_percentage
        }
        
        if cumulative_percentage <= 80:
            a_items.append(product_data)
        elif cumulative_percentage <= 95:
            b_items.append(product_data)
        else:
            c_items.append(product_data)
    
    return {
        'a_items': {
            'products': a_items,
            'count': len(a_items),
            'total_value': float(sum(Decimal(str(p['stock_value'])) for p in a_items)),
            'percentage_of_total': float(sum(Decimal(str(p['stock_value'])) for p in a_items) / total_value * 100) if total_value > 0 else 0
        },
        'b_items': {
            'products': b_items,
            'count': len(b_items),
            'total_value': float(sum(Decimal(str(p['stock_value'])) for p in b_items)),
            'percentage_of_total': float(sum(Decimal(str(p['stock_value'])) for p in b_items) / total_value * 100) if total_value > 0 else 0
        },
        'c_items': {
            'products': c_items,
            'count': len(c_items),
            'total_value': float(sum(Decimal(str(p['stock_value'])) for p in c_items)),
            'percentage_of_total': float(sum(Decimal(str(p['stock_value'])) for p in c_items) / total_value * 100) if total_value > 0 else 0
        },
        'total_value': float(total_value),
        'total_products': len(products)
    }
