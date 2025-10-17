import { ButtonHTMLAttributes, ReactNode } from 'react'
import { useAppStore } from '../../stores'

/**
 * IconButton component props
 */
export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon element */
  icon: ReactNode
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  /** Button size */
  size?: 'sm' | 'md' | 'lg'
  /** Tooltip/aria-label */
  label: string
}

/**
 * Reusable IconButton component for icon-only actions
 * 
 * @example
 * ```tsx
 * <IconButton
 *   icon={<TrashIcon />}
 *   variant="danger"
 *   label="Delete"
 *   onClick={handleDelete}
 * />
 * ```
 */
export function IconButton({
  icon,
  variant = 'ghost',
  size = 'md',
  label,
  className = '',
  ...props
}: IconButtonProps) {
  const { theme } = useAppStore()

  const sizeClasses = {
    sm: 'p-2 min-w-[44px] min-h-[44px]',
    md: 'p-3 min-w-[44px] min-h-[44px]',
    lg: 'p-4 min-w-[48px] min-h-[48px]'
  }

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
      ? 'bg-transparent hover:bg-gray-700 active:bg-gray-600 text-gray-300'
      : 'bg-transparent hover:bg-gray-100 active:bg-gray-200 text-gray-700'
  }

  const baseClasses = `
    rounded-lg
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    ${variant === 'primary' ? 'focus:ring-primary-500' : 'focus:ring-gray-500'}
    disabled:opacity-50 disabled:cursor-not-allowed
    flex items-center justify-center
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `

  return (
    <button
      className={baseClasses}
      aria-label={label}
      title={label}
      {...props}
    >
      {icon}
    </button>
  )
}

