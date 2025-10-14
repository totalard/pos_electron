import React from 'react'
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
  const handleKeyDown = (event: React.KeyboardEvent) => {
    event.preventDefault()
    handleKeyPress(event.key)
  }

  const buttonBaseClass = `
    w-20 h-20 rounded-2xl font-bold text-2xl
    transition-all duration-200 ease-in-out
    transform active:scale-95
    focus:outline-none focus:ring-4
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    shadow-lg hover:shadow-xl
  `

  const digitButtonClass = `
    ${buttonBaseClass}
    ${theme === 'dark'
      ? 'bg-gray-700 text-white hover:bg-gray-600 focus:ring-primary-400/50 border border-gray-600'
      : 'bg-white text-gray-900 hover:bg-gray-50 focus:ring-primary-500/50 border border-gray-200'
    }
  `

  const actionButtonClass = `
    ${buttonBaseClass}
    ${theme === 'dark'
      ? 'bg-primary-600 text-white hover:bg-primary-500 focus:ring-primary-400/50'
      : 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500/50'
    }
  `

  const clearButtonClass = `
    ${buttonBaseClass}
    ${theme === 'dark'
      ? 'bg-red-600 text-white hover:bg-red-500 focus:ring-red-400/50'
      : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/50'
    }
  `

  return (
    <div 
      className={`grid grid-cols-3 gap-6 ${className}`}
      onKeyDown={handleKeyDown}
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
        <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
        </svg>
      </button>

      {/* Row 5: Submit button spanning all columns */}
      <button
        onClick={onSubmit}
        disabled={disabled}
        className={`
          ${actionButtonClass}
          col-span-3 h-16 text-xl font-semibold
          flex items-center justify-center gap-2
        `}
        aria-label="Submit PIN"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Enter
      </button>
    </div>
  )
}
