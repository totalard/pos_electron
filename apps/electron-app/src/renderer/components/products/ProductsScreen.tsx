import { useEffect, useState } from 'react'
import { useAppStore, useProductStore } from '../../stores'
import { PageHeader, PageContainer } from '../layout'
import { Button, LoadingSpinner, ErrorMessage, RightPanel, IconButton, ThemeToggle, Input } from '../common'
import { TouchSelect } from '../forms'
import { categoriesToOptions } from '../../utils/categoryTree'
import { ProductForm } from './ProductForm'
import { CategoryManagement } from './CategoryManagement'
import { ProductDetailView } from './ProductDetailView'
import { ProductTileView } from './ProductTileView'
import { ProductGridView } from './ProductGridView'
import { ProductDashboard } from './ProductDashboard'
import type { EnhancedProduct } from '../../services/api'

interface ProductsScreenProps {
  onBack: () => void
}

export function ProductsScreen({ onBack }: ProductsScreenProps) {
  const { theme } = useAppStore()
  const {
    products,
    categories,
    isLoading,
    error,
    filters,
    viewMode: productViewMode,
    fetchProducts,
    fetchCategories,
    setFilters,
    clearFilters,
    selectedProduct,
    setSelectedProduct,
    setViewMode: setProductViewMode
  } = useProductStore()

  // UI state for sidebar panels
  const [showProductForm, setShowProductForm] = useState(false)
  const [showProductDetail, setShowProductDetail] = useState(false)
  const [showCategoryManagement, setShowCategoryManagement] = useState(false)
  const [editingProduct, setEditingProduct] = useState<EnhancedProduct | null>(null)
  
  // Load data on mount
  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [fetchProducts, fetchCategories])

  // Reload products when filters change
  useEffect(() => {
    fetchProducts()
  }, [filters, fetchProducts])

  const handleAddProduct = () => {
    setEditingProduct(null)
    setSelectedProduct(null)
    setShowProductDetail(false)
    setShowProductForm(true)
  }

  const handleSelectProduct = (product: EnhancedProduct) => {
    setSelectedProduct(product)
    setEditingProduct(null)
    setShowProductForm(false)
    setShowProductDetail(true)
  }

  const handleEditProduct = (product: EnhancedProduct) => {
    setEditingProduct(product)
    setSelectedProduct(product)
    setShowProductDetail(false)
    setShowProductForm(true)
  }

  const handleCloseProductForm = () => {
    setShowProductForm(false)
    setEditingProduct(null)
  }

  const handleCloseProductDetail = () => {
    setShowProductDetail(false)
    setSelectedProduct(null)
  }

  const handleProductSaved = () => {
    setShowProductForm(false)
    setEditingProduct(null)
    fetchProducts()
  }

  const handleManageCategories = () => {
    setShowCategoryManagement(true)
  }

  const handleCloseCategoryManagement = () => {
    setShowCategoryManagement(false)
    fetchCategories()
  }

  const handleCategoryFilter = (categoryId: number | null) => {
    setFilters({ categoryId })
  }

  const handleProductTypeFilter = (productType: string | null) => {
    setFilters({ productType })
  }

  const handleSearchChange = (search: string) => {
    setFilters({ search })
  }

  const handleClearFilters = () => {
    clearFilters()
  }

  // Filter active products
  const activeProducts = products.filter(p => p.is_active)

  return (
    <div className={`
      h-screen w-screen flex flex-col
      ${theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
      }
    `}>
      {/* Header */}
      <PageHeader
        title="Product Management"
        subtitle="Manage your products, categories, and inventory"
        showBackButton
        onBack={onBack}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        }
        actions={
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className={`
              flex items-center gap-1 p-1 rounded-lg
              ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}
            `}>
              <IconButton
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                }
                label="Tile view"
                onClick={() => setProductViewMode('tile')}
                variant={productViewMode === 'tile' ? 'primary' : 'ghost'}
                size="sm"
              />
              <IconButton
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                }
                label="Grid view"
                onClick={() => setProductViewMode('grid')}
                variant={productViewMode === 'grid' ? 'primary' : 'ghost'}
                size="sm"
              />
            </div>

            <Button
              variant="secondary"
              size="md"
              onClick={handleManageCategories}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              }
            >
              Categories
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleAddProduct}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Add Product
            </Button>
            <ThemeToggle size="md" />
          </div>
        }
      />

      {/* Main Content */}
      <PageContainer>
        {/* Error Message */}
        {error && (
          <ErrorMessage message={error} className="mb-4" />
        )}

        {/* Dashboard */}
        <div className="mb-4">
          <ProductDashboard />
        </div>

        {/* Single Pane Layout */}
        <div className="h-full flex flex-col">
          {/* Search and Filters */}
          <div className={`
            p-4 border-b space-y-3
            ${theme === 'dark' ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50/50'}
          `}>
            {/* Search */}
            <Input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Category Filter */}
              <TouchSelect<number | null>
                label="Category"
                value={filters.categoryId}
                options={[
                  { value: null, label: 'All Categories' },
                  ...categoriesToOptions(categories)
                ]}
                onChange={handleCategoryFilter}
                searchable
                clearable
                placeholder="All Categories"
              />

              {/* Product Type Filter */}
              <TouchSelect<string | null>
                label="Product Type"
                value={filters.productType}
                options={[
                  { value: null, label: 'All Types' },
                  { value: 'simple', label: 'Simple', description: 'Single product with direct pricing' },
                  { value: 'variation', label: 'Variation', description: 'Product with variants (size, color, etc.)' },
                  { value: 'bundle', label: 'Bundle', description: 'Bundle of multiple products' },
                  { value: 'service', label: 'Service', description: 'Service without inventory' }
                ]}
                onChange={handleProductTypeFilter}
                searchable
                clearable
                placeholder="All Types"
              />
            </div>

            {/* Clear Filters */}
            {(filters.search || filters.categoryId || filters.productType) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                fullWidth
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                }
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Product List/Grid - Full Width */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <LoadingSpinner size="md" />
              </div>
            )}

            {!isLoading && activeProducts.length === 0 && (
              <div className={`
                flex items-center justify-center py-20
                ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}
              `}>
                <div className="text-center">
                  <svg className="w-24 h-24 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p className="text-lg font-medium mb-2">No products found</p>
                  <p className="text-sm mb-6">Start by adding your first product</p>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleAddProduct}
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    }
                  >
                    Add Product
                  </Button>
                </div>
              </div>
            )}

            {!isLoading && activeProducts.length > 0 && productViewMode === 'tile' && (
              <ProductTileView
                products={activeProducts}
                onProductClick={handleSelectProduct}
              />
            )}

            {!isLoading && activeProducts.length > 0 && productViewMode === 'grid' && (
              <ProductGridView
                products={activeProducts}
                selectedProductId={selectedProduct?.id}
                onProductClick={handleSelectProduct}
              />
            )}
          </div>
        </div>
      </PageContainer>

      {/* Product Form Sidebar */}
      <RightPanel
        isOpen={showProductForm}
        onClose={handleCloseProductForm}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        width="lg"
      >
        <ProductForm
          product={editingProduct}
          onSave={handleProductSaved}
          onCancel={handleCloseProductForm}
        />
      </RightPanel>

      {/* Product Detail Sidebar */}
      <RightPanel
        isOpen={showProductDetail}
        onClose={handleCloseProductDetail}
        title="Product Details"
        width="md"
      >
        {selectedProduct && (
          <ProductDetailView
            product={selectedProduct}
            onEdit={() => handleEditProduct(selectedProduct)}
            onClose={handleCloseProductDetail}
          />
        )}
      </RightPanel>

      {/* Category Management Panel */}
      <RightPanel
        isOpen={showCategoryManagement}
        onClose={handleCloseCategoryManagement}
        title="Manage Categories"
        width="md"
      >
        <CategoryManagement onClose={handleCloseCategoryManagement} />
      </RightPanel>
    </div>
  )
}

