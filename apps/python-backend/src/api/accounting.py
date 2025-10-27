"""
Accounting API endpoints
Provides comprehensive accounting functionality
"""
import logging
from datetime import datetime, timedelta
from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from tortoise.exceptions import DoesNotExist
from tortoise.transactions import in_transaction

from ..database.models import (
    Account, AccountType, JournalEntry, JournalEntryLine,
    JournalEntryStatus, JournalEntryType, FiscalYear, User
)
from .schemas import (
    AccountCreate, AccountUpdate, AccountResponse,
    JournalEntryCreate, JournalEntryResponse,
    FinancialReportResponse, TrialBalanceResponse,
    FiscalYearCreate, FiscalYearResponse
)

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/accounts", response_model=List[AccountResponse])
async def get_accounts(
    account_type: Optional[str] = None,
    is_active: Optional[bool] = True
):
    """Get all accounts"""
    try:
        query = Account.all()
        if account_type:
            query = query.filter(account_type=account_type)
        if is_active is not None:
            query = query.filter(is_active=is_active)
        
        accounts = await query.prefetch_related('created_by').order_by('account_code')
        return [AccountResponse.from_orm(acc) for acc in accounts]
    except Exception as e:
        logger.error(f"Failed to fetch accounts: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/accounts", response_model=AccountResponse, status_code=201)
async def create_account(account_data: AccountCreate, created_by_id: int = 1):
    """Create account"""
    try:
        account = await Account.create(**account_data.model_dump(), created_by_id=created_by_id)
        await account.fetch_related('created_by')
        return AccountResponse.from_orm(account)
    except Exception as e:
        logger.error(f"Failed to create account: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/journal-entries", response_model=List[JournalEntryResponse])
async def get_journal_entries(
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100)
):
    """Get journal entries"""
    try:
        query = JournalEntry.all()
        if status:
            query = query.filter(status=status)
        
        entries = await query.prefetch_related('lines', 'lines__account').offset((page - 1) * page_size).limit(page_size)
        return [JournalEntryResponse.from_orm(e) for e in entries]
    except Exception as e:
        logger.error(f"Failed to fetch journal entries: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/journal-entries", response_model=JournalEntryResponse, status_code=201)
async def create_journal_entry(entry_data: JournalEntryCreate, created_by_id: int = 1):
    """Create journal entry"""
    try:
        async with in_transaction():
            entry_count = await JournalEntry.all().count()
            entry_number = f"JE-{entry_count + 1:06d}"
            
            total_debit = sum(Decimal(str(l.debit_amount)) for l in entry_data.lines)
            total_credit = sum(Decimal(str(l.credit_amount)) for l in entry_data.lines)
            
            if total_debit != total_credit:
                raise HTTPException(status_code=400, detail="Entry not balanced")
            
            entry = await JournalEntry.create(
                entry_number=entry_number,
                entry_date=entry_data.entry_date,
                entry_type=entry_data.entry_type,
                description=entry_data.description,
                total_debit=total_debit,
                total_credit=total_credit,
                created_by_id=created_by_id
            )
            
            for idx, line_data in enumerate(entry_data.lines, start=1):
                await JournalEntryLine.create(
                    journal_entry=entry,
                    account_id=line_data.account_id,
                    debit_amount=Decimal(str(line_data.debit_amount)),
                    credit_amount=Decimal(str(line_data.credit_amount)),
                    line_number=idx
                )
            
            await entry.fetch_related('lines', 'lines__account')
            return JournalEntryResponse.from_orm(entry)
    except Exception as e:
        logger.error(f"Failed to create journal entry: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/reports/income-statement", response_model=FinancialReportResponse)
async def get_income_statement(start_date: Optional[str] = None, end_date: Optional[str] = None):
    """Get income statement"""
    try:
        income_accounts = await Account.filter(account_type=AccountType.INCOME, is_active=True).all()
        expense_accounts = await Account.filter(account_type=AccountType.EXPENSE, is_active=True).all()
        
        total_income = sum(acc.current_balance for acc in income_accounts)
        total_expenses = sum(acc.current_balance for acc in expense_accounts)
        
        return FinancialReportResponse(
            report_type="income_statement",
            start_date=datetime.fromisoformat(start_date) if start_date else datetime.now() - timedelta(days=365),
            end_date=datetime.fromisoformat(end_date) if end_date else datetime.now(),
            total_income=float(total_income),
            total_expenses=float(total_expenses),
            net_profit=float(total_income - total_expenses)
        )
    except Exception as e:
        logger.error(f"Failed to generate income statement: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/reports/trial-balance", response_model=TrialBalanceResponse)
async def get_trial_balance(as_of_date: Optional[str] = None):
    """Get trial balance report"""
    try:
        as_of = datetime.fromisoformat(as_of_date) if as_of_date else datetime.now()
        
        accounts = await Account.filter(is_active=True).order_by('account_code')
        
        account_balances = []
        total_debit = Decimal('0.00')
        total_credit = Decimal('0.00')
        
        for acc in accounts:
            balance = acc.current_balance
            if balance > 0:
                if acc.account_type in [AccountType.ASSET, AccountType.EXPENSE]:
                    total_debit += balance
                else:
                    total_credit += balance
            
            account_balances.append({
                "account_id": acc.id,
                "account_code": acc.account_code,
                "account_name": acc.account_name,
                "account_type": acc.account_type.value,
                "current_balance": float(balance),
                "total_debit": float(balance) if acc.account_type in [AccountType.ASSET, AccountType.EXPENSE] and balance > 0 else 0.0,
                "total_credit": float(balance) if acc.account_type not in [AccountType.ASSET, AccountType.EXPENSE] and balance > 0 else 0.0,
                "transaction_count": 0
            })
        
        return TrialBalanceResponse(
            as_of_date=as_of,
            accounts=account_balances,
            total_debit=float(total_debit),
            total_credit=float(total_credit),
            is_balanced=total_debit == total_credit
        )
    except Exception as e:
        logger.error(f"Failed to generate trial balance: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/fiscal-years", response_model=List[FiscalYearResponse])
async def get_fiscal_years():
    """Get fiscal years"""
    try:
        fiscal_years = await FiscalYear.all().order_by('-start_date')
        return [FiscalYearResponse.from_orm(fy) for fy in fiscal_years]
    except Exception as e:
        logger.error(f"Failed to fetch fiscal years: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/fiscal-years", response_model=FiscalYearResponse, status_code=201)
async def create_fiscal_year(fiscal_year_data: FiscalYearCreate, created_by_id: int = 1):
    """Create fiscal year"""
    try:
        fiscal_year = await FiscalYear.create(
            year_name=fiscal_year_data.year_name,
            start_date=fiscal_year_data.start_date,
            end_date=fiscal_year_data.end_date,
            opening_balance=Decimal(str(fiscal_year_data.opening_balance)),
            created_by_id=created_by_id
        )
        await fiscal_year.fetch_related('created_by', 'closed_by')
        return FiscalYearResponse.from_orm(fiscal_year)
    except Exception as e:
        logger.error(f"Failed to create fiscal year: {e}")
        raise HTTPException(status_code=500, detail=str(e))
