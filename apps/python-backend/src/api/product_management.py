"""
Product Management API endpoints
Comprehensive product catalog management with categories, variations, and bundles
"""
import logging
import os
import shutil
from typing import List, Optional
from decimal import Decimal
from pathlib import Path
from fastapi import APIRouter, HTTPException, status, Query, UploadFile, File
from fastapi.responses import FileResponse
from tortoise.exceptions import DoesNotExist, IntegrityError

from ..database.models import (
    Product,
    ProductCategory,
    ProductVariation,
    ProductBundle,
    ProductType,
    TaxRule,
    User
)
from .schemas import (
    ProductCategoryCreate,
    ProductCategoryUpdate,
    ProductCategoryResponse,
    ProductVariationCreate,
    ProductVariationUpdate,
    ProductVariationResponse,
    ProductBundleComponentCreate,
    ProductBundleComponentResponse,
    ProductCreate,
    ProductUpdate,
    ProductResponse
)

router = APIRouter()
logger = logging.getLogger(__name__)

# File upload configuration
UPLOAD_DIR = Path("uploads")
PRODUCTS_UPLOAD_DIR = UPLOAD_DIR / "products"
CATEGORIES_UPLOAD_DIR = UPLOAD_DIR / "categories"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

# Ensure upload directories exist
PRODUCTS_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
CATEGORIES_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================================
# Helper Functions
# ============================================================================

def validate_image_file(file: UploadFile) -> None:
    """Validate uploaded image file"""
    # Check file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Check file size (if available)
    if hasattr(file, 'size') and file.size and file.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE / 1024 / 1024}MB"
        )


async def product_to_response(product: Product) -> ProductResponse:
    """Convert Product model to ProductResponse schema with related data"""
    # Get category name if exists (category is already prefetched)
    category_name = None
    category_id = None
    if hasattr(product, 'category') and product.category:
        await product.fetch_related('category')
        category_name = product.category.name
        category_id = product.category.id

    # Get tax name if exists (tax is already prefetched)
    tax_name = None
    tax_id = None
    if hasattr(product, 'tax') and product.tax:
        await product.fetch_related('tax')
        tax_name = product.tax.name
        tax_id = product.tax.id

    # Get variations if product_type = variation
    variations = None
    if product.product_type == ProductType.VARIATION:
        variations_list = await ProductVariation.filter(parent_product_id=product.id).all()
        variations = [
            ProductVariationResponse(
                id=v.id,
                parent_product_id=v.parent_product_id,
                variation_name=v.variation_name,
                sku=v.sku,
                barcode=v.barcode,
                price_adjustment=float(v.price_adjustment),
                cost_price=float(v.cost_price) if v.cost_price else None,
                stock_quantity=v.stock_quantity,
                attributes=v.attributes,
                is_active=v.is_active,
                created_at=v.created_at,
                updated_at=v.updated_at
            )
            for v in variations_list
        ]

    # Get bundle components if product_type = bundle
    bundle_components = None
    if product.product_type == ProductType.BUNDLE:
        components_list = await ProductBundle.filter(bundle_product_id=product.id).all()
        bundle_components = [
            ProductBundleComponentResponse(
                id=c.id,
                bundle_product_id=c.bundle_product_id,
                component_product_id=c.component_product_id,
                quantity=c.quantity,
                created_at=c.created_at,
                updated_at=c.updated_at
            )
            for c in components_list
        ]

    # Backward compatibility values
    base_price_val = product.base_price or product.selling_price
    stock_qty = product.stock_quantity or product.current_stock
    low_stock = product.low_stock_threshold or product.min_stock_level

    return ProductResponse(
        id=product.id,
        name=product.name,
        description=product.description,
        sku=product.sku,
        barcode=product.barcode,
        product_type=product.product_type.value,
        category_id=category_id,
        category_name=category_name,
        base_price=float(base_price_val),
        cost_price=float(product.cost_price),
        tax_id=tax_id,
        tax_name=tax_name,
        is_active=product.is_active,
        track_inventory=product.track_inventory,
        stock_quantity=stock_qty,
        low_stock_threshold=low_stock,
        max_stock_level=product.max_stock_level,
        image_paths=product.image_paths or [],
        notes=product.notes,
        created_at=product.created_at,
        updated_at=product.updated_at,
        variations=variations,
        bundle_components=bundle_components,
        # Backward compatibility
        item_type=product.item_type.value,
        category=category_name or "general",
        selling_price=float(base_price_val),
        tax_rate=float(product.tax_rate),
        current_stock=stock_qty,
        min_stock_level=low_stock,
        image_url=product.image_url or (product.image_paths[0] if product.image_paths else None)
    )


# ============================================================================
# Product Category Endpoints
# ============================================================================

@router.get("/categories", response_model=List[ProductCategoryResponse])
async def get_all_categories(
    is_active: Optional[bool] = None,
    parent_id: Optional[int] = None
):
    """
    Get all product categories with optional filtering.
    
    - **is_active**: Filter by active status
    - **parent_id**: Filter by parent category (null for root categories)
    """
    query = ProductCategory.all()
    
    if is_active is not None:
        query = query.filter(is_active=is_active)
    
    if parent_id is not None:
        query = query.filter(parent_category_id=parent_id)
    elif parent_id == 0:  # Explicitly request root categories
        query = query.filter(parent_category_id__isnull=True)
    
    categories = await query.all()
    
    return [
        ProductCategoryResponse(
            id=cat.id,
            name=cat.name,
            description=cat.description,
            image_path=cat.image_path,
            parent_category_id=cat.parent_category_id,
            display_order=cat.display_order,
            is_active=cat.is_active,
            created_at=cat.created_at,
            updated_at=cat.updated_at
        )
        for cat in categories
    ]


@router.get("/categories/{category_id}", response_model=ProductCategoryResponse)
async def get_category(category_id: int):
    """Get a specific product category by ID"""
    try:
        category = await ProductCategory.get(id=category_id)
        return ProductCategoryResponse(
            id=category.id,
            name=category.name,
            description=category.description,
            image_path=category.image_path,
            parent_category_id=category.parent_category_id,
            display_order=category.display_order,
            is_active=category.is_active,
            created_at=category.created_at,
            updated_at=category.updated_at
        )
    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with ID {category_id} not found"
        )


@router.post("/categories", response_model=ProductCategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(category_data: ProductCategoryCreate):
    """Create a new product category"""
    try:
        # Validate parent category if specified
        if category_data.parent_category_id:
            parent = await ProductCategory.get_or_none(id=category_data.parent_category_id)
            if not parent:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Parent category with ID {category_data.parent_category_id} not found"
                )
        
        new_category = await ProductCategory.create(
            name=category_data.name,
            description=category_data.description,
            parent_category_id=category_data.parent_category_id,
            display_order=category_data.display_order,
            is_active=category_data.is_active
        )
        
        logger.info(f"New category created: {new_category.name} (ID: {new_category.id})")
        
        return ProductCategoryResponse(
            id=new_category.id,
            name=new_category.name,
            description=new_category.description,
            image_path=new_category.image_path,
            parent_category_id=new_category.parent_category_id,
            display_order=new_category.display_order,
            is_active=new_category.is_active,
            created_at=new_category.created_at,
            updated_at=new_category.updated_at
        )
    
    except IntegrityError as e:
        logger.error(f"Failed to create category: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create category. Name may already exist."
        )


@router.put("/categories/{category_id}", response_model=ProductCategoryResponse)
async def update_category(category_id: int, category_data: ProductCategoryUpdate):
    """Update a product category"""
    try:
        category = await ProductCategory.get(id=category_id)

        # Update only provided fields
        update_data = category_data.model_dump(exclude_unset=True)

        # Validate parent category if being updated
        if 'parent_category_id' in update_data and update_data['parent_category_id']:
            # Prevent circular reference
            if update_data['parent_category_id'] == category_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Category cannot be its own parent"
                )

            parent = await ProductCategory.get_or_none(id=update_data['parent_category_id'])
            if not parent:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Parent category with ID {update_data['parent_category_id']} not found"
                )

        for field, value in update_data.items():
            setattr(category, field, value)

        await category.save()

        logger.info(f"Category {category_id} updated successfully")

        return ProductCategoryResponse(
            id=category.id,
            name=category.name,
            description=category.description,
            image_path=category.image_path,
            parent_category_id=category.parent_category_id,
            display_order=category.display_order,
            is_active=category.is_active,
            created_at=category.created_at,
            updated_at=category.updated_at
        )

    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with ID {category_id} not found"
        )
    except IntegrityError as e:
        logger.error(f"Failed to update category: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update category."
        )


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(category_id: int):
    """Delete a product category (checks for products first)"""
    try:
        category = await ProductCategory.get(id=category_id)

        # Check if category has products
        products_count = await Product.filter(category_id=category_id).count()
        if products_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete category. It has {products_count} product(s) assigned to it."
            )

        # Check if category has subcategories
        subcategories_count = await ProductCategory.filter(parent_category_id=category_id).count()
        if subcategories_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete category. It has {subcategories_count} subcategory(ies)."
            )

        await category.delete()

        logger.info(f"Category {category_id} deleted")

        return None

    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with ID {category_id} not found"
        )


@router.post("/categories/{category_id}/image", response_model=dict)
async def upload_category_image(category_id: int, file: UploadFile = File(...)):
    """Upload an image for a product category"""
    try:
        category = await ProductCategory.get(id=category_id)

        # Validate file
        validate_image_file(file)

        # Create category-specific directory
        category_dir = CATEGORIES_UPLOAD_DIR / str(category_id)
        category_dir.mkdir(parents=True, exist_ok=True)

        # Generate unique filename
        file_ext = Path(file.filename).suffix.lower()
        file_path = category_dir / f"category{file_ext}"

        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Update category with image path
        relative_path = str(file_path.relative_to(UPLOAD_DIR))
        category.image_path = relative_path
        await category.save()

        logger.info(f"Image uploaded for category {category_id}: {relative_path}")

        return {
            "success": True,
            "image_path": relative_path,
            "message": "Image uploaded successfully"
        }

    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with ID {category_id} not found"
        )
    except Exception as e:
        logger.error(f"Failed to upload category image: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload image"
        )


@router.delete("/categories/{category_id}/image", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category_image(category_id: int):
    """Delete category image"""
    try:
        category = await ProductCategory.get(id=category_id)

        if category.image_path:
            # Delete file if exists
            file_path = UPLOAD_DIR / category.image_path
            if file_path.exists():
                file_path.unlink()

            # Clear image path
            category.image_path = None
            await category.save()

            logger.info(f"Image deleted for category {category_id}")

        return None

    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with ID {category_id} not found"
        )


# ============================================================================
# Product Endpoints
# ============================================================================

@router.get("/", response_model=List[ProductResponse])
async def get_all_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    is_active: Optional[bool] = None,
    product_type: Optional[str] = None,
    category_id: Optional[int] = None,
    search: Optional[str] = None
):
    """
    Get all products with optional filtering and pagination.

    - **skip**: Number of records to skip (for pagination)
    - **limit**: Maximum number of records to return
    - **is_active**: Filter by active status
    - **product_type**: Filter by product type (simple/bundle/variation/service)
    - **category_id**: Filter by category
    - **search**: Search in name, SKU, or barcode
    """
    query = Product.all().prefetch_related('category', 'tax')

    # Apply filters
    if is_active is not None:
        query = query.filter(is_active=is_active)

    if product_type:
        query = query.filter(product_type=product_type)

    if category_id:
        query = query.filter(category_id=category_id)

    if search:
        query = query.filter(
            name__icontains=search
        ) | query.filter(
            sku__icontains=search
        ) | query.filter(
            barcode__icontains=search
        )

    # Apply pagination
    products = await query.offset(skip).limit(limit).all()

    # Convert to response format
    response_list = []
    for product in products:
        response_list.append(await product_to_response(product))

    return response_list


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int):
    """Get a specific product by ID with full details"""
    try:
        product = await Product.get(id=product_id).prefetch_related('category', 'tax')
        return await product_to_response(product)
    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found"
        )


@router.get("/barcode/{barcode}", response_model=ProductResponse)
async def get_product_by_barcode(barcode: str):
    """Lookup product by barcode for POS scanning"""
    try:
        # First try to find in main products
        product = await Product.get_or_none(barcode=barcode).prefetch_related('category', 'tax')

        if product:
            return await product_to_response(product)

        # If not found, try to find in variations
        variation = await ProductVariation.get_or_none(barcode=barcode)
        if variation:
            parent_product = await Product.get(id=variation.parent_product_id).prefetch_related('category', 'tax')
            response = await product_to_response(parent_product)
            # Add variation-specific info
            response.selected_variation_id = variation.id
            response.selected_variation_name = variation.variation_name
            response.base_price = float(parent_product.base_price + variation.price_adjustment)
            return response

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with barcode '{barcode}' not found"
        )

    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with barcode '{barcode}' not found"
        )


@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(product_data: ProductCreate, created_by_id: int = 1):
    """
    Create a new product.

    Supports all product types: SIMPLE, BUNDLE, VARIATION, SERVICE
    """
    try:
        # Get the creator user
        creator = await User.get(id=created_by_id)

        # Validate category if specified
        if product_data.category_id:
            category = await ProductCategory.get_or_none(id=product_data.category_id)
            if not category:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Category with ID {product_data.category_id} not found"
                )

        # Validate tax if specified
        if product_data.tax_id:
            tax = await TaxRule.get_or_none(id=product_data.tax_id)
            if not tax:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Tax rule with ID {product_data.tax_id} not found"
                )

        # Handle backward compatibility
        base_price = product_data.base_price or product_data.selling_price or 0
        stock_qty = product_data.stock_quantity or product_data.current_stock or 0
        low_stock = product_data.low_stock_threshold or product_data.min_stock_level or 0

        # Create product
        new_product = await Product.create(
            name=product_data.name,
            description=product_data.description,
            sku=product_data.sku,
            barcode=product_data.barcode,
            product_type=product_data.product_type,
            item_type=product_data.item_type or "product",
            category_id=product_data.category_id,
            base_price=Decimal(str(base_price)),
            selling_price=Decimal(str(base_price)),  # Backward compatibility
            cost_price=Decimal(str(product_data.cost_price)),
            tax_id=product_data.tax_id,
            tax_rate=Decimal(str(product_data.tax_rate or 0)),  # Backward compatibility
            is_active=product_data.is_active,
            track_inventory=product_data.track_inventory,
            stock_quantity=stock_qty,
            current_stock=stock_qty,  # Backward compatibility
            low_stock_threshold=low_stock,
            min_stock_level=low_stock,  # Backward compatibility
            max_stock_level=product_data.max_stock_level,
            image_paths=product_data.image_paths,
            image_url=product_data.image_url,  # Backward compatibility
            notes=product_data.notes,
            created_by=creator
        )

        # Handle variations if product_type = variation
        if product_data.product_type == "variation" and product_data.variations:
            for var_data in product_data.variations:
                await ProductVariation.create(
                    parent_product=new_product,
                    variation_name=var_data.variation_name,
                    sku=var_data.sku,
                    barcode=var_data.barcode,
                    price_adjustment=Decimal(str(var_data.price_adjustment)),
                    cost_price=Decimal(str(var_data.cost_price)) if var_data.cost_price else None,
                    stock_quantity=var_data.stock_quantity,
                    attributes=var_data.attributes,
                    is_active=var_data.is_active
                )

        # Handle bundle components if product_type = bundle
        if product_data.product_type == "bundle" and product_data.bundle_components:
            for comp_data in product_data.bundle_components:
                # Validate component product exists
                component = await Product.get_or_none(id=comp_data.component_product_id)
                if not component:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Component product with ID {comp_data.component_product_id} not found"
                    )

                await ProductBundle.create(
                    bundle_product=new_product,
                    component_product=component,
                    quantity=comp_data.quantity
                )

        logger.info(f"New product created: {new_product.name} (ID: {new_product.id})")

        return await product_to_response(new_product)

    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Creator user with ID {created_by_id} not found"
        )
    except IntegrityError as e:
        logger.error(f"Failed to create product: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create product. SKU or barcode may already exist."
        )


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(product_id: int, product_data: ProductUpdate):
    """Update product information"""
    try:
        product = await Product.get(id=product_id)

        # Update only provided fields
        update_data = product_data.model_dump(exclude_unset=True)

        # Validate category if being updated
        if 'category_id' in update_data and update_data['category_id']:
            category = await ProductCategory.get_or_none(id=update_data['category_id'])
            if not category:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Category with ID {update_data['category_id']} not found"
                )

        # Validate tax if being updated
        if 'tax_id' in update_data and update_data['tax_id']:
            tax = await TaxRule.get_or_none(id=update_data['tax_id'])
            if not tax:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Tax rule with ID {update_data['tax_id']} not found"
                )

        # Convert float to Decimal for price fields
        for field in ['base_price', 'cost_price', 'selling_price', 'tax_rate']:
            if field in update_data and update_data[field] is not None:
                update_data[field] = Decimal(str(update_data[field]))

        # Handle backward compatibility field mappings
        if 'selling_price' in update_data and 'base_price' not in update_data:
            update_data['base_price'] = update_data['selling_price']
        if 'current_stock' in update_data and 'stock_quantity' not in update_data:
            update_data['stock_quantity'] = update_data['current_stock']
        if 'min_stock_level' in update_data and 'low_stock_threshold' not in update_data:
            update_data['low_stock_threshold'] = update_data['min_stock_level']

        for field, value in update_data.items():
            setattr(product, field, value)

        await product.save()

        logger.info(f"Product {product_id} updated successfully")

        return await product_to_response(product)

    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found"
        )
    except IntegrityError as e:
        logger.error(f"Failed to update product: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update product. SKU or barcode may already exist."
        )


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: int):
    """
    Delete a product (soft delete by setting is_active to False).
    """
    try:
        product = await Product.get(id=product_id)

        # Soft delete
        product.is_active = False
        await product.save()

        logger.info(f"Product {product_id} deactivated")

        return None

    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found"
        )


@router.post("/{product_id}/images", response_model=dict)
async def upload_product_images(product_id: int, files: List[UploadFile] = File(...)):
    """Upload multiple images for a product"""
    try:
        product = await Product.get(id=product_id)

        # Create product-specific directory
        product_dir = PRODUCTS_UPLOAD_DIR / str(product_id)
        product_dir.mkdir(parents=True, exist_ok=True)

        uploaded_paths = []

        for idx, file in enumerate(files):
            # Validate file
            validate_image_file(file)

            # Generate unique filename
            file_ext = Path(file.filename).suffix.lower()
            file_path = product_dir / f"image_{idx + len(product.image_paths or [])}{file_ext}"

            # Save file
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            # Store relative path
            relative_path = str(file_path.relative_to(UPLOAD_DIR))
            uploaded_paths.append(relative_path)

        # Update product with new image paths
        current_images = product.image_paths or []
        product.image_paths = current_images + uploaded_paths

        # Update backward compatibility field
        if not product.image_url and uploaded_paths:
            product.image_url = uploaded_paths[0]

        await product.save()

        logger.info(f"Images uploaded for product {product_id}: {uploaded_paths}")

        return {
            "success": True,
            "image_paths": uploaded_paths,
            "total_images": len(product.image_paths),
            "message": f"{len(uploaded_paths)} image(s) uploaded successfully"
        }

    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found"
        )
    except Exception as e:
        logger.error(f"Failed to upload product images: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload images"
        )


@router.delete("/{product_id}/images/{image_index}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product_image(product_id: int, image_index: int):
    """Delete a specific product image by index"""
    try:
        product = await Product.get(id=product_id)

        if not product.image_paths or image_index >= len(product.image_paths):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Image at index {image_index} not found"
            )

        # Get image path to delete
        image_path = product.image_paths[image_index]

        # Delete file if exists
        file_path = UPLOAD_DIR / image_path
        if file_path.exists():
            file_path.unlink()

        # Remove from image_paths array
        product.image_paths.pop(image_index)

        # Update backward compatibility field
        if product.image_url == image_path:
            product.image_url = product.image_paths[0] if product.image_paths else None

        await product.save()

        logger.info(f"Image deleted for product {product_id}: {image_path}")

        return None

    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found"
        )


# ============================================================================
# Product Variation Endpoints
# ============================================================================

@router.get("/{product_id}/variations", response_model=List[ProductVariationResponse])
async def get_product_variations(product_id: int):
    """Get all variations for a product"""
    try:
        product = await Product.get(id=product_id)

        if product.product_type != ProductType.VARIATION:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Product is not a variation type"
            )

        variations = await ProductVariation.filter(parent_product_id=product_id).all()

        return [
            ProductVariationResponse(
                id=v.id,
                parent_product_id=v.parent_product_id,
                variation_name=v.variation_name,
                sku=v.sku,
                barcode=v.barcode,
                price_adjustment=float(v.price_adjustment),
                cost_price=float(v.cost_price) if v.cost_price else None,
                stock_quantity=v.stock_quantity,
                attributes=v.attributes,
                is_active=v.is_active,
                created_at=v.created_at,
                updated_at=v.updated_at
            )
            for v in variations
        ]

    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found"
        )


@router.post("/{product_id}/variations", response_model=ProductVariationResponse, status_code=status.HTTP_201_CREATED)
async def create_product_variation(product_id: int, variation_data: ProductVariationCreate):
    """Create a new variation for a product"""
    try:
        product = await Product.get(id=product_id)

        if product.product_type != ProductType.VARIATION:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Product is not a variation type"
            )

        new_variation = await ProductVariation.create(
            parent_product=product,
            variation_name=variation_data.variation_name,
            sku=variation_data.sku,
            barcode=variation_data.barcode,
            price_adjustment=Decimal(str(variation_data.price_adjustment)),
            cost_price=Decimal(str(variation_data.cost_price)) if variation_data.cost_price else None,
            stock_quantity=variation_data.stock_quantity,
            attributes=variation_data.attributes,
            is_active=variation_data.is_active
        )

        logger.info(f"New variation created for product {product_id}: {new_variation.variation_name}")

        return ProductVariationResponse(
            id=new_variation.id,
            parent_product_id=new_variation.parent_product_id,
            variation_name=new_variation.variation_name,
            sku=new_variation.sku,
            barcode=new_variation.barcode,
            price_adjustment=float(new_variation.price_adjustment),
            cost_price=float(new_variation.cost_price) if new_variation.cost_price else None,
            stock_quantity=new_variation.stock_quantity,
            attributes=new_variation.attributes,
            is_active=new_variation.is_active,
            created_at=new_variation.created_at,
            updated_at=new_variation.updated_at
        )

    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found"
        )
    except IntegrityError as e:
        logger.error(f"Failed to create variation: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create variation. SKU or barcode may already exist."
        )


@router.put("/{product_id}/variations/{variation_id}", response_model=ProductVariationResponse)
async def update_product_variation(product_id: int, variation_id: int, variation_data: ProductVariationUpdate):
    """Update a product variation"""
    try:
        variation = await ProductVariation.get(id=variation_id, parent_product_id=product_id)

        # Update only provided fields
        update_data = variation_data.model_dump(exclude_unset=True)

        # Convert float to Decimal for price fields
        for field in ['price_adjustment', 'cost_price']:
            if field in update_data and update_data[field] is not None:
                update_data[field] = Decimal(str(update_data[field]))

        for field, value in update_data.items():
            setattr(variation, field, value)

        await variation.save()

        logger.info(f"Variation {variation_id} updated successfully")

        return ProductVariationResponse(
            id=variation.id,
            parent_product_id=variation.parent_product_id,
            variation_name=variation.variation_name,
            sku=variation.sku,
            barcode=variation.barcode,
            price_adjustment=float(variation.price_adjustment),
            cost_price=float(variation.cost_price) if variation.cost_price else None,
            stock_quantity=variation.stock_quantity,
            attributes=variation.attributes,
            is_active=variation.is_active,
            created_at=variation.created_at,
            updated_at=variation.updated_at
        )

    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Variation with ID {variation_id} not found for product {product_id}"
        )
    except IntegrityError as e:
        logger.error(f"Failed to update variation: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update variation. SKU or barcode may already exist."
        )


@router.delete("/{product_id}/variations/{variation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product_variation(product_id: int, variation_id: int):
    """Delete a product variation"""
    try:
        variation = await ProductVariation.get(id=variation_id, parent_product_id=product_id)
        await variation.delete()

        logger.info(f"Variation {variation_id} deleted")

        return None

    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Variation with ID {variation_id} not found for product {product_id}"
        )


# ============================================================================
# Product Bundle Endpoints
# ============================================================================

@router.get("/{product_id}/bundle-components", response_model=List[ProductBundleComponentResponse])
async def get_bundle_components(product_id: int):
    """Get all components for a bundle product"""
    try:
        product = await Product.get(id=product_id)

        if product.product_type != ProductType.BUNDLE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Product is not a bundle type"
            )

        components = await ProductBundle.filter(bundle_product_id=product_id).all()

        return [
            ProductBundleComponentResponse(
                id=c.id,
                bundle_product_id=c.bundle_product_id,
                component_product_id=c.component_product_id,
                quantity=c.quantity,
                created_at=c.created_at,
                updated_at=c.updated_at
            )
            for c in components
        ]

    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found"
        )


@router.post("/{product_id}/bundle-components", response_model=ProductBundleComponentResponse, status_code=status.HTTP_201_CREATED)
async def add_bundle_component(product_id: int, component_data: ProductBundleComponentCreate):
    """Add a component to a bundle product"""
    try:
        product = await Product.get(id=product_id)

        if product.product_type != ProductType.BUNDLE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Product is not a bundle type"
            )

        # Validate component product exists
        component = await Product.get(id=component_data.component_product_id)

        # Prevent adding bundle to itself
        if component_data.component_product_id == product_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot add bundle to itself"
            )

        new_component = await ProductBundle.create(
            bundle_product=product,
            component_product=component,
            quantity=component_data.quantity
        )

        logger.info(f"Component added to bundle {product_id}: {component.name} x{component_data.quantity}")

        return ProductBundleComponentResponse(
            id=new_component.id,
            bundle_product_id=new_component.bundle_product_id,
            component_product_id=new_component.component_product_id,
            quantity=new_component.quantity,
            created_at=new_component.created_at,
            updated_at=new_component.updated_at
        )

    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product or component not found"
        )
    except IntegrityError as e:
        logger.error(f"Failed to add bundle component: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Component already exists in bundle"
        )


@router.delete("/{product_id}/bundle-components/{component_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_bundle_component(product_id: int, component_id: int):
    """Remove a component from a bundle product"""
    try:
        component = await ProductBundle.get(id=component_id, bundle_product_id=product_id)
        await component.delete()

        logger.info(f"Component {component_id} removed from bundle {product_id}")

        return None

    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bundle component with ID {component_id} not found for product {product_id}"
        )

