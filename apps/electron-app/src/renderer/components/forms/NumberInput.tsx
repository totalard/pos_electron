import { InputHTMLAttributes, forwardRef } from 'react'
import { useAppStore } from '../../stores'

/**
 * NumberInput component props
 */
export interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'value'> {
  /** Label text */
  label?: string
  /** Current value */
  value: number
  /** Change handler */
  onChange: (value: number) => void
  /** Minimum value */
  min?: number
  /** Maximum value */
  max?: number
  /** Step increment/decrement */
  step?: number
  /** Error message */
  error?: string
  /** Helper text */
  helperText?: string
  /** Full width input */
  fullWidth?: boolean
  /** Show increment/decrement buttons */
  showButtons?: boolean
  /** Allow decimal values */
  allowDecimal?: boolean
  /** Decimal places (only if allowDecimal is true) */
  decimalPlaces?: number
  /** Format display value (e.g., currency) */
  formatDisplay?: (value: number) => string
}

/**
 * Touch-optimized NumberInput component with large +/- buttons.
 * 
 * Features:
 * - Large touch-safe increment/decrement buttons (44x44px)
 * - Keyboard input support
 * - Min/max validation
 * - Step control
 * - Decimal support
 * - Custom formatting
 * 
 * @example
 * ```tsx
 * <NumberInput
 *   label="Quantity"
 *   value={quantity}
 *   onChange={setQuantity}
 *   min={0}
 *   max={100}
 *   step={1}
 *   showButtons
 * />
 * ```
 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  error,
  helperText,
  fullWidth = true,
  showButtons = true,
  allowDecimal = false,
  decimalPlaces = 2,
  formatDisplay,
  className = '',
  disabled = false,
  ...props
}, ref) => {
  const { theme } = useAppStore()

  const handleIncrement = () => {
    if (disabled) return
    
    const currentValue = value ?? 0
    let newValue = currentValue + step
    if (max !== undefined && newValue > max) {
      newValue = max
    }
    
    onChange(allowDecimal ? parseFloat(newValue.toFixed(decimalPlaces)) : Math.round(newValue))
  }

  const handleDecrement = () => {
    if (disabled) return
    
    const currentValue = value ?? 0
    let newValue = currentValue - step
    if (min !== undefined && newValue < min) {
      newValue = min
    }
    
    onChange(allowDecimal ? parseFloat(newValue.toFixed(decimalPlaces)) : Math.round(newValue))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    
    // Allow empty input for editing
    if (inputValue === '' || inputValue === '-') {
      return
    }

    let numValue = allowDecimal ? parseFloat(inputValue) : parseInt(inputValue, 10)
    
    if (isNaN(numValue)) {
      return
    }

    // Apply min/max constraints
    if (min !== undefined && numValue < min) {
      numValue = min
    }
    if (max !== undefined && numValue > max) {
      numValue = max
    }

    onChange(allowDecimal ? parseFloat(numValue.toFixed(decimalPlaces)) : numValue)
  }

  const handleBlur = () => {
    // Ensure value is within bounds on blur
    let finalValue = value
    
    if (min !== undefined && finalValue < min) {
      finalValue = min
    }
    if (max !== undefined && finalValue > max) {
      finalValue = max
    }
    
    if (finalValue !== value) {
      onChange(finalValue)
    }
  }

  const safeValue = value ?? 0
  const canDecrement = min === undefined || safeValue > min
  const canIncrement = max === undefined || safeValue < max

  const displayValue = formatDisplay ? formatDisplay(safeValue) : safeValue.toString()

  const inputClasses = `
    px-4 py-3 rounded-lg text-base text-center
    min-h-[44px] w-full
    transition-colors duration-200
    ${theme === 'dark'
      ? 'bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:border-primary-500'
      : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-primary-500'
    }
    focus:outline-none focus:ring-2 focus:ring-primary-500/20
    disabled:opacity-50 disabled:cursor-not-allowed
    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
    ${showButtons ? 'rounded-none' : ''}
    ${fullWidth ? 'flex-1' : 'w-auto'}
    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
    ${className}
  `

  const buttonClasses = (canPerformAction: boolean) => `
    min-w-[44px] min-h-[44px] px-3
    flex items-center justify-center
    transition-colors duration-200
    ${theme === 'dark'
      ? 'bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white border border-gray-600'
      : 'bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-900 border border-gray-300'
    }
    ${!canPerformAction || disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${error ? 'border-red-500' : ''}
  `

  const labelClasses = `
    block text-sm font-medium mb-2
    ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
    ${error ? 'text-red-500' : ''}
  `

  const helperClasses = `
    mt-1 text-xs
    ${error
      ? theme === 'dark' ? 'text-red-400' : 'text-red-600'
      : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
    }
  `

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className={labelClasses}>
          {label}
        </label>
      )}
      
      <div className={`flex items-center ${fullWidth ? 'w-full' : ''}`}>
        {showButtons && (
          <button
            type="button"
            onClick={handleDecrement}
            disabled={!canDecrement || disabled}
            className={`${buttonClasses(canDecrement)} rounded-l-lg`}
            aria-label="Decrease value"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
        )}
        
        <input
          ref={ref}
          type="text"
          inputMode={allowDecimal ? 'decimal' : 'numeric'}
          value={value}
          onChange={handleInputChange}
          onBlur={handleBlur}
          disabled={disabled}
          className={inputClasses}
          {...props}
        />
        
        {showButtons && (
          <button
            type="button"
            onClick={handleIncrement}
            disabled={!canIncrement || disabled}
            className={`${buttonClasses(canIncrement)} rounded-r-lg`}
            aria-label="Increase value"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </div>
      
      {(error || helperText) && (
        <p className={helperClasses}>
          {error || helperText}
        </p>
      )}
    </div>
  )
})

NumberInput.displayName = 'NumberInput'
