import { useState, useEffect } from 'react'
import { useAppStore } from '../../stores'
import { useCurrency } from '../../hooks/useCurrency'
import { Sidebar } from '../common'
import { purchaseAPI } from '../../services/accountingAPI'
import type { Purchase, PurchaseCreate, PurchaseItem } from '../../types/accounting'

interface PurchaseFormSidebarProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  purchase?: Purchase | null
}

export function PurchaseFormSidebar({ isOpen, onClose, onSuccess, purchase }: PurchaseFormSidebarProps) {
  const { theme } = useAppStore()
  const { formatCurrency } = useCurrency()
  
  const [formData, setFormData] = useState<PurchaseCreate>({
    vendor_name: '',
    vendor_contact: '',
    vendor_address: '',
    purchase_date: new Date().toISOString().split('T')[0],
    expected_delivery_date: '',
    subtotal: 0,
    tax_amount: 0,
    shipping_cost: 0,
    total_amount: 0,
    payment_method: '',
    items: [],
    invoice_number: '',
    notes: ''
  })
  
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (purchase) {
      setFormData({
        vendor_name: purchase.vendor_name,
        vendor_contact: purchase.vendor_contact || '',
        vendor_address: purchase.vendor_address || '',
        purchase_date: purchase.purchase_date,
        expected_delivery_date: purchase.expected_delivery_date || '',
        subtotal: purchase.subtotal,
        tax_amount: purchase.tax_amount,
        shipping_cost: purchase.shipping_cost,
        total_amount: purchase.total_amount,
        payment_method: purchase.payment_method || '',
        items: purchase.items,
        invoice_number: purchase.invoice_number || '',
        notes: purchase.notes || ''
      })
    } else {
      setFormData({
        vendor_name: '',
        vendor_contact: '',
        vendor_address: '',
        purchase_date: new Date().toISOString().split('T')[0],
        expected_delivery_date: '',
        subtotal: 0,
        tax_amount: 0,
        shipping_cost: 0,
        total_amount: 0,
        payment_method: '',
        items: [],
        invoice_number: '',
        notes: ''
      })
    }
    setError(null)
  }, [purchase, isOpen])

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          product_id: 0,
          product_name: '',
          barcode: '',
          quantity: 1,
          unit_cost: 0,
          total_cost: 0
        }
      ]
    })
  }

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index)
    setFormData({ ...formData, items: newItems })
    recalculateTotals(newItems, formData.tax_amount, formData.shipping_cost)
  }

  const updateItem = (index: number, field: keyof PurchaseItem, value: any) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    
    // Recalculate item total
    if (field === 'quantity' || field === 'unit_cost') {
      const item = newItems[index]
      item.total_cost = item.quantity * item.unit_cost
    }
    
    setFormData({ ...formData, items: newItems })
    recalculateTotals(newItems, formData.tax_amount, formData.shipping_cost)
  }

  const recalculateTotals = (items: PurchaseItem[], taxAmount: number, shippingCost: number) => {
    const subtotal = items.reduce((sum, item) => sum + item.total_cost, 0)
    const total = subtotal + taxAmount + shippingCost
    
    setFormData(prev => ({
      ...prev,
      subtotal,
      total_amount: total
    }))
  }

  const handleTaxChange = (value: number) => {
    setFormData({ ...formData, tax_amount: value })
    recalculateTotals(formData.items, value, formData.shipping_cost)
  }

  const handleShippingChange = (value: number) => {
    setFormData({ ...formData, shipping_cost: value })
    recalculateTotals(formData.items, formData.tax_amount, value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.items.length === 0) {
      setError('Please add at least one item to the purchase.')
      return
    }

    const invalidItems = formData.items.filter(item => !item.product_name || item.quantity <= 0 || item.unit_cost <= 0)
    if (invalidItems.length > 0) {
      setError('All items must have a name, quantity, and unit cost.')
      return
    }
    
    try {
      setSubmitting(true)
      setError(null)
      
      if (purchase) {
        await purchaseAPI.updatePurchase(purchase.id, formData)
      } else {
        await purchaseAPI.createPurchase(formData)
      }
      
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save purchase')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!submitting) {
      onClose()
    }
  }

  return (
    <Sidebar
      isOpen={isOpen}
      onClose={handleClose}
      title={purchase ? 'Edit Purchase' : 'Create Purchase Order'}
      width="xl"
      contentVariant="form"
      footerContent={
        <div className="p-6 space-y-3">
          {/* Total Summary */}
          <div className={`p-4 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Subtotal</span>
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(formData.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Tax</span>
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(formData.tax_amount)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Shipping</span>
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(formData.shipping_cost)}
                </span>
              </div>
              <div className={`pt-2 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex justify-between">
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Total</span>
                  <span className="text-lg font-bold text-teal-600">
                    {formatCurrency(formData.total_amount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className={`flex-1 px-4 py-2.5 rounded-lg border font-medium transition-colors ${
                theme === 'dark'
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="purchase-form"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 font-medium transition-colors"
            >
              {submitting ? 'Saving...' : purchase ? 'Update Purchase' : 'Create Purchase'}
            </button>
          </div>
        </div>
      }
    >
      <form id="purchase-form" onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Vendor Information */}
        <div>
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Vendor Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Vendor Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.vendor_name}
                onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                placeholder="Vendor name"
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Contact
                </label>
                <input
                  type="text"
                  value={formData.vendor_contact}
                  onChange={(e) => setFormData({ ...formData, vendor_contact: e.target.value })}
                  placeholder="Phone or email"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Invoice Number
                </label>
                <input
                  type="text"
                  value={formData.invoice_number}
                  onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                  placeholder="Vendor invoice #"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Address
              </label>
              <textarea
                value={formData.vendor_address}
                onChange={(e) => setFormData({ ...formData, vendor_address: e.target.value })}
                rows={2}
                placeholder="Vendor address"
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none`}
              />
            </div>
          </div>
        </div>

        {/* Purchase Details */}
        <div>
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Purchase Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Purchase Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Expected Delivery
              </label>
              <input
                type="date"
                value={formData.expected_delivery_date}
                onChange={(e) => setFormData({ ...formData, expected_delivery_date: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              />
            </div>
          </div>
        </div>

        {/* Purchase Items */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Items <span className="text-red-500">*</span>
            </h3>
            <button
              type="button"
              onClick={addItem}
              className="px-3 py-1 text-sm bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
            >
              + Add Item
            </button>
          </div>

          <div className="space-y-3">
            {formData.items.length === 0 ? (
              <div className={`p-8 text-center rounded-lg border-2 border-dashed ${
                theme === 'dark' ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'
              }`}>
                <p className="text-sm">No items added yet. Click "Add Item" to get started.</p>
              </div>
            ) : (
              formData.items.map((item, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Item {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Product Name
                        </label>
                        <input
                          type="text"
                          value={item.product_name}
                          onChange={(e) => updateItem(index, 'product_name', e.target.value)}
                          placeholder="Product name"
                          className={`w-full px-3 py-2 rounded border text-sm ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                          } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs font-medium mb-1 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Barcode
                        </label>
                        <input
                          type="text"
                          value={item.barcode || ''}
                          onChange={(e) => updateItem(index, 'barcode', e.target.value)}
                          placeholder="Scan or enter barcode"
                          className={`w-full px-3 py-2 rounded border text-sm ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                          } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          className={`w-full px-3 py-2 rounded border text-sm ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs font-medium mb-1 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Unit Cost
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_cost}
                          onChange={(e) => updateItem(index, 'unit_cost', parseFloat(e.target.value) || 0)}
                          className={`w-full px-3 py-2 rounded border text-sm ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs font-medium mb-1 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Total
                        </label>
                        <div className={`px-3 py-2 rounded border text-sm font-medium ${
                          theme === 'dark'
                            ? 'bg-gray-800 border-gray-600 text-white'
                            : 'bg-gray-100 border-gray-300 text-gray-900'
                        }`}>
                          {formatCurrency(item.total_cost)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Additional Costs */}
        <div>
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Additional Costs
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Tax Amount
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.tax_amount}
                onChange={(e) => handleTaxChange(parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Shipping Cost
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.shipping_cost}
                onChange={(e) => handleShippingChange(parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              />
            </div>
          </div>
        </div>

        {/* Payment & Notes */}
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Payment Method
            </label>
            <select
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
            >
              <option value="">Select payment method...</option>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="credit">Credit</option>
              <option value="check">Check</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Optional notes"
              className={`w-full px-3 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none`}
            />
          </div>
        </div>
      </form>
    </Sidebar>
  )
}
