"""
Dashboard API endpoints for comprehensive analytics and statistics
"""
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from tortoise.expressions import Q
from tortoise.functions import Sum, Count, Avg
from ..database.models import (
    Sale, POSSession, Product, Customer, 
    SaleStatus, SessionStatus, PaymentMethod
)

router = APIRouter()


# ===== SCHEMAS =====

class DateRangeQuery(BaseModel):
    """Date range for filtering dashboard data"""
    start_date: Optional[datetime] = Field(None, description="Start date for filtering")
    end_date: Optional[datetime] = Field(None, description="End date for filtering")


class SalesMetrics(BaseModel):
    """Sales metrics for dashboard"""
    total_sales: Decimal
    total_transactions: int
    average_transaction_value: Decimal
    total_tax: Decimal
    total_discount: Decimal
    cash_sales: Decimal
    card_sales: Decimal
    other_sales: Decimal


class SessionMetrics(BaseModel):
    """POS session metrics"""
    active_sessions: int
    total_sessions: int
    total_session_sales: Decimal
    average_session_value: Decimal


class ProductMetrics(BaseModel):
    """Product inventory metrics"""
    total_products: int
    active_products: int
    low_stock_count: int
    out_of_stock_count: int
    total_stock_value: Decimal


class CustomerMetrics(BaseModel):
    """Customer metrics"""
    total_customers: int
    new_customers_today: int
    customers_with_credit: int
    total_credit_balance: Decimal
    total_loyalty_points: int


class TimeSeriesDataPoint(BaseModel):
    """Single data point for time series"""
    timestamp: datetime
    value: Decimal
    count: int
    label: str


class PaymentMethodBreakdown(BaseModel):
    """Payment method breakdown"""
    method: str
    count: int
    total: Decimal
    percentage: float


class TopProduct(BaseModel):
    """Top selling product"""
    product_id: int
    product_name: str
    quantity_sold: int
    revenue: Decimal


class TopCustomer(BaseModel):
    """Top customer by sales"""
    customer_id: int
    customer_name: str
    total_spent: Decimal
    transaction_count: int


class SessionTimelineData(BaseModel):
    """Sales data by session timeline"""
    session_id: int
    session_number: str
    opened_at: datetime
    closed_at: Optional[datetime]
    is_active: bool
    sales_data: List[TimeSeriesDataPoint]
    total_sales: Decimal
    transaction_count: int


class DashboardStats(BaseModel):
    """Comprehensive dashboard statistics"""
    date_range: Dict[str, Optional[datetime]]
    sales_metrics: SalesMetrics
    session_metrics: SessionMetrics
    product_metrics: ProductMetrics
    customer_metrics: CustomerMetrics
    payment_breakdown: List[PaymentMethodBreakdown]
    top_products: List[TopProduct]
    top_customers: List[TopCustomer]
    sales_trend: List[TimeSeriesDataPoint]
    hourly_sales: List[TimeSeriesDataPoint]


# ===== HELPER FUNCTIONS =====

def get_date_range(days: Optional[int] = None, start_date: Optional[datetime] = None, 
                   end_date: Optional[datetime] = None) -> tuple[datetime, datetime]:
    """Get date range for filtering"""
    if start_date and end_date:
        return start_date, end_date
    elif days:
        end = datetime.now()
        start = end - timedelta(days=days)
        return start, end
    else:
        # Default to today
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        return today, datetime.now()


# ===== ENDPOINTS =====

@router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    days: Optional[int] = Query(None, ge=1, le=365, description="Number of days to analyze"),
    start_date: Optional[datetime] = Query(None, description="Start date (ISO format)"),
    end_date: Optional[datetime] = Query(None, description="End date (ISO format)")
):
    """
    Get comprehensive dashboard statistics
    
    Returns sales, session, product, and customer metrics with trends
    """
    try:
        # Get date range
        date_start, date_end = get_date_range(days, start_date, end_date)
        
        # ===== SALES METRICS =====
        sales_query = Sale.filter(
            sale_date__gte=date_start,
            sale_date__lte=date_end,
            status=SaleStatus.COMPLETED
        )
        
        sales = await sales_query.all()
        
        total_sales = sum(s.total_amount for s in sales)
        total_transactions = len(sales)
        average_transaction_value = total_sales / total_transactions if total_transactions > 0 else Decimal('0.00')
        total_tax = sum(s.tax_amount for s in sales)
        total_discount = sum(s.discount_amount for s in sales)
        
        # Payment method breakdown
        cash_sales = sum(s.total_amount for s in sales if s.payment_method == PaymentMethod.CASH)
        card_sales = sum(s.total_amount for s in sales if s.payment_method == PaymentMethod.CARD)
        other_sales = sum(s.total_amount for s in sales if s.payment_method not in [PaymentMethod.CASH, PaymentMethod.CARD])
        
        sales_metrics = SalesMetrics(
            total_sales=total_sales,
            total_transactions=total_transactions,
            average_transaction_value=average_transaction_value,
            total_tax=total_tax,
            total_discount=total_discount,
            cash_sales=cash_sales,
            card_sales=card_sales,
            other_sales=other_sales
        )
        
        # ===== SESSION METRICS =====
        active_sessions = await POSSession.filter(status=SessionStatus.ACTIVE).count()
        total_sessions = await POSSession.filter(
            opened_at__gte=date_start,
            opened_at__lte=date_end
        ).count()
        
        sessions = await POSSession.filter(
            opened_at__gte=date_start,
            opened_at__lte=date_end
        ).all()
        
        total_session_sales = sum(s.total_sales for s in sessions)
        average_session_value = total_session_sales / total_sessions if total_sessions > 0 else Decimal('0.00')
        
        session_metrics = SessionMetrics(
            active_sessions=active_sessions,
            total_sessions=total_sessions,
            total_session_sales=total_session_sales,
            average_session_value=average_session_value
        )
        
        # ===== PRODUCT METRICS =====
        all_products = await Product.all()
        active_products = [p for p in all_products if p.is_active]
        
        low_stock = [p for p in active_products if p.track_inventory and 0 < p.stock_quantity <= (p.low_stock_threshold or 10)]
        out_of_stock = [p for p in active_products if p.track_inventory and p.stock_quantity == 0]
        
        total_stock_value = sum((p.cost_price or Decimal('0.00')) * p.stock_quantity for p in active_products)
        
        product_metrics = ProductMetrics(
            total_products=len(all_products),
            active_products=len(active_products),
            low_stock_count=len(low_stock),
            out_of_stock_count=len(out_of_stock),
            total_stock_value=total_stock_value
        )
        
        # ===== CUSTOMER METRICS =====
        all_customers = await Customer.all()
        today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        new_customers_today = await Customer.filter(created_at__gte=today_start).count()
        
        customers_with_credit = [c for c in all_customers if c.credit_balance > 0]
        total_credit_balance = sum(c.credit_balance for c in all_customers)
        total_loyalty_points = sum(c.loyalty_points for c in all_customers)
        
        customer_metrics = CustomerMetrics(
            total_customers=len(all_customers),
            new_customers_today=new_customers_today,
            customers_with_credit=len(customers_with_credit),
            total_credit_balance=total_credit_balance,
            total_loyalty_points=total_loyalty_points
        )
        
        # ===== PAYMENT BREAKDOWN =====
        payment_breakdown = []
        for method in PaymentMethod:
            method_sales = [s for s in sales if s.payment_method == method]
            if method_sales:
                method_total = sum(s.total_amount for s in method_sales)
                percentage = float(method_total / total_sales * 100) if total_sales > 0 else 0.0
                payment_breakdown.append(PaymentMethodBreakdown(
                    method=method.value,
                    count=len(method_sales),
                    total=method_total,
                    percentage=percentage
                ))
        
        # ===== TOP PRODUCTS =====
        # Aggregate product sales from sale items
        product_sales = {}
        for sale in sales:
            # Ensure items is a list (JSONField can return list or None)
            items = sale.items if isinstance(sale.items, list) else []
            for item in items:
                product_id = item.get('product_id')
                if product_id:
                    if product_id not in product_sales:
                        product_sales[product_id] = {
                            'quantity': 0,
                            'revenue': Decimal('0.00'),
                            'name': item.get('name', 'Unknown')
                        }
                    product_sales[product_id]['quantity'] += item.get('quantity', 0)
                    product_sales[product_id]['revenue'] += Decimal(str(item.get('total', 0)))
        
        top_products = sorted(
            [
                TopProduct(
                    product_id=pid,
                    product_name=data['name'],
                    quantity_sold=data['quantity'],
                    revenue=data['revenue']
                )
                for pid, data in product_sales.items()
            ],
            key=lambda x: x.revenue,
            reverse=True
        )[:10]
        
        # ===== TOP CUSTOMERS =====
        customer_sales = {}
        for sale in sales:
            if sale.customer_id:
                if sale.customer_id not in customer_sales:
                    customer_sales[sale.customer_id] = {
                        'total': Decimal('0.00'),
                        'count': 0
                    }
                customer_sales[sale.customer_id]['total'] += sale.total_amount
                customer_sales[sale.customer_id]['count'] += 1
        
        # Get customer names
        top_customers = []
        for customer_id, data in sorted(customer_sales.items(), key=lambda x: x[1]['total'], reverse=True)[:10]:
            customer = await Customer.get_or_none(id=customer_id)
            if customer:
                top_customers.append(TopCustomer(
                    customer_id=customer_id,
                    customer_name=customer.name,
                    total_spent=data['total'],
                    transaction_count=data['count']
                ))
        
        # ===== SALES TREND (Daily) =====
        sales_by_date = {}
        current_date = date_start.replace(hour=0, minute=0, second=0, microsecond=0)
        while current_date <= date_end:
            date_key = current_date.date()
            sales_by_date[date_key] = {'total': Decimal('0.00'), 'count': 0}
            current_date += timedelta(days=1)
        
        for sale in sales:
            date_key = sale.sale_date.date()
            if date_key in sales_by_date:
                sales_by_date[date_key]['total'] += sale.total_amount
                sales_by_date[date_key]['count'] += 1
        
        sales_trend = [
            TimeSeriesDataPoint(
                timestamp=datetime.combine(date, datetime.min.time()),
                value=data['total'],
                count=data['count'],
                label=date.strftime('%Y-%m-%d')
            )
            for date, data in sorted(sales_by_date.items())
        ]
        
        # ===== HOURLY SALES =====
        hourly_sales_data = {}
        for hour in range(24):
            hourly_sales_data[hour] = {'total': Decimal('0.00'), 'count': 0}
        
        for sale in sales:
            hour = sale.sale_date.hour
            hourly_sales_data[hour]['total'] += sale.total_amount
            hourly_sales_data[hour]['count'] += 1
        
        hourly_sales = [
            TimeSeriesDataPoint(
                timestamp=datetime.now().replace(hour=hour, minute=0, second=0, microsecond=0),
                value=data['total'],
                count=data['count'],
                label=f"{hour:02d}:00"
            )
            for hour, data in sorted(hourly_sales_data.items())
        ]
        
        return DashboardStats(
            date_range={
                'start_date': date_start,
                'end_date': date_end
            },
            sales_metrics=sales_metrics,
            session_metrics=session_metrics,
            product_metrics=product_metrics,
            customer_metrics=customer_metrics,
            payment_breakdown=payment_breakdown,
            top_products=top_products,
            top_customers=top_customers,
            sales_trend=sales_trend,
            hourly_sales=hourly_sales
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch dashboard statistics: {str(e)}"
        )


@router.get("/dashboard/session-timeline", response_model=List[SessionTimelineData])
async def get_session_timeline(
    days: Optional[int] = Query(7, ge=1, le=90, description="Number of days to analyze"),
    include_closed: bool = Query(True, description="Include closed sessions")
):
    """
    Get sales data by session timeline
    
    Returns sales broken down by POS session with time-based data points
    """
    try:
        # Get date range
        date_start = datetime.now() - timedelta(days=days)
        date_end = datetime.now()
        
        # Get sessions
        query = POSSession.filter(opened_at__gte=date_start, opened_at__lte=date_end)
        if not include_closed:
            query = query.filter(status=SessionStatus.ACTIVE)
        
        sessions = await query.order_by('-opened_at').all()
        
        result = []
        for session in sessions:
            # Get sales for this session
            sales = await Sale.filter(
                session_id=session.id,
                status=SaleStatus.COMPLETED
            ).order_by('sale_date').all()
            
            # Create time series data points
            sales_data = []
            cumulative_total = Decimal('0.00')
            
            for sale in sales:
                cumulative_total += sale.total_amount
                sales_data.append(TimeSeriesDataPoint(
                    timestamp=sale.sale_date,
                    value=sale.total_amount,
                    count=1,
                    label=sale.invoice_number
                ))
            
            result.append(SessionTimelineData(
                session_id=session.id,
                session_number=session.session_number,
                opened_at=session.opened_at,
                closed_at=session.closed_at,
                is_active=session.status == SessionStatus.ACTIVE,
                sales_data=sales_data,
                total_sales=session.total_sales,
                transaction_count=len(sales)
            ))
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch session timeline: {str(e)}"
        )
