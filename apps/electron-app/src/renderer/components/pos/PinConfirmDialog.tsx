import { useState } from 'react'
import { useAppStore, usePinStore } from '../../stores'
import { authAPI } from '../../services/api'
import { Button } from '../common'
import { PinEntryPanel } from '../PinEntryPanel'

interface PinConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
}

/**
 * PinConfirmDialog - PIN verification dialog for sensitive actions
 * 
 * Features:
 * - Requires current user's PIN to confirm action
 * - Shows error on incorrect PIN
 * - Limits attempts to 3
 * - Auto-closes on successful verification
 */
export function PinConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Please enter your PIN to confirm this action'
}: PinConfirmDialogProps) {
  const { theme } = useAppStore()
  const { currentUser } = usePinStore()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [isVerifying, setIsVerifying] = useState(false)

  const maxAttempts = 3

  const handlePinChange = (newPin: string) => {
    setPin(newPin)
    setError('')
  }

  const handleSubmit = async () => {
    if (!currentUser) {
      setError('No user logged in')
      return
    }

    if (pin.length !== 6) {
      setError('Please enter a 6-digit PIN')
      return
    }

    setIsVerifying(true)
    setError('')

    try {
      // Verify PIN using authAPI
      const response = await authAPI.login({ pin })
      
      if (response.success && response.user && response.user.id === currentUser.id) {
        // PIN is correct and matches current user, proceed with action
        onConfirm()
        handleClose()
      } else {
        // PIN is incorrect or doesn't match current user
        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        setPin('')
        
        if (newAttempts >= maxAttempts) {
          setError('Maximum attempts reached. Please try again later.')
          setTimeout(() => {
            handleClose()
          }, 2000)
        } else {
          setError('Incorrect PIN. Please try again.')
        }
      }
    } catch (err: any) {
      console.error('PIN verification error:', err)
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      setPin('')
      
      if (newAttempts >= maxAttempts) {
        setError('Maximum attempts reached. Please try again later.')
        setTimeout(() => {
          handleClose()
        }, 2000)
      } else {
        setError('Incorrect PIN. Please try again.')
      }
    } finally {
      setIsVerifying(false)
    }
  }

  const handleClose = () => {
    setPin('')
    setError('')
    setAttempts(0)
    setIsVerifying(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`
        w-full max-w-md mx-4 rounded-2xl shadow-2xl
        ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}
      `}>
        {/* Header */}
        <div className={`
          px-6 py-4 border-b
          ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
        `}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`
                text-xl font-bold
                ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
              `}>
                {title}
              </h2>
              <p className={`
                mt-1 text-sm
                ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
              `}>
                {message}
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={isVerifying}
              className={`
                p-2 rounded-lg transition-colors
                ${theme === 'dark'
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              aria-label="Close dialog"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* User Info */}
          {currentUser && (
            <div className={`
              mb-6 p-4 rounded-lg border
              ${theme === 'dark'
                ? 'bg-gray-700/30 border-gray-600'
                : 'bg-gray-50 border-gray-200'
              }
            `}>
              <div className="flex items-center gap-3">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold
                  ${theme === 'dark' ? 'bg-primary-900/50 text-primary-400' : 'bg-primary-100 text-primary-700'}
                `}>
                  {currentUser.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {currentUser.full_name}
                  </p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {currentUser.role === 'admin' ? 'Administrator' : 'User'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* PIN Entry */}
          <PinEntryPanel
            pin={pin}
            onPinChange={handlePinChange}
            onSubmit={handleSubmit}
            disabled={attempts >= maxAttempts}
            isLoading={isVerifying}
            error={error}
            attempts={attempts}
            maxAttempts={maxAttempts}
            title=""
            subtitle="Enter your 6-digit PIN to confirm"
            showKeypad={true}
            pinLength={6}
          />
        </div>

        {/* Footer */}
        <div className={`
          px-6 py-4 border-t flex gap-3 justify-end
          ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
        `}>
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isVerifying}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isVerifying || pin.length !== 6 || attempts >= maxAttempts}
          >
            {isVerifying ? 'Verifying...' : 'Confirm'}
          </Button>
        </div>
      </div>
    </div>
  )
}
