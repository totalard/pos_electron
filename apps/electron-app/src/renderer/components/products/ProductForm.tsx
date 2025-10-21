import { useState, useEffect } from 'react'
import { useAppStore, useProductStore } from '../../stores'
import { Button, LoadingSpinner, ErrorMessage, Input } from '../common'
import { TextArea, NumberInput, Checkbox, TouchSelect } from '../forms'
import { CategorySelector } from './CategorySelector'
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
      {/* Form Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {error && <ErrorMessage message={error} />}
        
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className={`text-lg font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Basic Information</h3>
          
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            placeholder="Product Name *"
          />
          
          <Input
            type="text"
            value={formData.sku || ''}
            onChange={(e) => handleChange('sku', e.target.value)}
            placeholder="SKU (Stock Keeping Unit)"
          />
          
          <Input
            type="text"
            value={formData.barcode || ''}
            onChange={(e) => handleChange('barcode', e.target.value)}
            placeholder="Barcode"
          />
          
          <TextArea
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            placeholder="Product description (optional)"
          />
        </div>
        
        {/* Classification */}
        <div className="space-y-4">
          <h3 className={`text-lg font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Classification</h3>
          
          <TouchSelect<string>
            value={formData.product_type || 'simple'}
            options={[
              { value: 'simple', label: 'Simple Product', description: 'Single product with direct pricing' },
              { value: 'variation', label: 'Product with Variations', description: 'Product with variants (size, color, etc.)' },
              { value: 'bundle', label: 'Bundle Product', description: 'Bundle of multiple products' },
              { value: 'service', label: 'Service', description: 'Service without inventory' }
            ]}
            onChange={(value) => handleChange('product_type', value)}
            placeholder="Product Type *"
            required
          />

          <CategorySelector
            value={formData.category_id || null}
            categories={categories}
            onChange={(id) => handleChange('category_id', id || undefined)}
            clearable
          />

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
        </div>
        
        {/* Pricing */}
        <div className="space-y-4">
          <h3 className={`text-lg font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Pricing</h3>
          
          <NumberInput
            value={formData.base_price}
            onChange={(value) => handleChange('base_price', value)}
            min={0}
            step={0.01}
            allowDecimal
            decimalPlaces={2}
            showButtons
            placeholder="Selling Price *"
          />
          
          <NumberInput
            value={formData.cost_price || 0}
            onChange={(value) => handleChange('cost_price', value || undefined)}
            min={0}
            step={0.01}
            allowDecimal
            decimalPlaces={2}
            showButtons
            placeholder="Cost Price (optional)"
            helperText="For profit margin calculation"
          />
        </div>
        
        {/* Inventory */}
        {showInventorySection && (
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Inventory</h3>
            
            <Checkbox
              label="Track Inventory"
              description="Enable to track stock levels for this product"
              checked={formData.track_inventory ?? true}
              onChange={(checked) => handleChange('track_inventory', checked)}
            />

            {formData.track_inventory && (
              <>
                <NumberInput
                  value={formData.stock_quantity || 0}
                  onChange={(value) => handleChange('stock_quantity', value)}
                  min={0}
                  showButtons
                  placeholder="Stock Quantity *"
                />

                <NumberInput
                  value={formData.low_stock_threshold || 10}
                  onChange={(value) => handleChange('low_stock_threshold', value)}
                  min={0}
                  showButtons
                  placeholder="Low Stock Threshold"
                  helperText="Alert when stock falls below this level"
                />

                <div className={`
                  p-3 rounded-lg text-xs
                  ${theme === 'dark' ? 'bg-blue-900/20 text-blue-300 border border-blue-800' : 'bg-blue-50 text-blue-700 border border-blue-200'}
                `}>
                  <strong>Tip:</strong> Set a low stock threshold to receive alerts when inventory runs low. This helps prevent stockouts.
                </div>
              </>
            )}
          </div>
        )}

        {/* Bundle/Variation Info */}
        {(formData.product_type === 'bundle' || formData.product_type === 'variation') && (
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>{formData.product_type === 'bundle' ? 'Bundle Components' : 'Product Variations'}</h3>
            
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
          </div>
        )}
        
        {/* Notes */}
        <div className="space-y-4">
          <h3 className={`text-lg font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Additional Information</h3>
          
          <TextArea
            value={formData.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={3}
            placeholder="Internal notes about this product (optional)"
          />
        </div>
      </div>
      
      {/* Form Actions - Sticky at bottom */}
      <div className={`
        flex-shrink-0 p-4 border-t sticky bottom-0
        ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}
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

