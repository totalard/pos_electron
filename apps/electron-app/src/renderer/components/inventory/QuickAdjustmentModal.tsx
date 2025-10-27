import { useState, useEffect } from 'react'
import { useAppStore } from '../../stores'
import { Button, Input, LoadingSpinner } from '../common'
import { TouchSelect } from '../forms'

interface QuickAdjustmentModalProps {
  onClose: () => void
  onSuccess: () => void
}

interface Product {
  id: number
  name: string
  sku: string
  current_stock: number
  track_inventory: boolean
}

const QUICK_REASONS = [
  { value: 'Physical Count', label: 'Physical Count' },
  { value: 'Damaged Goods', label: 'Damaged Goods' },
  { value: 'Expired Items', label: 'Expired Items' },
  { value: 'Theft/Loss', label: 'Theft/Loss' },
  { value: 'Found Items', label: 'Found Items' },
  { value: 'System Error', label: 'System Error' },
  { value: 'Other', label: 'Other' }
]

export function QuickAdjustmentModal({ onClose, onSuccess }: QuickAdjustmentModalProps) {
  const { theme } = useAppStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)

  const [formData, setFormData] = useState({
    product_id: null as number | null,
    actual_quantity: 0,
    reason: '',
    notes: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setIsLoadingProducts(true)
      const response = await fetch('http://localhost:8000/api/products?limit=1000')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.filter((p: Product) => p.track_inventory))
      }
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setIsLoadingProducts(false)
    }
  }

  const productOptions = products.map(p => ({
    value: p.id,
    label: `${p.name} (${p.sku})`,
    description: `Current stock: ${p.current_stock}`
  }))

  const selectedProduct = products.find(p => p.id === formData.product_id)

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.product_id) {
      newErrors.product_id = 'Product is required'
    }

    if (!formData.reason) {
      newErrors.reason = 'Reason is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate() || !selectedProduct) return

    try {
      setIsSubmitting(true)

      const payload = {
        reason: formData.reason,
        notes: formData.notes || null,
        lines: [
          {
            product_id: formData.product_id!,
            expected_quantity: selectedProduct.current_stock,
            actual_quantity: formData.actual_quantity,
            notes: null
          }
        ]
      }

      const response = await fetch('http://localhost:8000/api/products/stock-adjustments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to create adjustment')
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Failed to create adjustment:', error)
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to create adjustment' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const difference = selectedProduct ? formData.actual_quantity - selectedProduct.current_stock : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={`
        w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl
        ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}
      `}>
        <form onSubmit={handleSubmit} className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Quick Stock Adjustment
              </h2>
              <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Fast adjustment for a single product
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Product Selection */}
            {isLoadingProducts ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="md" />
              </div>
            ) : (
              <TouchSelect<number | null>
                label="Product *"
                value={formData.product_id}
                options={productOptions}
                onChange={(value) => {
                  const product = products.find(p => p.id === value)
                  setFormData(prev => ({
                    ...prev,
                    product_id: value,
                    actual_quantity: product?.current_stock || 0
                  }))
                }}
                searchable
                placeholder="Select a product"
                error={errors.product_id}
              />
            )}

            {/* Current Stock Display */}
            {selectedProduct && (
              <div className={`
                p-4 rounded-lg
                ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-blue-50'}
              `}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Current Stock
                    </p>
                    <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedProduct.current_stock}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Difference
                    </p>
                    <p className={`text-2xl font-bold ${
                      difference > 0
                        ? 'text-green-600 dark:text-green-400'
                        : difference < 0
                        ? 'text-red-600 dark:text-red-400'
                        : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {difference > 0 ? '+' : ''}{difference}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actual Quantity */}
            <Input
              type="number"
              label="Actual Quantity *"
              value={formData.actual_quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, actual_quantity: parseInt(e.target.value) || 0 }))}
              placeholder="Enter actual counted quantity"
              disabled={!selectedProduct}
            />

            {/* Reason */}
            <TouchSelect<string>
              label="Reason *"
              value={formData.reason}
              options={QUICK_REASONS}
              onChange={(value) => setFormData(prev => ({ ...prev, reason: value || '' }))}
              placeholder="Select a reason"
              error={errors.reason}
            />

            {/* Notes */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className={`
                  w-full px-4 py-2 rounded-lg border transition-colors
                  ${theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }
                  focus:outline-none focus:ring-2 focus:ring-primary-500
                `}
                placeholder="Additional details about this adjustment..."
              />
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 text-sm">
                {errors.submit}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting || isLoadingProducts || !selectedProduct}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Adjusting...
                </>
              ) : (
                'Create Adjustment'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
