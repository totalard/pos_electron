import { TextareaHTMLAttributes, forwardRef } from 'react'
import { useAppStore } from '../../stores'

/**
 * TextArea component props
 */
export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Label text */
  label?: string
  /** Error message */
  error?: string
  /** Helper text */
  helperText?: string
  /** Full width textarea */
  fullWidth?: boolean
  /** Resize behavior */
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
}

/**
 * Reusable TextArea component with consistent styling
 * 
 * @example
 * ```tsx
 * <TextArea
 *   label="Description"
 *   placeholder="Enter description"
 *   rows={4}
 * />
 * ```
 */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({
  label,
  error,
  helperText,
  fullWidth = true,
  resize = 'vertical',
  className = '',
  ...props
}, ref) => {
  const { theme } = useAppStore()

  const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize'
  }

  const textareaClasses = `
    px-4 py-3 rounded-lg text-base
    min-h-[88px]
    transition-colors duration-200
    ${theme === 'dark'
      ? 'bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:border-primary-500'
      : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-primary-500'
    }
    focus:outline-none focus:ring-2 focus:ring-primary-500/20
    disabled:opacity-50 disabled:cursor-not-allowed
    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
    ${fullWidth ? 'w-full' : ''}
    ${resizeClasses[resize]}
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
      <textarea
        ref={ref}
        className={textareaClasses}
        {...props}
      />
      {(error || helperText) && (
        <p className={helperClasses}>
          {error || helperText}
        </p>
      )}
    </div>
  )
})

TextArea.displayName = 'TextArea'

