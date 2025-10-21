import { useState } from 'react'
import { useAppStore } from '../../stores'
import { Modal, CurrencyInput } from '../common'

interface CashManagementDialogProps {
  isOpen: boolean
  onClose: () => void
  type: 'in' | 'out'
  onSubmit: (amount: number, reason: string) => void
}

export function CashManagementDialog({ isOpen, onClose, type, onSubmit }: CashManagementDialogProps) {
  const { theme } = useAppStore()
  const [amount, setAmount] = useState<number>(0)
  const [reason, setReason] = useState<string>('')

  const title = type === 'in' ? 'Cash In' : 'Cash Out'
  const icon = type === 'in' ? '💰' : '💸'

  const quickAmounts = [50, 100, 200, 500, 1000, 2000]

  const commonReasons = type === 'in'
    ? ['Opening Float', 'Bank Deposit Return', 'Petty Cash Return', 'Other']
    : ['Bank Deposit', 'Petty Cash', 'Expense Payment', 'Other']

  const handleSubmit = () => {
    if (amount <= 0) {
      alert('Please enter a valid amount')
      return
    }

    if (!reason.trim()) {
      alert('Please enter a reason')
      return
    }

    onSubmit(amount, reason)
    setAmount(0)
    setReason('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <div className="space-y-6">
        {/* Header Icon */}
        <div className="text-center">
          <div className={`
            inline-flex items-center justify-center w-20 h-20 rounded-full text-4xl
            ${type === 'in'
              ? theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'
              : theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'
            }
          `}>
            {icon}
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <CurrencyInput
            label="Amount"
            value={amount}
            onChange={setAmount}
            min={0}
            size="lg"
            showSymbol={true}
          />

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-6 gap-2 mt-3">
            {quickAmounts.map(quick => (
              <button
                key={quick}
                onClick={() => setAmount(quick)}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }
                `}
              >
                ₹{quick}
              </button>
            ))}
          </div>
        </div>

        {/* Reason Selection */}
        <div>
          <label className="block text-sm font-medium mb-3">Reason</label>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {commonReasons.map(r => (
              <button
                key={r}
                onClick={() => setReason(r)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${reason === r
                    ? 'bg-blue-600 text-white'
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
          
          {/* Custom Reason Input */}
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason..."
            className={`
              w-full px-4 py-2 rounded-lg
              border-2 focus:outline-none focus:ring-2 focus:ring-blue-500
              ${theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-200 text-gray-900'
              }
            `}
          />
        </div>

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
            onClick={handleSubmit}
            disabled={!amount || !reason.trim()}
            className={`
              flex-1 px-6 py-3 rounded-lg font-semibold transition-colors
              ${type === 'in'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-rose-600 hover:bg-rose-700'
              }
              text-white
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {type === 'in' ? 'Add Cash' : 'Remove Cash'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
