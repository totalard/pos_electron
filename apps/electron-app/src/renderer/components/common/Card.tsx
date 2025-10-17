import { HTMLAttributes, ReactNode } from 'react'
import { useAppStore } from '../../stores'

/**
 * Card component props
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Card variant */
  variant?: 'default' | 'bordered' | 'elevated'
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg'
  /** Hover effect */
  hoverable?: boolean
  /** Children content */
  children: ReactNode
}

/**
 * Reusable Card component with consistent styling
 * 
 * @example
 * ```tsx
 * <Card variant="elevated" hoverable>
 *   <h3>Card Title</h3>
 *   <p>Card content</p>
 * </Card>
 * ```
 */
export function Card({
  variant = 'default',
  padding = 'md',
  hoverable = false,
  className = '',
  children,
  ...props
}: CardProps) {
  const { theme } = useAppStore()

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  const variantClasses = {
    default: theme === 'dark'
      ? 'bg-gray-800/50 border border-gray-700'
      : 'bg-white border border-gray-200',
    bordered: theme === 'dark'
      ? 'bg-gray-800/30 border-2 border-gray-600'
      : 'bg-white border-2 border-gray-300',
    elevated: theme === 'dark'
      ? 'bg-gray-800 border border-gray-700 shadow-lg shadow-gray-900/50'
      : 'bg-white border border-gray-200 shadow-lg'
  }

  const hoverClasses = hoverable
    ? theme === 'dark'
      ? 'hover:border-gray-600 hover:shadow-xl transition-all duration-200 cursor-pointer'
      : 'hover:border-gray-300 hover:shadow-xl transition-all duration-200 cursor-pointer'
    : ''

  const baseClasses = `
    rounded-xl
    ${paddingClasses[padding]}
    ${variantClasses[variant]}
    ${hoverClasses}
    ${className}
  `

  return (
    <div className={baseClasses} {...props}>
      {children}
    </div>
  )
}

