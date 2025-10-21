"""
POS Session API endpoints
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from tortoise.expressions import Q
from ..database.models import POSSession, SessionStatus, Sale, CashTransaction, User, PaymentMethod

router = APIRouter()


# Pydantic schemas
class DenominationCount(BaseModel):
    """Cash denomination count"""
    value: float = Field(..., description="Denomination value (e.g., 100, 50, 20, 10, 5, 1, 0.25)")
    count: int = Field(..., description="Number of bills/coins")
    total: float = Field(..., description="Total amount for this denomination")


class SessionCreateRequest(BaseModel):
    """Request schema for creating a new session"""
    user_id: int = Field(..., description="User ID for this session")
    opening_cash: float = Field(..., description="Total opening cash amount")
    opening_denominations: Dict[str, Any] = Field(..., description="Opening cash denomination breakdown")
    opening_notes: Optional[str] = Field(None, description="Opening notes")


class SessionCloseRequest(BaseModel):
    """Request schema for closing a session"""
    closing_cash: float = Field(..., description="Total closing cash amount")
    closing_denominations: Dict[str, Any] = Field(..., description="Closing cash denomination breakdown")
    closing_notes: Optional[str] = Field(None, description="Closing notes")


class PaymentSummaryItem(BaseModel):
    """Payment method summary"""
    payment_method: str
    count: int
    total: float


class SessionSummaryResponse(BaseModel):
    """Session summary response"""
    session_id: int
    session_number: str
    user_name: str
    status: str
    opened_at: datetime
    closed_at: Optional[datetime]
    opening_cash: float
    closing_cash: Optional[float]
    expected_cash: Optional[float]
    cash_variance: Optional[float]
    total_sales: float
    total_cash_in: float
    total_cash_out: float
    payment_summary: list[PaymentSummaryItem]
    sales_count: int


class SessionResponse(BaseModel):
    """Session response"""
    id: int
    session_number: str
    user_id: int
    user_name: str
    status: str
    opening_cash: float
    opening_denominations: Dict[str, Any]
    closing_cash: Optional[float]
    closing_denominations: Optional[Dict[str, Any]]
    expected_cash: Optional[float]
    cash_variance: Optional[float]
    total_sales: float
    total_cash_in: float
    total_cash_out: float
    payment_summary: Dict[str, Any]
    opened_at: datetime
    closed_at: Optional[datetime]
    opening_notes: Optional[str]
    closing_notes: Optional[str]


def generate_session_number() -> str:
    """Generate unique session number"""
    now = datetime.now()
    date_str = now.strftime("%Y%m%d")
    time_str = now.strftime("%H%M%S")
    return f"SES-{date_str}-{time_str}"


@router.post("/pos-sessions", response_model=SessionResponse)
async def create_session(request: SessionCreateRequest):
    """
    Create a new POS session.
    
    - Validates that user doesn't have an active session
    - Creates session with opening cash and denominations
    - Returns created session details
    """
    # Check if user exists
    user = await User.get_or_none(id=request.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if user already has an active session
    active_session = await POSSession.filter(
        user_id=request.user_id,
        status=SessionStatus.ACTIVE
    ).first()
    
    if active_session:
        raise HTTPException(
            status_code=400,
            detail=f"User already has an active session: {active_session.session_number}"
        )
    
    # Create new session
    session = await POSSession.create(
        session_number=generate_session_number(),
        user_id=request.user_id,
        status=SessionStatus.ACTIVE,
        opening_cash=Decimal(str(request.opening_cash)),
        opening_denominations=request.opening_denominations,
        opening_notes=request.opening_notes,
        total_sales=Decimal('0.00'),
        total_cash_in=Decimal('0.00'),
        total_cash_out=Decimal('0.00'),
        payment_summary={}
    )
    
    await session.fetch_related('user')
    
    return SessionResponse(
        id=session.id,
        session_number=session.session_number,
        user_id=session.user.id,
        user_name=session.user.full_name,
        status=session.status.value,
        opening_cash=float(session.opening_cash),
        opening_denominations=session.opening_denominations,
        closing_cash=None,
        closing_denominations=None,
        expected_cash=None,
        cash_variance=None,
        total_sales=float(session.total_sales),
        total_cash_in=float(session.total_cash_in),
        total_cash_out=float(session.total_cash_out),
        payment_summary=session.payment_summary,
        opened_at=session.opened_at,
        closed_at=None,
        opening_notes=session.opening_notes,
        closing_notes=None
    )


@router.get("/pos-sessions/active", response_model=Optional[SessionResponse])
async def get_active_session(user_id: int = Query(..., description="User ID")):
    """
    Get active session for a user.
    
    Returns None if no active session exists.
    """
    session = await POSSession.filter(
        user_id=user_id,
        status=SessionStatus.ACTIVE
    ).prefetch_related('user').first()
    
    if not session:
        return None
    
    return SessionResponse(
        id=session.id,
        session_number=session.session_number,
        user_id=session.user.id,
        user_name=session.user.full_name,
        status=session.status.value,
        opening_cash=float(session.opening_cash),
        opening_denominations=session.opening_denominations,
        closing_cash=float(session.closing_cash) if session.closing_cash else None,
        closing_denominations=session.closing_denominations,
        expected_cash=float(session.expected_cash) if session.expected_cash else None,
        cash_variance=float(session.cash_variance) if session.cash_variance else None,
        total_sales=float(session.total_sales),
        total_cash_in=float(session.total_cash_in),
        total_cash_out=float(session.total_cash_out),
        payment_summary=session.payment_summary,
        opened_at=session.opened_at,
        closed_at=session.closed_at,
        opening_notes=session.opening_notes,
        closing_notes=session.closing_notes
    )


@router.put("/pos-sessions/{session_id}/close", response_model=SessionResponse)
async def close_session(session_id: int, request: SessionCloseRequest):
    """
    Close a POS session with reconciliation.
    
    - Calculates sales summary by payment method
    - Calculates expected cash vs actual cash
    - Computes cash variance
    - Updates session status to CLOSED
    """
    # Get session
    session = await POSSession.get_or_none(id=session_id).prefetch_related('user')
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session.status != SessionStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Session is not active")
    
    # Calculate payment summary from sales
    sales = await Sale.filter(session_id=session_id, status="completed")
    
    payment_summary = {}
    total_sales = Decimal('0.00')
    sales_count = 0
    
    for sale in sales:
        payment_method = sale.payment_method.value
        amount = sale.total_amount
        
        if payment_method not in payment_summary:
            payment_summary[payment_method] = {
                'count': 0,
                'total': 0.0
            }
        
        payment_summary[payment_method]['count'] += 1
        payment_summary[payment_method]['total'] += float(amount)
        total_sales += amount
        sales_count += 1
    
    # Calculate cash in/out totals
    cash_in_total = await CashTransaction.filter(
        session_id=session_id,
        transaction_type="cash_in"
    ).count()
    
    cash_out_total = await CashTransaction.filter(
        session_id=session_id,
        transaction_type="cash_out"
    ).count()
    
    cash_in_sum = Decimal('0.00')
    cash_out_sum = Decimal('0.00')
    
    cash_in_transactions = await CashTransaction.filter(
        session_id=session_id,
        transaction_type="cash_in"
    )
    for txn in cash_in_transactions:
        cash_in_sum += txn.amount
    
    cash_out_transactions = await CashTransaction.filter(
        session_id=session_id,
        transaction_type="cash_out"
    )
    for txn in cash_out_transactions:
        cash_out_sum += txn.amount
    
    # Calculate expected cash
    cash_sales = Decimal(str(payment_summary.get('cash', {}).get('total', 0)))
    expected_cash = session.opening_cash + cash_sales + cash_in_sum - cash_out_sum
    
    # Calculate variance
    closing_cash_decimal = Decimal(str(request.closing_cash))
    cash_variance = closing_cash_decimal - expected_cash
    
    # Update session
    session.closing_cash = closing_cash_decimal
    session.closing_denominations = request.closing_denominations
    session.closing_notes = request.closing_notes
    session.expected_cash = expected_cash
    session.cash_variance = cash_variance
    session.total_sales = total_sales
    session.total_cash_in = cash_in_sum
    session.total_cash_out = cash_out_sum
    session.payment_summary = payment_summary
    session.status = SessionStatus.CLOSED
    session.closed_at = datetime.now()
    
    await session.save()
    
    return SessionResponse(
        id=session.id,
        session_number=session.session_number,
        user_id=session.user.id,
        user_name=session.user.full_name,
        status=session.status.value,
        opening_cash=float(session.opening_cash),
        opening_denominations=session.opening_denominations,
        closing_cash=float(session.closing_cash),
        closing_denominations=session.closing_denominations,
        expected_cash=float(session.expected_cash),
        cash_variance=float(session.cash_variance),
        total_sales=float(session.total_sales),
        total_cash_in=float(session.total_cash_in),
        total_cash_out=float(session.total_cash_out),
        payment_summary=session.payment_summary,
        opened_at=session.opened_at,
        closed_at=session.closed_at,
        opening_notes=session.opening_notes,
        closing_notes=session.closing_notes
    )


@router.get("/pos-sessions/{session_id}/summary", response_model=SessionSummaryResponse)
async def get_session_summary(session_id: int):
    """
    Get comprehensive session summary.
    
    Returns sales summary, payment breakdown, and cash reconciliation.
    """
    session = await POSSession.get_or_none(id=session_id).prefetch_related('user')
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Get sales count
    sales_count = await Sale.filter(session_id=session_id, status="completed").count()
    
    # Convert payment summary to list
    payment_summary_list = [
        PaymentSummaryItem(
            payment_method=method,
            count=data['count'],
            total=data['total']
        )
        for method, data in session.payment_summary.items()
    ]
    
    return SessionSummaryResponse(
        session_id=session.id,
        session_number=session.session_number,
        user_name=session.user.full_name,
        status=session.status.value,
        opened_at=session.opened_at,
        closed_at=session.closed_at,
        opening_cash=float(session.opening_cash),
        closing_cash=float(session.closing_cash) if session.closing_cash else None,
        expected_cash=float(session.expected_cash) if session.expected_cash else None,
        cash_variance=float(session.cash_variance) if session.cash_variance else None,
        total_sales=float(session.total_sales),
        total_cash_in=float(session.total_cash_in),
        total_cash_out=float(session.total_cash_out),
        payment_summary=payment_summary_list,
        sales_count=sales_count
    )


@router.get("/pos-sessions", response_model=list[SessionResponse])
async def list_sessions(
    user_id: Optional[int] = Query(None, description="Filter by user ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    """
    List POS sessions with optional filters.
    """
    query = POSSession.all()
    
    if user_id:
        query = query.filter(user_id=user_id)
    
    if status:
        query = query.filter(status=status)
    
    sessions = await query.prefetch_related('user').offset(skip).limit(limit)
    
    return [
        SessionResponse(
            id=session.id,
            session_number=session.session_number,
            user_id=session.user.id,
            user_name=session.user.full_name,
            status=session.status.value,
            opening_cash=float(session.opening_cash),
            opening_denominations=session.opening_denominations,
            closing_cash=float(session.closing_cash) if session.closing_cash else None,
            closing_denominations=session.closing_denominations,
            expected_cash=float(session.expected_cash) if session.expected_cash else None,
            cash_variance=float(session.cash_variance) if session.cash_variance else None,
            total_sales=float(session.total_sales),
            total_cash_in=float(session.total_cash_in),
            total_cash_out=float(session.total_cash_out),
            payment_summary=session.payment_summary,
            opened_at=session.opened_at,
            closed_at=session.closed_at,
            opening_notes=session.opening_notes,
            closing_notes=session.closing_notes
        )
        for session in sessions
    ]
