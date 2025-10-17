import { ButtonHTMLAttributes, ReactNode } from 'react'
import { useAppStore } from '../../stores'

/**
 * Button component props
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant style */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  /** Button size */
  size?: 'sm' | 'md' | 'lg'
  /** Icon to display before text */
  icon?: ReactNode
  /** Icon to display after text */
  iconAfter?: ReactNode
  /** Full width button */
  fullWidth?: boolean
  /** Loading state */
  isLoading?: boolean
  /** Children content */
  children?: ReactNode
}

/**
 * Reusable Button component with consistent styling and touch-safe design
 * 
 * @example
 * ```tsx
 * <Button variant="primary" icon={<PlusIcon />} onClick={handleClick}>
 *   Add Item
 * </Button>
 * ```
 */
export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconAfter,
  fullWidth = false,
  isLoading = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const { theme } = useAppStore()

  // Size classes - all touch-safe (min 44x44px)
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm min-h-[44px]',
    md: 'px-6 py-3 text-base min-h-[44px]',
    lg: 'px-8 py-4 text-lg min-h-[48px]'
  }

  // Variant classes with theme support
  const variantClasses = {
    primary: theme === 'dark'
      ? 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white'
      : 'bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white',
    secondary: theme === 'dark'
      ? 'bg-gray-600 hover:bg-gray-500 active:bg-gray-700 text-white'
      : 'bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-900',
    danger: theme === 'dark'
      ? 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white'
      : 'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white',
    ghost: theme === 'dark'
      ? 'bg-transparent hover:bg-gray-700 active:bg-gray-600 text-gray-300 border border-gray-600'
      : 'bg-transparent hover:bg-gray-100 active:bg-gray-200 text-gray-700 border border-gray-300'
  }

  const baseClasses = `
    rounded-lg font-medium
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    ${variant === 'primary' ? 'focus:ring-primary-500' : 'focus:ring-gray-500'}
    disabled:opacity-50 disabled:cursor-not-allowed
    flex items-center justify-center gap-2
    ${fullWidth ? 'w-full' : ''}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `

  return (
    <button
      className={baseClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <div className={`
            animate-spin rounded-full h-5 w-5 border-b-2
            ${variant === 'primary' || variant === 'danger' ? 'border-white' : 'border-current'}
          `} />
          {children && <span>Loading...</span>}
        </>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children && <span>{children}</span>}
          {iconAfter && <span className="flex-shrink-0">{iconAfter}</span>}
        </>
      )}
    </button>
  )
}

