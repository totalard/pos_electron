"""
Enhanced Products API endpoints for comprehensive inventory management
"""
import logging
from typing import List, Optional
from decimal import Decimal
from fastapi import APIRouter, HTTPException, status, Query, Depends
from tortoise.exceptions import DoesNotExist, IntegrityError
from tortoise.transactions import in_transaction

from ..database.models import (
    EnhancedProduct,
    EnhancedProductCategory,
    TaxRate,
    ProductImage,
    ProductAttribute,
    ProductAttributeValue,
    ProductVariation,
    BundleItem,
    User
)
from .enhanced_product_schemas import (
    # Category schemas
    ProductCategoryCreate,
    ProductCategoryUpdate,
    ProductCategoryResponse,
    # Tax rate schemas
    TaxRateCreate,
    TaxRateUpdate,
    TaxRateResponse,
    # Product schemas
    EnhancedProductCreate,
    EnhancedProductUpdate,
    EnhancedProductResponse,
    EnhancedProductDetailResponse,
    ProductSearchResponse,
    # Variation schemas
    ProductVariationCreate,
    ProductVariationUpdate,
    ProductVariationResponse,
    # Bundle schemas
    BundleItemCreate,
    BundleItemUpdate,
    BundleItemResponse,
    # Attribute schemas
    ProductAttributeCreate,
    ProductAttributeUpdate,
    ProductAttributeResponse,
    ProductAttributeValueCreate,
    ProductAttributeValueUpdate,
    ProductAttributeValueResponse,
    # Search schemas
    ProductSearchFilters,
    ProductSearchResponse,
    BulkProductUpdate,
    BulkProductResponse
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/enhanced-products", tags=["enhanced-products"])


# Product Categories Endpoints
@router.get("/categories", response_model=List[ProductCategoryResponse])
async def get_categories(
    parent_id: Optional[int] = Query(None, description="Filter by parent category ID"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    include_children: bool = Query(False, description="Include child categories count")
):
    """Get product categories with optional filtering"""
    query = EnhancedProductCategory.all()
    
    if parent_id is not None:
        query = query.filter(parent_id=parent_id)
    if is_active is not None:
        query = query.filter(is_active=is_active)
    
    categories = await query.order_by('sort_order', 'name')
    
    # Convert to response format
    response_categories = []
    for category in categories:
        category_dict = {
            'id': category.id,
            'name': category.name,
            'slug': category.slug,
            'description': category.description,
            'parent_id': category.parent_id,
            'sort_order': category.sort_order,
            'is_active': category.is_active,
            'meta_title': category.meta_title,
            'meta_description': category.meta_description,
            'full_path': category.name,  # Will be computed properly
            'children_count': 0,
            'products_count': 0,
            'created_at': category.created_at,
            'updated_at': category.updated_at
        }
        
        if include_children:
            children_count = await EnhancedProductCategory.filter(parent_id=category.id).count()
            category_dict['children_count'] = children_count

            # Count products in this category
            products_count = await EnhancedProduct.filter(categories=category.id).count()
            category_dict['products_count'] = products_count

        response_categories.append(ProductCategoryResponse(**category_dict))
    
    return response_categories


@router.post("/categories", response_model=ProductCategoryResponse)
async def create_category(category_data: ProductCategoryCreate):
    """Create a new product category"""
    try:
        # Check if parent exists if specified
        if category_data.parent_id:
            parent = await EnhancedProductCategory.get_or_none(id=category_data.parent_id)
            if not parent:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Parent category not found"
                )

        # Check for duplicate slug
        existing = await EnhancedProductCategory.get_or_none(slug=category_data.slug)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category with this slug already exists"
            )

        category = await EnhancedProductCategory.create(**category_data.model_dump())
        
        # Convert to response format
        category_dict = {
            'id': category.id,
            'name': category.name,
            'slug': category.slug,
            'description': category.description,
            'parent_id': category.parent_id,
            'sort_order': category.sort_order,
            'is_active': category.is_active,
            'meta_title': category.meta_title,
            'meta_description': category.meta_description,
            'full_path': category.name,
            'children_count': 0,
            'products_count': 0,
            'created_at': category.created_at,
            'updated_at': category.updated_at
        }
        
        return ProductCategoryResponse(**category_dict)
        
    except IntegrityError as e:
        logger.error(f"Failed to create category: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create category. Check for duplicate values."
        )


@router.get("/categories/{category_id}", response_model=ProductCategoryResponse)
async def get_category(category_id: int):
    """Get a specific product category"""
    try:
        category = await EnhancedProductCategory.get(id=category_id)

        # Get children and products count
        children_count = await EnhancedProductCategory.filter(parent_id=category.id).count()
        products_count = await EnhancedProduct.filter(categories=category.id).count()
        
        category_dict = {
            'id': category.id,
            'name': category.name,
            'slug': category.slug,
            'description': category.description,
            'parent_id': category.parent_id,
            'sort_order': category.sort_order,
            'is_active': category.is_active,
            'meta_title': category.meta_title,
            'meta_description': category.meta_description,
            'full_path': category.name,
            'children_count': children_count,
            'products_count': products_count,
            'created_at': category.created_at,
            'updated_at': category.updated_at
        }
        
        return ProductCategoryResponse(**category_dict)
        
    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )


@router.put("/categories/{category_id}", response_model=ProductCategoryResponse)
async def update_category(category_id: int, category_data: ProductCategoryUpdate):
    """Update a product category"""
    try:
        category = await EnhancedProductCategory.get(id=category_id)
        
        # Check if parent exists if being updated
        if category_data.parent_id is not None and category_data.parent_id != category.parent_id:
            if category_data.parent_id == category_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Category cannot be its own parent"
                )
            
            if category_data.parent_id:
                parent = await EnhancedProductCategory.get_or_none(id=category_data.parent_id)
                if not parent:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Parent category not found"
                    )

        # Check for duplicate slug if being updated
        if category_data.slug and category_data.slug != category.slug:
            existing = await EnhancedProductCategory.get_or_none(slug=category_data.slug)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Category with this slug already exists"
                )
        
        # Update category
        update_data = category_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(category, field, value)
        
        await category.save()
        
        # Get updated counts
        children_count = await EnhancedProductCategory.filter(parent_id=category.id).count()
        products_count = await EnhancedProduct.filter(categories=category.id).count()
        
        category_dict = {
            'id': category.id,
            'name': category.name,
            'slug': category.slug,
            'description': category.description,
            'parent_id': category.parent_id,
            'sort_order': category.sort_order,
            'is_active': category.is_active,
            'meta_title': category.meta_title,
            'meta_description': category.meta_description,
            'full_path': category.name,
            'children_count': children_count,
            'products_count': products_count,
            'created_at': category.created_at,
            'updated_at': category.updated_at
        }
        
        return ProductCategoryResponse(**category_dict)
        
    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    except IntegrityError as e:
        logger.error(f"Failed to update category: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update category. Check for duplicate values."
        )


@router.delete("/categories/{category_id}")
async def delete_category(category_id: int):
    """Delete a product category"""
    try:
        category = await EnhancedProductCategory.get(id=category_id)

        # Check if category has children
        children_count = await EnhancedProductCategory.filter(parent_id=category_id).count()
        if children_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete category with child categories"
            )
        
        # Check if category has products
        products_count = await EnhancedProduct.filter(categories=category_id).count()
        if products_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete category with associated products"
            )
        
        await category.delete()
        return {"message": "Category deleted successfully"}

    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )


# Tax Rates Endpoints
@router.get("/tax-rates", response_model=List[TaxRateResponse])
async def get_tax_rates(
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    hsn_code: Optional[str] = Query(None, description="Filter by HSN code")
):
    """Get tax rates with optional filtering"""
    query = TaxRate.all()

    if is_active is not None:
        query = query.filter(is_active=is_active)

    tax_rates = await query.order_by('name')

    # Filter by HSN code if provided
    if hsn_code:
        filtered_rates = []
        for rate in tax_rates:
            if not rate.applicable_hsn_codes or hsn_code in rate.applicable_hsn_codes:
                filtered_rates.append(rate)
        tax_rates = filtered_rates

    return [TaxRateResponse.model_validate(rate) for rate in tax_rates]


@router.post("/tax-rates", response_model=TaxRateResponse)
async def create_tax_rate(tax_rate_data: TaxRateCreate):
    """Create a new tax rate"""
    try:
        tax_rate = await TaxRate.create(**tax_rate_data.model_dump())
        return TaxRateResponse.model_validate(tax_rate)

    except IntegrityError as e:
        logger.error(f"Failed to create tax rate: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create tax rate. Check for duplicate values."
        )


@router.get("/tax-rates/{tax_rate_id}", response_model=TaxRateResponse)
async def get_tax_rate(tax_rate_id: int):
    """Get a specific tax rate"""
    try:
        tax_rate = await TaxRate.get(id=tax_rate_id)
        return TaxRateResponse.model_validate(tax_rate)

    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tax rate not found"
        )


@router.put("/tax-rates/{tax_rate_id}", response_model=TaxRateResponse)
async def update_tax_rate(tax_rate_id: int, tax_rate_data: TaxRateUpdate):
    """Update a tax rate"""
    try:
        tax_rate = await TaxRate.get(id=tax_rate_id)

        # Update tax rate
        update_data = tax_rate_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(tax_rate, field, value)

        await tax_rate.save()
        return TaxRateResponse.model_validate(tax_rate)

    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tax rate not found"
        )
    except IntegrityError as e:
        logger.error(f"Failed to update tax rate: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update tax rate. Check for duplicate values."
        )


@router.delete("/tax-rates/{tax_rate_id}")
async def delete_tax_rate(tax_rate_id: int):
    """Delete a tax rate"""
    try:
        tax_rate = await TaxRate.get(id=tax_rate_id)

        # Check if tax rate is being used by products
        products_count = await EnhancedProduct.filter(tax_rates=tax_rate_id).count()
        if products_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete tax rate that is being used by products"
            )

        await tax_rate.delete()
        return {"message": "Tax rate deleted successfully"}

    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tax rate not found"
        )


# Product Attributes Endpoints
@router.get("/attributes", response_model=List[ProductAttributeResponse])
async def get_attributes(
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    include_values: bool = Query(True, description="Include attribute values")
):
    """Get product attributes with optional filtering"""
    query = ProductAttribute.all()

    if is_active is not None:
        query = query.filter(is_active=is_active)

    attributes = await query.order_by('name')

    response_attributes = []
    for attribute in attributes:
        attribute_dict = {
            'id': attribute.id,
            'name': attribute.name,
            'slug': attribute.slug,
            'description': attribute.description,
            'is_active': attribute.is_active,
            'values': [],
            'created_at': attribute.created_at,
            'updated_at': attribute.updated_at
        }

        if include_values:
            values = await ProductAttributeValue.filter(
                attribute_id=attribute.id
            ).order_by('sort_order', 'value')

            attribute_dict['values'] = [
                ProductAttributeValueResponse(
                    id=value.id,
                    value=value.value,
                    slug=value.slug,
                    sort_order=value.sort_order,
                    is_active=value.is_active,
                    attribute_id=value.attribute_id,
                    attribute_name=attribute.name,
                    created_at=value.created_at,
                    updated_at=value.updated_at
                ) for value in values
            ]

        response_attributes.append(ProductAttributeResponse(**attribute_dict))

    return response_attributes


@router.post("/attributes", response_model=ProductAttributeResponse)
async def create_attribute(attribute_data: ProductAttributeCreate):
    """Create a new product attribute"""
    try:
        # Check for duplicate slug
        existing = await ProductAttribute.get_or_none(slug=attribute_data.slug)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Attribute with this slug already exists"
            )

        attribute = await ProductAttribute.create(**attribute_data.model_dump())

        attribute_dict = {
            'id': attribute.id,
            'name': attribute.name,
            'slug': attribute.slug,
            'description': attribute.description,
            'is_active': attribute.is_active,
            'values': [],
            'created_at': attribute.created_at,
            'updated_at': attribute.updated_at
        }

        return ProductAttributeResponse(**attribute_dict)

    except IntegrityError as e:
        logger.error(f"Failed to create attribute: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create attribute. Check for duplicate values."
        )


# Enhanced Products Endpoints
@router.get("/", response_model=ProductSearchResponse)
async def get_products(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=1000, description="Number of products per page"),
    search: Optional[str] = Query(None, description="Search in product name, SKU, or barcode"),
    category_ids: Optional[str] = Query(None, description="Comma-separated category IDs"),
    product_type: Optional[str] = Query(None, description="Filter by product type"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    is_featured: Optional[bool] = Query(None, description="Filter by featured status"),
    is_low_stock: Optional[bool] = Query(None, description="Filter by low stock status"),
    min_price: Optional[Decimal] = Query(None, ge=0, description="Minimum sale price"),
    max_price: Optional[Decimal] = Query(None, ge=0, description="Maximum sale price"),
    hsn_code: Optional[str] = Query(None, description="Filter by HSN code"),
    sort_by: str = Query("name", description="Sort field"),
    sort_order: str = Query("asc", regex="^(asc|desc)$", description="Sort order")
):
    """Get enhanced products with filtering and pagination"""
    query = EnhancedProduct.all()

    # Apply filters
    if search:
        query = query.filter(
            name__icontains=search
        ).union(
            EnhancedProduct.filter(sku__icontains=search)
        ).union(
            EnhancedProduct.filter(barcode__icontains=search)
        )

    if category_ids:
        category_id_list = [int(id.strip()) for id in category_ids.split(',') if id.strip()]
        if category_id_list:
            query = query.filter(categories__id__in=category_id_list)

    if product_type:
        query = query.filter(product_type=product_type)

    if is_active is not None:
        query = query.filter(is_active=is_active)

    if is_featured is not None:
        query = query.filter(is_featured=is_featured)

    if min_price is not None:
        query = query.filter(sale_price__gte=min_price)

    if max_price is not None:
        query = query.filter(sale_price__lte=max_price)

    if hsn_code:
        query = query.filter(hsn_code=hsn_code)

    # Apply sorting
    sort_field = sort_by
    if sort_order == "desc":
        sort_field = f"-{sort_field}"

    query = query.order_by(sort_field)

    # Get total count before pagination
    total_count = await query.count()

    # Calculate skip value from page and page_size
    skip = (page - 1) * page_size

    # Apply pagination
    products = await query.offset(skip).limit(page_size).prefetch_related(
        'categories', 'tax_rates', 'images'
    )

    # Convert to response format
    response_products = []
    for product in products:
        # Check if low stock
        is_low_stock_value = product.is_low_stock

        # Apply low stock filter if specified
        if is_low_stock is not None and is_low_stock != is_low_stock_value:
            continue

        product_dict = {
            'id': product.id,
            'name': product.name,
            'sku': product.sku,
            'barcode': product.barcode,
            'hsn_code': product.hsn_code,
            'description': product.description,
            'short_description': product.short_description,
            'product_type': product.product_type,
            'maximum_price': product.maximum_price,
            'sale_price': product.sale_price,
            'cost_price': product.cost_price,
            'track_inventory': product.track_inventory,
            'current_stock': product.current_stock,
            'min_stock_level': product.min_stock_level,
            'max_stock_level': product.max_stock_level,
            'is_active': product.is_active,
            'is_featured': product.is_featured,
            'meta_title': product.meta_title,
            'meta_description': product.meta_description,
            'weight': product.weight,
            'dimensions': product.dimensions,
            'notes': product.notes,
            'categories': [],
            'tax_rates': [],
            'images': [],
            'is_low_stock': is_low_stock_value,
            'profit_margin': product.profit_margin,
            'discount_percentage': product.discount_percentage,
            'created_at': product.created_at,
            'updated_at': product.updated_at,
            'created_by_id': product.created_by_id
        }

        response_products.append(EnhancedProductResponse(**product_dict))

    return ProductSearchResponse(
        products=response_products,
        total_count=total_count,
        page=page,
        page_size=page_size
    )


@router.post("/", response_model=EnhancedProductResponse)
async def create_product(
    product_data: EnhancedProductCreate,
    created_by_id: int = Query(1, description="ID of user creating the product")
):
    """Create a new enhanced product"""
    try:
        async with in_transaction():
            # Check for duplicate SKU if provided
            if product_data.sku:
                existing = await EnhancedProduct.get_or_none(sku=product_data.sku)
                if existing:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Product with this SKU already exists"
                    )

            # Check for duplicate barcode if provided
            if product_data.barcode:
                existing = await EnhancedProduct.get_or_none(barcode=product_data.barcode)
                if existing:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Product with this barcode already exists"
                    )

            # Validate categories exist
            if product_data.category_ids:
                categories = await EnhancedProductCategory.filter(
                    id__in=product_data.category_ids
                )
                if len(categories) != len(product_data.category_ids):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="One or more categories not found"
                    )

            # Validate tax rates exist
            if product_data.tax_rate_ids:
                tax_rates = await TaxRate.filter(id__in=product_data.tax_rate_ids)
                if len(tax_rates) != len(product_data.tax_rate_ids):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="One or more tax rates not found"
                    )

            # Create product
            product_dict = product_data.model_dump(exclude={'category_ids', 'tax_rate_ids', 'images'})
            product_dict['created_by_id'] = created_by_id

            product = await EnhancedProduct.create(**product_dict)

            # Add categories
            if product_data.category_ids:
                for category_id in product_data.category_ids:
                    await product.categories.add(await EnhancedProductCategory.get(id=category_id))

            # Add tax rates
            if product_data.tax_rate_ids:
                for tax_rate_id in product_data.tax_rate_ids:
                    await product.tax_rates.add(await TaxRate.get(id=tax_rate_id))

            # Add images
            if product_data.images:
                for image_data in product_data.images:
                    await ProductImage.create(
                        product=product,
                        **image_data.model_dump()
                    )

            # Reload product with relations
            product = await EnhancedProduct.get(id=product.id).prefetch_related(
                'categories', 'tax_rates', 'images'
            )

            product_dict = {
                'id': product.id,
                'name': product.name,
                'sku': product.sku,
                'barcode': product.barcode,
                'hsn_code': product.hsn_code,
                'description': product.description,
                'short_description': product.short_description,
                'product_type': product.product_type,
                'maximum_price': product.maximum_price,
                'sale_price': product.sale_price,
                'cost_price': product.cost_price,
                'track_inventory': product.track_inventory,
                'current_stock': product.current_stock,
                'min_stock_level': product.min_stock_level,
                'max_stock_level': product.max_stock_level,
                'is_active': product.is_active,
                'is_featured': product.is_featured,
                'meta_title': product.meta_title,
                'meta_description': product.meta_description,
                'weight': product.weight,
                'dimensions': product.dimensions,
                'notes': product.notes,
                'categories': [],
                'tax_rates': [],
                'images': [],
                'is_low_stock': product.is_low_stock,
                'profit_margin': product.profit_margin,
                'discount_percentage': product.discount_percentage,
                'created_at': product.created_at,
                'updated_at': product.updated_at,
                'created_by_id': product.created_by_id
            }

            return EnhancedProductResponse(**product_dict)

    except IntegrityError as e:
        logger.error(f"Failed to create product: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create product. Check for duplicate values."
        )


# Product Variations Endpoints
@router.get("/{product_id}/variations", response_model=List[ProductVariationResponse])
async def get_product_variations(product_id: int):
    """Get all variations for a variable product"""
    try:
        # Check if product exists and is variable
        product = await EnhancedProduct.get(id=product_id)
        if product.product_type != "variable":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Product is not a variable product"
            )

        variations = await ProductVariation.filter(
            parent_product_id=product_id
        ).prefetch_related('attribute_values', 'attribute_values__attribute')

        response_variations = []
        for variation in variations:
            # Get attribute values with attribute names
            attribute_values = []
            for attr_value in variation.attribute_values:
                attribute_values.append(ProductAttributeValueResponse(
                    id=attr_value.id,
                    value=attr_value.value,
                    slug=attr_value.slug,
                    sort_order=attr_value.sort_order,
                    is_active=attr_value.is_active,
                    attribute_id=attr_value.attribute_id,
                    attribute_name=attr_value.attribute.name,
                    created_at=attr_value.created_at,
                    updated_at=attr_value.updated_at
                ))

            # Generate variation name
            variation_name = " - ".join([f"{av.attribute_name}: {av.value}" for av in attribute_values])
            if not variation_name:
                variation_name = f"Variation {variation.id}"

            variation_dict = {
                'id': variation.id,
                'parent_product_id': variation.parent_product_id,
                'parent_product_name': product.name,
                'sku': variation.sku,
                'barcode': variation.barcode,
                'maximum_price': variation.maximum_price,
                'sale_price': variation.sale_price,
                'cost_price': variation.cost_price,
                'current_stock': variation.current_stock,
                'min_stock_level': variation.min_stock_level,
                'max_stock_level': variation.max_stock_level,
                'is_active': variation.is_active,
                'attribute_values': attribute_values,
                'variation_name': variation_name,
                'is_low_stock': variation.is_low_stock,
                'created_at': variation.created_at,
                'updated_at': variation.updated_at
            }

            response_variations.append(ProductVariationResponse(**variation_dict))

        return response_variations

    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )


@router.post("/{product_id}/variations", response_model=ProductVariationResponse)
async def create_product_variation(product_id: int, variation_data: ProductVariationCreate):
    """Create a new product variation"""
    try:
        async with in_transaction():
            # Check if product exists and is variable
            product = await EnhancedProduct.get(id=product_id)
            if product.product_type != "variable":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Product is not a variable product"
                )

            # Check for duplicate SKU if provided
            if variation_data.sku:
                existing = await ProductVariation.get_or_none(sku=variation_data.sku)
                if existing:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Variation with this SKU already exists"
                    )

            # Check for duplicate barcode if provided
            if variation_data.barcode:
                existing = await ProductVariation.get_or_none(barcode=variation_data.barcode)
                if existing:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Variation with this barcode already exists"
                    )

            # Validate attribute values exist
            attribute_values = await ProductAttributeValue.filter(
                id__in=variation_data.attribute_value_ids
            ).prefetch_related('attribute')

            if len(attribute_values) != len(variation_data.attribute_value_ids):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="One or more attribute values not found"
                )

            # Check if variation with same attribute values already exists
            existing_variation = await ProductVariation.filter(
                parent_product_id=product_id
            ).prefetch_related('attribute_values')

            for existing in existing_variation:
                existing_attr_ids = set([av.id for av in existing.attribute_values])
                new_attr_ids = set(variation_data.attribute_value_ids)
                if existing_attr_ids == new_attr_ids:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Variation with these attribute values already exists"
                    )

            # Create variation
            variation_dict = variation_data.model_dump(exclude={'parent_product_id', 'attribute_value_ids'})
            variation_dict['parent_product_id'] = product_id

            variation = await ProductVariation.create(**variation_dict)

            # Add attribute values
            for attr_value_id in variation_data.attribute_value_ids:
                await variation.attribute_values.add(
                    await ProductAttributeValue.get(id=attr_value_id)
                )

            # Reload variation with relations
            variation = await ProductVariation.get(id=variation.id).prefetch_related(
                'attribute_values', 'attribute_values__attribute'
            )

            # Prepare response
            attribute_values_response = []
            for attr_value in variation.attribute_values:
                attribute_values_response.append(ProductAttributeValueResponse(
                    id=attr_value.id,
                    value=attr_value.value,
                    slug=attr_value.slug,
                    sort_order=attr_value.sort_order,
                    is_active=attr_value.is_active,
                    attribute_id=attr_value.attribute_id,
                    attribute_name=attr_value.attribute.name,
                    created_at=attr_value.created_at,
                    updated_at=attr_value.updated_at
                ))

            # Generate variation name
            variation_name = " - ".join([f"{av.attribute_name}: {av.value}" for av in attribute_values_response])
            if not variation_name:
                variation_name = f"Variation {variation.id}"

            variation_dict = {
                'id': variation.id,
                'parent_product_id': variation.parent_product_id,
                'parent_product_name': product.name,
                'sku': variation.sku,
                'barcode': variation.barcode,
                'maximum_price': variation.maximum_price,
                'sale_price': variation.sale_price,
                'cost_price': variation.cost_price,
                'current_stock': variation.current_stock,
                'min_stock_level': variation.min_stock_level,
                'max_stock_level': variation.max_stock_level,
                'is_active': variation.is_active,
                'attribute_values': attribute_values_response,
                'variation_name': variation_name,
                'is_low_stock': variation.is_low_stock,
                'created_at': variation.created_at,
                'updated_at': variation.updated_at
            }

            return ProductVariationResponse(**variation_dict)

    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    except IntegrityError as e:
        logger.error(f"Failed to create variation: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create variation. Check for duplicate values."
        )
