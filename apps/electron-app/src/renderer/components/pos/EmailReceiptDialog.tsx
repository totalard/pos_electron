import { useState } from 'react'
import { useAppStore } from '../../stores'
import { Modal } from '../common/Modal'

interface EmailReceiptDialogProps {
  isOpen: boolean
  onClose: () => void
  onSend: (email: string) => void
}

export function EmailReceiptDialog({ isOpen, onClose, onSend }: EmailReceiptDialogProps) {
  const { theme } = useAppStore()
  const [email, setEmail] = useState<string>('')
  const [isSending, setIsSending] = useState(false)

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleSend = async () => {
    if (!validateEmail(email)) {
      alert('Please enter a valid email address')
      return
    }

    setIsSending(true)
    
    // Simulate sending email
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    onSend(email)
    setIsSending(false)
    setEmail('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Email Receipt" size="sm">
      <div className="space-y-6">
        {/* Icon */}
        <div className="text-center">
          <div className={`
            inline-flex items-center justify-center w-20 h-20 rounded-full text-4xl
            ${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'}
          `}>
            📧
          </div>
        </div>

        {/* Email Input */}
        <div>
          <label className="block text-sm font-medium mb-3">Customer Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="customer@example.com"
            className={`
              w-full px-4 py-3 rounded-lg
              border-2 focus:outline-none focus:ring-2 focus:ring-blue-500
              ${theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-200 text-gray-900'
              }
            `}
            autoFocus
          />
        </div>

        {/* Info */}
        <div className={`
          p-3 rounded-lg text-sm
          ${theme === 'dark' ? 'bg-blue-900/20 text-blue-300' : 'bg-blue-50 text-blue-700'}
        `}>
          <p>Receipt will be sent to the customer's email address after checkout.</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSending}
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
            onClick={handleSend}
            disabled={!email || !validateEmail(email) || isSending}
            className={`
              flex-1 px-6 py-3 rounded-lg font-semibold transition-colors
              bg-blue-600 hover:bg-blue-700 text-white
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2
            `}
          >
            {isSending ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              'Send Receipt'
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}
