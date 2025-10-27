"""
Accounting service for automatic journal entry creation
"""
import logging
from datetime import datetime
from decimal import Decimal
from typing import Optional

from ..database.models import (
    Account, AccountSubType, JournalEntry, JournalEntryLine,
    JournalEntryType, JournalEntryStatus, Sale, Expense, CashTransaction
)

logger = logging.getLogger(__name__)


async def create_sale_journal_entry(sale: Sale, user_id: int = 1) -> Optional[JournalEntry]:
    """
    Automatically create journal entry for a sale.
    
    Debit: Cash/Bank (Asset)
    Credit: Sales Revenue (Income)
    Credit: Tax Payable (if applicable)
    """
    try:
        # Get required accounts
        cash_account = await Account.filter(account_subtype=AccountSubType.CASH).first()
        revenue_account = await Account.filter(account_subtype=AccountSubType.SALES_REVENUE).first()
        
        if not cash_account or not revenue_account:
            logger.warning("Required accounts not found for sale journal entry")
            return None
        
        # Generate entry number
        entry_count = await JournalEntry.all().count()
        entry_number = f"JE-{entry_count + 1:06d}"
        
        # Create journal entry
        entry = await JournalEntry.create(
            entry_number=entry_number,
            entry_date=sale.sale_date,
            entry_type=JournalEntryType.SALES,
            description=f"Sale {sale.invoice_number}",
            reference_type="sale",
            reference_id=sale.id,
            reference_number=sale.invoice_number,
            status=JournalEntryStatus.POSTED,
            posted_at=datetime.now(),
            total_debit=sale.total_amount,
            total_credit=sale.total_amount,
            created_by_id=user_id,
            posted_by_id=user_id
        )
        
        # Debit: Cash (increase asset)
        await JournalEntryLine.create(
            journal_entry=entry,
            account=cash_account,
            description=f"Cash from sale {sale.invoice_number}",
            debit_amount=sale.total_amount,
            credit_amount=Decimal('0.00'),
            line_number=1
        )
        
        # Credit: Sales Revenue (increase income)
        await JournalEntryLine.create(
            journal_entry=entry,
            account=revenue_account,
            description=f"Revenue from sale {sale.invoice_number}",
            debit_amount=Decimal('0.00'),
            credit_amount=sale.subtotal,
            line_number=2
        )
        
        # If there's tax, credit tax payable
        if sale.tax_amount > 0:
            # For simplicity, we'll add it to revenue for now
            # In a full system, you'd have a separate Tax Payable liability account
            pass
        
        # Update account balances
        cash_account.update_balance(sale.total_amount, True)  # Debit increases cash
        await cash_account.save()
        
        revenue_account.update_balance(sale.subtotal, False)  # Credit increases revenue
        await revenue_account.save()
        
        logger.info(f"Created journal entry for sale: {sale.invoice_number}")
        return entry
    
    except Exception as e:
        logger.error(f"Failed to create sale journal entry: {e}")
        return None


async def create_expense_journal_entry(expense: Expense, user_id: int = 1) -> Optional[JournalEntry]:
    """
    Automatically create journal entry for an expense.
    
    Debit: Expense Account
    Credit: Cash/Bank
    """
    try:
        # Get accounts
        cash_account = await Account.filter(account_subtype=AccountSubType.CASH).first()
        
        # Map expense category to account subtype
        expense_subtype_map = {
            "rent": AccountSubType.RENT,
            "utilities": AccountSubType.UTILITIES,
            "salaries": AccountSubType.SALARIES,
            "supplies": AccountSubType.SUPPLIES,
            "marketing": AccountSubType.MARKETING,
            "maintenance": AccountSubType.MAINTENANCE,
            "transportation": AccountSubType.TRANSPORTATION,
            "insurance": AccountSubType.INSURANCE,
            "taxes": AccountSubType.TAXES,
            "other": AccountSubType.OTHER_EXPENSES
        }
        
        expense_subtype = expense_subtype_map.get(expense.category.value, AccountSubType.OTHER_EXPENSES)
        expense_account = await Account.filter(account_subtype=expense_subtype).first()
        
        if not cash_account or not expense_account:
            logger.warning("Required accounts not found for expense journal entry")
            return None
        
        # Generate entry number
        entry_count = await JournalEntry.all().count()
        entry_number = f"JE-{entry_count + 1:06d}"
        
        # Create journal entry
        entry = await JournalEntry.create(
            entry_number=entry_number,
            entry_date=expense.expense_date,
            entry_type=JournalEntryType.GENERAL,
            description=f"Expense: {expense.title}",
            reference_type="expense",
            reference_id=expense.id,
            reference_number=expense.expense_number,
            status=JournalEntryStatus.POSTED,
            posted_at=datetime.now(),
            total_debit=expense.amount,
            total_credit=expense.amount,
            created_by_id=user_id,
            posted_by_id=user_id
        )
        
        # Debit: Expense Account (increase expense)
        await JournalEntryLine.create(
            journal_entry=entry,
            account=expense_account,
            description=expense.title,
            debit_amount=expense.amount,
            credit_amount=Decimal('0.00'),
            line_number=1
        )
        
        # Credit: Cash (decrease asset)
        await JournalEntryLine.create(
            journal_entry=entry,
            account=cash_account,
            description=f"Payment for {expense.title}",
            debit_amount=Decimal('0.00'),
            credit_amount=expense.amount,
            line_number=2
        )
        
        # Update account balances
        expense_account.update_balance(expense.amount, True)  # Debit increases expense
        await expense_account.save()
        
        cash_account.update_balance(expense.amount, False)  # Credit decreases cash
        await cash_account.save()
        
        logger.info(f"Created journal entry for expense: {expense.expense_number}")
        return entry
    
    except Exception as e:
        logger.error(f"Failed to create expense journal entry: {e}")
        return None


async def create_cash_transaction_journal_entry(
    cash_transaction: CashTransaction,
    user_id: int = 1
) -> Optional[JournalEntry]:
    """
    Create journal entry for cash in/out transactions.
    """
    try:
        cash_account = await Account.filter(account_subtype=AccountSubType.CASH).first()
        
        if not cash_account:
            logger.warning("Cash account not found")
            return None
        
        # For cash in/out, we need a corresponding account
        # This could be "Other Income" or "Other Expenses"
        if cash_transaction.transaction_type.value == "cash_in":
            other_account = await Account.filter(account_subtype=AccountSubType.OTHER_INCOME).first()
            is_cash_debit = True
        else:
            other_account = await Account.filter(account_subtype=AccountSubType.OTHER_EXPENSES).first()
            is_cash_debit = False
        
        if not other_account:
            logger.warning("Corresponding account not found for cash transaction")
            return None
        
        # Generate entry number
        entry_count = await JournalEntry.all().count()
        entry_number = f"JE-{entry_count + 1:06d}"
        
        # Create journal entry
        entry = await JournalEntry.create(
            entry_number=entry_number,
            entry_date=cash_transaction.transaction_date,
            entry_type=JournalEntryType.RECEIPT if is_cash_debit else JournalEntryType.PAYMENT,
            description=cash_transaction.description or f"Cash {cash_transaction.transaction_type.value}",
            reference_type="cash_transaction",
            reference_id=cash_transaction.id,
            reference_number=cash_transaction.reference_number,
            status=JournalEntryStatus.POSTED,
            posted_at=datetime.now(),
            total_debit=cash_transaction.amount,
            total_credit=cash_transaction.amount,
            created_by_id=user_id,
            posted_by_id=user_id
        )
        
        if is_cash_debit:
            # Cash In: Debit Cash, Credit Other Income
            await JournalEntryLine.create(
                journal_entry=entry,
                account=cash_account,
                description="Cash received",
                debit_amount=cash_transaction.amount,
                credit_amount=Decimal('0.00'),
                line_number=1
            )
            await JournalEntryLine.create(
                journal_entry=entry,
                account=other_account,
                description=cash_transaction.description or "Other income",
                debit_amount=Decimal('0.00'),
                credit_amount=cash_transaction.amount,
                line_number=2
            )
            
            cash_account.update_balance(cash_transaction.amount, True)
            other_account.update_balance(cash_transaction.amount, False)
        else:
            # Cash Out: Debit Other Expense, Credit Cash
            await JournalEntryLine.create(
                journal_entry=entry,
                account=other_account,
                description=cash_transaction.description or "Other expense",
                debit_amount=cash_transaction.amount,
                credit_amount=Decimal('0.00'),
                line_number=1
            )
            await JournalEntryLine.create(
                journal_entry=entry,
                account=cash_account,
                description="Cash paid",
                debit_amount=Decimal('0.00'),
                credit_amount=cash_transaction.amount,
                line_number=2
            )
            
            other_account.update_balance(cash_transaction.amount, True)
            cash_account.update_balance(cash_transaction.amount, False)
        
        await cash_account.save()
        await other_account.save()
        
        logger.info(f"Created journal entry for cash transaction: {cash_transaction.id}")
        return entry
    
    except Exception as e:
        logger.error(f"Failed to create cash transaction journal entry: {e}")
        return None
