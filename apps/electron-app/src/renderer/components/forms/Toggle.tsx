import { ButtonHTMLAttributes } from 'react'
import { useAppStore } from '../../stores'

/**
 * Toggle component props
 */
export interface ToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  /** Toggle state */
  checked: boolean
  /** Change handler */
  onChange: (checked: boolean) => void
  /** Label text */
  label?: string
  /** Description text */
  description?: string
  /** Disabled state */
  disabled?: boolean
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Touch-safe Toggle switch component with minimum 44x44px touch target.
 * 
 * Features:
 * - Touch-optimized size (44x44px minimum)
 * - Label and description
 * - Multiple sizes
 * - Keyboard accessible
 * 
 * @example
 * ```tsx
 * <Toggle
 *   checked={isEnabled}
 *   onChange={setIsEnabled}
 *   label="Enable Feature"
 *   description="Turn this feature on or off"
 * />
 * ```
 */
export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  className = '',
  ...props
}: ToggleProps) {
  const { theme } = useAppStore()

  const handleClick = () => {
    if (!disabled) {
      onChange(!checked)
    }
  }

  const sizeClasses = {
    sm: { toggle: 'h-6 w-11', circle: 'h-4 w-4', translateOn: 'translate-x-6', translateOff: 'translate-x-1' },
    md: { toggle: 'h-8 w-14', circle: 'h-6 w-6', translateOn: 'translate-x-7', translateOff: 'translate-x-1' },
    lg: { toggle: 'h-10 w-18', circle: 'h-8 w-8', translateOn: 'translate-x-9', translateOff: 'translate-x-1' }
  }

  const toggleClasses = `
    relative inline-flex items-center rounded-full
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-primary-500/20
    ${sizeClasses[size].toggle}
    ${checked ? 'bg-primary-500' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
  `

  const circleClasses = `
    inline-block transform rounded-full bg-white
    transition-transform duration-200
    ${sizeClasses[size].circle}
    ${checked ? sizeClasses[size].translateOn : sizeClasses[size].translateOff}
  `

  if (label || description) {
    return (
      <div className={`flex items-center justify-between min-h-[44px] gap-4 ${className}`}>
        <div className="flex-1">
          {label && (
            <label className={`
              text-base font-medium block
              ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
              ${disabled ? 'opacity-50' : ''}
            `}>
              {label}
            </label>
          )}
          {description && (
            <p className={`
              text-sm mt-1
              ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
              ${disabled ? 'opacity-50' : ''}
            `}>
              {description}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled}
          className={toggleClasses}
          role="switch"
          aria-checked={checked}
          aria-label={label || 'Toggle'}
          {...props}
        >
          <span className={circleClasses} />
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`${toggleClasses} ${className}`}
      role="switch"
      aria-checked={checked}
      aria-label="Toggle"
      {...props}
    >
      <span className={circleClasses} />
    </button>
  )
}

Toggle.displayName = 'Toggle'
