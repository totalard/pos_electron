"""
Part 3: Journal Entries demo data with comprehensive double-entry transactions
"""
import random
from decimal import Decimal
from datetime import datetime, timedelta
from typing import List

from .models import (
    Account,
    AccountType,
    JournalEntry,
    JournalEntryLine,
    JournalEntryStatus,
    JournalEntryType,
    User
)


async def create_demo_journal_entries(accounts: List[Account]) -> List[JournalEntry]:
    """Create comprehensive journal entries with double-entry bookkeeping and edge cases."""
    print("Creating demo journal entries...")
    journal_entries = []
    
    user = await User.first()
    if not user or not accounts:
        print("No user or accounts found, skipping journal entries")
        return journal_entries
    
    # Create account lookup by code
    account_map = {acc.account_code: acc for acc in accounts}
    
    # Helper function to create journal entry with lines
    async def create_entry(entry_num, entry_date, entry_type, desc, lines_data, status=JournalEntryStatus.POSTED, ref_type=None, ref_num=None):
        """Create a journal entry with lines"""
        total_debit = sum(line["debit"] for line in lines_data)
        total_credit = sum(line["credit"] for line in lines_data)
        
        entry = await JournalEntry.create(
            entry_number=entry_num,
            entry_date=entry_date,
            entry_type=entry_type,
            description=desc,
            reference_type=ref_type,
            reference_number=ref_num,
            status=status,
            posted_at=entry_date if status == JournalEntryStatus.POSTED else None,
            total_debit=total_debit,
            total_credit=total_credit,
            created_by=user,
            posted_by=user if status == JournalEntryStatus.POSTED else None,
            notes=f"Demo journal entry for {desc}"
        )
        
        # Create lines
        for i, line_data in enumerate(lines_data, 1):
            account = account_map.get(line_data["account_code"])
            if account:
                await JournalEntryLine.create(
                    journal_entry=entry,
                    account=account,
                    description=line_data.get("desc", desc),
                    debit_amount=line_data["debit"],
                    credit_amount=line_data["credit"],
                    line_number=i
                )
        
        return entry
    
    # 1. Opening Entry (Owner's Capital Investment)
    entry_date1 = datetime.now() - timedelta(days=365)
    entry1 = await create_entry(
        f"JE-{entry_date1.strftime('%Y%m%d')}-001",
        entry_date1,
        JournalEntryType.OPENING,
        "Opening entry - Owner's capital investment",
        [
            {"account_code": "1100", "debit": Decimal("80000.00"), "credit": Decimal("0.00"), "desc": "Cash received from owner"},
            {"account_code": "3000", "debit": Decimal("0.00"), "credit": Decimal("80000.00"), "desc": "Owner's capital contribution"},
        ]
    )
    journal_entries.append(entry1)
    
    # 2. Purchase of Equipment
    entry_date2 = datetime.now() - timedelta(days=350)
    entry2 = await create_entry(
        f"JE-{entry_date2.strftime('%Y%m%d')}-002",
        entry_date2,
        JournalEntryType.PURCHASE,
        "Purchase of POS equipment and fixtures",
        [
            {"account_code": "1500", "debit": Decimal("12000.00"), "credit": Decimal("0.00"), "desc": "Equipment purchased"},
            {"account_code": "1100", "debit": Decimal("0.00"), "credit": Decimal("12000.00"), "desc": "Payment for equipment"},
        ],
        ref_type="purchase",
        ref_num="PO-EQUIP-001"
    )
    journal_entries.append(entry2)
    
    # 3. Inventory Purchase (on credit)
    entry_date3 = datetime.now() - timedelta(days=45)
    entry3 = await create_entry(
        f"JE-{entry_date3.strftime('%Y%m%d')}-003",
        entry_date3,
        JournalEntryType.PURCHASE,
        "Inventory purchase on credit",
        [
            {"account_code": "1200", "debit": Decimal("5000.00"), "credit": Decimal("0.00"), "desc": "Inventory purchased"},
            {"account_code": "2000", "debit": Decimal("0.00"), "credit": Decimal("5000.00"), "desc": "Accounts payable - vendor"},
        ],
        ref_type="purchase",
        ref_num="PO-20241001-001"
    )
    journal_entries.append(entry3)
    
    # 4. Sales Revenue (Cash)
    entry_date4 = datetime.now() - timedelta(days=30)
    entry4 = await create_entry(
        f"JE-{entry_date4.strftime('%Y%m%d')}-004",
        entry_date4,
        JournalEntryType.SALES,
        "Cash sales for the day",
        [
            {"account_code": "1000", "debit": Decimal("3500.00"), "credit": Decimal("0.00"), "desc": "Cash received from sales"},
            {"account_code": "4000", "debit": Decimal("0.00"), "credit": Decimal("3240.74"), "desc": "Sales revenue"},
            {"account_code": "2100", "debit": Decimal("0.00"), "credit": Decimal("259.26"), "desc": "Sales tax collected"},
        ],
        ref_type="sale",
        ref_num="DAILY-SALES-001"
    )
    journal_entries.append(entry4)
    
    # 5. Cost of Goods Sold
    entry_date5 = datetime.now() - timedelta(days=30)
    entry5 = await create_entry(
        f"JE-{entry_date5.strftime('%Y%m%d')}-005",
        entry_date5,
        JournalEntryType.SALES,
        "Cost of goods sold for daily sales",
        [
            {"account_code": "5000", "debit": Decimal("1800.00"), "credit": Decimal("0.00"), "desc": "Cost of goods sold"},
            {"account_code": "1200", "debit": Decimal("0.00"), "credit": Decimal("1800.00"), "desc": "Inventory reduction"},
        ],
        ref_type="sale",
        ref_num="DAILY-SALES-001"
    )
    journal_entries.append(entry5)
    
    # 6. Credit Sales
    entry_date6 = datetime.now() - timedelta(days=25)
    entry6 = await create_entry(
        f"JE-{entry_date6.strftime('%Y%m%d')}-006",
        entry_date6,
        JournalEntryType.SALES,
        "Credit sales to customer",
        [
            {"account_code": "1300", "debit": Decimal("2500.00"), "credit": Decimal("0.00"), "desc": "Accounts receivable"},
            {"account_code": "4000", "debit": Decimal("0.00"), "credit": Decimal("2314.81"), "desc": "Sales revenue"},
            {"account_code": "2100", "debit": Decimal("0.00"), "credit": Decimal("185.19"), "desc": "Sales tax collected"},
        ],
        ref_type="sale",
        ref_num="INV-CR-001"
    )
    journal_entries.append(entry6)
    
    # 7. Payment Received from Customer
    entry_date7 = datetime.now() - timedelta(days=20)
    entry7 = await create_entry(
        f"JE-{entry_date7.strftime('%Y%m%d')}-007",
        entry_date7,
        JournalEntryType.RECEIPT,
        "Payment received from customer",
        [
            {"account_code": "1100", "debit": Decimal("2500.00"), "credit": Decimal("0.00"), "desc": "Bank deposit"},
            {"account_code": "1300", "debit": Decimal("0.00"), "credit": Decimal("2500.00"), "desc": "Accounts receivable cleared"},
        ],
        ref_type="payment",
        ref_num="RCPT-001"
    )
    journal_entries.append(entry7)
    
    # 8. Rent Expense Payment
    entry_date8 = datetime.now() - timedelta(days=15)
    entry8 = await create_entry(
        f"JE-{entry_date8.strftime('%Y%m%d')}-008",
        entry_date8,
        JournalEntryType.PAYMENT,
        "Monthly rent payment",
        [
            {"account_code": "5100", "debit": Decimal("2500.00"), "credit": Decimal("0.00"), "desc": "Rent expense"},
            {"account_code": "1100", "debit": Decimal("0.00"), "credit": Decimal("2500.00"), "desc": "Bank payment"},
        ],
        ref_type="expense",
        ref_num="EXP-RENT-001"
    )
    journal_entries.append(entry8)
    
    # 9. Salary Payment
    entry_date9 = datetime.now() - timedelta(days=10)
    entry9 = await create_entry(
        f"JE-{entry_date9.strftime('%Y%m%d')}-009",
        entry_date9,
        JournalEntryType.PAYMENT,
        "Employee salary payment",
        [
            {"account_code": "5300", "debit": Decimal("8500.00"), "credit": Decimal("0.00"), "desc": "Salaries expense"},
            {"account_code": "1100", "debit": Decimal("0.00"), "credit": Decimal("8500.00"), "desc": "Bank payment"},
        ],
        ref_type="expense",
        ref_num="EXP-SAL-001"
    )
    journal_entries.append(entry9)
    
    # 10. Utilities Payment
    entry_date10 = datetime.now() - timedelta(days=8)
    entry10 = await create_entry(
        f"JE-{entry_date10.strftime('%Y%m%d')}-010",
        entry_date10,
        JournalEntryType.PAYMENT,
        "Utilities payment",
        [
            {"account_code": "5200", "debit": Decimal("350.75"), "credit": Decimal("0.00"), "desc": "Utilities expense"},
            {"account_code": "1100", "debit": Decimal("0.00"), "credit": Decimal("350.75"), "desc": "Bank payment"},
        ],
        ref_type="expense",
        ref_num="EXP-UTIL-001"
    )
    journal_entries.append(entry10)
    
    # 11. Depreciation Adjustment
    entry_date11 = datetime.now() - timedelta(days=5)
    entry11 = await create_entry(
        f"JE-{entry_date11.strftime('%Y%m%d')}-011",
        entry_date11,
        JournalEntryType.ADJUSTMENT,
        "Monthly depreciation on equipment",
        [
            {"account_code": "5920", "debit": Decimal("200.00"), "credit": Decimal("0.00"), "desc": "Depreciation expense"},
            {"account_code": "1510", "debit": Decimal("0.00"), "credit": Decimal("200.00"), "desc": "Accumulated depreciation"},
        ]
    )
    journal_entries.append(entry11)
    
    # 12. Bad Debt Write-off
    entry_date12 = datetime.now() - timedelta(days=3)
    entry12 = await create_entry(
        f"JE-{entry_date12.strftime('%Y%m%d')}-012",
        entry_date12,
        JournalEntryType.ADJUSTMENT,
        "Write-off uncollectible receivable",
        [
            {"account_code": "5930", "debit": Decimal("500.00"), "credit": Decimal("0.00"), "desc": "Bad debt expense"},
            {"account_code": "1300", "debit": Decimal("0.00"), "credit": Decimal("500.00"), "desc": "Accounts receivable write-off"},
        ]
    )
    journal_entries.append(entry12)
    
    # 13. Owner's Drawing
    entry_date13 = datetime.now() - timedelta(days=7)
    entry13 = await create_entry(
        f"JE-{entry_date13.strftime('%Y%m%d')}-013",
        entry_date13,
        JournalEntryType.GENERAL,
        "Owner's withdrawal",
        [
            {"account_code": "3200", "debit": Decimal("2000.00"), "credit": Decimal("0.00"), "desc": "Owner's drawings"},
            {"account_code": "1100", "debit": Decimal("0.00"), "credit": Decimal("2000.00"), "desc": "Bank withdrawal"},
        ]
    )
    journal_entries.append(entry13)
    
    # 14. Loan Payment (Principal + Interest)
    entry_date14 = datetime.now() - timedelta(days=12)
    entry14 = await create_entry(
        f"JE-{entry_date14.strftime('%Y%m%d')}-014",
        entry_date14,
        JournalEntryType.PAYMENT,
        "Monthly loan payment",
        [
            {"account_code": "2300", "debit": Decimal("800.00"), "credit": Decimal("0.00"), "desc": "Loan principal payment"},
            {"account_code": "5999", "debit": Decimal("150.00"), "credit": Decimal("0.00"), "desc": "Interest expense"},
            {"account_code": "1100", "debit": Decimal("0.00"), "credit": Decimal("950.00"), "desc": "Bank payment"},
        ],
        ref_type="payment",
        ref_num="LOAN-PMT-001"
    )
    journal_entries.append(entry14)
    
    # 15. Prepaid Insurance
    entry_date15 = datetime.now() - timedelta(days=60)
    entry15 = await create_entry(
        f"JE-{entry_date15.strftime('%Y%m%d')}-015",
        entry_date15,
        JournalEntryType.PAYMENT,
        "Annual insurance premium paid",
        [
            {"account_code": "1400", "debit": Decimal("2400.00"), "credit": Decimal("0.00"), "desc": "Prepaid insurance"},
            {"account_code": "1100", "debit": Decimal("0.00"), "credit": Decimal("2400.00"), "desc": "Bank payment"},
        ],
        ref_type="expense",
        ref_num="EXP-INS-001"
    )
    journal_entries.append(entry15)
    
    # 16. Insurance Expense Recognition (Monthly)
    entry_date16 = datetime.now() - timedelta(days=30)
    entry16 = await create_entry(
        f"JE-{entry_date16.strftime('%Y%m%d')}-016",
        entry_date16,
        JournalEntryType.ADJUSTMENT,
        "Monthly insurance expense recognition",
        [
            {"account_code": "5800", "debit": Decimal("200.00"), "credit": Decimal("0.00"), "desc": "Insurance expense"},
            {"account_code": "1400", "debit": Decimal("0.00"), "credit": Decimal("200.00"), "desc": "Prepaid insurance reduction"},
        ]
    )
    journal_entries.append(entry16)
    
    # 17. Customer Deposit (Unearned Revenue)
    entry_date17 = datetime.now() - timedelta(days=14)
    entry17 = await create_entry(
        f"JE-{entry_date17.strftime('%Y%m%d')}-017",
        entry_date17,
        JournalEntryType.RECEIPT,
        "Customer deposit for future order",
        [
            {"account_code": "1100", "debit": Decimal("1500.00"), "credit": Decimal("0.00"), "desc": "Bank deposit"},
            {"account_code": "2400", "debit": Decimal("0.00"), "credit": Decimal("1500.00"), "desc": "Unearned revenue"},
        ],
        ref_type="payment",
        ref_num="DEP-001"
    )
    journal_entries.append(entry17)
    
    # 18. Bank Fees
    entry_date18 = datetime.now() - timedelta(days=6)
    entry18 = await create_entry(
        f"JE-{entry_date18.strftime('%Y%m%d')}-018",
        entry_date18,
        JournalEntryType.ADJUSTMENT,
        "Bank service charges",
        [
            {"account_code": "5910", "debit": Decimal("25.00"), "credit": Decimal("0.00"), "desc": "Bank fees"},
            {"account_code": "1100", "debit": Decimal("0.00"), "credit": Decimal("25.00"), "desc": "Bank deduction"},
        ]
    )
    journal_entries.append(entry18)
    
    # 19. Interest Income
    entry_date19 = datetime.now() - timedelta(days=4)
    entry19 = await create_entry(
        f"JE-{entry_date19.strftime('%Y%m%d')}-019",
        entry_date19,
        JournalEntryType.RECEIPT,
        "Interest earned on savings account",
        [
            {"account_code": "1110", "debit": Decimal("125.00"), "credit": Decimal("0.00"), "desc": "Bank interest received"},
            {"account_code": "4200", "debit": Decimal("0.00"), "credit": Decimal("125.00"), "desc": "Interest income"},
        ]
    )
    journal_entries.append(entry19)
    
    # 20. Draft Entry (Not Posted) - Edge Case
    entry_date20 = datetime.now() - timedelta(days=1)
    entry20 = await create_entry(
        f"JE-{entry_date20.strftime('%Y%m%d')}-020",
        entry_date20,
        JournalEntryType.GENERAL,
        "Draft entry - pending review",
        [
            {"account_code": "5500", "debit": Decimal("500.00"), "credit": Decimal("0.00"), "desc": "Marketing expense"},
            {"account_code": "1100", "debit": Decimal("0.00"), "credit": Decimal("500.00"), "desc": "Bank payment"},
        ],
        status=JournalEntryStatus.DRAFT
    )
    journal_entries.append(entry20)
    
    # 21. Void Entry - Edge Case
    entry_date21 = datetime.now() - timedelta(days=50)
    entry21 = await create_entry(
        f"JE-{entry_date21.strftime('%Y%m%d')}-021",
        entry_date21,
        JournalEntryType.GENERAL,
        "Voided entry - incorrect amount",
        [
            {"account_code": "5400", "debit": Decimal("100.00"), "credit": Decimal("0.00"), "desc": "Supplies expense"},
            {"account_code": "1000", "debit": Decimal("0.00"), "credit": Decimal("100.00"), "desc": "Cash payment"},
        ],
        status=JournalEntryStatus.VOID
    )
    journal_entries.append(entry21)
    
    # 22. Zero Amount Entry - Edge Case
    entry_date22 = datetime.now() - timedelta(days=2)
    entry22 = await create_entry(
        f"JE-{entry_date22.strftime('%Y%m%d')}-022",
        entry_date22,
        JournalEntryType.ADJUSTMENT,
        "Correction entry - zero net effect",
        [
            {"account_code": "1000", "debit": Decimal("0.00"), "credit": Decimal("0.00"), "desc": "No change"},
            {"account_code": "1100", "debit": Decimal("0.00"), "credit": Decimal("0.00"), "desc": "No change"},
        ],
        status=JournalEntryStatus.POSTED
    )
    journal_entries.append(entry22)
    
    # 23. Large Transaction - Edge Case
    entry_date23 = datetime.now() - timedelta(days=90)
    entry23 = await create_entry(
        f"JE-{entry_date23.strftime('%Y%m%d')}-023",
        entry_date23,
        JournalEntryType.PURCHASE,
        "Bulk inventory purchase",
        [
            {"account_code": "1200", "debit": Decimal("50000.00"), "credit": Decimal("0.00"), "desc": "Inventory purchased"},
            {"account_code": "1100", "debit": Decimal("0.00"), "credit": Decimal("30000.00"), "desc": "Cash payment"},
            {"account_code": "2000", "debit": Decimal("0.00"), "credit": Decimal("20000.00"), "desc": "Accounts payable"},
        ],
        ref_type="purchase",
        ref_num="PO-BULK-001"
    )
    journal_entries.append(entry23)
    
    # 24. Year-End Closing Entry
    last_year = datetime.now().year - 1
    entry_date24 = datetime(last_year, 12, 31)
    entry24 = await create_entry(
        f"JE-{entry_date24.strftime('%Y%m%d')}-024",
        entry_date24,
        JournalEntryType.CLOSING,
        "Year-end closing - transfer net income to retained earnings",
        [
            {"account_code": "4000", "debit": Decimal("15450.00"), "credit": Decimal("0.00"), "desc": "Close revenue accounts"},
            {"account_code": "3100", "debit": Decimal("0.00"), "credit": Decimal("15450.00"), "desc": "Transfer to retained earnings"},
        ]
    )
    journal_entries.append(entry24)
    
    print(f"Created {len(journal_entries)} journal entries with comprehensive double-entry transactions")
    return journal_entries
