import React, { useEffect } from 'react'
import { useAppStore } from '../stores'

interface NumericKeypadProps {
  onDigitPress: (_digit: string) => void
  onBackspace: () => void
  onClear: () => void
  onSubmit: () => void
  disabled?: boolean
  className?: string
}

export function NumericKeypad({
  onDigitPress,
  onBackspace,
  onClear,
  onSubmit,
  disabled = false,
  className = ''
}: NumericKeypadProps) {
  const { theme } = useAppStore()

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']

  const handleKeyPress = (key: string) => {
    if (disabled) return

    if (digits.includes(key)) {
      onDigitPress(key)
    } else if (key === 'Backspace') {
      onBackspace()
    } else if (key === 'Enter') {
      onSubmit()
    } else if (key === 'Escape') {
      onClear()
    }
  }

  // Handle keyboard events
  const handleKeyDown = (event: React.KeyboardEvent | KeyboardEvent) => {
    const key = (event as KeyboardEvent).key || (event as React.KeyboardEvent).key

    // Only prevent default for keys we handle
    if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Backspace', 'Enter', 'Escape'].includes(key)) {
      event.preventDefault()
      handleKeyPress(key)
    }
  }

  // Add global keyboard listener
  useEffect(() => {
    if (disabled) return

    window.addEventListener('keydown', handleKeyDown as EventListener)
    return () => {
      window.removeEventListener('keydown', handleKeyDown as EventListener)
    }
  }, [disabled, onDigitPress, onBackspace, onClear, onSubmit])

  // Touch-safe button sizing: responsive across screen sizes
  // Small screens: 56x56px, Medium: 64x64px, Large: 72x72px
  const buttonBaseClass = `
    w-14 h-14 sm:w-16 sm:h-16 md:w-[72px] md:h-[72px] lg:w-20 lg:h-20
    rounded-lg sm:rounded-xl font-bold text-lg sm:text-xl md:text-2xl
    transition-all duration-150 ease-in-out
    transform active:scale-95 hover:scale-105
    focus:outline-none focus:ring-2 focus:ring-offset-1
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100
    shadow-lg hover:shadow-xl
    flex items-center justify-center
    flex-shrink-0 backdrop-blur-sm border
  `

  const digitButtonClass = `
    ${buttonBaseClass}
    ${theme === 'dark'
      ? 'bg-gray-700/50 text-gray-100 hover:bg-gray-600/70 focus:ring-primary-400/50 border-gray-600/50 active:bg-gray-500 hover:text-white'
      : 'bg-white/70 text-gray-900 hover:bg-white/90 focus:ring-primary-500/50 border-gray-300/50 active:bg-gray-100 hover:shadow-2xl'
    }
  `

  const actionButtonClass = `
    ${buttonBaseClass}
    ${theme === 'dark'
      ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white hover:from-primary-500 hover:to-primary-600 focus:ring-primary-400/50 border-primary-600/50 active:from-primary-700 active:to-primary-800'
      : 'bg-gradient-to-br from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 focus:ring-primary-500/50 border-primary-600/50 active:from-primary-800 active:to-primary-900'
    }
  `

  const clearButtonClass = `
    ${buttonBaseClass}
    ${theme === 'dark'
      ? 'bg-gradient-to-br from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 focus:ring-red-400/50 border-red-600/50 active:from-red-700 active:to-red-800'
      : 'bg-gradient-to-br from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 focus:ring-red-500/50 border-red-600/50 active:from-red-800 active:to-red-900'
    }
  `

  return (
    <div
      className={`grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 w-full max-w-[224px] sm:max-w-[248px] md:max-w-[280px] lg:max-w-[320px] mx-auto ${className}`}
      tabIndex={0}
    >
      {/* Row 1: 1, 2, 3 */}
      {digits.slice(0, 3).map((digit) => (
        <button
          key={digit}
          onClick={() => handleKeyPress(digit)}
          disabled={disabled}
          className={digitButtonClass}
          aria-label={`Digit ${digit}`}
        >
          {digit}
        </button>
      ))}

      {/* Row 2: 4, 5, 6 */}
      {digits.slice(3, 6).map((digit) => (
        <button
          key={digit}
          onClick={() => handleKeyPress(digit)}
          disabled={disabled}
          className={digitButtonClass}
          aria-label={`Digit ${digit}`}
        >
          {digit}
        </button>
      ))}

      {/* Row 3: 7, 8, 9 */}
      {digits.slice(6, 9).map((digit) => (
        <button
          key={digit}
          onClick={() => handleKeyPress(digit)}
          disabled={disabled}
          className={digitButtonClass}
          aria-label={`Digit ${digit}`}
        >
          {digit}
        </button>
      ))}

      {/* Row 4: Clear, 0, Backspace */}
      <button
        onClick={onClear}
        disabled={disabled}
        className={clearButtonClass}
        aria-label="Clear all"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <button
        onClick={() => handleKeyPress('0')}
        disabled={disabled}
        className={digitButtonClass}
        aria-label="Digit 0"
      >
        0
      </button>

      <button
        onClick={onBackspace}
        disabled={disabled}
        className={actionButtonClass}
        aria-label="Backspace"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
        </svg>
      </button>

      {/* Row 5: Submit button spanning all columns - full width & highlighted */}
      <button
        onClick={onSubmit}
        disabled={disabled}
        className={`
          col-span-3 w-full min-h-[52px] h-14 sm:h-16 md:h-[72px] lg:h-20
          rounded-lg sm:rounded-xl font-bold text-base sm:text-lg md:text-xl
          transition-all duration-150 ease-in-out
          transform active:scale-[0.98] hover:scale-[1.02]
          focus:outline-none focus:ring-2 focus:ring-offset-1
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100
          shadow-xl hover:shadow-2xl
          flex items-center justify-center gap-2 sm:gap-3
          backdrop-blur-sm border-2
          ${theme === 'dark'
            ? 'bg-gradient-to-r from-green-600 via-green-500 to-green-600 text-white hover:from-green-500 hover:via-green-400 hover:to-green-500 focus:ring-green-400/50 border-green-500/50 active:from-green-700 active:via-green-600 active:to-green-700 shadow-green-900/30 hover:shadow-green-900/50'
            : 'bg-gradient-to-r from-green-600 via-green-500 to-green-600 text-white hover:from-green-700 hover:via-green-600 hover:to-green-700 focus:ring-green-500/50 border-green-600/50 active:from-green-800 active:via-green-700 active:to-green-800 shadow-green-600/30 hover:shadow-green-600/50'
          }
        `}
        aria-label="Submit PIN"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="tracking-wide">ENTER</span>
      </button>
    </div>
  )
}
