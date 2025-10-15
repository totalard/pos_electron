import { useState, useEffect } from 'react'
import { useAppStore } from '../../stores'
import { EnhancedProduct, EnhancedProductCreate } from '../../services/api'
import { ImageUpload } from './ImageUpload'

interface ProductFormProps {
  product?: EnhancedProduct | null
  onSubmit: (product: EnhancedProductCreate) => void
  onCancel: () => void
}

export function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const { theme } = useAppStore()
  const [formData, setFormData] = useState<EnhancedProductCreate>({
    name: '',
    sku: '',
    barcode: '',
    hsn_code: '',
    product_type: 'simple',
    maximum_price: undefined,
    sale_price: 0,
    cost_price: 0,
    current_stock: 0,
    min_stock_level: 0,
    is_active: true,
    is_featured: false,
    description: '',
    short_description: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        description: product.description || '',
        short_description: product.short_description || ''
      })
      // Set images from product if available
      setImages(product.images?.map(img => img.image_url) || [])
    }
  }, [product])

  const handleChange = (field: keyof EnhancedProductCreate, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear error when field is modified
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required'
    }

    if (formData.sale_price <= 0) {
      newErrors.sale_price = 'Sale price must be greater than 0'
    }

    if (formData.maximum_price && formData.maximum_price < formData.sale_price) {
      newErrors.maximum_price = 'Maximum price cannot be less than sale price'
    }

    if (formData.cost_price < 0) {
      newErrors.cost_price = 'Cost price cannot be negative'
    }

    if (formData.product_type !== 'service') {
      if (formData.current_stock < 0) {
        newErrors.current_stock = 'Stock cannot be negative'
      }
      if (formData.min_stock_level < 0) {
        newErrors.min_stock_level = 'Minimum stock level cannot be negative'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Failed to save product:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {product ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {product ? 'Update product information' : 'Create a new product in your inventory'}
          </p>
        </div>
        
        <button
          onClick={onCancel}
          className={`
            p-2 rounded-lg transition-colors
            ${theme === 'dark'
              ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }
          `}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className={`
          ${theme === 'dark'
            ? 'bg-gray-800/30 border border-gray-700'
            : 'bg-gray-50 border border-gray-200'
          }
          rounded-lg p-6
        `}>
          <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`
                  w-full px-3 py-2 rounded-lg border
                  ${errors.name
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                    : theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-primary-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
                  }
                  focus:outline-none focus:ring-2 focus:ring-primary-500/20
                `}
                placeholder="Enter product name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* SKU */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                SKU
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => handleChange('sku', e.target.value)}
                className={`
                  w-full px-3 py-2 rounded-lg border
                  ${theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-primary-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
                  }
                  focus:outline-none focus:ring-2 focus:ring-primary-500/20
                `}
                placeholder="Enter SKU"
              />
            </div>

            {/* Barcode */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Barcode
              </label>
              <input
                type="text"
                value={formData.barcode}
                onChange={(e) => handleChange('barcode', e.target.value)}
                className={`
                  w-full px-3 py-2 rounded-lg border
                  ${theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-primary-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
                  }
                  focus:outline-none focus:ring-2 focus:ring-primary-500/20
                `}
                placeholder="Enter barcode"
              />
            </div>

            {/* HSN Code */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                HSN Code
              </label>
              <input
                type="text"
                value={formData.hsn_code}
                onChange={(e) => handleChange('hsn_code', e.target.value)}
                className={`
                  w-full px-3 py-2 rounded-lg border
                  ${theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-primary-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
                  }
                  focus:outline-none focus:ring-2 focus:ring-primary-500/20
                `}
                placeholder="Enter HSN code"
              />
            </div>

            {/* Product Type */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Product Type *
              </label>
              <select
                value={formData.product_type}
                onChange={(e) => handleChange('product_type', e.target.value)}
                className={`
                  w-full px-3 py-2 rounded-lg border
                  ${theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-primary-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
                  }
                  focus:outline-none focus:ring-2 focus:ring-primary-500/20
                `}
              >
                <option value="simple">Simple Product</option>
                <option value="variable">Variable Product</option>
                <option value="bundle">Bundle Product</option>
                <option value="service">Service</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className={`
          ${theme === 'dark'
            ? 'bg-gray-800/30 border border-gray-700'
            : 'bg-gray-50 border border-gray-200'
          }
          rounded-lg p-6
        `}>
          <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Pricing
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Maximum Price */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Maximum Price (MRP)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.maximum_price || ''}
                onChange={(e) => handleChange('maximum_price', e.target.value ? parseFloat(e.target.value) : undefined)}
                className={`
                  w-full px-3 py-2 rounded-lg border
                  ${errors.maximum_price
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                    : theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-primary-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
                  }
                  focus:outline-none focus:ring-2 focus:ring-primary-500/20
                `}
                placeholder="0.00"
              />
              {errors.maximum_price && (
                <p className="text-red-500 text-sm mt-1">{errors.maximum_price}</p>
              )}
            </div>

            {/* Sale Price */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Sale Price *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.sale_price}
                onChange={(e) => handleChange('sale_price', parseFloat(e.target.value) || 0)}
                className={`
                  w-full px-3 py-2 rounded-lg border
                  ${errors.sale_price
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                    : theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-primary-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
                  }
                  focus:outline-none focus:ring-2 focus:ring-primary-500/20
                `}
                placeholder="0.00"
              />
              {errors.sale_price && (
                <p className="text-red-500 text-sm mt-1">{errors.sale_price}</p>
              )}
            </div>

            {/* Cost Price */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Cost Price
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.cost_price}
                onChange={(e) => handleChange('cost_price', parseFloat(e.target.value) || 0)}
                className={`
                  w-full px-3 py-2 rounded-lg border
                  ${errors.cost_price
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                    : theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-primary-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
                  }
                  focus:outline-none focus:ring-2 focus:ring-primary-500/20
                `}
                placeholder="0.00"
              />
              {errors.cost_price && (
                <p className="text-red-500 text-sm mt-1">{errors.cost_price}</p>
              )}
            </div>
          </div>
        </div>

        {/* Inventory (only for non-service products) */}
        {formData.product_type !== 'service' && (
          <div className={`
            ${theme === 'dark'
              ? 'bg-gray-800/30 border border-gray-700'
              : 'bg-gray-50 border border-gray-200'
            }
            rounded-lg p-6
          `}>
            <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Inventory
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Stock */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Current Stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.current_stock}
                  onChange={(e) => handleChange('current_stock', parseInt(e.target.value) || 0)}
                  className={`
                    w-full px-3 py-2 rounded-lg border
                    ${errors.current_stock
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-primary-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
                    }
                    focus:outline-none focus:ring-2 focus:ring-primary-500/20
                  `}
                  placeholder="0"
                />
                {errors.current_stock && (
                  <p className="text-red-500 text-sm mt-1">{errors.current_stock}</p>
                )}
              </div>

              {/* Minimum Stock Level */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Minimum Stock Level
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.min_stock_level}
                  onChange={(e) => handleChange('min_stock_level', parseInt(e.target.value) || 0)}
                  className={`
                    w-full px-3 py-2 rounded-lg border
                    ${errors.min_stock_level
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-primary-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
                    }
                    focus:outline-none focus:ring-2 focus:ring-primary-500/20
                  `}
                  placeholder="0"
                />
                {errors.min_stock_level && (
                  <p className="text-red-500 text-sm mt-1">{errors.min_stock_level}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Product Images */}
        <div className={`
          ${theme === 'dark'
            ? 'bg-gray-800/30 border border-gray-700'
            : 'bg-gray-50 border border-gray-200'
          }
          rounded-lg p-6
        `}>
          <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Product Images
          </h2>

          <ImageUpload
            images={images}
            onImagesChange={setImages}
            maxImages={5}
            maxSizeMB={5}
            allowedFormats={['image/jpeg', 'image/png', 'image/webp']}
          />
        </div>

        {/* Status */}
        <div className={`
          ${theme === 'dark'
            ? 'bg-gray-800/30 border border-gray-700'
            : 'bg-gray-50 border border-gray-200'
          }
          rounded-lg p-6
        `}>
          <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Status & Visibility
          </h2>

          <div className="space-y-4">
            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => handleChange('is_active', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className={`ml-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Active (product is available for sale)
              </label>
            </div>

            {/* Featured Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_featured"
                checked={formData.is_featured}
                onChange={(e) => handleChange('is_featured', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="is_featured" className={`ml-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Featured (highlight this product)
              </label>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className={`
              px-6 py-2 rounded-lg font-medium transition-colors
              ${theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }
            `}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`
              px-6 py-2 rounded-lg font-medium transition-colors
              ${loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700'
              }
              text-white
            `}
          >
            {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  )
}
