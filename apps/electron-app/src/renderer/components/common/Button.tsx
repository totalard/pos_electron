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

  // Variant classes with theme support - Flat Design
  const variantClasses = {
    primary: theme === 'dark'
      ? 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white'
      : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white',
    secondary: theme === 'dark'
      ? 'bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-white border border-gray-600'
      : 'bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-900 border border-gray-200',
    danger: theme === 'dark'
      ? 'bg-red-600 hover:bg-red-500 active:bg-red-700 text-white'
      : 'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white',
    ghost: theme === 'dark'
      ? 'bg-transparent hover:bg-gray-800 active:bg-gray-700 text-gray-300 border border-gray-700'
      : 'bg-transparent hover:bg-gray-50 active:bg-gray-100 text-gray-700 border border-gray-300'
  }

  const baseClasses = `
    rounded-lg font-medium
    transition-all duration-200 ease-out
    hover:scale-[1.02] active:scale-[0.98]
    focus:outline-none focus:ring-2 focus:ring-offset-2
    ${variant === 'primary' ? 'focus:ring-blue-500/40' : 'focus:ring-gray-500/40'}
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
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
            animate-smooth-spin rounded-full h-5 w-5 border-2 border-transparent
            ${variant === 'primary' || variant === 'danger' ? 'border-t-white' : 'border-t-current'}
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

