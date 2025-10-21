import { ButtonHTMLAttributes, ReactNode, useState } from 'react'
import { useAppStore } from '../../stores'

/**
 * Color variant types for POS action buttons
 * Unified professional color scheme for consistent UI
 */
export type POSActionButtonVariant = 
  | 'primary'    // Primary action (checkout)
  | 'secondary'  // Standard actions (most buttons)
  | 'success'    // Positive actions (cash in)
  | 'warning'    // Caution actions (park, drawer)
  | 'danger'     // Destructive actions (void, cash out)
  | 'neutral'    // Neutral actions (discount, email, etc.)

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
  /** Tooltip text (optional) */
  tooltip?: string
}

/**
 * Reusable POS Action Button component with consistent styling
 * 
 * Features:
 * - Square layout with icon on top, text on bottom
 * - Unified professional color scheme
 * - Smooth micro-interaction animations
 * - Ripple effect on click
 * - Touch-friendly sizing (min 80x80px)
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
  tooltip,
  onClick,
  ...props
}: POSActionButtonProps) {
  const { theme } = useAppStore()
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return
    
    // Create ripple effect
    const button = e.currentTarget
    const rect = button.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = Date.now()
    
    setRipples(prev => [...prev, { x, y, id }])
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id))
    }, 600)
    
    onClick?.(e)
  }

  // Square layout - touch-safe (min 80x80px for md)
  const sizeClasses = {
    sm: 'w-16 h-16 text-xs',
    md: 'w-20 h-20 text-xs',
    lg: 'w-24 h-24 text-sm'
  }

  // Icon size classes
  const iconSizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  // Unified professional variant classes with subtle theme support
  const variantClasses = {
    primary: theme === 'dark'
      ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500/30 shadow-blue-500/20'
      : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500/30 shadow-blue-500/20',
    
    secondary: theme === 'dark'
      ? 'bg-gray-700 hover:bg-gray-600 text-gray-100 border-gray-600/30 shadow-gray-600/20'
      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300/30 shadow-gray-400/20',
    
    success: theme === 'dark'
      ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500/30 shadow-emerald-500/20'
      : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500/30 shadow-emerald-500/20',
    
    warning: theme === 'dark'
      ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-500/30 shadow-amber-500/20'
      : 'bg-amber-600 hover:bg-amber-700 text-white border-amber-500/30 shadow-amber-500/20',
    
    danger: theme === 'dark'
      ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500/30 shadow-rose-500/20'
      : 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500/30 shadow-rose-500/20',
    
    neutral: theme === 'dark'
      ? 'bg-slate-700 hover:bg-slate-600 text-slate-100 border-slate-600/30 shadow-slate-600/20'
      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300/30 shadow-slate-400/20'
  }

  const baseClasses = `
    rounded-xl font-medium
    transition-all duration-300 ease-out
    transform hover:scale-105 hover:-translate-y-0.5 active:scale-95 active:translate-y-0
    hover:shadow-lg active:shadow-sm
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50
    disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0
    flex flex-col items-center justify-center gap-1
    border relative overflow-hidden
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
      title={tooltip || label}
      onClick={handleClick}
      {...props}
    >
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 animate-ping pointer-events-none"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
        />
      ))}

      {isLoading ? (
        <>
          <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${iconSizeClasses[size]}`} />
          <span className="font-semibold text-center mt-1">Loading</span>
        </>
      ) : (
        <>
          {/* Icon on top */}
          <span className={`flex-shrink-0 ${iconSizeClasses[size]} transition-transform duration-300 group-hover:scale-110`}>
            {icon}
          </span>
          
          {/* Label on bottom */}
          <span className="font-semibold leading-tight text-center px-1 break-words max-w-full">
            {label}
          </span>
          
          {/* Badge */}
          {badge !== undefined && badge > 0 && (
            <span className={`
              absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-xs font-bold
              ${theme === 'dark' ? 'bg-red-500 text-white' : 'bg-red-500 text-white'}
              shadow-lg
            `}>
              {badge}
            </span>
          )}
        </>
      )}
    </button>
  )
}
