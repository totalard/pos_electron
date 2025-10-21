import { useState, useEffect } from 'react'
import { useAppStore, usePOSStore } from '../../stores'
import { Modal } from '../common/Modal'

interface ItemDiscountDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function ItemDiscountDialog({ isOpen, onClose }: ItemDiscountDialogProps) {
  const { theme } = useAppStore()
  const { selectedCartItemId, getCartItems, updateCartItemDiscount } = usePOSStore()
  
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage')
  const [discountValue, setDiscountValue] = useState<string>('')

  const cartItems = getCartItems()
  const selectedItem = cartItems.find(item => item.id === selectedCartItemId)

  // Reset form when dialog opens/closes or item changes
  useEffect(() => {
    if (isOpen && selectedItem) {
      setDiscountType(selectedItem.discountType || 'percentage')
      setDiscountValue(selectedItem.discount > 0 ? selectedItem.discount.toString() : '')
    } else {
      setDiscountValue('')
    }
  }, [isOpen, selectedItem])

  if (!selectedItem) {
    return null
  }

  const itemSubtotal = selectedItem.unitPrice * selectedItem.quantity
  const modifiersTotal = selectedItem.modifiers?.reduce((sum, mod) => sum + mod.price, 0) || 0
  const baseTotal = itemSubtotal + modifiersTotal

  const calculatedDiscount = discountType === 'percentage'
    ? (baseTotal * parseFloat(discountValue || '0')) / 100
    : parseFloat(discountValue || '0')

  const finalAmount = baseTotal - calculatedDiscount

  const handleApply = () => {
    const value = parseFloat(discountValue)
    if (isNaN(value) || value < 0) {
      alert('Please enter a valid discount value')
      return
    }

    if (discountType === 'percentage' && value > 100) {
      alert('Percentage cannot exceed 100%')
      return
    }

    if (discountType === 'fixed' && value > baseTotal) {
      alert('Discount cannot exceed item total')
      return
    }

    updateCartItemDiscount(selectedItem.id, value, discountType)
    onClose()
  }

  const handleRemoveDiscount = () => {
    updateCartItemDiscount(selectedItem.id, 0, 'percentage')
    onClose()
  }

  const quickDiscounts = [
    { label: '5%', type: 'percentage' as const, value: 5 },
    { label: '10%', type: 'percentage' as const, value: 10 },
    { label: '15%', type: 'percentage' as const, value: 15 },
    { label: '20%', type: 'percentage' as const, value: 20 },
    { label: '₹10', type: 'fixed' as const, value: 10 },
    { label: '₹20', type: 'fixed' as const, value: 20 }
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Item Discount" size="md">
      <div className="space-y-6">
        {/* Item Info */}
        <div className={`
          p-4 rounded-lg
          ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}
        `}>
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-semibold">{selectedItem.product.name}</h4>
              {selectedItem.variationName && (
                <p className="text-sm text-gray-500">{selectedItem.variationName}</p>
              )}
            </div>
            <span className="text-sm text-gray-500">Qty: {selectedItem.quantity}</span>
          </div>
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-300">
            <span className="text-sm text-gray-500">Item Total</span>
            <span className="text-lg font-semibold">₹{baseTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Discount Type Toggle */}
        <div>
          <label className="block text-sm font-medium mb-3">Discount Type</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setDiscountType('percentage')}
              className={`
                px-4 py-3 rounded-lg font-medium transition-all duration-200
                ${discountType === 'percentage'
                  ? 'bg-blue-600 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              Percentage (%)
            </button>
            <button
              onClick={() => setDiscountType('fixed')}
              className={`
                px-4 py-3 rounded-lg font-medium transition-all duration-200
                ${discountType === 'fixed'
                  ? 'bg-blue-600 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              Fixed Amount (₹)
            </button>
          </div>
        </div>

        {/* Discount Value Input */}
        <div>
          <label className="block text-sm font-medium mb-3">
            {discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount'}
          </label>
          <div className="relative">
            <input
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder={discountType === 'percentage' ? 'Enter %' : 'Enter ₹'}
              className={`
                w-full px-4 py-3 rounded-lg text-lg font-semibold
                border-2 focus:outline-none focus:ring-2 focus:ring-blue-500
                ${theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-200 text-gray-900'
                }
              `}
              step={discountType === 'percentage' ? '1' : '0.01'}
              min="0"
              max={discountType === 'percentage' ? '100' : baseTotal.toString()}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
              {discountType === 'percentage' ? '%' : '₹'}
            </span>
          </div>

          {/* Quick Discount Buttons */}
          <div className="grid grid-cols-6 gap-2 mt-3">
            {quickDiscounts.map(quick => (
              <button
                key={quick.label}
                onClick={() => {
                  setDiscountType(quick.type)
                  setDiscountValue(quick.value.toString())
                }}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }
                `}
              >
                {quick.label}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        {discountValue && parseFloat(discountValue) > 0 && (
          <div className={`
            p-4 rounded-lg space-y-2
            ${theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'}
          `}>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Discount</span>
              <span className="font-semibold text-green-600">
                -₹{calculatedDiscount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-300">
              <span className="font-medium">Final Amount</span>
              <span className="text-xl font-bold text-blue-600">
                ₹{finalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {selectedItem.discount > 0 && (
            <button
              onClick={handleRemoveDiscount}
              className={`
                px-4 py-3 rounded-lg font-semibold transition-colors
                ${theme === 'dark'
                  ? 'bg-red-700 hover:bg-red-600 text-white'
                  : 'bg-red-100 hover:bg-red-200 text-red-700'
                }
              `}
            >
              Remove
            </button>
          )}
          <button
            onClick={onClose}
            className={`
              flex-1 px-6 py-3 rounded-lg font-semibold transition-colors
              ${theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }
            `}
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!discountValue || parseFloat(discountValue) <= 0}
            className={`
              flex-1 px-6 py-3 rounded-lg font-semibold transition-colors
              bg-blue-600 hover:bg-blue-700 text-white
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            Apply Discount
          </button>
        </div>
      </div>
    </Modal>
  )
}
