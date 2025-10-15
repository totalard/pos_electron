import { useState } from 'react'
import { useAppStore, usePinStore } from '../../stores'
import { authAPI } from '../../services/api'

export function PINChangeTab() {
  const { theme } = useAppStore()
  const { currentUser } = usePinStore()
  const [currentPIN, setCurrentPIN] = useState('')
  const [newPIN, setNewPIN] = useState('')
  const [confirmPIN, setConfirmPIN] = useState('')
  const [showPINs, setShowPINs] = useState(false)
  const [isChanging, setIsChanging] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleChangePIN = async () => {
    setMessage(null)

    // Validation
    if (!currentPIN || !newPIN || !confirmPIN) {
      setMessage({ type: 'error', text: 'Please fill in all fields' })
      return
    }

    if (newPIN.length !== 6 || !/^\d+$/.test(newPIN)) {
      setMessage({ type: 'error', text: 'New PIN must be exactly 6 digits' })
      return
    }

    if (newPIN !== confirmPIN) {
      setMessage({ type: 'error', text: 'New PIN and confirmation do not match' })
      return
    }

    if (currentPIN === newPIN) {
      setMessage({ type: 'error', text: 'New PIN must be different from current PIN' })
      return
    }

    setIsChanging(true)

    try {
      if (!currentUser?.id) {
        throw new Error('User not found')
      }

      await authAPI.changePin(currentUser.id, currentPIN, newPIN)
      
      setMessage({ type: 'success', text: 'PIN changed successfully!' })
      setCurrentPIN('')
      setNewPIN('')
      setConfirmPIN('')
      
      setTimeout(() => setMessage(null), 5000)
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to change PIN. Please check your current PIN and try again.' 
      })
    } finally {
      setIsChanging(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          PIN Change
        </h2>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Update your PIN for enhanced security
        </p>
      </div>

      {/* Change PIN Form */}
      <div className={`
        p-6 rounded-lg space-y-4
        ${theme === 'dark'
          ? 'bg-gray-700/30 border border-gray-600'
          : 'bg-gray-50 border border-gray-200'
        }
      `}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Change Your PIN
        </h3>

        {/* Current PIN */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Current PIN *
          </label>
          <input
            type={showPINs ? 'text' : 'password'}
            value={currentPIN}
            onChange={(e) => setCurrentPIN(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            placeholder="Enter current PIN"
            className={`
              w-full px-4 py-4 rounded-lg border font-mono text-lg tracking-widest min-h-[56px]
              ${theme === 'dark'
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-primary-500'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-primary-500'
              }
              focus:outline-none focus:ring-2 focus:ring-primary-500/20
            `}
          />
        </div>

        {/* New PIN */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            New PIN *
          </label>
          <input
            type={showPINs ? 'text' : 'password'}
            value={newPIN}
            onChange={(e) => setNewPIN(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            placeholder="Enter new PIN"
            className={`
              w-full px-4 py-4 rounded-lg border font-mono text-lg tracking-widest min-h-[56px]
              ${theme === 'dark'
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-primary-500'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-primary-500'
              }
              focus:outline-none focus:ring-2 focus:ring-primary-500/20
            `}
          />
          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
            Must be exactly 6 digits
          </p>
        </div>

        {/* Confirm New PIN */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Confirm New PIN *
          </label>
          <input
            type={showPINs ? 'text' : 'password'}
            value={confirmPIN}
            onChange={(e) => setConfirmPIN(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            placeholder="Confirm new PIN"
            className={`
              w-full px-4 py-4 rounded-lg border font-mono text-lg tracking-widest min-h-[56px]
              ${theme === 'dark'
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-primary-500'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-primary-500'
              }
              focus:outline-none focus:ring-2 focus:ring-primary-500/20
            `}
          />
        </div>

        {/* Show/Hide PINs Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPINs(!showPINs)}
            className={`
              flex items-center gap-2 text-sm
              ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}
              transition-colors
            `}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {showPINs ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              )}
            </svg>
            {showPINs ? 'Hide PINs' : 'Show PINs'}
          </button>
        </div>

        {/* Change PIN Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleChangePIN}
            disabled={isChanging}
            className={`
              px-8 py-4 rounded-lg font-medium transition-colors text-base min-h-[56px]
              ${theme === 'dark'
                ? 'bg-primary-600 hover:bg-primary-700 text-white'
                : 'bg-primary-500 hover:bg-primary-600 text-white'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {isChanging ? 'Changing PIN...' : 'Change PIN'}
          </button>
        </div>
      </div>



      {/* Message */}
      {message && (
        <div className={`
          p-4 rounded-lg flex items-center gap-3
          ${message.type === 'success'
            ? theme === 'dark'
              ? 'bg-green-900/20 border border-green-700 text-green-400'
              : 'bg-green-50 border border-green-200 text-green-700'
            : theme === 'dark'
              ? 'bg-red-900/20 border border-red-700 text-red-400'
              : 'bg-red-50 border border-red-200 text-red-700'
          }
        `}>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            {message.type === 'success' ? (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            )}
          </svg>
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}
    </div>
  )
}

