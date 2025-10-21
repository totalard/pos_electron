import { InputHTMLAttributes, ReactNode } from 'react'
import { useAppStore } from '../../stores'

/**
 * Radio option type
 */
export interface RadioOption<T = string | number> {
  value: T
  label: string
  description?: string
  icon?: ReactNode
  disabled?: boolean
}

/**
 * Radio component props
 */
export interface RadioProps<T = string | number> {
  /** Label for the radio group */
  label?: string
  /** Current selected value */
  value: T
  /** Options array */
  options: RadioOption<T>[]
  /** Change handler */
  onChange: (value: T) => void
  /** Error message */
  error?: string
  /** Helper text */
  helperText?: string
  /** Layout direction */
  direction?: 'vertical' | 'horizontal'
  /** Name attribute for radio group */
  name: string
  /** Disabled state */
  disabled?: boolean
  /** Required field */
  required?: boolean
}

/**
 * Touch-safe Radio button group component with minimum 44x44px touch targets.
 * 
 * Features:
 * - Touch-optimized size (44x44px minimum)
 * - Vertical or horizontal layout
 * - Icons and descriptions
 * - Keyboard accessible
 * - Individual option disable
 * 
 * @example
 * ```tsx
 * <Radio
 *   label="Payment Method"
 *   name="payment"
 *   value={paymentMethod}
 *   options={[
 *     { value: 'cash', label: 'Cash', description: 'Pay with cash' },
 *     { value: 'card', label: 'Card', description: 'Pay with card' }
 *   ]}
 *   onChange={setPaymentMethod}
 * />
 * ```
 */
export function Radio<T = string | number>({
  label,
  value,
  options,
  onChange,
  error,
  helperText,
  direction = 'vertical',
  name,
  disabled = false,
  required = false
}: RadioProps<T>) {
  const { theme } = useAppStore()

  const handleChange = (optionValue: T) => {
    if (!disabled) {
      onChange(optionValue)
    }
  }

  const labelClasses = `
    block text-sm font-medium mb-3
    ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
    ${error ? 'text-red-500' : ''}
  `

  const helperClasses = `
    mt-2 text-xs
    ${error
      ? theme === 'dark' ? 'text-red-400' : 'text-red-600'
      : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
    }
  `

  const radioCircleClasses = (isSelected: boolean, isDisabled: boolean) => `
    w-5 h-5 rounded-full border-2 flex items-center justify-center
    transition-all duration-200
    ${isSelected
      ? 'bg-primary-500 border-primary-500'
      : theme === 'dark'
        ? 'bg-gray-800 border-gray-600 hover:border-gray-500'
        : 'bg-white border-gray-300 hover:border-gray-400'
    }
    ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${error ? 'border-red-500' : ''}
  `

  const optionClasses = (isSelected: boolean, isDisabled: boolean) => `
    flex items-start gap-3 p-3 rounded-lg
    min-h-[44px]
    transition-colors duration-200
    ${isSelected
      ? theme === 'dark'
        ? 'bg-primary-900/30 border-2 border-primary-500'
        : 'bg-primary-50 border-2 border-primary-500'
      : theme === 'dark'
        ? 'bg-gray-800/50 border-2 border-gray-700 hover:border-gray-600'
        : 'bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
    }
    ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
  `

  const optionLabelClasses = (isDisabled: boolean) => `
    block text-base font-medium
    ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
    ${isDisabled ? 'opacity-50' : ''}
  `

  const optionDescriptionClasses = (isDisabled: boolean) => `
    text-sm mt-0.5
    ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
    ${isDisabled ? 'opacity-50' : ''}
  `

  return (
    <div>
      {label && (
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div
        className={`
          ${direction === 'horizontal' ? 'flex flex-wrap gap-3' : 'space-y-2'}
        `}
        role="radiogroup"
        aria-label={label}
      >
        {options.map((option) => {
          const isSelected = option.value === value
          const isDisabled = disabled || option.disabled || false

          return (
            <label
              key={String(option.value)}
              className={optionClasses(isSelected, isDisabled)}
            >
              {/* Hidden native radio for accessibility */}
              <input
                type="radio"
                name={name}
                value={String(option.value)}
                checked={isSelected}
                onChange={() => handleChange(option.value)}
                disabled={isDisabled}
                className="sr-only"
              />
              
              {/* Custom radio circle */}
              <div className="flex-shrink-0 pt-0.5">
                <div className={radioCircleClasses(isSelected, isDisabled)}>
                  {isSelected && (
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  )}
                </div>
              </div>
              
              {/* Icon */}
              {option.icon && (
                <div className="flex-shrink-0 pt-0.5">
                  {option.icon}
                </div>
              )}
              
              {/* Label and description */}
              <div className="flex-1 min-w-0">
                <span className={optionLabelClasses(isDisabled)}>
                  {option.label}
                </span>
                {option.description && (
                  <p className={optionDescriptionClasses(isDisabled)}>
                    {option.description}
                  </p>
                )}
              </div>
            </label>
          )
        })}
      </div>
      
      {(error || helperText) && (
        <p className={helperClasses}>
          {error || helperText}
        </p>
      )}
    </div>
  )
}

Radio.displayName = 'Radio'
