import { HTMLAttributes } from 'react'
import { useAppStore } from '../../stores'

/**
 * LoadingSpinner component props
 */
export interface LoadingSpinnerProps extends HTMLAttributes<HTMLDivElement> {
  /** Spinner size */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Center the spinner */
  centered?: boolean
  /** Loading text */
  text?: string
}

/**
 * Reusable LoadingSpinner component with consistent styling
 * 
 * @example
 * ```tsx
 * <LoadingSpinner size="lg" centered text="Loading..." />
 * ```
 */
export function LoadingSpinner({
  size = 'md',
  centered = false,
  text,
  className = '',
  ...props
}: LoadingSpinnerProps) {
  const { theme } = useAppStore()

  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-2',
    xl: 'h-16 w-16 border-3'
  }

  const spinnerClasses = `
    animate-spin rounded-full border-b-transparent
    ${sizeClasses[size]}
    ${theme === 'dark' ? 'border-primary-400' : 'border-primary-600'}
  `

  const containerClasses = `
    ${centered ? 'flex flex-col items-center justify-center' : 'inline-flex items-center gap-3'}
    ${className}
  `

  return (
    <div className={containerClasses} {...props}>
      <div className={spinnerClasses} />
      {text && (
        <p className={`
          text-sm
          ${centered ? 'mt-3' : ''}
          ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
        `}>
          {text}
        </p>
      )}
    </div>
  )
}

