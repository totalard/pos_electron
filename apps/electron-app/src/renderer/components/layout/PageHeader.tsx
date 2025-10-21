import { HTMLAttributes, ReactNode } from 'react'
import { useAppStore, usePinStore } from '../../stores'
import { IconButton, InternetStatusIndicator } from '../common'

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
  /** Show logout button */
  showLogout?: boolean
  /** Logout handler */
  onLogout?: () => void
  /** Show lock button */
  showLock?: boolean
  /** Lock handler */
  onLock?: () => void
  /** Show internet status */
  showInternetStatus?: boolean
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
  showLogout = false,
  onLogout,
  showLock = false,
  onLock,
  showInternetStatus = true,
  className = '',
  ...props
}: PageHeaderProps) {
  const { theme } = useAppStore()
  const { currentUser, reset } = usePinStore()

  const handleLogout = () => {
    reset()
    if (onLogout) {
      onLogout()
    }
  }

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
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Internet Status */}
          {showInternetStatus && (
            <InternetStatusIndicator showLabel={false} size="md" />
          )}

          {/* Lock Button */}
          {showLock && onLock && currentUser && (
            <IconButton
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
              label="Lock Screen"
              onClick={onLock}
              variant="ghost"
            />
          )}

          {/* Logout Button */}
          {showLogout && currentUser && (
            <IconButton
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              }
              label="Logout"
              onClick={handleLogout}
              variant="ghost"
            />
          )}

          {/* Custom Actions */}
          {actions}
        </div>
      </div>
    </header>
  )
}

