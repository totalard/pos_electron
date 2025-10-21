import { useEffect } from 'react'
import { useAppStore, usePinStore, isPinComplete } from '../stores'
import { PinEntryPanel } from './PinEntryPanel'

interface PINInputProps {
  onAuthenticated?: () => void
  className?: string
}

export function PINInput({ onAuthenticated, className = '' }: PINInputProps) {
  const { theme } = useAppStore()
  const {
    pin,
    isAuthenticated,
    isLoading,
    error,
    attempts,
    maxAttempts,
    addDigit,
    removeDigit,
    clearPin,
    submitPin
  } = usePinStore()

  // Auto-submit when PIN reaches minimum length
  useEffect(() => {
    if (isPinComplete(pin) && !isLoading && !isAuthenticated) {
      const timer = setTimeout(() => {
        submitPin()
      }, 500) // Small delay for better UX
      
      return () => clearTimeout(timer)
    }
  }, [pin, isLoading, isAuthenticated, submitPin])

  // Call onAuthenticated when authentication succeeds
  useEffect(() => {
    if (isAuthenticated && onAuthenticated) {
      onAuthenticated()
    }
  }, [isAuthenticated, onAuthenticated])

  return (
    <div className={`
      fixed inset-0 z-50 flex items-center justify-center
      ${theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-primary-50 via-white to-primary-100'
      }
      ${className}
    `}>
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`
          absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-5
          ${theme === 'dark' ? 'bg-primary-400' : 'bg-primary-200'}
          animate-pulse
        `} />
        <div className={`
          absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-5
          ${theme === 'dark' ? 'bg-primary-300' : 'bg-primary-300'}
          animate-pulse
        `} style={{ animationDelay: '2s' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-12">
          {/* Lock Icon */}
          <div className={`
            inline-flex items-center justify-center w-24 h-24 rounded-full mb-6
            ${theme === 'dark' 
              ? 'bg-gradient-to-br from-primary-600 to-primary-800 shadow-2xl shadow-primary-900/50' 
              : 'bg-gradient-to-br from-primary-500 to-primary-700 shadow-2xl shadow-primary-500/30'
            }
          `}>
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          {/* Title */}
          <h1 className={`
            text-4xl font-bold mb-2
            ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
          `}>
            Enter PIN
          </h1>

          {/* Subtitle */}
          <p className={`
            text-lg
            ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
          `}>
            Please enter your PIN to access the system
          </p>
        </div>

        {/* PIN Entry Panel */}
        <PinEntryPanel
          pin={pin}
          onDigitAdd={addDigit}
          onBackspace={removeDigit}
          onClear={clearPin}
          onSubmit={submitPin}
          isLoading={isLoading}
          error={error || undefined}
          attempts={attempts}
          maxAttempts={maxAttempts}
          title=""
          subtitle=""
          showKeypad={true}
        />

        {/* Footer */}
        <div className={`
          mt-8 text-center text-sm
          ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}
        `}>
          MidLogic POS System
        </div>
      </div>
    </div>
  )
}
