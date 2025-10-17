import { HTMLAttributes, ReactNode } from 'react'
import { useAppStore } from '../../stores'

/**
 * Panel component props
 */
export interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Panel title */
  title?: string
  /** Panel description */
  description?: string
  /** Header actions */
  actions?: ReactNode
  /** Children content */
  children: ReactNode
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

/**
 * Reusable Panel component for content sections
 * 
 * @example
 * ```tsx
 * <Panel
 *   title="User Settings"
 *   description="Manage your account settings"
 *   actions={<Button>Save</Button>}
 * >
 *   <FormContent />
 * </Panel>
 * ```
 */
export function Panel({
  title,
  description,
  actions,
  children,
  padding = 'md',
  className = '',
  ...props
}: PanelProps) {
  const { theme } = useAppStore()

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  return (
    <div
      className={`
        rounded-xl border
        ${theme === 'dark'
          ? 'bg-gray-800/50 border-gray-700'
          : 'bg-white border-gray-200'
        }
        ${className}
      `}
      {...props}
    >
      {(title || description || actions) && (
        <div className={`
          flex items-start justify-between gap-4 pb-4 border-b
          ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
          ${paddingClasses[padding]}
        `}>
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className={`
                text-lg font-semibold mb-1
                ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
              `}>
                {title}
              </h3>
            )}
            {description && (
              <p className={`
                text-sm
                ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
              `}>
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}
      <div className={paddingClasses[padding]}>
        {children}
      </div>
    </div>
  )
}

