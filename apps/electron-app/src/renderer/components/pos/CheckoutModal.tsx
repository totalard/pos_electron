import { useState } from 'react'
import { useAppStore, usePOSStore } from '../../stores'
import { Modal } from '../common/Modal'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (paymentMethod: string, amountPaid: number) => void
}

type PaymentMethod = 'cash' | 'card' | 'upi' | 'wallet' | 'split'

export function CheckoutModal({ isOpen, onClose, onComplete }: CheckoutModalProps) {
  const { theme } = useAppStore()
  const { getCartTotal } = usePOSStore()
  const total = getCartTotal()
  
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('cash')
  const [amountPaid, setAmountPaid] = useState<string>(total.toFixed(2))
  const [isProcessing, setIsProcessing] = useState(false)

  const change = parseFloat(amountPaid) - total

  const paymentMethods = [
    { id: 'cash' as const, label: 'Cash', icon: '💵' },
    { id: 'card' as const, label: 'Card', icon: '💳' },
    { id: 'upi' as const, label: 'UPI', icon: '📱' },
    { id: 'wallet' as const, label: 'Wallet', icon: '👛' },
    { id: 'split' as const, label: 'Split', icon: '✂️' }
  ]

  const handleComplete = async () => {
    if (parseFloat(amountPaid) < total) {
      alert('Amount paid is less than total')
      return
    }

    setIsProcessing(true)
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    onComplete(selectedMethod, parseFloat(amountPaid))
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
          <p className="text-4xl font-bold text-blue-600">₹{total.toFixed(2)}</p>
        </div>

        {/* Payment Methods */}
        <div>
          <label className="block text-sm font-medium mb-3">Payment Method</label>
          <div className="grid grid-cols-5 gap-3">
            {paymentMethods.map(method => (
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
                <span className="text-xs font-medium">{method.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Amount Paid (for cash) */}
        {selectedMethod === 'cash' && (
          <div>
            <label className="block text-sm font-medium mb-3">Amount Paid</label>
            <input
              type="number"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              className={`
                w-full px-4 py-3 rounded-lg text-lg font-semibold text-center
                border-2 focus:outline-none focus:ring-2 focus:ring-blue-500
                ${theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-200 text-gray-900'
                }
              `}
              step="0.01"
              min={total}
            />
            
            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-6 gap-2 mt-3">
              {quickAmounts.map(quick => (
                <button
                  key={quick.label}
                  onClick={() => setAmountPaid(quick.value.toFixed(2))}
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
                <p className="text-2xl font-bold text-green-600">₹{change.toFixed(2)}</p>
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
            disabled={isProcessing || (selectedMethod === 'cash' && parseFloat(amountPaid) < total)}
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
