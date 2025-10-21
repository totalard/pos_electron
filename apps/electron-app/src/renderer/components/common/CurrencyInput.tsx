import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '../../stores'
import { useCurrency } from '../../hooks/useCurrency'

export interface CurrencyInputProps {
  /** Current value as a number */
  value: number
  /** Callback when value changes */
  onChange: (value: number) => void
  /** Placeholder text */
  placeholder?: string
  /** Additional CSS classes */
  className?: string
  /** Disabled state */
  disabled?: boolean
  /** Auto focus on mount */
  autoFocus?: boolean
  /** Minimum allowed value */
  min?: number
  /** Maximum allowed value */
  max?: number
  /** Show currency symbol inside input */
  showSymbol?: boolean
  /** Input size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Error state */
  error?: boolean
  /** Helper text below input */
  helperText?: string
  /** Label above input */
  label?: string
  /** Required field indicator */
  required?: boolean
  /** Callback when input loses focus */
  onBlur?: () => void
  /** Callback when Enter key is pressed */
  onEnter?: () => void
}

/**
 * CurrencyInput Component
 * 
 * A specialized input component for currency values with real-time formatting.
 * Handles decimal places, thousand separators, and currency symbols based on
 * business settings. Provides a smooth user experience with proper validation.
 * 
 * @example
 * ```tsx
 * <CurrencyInput 
 *   value={amount} 
 *   onChange={setAmount}
 *   label="Amount"
 * />
 * <CurrencyInput 
 *   value={price} 
 *   onChange={setPrice}
 *   min={0}
 *   max={10000}
 *   showSymbol={true}
 * />
 * ```
 */
export function CurrencyInput({
  value,
  onChange,
  placeholder,
  className = '',
  disabled = false,
  autoFocus = false,
  min,
  max,
  showSymbol = true,
  size = 'md',
  error = false,
  helperText,
  label,
  required = false,
  onBlur,
  onEnter
}: CurrencyInputProps) {
  const { theme } = useAppStore()
  const { formatCurrency, parseCurrency, getCurrencySymbol, getDecimalPlaces } = useCurrency()
  const [displayValue, setDisplayValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Update display value when value prop changes
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value > 0 ? formatCurrency(value, { showSymbol: false }) : '')
    }
  }, [value, isFocused])

  const handleFocus = () => {
    setIsFocused(true)
    // Show raw number when focused for easier editing
    if (value > 0) {
      setDisplayValue(value.toFixed(getDecimalPlaces()))
    }
  }

  const handleBlur = () => {
    setIsFocused(false)
    
    // Parse and validate the input
    const numericValue = parseCurrency(displayValue)
    
    // Apply min/max constraints
    let finalValue = numericValue
    if (min !== undefined && finalValue < min) finalValue = min
    if (max !== undefined && finalValue > max) finalValue = max
    
    // Update with validated value
    if (finalValue !== value) {
      onChange(finalValue)
    }
    
    // Format for display
    setDisplayValue(finalValue > 0 ? formatCurrency(finalValue, { showSymbol: false }) : '')
    
    onBlur?.()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    
    // Allow only numbers, decimal separator, and thousand separator
    const decimalPlaces = getDecimalPlaces()
    const decimalSeparator = '.'
    
    // Remove any non-numeric characters except decimal point
    let cleaned = input.replace(/[^\d.]/g, '')
    
    // Ensure only one decimal point
    const parts = cleaned.split('.')
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('')
    }
    
    // Limit decimal places
    if (parts.length === 2 && parts[1].length > decimalPlaces) {
      cleaned = parts[0] + '.' + parts[1].substring(0, decimalPlaces)
    }
    
    setDisplayValue(cleaned)
    
    // Parse and update value
    const numericValue = parseFloat(cleaned) || 0
    onChange(numericValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onEnter?.()
      inputRef.current?.blur()
    }
  }

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-3 text-lg'
  }

  const inputClasses = `
    w-full rounded-lg border transition-all duration-200
    ${sizeClasses[size]}
    ${showSymbol ? 'pl-8' : ''}
    ${error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
      : theme === 'dark'
        ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500/20'
        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500/20'
    }
    ${disabled
      ? theme === 'dark'
        ? 'bg-gray-900 text-gray-500 cursor-not-allowed'
        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
      : ''
    }
    focus:outline-none focus:ring-2
    ${className}
  `

  return (
    <div className="w-full">
      {label && (
        <label className={`
          block text-sm font-medium mb-2
          ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
        `}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {showSymbol && (
          <span className={`
            absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none
            ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}
            ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'}
          `}>
            {getCurrencySymbol()}
          </span>
        )}
        
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className={inputClasses}
        />
      </div>
      
      {helperText && (
        <p className={`
          mt-1 text-xs
          ${error
            ? 'text-red-500'
            : theme === 'dark'
              ? 'text-gray-400'
              : 'text-gray-600'
          }
        `}>
          {helperText}
        </p>
      )}
    </div>
  )
}
