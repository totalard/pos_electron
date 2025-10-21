import { useState, useEffect } from 'react'
import { useAppStore, usePOSStore, useSettingsStore } from '../../stores'
import { Modal, CurrencyDisplay, CurrencyInput } from '../common'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (paymentMethod: string, amountPaid: number) => void
}

export function CheckoutModal({ isOpen, onClose, onComplete }: CheckoutModalProps) {
  const { theme } = useAppStore()
  const { getCartTotal } = usePOSStore()
  const { payments } = useSettingsStore()
  const total = getCartTotal()
  
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [amountPaid, setAmountPaid] = useState<number>(total)
  const [isProcessing, setIsProcessing] = useState(false)

  // Get enabled payment methods, sorted by order
  const enabledPaymentMethods = payments.methods
    .filter(m => m.enabled)
    .sort((a, b) => a.order - b.order)

  // Set default payment method to first enabled method
  useEffect(() => {
    if (enabledPaymentMethods.length > 0 && !selectedMethod) {
      setSelectedMethod(enabledPaymentMethods[0].id)
    }
  }, [enabledPaymentMethods, selectedMethod])

  // Update amount paid when total changes
  useEffect(() => {
    setAmountPaid(total)
  }, [total])

  const change = amountPaid - total
  const selectedPaymentMethod = enabledPaymentMethods.find(m => m.id === selectedMethod)

  const handleComplete = async () => {
    if (amountPaid < total) {
      alert('Amount paid is less than total')
      return
    }

    setIsProcessing(true)
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    onComplete(selectedMethod, amountPaid)
    setIsProcessing(false)
    onClose()
  }

  const quickAmounts = [
    { label: 'Exact', value: total },
    { label: '₹100', value: 100 },
    { label: '₹200', value: 200 },
    { label: '₹500', value: 500 },
    { label: '₹1000', value: 1000 },
    { label: '₹2000', value: 2000 }
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Checkout" size="lg">
      <div className="space-y-6">
        {/* Total Amount */}
        <div className={`
          p-6 rounded-xl text-center
          ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}
        `}>
          <p className="text-sm text-gray-500 mb-1">Total Amount</p>
          <CurrencyDisplay amount={total} className="text-4xl font-bold text-blue-600" />
        </div>

        {/* Payment Methods */}
        <div>
          <label className="block text-sm font-medium mb-3">Payment Method</label>
          <div className={`grid gap-3 ${enabledPaymentMethods.length <= 3 ? 'grid-cols-3' : enabledPaymentMethods.length <= 4 ? 'grid-cols-4' : 'grid-cols-5'}`}>
            {enabledPaymentMethods.map(method => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`
                  p-4 rounded-xl border-2 transition-all duration-200
                  flex flex-col items-center gap-2
                  ${selectedMethod === method.id
                    ? theme === 'dark'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-blue-500 bg-blue-50'
                    : theme === 'dark'
                      ? 'border-gray-700 hover:border-gray-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <span className="text-2xl">{method.icon}</span>
                <span className="text-xs font-medium">{method.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Amount Paid (for cash) */}
        {selectedMethod === 'cash' && (
          <div>
            <CurrencyInput
              label="Amount Paid"
              value={amountPaid}
              onChange={setAmountPaid}
              min={total}
              size="lg"
              className="text-center"
            />
            
            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-6 gap-2 mt-3">
              {quickAmounts.map(quick => (
                <button
                  key={quick.label}
                  onClick={() => setAmountPaid(quick.value)}
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

            {/* Change */}
            {change >= 0 && (
              <div className={`
                mt-4 p-4 rounded-lg text-center
                ${theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'}
              `}>
                <p className="text-sm text-gray-500 mb-1">Change</p>
                <CurrencyDisplay amount={change} className="text-2xl font-bold text-green-600" />
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className={`
              flex-1 px-6 py-3 rounded-lg font-semibold transition-colors
              ${theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            Cancel
          </button>
          <button
            onClick={handleComplete}
            disabled={isProcessing || (selectedMethod === 'cash' && amountPaid < total)}
            className={`
              flex-1 px-6 py-3 rounded-lg font-semibold transition-colors
              bg-blue-600 hover:bg-blue-700 text-white
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2
            `}
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              'Complete Payment'
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}
