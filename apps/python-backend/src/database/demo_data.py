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
    CreditStatus,
    CustomerTransaction,
    CustomerTransactionType,
    StockTransaction,
    TransactionType,
    StockAdjustment,
    StockAdjustmentLine,
    User,
    UserRole,
    UserActivityLog,
    ActivityType,
    Sale,
    SaleStatus,
    PaymentMethod,
    CashTransaction,
    CashTransactionType,
    Expense,
    ExpenseCategory,
    ExpenseStatus,
    Discount,
    DiscountUsage,
    DiscountType,
    DiscountStatus,
    POSSession,
    SessionStatus,
    TaxRule,
    TaxType,
    TaxCalculationMethod,
    TaxInclusionType,
    RoundingMethod,
    Setting,
    SettingDataType
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
    """Create demo simple products with edge cases."""
    print("Creating demo simple products...")
    products = []
    
    user = await User.first()
    
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
            is_active=True,
            created_by=user
        )
        products.append(product)
    
    # Edge case: Inactive product
    inactive_product = await Product.create(
        name="Discontinued Product",
        sku="DISC-001",
        barcode="9999999999999",
        description="This product is no longer available",
        product_type=ProductType.SIMPLE,
        item_type=ItemType.PRODUCT,
        category=category_map.get("Electronics"),
        base_price=Decimal("99.99"),
        cost_price=Decimal("50.00"),
        selling_price=Decimal("99.99"),
        track_inventory=True,
        current_stock=0,
        stock_quantity=0,
        min_stock_level=0,
        low_stock_threshold=0,
        is_active=False,  # Inactive
        created_by=user
    )
    products.append(inactive_product)
    
    # Edge case: Product with no barcode
    no_barcode_product = await Product.create(
        name="Custom Bulk Item",
        sku="BULK-001",
        description="Sold by weight - no barcode",
        product_type=ProductType.SIMPLE,
        item_type=ItemType.PRODUCT,
        category=category_map.get("Food & Beverages"),
        base_price=Decimal("5.99"),
        cost_price=Decimal("2.50"),
        selling_price=Decimal("5.99"),
        track_inventory=True,
        current_stock=100,
        stock_quantity=100,
        min_stock_level=20,
        low_stock_threshold=20,
        is_active=True,
        created_by=user
    )
    products.append(no_barcode_product)
    
    print(f"Created {len(products)} simple products with edge cases")
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
    """Create demo customers with comprehensive edge cases."""
    print("Creating demo customers...")
    customers = []
    
    # Get admin user for created_by
    user = await User.first()
    
    # Create regular customers with various configurations
    for i, cust_data in enumerate(CUSTOMERS):
        # Vary credit limits and loyalty points
        credit_limit = Decimal("0.00")
        credit_balance = Decimal("0.00")
        loyalty_points = 0
        credit_status = CreditStatus.GOOD
        
        if i % 4 == 0:  # 25% with credit
            credit_limit = Decimal(str(random.choice([500, 1000, 2000, 5000])))
            credit_balance = Decimal(str(random.uniform(0, float(credit_limit) * 0.5)))
            loyalty_points = random.randint(0, 500)
        elif i % 4 == 1:  # 25% with high credit usage (warning)
            credit_limit = Decimal("1000.00")
            credit_balance = Decimal("850.00")  # 85% - warning status
            credit_status = CreditStatus.WARNING
            loyalty_points = random.randint(100, 1000)
        elif i % 4 == 2:  # 25% exceeded credit
            credit_limit = Decimal("500.00")
            credit_balance = Decimal("550.00")  # Exceeded
            credit_status = CreditStatus.EXCEEDED
            loyalty_points = random.randint(50, 200)
        else:  # 25% regular with loyalty
            loyalty_points = random.randint(0, 2000)
        
        customer = await Customer.create(
            name=cust_data["name"],
            email=cust_data.get("email"),
            phone=cust_data.get("phone"),
            address=cust_data.get("address"),
            credit_limit=credit_limit,
            credit_balance=credit_balance,
            credit_status=credit_status,
            loyalty_points=loyalty_points,
            created_by=user
        )
        customers.append(customer)
    
    # Add edge case: Customer with blocked credit
    blocked_customer = await Customer.create(
        name="Blocked Credit Customer",
        email="blocked@email.com",
        phone="+1-555-9999",
        address="999 Blocked St",
        credit_limit=Decimal("0.00"),
        credit_balance=Decimal("1000.00"),
        credit_status=CreditStatus.BLOCKED,
        loyalty_points=0,
        created_by=user
    )
    customers.append(blocked_customer)
    
    # Add edge case: VIP customer with high credit and loyalty
    vip_customer = await Customer.create(
        name="VIP Customer",
        email="vip@email.com",
        phone="+1-555-8888",
        address="888 VIP Plaza",
        credit_limit=Decimal("10000.00"),
        credit_balance=Decimal("0.00"),
        credit_status=CreditStatus.GOOD,
        loyalty_points=5000,
        created_by=user
    )
    customers.append(vip_customer)
    
    print(f"Created {len(customers)} customers with edge cases")
    return customers


async def create_demo_stock_transactions(products: List[Product]) -> List[StockTransaction]:
    """Create comprehensive demo stock transactions covering all types."""
    print("Creating demo stock transactions...")
    transactions = []
    
    # Get admin user
    user = await User.first()
    if not user:
        print("No user found, skipping transactions")
        return transactions
    
    # Create various transaction types for products with inventory
    inventory_products = [p for p in products if p.track_inventory and p.current_stock > 0]
    
    for i, product in enumerate(inventory_products[:10]):  # Limit to first 10 products
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
        
        # Add edge case transactions for first few products
        if i < 3:
            # Return transaction (stock in)
            return_qty = random.randint(1, 3)
            stock_before = product.current_stock
            stock_after = stock_before + return_qty
            return_tx = await StockTransaction.create(
                transaction_type=TransactionType.RETURN,
                product=product,
                quantity=return_qty,
                stock_before=stock_before,
                stock_after=stock_after,
                unit_cost=product.cost_price,
                total_cost=product.cost_price * return_qty,
                reference_number=f"RET-{random.randint(1000, 9999)}",
                notes="Customer return - restocked",
                performed_by=user
            )
            transactions.append(return_tx)
        
        if i < 2:
            # Damage transaction (stock out)
            damage_qty = random.randint(1, 2)
            if product.current_stock >= damage_qty:
                stock_before = product.current_stock
                stock_after = stock_before - damage_qty
                damage_tx = await StockTransaction.create(
                    transaction_type=TransactionType.DAMAGE,
                    product=product,
                    quantity=-damage_qty,
                    stock_before=stock_before,
                    stock_after=stock_after,
                    unit_cost=product.cost_price,
                    total_cost=product.cost_price * damage_qty,
                    reference_number=f"DMG-{random.randint(1000, 9999)}",
                    notes="Damaged during handling - written off",
                    performed_by=user
                )
                transactions.append(damage_tx)
        
        if i == 0:
            # Transfer transaction (stock out from one location)
            transfer_qty = random.randint(5, 10)
            if product.current_stock >= transfer_qty:
                stock_before = product.current_stock
                stock_after = stock_before - transfer_qty
                transfer_tx = await StockTransaction.create(
                    transaction_type=TransactionType.TRANSFER,
                    product=product,
                    quantity=-transfer_qty,
                    stock_before=stock_before,
                    stock_after=stock_after,
                    reference_number=f"TRF-{random.randint(1000, 9999)}",
                    notes="Transferred to warehouse location B",
                    performed_by=user
                )
                transactions.append(transfer_tx)
        
        # Adjustment transaction
        if i == 1:
            adjustment_qty = random.randint(-2, 2)
            if adjustment_qty != 0 and (product.current_stock + adjustment_qty >= 0):
                stock_before = product.current_stock
                stock_after = stock_before + adjustment_qty
                adj_tx = await StockTransaction.create(
                    transaction_type=TransactionType.ADJUSTMENT,
                    product=product,
                    quantity=adjustment_qty,
                    stock_before=stock_before,
                    stock_after=stock_after,
                    reference_number=f"ADJ-{random.randint(1000, 9999)}",
                    notes="Stock count adjustment - discrepancy found",
                    performed_by=user
                )
                transactions.append(adj_tx)
    
    print(f"Created {len(transactions)} stock transactions with edge cases")
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
    """Create demo POS sessions with edge cases."""
    print("Creating demo POS sessions...")
    sessions = []
    
    # Create a closed session from yesterday with overage
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
        cash_variance=Decimal("5.00"),  # Positive variance (overage)
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
    
    # Create a closed session from 2 days ago with shortage
    two_days_ago = datetime.now() - timedelta(days=2)
    session2 = await POSSession.create(
        session_number=f"SES-{two_days_ago.strftime('%Y%m%d')}-001",
        user=user,
        status=SessionStatus.CLOSED,
        opening_cash=Decimal("200.00"),
        opening_denominations={
            "bills": {"100": 2},
            "coins": {}
        },
        closing_cash=Decimal("380.00"),
        closing_denominations={
            "bills": {"100": 3, "50": 1, "20": 1, "10": 1},
            "coins": {}
        },
        expected_cash=Decimal("395.00"),
        cash_variance=Decimal("-15.00"),  # Negative variance (shortage)
        total_sales=Decimal("295.00"),
        total_cash_in=Decimal("50.00"),
        total_cash_out=Decimal("150.00"),
        payment_summary={
            "cash": 195.00,
            "card": 75.00,
            "mobile": 25.00
        },
        opened_at=two_days_ago,
        closed_at=two_days_ago + timedelta(hours=9),
        opening_notes="Morning shift",
        closing_notes="End of shift - shortage detected, investigating"
    )
    sessions.append(session2)
    
    # Edge case: Suspended session
    three_days_ago = datetime.now() - timedelta(days=3)
    session3 = await POSSession.create(
        session_number=f"SES-{three_days_ago.strftime('%Y%m%d')}-002",
        user=user,
        status=SessionStatus.SUSPENDED,
        opening_cash=Decimal("200.00"),
        opening_denominations={
            "bills": {"100": 2},
            "coins": {}
        },
        total_sales=Decimal("125.00"),
        total_cash_in=Decimal("0.00"),
        total_cash_out=Decimal("0.00"),
        payment_summary={
            "cash": 85.00,
            "card": 40.00
        },
        opened_at=three_days_ago,
        opening_notes="Afternoon shift",
        closing_notes="Session suspended due to system maintenance"
    )
    sessions.append(session3)
    
    # Create an active session for today
    today = datetime.now()
    session4 = await POSSession.create(
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
    sessions.append(session4)
    
    print(f"Created {len(sessions)} POS sessions with edge cases")
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


async def create_demo_users() -> List[User]:
    """Create additional demo users with various roles and statuses."""
    print("Creating additional demo users...")
    users = []
    
    # Get the first admin user
    admin = await User.first()
    
    # Create additional staff users
    staff_user1 = await User.create(
        full_name="Jane Smith",
        mobile_number="+1-555-2001",
        pin_hash="hashed_pin_2",  # In real app, this would be properly hashed
        role=UserRole.USER,
        is_active=True,
        email="jane.smith@pos.com",
        avatar_color="blue",
        notes="Cashier - Morning shift",
        created_by=admin
    )
    users.append(staff_user1)
    
    staff_user2 = await User.create(
        full_name="Mike Johnson",
        mobile_number="+1-555-2002",
        pin_hash="hashed_pin_3",
        role=UserRole.USER,
        is_active=True,
        email="mike.j@pos.com",
        avatar_color="green",
        notes="Cashier - Evening shift",
        created_by=admin
    )
    users.append(staff_user2)
    
    # Edge case: Inactive user
    inactive_user = await User.create(
        full_name="Inactive User",
        mobile_number="+1-555-2003",
        pin_hash="hashed_pin_4",
        role=UserRole.USER,
        is_active=False,
        email="inactive@pos.com",
        avatar_color="gray",
        notes="Former employee - deactivated",
        created_by=admin
    )
    users.append(inactive_user)
    
    # Edge case: User without optional fields
    minimal_user = await User.create(
        full_name="Minimal User",
        pin_hash="hashed_pin_5",
        role=UserRole.USER,
        is_active=True,
        created_by=admin
    )
    users.append(minimal_user)
    
    print(f"Created {len(users)} additional users")
    return users


async def create_demo_tax_rules() -> List[TaxRule]:
    """Create comprehensive tax rules including GST, VAT, and compound taxes."""
    print("Creating demo tax rules...")
    tax_rules = []
    
    # Simple percentage tax
    simple_tax = await TaxRule.create(
        name="Standard Sales Tax",
        description="Standard 8% sales tax",
        tax_type=TaxType.SIMPLE,
        rate=Decimal("8.00"),
        calculation_method=TaxCalculationMethod.PERCENTAGE,
        inclusion_type=TaxInclusionType.EXCLUSIVE,
        rounding_method=RoundingMethod.ROUND_HALF_UP,
        is_active=True,
        priority=1
    )
    tax_rules.append(simple_tax)
    
    # GST - CGST + SGST (India intra-state)
    gst_intra = await TaxRule.create(
        name="GST 18% (CGST + SGST)",
        description="18% GST for intra-state transactions",
        tax_type=TaxType.GST_CGST,
        rate=Decimal("18.00"),
        cgst_rate=Decimal("9.00"),
        sgst_rate=Decimal("9.00"),
        hsn_code="8471",
        calculation_method=TaxCalculationMethod.PERCENTAGE,
        inclusion_type=TaxInclusionType.EXCLUSIVE,
        rounding_method=RoundingMethod.ROUND_HALF_UP,
        is_active=True,
        priority=2
    )
    tax_rules.append(gst_intra)
    
    # GST - IGST (India inter-state)
    gst_inter = await TaxRule.create(
        name="GST 18% (IGST)",
        description="18% GST for inter-state transactions",
        tax_type=TaxType.GST_IGST,
        rate=Decimal("18.00"),
        igst_rate=Decimal("18.00"),
        hsn_code="8471",
        calculation_method=TaxCalculationMethod.PERCENTAGE,
        inclusion_type=TaxInclusionType.EXCLUSIVE,
        rounding_method=RoundingMethod.ROUND_HALF_UP,
        is_active=False,  # Inactive by default
        priority=3
    )
    tax_rules.append(gst_inter)
    
    # GST with CESS
    gst_cess = await TaxRule.create(
        name="GST 28% + CESS 12%",
        description="Luxury goods tax with cess",
        tax_type=TaxType.GST_CGST,
        rate=Decimal("28.00"),
        cgst_rate=Decimal("14.00"),
        sgst_rate=Decimal("14.00"),
        cess_rate=Decimal("12.00"),
        hsn_code="8703",
        calculation_method=TaxCalculationMethod.PERCENTAGE,
        inclusion_type=TaxInclusionType.EXCLUSIVE,
        rounding_method=RoundingMethod.ROUND_HALF_UP,
        is_active=True,
        priority=4
    )
    tax_rules.append(gst_cess)
    
    # Inclusive tax
    inclusive_tax = await TaxRule.create(
        name="VAT 10% (Inclusive)",
        description="10% VAT included in price",
        tax_type=TaxType.VAT,
        rate=Decimal("10.00"),
        calculation_method=TaxCalculationMethod.PERCENTAGE,
        inclusion_type=TaxInclusionType.INCLUSIVE,
        rounding_method=RoundingMethod.ROUND_HALF_UP,
        is_active=True,
        priority=5
    )
    tax_rules.append(inclusive_tax)
    
    # Fixed amount tax
    fixed_tax = await TaxRule.create(
        name="Environmental Fee",
        description="Fixed $5 environmental fee",
        tax_type=TaxType.SIMPLE,
        rate=Decimal("0.00"),
        calculation_method=TaxCalculationMethod.FIXED_AMOUNT,
        fixed_amount=Decimal("5.00"),
        inclusion_type=TaxInclusionType.EXCLUSIVE,
        rounding_method=RoundingMethod.NO_ROUNDING,
        is_active=True,
        priority=6
    )
    tax_rules.append(fixed_tax)
    
    # Tax exempt rule
    exempt_tax = await TaxRule.create(
        name="Tax Exempt",
        description="Zero-rated tax for exempt items",
        tax_type=TaxType.SIMPLE,
        rate=Decimal("0.00"),
        calculation_method=TaxCalculationMethod.PERCENTAGE,
        inclusion_type=TaxInclusionType.EXCLUSIVE,
        is_tax_exempt=True,
        is_active=True,
        priority=10
    )
    tax_rules.append(exempt_tax)
    
    # Compound tax (calculated on top of other taxes)
    compound_tax = await TaxRule.create(
        name="Luxury Tax (Compound)",
        description="5% luxury tax on top of base tax",
        tax_type=TaxType.SIMPLE,
        rate=Decimal("5.00"),
        calculation_method=TaxCalculationMethod.PERCENTAGE,
        inclusion_type=TaxInclusionType.EXCLUSIVE,
        rounding_method=RoundingMethod.ROUND_UP,
        is_compound=True,
        is_active=True,
        priority=7
    )
    tax_rules.append(compound_tax)
    
    print(f"Created {len(tax_rules)} tax rules")
    return tax_rules


async def create_demo_expenses(sessions: List[POSSession]) -> List[Expense]:
    """Create comprehensive expense records covering all categories and statuses."""
    print("Creating demo expenses...")
    expenses = []
    
    user = await User.first()
    if not user:
        print("No user found, skipping expenses")
        return expenses
    
    # Get a session for reference
    session = sessions[0] if sessions else None
    
    # Create expenses for each category
    expense_data = [
        {
            "title": "Monthly Rent Payment",
            "category": ExpenseCategory.RENT,
            "amount": Decimal("2500.00"),
            "status": ExpenseStatus.PAID,
            "vendor": "Property Management Co.",
            "payment_method": "bank_transfer"
        },
        {
            "title": "Electricity Bill",
            "category": ExpenseCategory.UTILITIES,
            "amount": Decimal("350.75"),
            "status": ExpenseStatus.PAID,
            "vendor": "City Power Company",
            "payment_method": "auto_debit"
        },
        {
            "title": "Staff Salaries - January",
            "category": ExpenseCategory.SALARIES,
            "amount": Decimal("8500.00"),
            "status": ExpenseStatus.APPROVED,
            "vendor": "Payroll",
            "payment_method": "bank_transfer"
        },
        {
            "title": "Office Supplies",
            "category": ExpenseCategory.SUPPLIES,
            "amount": Decimal("245.50"),
            "status": ExpenseStatus.PAID,
            "vendor": "Office Depot",
            "payment_method": "credit_card"
        },
        {
            "title": "Social Media Advertising",
            "category": ExpenseCategory.MARKETING,
            "amount": Decimal("500.00"),
            "status": ExpenseStatus.PENDING,
            "vendor": "Facebook Ads",
            "payment_method": "credit_card"
        },
        {
            "title": "POS System Maintenance",
            "category": ExpenseCategory.MAINTENANCE,
            "amount": Decimal("150.00"),
            "status": ExpenseStatus.PAID,
            "vendor": "Tech Support Inc.",
            "payment_method": "cash"
        },
        {
            "title": "Delivery Van Fuel",
            "category": ExpenseCategory.TRANSPORTATION,
            "amount": Decimal("120.00"),
            "status": ExpenseStatus.PAID,
            "vendor": "Gas Station",
            "payment_method": "cash"
        },
        {
            "title": "Business Insurance Premium",
            "category": ExpenseCategory.INSURANCE,
            "amount": Decimal("1200.00"),
            "status": ExpenseStatus.APPROVED,
            "vendor": "Insurance Corp",
            "payment_method": "bank_transfer"
        },
        {
            "title": "Quarterly Tax Payment",
            "category": ExpenseCategory.TAXES,
            "amount": Decimal("3500.00"),
            "status": ExpenseStatus.PENDING,
            "vendor": "Tax Authority",
            "payment_method": "bank_transfer"
        },
        {
            "title": "Miscellaneous Expense",
            "category": ExpenseCategory.OTHER,
            "amount": Decimal("75.25"),
            "status": ExpenseStatus.REJECTED,
            "vendor": "Various",
            "payment_method": "cash"
        },
    ]
    
    for i, exp_data in enumerate(expense_data):
        expense_date = datetime.now() - timedelta(days=random.randint(1, 30))
        due_date = expense_date + timedelta(days=30) if exp_data["status"] == ExpenseStatus.PENDING else None
        payment_date = expense_date + timedelta(days=random.randint(1, 5)) if exp_data["status"] == ExpenseStatus.PAID else None
        
        expense = await Expense.create(
            expense_number=f"EXP-{expense_date.strftime('%Y%m%d')}-{str(i+1).zfill(3)}",
            title=exp_data["title"],
            description=f"Description for {exp_data['title']}",
            amount=exp_data["amount"],
            category=exp_data["category"],
            status=exp_data["status"],
            vendor_name=exp_data["vendor"],
            vendor_contact=f"+1-555-{random.randint(1000, 9999)}",
            payment_method=exp_data["payment_method"],
            payment_reference=f"REF-{random.randint(10000, 99999)}" if exp_data["status"] == ExpenseStatus.PAID else None,
            payment_date=payment_date,
            expense_date=expense_date,
            due_date=due_date,
            attachments=[f"/uploads/receipt_{i+1}.pdf"] if random.random() < 0.5 else [],
            created_by=user,
            approved_by=user if exp_data["status"] in [ExpenseStatus.APPROVED, ExpenseStatus.PAID] else None,
            notes=f"Notes for {exp_data['title']}"
        )
        expenses.append(expense)
    
    print(f"Created {len(expenses)} expenses")
    return expenses


async def create_demo_cash_transactions(sessions: List[POSSession]) -> List[CashTransaction]:
    """Create comprehensive cash transactions covering all types."""
    print("Creating demo cash transactions...")
    transactions = []
    
    user = await User.first()
    if not user or not sessions:
        print("No user or sessions found, skipping cash transactions")
        return transactions
    
    # Get closed session
    closed_session = next((s for s in sessions if s.status == SessionStatus.CLOSED), None)
    if not closed_session:
        return transactions
    
    # Opening balance
    opening_tx = await CashTransaction.create(
        transaction_type=CashTransactionType.OPENING_BALANCE,
        amount=closed_session.opening_cash,
        balance_before=Decimal("0.00"),
        balance_after=closed_session.opening_cash,
        reference_number=closed_session.session_number,
        category="Session Opening",
        description="Opening cash for session",
        session=closed_session,
        performed_by=user,
        transaction_date=closed_session.opened_at
    )
    transactions.append(opening_tx)
    
    # Cash in transactions
    cash_in_data = [
        {"amount": Decimal("100.00"), "category": "Cash Deposit", "desc": "Additional cash added to drawer"},
        {"amount": Decimal("50.00"), "category": "Cash Deposit", "desc": "Change fund replenishment"},
    ]
    
    for cash_in in cash_in_data:
        tx_date = closed_session.opened_at + timedelta(hours=random.randint(1, 4))
        balance_before = opening_tx.balance_after
        balance_after = balance_before + cash_in["amount"]
        
        tx = await CashTransaction.create(
            transaction_type=CashTransactionType.CASH_IN,
            amount=cash_in["amount"],
            balance_before=balance_before,
            balance_after=balance_after,
            reference_number=f"CI-{random.randint(1000, 9999)}",
            category=cash_in["category"],
            description=cash_in["desc"],
            session=closed_session,
            performed_by=user,
            transaction_date=tx_date
        )
        transactions.append(tx)
        opening_tx.balance_after = balance_after
    
    # Cash out transactions
    cash_out_data = [
        {"amount": Decimal("50.00"), "category": "Petty Cash", "desc": "Office supplies purchase"},
        {"amount": Decimal("30.00"), "category": "Vendor Payment", "desc": "COD delivery payment"},
        {"amount": Decimal("25.00"), "category": "Refund", "desc": "Customer refund"},
    ]
    
    for cash_out in cash_out_data:
        tx_date = closed_session.opened_at + timedelta(hours=random.randint(2, 6))
        balance_before = opening_tx.balance_after
        balance_after = balance_before - cash_out["amount"]
        
        tx = await CashTransaction.create(
            transaction_type=CashTransactionType.CASH_OUT,
            amount=cash_out["amount"],
            balance_before=balance_before,
            balance_after=balance_after,
            reference_number=f"CO-{random.randint(1000, 9999)}",
            category=cash_out["category"],
            description=cash_out["desc"],
            notes=f"Approved by manager",
            session=closed_session,
            performed_by=user,
            transaction_date=tx_date
        )
        transactions.append(tx)
        opening_tx.balance_after = balance_after
    
    # Closing balance
    closing_tx = await CashTransaction.create(
        transaction_type=CashTransactionType.CLOSING_BALANCE,
        amount=closed_session.closing_cash,
        balance_before=opening_tx.balance_after,
        balance_after=closed_session.closing_cash,
        reference_number=closed_session.session_number,
        category="Session Closing",
        description="Closing cash count",
        session=closed_session,
        performed_by=user,
        transaction_date=closed_session.closed_at
    )
    transactions.append(closing_tx)
    
    print(f"Created {len(transactions)} cash transactions")
    return transactions


async def create_demo_customer_transactions(customers: List[Customer]) -> List[CustomerTransaction]:
    """Create comprehensive customer transactions for credit and loyalty tracking."""
    print("Creating demo customer transactions...")
    transactions = []
    
    user = await User.first()
    if not user or not customers:
        print("No user or customers found, skipping customer transactions")
        return transactions
    
    # Get customers with credit
    credit_customers = [c for c in customers if c.credit_limit > 0]
    
    for customer in credit_customers[:5]:  # Limit to first 5
        # Credit sale transaction
        credit_amount = Decimal(str(random.uniform(50, 200)))
        balance_before = Decimal("0.00")
        balance_after = credit_amount
        
        credit_tx = await CustomerTransaction.create(
            customer=customer,
            transaction_type="credit_sale",
            amount=credit_amount,
            loyalty_points=int(float(credit_amount) / 10),  # 1 point per $10
            balance_before=balance_before,
            balance_after=balance_after,
            loyalty_points_before=0,
            loyalty_points_after=int(float(credit_amount) / 10),
            reference_number=f"INV-{random.randint(10000, 99999)}",
            notes="Credit sale transaction",
            created_by=user
        )
        transactions.append(credit_tx)
        
        # Payment transaction
        payment_amount = Decimal(str(random.uniform(20, float(credit_amount))))
        payment_tx = await CustomerTransaction.create(
            customer=customer,
            transaction_type="payment",
            amount=payment_amount,
            loyalty_points=0,
            balance_before=balance_after,
            balance_after=balance_after - payment_amount,
            loyalty_points_before=credit_tx.loyalty_points_after,
            loyalty_points_after=credit_tx.loyalty_points_after,
            reference_number=f"PAY-{random.randint(10000, 99999)}",
            notes="Customer payment received",
            created_by=user
        )
        transactions.append(payment_tx)
    
    # Loyalty point redemption
    loyalty_customers = [c for c in customers if c.loyalty_points > 100]
    if loyalty_customers:
        customer = loyalty_customers[0]
        points_redeemed = 100
        redemption_value = Decimal("10.00")  # $10 for 100 points
        
        loyalty_tx = await CustomerTransaction.create(
            customer=customer,
            transaction_type="loyalty_redemption",
            amount=redemption_value,
            loyalty_points=-points_redeemed,
            balance_before=customer.credit_balance,
            balance_after=customer.credit_balance,
            loyalty_points_before=customer.loyalty_points,
            loyalty_points_after=customer.loyalty_points - points_redeemed,
            reference_number=f"LYL-{random.randint(10000, 99999)}",
            notes="Loyalty points redeemed for discount",
            created_by=user
        )
        transactions.append(loyalty_tx)
    
    # Credit adjustment
    if credit_customers:
        customer = credit_customers[0]
        adjustment_amount = Decimal("25.00")
        
        adjustment_tx = await CustomerTransaction.create(
            customer=customer,
            transaction_type="credit_adjustment",
            amount=adjustment_amount,
            loyalty_points=0,
            balance_before=customer.credit_balance,
            balance_after=customer.credit_balance - adjustment_amount,
            loyalty_points_before=customer.loyalty_points,
            loyalty_points_after=customer.loyalty_points,
            reference_number=f"ADJ-{random.randint(10000, 99999)}",
            notes="Credit adjustment - goodwill gesture",
            created_by=user
        )
        transactions.append(adjustment_tx)
    
    print(f"Created {len(transactions)} customer transactions")
    return transactions


async def create_demo_user_activity_logs(users: List[User], sessions: List[POSSession]) -> List[UserActivityLog]:
    """Create comprehensive user activity logs."""
    print("Creating demo user activity logs...")
    logs = []
    
    if not users or not sessions:
        print("No users or sessions found, skipping activity logs")
        return logs
    
    admin = users[0]
    session = sessions[0] if sessions else None
    session_id = f"sess_{random.randint(100000, 999999)}"
    
    # Login activity
    login_log = await UserActivityLog.create(
        user=admin,
        activity_type=ActivityType.LOGIN,
        description="User logged in successfully",
        session_id=session_id,
        ip_address="192.168.1.100",
        duration_ms=150,
        metadata={"device": "POS Terminal 1", "method": "PIN"}
    )
    logs.append(login_log)
    
    # Sale activity
    sale_log = await UserActivityLog.create(
        user=admin,
        activity_type=ActivityType.SALE,
        description="Completed sale transaction",
        session_id=session_id,
        ip_address="192.168.1.100",
        duration_ms=5000,
        metadata={"invoice": "INV-001", "amount": 125.50, "items": 3}
    )
    logs.append(sale_log)
    
    # Product create
    product_log = await UserActivityLog.create(
        user=admin,
        activity_type=ActivityType.PRODUCT_CREATE,
        description="Created new product",
        session_id=session_id,
        ip_address="192.168.1.100",
        duration_ms=2000,
        metadata={"product_name": "New Product", "sku": "NEW-001"}
    )
    logs.append(product_log)
    
    # Settings update
    settings_log = await UserActivityLog.create(
        user=admin,
        activity_type=ActivityType.SETTINGS_UPDATE,
        description="Updated system settings",
        session_id=session_id,
        ip_address="192.168.1.100",
        duration_ms=1000,
        metadata={"section": "display", "changes": ["theme", "fontSize"]}
    )
    logs.append(settings_log)
    
    # Inventory adjustment
    inventory_log = await UserActivityLog.create(
        user=admin,
        activity_type=ActivityType.INVENTORY_ADJUSTMENT,
        description="Performed stock adjustment",
        session_id=session_id,
        ip_address="192.168.1.100",
        duration_ms=3000,
        metadata={"products_adjusted": 5, "reason": "Physical count"}
    )
    logs.append(inventory_log)
    
    # Logout activity
    logout_log = await UserActivityLog.create(
        user=admin,
        activity_type=ActivityType.LOGOUT,
        description="User logged out",
        session_id=session_id,
        ip_address="192.168.1.100",
        duration_ms=100,
        metadata={"session_duration_minutes": 120}
    )
    logs.append(logout_log)
    
    print(f"Created {len(logs)} user activity logs")
    return logs


async def create_demo_settings() -> List[Setting]:
    """Create comprehensive normalized settings."""
    print("Creating demo settings...")
    settings = []
    
    # Display settings
    display_settings = [
        {"section": "display", "key": "theme", "value": "light", "default": "light", "type": SettingDataType.STRING, "desc": "UI theme (light/dark)"},
        {"section": "display", "key": "fontSize", "value": "medium", "default": "medium", "type": SettingDataType.STRING, "desc": "Font size (small/medium/large)"},
        {"section": "display", "key": "screenTimeout", "value": "0", "default": "0", "type": SettingDataType.NUMBER, "desc": "Screen timeout in minutes (0 = never)"},
    ]
    
    # Security settings
    security_settings = [
        {"section": "security", "key": "sessionTimeout", "value": "30", "default": "30", "type": SettingDataType.NUMBER, "desc": "Session timeout in minutes"},
        {"section": "security", "key": "requirePinForRefunds", "value": "true", "default": "true", "type": SettingDataType.BOOLEAN, "desc": "Require PIN for refunds"},
        {"section": "security", "key": "requirePinForVoids", "value": "true", "default": "true", "type": SettingDataType.BOOLEAN, "desc": "Require PIN for voids"},
        {"section": "security", "key": "requirePinForDiscounts", "value": "false", "default": "false", "type": SettingDataType.BOOLEAN, "desc": "Require PIN for discounts"},
    ]
    
    # Inventory settings
    inventory_settings = [
        {"section": "inventory", "key": "enableStockTracking", "value": "true", "default": "true", "type": SettingDataType.BOOLEAN, "desc": "Enable stock tracking"},
        {"section": "inventory", "key": "lowStockThreshold", "value": "10", "default": "10", "type": SettingDataType.NUMBER, "desc": "Low stock alert threshold"},
        {"section": "inventory", "key": "allowNegativeStock", "value": "false", "default": "false", "type": SettingDataType.BOOLEAN, "desc": "Allow negative stock"},
    ]
    
    # Business settings
    business_settings = [
        {"section": "business", "key": "storeName", "value": "MidLogic POS", "default": "MidLogic POS", "type": SettingDataType.STRING, "desc": "Store name"},
        {"section": "business", "key": "currency", "value": "USD", "default": "USD", "type": SettingDataType.STRING, "desc": "Currency code"},
        {"section": "business", "key": "timezone", "value": "UTC", "default": "UTC", "type": SettingDataType.STRING, "desc": "Timezone"},
    ]
    
    all_settings = display_settings + security_settings + inventory_settings + business_settings
    
    for setting_data in all_settings:
        setting = await Setting.create(
            section=setting_data["section"],
            key=setting_data["key"],
            value=setting_data["value"],
            default_value=setting_data["default"],
            data_type=setting_data["type"],
            description=setting_data["desc"]
        )
        settings.append(setting)
    
    print(f"Created {len(settings)} settings")
    return settings


async def generate_all_demo_data():
    """Generate all comprehensive demo data with edge cases."""
    print("\n" + "="*60)
    print("GENERATING COMPREHENSIVE DEMO DATA WITH EDGE CASES")
    print("="*60 + "\n")
    
    try:
        # Get admin user
        user = await User.first()
        if not user:
            raise Exception("No user found. Please create a user first.")
        
        # Create additional users with edge cases
        additional_users = await create_demo_users()
        all_users = [user] + additional_users
        
        # Create tax rules (GST, VAT, compound, etc.)
        tax_rules = await create_demo_tax_rules()
        
        # Create categories
        category_map = await create_demo_categories()
        
        # Create products of all types
        simple_products = await create_demo_simple_products(category_map)
        variation_products = await create_demo_variation_products(category_map)
        bundle_products = await create_demo_bundle_products(category_map)
        service_products = await create_demo_service_products(category_map)
        
        all_products = simple_products + variation_products + bundle_products + service_products
        
        # Create customers with edge cases (credit statuses, loyalty)
        customers = await create_demo_customers()
        
        # Create discounts
        discounts = await create_demo_discounts()
        
        # Create POS sessions
        sessions = await create_demo_pos_sessions(user)
        
        # Create sales (depends on products, customers, sessions, discounts)
        sales = await create_demo_sales(all_products, customers, sessions, discounts)
        
        # Create stock transactions
        stock_transactions = await create_demo_stock_transactions(all_products)
        
        # Create stock adjustments
        adjustments = await create_demo_stock_adjustments(all_products)
        
        # Create expenses (all categories and statuses)
        expenses = await create_demo_expenses(sessions)
        
        # Create cash transactions (all types)
        cash_transactions = await create_demo_cash_transactions(sessions)
        
        # Create customer transactions (credit, loyalty)
        customer_transactions = await create_demo_customer_transactions(customers)
        
        # Create user activity logs
        activity_logs = await create_demo_user_activity_logs(all_users, sessions)
        
        # Create normalized settings
        settings = await create_demo_settings()
        
        print("\n" + "="*60)
        print("DEMO DATA GENERATION COMPLETE")
        print("="*60)
        print(f"Users: {len(all_users)}")
        print(f"Tax Rules: {len(tax_rules)}")
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
        print(f"Stock Transactions: {len(stock_transactions)}")
        print(f"Stock Adjustments: {len(adjustments)}")
        print(f"Expenses: {len(expenses)}")
        print(f"Cash Transactions: {len(cash_transactions)}")
        print(f"Customer Transactions: {len(customer_transactions)}")
        print(f"User Activity Logs: {len(activity_logs)}")
        print(f"Settings: {len(settings)}")
        print("="*60 + "\n")
        
        return {
            "users": len(all_users),
            "tax_rules": len(tax_rules),
            "categories": len(category_map),
            "products": len(all_products),
            "customers": len(customers),
            "discounts": len(discounts),
            "sessions": len(sessions),
            "sales": len(sales),
            "stock_transactions": len(stock_transactions),
            "adjustments": len(adjustments),
            "expenses": len(expenses),
            "cash_transactions": len(cash_transactions),
            "customer_transactions": len(customer_transactions),
            "activity_logs": len(activity_logs),
            "settings": len(settings)
        }
        
    except Exception as e:
        print(f"Error generating demo data: {e}")
        raise


async def clear_demo_data():
    """Clear all demo data (use with caution)."""
    print("Clearing demo data...")
    
    try:
        # Delete in reverse order of dependencies
        print("Deleting user activity logs...")
        await UserActivityLog.all().delete()
        
        print("Deleting discount usages...")
        await DiscountUsage.all().delete()
        
        print("Deleting transaction-related data...")
        await Expense.all().delete()
        await CashTransaction.all().delete()
        
        print("Deleting sales...")
        await Sale.all().delete()
        
        print("Deleting POS sessions...")
        await POSSession.all().delete()
        
        print("Deleting customer transactions...")
        await CustomerTransaction.all().delete()
        
        print("Deleting inventory data...")
        await StockAdjustmentLine.all().delete()
        await StockAdjustment.all().delete()
        await StockTransaction.all().delete()
        
        print("Deleting discounts...")
        await Discount.all().delete()
        
        print("Deleting tax rules...")
        await TaxRule.all().delete()
        
        print("Deleting product-related data...")
        await ProductBundle.all().delete()
        await ProductVariation.all().delete()
        await Product.all().delete()
        await ProductCategory.all().delete()
        
        print("Deleting customers...")
        await Customer.all().delete()
        
        print("Deleting settings...")
        await Setting.all().delete()
        
        # Note: We don't delete users as they are critical for system operation
        # Only delete demo users (not the first admin user)
        print("Deleting demo users (keeping admin)...")
        admin = await User.first()
        if admin:
            await User.filter(id__gt=admin.id).delete()
        
        print("Demo data cleared successfully")
    except Exception as e:
        print(f"Error clearing demo data: {e}")
        raise
