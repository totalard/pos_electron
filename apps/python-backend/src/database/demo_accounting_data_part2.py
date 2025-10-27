"""
Part 2: Purchases and Journal Entries demo data
"""
import random
from decimal import Decimal
from datetime import datetime, timedelta
from typing import List

from .models import (
    Account,
    JournalEntry,
    JournalEntryLine,
    JournalEntryStatus,
    JournalEntryType,
    Purchase,
    PurchaseStatus,
    Product,
    ProductType,
    User
)


async def create_demo_purchases(products: List[Product]) -> List[Purchase]:
    """Create comprehensive purchase records with all statuses and edge cases."""
    print("Creating demo purchases...")
    purchases = []
    
    user = await User.first()
    if not user or not products:
        print("No user or products found, skipping purchases")
        return purchases
    
    # Get inventory products
    inventory_products = [p for p in products if p.track_inventory and p.product_type == ProductType.SIMPLE][:10]
    if not inventory_products:
        print("No inventory products found, skipping purchases")
        return purchases
    
    vendors = [
        {"name": "Tech Supplies Inc.", "contact": "+1-555-1001", "address": "123 Supplier St, City, State"},
        {"name": "Global Electronics", "contact": "+1-555-1002", "address": "456 Vendor Ave, City, State"},
        {"name": "Wholesale Goods Co.", "contact": "+1-555-1003", "address": "789 Trade Rd, City, State"},
        {"name": "Quick Supply Partners", "contact": "+1-555-1004", "address": "321 Commerce Blvd, City, State"},
    ]
    
    # Purchase 1: Received and fully paid
    purchase_date1 = datetime.now() - timedelta(days=45)
    items1 = []
    subtotal1 = Decimal("0.00")
    for product in inventory_products[:3]:
        qty = random.randint(20, 50)
        unit_cost = product.cost_price
        total = unit_cost * qty
        items1.append({
            "product_id": product.id,
            "product_name": product.name,
            "sku": product.sku,
            "quantity": qty,
            "unit_cost": float(unit_cost),
            "total": float(total)
        })
        subtotal1 += total
    
    tax1 = subtotal1 * Decimal("0.08")
    total1 = subtotal1 + tax1 + Decimal("50.00")
    
    purchase1 = await Purchase.create(
        purchase_number=f"PO-{purchase_date1.strftime('%Y%m%d')}-001",
        vendor_name=vendors[0]["name"],
        vendor_contact=vendors[0]["contact"],
        vendor_address=vendors[0]["address"],
        purchase_date=purchase_date1,
        expected_delivery_date=purchase_date1 + timedelta(days=7),
        actual_delivery_date=purchase_date1 + timedelta(days=5),
        subtotal=subtotal1,
        tax_amount=tax1,
        shipping_cost=Decimal("50.00"),
        other_charges=Decimal("0.00"),
        total_amount=total1,
        payment_method="bank_transfer",
        payment_reference="TXN-45678",
        payment_status="paid",
        amount_paid=total1,
        status=PurchaseStatus.RECEIVED,
        items=items1,
        invoice_number=f"INV-VENDOR-{random.randint(10000, 99999)}",
        notes="Delivered on time, all items received in good condition",
        created_by=user,
        received_by=user
    )
    purchases.append(purchase1)
    
    # Purchase 2: Partial payment
    purchase_date2 = datetime.now() - timedelta(days=20)
    items2 = []
    subtotal2 = Decimal("0.00")
    for product in inventory_products[3:6]:
        qty = random.randint(15, 40)
        unit_cost = product.cost_price
        total = unit_cost * qty
        items2.append({
            "product_id": product.id,
            "product_name": product.name,
            "sku": product.sku,
            "quantity": qty,
            "unit_cost": float(unit_cost),
            "total": float(total)
        })
        subtotal2 += total
    
    tax2 = subtotal2 * Decimal("0.08")
    total2 = subtotal2 + tax2 + Decimal("75.00") + Decimal("25.00")
    partial_payment = total2 * Decimal("0.6")
    
    purchase2 = await Purchase.create(
        purchase_number=f"PO-{purchase_date2.strftime('%Y%m%d')}-002",
        vendor_name=vendors[1]["name"],
        vendor_contact=vendors[1]["contact"],
        vendor_address=vendors[1]["address"],
        purchase_date=purchase_date2,
        expected_delivery_date=purchase_date2 + timedelta(days=10),
        actual_delivery_date=purchase_date2 + timedelta(days=8),
        subtotal=subtotal2,
        tax_amount=tax2,
        shipping_cost=Decimal("75.00"),
        other_charges=Decimal("25.00"),
        total_amount=total2,
        payment_method="credit_card",
        payment_reference="CC-89012",
        payment_status="partial",
        amount_paid=partial_payment,
        status=PurchaseStatus.RECEIVED,
        items=items2,
        invoice_number=f"INV-VENDOR-{random.randint(10000, 99999)}",
        notes="Partial payment made, balance due in 30 days",
        created_by=user,
        received_by=user
    )
    purchases.append(purchase2)
    
    # Purchase 3: Ordered but not received
    purchase_date3 = datetime.now() - timedelta(days=5)
    items3 = []
    subtotal3 = Decimal("0.00")
    for product in inventory_products[6:8]:
        qty = random.randint(10, 30)
        unit_cost = product.cost_price
        total = unit_cost * qty
        items3.append({
            "product_id": product.id,
            "product_name": product.name,
            "sku": product.sku,
            "quantity": qty,
            "unit_cost": float(unit_cost),
            "total": float(total)
        })
        subtotal3 += total
    
    tax3 = subtotal3 * Decimal("0.08")
    total3 = subtotal3 + tax3 + Decimal("100.00")
    
    purchase3 = await Purchase.create(
        purchase_number=f"PO-{purchase_date3.strftime('%Y%m%d')}-003",
        vendor_name=vendors[2]["name"],
        vendor_contact=vendors[2]["contact"],
        vendor_address=vendors[2]["address"],
        purchase_date=purchase_date3,
        expected_delivery_date=purchase_date3 + timedelta(days=14),
        subtotal=subtotal3,
        tax_amount=tax3,
        shipping_cost=Decimal("100.00"),
        other_charges=Decimal("0.00"),
        total_amount=total3,
        payment_method="bank_transfer",
        payment_status="unpaid",
        amount_paid=Decimal("0.00"),
        status=PurchaseStatus.ORDERED,
        items=items3,
        invoice_number=f"INV-VENDOR-{random.randint(10000, 99999)}",
        notes="Order placed, awaiting delivery",
        created_by=user
    )
    purchases.append(purchase3)
    
    # Purchase 4: Draft
    purchase_date4 = datetime.now() - timedelta(days=2)
    items4 = []
    subtotal4 = Decimal("0.00")
    if len(inventory_products) >= 10:
        for product in inventory_products[8:10]:
            qty = random.randint(5, 20)
            unit_cost = product.cost_price
            total = unit_cost * qty
            items4.append({
                "product_id": product.id,
                "product_name": product.name,
                "sku": product.sku,
                "quantity": qty,
                "unit_cost": float(unit_cost),
                "total": float(total)
            })
            subtotal4 += total
    
    tax4 = subtotal4 * Decimal("0.08")
    total4 = subtotal4 + tax4 + Decimal("35.00")
    
    purchase4 = await Purchase.create(
        purchase_number=f"PO-{purchase_date4.strftime('%Y%m%d')}-004",
        vendor_name=vendors[3]["name"],
        vendor_contact=vendors[3]["contact"],
        vendor_address=vendors[3]["address"],
        purchase_date=purchase_date4,
        expected_delivery_date=purchase_date4 + timedelta(days=7),
        subtotal=subtotal4,
        tax_amount=tax4,
        shipping_cost=Decimal("35.00"),
        other_charges=Decimal("0.00"),
        total_amount=total4,
        payment_status="unpaid",
        amount_paid=Decimal("0.00"),
        status=PurchaseStatus.DRAFT,
        items=items4,
        notes="Draft purchase order - pending approval",
        created_by=user
    )
    purchases.append(purchase4)
    
    # Purchase 5: Cancelled (edge case)
    purchase_date5 = datetime.now() - timedelta(days=30)
    items5 = [{
        "product_id": inventory_products[0].id,
        "product_name": inventory_products[0].name,
        "sku": inventory_products[0].sku,
        "quantity": 50,
        "unit_cost": float(inventory_products[0].cost_price),
        "total": float(inventory_products[0].cost_price * 50)
    }]
    
    purchase5 = await Purchase.create(
        purchase_number=f"PO-{purchase_date5.strftime('%Y%m%d')}-005",
        vendor_name=vendors[0]["name"],
        vendor_contact=vendors[0]["contact"],
        vendor_address=vendors[0]["address"],
        purchase_date=purchase_date5,
        expected_delivery_date=purchase_date5 + timedelta(days=10),
        subtotal=Decimal("750.00"),
        tax_amount=Decimal("60.00"),
        shipping_cost=Decimal("40.00"),
        other_charges=Decimal("0.00"),
        total_amount=Decimal("850.00"),
        payment_status="unpaid",
        amount_paid=Decimal("0.00"),
        status=PurchaseStatus.CANCELLED,
        items=items5,
        notes="Cancelled due to vendor unable to fulfill order",
        created_by=user
    )
    purchases.append(purchase5)
    
    # Purchase 6: Partial delivery (edge case)
    purchase_date6 = datetime.now() - timedelta(days=10)
    items6 = []
    subtotal6 = Decimal("0.00")
    for product in inventory_products[:4]:
        qty = random.randint(25, 50)
        unit_cost = product.cost_price
        total = unit_cost * qty
        items6.append({
            "product_id": product.id,
            "product_name": product.name,
            "sku": product.sku,
            "quantity": qty,
            "unit_cost": float(unit_cost),
            "total": float(total)
        })
        subtotal6 += total
    
    tax6 = subtotal6 * Decimal("0.08")
    total6 = subtotal6 + tax6 + Decimal("60.00")
    
    purchase6 = await Purchase.create(
        purchase_number=f"PO-{purchase_date6.strftime('%Y%m%d')}-006",
        vendor_name=vendors[1]["name"],
        vendor_contact=vendors[1]["contact"],
        vendor_address=vendors[1]["address"],
        purchase_date=purchase_date6,
        expected_delivery_date=purchase_date6 + timedelta(days=7),
        actual_delivery_date=purchase_date6 + timedelta(days=6),
        subtotal=subtotal6,
        tax_amount=tax6,
        shipping_cost=Decimal("60.00"),
        other_charges=Decimal("0.00"),
        total_amount=total6,
        payment_method="cash",
        payment_reference="CASH-" + str(random.randint(10000, 99999)),
        payment_status="paid",
        amount_paid=total6,
        status=PurchaseStatus.PARTIAL,
        items=items6,
        invoice_number=f"INV-VENDOR-{random.randint(10000, 99999)}",
        notes="Partial delivery - 75% of items received, rest backordered",
        created_by=user,
        received_by=user
    )
    purchases.append(purchase6)
    
    # Edge case: Zero value purchase (for testing)
    purchase_date7 = datetime.now() - timedelta(days=60)
    purchase7 = await Purchase.create(
        purchase_number=f"PO-{purchase_date7.strftime('%Y%m%d')}-007",
        vendor_name=vendors[2]["name"],
        vendor_contact=vendors[2]["contact"],
        vendor_address=vendors[2]["address"],
        purchase_date=purchase_date7,
        expected_delivery_date=purchase_date7 + timedelta(days=5),
        actual_delivery_date=purchase_date7 + timedelta(days=4),
        subtotal=Decimal("0.00"),
        tax_amount=Decimal("0.00"),
        shipping_cost=Decimal("0.00"),
        other_charges=Decimal("0.00"),
        total_amount=Decimal("0.00"),
        payment_status="paid",
        amount_paid=Decimal("0.00"),
        status=PurchaseStatus.RECEIVED,
        items=[],
        invoice_number=f"INV-VENDOR-{random.randint(10000, 99999)}",
        notes="Sample order - no charge",
        created_by=user,
        received_by=user
    )
    purchases.append(purchase7)
    
    # Edge case: Very large purchase
    purchase_date8 = datetime.now() - timedelta(days=90)
    items8 = []
    subtotal8 = Decimal("0.00")
    for product in inventory_products:
        qty = random.randint(100, 200)
        unit_cost = product.cost_price
        total = unit_cost * qty
        items8.append({
            "product_id": product.id,
            "product_name": product.name,
            "sku": product.sku,
            "quantity": qty,
            "unit_cost": float(unit_cost),
            "total": float(total)
        })
        subtotal8 += total
    
    tax8 = subtotal8 * Decimal("0.08")
    total8 = subtotal8 + tax8 + Decimal("500.00")
    
    purchase8 = await Purchase.create(
        purchase_number=f"PO-{purchase_date8.strftime('%Y%m%d')}-008",
        vendor_name=vendors[0]["name"],
        vendor_contact=vendors[0]["contact"],
        vendor_address=vendors[0]["address"],
        purchase_date=purchase_date8,
        expected_delivery_date=purchase_date8 + timedelta(days=21),
        actual_delivery_date=purchase_date8 + timedelta(days=19),
        subtotal=subtotal8,
        tax_amount=tax8,
        shipping_cost=Decimal("500.00"),
        other_charges=Decimal("150.00"),
        total_amount=total8 + Decimal("150.00"),
        payment_method="bank_transfer",
        payment_reference="TXN-" + str(random.randint(100000, 999999)),
        payment_status="paid",
        amount_paid=total8 + Decimal("150.00"),
        status=PurchaseStatus.RECEIVED,
        items=items8,
        invoice_number=f"INV-VENDOR-{random.randint(10000, 99999)}",
        notes="Bulk order for new store opening - largest purchase to date",
        created_by=user,
        received_by=user
    )
    purchases.append(purchase8)
    
    print(f"Created {len(purchases)} purchases with comprehensive edge cases")
    return purchases
