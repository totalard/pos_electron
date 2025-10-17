import { ReactNode } from 'react'
import { useAppStore } from '../../stores'

/**
 * FormField component props
 */
export interface FormFieldProps {
  /** Field label */
  label?: string
  /** Error message */
  error?: string
  /** Helper text */
  helperText?: string
  /** Required field indicator */
  required?: boolean
  /** Children (input element) */
  children: ReactNode
  /** Full width */
  fullWidth?: boolean
  /** Custom className */
  className?: string
}

/**
 * Reusable FormField wrapper component for consistent form layouts
 * 
 * @example
 * ```tsx
 * <FormField label="Email" required error={errors.email}>
 *   <input type="email" {...register('email')} />
 * </FormField>
 * ```
 */
export function FormField({
  label,
  error,
  helperText,
  required = false,
  children,
  fullWidth = true,
  className = ''
}: FormFieldProps) {
  const { theme } = useAppStore()

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
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {(error || helperText) && (
        <p className={helperClasses}>
          {error || helperText}
        </p>
      )}
    </div>
  )
}

