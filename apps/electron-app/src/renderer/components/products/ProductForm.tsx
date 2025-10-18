import { useState, useEffect } from 'react'
import { useAppStore, useProductStore } from '../../stores'
import { Button, LoadingSpinner, ErrorMessage } from '../common'
import { FormField, FormSection, Select } from '../forms'
import type { EnhancedProduct, EnhancedProductCreate } from '../../services/api'

interface ProductFormProps {
  product: EnhancedProduct | null
  onSave: () => void
  onCancel: () => void
}

export function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const { theme } = useAppStore()
  const { categories, createProduct, updateProduct, isLoading, error } = useProductStore()
  
  // Form state
  const [formData, setFormData] = useState<EnhancedProductCreate>({
    name: '',
    sku: '',
    barcode: '',
    description: '',
    product_type: 'simple',
    category_id: undefined,
    base_price: 0,
    cost_price: undefined,
    tax_id: undefined,
    stock_quantity: 0,
    low_stock_threshold: 10,
    track_inventory: true,
    is_active: true,
    image_paths: [],
    notes: ''
  })
  
  // Load product data if editing
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        sku: product.sku,
        barcode: product.barcode,
        description: product.description,
        product_type: product.product_type,
        category_id: product.category_id,
        base_price: product.base_price,
        cost_price: product.cost_price,
        tax_id: product.tax_id,
        stock_quantity: product.stock_quantity,
        low_stock_threshold: product.low_stock_threshold,
        track_inventory: product.track_inventory,
        is_active: product.is_active,
        image_paths: product.image_paths,
        notes: product.notes
      })
    }
  }, [product])
  
  const handleChange = (field: keyof EnhancedProductCreate, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }

      // Auto-adjust settings based on product type
      if (field === 'product_type') {
        if (value === 'service') {
          // Services don't track inventory
          updated.track_inventory = false
          updated.stock_quantity = 0
        } else if (value === 'bundle') {
          // Bundles track inventory through components
          updated.track_inventory = false
        } else {
          // Simple and variation products can track inventory
          updated.track_inventory = true
        }
      }

      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (product) {
        await updateProduct(product.id, formData)
      } else {
        await createProduct(formData)
      }
      onSave()
    } catch (err) {
      // Error is handled by the store
      console.error('Failed to save product:', err)
    }
  }

  // Helper to determine which fields to show
  const showInventorySection = formData.product_type !== 'service' && formData.product_type !== 'bundle'
  const showVariationHint = formData.product_type === 'variation'
  const showBundleHint = formData.product_type === 'bundle'
  const showServiceHint = formData.product_type === 'service'
  
  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col">
      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {error && <ErrorMessage message={error} />}
        
        {/* Basic Information */}
        <FormSection title="Basic Information">
          <FormField label="Product Name" required>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
              className={`
                w-full px-4 py-2.5 rounded-lg
                ${theme === 'dark'
                  ? 'bg-gray-700 text-white border-gray-600'
                  : 'bg-white text-gray-900 border-gray-300'
                }
                border focus:outline-none focus:ring-2 focus:ring-blue-500
              `}
            />
          </FormField>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField label="SKU">
              <input
                type="text"
                value={formData.sku || ''}
                onChange={(e) => handleChange('sku', e.target.value)}
                className={`
                  w-full px-4 py-2.5 rounded-lg
                  ${theme === 'dark'
                    ? 'bg-gray-700 text-white border-gray-600'
                    : 'bg-white text-gray-900 border-gray-300'
                  }
                  border focus:outline-none focus:ring-2 focus:ring-blue-500
                `}
              />
            </FormField>
            
            <FormField label="Barcode">
              <input
                type="text"
                value={formData.barcode || ''}
                onChange={(e) => handleChange('barcode', e.target.value)}
                className={`
                  w-full px-4 py-2.5 rounded-lg
                  ${theme === 'dark'
                    ? 'bg-gray-700 text-white border-gray-600'
                    : 'bg-white text-gray-900 border-gray-300'
                  }
                  border focus:outline-none focus:ring-2 focus:ring-blue-500
                `}
              />
            </FormField>
          </div>
          
          <FormField label="Description">
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className={`
                w-full px-4 py-2.5 rounded-lg
                ${theme === 'dark'
                  ? 'bg-gray-700 text-white border-gray-600'
                  : 'bg-white text-gray-900 border-gray-300'
                }
                border focus:outline-none focus:ring-2 focus:ring-blue-500
              `}
            />
          </FormField>
        </FormSection>
        
        {/* Classification */}
        <FormSection title="Classification">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Product Type" required>
              <Select
                value={formData.product_type || 'simple'}
                onChange={(value) => handleChange('product_type', value)}
                options={[
                  { value: 'simple', label: 'Simple Product' },
                  { value: 'variation', label: 'Product with Variations' },
                  { value: 'bundle', label: 'Bundle Product' },
                  { value: 'service', label: 'Service' }
                ]}
              />
            </FormField>

            <FormField label="Category">
              <Select
                value={formData.category_id?.toString() || ''}
                onChange={(value) => handleChange('category_id', value ? Number(value) : undefined)}
                options={[
                  { value: '', label: 'No Category' },
                  ...categories.map(cat => ({
                    value: cat.id.toString(),
                    label: cat.name
                  }))
                ]}
              />
            </FormField>
          </div>

          {/* Product Type Hints */}
          {showVariationHint && (
            <div className={`
              mt-3 p-3 rounded-lg text-sm
              ${theme === 'dark' ? 'bg-purple-900/20 text-purple-300 border border-purple-800' : 'bg-purple-50 text-purple-700 border border-purple-200'}
            `}>
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <strong className="font-semibold">Variation Product:</strong> This product has multiple variants (e.g., sizes, colors). After creating the base product, you can add variations with different SKUs, prices, and stock levels.
                </div>
              </div>
            </div>
          )}

          {showBundleHint && (
            <div className={`
              mt-3 p-3 rounded-lg text-sm
              ${theme === 'dark' ? 'bg-green-900/20 text-green-300 border border-green-800' : 'bg-green-50 text-green-700 border border-green-200'}
            `}>
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <strong className="font-semibold">Bundle Product:</strong> This product is composed of multiple other products. After creating the bundle, you can add component products with quantities. Stock is tracked through components.
                </div>
              </div>
            </div>
          )}

          {showServiceHint && (
            <div className={`
              mt-3 p-3 rounded-lg text-sm
              ${theme === 'dark' ? 'bg-orange-900/20 text-orange-300 border border-orange-800' : 'bg-orange-50 text-orange-700 border border-orange-200'}
            `}>
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <strong className="font-semibold">Service:</strong> This is a non-physical service item. Inventory tracking is disabled for services as they don't have stock quantities.
                </div>
              </div>
            </div>
          )}
        </FormSection>
        
        {/* Pricing */}
        <FormSection title="Pricing">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Selling Price" required>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.base_price}
                onChange={(e) => handleChange('base_price', parseFloat(e.target.value) || 0)}
                required
                className={`
                  w-full px-4 py-2.5 rounded-lg
                  ${theme === 'dark'
                    ? 'bg-gray-700 text-white border-gray-600'
                    : 'bg-white text-gray-900 border-gray-300'
                  }
                  border focus:outline-none focus:ring-2 focus:ring-blue-500
                `}
              />
            </FormField>
            
            <FormField label="Cost Price">
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.cost_price || ''}
                onChange={(e) => handleChange('cost_price', e.target.value ? parseFloat(e.target.value) : undefined)}
                className={`
                  w-full px-4 py-2.5 rounded-lg
                  ${theme === 'dark'
                    ? 'bg-gray-700 text-white border-gray-600'
                    : 'bg-white text-gray-900 border-gray-300'
                  }
                  border focus:outline-none focus:ring-2 focus:ring-blue-500
                `}
              />
            </FormField>
          </div>
        </FormSection>
        
        {/* Inventory */}
        {showInventorySection && (
          <FormSection title="Inventory">
            <div className="mb-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.track_inventory}
                  onChange={(e) => handleChange('track_inventory', e.target.checked)}
                  className="w-5 h-5 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  Track Inventory
                </span>
              </label>
              <p className={`
                text-xs mt-1 ml-8
                ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
              `}>
                Enable to track stock levels for this product
              </p>
            </div>

            {formData.track_inventory && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Stock Quantity" required>
                    <input
                      type="number"
                      min="0"
                      value={formData.stock_quantity || 0}
                      onChange={(e) => handleChange('stock_quantity', parseInt(e.target.value) || 0)}
                      required
                      className={`
                        w-full px-4 py-2.5 rounded-lg
                        ${theme === 'dark'
                          ? 'bg-gray-700 text-white border-gray-600'
                          : 'bg-white text-gray-900 border-gray-300'
                        }
                        border focus:outline-none focus:ring-2 focus:ring-blue-500
                      `}
                    />
                  </FormField>

                  <FormField label="Low Stock Threshold">
                    <input
                      type="number"
                      min="0"
                      value={formData.low_stock_threshold || 0}
                      onChange={(e) => handleChange('low_stock_threshold', parseInt(e.target.value) || 0)}
                      className={`
                        w-full px-4 py-2.5 rounded-lg
                        ${theme === 'dark'
                          ? 'bg-gray-700 text-white border-gray-600'
                          : 'bg-white text-gray-900 border-gray-300'
                        }
                        border focus:outline-none focus:ring-2 focus:ring-blue-500
                      `}
                    />
                  </FormField>
                </div>

                <div className={`
                  mt-3 p-3 rounded-lg text-xs
                  ${theme === 'dark' ? 'bg-blue-900/20 text-blue-300' : 'bg-blue-50 text-blue-700'}
                `}>
                  <strong>Tip:</strong> Set a low stock threshold to receive alerts when inventory runs low. This helps prevent stockouts.
                </div>
              </>
            )}
          </FormSection>
        )}

        {/* Bundle/Variation Info */}
        {(formData.product_type === 'bundle' || formData.product_type === 'variation') && (
          <FormSection title={formData.product_type === 'bundle' ? 'Bundle Components' : 'Product Variations'}>
            <div className={`
              p-4 rounded-lg text-sm text-center
              ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}
            `}>
              <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-medium mb-1">
                {formData.product_type === 'bundle' ? 'Add Components After Creation' : 'Add Variations After Creation'}
              </p>
              <p className="text-xs opacity-75">
                {formData.product_type === 'bundle'
                  ? 'Save this product first, then you can add component products to the bundle.'
                  : 'Save this product first, then you can add variations with different attributes, prices, and stock levels.'
                }
              </p>
            </div>
          </FormSection>
        )}
        
        {/* Notes */}
        <FormSection title="Additional Information">
          <FormField label="Notes">
            <textarea
              value={formData.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              className={`
                w-full px-4 py-2.5 rounded-lg
                ${theme === 'dark'
                  ? 'bg-gray-700 text-white border-gray-600'
                  : 'bg-white text-gray-900 border-gray-300'
                }
                border focus:outline-none focus:ring-2 focus:ring-blue-500
              `}
            />
          </FormField>
        </FormSection>
      </div>
      
      {/* Form Actions */}
      <div className={`
        p-6 border-t
        ${theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}
      `}>
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isLoading}
            icon={isLoading ? <LoadingSpinner size="sm" /> : undefined}
          >
            {isLoading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </div>
    </form>
  )
}

