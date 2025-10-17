import { HTMLAttributes, ReactNode } from 'react'
import { useAppStore } from '../../stores'
import { IconButton } from '../common'

/**
 * PageHeader component props
 */
export interface PageHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Page title */
  title: string
  /** Page subtitle/description */
  subtitle?: string
  /** Icon element */
  icon?: ReactNode
  /** Action buttons */
  actions?: ReactNode
  /** Show back button */
  showBackButton?: boolean
  /** Back button handler */
  onBack?: () => void
  /** Gradient background */
  gradient?: boolean
}

/**
 * Reusable PageHeader component for consistent page headers
 * 
 * @example
 * ```tsx
 * <PageHeader
 *   title="Settings"
 *   subtitle="Configure your application"
 *   showBackButton
 *   onBack={() => navigate('dashboard')}
 *   actions={<Button>Save</Button>}
 * />
 * ```
 */
export function PageHeader({
  title,
  subtitle,
  icon,
  actions,
  showBackButton = false,
  onBack,
  gradient = false,
  className = '',
  ...props
}: PageHeaderProps) {
  const { theme } = useAppStore()

  const gradientClass = gradient
    ? theme === 'dark'
      ? 'bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800'
      : 'bg-gradient-to-r from-primary-50 via-white to-primary-50'
    : theme === 'dark'
      ? 'bg-gray-800/50'
      : 'bg-white'

  return (
    <header
      className={`
        px-6 py-4 border-b
        ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
        ${gradientClass}
        ${className}
      `}
      {...props}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left side: Back button + Icon + Title */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {showBackButton && onBack && (
            <IconButton
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              }
              label="Go back"
              onClick={onBack}
              variant="ghost"
            />
          )}

          {icon && (
            <div className={`
              flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center
              ${theme === 'dark'
                ? 'bg-gradient-to-br from-primary-600 to-primary-800'
                : 'bg-gradient-to-br from-primary-500 to-primary-700'
              }
            `}>
              <div className="text-white">
                {icon}
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h1 className={`
              text-2xl font-bold truncate
              ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
            `}>
              {title}
            </h1>
            {subtitle && (
              <p className={`
                text-sm truncate
                ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
              `}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right side: Actions */}
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </header>
  )
}

