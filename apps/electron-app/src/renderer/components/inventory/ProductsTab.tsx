import { useState, useEffect } from 'react'
import { useAppStore } from '../../stores'
import { ProductList } from './ProductList'
import { ProductForm } from './ProductForm'
import { ProductFilters } from './ProductFilters'
import { enhancedProductsAPI, EnhancedProduct, ProductFilters as APIProductFilters } from '../../services/api'

interface LocalProductFilters {
  search: string
  category_ids: number[]
  product_type: string
  is_active?: boolean
  is_featured?: boolean
  is_low_stock?: boolean
  min_price?: number
  max_price?: number
  hsn_code: string
}

export function ProductsTab() {
  const { theme } = useAppStore()
  const [products, setProducts] = useState<EnhancedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<EnhancedProduct | null>(null)
  const [filters, setFilters] = useState<LocalProductFilters>({
    search: '',
    category_ids: [],
    product_type: '',
    hsn_code: ''
  })
  const [totalProducts, setTotalProducts] = useState(0)

  // Load products from API
  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const apiFilters: APIProductFilters = {
        search: filters.search || undefined,
        category_ids: filters.category_ids.length > 0 ? filters.category_ids : undefined,
        product_type: filters.product_type || undefined,
        is_active: filters.is_active,
        is_featured: filters.is_featured,
        is_low_stock: filters.is_low_stock,
        min_price: filters.min_price,
        max_price: filters.max_price,
        hsn_code: filters.hsn_code || undefined,
        page: 1,
        page_size: 50
      }

      const response = await enhancedProductsAPI.getProducts(apiFilters)
      setProducts(response.products)
      setTotalProducts(response.total)
    } catch (error) {
      console.error('Failed to load products:', error)
      setError('Failed to load products. Please try again.')
      setProducts([])
      setTotalProducts(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [filters])

  const handleCreateProduct = () => {
    setEditingProduct(null)
    setShowForm(true)
  }

  const handleEditProduct = (product: EnhancedProduct) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleDeleteProduct = async (productId: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await enhancedProductsAPI.deleteProduct(productId)
        await loadProducts()
      } catch (error) {
        console.error('Failed to delete product:', error)
        setError('Failed to delete product')
      }
    }
  }

  const handleFormSubmit = async (productData: any) => {
    try {
      if (editingProduct) {
        await enhancedProductsAPI.updateProduct(editingProduct.id, productData)
      } else {
        await enhancedProductsAPI.createProduct(productData)
      }
      setShowForm(false)
      setEditingProduct(null)
      await loadProducts()
    } catch (error) {
      console.error('Failed to save product:', error)
      setError('Failed to save product')
    }
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingProduct(null)
  }

  if (showForm) {
    return (
      <ProductForm
        product={editingProduct}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
      />
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Products
          </h1>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage your product catalog with variations, bundles, and services
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateProduct}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              theme === 'dark'
                ? 'bg-primary-600 hover:bg-primary-700 text-white'
                : 'bg-primary-600 hover:bg-primary-700 text-white'
            }`}
          >
            <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Product
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <ProductFilters
        filters={filters}
        onFiltersChange={setFilters}
      />

      <ProductList
        products={products}
        loading={loading}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
      />
    </div>
  )
}
