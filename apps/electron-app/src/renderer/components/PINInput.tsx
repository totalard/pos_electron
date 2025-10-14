import { useEffect } from 'react'
import { useAppStore, usePinStore, isPinComplete } from '../stores'
import { NumericKeypad } from './NumericKeypad'

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
    showPin,
    addDigit,
    removeDigit,
    clearPin,
    submitPin,
    toggleShowPin
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

  // const pinDisplay = getPinDisplay(pin, showPin) // Unused for now
  const remainingAttempts = maxAttempts - attempts

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

        {/* PIN Display */}
        <div className="mb-8">
          <div className={`
            flex justify-center items-center gap-4 mb-4
            p-6 rounded-2xl
            ${theme === 'dark' 
              ? 'bg-gray-800/50 border border-gray-700' 
              : 'bg-white/80 border border-gray-200'
            }
            backdrop-blur-sm shadow-lg
          `}>
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className={`
                  w-4 h-4 rounded-full transition-all duration-300
                  ${index < pin.length
                    ? theme === 'dark' 
                      ? 'bg-primary-400 scale-110' 
                      : 'bg-primary-600 scale-110'
                    : theme === 'dark'
                      ? 'bg-gray-600 border-2 border-gray-500'
                      : 'bg-gray-200 border-2 border-gray-300'
                  }
                `}
              />
            ))}
          </div>

          {/* Show/Hide PIN Toggle */}
          <div className="flex justify-center">
            <button
              onClick={toggleShowPin}
              disabled={isLoading}
              className={`
                text-sm px-4 py-2 rounded-lg transition-colors duration-200
                ${theme === 'dark'
                  ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                  : 'text-gray-600 hover:text-gray-700 hover:bg-gray-100'
                }
                disabled:opacity-50
              `}
            >
              {showPin ? 'Hide PIN' : 'Show PIN'}
            </button>
          </div>

          {/* PIN Value Display (when show is enabled) */}
          {showPin && pin && (
            <div className={`
              text-center mt-2 text-2xl font-mono tracking-widest
              ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
            `}>
              {pin}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className={`
            mb-6 p-4 rounded-lg text-center
            ${theme === 'dark'
              ? 'bg-red-900/50 border border-red-800 text-red-300'
              : 'bg-red-50 border border-red-200 text-red-700'
            }
          `}>
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Attempts Remaining */}
        {attempts > 0 && remainingAttempts > 0 && (
          <div className={`
            mb-6 text-center text-sm
            ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
          `}>
            {remainingAttempts} attempt{remainingAttempts === 1 ? '' : 's'} remaining
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mb-6 flex justify-center">
            <div className={`
              animate-spin rounded-full h-8 w-8 border-b-2
              ${theme === 'dark' ? 'border-primary-400' : 'border-primary-600'}
            `} />
          </div>
        )}

        {/* Numeric Keypad */}
        <NumericKeypad
          onDigitPress={addDigit}
          onBackspace={removeDigit}
          onClear={clearPin}
          onSubmit={submitPin}
          disabled={isLoading || attempts >= maxAttempts}
          className="justify-center"
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
