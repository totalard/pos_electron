import { ButtonHTMLAttributes, ReactNode } from 'react'
import { useAppStore } from '../../stores'

/**
 * Color variant types for POS action buttons
 */
export type POSActionButtonVariant = 
  | 'primary'    // Blue - default actions
  | 'secondary'  // Gray - neutral actions
  | 'success'    // Green - positive actions (cash in, complete)
  | 'warning'    // Yellow/Orange - caution actions (drawer, park)
  | 'danger'     // Red - destructive actions (void, cash out)
  | 'info'       // Cyan - informational actions (email, print)
  | 'purple'     // Purple - special actions (gift, loyalty)

/**
 * POSActionButton component props
 */
export interface POSActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button label */
  label: string
  /** Icon element */
  icon: ReactNode
  /** Color variant */
  variant?: POSActionButtonVariant
  /** Button size */
  size?: 'sm' | 'md' | 'lg'
  /** Full width button */
  fullWidth?: boolean
  /** Loading state */
  isLoading?: boolean
  /** Badge count (optional) */
  badge?: number
}

/**
 * Reusable POS Action Button component with consistent styling
 * 
 * Features:
 * - Multiple color variants for different action types
 * - Icon support with proper alignment
 * - Touch-friendly sizing (min 44x44px)
 * - Theme-aware design
 * - Optional badge for counts
 * - Loading state
 * 
 * @example
 * ```tsx
 * <POSActionButton
 *   label="Cash In"
 *   icon={<DollarIcon />}
 *   variant="success"
 *   onClick={handleCashIn}
 * />
 * ```
 */
export function POSActionButton({
  label,
  icon,
  variant = 'secondary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  badge,
  disabled,
  className = '',
  ...props
}: POSActionButtonProps) {
  const { theme } = useAppStore()

  // Size classes - all touch-safe (min 44x44px)
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[44px]',
    md: 'px-4 py-2.5 text-base min-h-[44px]',
    lg: 'px-6 py-3 text-lg min-h-[48px]'
  }

  // Icon size classes
  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  // Variant classes with theme support
  const variantClasses = {
    primary: theme === 'dark'
      ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white border-blue-500'
      : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white border-blue-400',
    
    secondary: theme === 'dark'
      ? 'bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-gray-200 border-gray-600'
      : 'bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-900 border-gray-300',
    
    success: theme === 'dark'
      ? 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white border-green-500'
      : 'bg-green-500 hover:bg-green-600 active:bg-green-700 text-white border-green-400',
    
    warning: theme === 'dark'
      ? 'bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white border-orange-500'
      : 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white border-orange-400',
    
    danger: theme === 'dark'
      ? 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white border-red-500'
      : 'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white border-red-400',
    
    info: theme === 'dark'
      ? 'bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 text-white border-cyan-500'
      : 'bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 text-white border-cyan-400',
    
    purple: theme === 'dark'
      ? 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white border-purple-500'
      : 'bg-purple-500 hover:bg-purple-600 active:bg-purple-700 text-white border-purple-400'
  }

  const baseClasses = `
    rounded-lg font-medium
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50
    disabled:opacity-50 disabled:cursor-not-allowed
    flex items-center justify-center gap-2
    border relative
    ${fullWidth ? 'w-full' : ''}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `

  return (
    <button
      className={baseClasses}
      disabled={disabled || isLoading}
      aria-label={label}
      {...props}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          <span className={`flex-shrink-0 ${iconSizeClasses[size]}`}>
            {icon}
          </span>
          <span className="truncate">{label}</span>
          {badge !== undefined && badge > 0 && (
            <span className={`
              ml-1 px-2 py-0.5 rounded-full text-xs font-bold
              ${theme === 'dark' ? 'bg-white/20' : 'bg-black/20'}
            `}>
              {badge}
            </span>
          )}
        </>
      )}
    </button>
  )
}
