import { useState } from 'react'
import { useAppStore } from '../../stores'
import { Modal, Button } from '../common'
import { NumberInput } from '../forms'

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
        <NumberInput
          label="New Quantity"
          value={quantity}
          onChange={(value) => setQuantity(Math.max(1, value))}
          min={1}
          step={1}
          showButtons
          fullWidth
        />

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
