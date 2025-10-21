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
    CashTransaction,
    Expense
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
                product=product,
                name=var_data["name"],
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


async def generate_all_demo_data():
    """Generate all demo data."""
    print("\n" + "="*60)
    print("GENERATING COMPREHENSIVE DEMO DATA")
    print("="*60 + "\n")
    
    try:
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
        print(f"Stock Transactions: {len(transactions)}")
        print(f"Stock Adjustments: {len(adjustments)}")
        print("="*60 + "\n")
        
        return {
            "categories": len(category_map),
            "products": len(all_products),
            "customers": len(customers),
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
        # First delete transaction-related data
        await Expense.all().delete()
        await CashTransaction.all().delete()
        await Sale.all().delete()
        await CustomerTransaction.all().delete()
        
        # Then delete inventory data
        await StockAdjustmentLine.all().delete()
        await StockAdjustment.all().delete()
        await StockTransaction.all().delete()
        
        # Then delete product-related data
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
