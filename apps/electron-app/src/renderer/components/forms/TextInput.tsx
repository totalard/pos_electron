import { InputHTMLAttributes, ReactNode, forwardRef } from 'react'
import { useAppStore } from '../../stores'

/**
 * TextInput component props
 */
export interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Label text */
  label?: string
  /** Error message */
  error?: string
  /** Helper text */
  helperText?: string
  /** Icon to display before input */
  icon?: ReactNode
  /** Icon to display after input */
  iconAfter?: ReactNode
  /** Full width input */
  fullWidth?: boolean
  /** Required field */
  required?: boolean
}

/**
 * Touch-optimized TextInput component with minimum 44x44px touch target.
 * 
 * Features:
 * - Touch-safe size (44x44px minimum)
 * - Icon support (before/after)
 * - Label and helper text
 * - Error state
 * - Keyboard accessible
 * 
 * @example
 * ```tsx
 * <TextInput
 *   label="Email"
 *   type="email"
 *   placeholder="Enter your email"
 *   error={errors.email}
 *   required
 * />
 * ```
 */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(({
  label,
  error,
  helperText,
  icon,
  iconAfter,
  fullWidth = true,
  required = false,
  className = '',
  ...props
}, ref) => {
  const { theme } = useAppStore()

  const inputClasses = `
    px-4 py-3 rounded-lg text-base
    min-h-[44px]
    transition-colors duration-200
    ${theme === 'dark'
      ? 'bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:border-primary-500'
      : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-primary-500'
    }
    focus:outline-none focus:ring-2 focus:ring-primary-500/20
    disabled:opacity-50 disabled:cursor-not-allowed
    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
    ${icon ? 'pl-12' : ''}
    ${iconAfter ? 'pr-12' : ''}
    ${fullWidth ? 'w-full' : ''}
    ${className}
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
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={inputClasses}
          {...props}
        />
        {iconAfter && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            {iconAfter}
          </div>
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

TextInput.displayName = 'TextInput'
