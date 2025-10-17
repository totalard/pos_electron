import { HTMLAttributes, ReactNode } from 'react'
import { useAppStore } from '../../stores'

/**
 * Badge component props
 */
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Badge variant */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
  /** Badge size */
  size?: 'sm' | 'md' | 'lg'
  /** Children content */
  children: ReactNode
}

/**
 * Reusable Badge component for status indicators and labels
 * 
 * @example
 * ```tsx
 * <Badge variant="success">ACTIVE</Badge>
 * <Badge variant="danger">INACTIVE</Badge>
 * ```
 */
export function Badge({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: BadgeProps) {
  const { theme } = useAppStore()

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  }

  const variantClasses = {
    primary: theme === 'dark'
      ? 'bg-primary-500/20 text-primary-400'
      : 'bg-primary-100 text-primary-600',
    secondary: theme === 'dark'
      ? 'bg-gray-600 text-gray-300'
      : 'bg-gray-100 text-gray-600',
    success: theme === 'dark'
      ? 'bg-green-500/20 text-green-400'
      : 'bg-green-100 text-green-600',
    warning: theme === 'dark'
      ? 'bg-amber-500/20 text-amber-400'
      : 'bg-amber-100 text-amber-600',
    danger: theme === 'dark'
      ? 'bg-red-500/20 text-red-400'
      : 'bg-red-100 text-red-600',
    info: theme === 'dark'
      ? 'bg-blue-500/20 text-blue-400'
      : 'bg-blue-100 text-blue-600'
  }

  const baseClasses = `
    inline-flex items-center justify-center
    rounded font-medium
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `

  return (
    <span className={baseClasses} {...props}>
      {children}
    </span>
  )
}

