
import { InputHTMLAttributes, ReactNode, forwardRef } from 'react'
import { useAppStore } from '../../stores'

/**
 * Checkbox component props
 */
export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'size'> {
  /** Label text */
  label?: string
  /** Description text */
  description?: string
  /** Checked state */
  checked: boolean
  /** Change handler */
  onChange: (checked: boolean) => void
  /** Error message */
  error?: string
  /** Indeterminate state (for "select all" scenarios) */
  indeterminate?: boolean
  /** Custom icon when checked */
  checkedIcon?: ReactNode
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Touch-safe Checkbox component with minimum 44x44px touch target.
 * 
 * Features:
 * - Touch-optimized size (44x44px minimum)
 * - Indeterminate state support
 * - Custom icons
 * - Label and description
 * - Keyboard accessible
 * 
 * @example
 * ```tsx
 * <Checkbox
 *   label="Accept terms"
 *   description="I agree to the terms and conditions"
 *   checked={accepted}
 *   onChange={setAccepted}
 * />
 * ```
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  description,
  checked,
  onChange,
  error,
  indeterminate = false,
  checkedIcon,
  size = 'md',
  disabled = false,
  className = '',
  ...props
}, ref) => {
  const { theme } = useAppStore()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked)
  }

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const containerSizeClasses = {
    sm: 'min-h-[36px]',
    md: 'min-h-[44px]',
    lg: 'min-h-[52px]'
  }

  const checkboxClasses = `
    ${sizeClasses[size]}
    rounded border-2 flex items-center justify-center
    transition-all duration-200
    cursor-pointer
    ${checked || indeterminate
      ? 'bg-primary-500 border-primary-500'
      : theme === 'dark'
        ? 'bg-gray-800 border-gray-600 hover:border-gray-500'
        : 'bg-white border-gray-300 hover:border-gray-400'
    }
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${error ? 'border-red-500' : ''}
  `

  const labelClasses = `
    block text-base font-medium
    ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
    ${disabled ? 'opacity-50' : ''}
    ${error ? 'text-red-500' : ''}
  `

  const descriptionClasses = `
    text-sm mt-0.5
    ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
    ${disabled ? 'opacity-50' : ''}
  `

  const errorClasses = `
    text-xs mt-1
    ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}
  `

  return (
    <div className={className}>
      <label
        className={`
          flex items-start gap-3 cursor-pointer
          ${containerSizeClasses[size]}
          ${disabled ? 'cursor-not-allowed' : ''}
        `}
      >
        {/* Hidden native checkbox for accessibility */}
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
          {...props}
        />
        
        {/* Custom checkbox */}
        <div className="flex-shrink-0 pt-0.5">
          <div className={checkboxClasses}>
            {indeterminate ? (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
              </svg>
            ) : checked ? (
              checkedIcon || (
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )
            ) : null}
          </div>
        </div>
        
        {/* Label and description */}
        {(label || description) && (
          <div className="flex-1 min-w-0">
            {label && <span className={labelClasses}>{label}</span>}
            {description && <p className={descriptionClasses}>{description}</p>}
          </div>
        )}
      </label>
      
      {error && (
        <p className={errorClasses}>
          {error}
        </p>
      )}
    </div>
  )
})

Checkbox.displayName = 'Checkbox'
