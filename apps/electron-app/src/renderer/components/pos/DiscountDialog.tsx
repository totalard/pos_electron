import { useState } from 'react'
import { useAppStore, usePOSStore } from '../../stores'
import { Modal, CurrencyDisplay } from '../common'
import { NumberInput } from '../forms'

interface DiscountDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function DiscountDialog({ isOpen, onClose }: DiscountDialogProps) {
  const { theme } = useAppStore()
  const { getCartSubtotal, applyTransactionDiscount } = usePOSStore()
  const subtotal = getCartSubtotal()
  
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage')
  const [discountValue, setDiscountValue] = useState<string>('')

  const calculatedDiscount = discountType === 'percentage'
    ? (subtotal * parseFloat(discountValue || '0')) / 100
    : parseFloat(discountValue || '0')

  const finalAmount = subtotal - calculatedDiscount

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

    if (discountType === 'fixed' && value > subtotal) {
      alert('Discount cannot exceed subtotal')
      return
    }

    applyTransactionDiscount(value, discountType)
    onClose()
    setDiscountValue('')
  }

  const quickDiscounts = [
    { label: '5%', type: 'percentage' as const, value: 5 },
    { label: '10%', type: 'percentage' as const, value: 10 },
    { label: '15%', type: 'percentage' as const, value: 15 },
    { label: '20%', type: 'percentage' as const, value: 20 },
    { label: '₹50', type: 'fixed' as const, value: 50 },
    { label: '₹100', type: 'fixed' as const, value: 100 }
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Apply Discount" size="md">
      <div className="space-y-6">
        {/* Subtotal */}
        <div className={`
          p-4 rounded-lg
          ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}
        `}>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Subtotal</span>
            <CurrencyDisplay amount={subtotal} className="text-lg font-semibold" />
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
          <NumberInput
            label={discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount'}
            value={parseFloat(discountValue) || 0}
            onChange={(value) => setDiscountValue(value.toString())}
            step={discountType === 'percentage' ? 1 : 0.01}
            allowDecimal={discountType === 'percentage' ? false : true}
            decimalPlaces={2}
            min={0}
            max={discountType === 'percentage' ? 100 : subtotal}
            showButtons
            fullWidth
          />

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
              <CurrencyDisplay 
                amount={calculatedDiscount} 
                prefix="-"
                className="font-semibold text-green-600" 
              />
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-300">
              <span className="font-medium">Final Amount</span>
              <CurrencyDisplay 
                amount={finalAmount} 
                className="text-xl font-bold text-blue-600" 
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
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
