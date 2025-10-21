"""
Transaction Management API endpoints
Provides unified view of all transactions across the system
"""
import logging
from datetime import datetime, timedelta
from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from tortoise.exceptions import DoesNotExist

from ..database.models import (
    Sale,
    CashTransaction,
    Expense,
    StockTransaction,
    CustomerTransaction,
    User,
    Customer
)
from .schemas import (
    TransactionListResponse,
    TransactionSummary,
    UnifiedTransactionResponse,
    SaleResponse,
    CashTransactionResponse,
    ExpenseResponse,
    ExpenseCreate,
    ExpenseUpdate,
    CashTransactionCreate
)

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/overview", response_model=TransactionListResponse)
async def get_transaction_overview(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    transaction_types: Optional[str] = Query(None, description="Comma-separated list of transaction types"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    user_id: Optional[int] = None,
    search_query: Optional[str] = None
):
    """
    Get unified view of all transactions with filtering and pagination.
    
    Transaction types: sale, stock_in, stock_out, cash_in, cash_out, expense, credit, payment
    """
    try:
        # Parse filters
        type_filter = transaction_types.split(',') if transaction_types else None
        start_dt = datetime.fromisoformat(start_date) if start_date else None
        end_dt = datetime.fromisoformat(end_date) if end_date else None
        
        # Collect transactions from all sources
        unified_transactions = []
        
        # Sales transactions
        if not type_filter or 'sale' in type_filter:
            sales_query = Sale.all()
            if start_dt:
                sales_query = sales_query.filter(sale_date__gte=start_dt)
            if end_dt:
                sales_query = sales_query.filter(sale_date__lte=end_dt)
            if user_id:
                sales_query = sales_query.filter(sold_by_id=user_id)
            
            sales = await sales_query.prefetch_related('sold_by', 'customer')
            
            for sale in sales:
                unified_transactions.append({
                    'id': sale.id,
                    'transaction_type': 'sale',
                    'amount': float(sale.total_amount),
                    'description': f"Sale {sale.invoice_number}",
                    'reference_number': sale.invoice_number,
                    'status': sale.status.value,
                    'user_name': sale.sold_by.full_name if sale.sold_by else None,
                    'customer_name': sale.customer.name if sale.customer else None,
                    'created_at': sale.sale_date,
                    'metadata': {
                        'payment_method': sale.payment_method.value,
                        'items_count': len(sale.items) if sale.items else 0
                    }
                })
        
        # Stock Inward transactions (purchases)
        if not type_filter or 'stock_in' in type_filter:
            stock_in_query = StockTransaction.filter(transaction_type='purchase')
            if start_dt:
                stock_in_query = stock_in_query.filter(created_at__gte=start_dt)
            if end_dt:
                stock_in_query = stock_in_query.filter(created_at__lte=end_dt)
            if user_id:
                stock_in_query = stock_in_query.filter(performed_by_id=user_id)
            
            stock_ins = await stock_in_query.prefetch_related('performed_by', 'product')
            
            for trans in stock_ins:
                unified_transactions.append({
                    'id': trans.id,
                    'transaction_type': 'stock_in',
                    'amount': float(trans.total_cost) if trans.total_cost else 0.0,
                    'description': f"Stock In - {trans.product.name if trans.product else 'Unknown'}",
                    'reference_number': trans.reference_number,
                    'status': 'completed',
                    'user_name': trans.performed_by.full_name if trans.performed_by else None,
                    'customer_name': None,
                    'created_at': trans.created_at,
                    'metadata': {
                        'quantity': trans.quantity,
                        'product_name': trans.product.name if trans.product else None
                    }
                })
        
        # Stock Outward transactions (sales, damage, etc.)
        if not type_filter or 'stock_out' in type_filter:
            stock_out_query = StockTransaction.filter(transaction_type__in=['sale', 'damage', 'adjustment'])
            if start_dt:
                stock_out_query = stock_out_query.filter(created_at__gte=start_dt)
            if end_dt:
                stock_out_query = stock_out_query.filter(created_at__lte=end_dt)
            if user_id:
                stock_out_query = stock_out_query.filter(performed_by_id=user_id)
            
            stock_outs = await stock_out_query.prefetch_related('performed_by', 'product')
            
            for trans in stock_outs:
                unified_transactions.append({
                    'id': trans.id,
                    'transaction_type': 'stock_out',
                    'amount': float(trans.total_cost) if trans.total_cost else 0.0,
                    'description': f"Stock Out - {trans.product.name if trans.product else 'Unknown'}",
                    'reference_number': trans.reference_number,
                    'status': 'completed',
                    'user_name': trans.performed_by.full_name if trans.performed_by else None,
                    'customer_name': None,
                    'created_at': trans.created_at,
                    'metadata': {
                        'quantity': trans.quantity,
                        'product_name': trans.product.name if trans.product else None,
                        'type': trans.transaction_type.value
                    }
                })
        
        # Cash In transactions
        if not type_filter or 'cash_in' in type_filter:
            cash_in_query = CashTransaction.filter(transaction_type='cash_in')
            if start_dt:
                cash_in_query = cash_in_query.filter(transaction_date__gte=start_dt)
            if end_dt:
                cash_in_query = cash_in_query.filter(transaction_date__lte=end_dt)
            if user_id:
                cash_in_query = cash_in_query.filter(performed_by_id=user_id)
            
            cash_ins = await cash_in_query.prefetch_related('performed_by')
            
            for trans in cash_ins:
                unified_transactions.append({
                    'id': trans.id,
                    'transaction_type': 'cash_in',
                    'amount': float(trans.amount),
                    'description': trans.description or f"Cash In - {trans.category or 'General'}",
                    'reference_number': trans.reference_number,
                    'status': 'completed',
                    'user_name': trans.performed_by.full_name if trans.performed_by else None,
                    'customer_name': None,
                    'created_at': trans.transaction_date,
                    'metadata': {
                        'category': trans.category,
                        'balance_after': float(trans.balance_after)
                    }
                })
        
        # Cash Out transactions
        if not type_filter or 'cash_out' in type_filter:
            cash_out_query = CashTransaction.filter(transaction_type='cash_out')
            if start_dt:
                cash_out_query = cash_out_query.filter(transaction_date__gte=start_dt)
            if end_dt:
                cash_out_query = cash_out_query.filter(transaction_date__lte=end_dt)
            if user_id:
                cash_out_query = cash_out_query.filter(performed_by_id=user_id)
            
            cash_outs = await cash_out_query.prefetch_related('performed_by')
            
            for trans in cash_outs:
                unified_transactions.append({
                    'id': trans.id,
                    'transaction_type': 'cash_out',
                    'amount': float(trans.amount),
                    'description': trans.description or f"Cash Out - {trans.category or 'General'}",
                    'reference_number': trans.reference_number,
                    'status': 'completed',
                    'user_name': trans.performed_by.full_name if trans.performed_by else None,
                    'customer_name': None,
                    'created_at': trans.transaction_date,
                    'metadata': {
                        'category': trans.category,
                        'balance_after': float(trans.balance_after)
                    }
                })
        
        # Expenses
        if not type_filter or 'expense' in type_filter:
            expense_query = Expense.all()
            if start_dt:
                expense_query = expense_query.filter(expense_date__gte=start_dt)
            if end_dt:
                expense_query = expense_query.filter(expense_date__lte=end_dt)
            if user_id:
                expense_query = expense_query.filter(created_by_id=user_id)
            
            expenses = await expense_query.prefetch_related('created_by')
            
            for exp in expenses:
                unified_transactions.append({
                    'id': exp.id,
                    'transaction_type': 'expense',
                    'amount': float(exp.amount),
                    'description': f"{exp.title} - {exp.category.value}",
                    'reference_number': exp.expense_number,
                    'status': exp.status.value,
                    'user_name': exp.created_by.full_name if exp.created_by else None,
                    'customer_name': None,
                    'created_at': exp.expense_date,
                    'metadata': {
                        'vendor': exp.vendor_name,
                        'category': exp.category.value
                    }
                })
        
        # Customer Credit Sales
        if not type_filter or 'credit' in type_filter:
            credit_query = CustomerTransaction.filter(transaction_type='credit_sale')
            if start_dt:
                credit_query = credit_query.filter(created_at__gte=start_dt)
            if end_dt:
                credit_query = credit_query.filter(created_at__lte=end_dt)
            if user_id:
                credit_query = credit_query.filter(created_by_id=user_id)
            
            credits = await credit_query.prefetch_related('created_by', 'customer')
            
            for trans in credits:
                unified_transactions.append({
                    'id': trans.id,
                    'transaction_type': 'credit',
                    'amount': float(trans.amount),
                    'description': f"Credit Sale - {trans.customer.name if trans.customer else 'Unknown'}",
                    'reference_number': trans.reference_number,
                    'status': 'completed',
                    'user_name': trans.created_by.full_name if trans.created_by else None,
                    'customer_name': trans.customer.name if trans.customer else None,
                    'created_at': trans.created_at,
                    'metadata': {
                        'balance_after': float(trans.balance_after)
                    }
                })
        
        # Customer Payments
        if not type_filter or 'payment' in type_filter:
            payment_query = CustomerTransaction.filter(transaction_type='payment')
            if start_dt:
                payment_query = payment_query.filter(created_at__gte=start_dt)
            if end_dt:
                payment_query = payment_query.filter(created_at__lte=end_dt)
            if user_id:
                payment_query = payment_query.filter(created_by_id=user_id)
            
            payments = await payment_query.prefetch_related('created_by', 'customer')
            
            for trans in payments:
                unified_transactions.append({
                    'id': trans.id,
                    'transaction_type': 'payment',
                    'amount': float(trans.amount),
                    'description': f"Payment - {trans.customer.name if trans.customer else 'Unknown'}",
                    'reference_number': trans.reference_number,
                    'status': 'completed',
                    'user_name': trans.created_by.full_name if trans.created_by else None,
                    'customer_name': trans.customer.name if trans.customer else None,
                    'created_at': trans.created_at,
                    'metadata': {
                        'balance_after': float(trans.balance_after)
                    }
                })
        
        # Sort by date (most recent first)
        unified_transactions.sort(key=lambda x: x['created_at'], reverse=True)
        
        # Apply search filter if provided
        if search_query:
            search_lower = search_query.lower()
            unified_transactions = [
                t for t in unified_transactions
                if search_lower in t['description'].lower()
                or (t['reference_number'] and search_lower in t['reference_number'].lower())
                or (t['user_name'] and search_lower in t['user_name'].lower())
                or (t['customer_name'] and search_lower in t['customer_name'].lower())
            ]
        
        # Calculate summary
        total_sales = sum(t['amount'] for t in unified_transactions if t['transaction_type'] == 'sale')
        total_cash_in = sum(t['amount'] for t in unified_transactions if t['transaction_type'] == 'cash_in')
        total_cash_out = sum(t['amount'] for t in unified_transactions if t['transaction_type'] == 'cash_out')
        total_expenses = sum(t['amount'] for t in unified_transactions if t['transaction_type'] == 'expense')
        total_credit_sales = sum(t['amount'] for t in unified_transactions if t['transaction_type'] == 'credit')
        total_payments = sum(t['amount'] for t in unified_transactions if t['transaction_type'] == 'payment')
        
        summary = TransactionSummary(
            total_sales=total_sales,
            total_cash_in=total_cash_in,
            total_cash_out=total_cash_out,
            total_expenses=total_expenses,
            total_credit_sales=total_credit_sales,
            total_payments=total_payments,
            net_cash_flow=total_cash_in + total_sales + total_payments - total_cash_out - total_expenses,
            transaction_count=len(unified_transactions)
        )
        
        # Pagination
        total = len(unified_transactions)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paginated_transactions = unified_transactions[start_idx:end_idx]
        
        return TransactionListResponse(
            total=total,
            page=page,
            page_size=page_size,
            transactions=paginated_transactions,
            summary=summary
        )
    
    except Exception as e:
        logger.error(f"Failed to fetch transaction overview: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch transactions: {str(e)}"
        )


@router.get("/summary", response_model=TransactionSummary)
async def get_transaction_summary(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)")
):
    """Get transaction summary statistics"""
    try:
        start_dt = datetime.fromisoformat(start_date) if start_date else datetime.now() - timedelta(days=30)
        end_dt = datetime.fromisoformat(end_date) if end_date else datetime.now()
        
        # Calculate totals
        sales = await Sale.filter(sale_date__gte=start_dt, sale_date__lte=end_dt).all()
        total_sales = sum(float(s.total_amount) for s in sales)
        
        cash_ins = await CashTransaction.filter(
            transaction_type='cash_in',
            transaction_date__gte=start_dt,
            transaction_date__lte=end_dt
        ).all()
        total_cash_in = sum(float(c.amount) for c in cash_ins)
        
        cash_outs = await CashTransaction.filter(
            transaction_type='cash_out',
            transaction_date__gte=start_dt,
            transaction_date__lte=end_dt
        ).all()
        total_cash_out = sum(float(c.amount) for c in cash_outs)
        
        expenses = await Expense.filter(
            expense_date__gte=start_dt,
            expense_date__lte=end_dt
        ).all()
        total_expenses = sum(float(e.amount) for e in expenses)
        
        credit_sales = await CustomerTransaction.filter(
            transaction_type='credit_sale',
            created_at__gte=start_dt,
            created_at__lte=end_dt
        ).all()
        total_credit_sales = sum(float(c.amount) for c in credit_sales)
        
        payments = await CustomerTransaction.filter(
            transaction_type='payment',
            created_at__gte=start_dt,
            created_at__lte=end_dt
        ).all()
        total_payments = sum(float(p.amount) for p in payments)
        
        transaction_count = (
            len(sales) + len(cash_ins) + len(cash_outs) + 
            len(expenses) + len(credit_sales) + len(payments)
        )
        
        return TransactionSummary(
            total_sales=total_sales,
            total_cash_in=total_cash_in,
            total_cash_out=total_cash_out,
            total_expenses=total_expenses,
            total_credit_sales=total_credit_sales,
            total_payments=total_payments,
            net_cash_flow=total_cash_in + total_sales + total_payments - total_cash_out - total_expenses,
            transaction_count=transaction_count
        )
    
    except Exception as e:
        logger.error(f"Failed to calculate transaction summary: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate summary: {str(e)}"
        )


@router.post("/cash", response_model=CashTransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_cash_transaction(transaction_data: CashTransactionCreate, user_id: int = 1):
    """Create a new cash transaction"""
    try:
        # Get current cash balance
        last_transaction = await CashTransaction.all().order_by('-transaction_date').first()
        current_balance = float(last_transaction.balance_after) if last_transaction else Decimal('0.00')
        
        # Calculate new balance
        amount = Decimal(str(transaction_data.amount))
        if transaction_data.transaction_type == 'cash_in':
            new_balance = current_balance + amount
        else:
            new_balance = current_balance - amount
        
        # Create transaction
        transaction = await CashTransaction.create(
            transaction_type=transaction_data.transaction_type,
            amount=amount,
            balance_before=Decimal(str(current_balance)),
            balance_after=Decimal(str(new_balance)),
            category=transaction_data.category,
            description=transaction_data.description,
            reference_number=transaction_data.reference_number,
            notes=transaction_data.notes,
            performed_by_id=user_id
        )
        
        await transaction.fetch_related('performed_by')
        
        return CashTransactionResponse(
            id=transaction.id,
            transaction_type=transaction.transaction_type.value,
            amount=float(transaction.amount),
            balance_before=float(transaction.balance_before),
            balance_after=float(transaction.balance_after),
            category=transaction.category,
            description=transaction.description,
            reference_number=transaction.reference_number,
            notes=transaction.notes,
            performed_by_id=transaction.performed_by_id,
            performed_by_name=transaction.performed_by.full_name if transaction.performed_by else None,
            transaction_date=transaction.transaction_date,
            created_at=transaction.created_at
        )
    
    except Exception as e:
        logger.error(f"Failed to create cash transaction: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create transaction: {str(e)}"
        )


@router.post("/expenses", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
async def create_expense(expense_data: ExpenseCreate, user_id: int = 1):
    """Create a new expense"""
    try:
        # Generate expense number
        expense_count = await Expense.all().count()
        expense_number = f"EXP-{expense_count + 1:06d}"
        
        expense = await Expense.create(
            expense_number=expense_number,
            title=expense_data.title,
            description=expense_data.description,
            amount=Decimal(str(expense_data.amount)),
            category=expense_data.category,
            vendor_name=expense_data.vendor_name,
            vendor_contact=expense_data.vendor_contact,
            payment_method=expense_data.payment_method,
            payment_reference=expense_data.payment_reference,
            expense_date=expense_data.expense_date,
            due_date=expense_data.due_date,
            notes=expense_data.notes,
            created_by_id=user_id,
            status='pending'
        )
        
        await expense.fetch_related('created_by', 'approved_by')
        
        return ExpenseResponse(
            id=expense.id,
            expense_number=expense.expense_number,
            title=expense.title,
            description=expense.description,
            amount=float(expense.amount),
            category=expense.category.value,
            status=expense.status.value,
            vendor_name=expense.vendor_name,
            vendor_contact=expense.vendor_contact,
            payment_method=expense.payment_method,
            payment_reference=expense.payment_reference,
            expense_date=expense.expense_date,
            due_date=expense.due_date,
            payment_date=expense.payment_date,
            created_by_id=expense.created_by_id,
            created_by_name=expense.created_by.full_name if expense.created_by else None,
            approved_by_id=expense.approved_by_id,
            approved_by_name=expense.approved_by.full_name if expense.approved_by else None,
            notes=expense.notes,
            created_at=expense.created_at,
            updated_at=expense.updated_at
        )
    
    except Exception as e:
        logger.error(f"Failed to create expense: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create expense: {str(e)}"
        )


@router.get("/expenses", response_model=List[ExpenseResponse])
async def get_expenses(
    status: Optional[str] = None,
    category: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Get all expenses with optional filters"""
    try:
        query = Expense.all()
        
        if status:
            query = query.filter(status=status)
        if category:
            query = query.filter(category=category)
        if start_date:
            query = query.filter(expense_date__gte=datetime.fromisoformat(start_date))
        if end_date:
            query = query.filter(expense_date__lte=datetime.fromisoformat(end_date))
        
        expenses = await query.prefetch_related('created_by', 'approved_by').order_by('-expense_date')
        
        return [
            ExpenseResponse(
                id=exp.id,
                expense_number=exp.expense_number,
                title=exp.title,
                description=exp.description,
                amount=float(exp.amount),
                category=exp.category.value,
                status=exp.status.value,
                vendor_name=exp.vendor_name,
                vendor_contact=exp.vendor_contact,
                payment_method=exp.payment_method,
                payment_reference=exp.payment_reference,
                expense_date=exp.expense_date,
                due_date=exp.due_date,
                payment_date=exp.payment_date,
                created_by_id=exp.created_by_id,
                created_by_name=exp.created_by.full_name if exp.created_by else None,
                approved_by_id=exp.approved_by_id,
                approved_by_name=exp.approved_by.full_name if exp.approved_by else None,
                notes=exp.notes,
                created_at=exp.created_at,
                updated_at=exp.updated_at
            )
            for exp in expenses
        ]
    
    except Exception as e:
        logger.error(f"Failed to fetch expenses: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch expenses: {str(e)}"
        )


@router.put("/expenses/{expense_id}", response_model=ExpenseResponse)
async def update_expense(expense_id: int, expense_data: ExpenseUpdate):
    """Update an expense"""
    try:
        expense = await Expense.get(id=expense_id)
        
        update_data = expense_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if value is not None:
                setattr(expense, field, value)
        
        await expense.save()
        await expense.fetch_related('created_by', 'approved_by')
        
        return ExpenseResponse(
            id=expense.id,
            expense_number=expense.expense_number,
            title=expense.title,
            description=expense.description,
            amount=float(expense.amount),
            category=expense.category.value,
            status=expense.status.value,
            vendor_name=expense.vendor_name,
            vendor_contact=expense.vendor_contact,
            payment_method=expense.payment_method,
            payment_reference=expense.payment_reference,
            expense_date=expense.expense_date,
            due_date=expense.due_date,
            payment_date=expense.payment_date,
            created_by_id=expense.created_by_id,
            created_by_name=expense.created_by.full_name if expense.created_by else None,
            approved_by_id=expense.approved_by_id,
            approved_by_name=expense.approved_by.full_name if expense.approved_by else None,
            notes=expense.notes,
            created_at=expense.created_at,
            updated_at=expense.updated_at
        )
    
    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Expense with ID {expense_id} not found"
        )
    except Exception as e:
        logger.error(f"Failed to update expense: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update expense: {str(e)}"
        )
