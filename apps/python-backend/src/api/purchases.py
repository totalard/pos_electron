"""
Purchase API endpoints
Handles inventory purchases with barcode scanning support
"""
import logging
from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status
from tortoise.exceptions import DoesNotExist
from tortoise.transactions import in_transaction

from ..database.models import (
    Purchase, PurchaseStatus, Product, StockTransaction,
    TransactionType, User, Account, AccountSubType,
    JournalEntry, JournalEntryLine, JournalEntryType, JournalEntryStatus
)
from .schemas import PurchaseCreate, PurchaseUpdate, PurchaseResponse

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/", response_model=List[PurchaseResponse])
async def get_purchases(
    status: Optional[str] = None,
    vendor_name: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Get all purchases with optional filtering"""
    try:
        query = Purchase.all()
        
        if status:
            query = query.filter(status=status)
        if vendor_name:
            query = query.filter(vendor_name__icontains=vendor_name)
        if start_date:
            query = query.filter(purchase_date__gte=datetime.fromisoformat(start_date))
        if end_date:
            query = query.filter(purchase_date__lte=datetime.fromisoformat(end_date))
        
        purchases = await query.prefetch_related('created_by', 'received_by').order_by('-purchase_date')
        
        return [PurchaseResponse.from_orm(p) for p in purchases]
    
    except Exception as e:
        logger.error(f"Failed to fetch purchases: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=PurchaseResponse, status_code=201)
async def create_purchase(purchase_data: PurchaseCreate, created_by_id: int = 1):
    """Create a new purchase order"""
    try:
        async with in_transaction():
            # Generate purchase number
            purchase_count = await Purchase.all().count()
            purchase_number = f"PO-{purchase_count + 1:06d}"
            
            # Create purchase
            purchase = await Purchase.create(
                purchase_number=purchase_number,
                vendor_name=purchase_data.vendor_name,
                vendor_contact=purchase_data.vendor_contact,
                vendor_address=purchase_data.vendor_address,
                purchase_date=purchase_data.purchase_date,
                expected_delivery_date=purchase_data.expected_delivery_date,
                subtotal=Decimal(str(purchase_data.subtotal)),
                tax_amount=Decimal(str(purchase_data.tax_amount)),
                shipping_cost=Decimal(str(purchase_data.shipping_cost)),
                total_amount=Decimal(str(purchase_data.total_amount)),
                payment_method=purchase_data.payment_method,
                items=purchase_data.items,
                invoice_number=purchase_data.invoice_number,
                notes=purchase_data.notes,
                status=PurchaseStatus.DRAFT,
                created_by_id=created_by_id
            )
            
            await purchase.fetch_related('created_by')
            logger.info(f"Created purchase: {purchase.purchase_number}")
            
            return PurchaseResponse.from_orm(purchase)
    
    except Exception as e:
        logger.error(f"Failed to create purchase: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{purchase_id}/receive", response_model=PurchaseResponse)
async def receive_purchase(purchase_id: int, received_by_id: int = 1):
    """Receive purchase and update inventory"""
    try:
        async with in_transaction():
            purchase = await Purchase.get(id=purchase_id)
            
            if purchase.status == PurchaseStatus.RECEIVED:
                raise HTTPException(status_code=400, detail="Purchase already received")
            
            # Update stock for each item
            for item in purchase.items:
                product = await Product.get(id=item['product_id'])
                
                if product.track_inventory:
                    stock_before = product.current_stock
                    quantity = item['quantity']
                    product.current_stock += quantity
                    await product.save()
                    
                    # Create stock transaction
                    await StockTransaction.create(
                        transaction_type=TransactionType.PURCHASE,
                        product=product,
                        quantity=quantity,
                        stock_before=stock_before,
                        stock_after=product.current_stock,
                        unit_cost=Decimal(str(item['unit_cost'])),
                        total_cost=Decimal(str(item['total_cost'])),
                        reference_number=purchase.purchase_number,
                        notes=f"Purchase from {purchase.vendor_name}",
                        performed_by_id=received_by_id
                    )
            
            # Create accounting journal entry
            await create_purchase_journal_entry(purchase, received_by_id)
            
            # Update purchase status
            purchase.status = PurchaseStatus.RECEIVED
            purchase.actual_delivery_date = datetime.now()
            purchase.received_by_id = received_by_id
            await purchase.save()
            
            await purchase.fetch_related('created_by', 'received_by')
            logger.info(f"Received purchase: {purchase.purchase_number}")
            
            return PurchaseResponse.from_orm(purchase)
    
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="Purchase not found")
    except Exception as e:
        logger.error(f"Failed to receive purchase: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def create_purchase_journal_entry(purchase: Purchase, user_id: int):
    """Create journal entry for purchase"""
    try:
        # Get accounts
        inventory_account = await Account.filter(account_subtype=AccountSubType.INVENTORY).first()
        payable_account = await Account.filter(account_subtype=AccountSubType.ACCOUNTS_PAYABLE).first()
        
        if not inventory_account or not payable_account:
            logger.warning("Inventory or Payable account not found, skipping journal entry")
            return
        
        # Generate entry number
        entry_count = await JournalEntry.all().count()
        entry_number = f"JE-{entry_count + 1:06d}"
        
        # Create journal entry
        entry = await JournalEntry.create(
            entry_number=entry_number,
            entry_date=purchase.purchase_date,
            entry_type=JournalEntryType.PURCHASE,
            description=f"Purchase from {purchase.vendor_name}",
            reference_type="purchase",
            reference_id=purchase.id,
            reference_number=purchase.purchase_number,
            status=JournalEntryStatus.POSTED,
            posted_at=datetime.now(),
            total_debit=purchase.total_amount,
            total_credit=purchase.total_amount,
            created_by_id=user_id,
            posted_by_id=user_id
        )
        
        # Debit: Inventory
        await JournalEntryLine.create(
            journal_entry=entry,
            account=inventory_account,
            description=f"Inventory purchase - {purchase.vendor_name}",
            debit_amount=purchase.total_amount,
            credit_amount=Decimal('0.00'),
            line_number=1
        )
        
        # Credit: Accounts Payable
        await JournalEntryLine.create(
            journal_entry=entry,
            account=payable_account,
            description=f"Payable to {purchase.vendor_name}",
            debit_amount=Decimal('0.00'),
            credit_amount=purchase.total_amount,
            line_number=2
        )
        
        # Update account balances
        inventory_account.update_balance(purchase.total_amount, True)
        await inventory_account.save()
        
        payable_account.update_balance(purchase.total_amount, False)
        await payable_account.save()
        
        logger.info(f"Created journal entry for purchase: {purchase.purchase_number}")
    
    except Exception as e:
        logger.error(f"Failed to create purchase journal entry: {e}")


@router.get("/{purchase_id}", response_model=PurchaseResponse)
async def get_purchase(purchase_id: int):
    """Get purchase by ID"""
    try:
        purchase = await Purchase.get(id=purchase_id).prefetch_related('created_by', 'received_by')
        return PurchaseResponse.from_orm(purchase)
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="Purchase not found")
    except Exception as e:
        logger.error(f"Failed to fetch purchase: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{purchase_id}", response_model=PurchaseResponse)
async def update_purchase(purchase_id: int, purchase_data: PurchaseUpdate):
    """Update purchase"""
    try:
        purchase = await Purchase.get(id=purchase_id)
        
        if purchase.status == PurchaseStatus.RECEIVED:
            raise HTTPException(status_code=400, detail="Cannot modify received purchase")
        
        update_data = purchase_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if value is not None:
                setattr(purchase, field, value)
        
        await purchase.save()
        await purchase.fetch_related('created_by', 'received_by')
        
        return PurchaseResponse.from_orm(purchase)
    
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="Purchase not found")
    except Exception as e:
        logger.error(f"Failed to update purchase: {e}")
        raise HTTPException(status_code=500, detail=str(e))
