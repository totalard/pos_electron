import { SelectHTMLAttributes, forwardRef } from 'react'
import { useAppStore } from '../../stores'

/**
 * Select component props
 */
export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /** Label text */
  label?: string
  /** Error message */
  error?: string
  /** Helper text */
  helperText?: string
  /** Full width select */
  fullWidth?: boolean
  /** Options array */
  options?: Array<{ value: string | number; label: string }>
}

/**
 * Reusable Select component with consistent styling
 * 
 * @example
 * ```tsx
 * <Select
 *   label="Country"
 *   options={[
 *     { value: 'us', label: 'United States' },
 *     { value: 'uk', label: 'United Kingdom' }
 *   ]}
 * />
 * ```
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  helperText,
  fullWidth = true,
  options,
  className = '',
  children,
  ...props
}, ref) => {
  const { theme } = useAppStore()

  const selectClasses = `
    px-4 py-3 rounded-lg text-base
    min-h-[44px]
    transition-colors duration-200
    ${theme === 'dark'
      ? 'bg-gray-800 border border-gray-600 text-white focus:border-primary-500'
      : 'bg-white border border-gray-300 text-gray-900 focus:border-primary-500'
    }
    focus:outline-none focus:ring-2 focus:ring-primary-500/20
    disabled:opacity-50 disabled:cursor-not-allowed
    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
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
        </label>
      )}
      <select
        ref={ref}
        className={selectClasses}
        {...props}
      >
        {options ? (
          options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))
        ) : (
          children
        )}
      </select>
      {(error || helperText) && (
        <p className={helperClasses}>
          {error || helperText}
        </p>
      )}
    </div>
  )
})

Select.displayName = 'Select'

