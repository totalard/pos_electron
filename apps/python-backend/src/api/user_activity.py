"""
User Activity Log API endpoints
"""
import logging
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Query
from tortoise.exceptions import DoesNotExist
from tortoise.functions import Count, Sum

from ..database.models import User, UserActivityLog, ActivityType
from .schemas import (
    UserActivityLogCreate,
    UserActivityLogResponse,
    UserPerformanceMetrics
)

logger = logging.getLogger(__name__)

# Create router
router = APIRouter()


# Helper function
def activity_log_to_response(log: UserActivityLog) -> UserActivityLogResponse:
    """Convert UserActivityLog model to UserActivityLogResponse schema"""
    return UserActivityLogResponse(
        id=log.id,
        user_id=log.user_id,
        activity_type=log.activity_type,
        description=log.description,
        session_id=log.session_id,
        ip_address=log.ip_address,
        duration_ms=log.duration_ms,
        metadata=log.metadata,
        created_at=log.created_at
    )


# ============================================================================
# Activity Log Endpoints
# ============================================================================

@router.post("/", response_model=UserActivityLogResponse, status_code=status.HTTP_201_CREATED)
async def create_activity_log(user_id: int, log_data: UserActivityLogCreate):
    """
    Create a new activity log entry.
    """
    try:
        user = await User.get(id=user_id)
        
        log = await UserActivityLog.create(
            user=user,
            activity_type=log_data.activity_type,
            description=log_data.description,
            session_id=log_data.session_id,
            ip_address=log_data.ip_address,
            duration_ms=log_data.duration_ms,
            metadata=log_data.metadata
        )
        
        logger.info(f"Created activity log: {log.activity_type} for user {user.full_name}")
        return activity_log_to_response(log)
        
    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )


@router.get("/user/{user_id}", response_model=List[UserActivityLogResponse])
async def get_user_activity_logs(
    user_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    activity_type: Optional[str] = None,
    session_id: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
):
    """
    Get activity logs for a specific user with optional filtering.
    """
    try:
        user = await User.get(id=user_id)
        
        query = UserActivityLog.filter(user=user)
        
        # Apply filters
        if activity_type:
            query = query.filter(activity_type=activity_type)
        if session_id:
            query = query.filter(session_id=session_id)
        if start_date:
            query = query.filter(created_at__gte=start_date)
        if end_date:
            query = query.filter(created_at__lte=end_date)
        
        logs = await query.offset(skip).limit(limit).all()
        
        return [activity_log_to_response(log) for log in logs]
        
    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )


@router.get("/session/{session_id}", response_model=List[UserActivityLogResponse])
async def get_session_activity_logs(session_id: str):
    """
    Get all activity logs for a specific session.
    """
    logs = await UserActivityLog.filter(session_id=session_id).all()
    return [activity_log_to_response(log) for log in logs]


# ============================================================================
# Performance Metrics Endpoints
# ============================================================================

@router.get("/user/{user_id}/performance", response_model=UserPerformanceMetrics)
async def get_user_performance_metrics(
    user_id: int,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
):
    """
    Get performance metrics for a user within a date range.
    
    Metrics include:
    - Total sales count
    - Total transactions
    - Total revenue (if available in metadata)
    - Average transaction value
    - Login count
    - Last login time
    """
    try:
        user = await User.get(id=user_id)
        
        # Default to last 30 days if no dates provided
        if not start_date:
            start_date = datetime.utcnow() - timedelta(days=30)
        if not end_date:
            end_date = datetime.utcnow()
        
        # Build query for the period
        query = UserActivityLog.filter(
            user=user,
            created_at__gte=start_date,
            created_at__lte=end_date
        )
        
        # Get sales count
        total_sales = await query.filter(activity_type=ActivityType.SALE).count()
        
        # Get total transactions (sales + refunds)
        total_transactions = await query.filter(
            activity_type__in=[ActivityType.SALE, ActivityType.REFUND]
        ).count()
        
        # Get login count
        login_count = await query.filter(activity_type=ActivityType.LOGIN).count()
        
        # Get all sales to calculate revenue (if metadata contains amount)
        sales_logs = await query.filter(activity_type=ActivityType.SALE).all()
        total_revenue = 0.0
        for log in sales_logs:
            if log.metadata and 'amount' in log.metadata:
                total_revenue += float(log.metadata['amount'])
        
        # Calculate average transaction value
        average_transaction_value = total_revenue / total_sales if total_sales > 0 else 0.0
        
        return UserPerformanceMetrics(
            user_id=user.id,
            user_name=user.full_name,
            total_sales=total_sales,
            total_transactions=total_transactions,
            total_revenue=total_revenue,
            average_transaction_value=average_transaction_value,
            login_count=login_count,
            last_login=user.last_login,
            period_start=start_date,
            period_end=end_date
        )
        
    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )


@router.get("/performance/all", response_model=List[UserPerformanceMetrics])
async def get_all_users_performance_metrics(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
):
    """
    Get performance metrics for all users within a date range.
    """
    # Default to last 30 days if no dates provided
    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=30)
    if not end_date:
        end_date = datetime.utcnow()
    
    users = await User.filter(is_active=True).all()
    metrics_list = []
    
    for user in users:
        # Build query for the period
        query = UserActivityLog.filter(
            user=user,
            created_at__gte=start_date,
            created_at__lte=end_date
        )
        
        # Get sales count
        total_sales = await query.filter(activity_type=ActivityType.SALE).count()
        
        # Get total transactions
        total_transactions = await query.filter(
            activity_type__in=[ActivityType.SALE, ActivityType.REFUND]
        ).count()
        
        # Get login count
        login_count = await query.filter(activity_type=ActivityType.LOGIN).count()
        
        # Get revenue
        sales_logs = await query.filter(activity_type=ActivityType.SALE).all()
        total_revenue = 0.0
        for log in sales_logs:
            if log.metadata and 'amount' in log.metadata:
                total_revenue += float(log.metadata['amount'])
        
        # Calculate average
        average_transaction_value = total_revenue / total_sales if total_sales > 0 else 0.0
        
        metrics_list.append(UserPerformanceMetrics(
            user_id=user.id,
            user_name=user.full_name,
            total_sales=total_sales,
            total_transactions=total_transactions,
            total_revenue=total_revenue,
            average_transaction_value=average_transaction_value,
            login_count=login_count,
            last_login=user.last_login,
            period_start=start_date,
            period_end=end_date
        ))
    
    return metrics_list

