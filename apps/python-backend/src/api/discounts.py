"""
Discount Management API Endpoints
Handles CRUD operations, validation, and dashboard analytics for discounts
"""

from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime, timedelta
from decimal import Decimal
from tortoise.expressions import Q
from tortoise.functions import Sum, Count, Avg
from ..database.models import (
    Discount,
    DiscountUsage,
    DiscountType,
    DiscountStatus,
    Customer,
    Product,
    Sale
)
from .schemas import (
    DiscountCreate,
    DiscountUpdate,
    DiscountResponse,
    DiscountUsageCreate,
    DiscountUsageResponse,
    DiscountValidationRequest,
    DiscountValidationResponse,
    DiscountDashboardStats
)

router = APIRouter(prefix="/discounts", tags=["Discounts"])


def discount_to_response(discount: Discount) -> DiscountResponse:
    """Convert Discount model to response schema"""
    return DiscountResponse(
        id=discount.id,
        code=discount.code,
        name=discount.name,
        description=discount.description,
        discount_type=discount.discount_type.value,
        value=float(discount.value),
        max_discount_amount=float(discount.max_discount_amount) if discount.max_discount_amount else None,
        min_purchase_amount=float(discount.min_purchase_amount) if discount.min_purchase_amount else None,
        min_quantity=discount.min_quantity,
        applicable_products=discount.applicable_products,
        applicable_categories=discount.applicable_categories,
        applicable_customer_segments=discount.applicable_customer_segments,
        first_purchase_only=discount.first_purchase_only,
        buy_quantity=discount.buy_quantity,
        get_quantity=discount.get_quantity,
        bundle_products=discount.bundle_products,
        usage_limit=discount.usage_limit,
        usage_limit_per_customer=discount.usage_limit_per_customer,
        usage_count=discount.usage_count,
        valid_from=discount.valid_from,
        valid_until=discount.valid_until,
        time_restrictions=discount.time_restrictions,
        priority=discount.priority,
        can_stack=discount.can_stack,
        stackable_with=discount.stackable_with,
        auto_apply=discount.auto_apply,
        status=discount.status.value,
        is_active=discount.is_active,
        notes=discount.notes,
        tags=discount.tags,
        total_revenue_impact=float(discount.total_revenue_impact),
        total_orders=discount.total_orders,
        created_by_id=discount.created_by_id,
        created_at=discount.created_at,
        updated_at=discount.updated_at
    )


# ===== DASHBOARD ENDPOINT =====

@router.get("/dashboard", response_model=DiscountDashboardStats)
async def get_discount_dashboard(
    days: int = Query(default=30, ge=1, le=365, description="Number of days for trend analysis")
):
    """
    Get comprehensive discount dashboard statistics
    
    Returns:
    - Total discount counts by status
    - Usage statistics
    - Revenue impact
    - Top performing discounts
    - Recent usages
    - Usage trends
    """
    try:
        # Get all discounts with status counts
        all_discounts = await Discount.all()
        total_discounts = len(all_discounts)
        
        active_discounts = sum(1 for d in all_discounts if d.status == DiscountStatus.ACTIVE)
        inactive_discounts = sum(1 for d in all_discounts if d.status == DiscountStatus.INACTIVE)
        scheduled_discounts = sum(1 for d in all_discounts if d.status == DiscountStatus.SCHEDULED)
        expired_discounts = sum(1 for d in all_discounts if d.status == DiscountStatus.EXPIRED)
        
        # Get usage statistics
        total_usage_count = sum(d.usage_count for d in all_discounts)
        total_revenue_impact = sum(d.total_revenue_impact for d in all_discounts)
        
        # Calculate average discount amount
        if total_usage_count > 0:
            average_discount_amount = total_revenue_impact / total_usage_count
        else:
            average_discount_amount = Decimal('0.00')
        
        # Get top 10 discounts by usage
        top_discounts_data = sorted(
            all_discounts,
            key=lambda d: d.usage_count,
            reverse=True
        )[:10]
        
        top_discounts = [
            {
                "id": d.id,
                "code": d.code,
                "name": d.name,
                "usage_count": d.usage_count,
                "total_revenue_impact": float(d.total_revenue_impact),
                "discount_type": d.discount_type.value
            }
            for d in top_discounts_data
        ]
        
        # Get recent usages (last 20)
        recent_usages_data = await DiscountUsage.all().order_by("-usage_date").limit(20)
        recent_usages = [
            DiscountUsageResponse(
                id=usage.id,
                discount_id=usage.discount_id,
                sale_id=usage.sale_id,
                customer_id=usage.customer_id,
                discount_amount=float(usage.discount_amount),
                original_amount=float(usage.original_amount),
                final_amount=float(usage.final_amount),
                applied_by_id=usage.applied_by_id,
                usage_date=usage.usage_date,
                metadata=usage.metadata
            )
            for usage in recent_usages_data
        ]
        
        # Get discount distribution by type
        discount_by_type = {}
        for discount_type in DiscountType:
            count = sum(1 for d in all_discounts if d.discount_type == discount_type)
            discount_by_type[discount_type.value] = count
        
        # Get usage trend for the specified period
        start_date = datetime.now() - timedelta(days=days)
        usage_trend_data = await DiscountUsage.filter(
            usage_date__gte=start_date
        ).all()
        
        # Group by date
        usage_by_date = {}
        for usage in usage_trend_data:
            date_key = usage.usage_date.date().isoformat()
            if date_key not in usage_by_date:
                usage_by_date[date_key] = {
                    "date": date_key,
                    "count": 0,
                    "total_discount": 0.0
                }
            usage_by_date[date_key]["count"] += 1
            usage_by_date[date_key]["total_discount"] += float(usage.discount_amount)
        
        usage_trend = sorted(usage_by_date.values(), key=lambda x: x["date"])
        
        return DiscountDashboardStats(
            total_discounts=total_discounts,
            active_discounts=active_discounts,
            inactive_discounts=inactive_discounts,
            scheduled_discounts=scheduled_discounts,
            expired_discounts=expired_discounts,
            total_usage_count=total_usage_count,
            total_revenue_impact=float(total_revenue_impact),
            average_discount_amount=float(average_discount_amount),
            top_discounts=top_discounts,
            recent_usages=recent_usages,
            discount_by_type=discount_by_type,
            usage_trend=usage_trend
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch dashboard statistics: {str(e)}"
        )


# ===== CRUD ENDPOINTS =====

@router.get("/", response_model=List[DiscountResponse])
async def get_all_discounts(
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    discount_type: Optional[str] = Query(None, description="Filter by type"),
    active_only: bool = Query(False, description="Show only active discounts"),
    search: Optional[str] = Query(None, description="Search by code or name")
):
    """Get all discounts with optional filters"""
    try:
        query = Discount.all()
        
        # Apply filters
        if status_filter:
            try:
                status_enum = DiscountStatus(status_filter)
                query = query.filter(status=status_enum)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid status: {status_filter}"
                )
        
        if discount_type:
            try:
                type_enum = DiscountType(discount_type)
                query = query.filter(discount_type=type_enum)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid discount type: {discount_type}"
                )
        
        if active_only:
            query = query.filter(is_active=True)
        
        if search:
            query = query.filter(
                Q(code__icontains=search) | Q(name__icontains=search)
            )
        
        discounts = await query.all()
        return [discount_to_response(d) for d in discounts]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch discounts: {str(e)}"
        )


@router.get("/{discount_id}", response_model=DiscountResponse)
async def get_discount(discount_id: int):
    """Get a specific discount by ID"""
    discount = await Discount.get_or_none(id=discount_id)
    
    if not discount:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Discount with ID {discount_id} not found"
        )
    
    return discount_to_response(discount)


@router.post("/", response_model=DiscountResponse, status_code=status.HTTP_201_CREATED)
async def create_discount(discount_data: DiscountCreate):
    """Create a new discount"""
    try:
        # Validate discount type
        try:
            discount_type_enum = DiscountType(discount_data.discount_type)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid discount type: {discount_data.discount_type}"
            )
        
        # Validate status
        try:
            status_enum = DiscountStatus(discount_data.status)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status: {discount_data.status}"
            )
        
        # Check for duplicate code
        existing = await Discount.get_or_none(code=discount_data.code)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Discount code '{discount_data.code}' already exists"
            )
        
        # Validate buy_x_get_y specific fields
        if discount_type_enum == DiscountType.BUY_X_GET_Y:
            if not discount_data.buy_quantity or not discount_data.get_quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="buy_quantity and get_quantity are required for buy_x_get_y discount type"
                )
        
        # Create discount
        discount = await Discount.create(
            code=discount_data.code,
            name=discount_data.name,
            description=discount_data.description,
            discount_type=discount_type_enum,
            value=discount_data.value,
            max_discount_amount=discount_data.max_discount_amount,
            min_purchase_amount=discount_data.min_purchase_amount,
            min_quantity=discount_data.min_quantity,
            applicable_products=discount_data.applicable_products,
            applicable_categories=discount_data.applicable_categories,
            applicable_customer_segments=discount_data.applicable_customer_segments,
            first_purchase_only=discount_data.first_purchase_only,
            buy_quantity=discount_data.buy_quantity,
            get_quantity=discount_data.get_quantity,
            bundle_products=discount_data.bundle_products,
            usage_limit=discount_data.usage_limit,
            usage_limit_per_customer=discount_data.usage_limit_per_customer,
            valid_from=discount_data.valid_from,
            valid_until=discount_data.valid_until,
            time_restrictions=discount_data.time_restrictions,
            priority=discount_data.priority,
            can_stack=discount_data.can_stack,
            stackable_with=discount_data.stackable_with,
            auto_apply=discount_data.auto_apply,
            status=status_enum,
            is_active=discount_data.is_active,
            notes=discount_data.notes,
            tags=discount_data.tags,
            created_by_id=discount_data.created_by_id
        )
        
        return discount_to_response(discount)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create discount: {str(e)}"
        )


@router.put("/{discount_id}", response_model=DiscountResponse)
async def update_discount(discount_id: int, discount_data: DiscountUpdate):
    """Update an existing discount"""
    try:
        discount = await Discount.get_or_none(id=discount_id)
        
        if not discount:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Discount with ID {discount_id} not found"
            )
        
        # Update fields if provided
        update_data = discount_data.model_dump(exclude_unset=True)
        
        # Validate enums if provided
        if "discount_type" in update_data:
            try:
                update_data["discount_type"] = DiscountType(update_data["discount_type"])
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid discount type: {update_data['discount_type']}"
                )
        
        if "status" in update_data:
            try:
                update_data["status"] = DiscountStatus(update_data["status"])
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid status: {update_data['status']}"
                )
        
        # Check for duplicate code if code is being updated
        if "code" in update_data and update_data["code"] != discount.code:
            existing = await Discount.get_or_none(code=update_data["code"])
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Discount code '{update_data['code']}' already exists"
                )
        
        # Update the discount
        await discount.update_from_dict(update_data)
        await discount.save()
        
        return discount_to_response(discount)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update discount: {str(e)}"
        )


@router.delete("/{discount_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_discount(discount_id: int):
    """Delete a discount"""
    try:
        discount = await Discount.get_or_none(id=discount_id)
        
        if not discount:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Discount with ID {discount_id} not found"
            )
        
        # Check if discount has been used
        usage_count = await DiscountUsage.filter(discount_id=discount_id).count()
        if usage_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete discount that has been used {usage_count} times. Consider deactivating it instead."
            )
        
        await discount.delete()
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete discount: {str(e)}"
        )


# ===== DISCOUNT VALIDATION & APPLICATION =====

@router.post("/validate", response_model=DiscountValidationResponse)
async def validate_discount(validation_request: DiscountValidationRequest):
    """
    Validate a discount code and calculate the discount amount
    
    Checks:
    - Discount exists and is active
    - Valid date range
    - Usage limits
    - Minimum purchase/quantity requirements
    - Product/category restrictions
    - Customer eligibility
    """
    try:
        # Find discount by code
        discount = await Discount.get_or_none(
            code=validation_request.discount_code,
            is_active=True
        )
        
        if not discount:
            return DiscountValidationResponse(
                valid=False,
                message="Invalid or inactive discount code",
                errors=["Discount code not found or is inactive"]
            )
        
        errors = []
        
        # Check status
        if discount.status != DiscountStatus.ACTIVE:
            errors.append(f"Discount is {discount.status.value}")
        
        # Check date validity
        now = datetime.now()
        if discount.valid_from and now < discount.valid_from:
            errors.append(f"Discount is not yet valid. Valid from {discount.valid_from}")
        
        if discount.valid_until and now > discount.valid_until:
            errors.append(f"Discount has expired on {discount.valid_until}")
        
        # Check usage limits
        if discount.usage_limit and discount.usage_count >= discount.usage_limit:
            errors.append("Discount usage limit reached")
        
        # Check per-customer usage limit
        if validation_request.customer_id and discount.usage_limit_per_customer:
            customer_usage = await DiscountUsage.filter(
                discount_id=discount.id,
                customer_id=validation_request.customer_id
            ).count()
            
            if customer_usage >= discount.usage_limit_per_customer:
                errors.append("You have reached the usage limit for this discount")
        
        # Check minimum purchase amount
        if discount.min_purchase_amount and validation_request.subtotal < discount.min_purchase_amount:
            errors.append(f"Minimum purchase amount of {discount.min_purchase_amount} required")
        
        # Check minimum quantity
        if discount.min_quantity:
            total_quantity = sum(item.get("quantity", 0) for item in validation_request.cart_items)
            if total_quantity < discount.min_quantity:
                errors.append(f"Minimum quantity of {discount.min_quantity} items required")
        
        # Check product restrictions
        if discount.applicable_products:
            cart_product_ids = [item.get("product_id") for item in validation_request.cart_items]
            has_applicable_product = any(
                pid in discount.applicable_products for pid in cart_product_ids
            )
            if not has_applicable_product:
                errors.append("No applicable products in cart")
        
        # Check first purchase only
        if discount.first_purchase_only and validation_request.customer_id:
            previous_sales = await Sale.filter(customer_id=validation_request.customer_id).count()
            if previous_sales > 0:
                errors.append("This discount is only for first-time customers")
        
        # If there are errors, return invalid
        if errors:
            return DiscountValidationResponse(
                valid=False,
                discount=discount_to_response(discount),
                errors=errors,
                message="; ".join(errors)
            )
        
        # Calculate discount amount
        discount_amount = Decimal('0.00')
        
        if discount.discount_type == DiscountType.PERCENTAGE:
            discount_amount = validation_request.subtotal * (discount.value / 100)
            # Apply max discount cap if set
            if discount.max_discount_amount and discount_amount > discount.max_discount_amount:
                discount_amount = discount.max_discount_amount
        
        elif discount.discount_type == DiscountType.FIXED_AMOUNT:
            discount_amount = min(discount.value, validation_request.subtotal)
        
        # Calculate final amount
        final_amount = validation_request.subtotal - discount_amount
        
        return DiscountValidationResponse(
            valid=True,
            discount=discount_to_response(discount),
            discount_amount=float(discount_amount),
            final_amount=float(final_amount),
            message="Discount applied successfully"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to validate discount: {str(e)}"
        )


@router.get("/auto-apply/eligible", response_model=List[DiscountResponse])
async def get_auto_apply_discounts(
    customer_id: Optional[int] = None,
    subtotal: Decimal = Query(..., ge=0)
):
    """Get all eligible auto-apply discounts for a given cart"""
    try:
        # Get all active auto-apply discounts
        discounts = await Discount.filter(
            is_active=True,
            auto_apply=True,
            status=DiscountStatus.ACTIVE
        ).order_by("-priority").all()
        
        eligible_discounts = []
        now = datetime.now()
        
        for discount in discounts:
            # Check date validity
            if discount.valid_from and now < discount.valid_from:
                continue
            if discount.valid_until and now > discount.valid_until:
                continue
            
            # Check usage limits
            if discount.usage_limit and discount.usage_count >= discount.usage_limit:
                continue
            
            # Check minimum purchase
            if discount.min_purchase_amount and subtotal < discount.min_purchase_amount:
                continue
            
            eligible_discounts.append(discount_to_response(discount))
        
        return eligible_discounts
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch auto-apply discounts: {str(e)}"
        )


# ===== DISCOUNT USAGE TRACKING =====

@router.post("/usage", response_model=DiscountUsageResponse, status_code=status.HTTP_201_CREATED)
async def record_discount_usage(usage_data: DiscountUsageCreate):
    """Record a discount usage"""
    try:
        # Verify discount exists
        discount = await Discount.get_or_none(id=usage_data.discount_id)
        if not discount:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Discount with ID {usage_data.discount_id} not found"
            )
        
        # Create usage record
        usage = await DiscountUsage.create(
            discount_id=usage_data.discount_id,
            sale_id=usage_data.sale_id,
            customer_id=usage_data.customer_id,
            discount_amount=usage_data.discount_amount,
            original_amount=usage_data.original_amount,
            final_amount=usage_data.final_amount,
            applied_by_id=usage_data.applied_by_id,
            metadata=usage_data.metadata
        )
        
        # Update discount statistics
        discount.usage_count += 1
        discount.total_revenue_impact += usage_data.discount_amount
        discount.total_orders += 1
        await discount.save()
        
        return DiscountUsageResponse(
            id=usage.id,
            discount_id=usage.discount_id,
            sale_id=usage.sale_id,
            customer_id=usage.customer_id,
            discount_amount=float(usage.discount_amount),
            original_amount=float(usage.original_amount),
            final_amount=float(usage.final_amount),
            applied_by_id=usage.applied_by_id,
            usage_date=usage.usage_date,
            metadata=usage.metadata
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record discount usage: {str(e)}"
        )


@router.get("/{discount_id}/usages", response_model=List[DiscountUsageResponse])
async def get_discount_usages(
    discount_id: int,
    limit: int = Query(default=50, ge=1, le=500)
):
    """Get usage history for a specific discount"""
    try:
        # Verify discount exists
        discount = await Discount.get_or_none(id=discount_id)
        if not discount:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Discount with ID {discount_id} not found"
            )
        
        usages = await DiscountUsage.filter(
            discount_id=discount_id
        ).order_by("-usage_date").limit(limit).all()
        
        return [
            DiscountUsageResponse(
                id=usage.id,
                discount_id=usage.discount_id,
                sale_id=usage.sale_id,
                customer_id=usage.customer_id,
                discount_amount=float(usage.discount_amount),
                original_amount=float(usage.original_amount),
                final_amount=float(usage.final_amount),
                applied_by_id=usage.applied_by_id,
                usage_date=usage.usage_date,
                metadata=usage.metadata
            )
            for usage in usages
        ]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch discount usages: {str(e)}"
        )
