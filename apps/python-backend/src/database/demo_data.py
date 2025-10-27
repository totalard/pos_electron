"""
Demo data generator for POS system.

Creates comprehensive demo data including:
- Product categories
- Products (all types: simple, variation, bundle, service)
- Product variations
- Customers
- Stock transactions
- Stock adjustments
"""
import random
from decimal import Decimal
from datetime import datetime, timedelta
from typing import List, Dict, Any

from tortoise import Tortoise
from .models import (
    ProductCategory,
    Product,
    ProductType,
    ItemType,
    ProductVariation,
    ProductBundle,
    Customer,
    CustomerTransaction,
    StockTransaction,
    TransactionType,
    StockAdjustment,
    StockAdjustmentLine,
    User,
    Sale,
    SaleStatus,
    PaymentMethod,
    CashTransaction,
    Expense,
    Discount,
    DiscountUsage,
    DiscountType,
    DiscountStatus,
    POSSession,
    SessionStatus
)


# Demo data constants
CATEGORIES = [
    {"name": "Electronics", "description": "Electronic devices and accessories", "children": [
        {"name": "Smartphones", "description": "Mobile phones and accessories"},
        {"name": "Laptops", "description": "Laptops and notebooks"},
        {"name": "Accessories", "description": "Electronic accessories"},
    ]},
    {"name": "Clothing", "description": "Apparel and fashion items", "children": [
        {"name": "Men's Wear", "description": "Men's clothing"},
        {"name": "Women's Wear", "description": "Women's clothing"},
        {"name": "Kids Wear", "description": "Children's clothing"},
    ]},
    {"name": "Food & Beverages", "description": "Food and drink items", "children": [
        {"name": "Snacks", "description": "Snacks and chips"},
        {"name": "Beverages", "description": "Drinks and beverages"},
        {"name": "Fresh Produce", "description": "Fresh fruits and vegetables"},
    ]},
    {"name": "Home & Garden", "description": "Home and garden products", "children": [
        {"name": "Furniture", "description": "Home furniture"},
        {"name": "Decor", "description": "Home decoration items"},
        {"name": "Garden Tools", "description": "Gardening equipment"},
    ]},
    {"name": "Services", "description": "Service offerings", "children": [
        {"name": "Repairs", "description": "Repair services"},
        {"name": "Consultations", "description": "Consultation services"},
    ]},
]

SIMPLE_PRODUCTS = [
    {"name": "Wireless Mouse", "sku": "ELEC-MOUSE-001", "barcode": "1234567890123", "base_price": 29.99, "cost_price": 15.00, "stock": 45, "low_stock": 10, "category": "Accessories"},
    {"name": "USB-C Cable", "sku": "ELEC-CABLE-001", "barcode": "1234567890124", "base_price": 12.99, "cost_price": 5.00, "stock": 120, "low_stock": 20, "category": "Accessories"},
    {"name": "Laptop Stand", "sku": "ELEC-STAND-001", "barcode": "1234567890125", "base_price": 39.99, "cost_price": 20.00, "stock": 8, "low_stock": 15, "category": "Accessories"},
    {"name": "Bluetooth Speaker", "sku": "ELEC-SPEAK-001", "barcode": "1234567890126", "base_price": 79.99, "cost_price": 40.00, "stock": 25, "low_stock": 10, "category": "Electronics"},
    {"name": "Potato Chips", "sku": "FOOD-CHIPS-001", "barcode": "2234567890123", "base_price": 2.99, "cost_price": 1.20, "stock": 200, "low_stock": 50, "category": "Snacks"},
    {"name": "Orange Juice", "sku": "BEV-JUICE-001", "barcode": "2234567890124", "base_price": 4.99, "cost_price": 2.50, "stock": 85, "low_stock": 30, "category": "Beverages"},
    {"name": "Coffee Beans 1kg", "sku": "BEV-COFFEE-001", "barcode": "2234567890125", "base_price": 24.99, "cost_price": 12.00, "stock": 35, "low_stock": 10, "category": "Beverages"},
    {"name": "Desk Lamp", "sku": "HOME-LAMP-001", "barcode": "3234567890123", "base_price": 34.99, "cost_price": 18.00, "stock": 15, "low_stock": 5, "category": "Decor"},
    {"name": "Garden Hose", "sku": "GARD-HOSE-001", "barcode": "3234567890124", "base_price": 29.99, "cost_price": 15.00, "stock": 0, "low_stock": 5, "category": "Garden Tools"},
    {"name": "Plant Pot Set", "sku": "GARD-POT-001", "barcode": "3234567890125", "base_price": 19.99, "cost_price": 8.00, "stock": 42, "low_stock": 10, "category": "Garden Tools"},
]

VARIATION_PRODUCTS = [
    {
        "name": "Classic T-Shirt",
        "sku": "CLOTH-TSHIRT-001",
        "base_price": 19.99,
        "cost_price": 8.00,
        "category": "Men's Wear",
        "variations": [
            {"name": "Small / Red", "sku": "CLOTH-TSHIRT-001-S-RED", "barcode": "4234567890123", "price_adj": 0, "stock": 15},
            {"name": "Small / Blue", "sku": "CLOTH-TSHIRT-001-S-BLU", "barcode": "4234567890124", "price_adj": 0, "stock": 12},
            {"name": "Medium / Red", "sku": "CLOTH-TSHIRT-001-M-RED", "barcode": "4234567890125", "price_adj": 0, "stock": 25},
            {"name": "Medium / Blue", "sku": "CLOTH-TSHIRT-001-M-BLU", "barcode": "4234567890126", "price_adj": 0, "stock": 20},
            {"name": "Large / Red", "sku": "CLOTH-TSHIRT-001-L-RED", "barcode": "4234567890127", "price_adj": 2.00, "stock": 18},
            {"name": "Large / Blue", "sku": "CLOTH-TSHIRT-001-L-BLU", "barcode": "4234567890128", "price_adj": 2.00, "stock": 8},
        ]
    },
    {
        "name": "Running Shoes",
        "sku": "CLOTH-SHOES-001",
        "base_price": 89.99,
        "cost_price": 45.00,
        "category": "Men's Wear",
        "variations": [
            {"name": "Size 8 / Black", "sku": "CLOTH-SHOES-001-8-BLK", "barcode": "4234567890129", "price_adj": 0, "stock": 5},
            {"name": "Size 9 / Black", "sku": "CLOTH-SHOES-001-9-BLK", "barcode": "4234567890130", "price_adj": 0, "stock": 8},
            {"name": "Size 10 / Black", "sku": "CLOTH-SHOES-001-10-BLK", "barcode": "4234567890131", "price_adj": 0, "stock": 12},
            {"name": "Size 10 / White", "sku": "CLOTH-SHOES-001-10-WHT", "barcode": "4234567890132", "price_adj": 5.00, "stock": 6},
        ]
    },
]

BUNDLE_PRODUCTS = [
    {
        "name": "Home Office Bundle",
        "sku": "BUNDLE-OFFICE-001",
        "barcode": "5234567890123",
        "base_price": 149.99,
        "cost_price": 75.00,
        "category": "Electronics",
        "components": [
            {"product_sku": "ELEC-MOUSE-001", "quantity": 1},
            {"product_sku": "ELEC-CABLE-001", "quantity": 2},
            {"product_sku": "ELEC-STAND-001", "quantity": 1},
        ]
    },
    {
        "name": "Snack Pack",
        "sku": "BUNDLE-SNACK-001",
        "barcode": "5234567890124",
        "base_price": 9.99,
        "cost_price": 5.00,
        "category": "Snacks",
        "components": [
            {"product_sku": "FOOD-CHIPS-001", "quantity": 2},
            {"product_sku": "BEV-JUICE-001", "quantity": 1},
        ]
    },
]

SERVICE_PRODUCTS = [
    {"name": "Phone Screen Repair", "sku": "SERV-REPAIR-001", "base_price": 79.99, "cost_price": 30.00, "category": "Repairs"},
    {"name": "Laptop Diagnostic", "sku": "SERV-DIAG-001", "base_price": 49.99, "cost_price": 20.00, "category": "Repairs"},
    {"name": "IT Consultation (1hr)", "sku": "SERV-CONSULT-001", "base_price": 120.00, "cost_price": 50.00, "category": "Consultations"},
    {"name": "Home Network Setup", "sku": "SERV-NETWORK-001", "base_price": 199.99, "cost_price": 80.00, "category": "Consultations"},
]

CUSTOMERS = [
    {"name": "John Smith", "email": "john.smith@email.com", "phone": "+1-555-0101", "address": "123 Main St, City, State 12345"},
    {"name": "Sarah Johnson", "email": "sarah.j@email.com", "phone": "+1-555-0102", "address": "456 Oak Ave, City, State 12346"},
    {"name": "Michael Brown", "email": "m.brown@email.com", "phone": "+1-555-0103", "address": "789 Pine Rd, City, State 12347"},
    {"name": "Emily Davis", "email": "emily.davis@email.com", "phone": "+1-555-0104", "address": "321 Elm St, City, State 12348"},
    {"name": "David Wilson", "email": "d.wilson@email.com", "phone": "+1-555-0105", "address": "654 Maple Dr, City, State 12349"},
    {"name": "Lisa Anderson", "email": "lisa.a@email.com", "phone": "+1-555-0106", "address": "987 Birch Ln, City, State 12350"},
    {"name": "James Martinez", "email": "j.martinez@email.com", "phone": "+1-555-0107", "address": "147 Cedar Ct, City, State 12351"},
    {"name": "Jennifer Taylor", "email": "jen.taylor@email.com", "phone": "+1-555-0108", "address": "258 Spruce Way, City, State 12352"},
    {"name": "Robert Thomas", "email": "rob.thomas@email.com", "phone": "+1-555-0109", "address": "369 Willow Pl, City, State 12353"},
    {"name": "Maria Garcia", "email": "maria.g@email.com", "phone": "+1-555-0110", "address": "741 Ash Blvd, City, State 12354"},
]


async def create_demo_categories() -> Dict[str, ProductCategory]:
    """Create demo product categories."""
    print("Creating demo categories...")
    category_map = {}
    
    for cat_data in CATEGORIES:
        # Create parent category
        parent = await ProductCategory.create(
            name=cat_data["name"],
            description=cat_data.get("description", ""),
            is_active=True
        )
        category_map[cat_data["name"]] = parent
        
        # Create child categories
        for child_data in cat_data.get("children", []):
            child = await ProductCategory.create(
                name=child_data["name"],
                description=child_data.get("description", ""),
                parent=parent,
                is_active=True
            )
            category_map[child_data["name"]] = child
    
    print(f"Created {len(category_map)} categories")
    return category_map


async def create_demo_simple_products(category_map: Dict[str, ProductCategory]) -> List[Product]:
    """Create demo simple products."""
    print("Creating demo simple products...")
    products = []
    
    for prod_data in SIMPLE_PRODUCTS:
        category = category_map.get(prod_data["category"])
        product = await Product.create(
            name=prod_data["name"],
            sku=prod_data["sku"],
            barcode=prod_data.get("barcode"),
            description=f"High quality {prod_data['name'].lower()}",
            product_type=ProductType.SIMPLE,
            item_type=ItemType.PRODUCT,
            category=category,
            base_price=Decimal(str(prod_data["base_price"])),
            cost_price=Decimal(str(prod_data["cost_price"])),
            selling_price=Decimal(str(prod_data["base_price"])),  # Backward compat
            track_inventory=True,
            current_stock=prod_data["stock"],
            stock_quantity=prod_data["stock"],
            min_stock_level=prod_data["low_stock"],
            low_stock_threshold=prod_data["low_stock"],
            is_active=True
        )
        products.append(product)
    
    print(f"Created {len(products)} simple products")
    return products


async def create_demo_variation_products(category_map: Dict[str, ProductCategory]) -> List[Product]:
    """Create demo variation products."""
    print("Creating demo variation products...")
    products = []
    
    for prod_data in VARIATION_PRODUCTS:
        category = category_map.get(prod_data["category"])
        
        # Create parent product
        product = await Product.create(
            name=prod_data["name"],
            sku=prod_data["sku"],
            description=f"Available in multiple sizes and colors",
            product_type=ProductType.VARIATION,
            item_type=ItemType.PRODUCT,
            category=category,
            base_price=Decimal(str(prod_data["base_price"])),
            cost_price=Decimal(str(prod_data["cost_price"])),
            selling_price=Decimal(str(prod_data["base_price"])),
            track_inventory=True,
            current_stock=0,  # Stock tracked at variation level
            stock_quantity=0,
            is_active=True
        )
        
        # Create variations
        for var_data in prod_data["variations"]:
            await ProductVariation.create(
                parent_product=product,
                variation_name=var_data["name"],
                sku=var_data["sku"],
                barcode=var_data.get("barcode"),
                price_adjustment=Decimal(str(var_data["price_adj"])),
                stock_quantity=var_data["stock"],
                is_active=True
            )
        
        products.append(product)
    
    print(f"Created {len(products)} variation products")
    return products


async def create_demo_bundle_products(category_map: Dict[str, ProductCategory]) -> List[Product]:
    """Create demo bundle products."""
    print("Creating demo bundle products...")
    products = []
    
    for prod_data in BUNDLE_PRODUCTS:
        category = category_map.get(prod_data["category"])
        
        # Create bundle product
        product = await Product.create(
            name=prod_data["name"],
            sku=prod_data["sku"],
            barcode=prod_data.get("barcode"),
            description=f"Bundle package with multiple items",
            product_type=ProductType.BUNDLE,
            item_type=ItemType.PRODUCT,
            category=category,
            base_price=Decimal(str(prod_data["base_price"])),
            cost_price=Decimal(str(prod_data["cost_price"])),
            selling_price=Decimal(str(prod_data["base_price"])),
            track_inventory=False,  # Tracked at component level
            current_stock=0,
            stock_quantity=0,
            is_active=True
        )
        
        # Create bundle components
        for comp_data in prod_data["components"]:
            component_product = await Product.get(sku=comp_data["product_sku"])
            await ProductBundle.create(
                bundle_product=product,
                component_product=component_product,
                quantity=comp_data["quantity"]
            )
        
        products.append(product)
    
    print(f"Created {len(products)} bundle products")
    return products


async def create_demo_service_products(category_map: Dict[str, ProductCategory]) -> List[Product]:
    """Create demo service products."""
    print("Creating demo service products...")
    products = []
    
    for prod_data in SERVICE_PRODUCTS:
        category = category_map.get(prod_data["category"])
        product = await Product.create(
            name=prod_data["name"],
            sku=prod_data["sku"],
            description=f"Professional {prod_data['name'].lower()} service",
            product_type=ProductType.SERVICE,
            item_type=ItemType.SERVICE,
            category=category,
            base_price=Decimal(str(prod_data["base_price"])),
            cost_price=Decimal(str(prod_data["cost_price"])),
            selling_price=Decimal(str(prod_data["base_price"])),
            track_inventory=False,  # Services don't track inventory
            current_stock=0,
            stock_quantity=0,
            is_active=True
        )
        products.append(product)
    
    print(f"Created {len(products)} service products")
    return products


async def create_demo_customers() -> List[Customer]:
    """Create demo customers."""
    print("Creating demo customers...")
    customers = []
    
    for cust_data in CUSTOMERS:
        customer = await Customer.create(
            name=cust_data["name"],
            email=cust_data.get("email"),
            phone=cust_data.get("phone"),
            address=cust_data.get("address"),
            is_active=True
        )
        customers.append(customer)
    
    print(f"Created {len(customers)} customers")
    return customers


async def create_demo_stock_transactions(products: List[Product]) -> List[StockTransaction]:
    """Create demo stock transactions."""
    print("Creating demo stock transactions...")
    transactions = []
    
    # Get admin user
    user = await User.first()
    if not user:
        print("No user found, skipping transactions")
        return transactions
    
    # Create various transaction types for products with inventory
    inventory_products = [p for p in products if p.track_inventory and p.current_stock > 0]
    
    for product in inventory_products[:10]:  # Limit to first 10 products
        # Purchase transaction (stock in)
        purchase_qty = random.randint(20, 50)
        transaction = await StockTransaction.create(
            transaction_type=TransactionType.PURCHASE,
            product=product,
            quantity=purchase_qty,
            stock_before=0,
            stock_after=purchase_qty,
            unit_cost=product.cost_price,
            total_cost=product.cost_price * purchase_qty,
            reference_number=f"PO-{random.randint(1000, 9999)}",
            notes="Initial stock purchase",
            performed_by=user
        )
        transactions.append(transaction)
        
        # Sale transactions (stock out)
        for _ in range(random.randint(2, 5)):
            sale_qty = random.randint(1, 5)
            if product.current_stock >= sale_qty:
                stock_before = product.current_stock
                stock_after = stock_before - sale_qty
                transaction = await StockTransaction.create(
                    transaction_type=TransactionType.SALE,
                    product=product,
                    quantity=-sale_qty,
                    stock_before=stock_before,
                    stock_after=stock_after,
                    reference_number=f"SALE-{random.randint(1000, 9999)}",
                    notes="Product sale",
                    performed_by=user
                )
                transactions.append(transaction)
    
    print(f"Created {len(transactions)} stock transactions")
    return transactions


async def create_demo_stock_adjustments(products: List[Product]) -> List[StockAdjustment]:
    """Create demo stock adjustments."""
    print("Creating demo stock adjustments...")
    adjustments = []
    
    # Get admin user
    user = await User.first()
    if not user:
        print("No user found, skipping adjustments")
        return adjustments
    
    # Create a physical count adjustment
    adjustment = await StockAdjustment.create(
        reason="Physical inventory count",
        notes="Monthly stock count adjustment",
        performed_by=user,
        is_completed=True
    )
    
    # Add adjustment lines for a few products
    inventory_products = [p for p in products if p.track_inventory][:5]
    for product in inventory_products:
        expected = product.current_stock
        actual = expected + random.randint(-3, 3)
        difference = actual - expected
        
        await StockAdjustmentLine.create(
            adjustment=adjustment,
            product=product,
            expected_quantity=expected,
            actual_quantity=actual,
            difference=difference,
            notes="Count verified"
        )
    
    adjustments.append(adjustment)
    print(f"Created {len(adjustments)} stock adjustments")
    return adjustments


async def create_demo_discounts() -> List[Discount]:
    """Create demo discounts."""
    print("Creating demo discounts...")
    discounts = []
    
    # Get admin user
    user = await User.first()
    if not user:
        print("No user found, skipping discounts")
        return discounts
    
    # Percentage discount
    discount1 = await Discount.create(
        code="SAVE10",
        name="10% Off Everything",
        description="Get 10% off your entire purchase",
        discount_type=DiscountType.PERCENTAGE,
        value=Decimal("10.00"),
        max_discount_amount=Decimal("50.00"),
        status=DiscountStatus.ACTIVE,
        is_active=True,
        auto_apply=False,
        can_stack=False,
        priority=1,
        created_by=user
    )
    discounts.append(discount1)
    
    # Fixed amount discount
    discount2 = await Discount.create(
        code="SAVE20",
        name="$20 Off Orders Over $100",
        description="Get $20 off when you spend $100 or more",
        discount_type=DiscountType.FIXED_AMOUNT,
        value=Decimal("20.00"),
        min_purchase_amount=Decimal("100.00"),
        status=DiscountStatus.ACTIVE,
        is_active=True,
        auto_apply=True,
        can_stack=False,
        priority=2,
        created_by=user
    )
    discounts.append(discount2)
    
    # Buy X Get Y discount
    discount3 = await Discount.create(
        code="BUY2GET1",
        name="Buy 2 Get 1 Free",
        description="Buy 2 items, get 1 free",
        discount_type=DiscountType.BUY_X_GET_Y,
        value=Decimal("100.00"),  # 100% off the free item
        buy_quantity=2,
        get_quantity=1,
        status=DiscountStatus.ACTIVE,
        is_active=True,
        auto_apply=False,
        can_stack=False,
        priority=3,
        created_by=user
    )
    discounts.append(discount3)
    
    # Seasonal discount
    discount4 = await Discount.create(
        code="SUMMER25",
        name="Summer Sale - 25% Off",
        description="Summer special - 25% off all items",
        discount_type=DiscountType.PERCENTAGE,
        value=Decimal("25.00"),
        max_discount_amount=Decimal("100.00"),
        valid_from=datetime.now() - timedelta(days=7),
        valid_until=datetime.now() + timedelta(days=30),
        status=DiscountStatus.ACTIVE,
        is_active=True,
        auto_apply=False,
        can_stack=False,
        priority=4,
        created_by=user
    )
    discounts.append(discount4)
    
    # First purchase discount
    discount5 = await Discount.create(
        code="WELCOME15",
        name="Welcome Discount - 15% Off",
        description="First-time customer discount",
        discount_type=DiscountType.PERCENTAGE,
        value=Decimal("15.00"),
        first_purchase_only=True,
        status=DiscountStatus.ACTIVE,
        is_active=True,
        auto_apply=False,
        can_stack=False,
        priority=5,
        created_by=user
    )
    discounts.append(discount5)
    
    print(f"Created {len(discounts)} discounts")
    return discounts


async def create_demo_pos_sessions(user: User) -> List[POSSession]:
    """Create demo POS sessions."""
    print("Creating demo POS sessions...")
    sessions = []
    
    # Create a closed session from yesterday
    yesterday = datetime.now() - timedelta(days=1)
    session1 = await POSSession.create(
        session_number=f"SES-{yesterday.strftime('%Y%m%d')}-001",
        user=user,
        status=SessionStatus.CLOSED,
        opening_cash=Decimal("200.00"),
        opening_denominations={
            "bills": {"100": 1, "50": 2},
            "coins": {}
        },
        closing_cash=Decimal("450.00"),
        closing_denominations={
            "bills": {"100": 2, "50": 5},
            "coins": {"1": 10, "0.25": 20}
        },
        expected_cash=Decimal("445.00"),
        cash_variance=Decimal("5.00"),
        total_sales=Decimal("350.00"),
        total_cash_in=Decimal("0.00"),
        total_cash_out=Decimal("105.00"),
        payment_summary={
            "cash": 250.00,
            "card": 100.00
        },
        opened_at=yesterday,
        closed_at=yesterday + timedelta(hours=8),
        opening_notes="Starting shift",
        closing_notes="End of shift - slight overage"
    )
    sessions.append(session1)
    
    # Create an active session for today
    today = datetime.now()
    session2 = await POSSession.create(
        session_number=f"SES-{today.strftime('%Y%m%d')}-001",
        user=user,
        status=SessionStatus.ACTIVE,
        opening_cash=Decimal("200.00"),
        opening_denominations={
            "bills": {"100": 2},
            "coins": {}
        },
        total_sales=Decimal("0.00"),
        total_cash_in=Decimal("0.00"),
        total_cash_out=Decimal("0.00"),
        payment_summary={},
        opened_at=today,
        opening_notes="Starting new shift"
    )
    sessions.append(session2)
    
    print(f"Created {len(sessions)} POS sessions")
    return sessions


async def create_demo_sales(
    products: List[Product],
    customers: List[Customer],
    sessions: List[POSSession],
    discounts: List[Discount]
) -> List[Sale]:
    """Create demo sales transactions."""
    print("Creating demo sales...")
    sales = []
    
    # Get admin user
    user = await User.first()
    if not user:
        print("No user found, skipping sales")
        return sales
    
    # Get closed session for historical sales
    closed_session = next((s for s in sessions if s.status == SessionStatus.CLOSED), None)
    if not closed_session:
        print("No closed session found, skipping sales")
        return sales
    
    # Create 15 demo sales
    for i in range(15):
        # Randomly select customer (70% chance of having a customer)
        customer = random.choice(customers) if random.random() < 0.7 else None
        
        # Randomly select 1-4 products
        num_items = random.randint(1, 4)
        sale_products = random.sample([p for p in products if p.product_type == ProductType.SIMPLE], min(num_items, 10))
        
        # Build items list and calculate totals
        items = []
        subtotal = Decimal("0.00")
        
        for product in sale_products:
            quantity = random.randint(1, 3)
            price = product.base_price
            item_total = price * quantity
            
            items.append({
                "product_id": product.id,
                "product_name": product.name,
                "sku": product.sku,
                "quantity": quantity,
                "unit_price": float(price),
                "total": float(item_total)
            })
            subtotal += item_total
        
        # Apply discount (30% chance)
        discount_amount = Decimal("0.00")
        if random.random() < 0.3 and discounts:
            discount = random.choice(discounts)
            if discount.discount_type == DiscountType.PERCENTAGE:
                discount_amount = subtotal * (discount.value / Decimal("100.00"))
                if discount.max_discount_amount:
                    discount_amount = min(discount_amount, discount.max_discount_amount)
            elif discount.discount_type == DiscountType.FIXED_AMOUNT:
                if not discount.min_purchase_amount or subtotal >= discount.min_purchase_amount:
                    discount_amount = discount.value
        
        # Calculate tax (8% tax rate)
        tax_rate = Decimal("0.08")
        tax_amount = (subtotal - discount_amount) * tax_rate
        
        # Calculate total
        total_amount = subtotal - discount_amount + tax_amount
        
        # Random payment method
        payment_method = random.choice([PaymentMethod.CASH, PaymentMethod.CARD, PaymentMethod.MOBILE])
        
        # Calculate change for cash payments
        if payment_method == PaymentMethod.CASH:
            amount_paid = total_amount + Decimal(str(random.randint(0, 20)))
            change_given = amount_paid - total_amount
        else:
            amount_paid = total_amount
            change_given = Decimal("0.00")
        
        # Create sale
        sale_date = closed_session.opened_at + timedelta(hours=random.randint(0, 7), minutes=random.randint(0, 59))
        sale = await Sale.create(
            invoice_number=f"INV-{sale_date.strftime('%Y%m%d')}-{str(i+1).zfill(4)}",
            session=closed_session,
            customer=customer,
            subtotal=subtotal,
            tax_amount=tax_amount,
            discount_amount=discount_amount,
            total_amount=total_amount,
            payment_method=payment_method,
            amount_paid=amount_paid,
            change_given=change_given,
            status=SaleStatus.COMPLETED,
            items=items,
            sold_by=user,
            sale_date=sale_date
        )
        sales.append(sale)
        
        # Create discount usage if discount was applied
        if discount_amount > Decimal("0.00") and discounts:
            await DiscountUsage.create(
                discount=discount,
                sale=sale,
                customer=customer,
                discount_amount=discount_amount,
                original_amount=subtotal,
                final_amount=total_amount,
                applied_by=user,
                usage_date=sale_date
            )
    
    print(f"Created {len(sales)} sales")
    return sales


async def generate_all_demo_data():
    """Generate all demo data."""
    print("\n" + "="*60)
    print("GENERATING COMPREHENSIVE DEMO DATA")
    print("="*60 + "\n")
    
    try:
        # Get admin user
        user = await User.first()
        if not user:
            raise Exception("No user found. Please create a user first.")
        
        # Create categories
        category_map = await create_demo_categories()
        
        # Create products of all types
        simple_products = await create_demo_simple_products(category_map)
        variation_products = await create_demo_variation_products(category_map)
        bundle_products = await create_demo_bundle_products(category_map)
        service_products = await create_demo_service_products(category_map)
        
        all_products = simple_products + variation_products + bundle_products + service_products
        
        # Create customers
        customers = await create_demo_customers()
        
        # Create discounts
        discounts = await create_demo_discounts()
        
        # Create POS sessions
        sessions = await create_demo_pos_sessions(user)
        
        # Create sales (depends on products, customers, sessions, discounts)
        sales = await create_demo_sales(all_products, customers, sessions, discounts)
        
        # Create stock transactions
        transactions = await create_demo_stock_transactions(all_products)
        
        # Create stock adjustments
        adjustments = await create_demo_stock_adjustments(all_products)
        
        print("\n" + "="*60)
        print("DEMO DATA GENERATION COMPLETE")
        print("="*60)
        print(f"Categories: {len(category_map)}")
        print(f"Products: {len(all_products)}")
        print(f"  - Simple: {len(simple_products)}")
        print(f"  - Variation: {len(variation_products)}")
        print(f"  - Bundle: {len(bundle_products)}")
        print(f"  - Service: {len(service_products)}")
        print(f"Customers: {len(customers)}")
        print(f"Discounts: {len(discounts)}")
        print(f"POS Sessions: {len(sessions)}")
        print(f"Sales: {len(sales)}")
        print(f"Stock Transactions: {len(transactions)}")
        print(f"Stock Adjustments: {len(adjustments)}")
        print("="*60 + "\n")
        
        return {
            "categories": len(category_map),
            "products": len(all_products),
            "customers": len(customers),
            "discounts": len(discounts),
            "sessions": len(sessions),
            "sales": len(sales),
            "transactions": len(transactions),
            "adjustments": len(adjustments)
        }
        
    except Exception as e:
        print(f"Error generating demo data: {e}")
        raise


async def clear_demo_data():
    """Clear all demo data (use with caution)."""
    print("Clearing demo data...")
    
    try:
        # Delete in reverse order of dependencies
        # First delete discount usages (depends on sales, discounts, customers)
        await DiscountUsage.all().delete()
        
        # Delete transaction-related data
        await Expense.all().delete()
        await CashTransaction.all().delete()
        
        # Delete sales (depends on sessions, customers, products)
        await Sale.all().delete()
        
        # Delete POS sessions (depends on users)
        await POSSession.all().delete()
        
        # Delete customer transactions
        await CustomerTransaction.all().delete()
        
        # Delete inventory data
        await StockAdjustmentLine.all().delete()
        await StockAdjustment.all().delete()
        await StockTransaction.all().delete()
        
        # Delete discounts (depends on users)
        await Discount.all().delete()
        
        # Delete product-related data
        await ProductBundle.all().delete()
        await ProductVariation.all().delete()
        await Product.all().delete()
        await ProductCategory.all().delete()
        
        # Finally delete customer data
        await Customer.all().delete()
        
        print("Demo data cleared successfully")
    except Exception as e:
        print(f"Error clearing demo data: {e}")
        raise
