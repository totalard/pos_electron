import { HTMLAttributes, ReactNode } from 'react'
import { useAppStore } from '../../stores'

/**
 * ErrorMessage component props
 */
export interface ErrorMessageProps extends HTMLAttributes<HTMLDivElement> {
  /** Error message text */
  message?: string
  /** Message type */
  type?: 'error' | 'warning' | 'success' | 'info'
  /** Show icon */
  showIcon?: boolean
  /** Custom icon */
  icon?: ReactNode
  /** Children content */
  children?: ReactNode
}

/**
 * Reusable ErrorMessage/Alert component with consistent styling
 * 
 * @example
 * ```tsx
 * <ErrorMessage type="error" message="Invalid credentials" />
 * <ErrorMessage type="success">Operation completed successfully</ErrorMessage>
 * ```
 */
export function ErrorMessage({
  message,
  type = 'error',
  showIcon = true,
  icon,
  className = '',
  children,
  ...props
}: ErrorMessageProps) {
  const { theme } = useAppStore()

  const typeStyles = {
    error: {
      light: 'bg-red-50 text-red-600 border-red-200',
      dark: 'bg-red-500/20 text-red-400 border-red-500/30',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    warning: {
      light: 'bg-amber-50 text-amber-600 border-amber-200',
      dark: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    success: {
      light: 'bg-green-50 text-green-600 border-green-200',
      dark: 'bg-green-500/20 text-green-400 border-green-500/30',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    info: {
      light: 'bg-blue-50 text-blue-600 border-blue-200',
      dark: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  }

  const style = typeStyles[type]
  const colorClass = theme === 'dark' ? style.dark : style.light

  const baseClasses = `
    p-4 rounded-lg border
    flex items-start gap-3
    ${colorClass}
    ${className}
  `

  return (
    <div className={baseClasses} {...props}>
      {showIcon && (
        <div className="flex-shrink-0 mt-0.5">
          {icon || style.icon}
        </div>
      )}
      <div className="flex-1">
        {message || children}
      </div>
    </div>
  )
}

