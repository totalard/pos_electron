import { useState } from 'react'
import { useAppStore } from '../../stores'
import { Modal, Button } from '../common'

interface QuantityAdjustDialogProps {
  isOpen: boolean
  onClose: () => void
  currentQuantity: number
  productName: string
  onAdjust: (newQuantity: number) => void
}

/**
 * Dialog for adjusting product quantity
 */
export function QuantityAdjustDialog({ 
  isOpen, 
  onClose, 
  currentQuantity, 
  productName,
  onAdjust 
}: QuantityAdjustDialogProps) {
  const { theme } = useAppStore()
  const [quantity, setQuantity] = useState<number>(currentQuantity)

  const quickQuantities = [1, 2, 3, 5, 10, 20]

  const handleSubmit = () => {
    if (quantity <= 0) {
      alert('Please enter a valid quantity')
      return
    }

    onAdjust(quantity)
    setQuantity(currentQuantity)
    onClose()
  }

  const handleCancel = () => {
    setQuantity(currentQuantity)
    onClose()
  }

  const increment = () => setQuantity(prev => prev + 1)
  const decrement = () => setQuantity(prev => Math.max(1, prev - 1))

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title="Adjust Quantity" size="md">
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
            Current Quantity: {currentQuantity}
          </p>
        </div>

        {/* Quantity Input */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            New Quantity
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={decrement}
              className={`
                w-12 h-12 rounded-lg font-bold text-xl
                ${theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }
                transition-colors
              `}
            >
              −
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className={`
                flex-1 px-4 py-3 rounded-lg border text-center text-2xl font-bold
                ${theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
                }
                focus:outline-none focus:ring-2 focus:ring-primary-500
              `}
              min="1"
            />
            <button
              onClick={increment}
              className={`
                w-12 h-12 rounded-lg font-bold text-xl
                ${theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }
                transition-colors
              `}
            >
              +
            </button>
          </div>
        </div>

        {/* Quick Quantities */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Quick Select
          </label>
          <div className="grid grid-cols-6 gap-2">
            {quickQuantities.map((q) => (
              <button
                key={q}
                onClick={() => setQuantity(q)}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${quantity === q
                    ? theme === 'dark'
                      ? 'bg-primary-600 text-white'
                      : 'bg-primary-600 text-white'
                    : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Update Quantity
          </Button>
        </div>
      </div>
    </Modal>
  )
}
