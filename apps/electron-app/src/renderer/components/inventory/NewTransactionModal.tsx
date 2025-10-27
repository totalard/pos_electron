import { useState, useEffect } from 'react'
import { useAppStore } from '../../stores'
import { Button, Input, LoadingSpinner } from '../common'
import { TouchSelect } from '../forms'

interface NewTransactionModalProps {
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

export function NewTransactionModal({ onClose, onSuccess }: NewTransactionModalProps) {
  const { theme } = useAppStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)

  const [formData, setFormData] = useState({
    transaction_type: 'purchase' as 'purchase' | 'sale' | 'adjustment' | 'return' | 'damage' | 'transfer',
    product_id: null as number | null,
    quantity: 0,
    unit_cost: '',
    reference_number: '',
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

  const transactionTypeOptions = [
    { value: 'purchase', label: 'Purchase', description: 'Add stock via purchase' },
    { value: 'sale', label: 'Sale', description: 'Reduce stock via sale' },
    { value: 'adjustment', label: 'Adjustment', description: 'Manual stock adjustment' },
    { value: 'return', label: 'Return', description: 'Stock returned' },
    { value: 'damage', label: 'Damage', description: 'Stock damaged/lost' },
    { value: 'transfer', label: 'Transfer', description: 'Stock transfer' }
  ]

  const productOptions = products.map(p => ({
    value: p.id,
    label: `${p.name} (${p.sku})`,
    description: `Current stock: ${p.current_stock}`
  }))

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.product_id) {
      newErrors.product_id = 'Product is required'
    }

    if (formData.quantity === 0) {
      newErrors.quantity = 'Quantity cannot be zero'
    }

    // For sales, damages, and transfers, quantity should be negative
    if (['sale', 'damage', 'transfer'].includes(formData.transaction_type) && formData.quantity > 0) {
      newErrors.quantity = 'Quantity should be negative for this transaction type'
    }

    // For purchases and returns, quantity should be positive
    if (['purchase', 'return'].includes(formData.transaction_type) && formData.quantity < 0) {
      newErrors.quantity = 'Quantity should be positive for this transaction type'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    try {
      setIsSubmitting(true)

      const payload = {
        transaction_type: formData.transaction_type,
        product_id: formData.product_id!,
        quantity: formData.quantity,
        unit_cost: formData.unit_cost ? parseFloat(formData.unit_cost) : null,
        reference_number: formData.reference_number || null,
        notes: formData.notes || null
      }

      const response = await fetch('http://localhost:8000/api/products/stock-transactions', {
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
        throw new Error(errorData.detail || 'Failed to create transaction')
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Failed to create transaction:', error)
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to create transaction' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTransactionTypeChange = (type: string | null) => {
    if (!type) return
    setFormData(prev => ({
      ...prev,
      transaction_type: type as any,
      // Auto-adjust quantity sign based on transaction type
      quantity: ['sale', 'damage', 'transfer'].includes(type) 
        ? -Math.abs(prev.quantity) 
        : Math.abs(prev.quantity)
    }))
  }

  const selectedProduct = products.find(p => p.id === formData.product_id)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={`
        w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl
        ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}
      `}>
        <form onSubmit={handleSubmit} className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              New Stock Transaction
            </h2>
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
            {/* Transaction Type */}
            <TouchSelect<string>
              label="Transaction Type *"
              value={formData.transaction_type}
              options={transactionTypeOptions}
              onChange={handleTransactionTypeChange}
              error={errors.transaction_type}
            />

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
                onChange={(value) => setFormData(prev => ({ ...prev, product_id: value }))}
                searchable
                placeholder="Select a product"
                error={errors.product_id}
              />
            )}

            {/* Current Stock Display */}
            {selectedProduct && (
              <div className={`
                p-3 rounded-lg
                ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-blue-50'}
              `}>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="font-medium">Current Stock:</span> {selectedProduct.current_stock} units
                </p>
              </div>
            )}

            {/* Quantity */}
            <Input
              type="number"
              label="Quantity *"
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
              error={errors.quantity}
              placeholder="Enter quantity (positive for in, negative for out)"
            />

            {/* Unit Cost */}
            <Input
              type="number"
              step="0.01"
              label="Unit Cost (Optional)"
              value={formData.unit_cost}
              onChange={(e) => setFormData(prev => ({ ...prev, unit_cost: e.target.value }))}
              placeholder="0.00"
            />

            {/* Reference Number */}
            <Input
              type="text"
              label="Reference Number (Optional)"
              value={formData.reference_number}
              onChange={(e) => setFormData(prev => ({ ...prev, reference_number: e.target.value }))}
              placeholder="Invoice #, PO #, etc."
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
                placeholder="Additional notes about this transaction..."
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
              disabled={isSubmitting || isLoadingProducts}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creating...
                </>
              ) : (
                'Create Transaction'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
