import { useState } from 'react'
import { useAppStore } from '../../stores'
import { Modal, Button, CurrencyInput } from '../common'

interface PriceOverrideDialogProps {
  isOpen: boolean
  onClose: () => void
  currentPrice: number
  productName: string
  onOverride: (newPrice: number, reason: string) => void
}

/**
 * Dialog for overriding product price
 */
export function PriceOverrideDialog({ 
  isOpen, 
  onClose, 
  currentPrice, 
  productName,
  onOverride 
}: PriceOverrideDialogProps) {
  const { theme } = useAppStore()
  const [newPrice, setNewPrice] = useState<number>(currentPrice)
  const [reason, setReason] = useState('')

  const commonReasons = [
    'Price Match',
    'Customer Loyalty',
    'Damaged Item',
    'Manager Approval',
    'Promotional Discount',
    'Other'
  ]

  const handleSubmit = () => {
    if (newPrice <= 0) {
      alert('Please enter a valid price')
      return
    }

    if (!reason.trim()) {
      alert('Please select or enter a reason')
      return
    }

    onOverride(newPrice, reason)
    setNewPrice(currentPrice)
    setReason('')
    onClose()
  }

  const handleCancel = () => {
    setNewPrice(currentPrice)
    setReason('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title="Price Override" size="md">
      <div className="space-y-6">
        {/* Product Info */}
        <div className={`
          p-4 rounded-lg
          ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}
        `}>
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Product: {productName}
          </p>
          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Current Price: ${currentPrice.toFixed(2)}
          </p>
        </div>

        {/* New Price Input */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            New Price
          </label>
          <CurrencyInput
            value={newPrice}
            onChange={setNewPrice}
            placeholder="0.00"
          />
        </div>

        {/* Reason Selection */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Reason for Override
          </label>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {commonReasons.map((r) => (
              <button
                key={r}
                onClick={() => setReason(r)}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${reason === r
                    ? theme === 'dark'
                      ? 'bg-primary-600 text-white'
                      : 'bg-primary-600 text-white'
                    : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {r}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Or enter custom reason..."
            className={`
              w-full px-4 py-2 rounded-lg border
              ${theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }
              focus:outline-none focus:ring-2 focus:ring-primary-500
            `}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Override Price
          </Button>
        </div>
      </div>
    </Modal>
  )
}
