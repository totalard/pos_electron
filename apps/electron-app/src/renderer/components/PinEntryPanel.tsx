import { useState, useEffect } from 'react'
import { useAppStore } from '../stores'
import { NumericKeypad } from './NumericKeypad'

interface PinEntryPanelProps {
  /** Current PIN value */
  pin: string
  /** Callback when PIN changes */
  onPinChange?: (pin: string) => void
  /** Callback when a digit is added */
  onDigitAdd?: (digit: string) => void
  /** Callback when backspace is pressed */
  onBackspace?: () => void
  /** Callback when clear is pressed */
  onClear?: () => void
  /** Callback when submit is pressed */
  onSubmit?: () => void
  /** Whether the keypad is disabled */
  disabled?: boolean
  /** Whether the component is in loading state */
  isLoading?: boolean
  /** Error message to display */
  error?: string
  /** Number of attempts made */
  attempts?: number
  /** Maximum number of attempts allowed */
  maxAttempts?: number
  /** Title text */
  title?: string
  /** Subtitle text */
  subtitle?: string
  /** Whether to show the keypad panel */
  showKeypad?: boolean
  /** Custom className for the container */
  className?: string
  /** PIN length (default: 6) */
  pinLength?: number
}

/**
 * PinEntryPanel - Reusable PIN entry component with right-side sliding keypad
 * 
 * Features:
 * - PIN display with dots/circles
 * - Show/Hide PIN toggle
 * - Right-side sliding keypad panel
 * - Error and loading states
 * - Attempt tracking
 * - Touch-safe UI (minimum 44x44px)
 * - Theme-aware styling
 */
export function PinEntryPanel({
  pin,
  onPinChange,
  onDigitAdd,
  onBackspace,
  onClear,
  onSubmit,
  disabled = false,
  isLoading = false,
  error,
  attempts = 0,
  maxAttempts = 3,
  title = 'Enter PIN',
  subtitle = 'Enter your 6-digit PIN',
  showKeypad = true,
  className = '',
  pinLength = 6
}: PinEntryPanelProps) {
  const { theme } = useAppStore()
  const [showPin, setShowPin] = useState(false)
  const [keypadVisible, setKeypadVisible] = useState(showKeypad)

  // Update keypad visibility when showKeypad prop changes
  useEffect(() => {
    setKeypadVisible(showKeypad)
  }, [showKeypad])

  // Auto-hide keypad when PIN is complete (optional behavior)
  useEffect(() => {
    if (pin.length === pinLength && showKeypad) {
      // Keep keypad visible even when complete
      // User can manually hide it if needed
    }
  }, [pin.length, pinLength, showKeypad])

  const handleDigitPress = (digit: string) => {
    if (pin.length < pinLength) {
      if (onDigitAdd) {
        onDigitAdd(digit)
      } else if (onPinChange) {
        onPinChange(pin + digit)
      }
    }
  }

  const handleBackspace = () => {
    if (onBackspace) {
      onBackspace()
    } else if (onPinChange && pin.length > 0) {
      onPinChange(pin.slice(0, -1))
    }
  }

  const handleClear = () => {
    if (onClear) {
      onClear()
    } else if (onPinChange) {
      onPinChange('')
    }
  }

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit()
    }
  }

  const toggleShowPin = () => {
    setShowPin(!showPin)
  }

  const toggleKeypad = () => {
    setKeypadVisible(!keypadVisible)
  }

  const remainingAttempts = maxAttempts - attempts

  return (
    <div className={`relative ${className}`}>
      {/* Main Content Section - Only show/hide toggle and errors */}
      <div className="mb-6">
        {/* Title */}
        {title && (
          <h3 className={`
            text-lg font-bold mb-2 text-center
            ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
          `}>
            {title}
          </h3>
        )}

        {/* Subtitle */}
        {subtitle && (
          <p className={`
            text-sm text-center mb-4
            ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
          `}>
            {subtitle}
          </p>
        )}

        {/* Show/Hide PIN Toggle & Keypad Toggle */}
        <div className="flex justify-center gap-3 mb-4">
          <button
            onClick={toggleShowPin}
            disabled={isLoading || disabled}
            className={`
              text-sm px-5 py-3 min-h-[44px] rounded-lg font-medium transition-all
              flex items-center gap-2
              ${theme === 'dark'
                ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 active:bg-gray-600'
                : 'text-gray-600 hover:text-gray-700 hover:bg-gray-100/80 active:bg-gray-200'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
          >
            {showPin ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Hide PIN
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-4.753 4.753m4.753-4.753L3.596 3.039m10.318 10.318L21 21" />
                </svg>
                Show PIN
              </>
            )}
          </button>

          {showKeypad && (
            <button
              onClick={toggleKeypad}
              disabled={isLoading || disabled}
              className={`
                text-sm px-5 py-3 min-h-[44px] rounded-lg font-medium transition-all
                flex items-center gap-2
                ${theme === 'dark'
                  ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 active:bg-gray-600'
                  : 'text-gray-600 hover:text-gray-700 hover:bg-gray-100/80 active:bg-gray-200'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              aria-label={keypadVisible ? 'Hide Keypad' : 'Show Keypad'}
            >
              {keypadVisible ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                  Hide Keypad
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                  Show Keypad
                </>
              )}
            </button>
          )}
        </div>

        {/* PIN Value Display (when show is enabled) */}
        {showPin && pin && (
          <div className={`
            text-center mt-4 text-3xl font-mono tracking-[0.3em] font-bold
            ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}
          `}>
            {pin}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className={`
          mb-6 p-4 rounded-lg border
          ${theme === 'dark'
            ? 'bg-red-500/10 border-red-500/40 text-red-300'
            : 'bg-red-50 border-red-200 text-red-700'
          }
        `}>
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Attempts Remaining */}
      {attempts > 0 && remainingAttempts > 0 && (
        <div className={`
          mb-6 p-3 rounded-lg text-sm font-medium text-center
          ${remainingAttempts <= 2
            ? theme === 'dark'
              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
              : 'bg-yellow-100/80 text-yellow-700 border border-yellow-300'
            : theme === 'dark'
              ? 'text-gray-400'
              : 'text-gray-600'
          }
        `}>
          {remainingAttempts} attempt{remainingAttempts === 1 ? '' : 's'} remaining
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="mb-6 flex justify-center">
          <div className={`
            animate-smooth-spin rounded-full h-8 w-8 border-2 border-transparent
            ${theme === 'dark' ? 'border-t-blue-400' : 'border-t-blue-600'}
          `} />
        </div>
      )}

      {/* Right-Side Keypad Panel - Responsive with better layout */}
      {showKeypad && (
        <div
          className={`
            fixed top-0 right-0 h-full z-50
            w-80 sm:w-96 md:w-[420px] lg:w-[480px]
            transform transition-transform duration-300 ease-out
            ${keypadVisible ? 'translate-x-0' : 'translate-x-full'}
            ${theme === 'dark'
              ? 'bg-gray-900 border-l border-gray-700'
              : 'bg-white border-l border-gray-200'
            }
          `}
        >
          <div className="h-full flex flex-col">
            {/* Keypad Header with top padding */}
            <div className="pt-8 pb-6 px-6">
              <h4 className={`
                text-xl md:text-2xl font-bold text-center
                ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
              `}>
                Enter PIN
              </h4>
            </div>

            {/* Main Content Area - PIN Dots + Keypad grouped together */}
            <div className="flex-1 flex flex-col justify-center px-6 pb-6">
              {/* PIN Dots Display - Grouped with keypad */}
              <div className={`
                flex justify-center items-center gap-3 sm:gap-4 mb-8 p-4 sm:p-6 rounded-xl
                border
                ${theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
                }
              `}>
                {Array.from({ length: pinLength }).map((_, index) => (
                  <div
                    key={index}
                    className={`
                      w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full transition-all duration-200 ease-out
                      ${index < pin.length
                        ? `${theme === 'dark' ? 'bg-blue-500' : 'bg-blue-600'} scale-110 animate-pulse-once`
                        : `border-2 ${theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-50'}`
                      }
                    `}
                    style={{
                      animationDelay: `${index * 50}ms`
                    }}
                  />
                ))}
              </div>

              {/* Keypad - Responsive sizing */}
              <div className="flex items-center justify-center">
                <NumericKeypad
                  onDigitPress={handleDigitPress}
                  onBackspace={handleBackspace}
                  onClear={handleClear}
                  onSubmit={handleSubmit}
                  disabled={isLoading || disabled || attempts >= maxAttempts}
                  className="justify-center w-full"
                />
              </div>
            </div>

            {/* User Instructions - Moved to bottom */}
            <div className="px-6 pb-6">
              <div className={`
                p-3 sm:p-4 rounded-lg border
                ${theme === 'dark'
                  ? 'bg-blue-900/20 border-blue-700/40'
                  : 'bg-blue-50 border-blue-200'
                }
              `}>
                <div className="flex items-start gap-2 sm:gap-3">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-blue-200' : 'text-blue-800'}`}>
                    <p className="font-semibold mb-1 sm:mb-2">Quick Tips:</p>
                    <ul className="space-y-0.5 sm:space-y-1 text-[10px] sm:text-xs">
                      <li>• Use number keys or tap buttons</li>
                      <li>• Press Enter to submit</li>
                      <li>• Press Escape to clear</li>
                      <li>• Tap outside to close</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Footer Info */}
              <div className={`
                mt-3 text-center text-[10px] sm:text-xs
                ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}
              `}>
                {pin.length} / {pinLength} digits entered
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay when keypad is visible - Click to close */}
      {showKeypad && keypadVisible && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={toggleKeypad}
          aria-hidden="true"
        />
      )}
    </div>
  )
}
