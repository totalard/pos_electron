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
}

/**
 * Reusable Toggle switch component with consistent styling
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
  className = '',
  ...props
}: ToggleProps) {
  const { theme } = useAppStore()

  const handleClick = () => {
    if (!disabled) {
      onChange(!checked)
    }
  }

  const toggleClasses = `
    relative inline-flex h-8 w-14 items-center rounded-full
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-primary-500/20
    ${checked ? 'bg-primary-500' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
  `

  const circleClasses = `
    inline-block h-6 w-6 transform rounded-full bg-white
    transition-transform duration-200
    ${checked ? 'translate-x-7' : 'translate-x-1'}
  `

  if (label || description) {
    return (
      <div className={`flex items-center justify-between min-h-[44px] gap-4 ${className}`}>
        <div className="flex-1">
          {label && (
            <label className={`
              text-sm font-medium block
              ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
              ${disabled ? 'opacity-50' : ''}
            `}>
              {label}
            </label>
          )}
          {description && (
            <p className={`
              text-xs mt-1
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
      aria-checked={checked}
      aria-label="Toggle"
      {...props}
    >
      <span className={circleClasses} />
    </button>
  )
}

