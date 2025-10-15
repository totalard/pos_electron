import { useState, useEffect } from 'react'
import { useAppStore, usePinStore } from '../stores'
import { UserProfileMenu } from './UserProfileMenu'

interface NavbarProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  onBack?: () => void
  onNavigate?: (screen: 'settings') => void
  onLogout?: () => void
  children?: React.ReactNode // For additional buttons/content in the center or right section
}

export function Navbar({ 
  title, 
  subtitle, 
  icon, 
  onBack, 
  onNavigate, 
  onLogout,
  children 
}: NavbarProps) {
  const { theme } = useAppStore()
  const { currentUser } = usePinStore()
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className={`
      border-b
      ${theme === 'dark'
        ? 'bg-gray-800/50 border-gray-700'
        : 'bg-white/80 border-gray-200'
      }
      backdrop-blur-sm
    `}>
      <div className="w-full px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Back Button and Title */}
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className={`
                  p-3 rounded-lg transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center
                  ${theme === 'dark'
                    ? 'hover:bg-gray-700/50 text-gray-300 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                  }
                `}
                title="Back"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            )}
            
            <div className="flex items-center gap-3">
              {icon && (
                <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center
                  ${theme === 'dark'
                    ? 'bg-gradient-to-br from-primary-600 to-primary-800'
                    : 'bg-gradient-to-br from-primary-500 to-primary-700'
                  }
                `}>
                  {icon}
                </div>
              )}
              <div>
                <h1 className={`
                  text-2xl font-bold
                  ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
                `}>
                  {title}
                </h1>
                {subtitle && (
                  <p className={`
                    text-sm
                    ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                  `}>
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Center Section - Custom Content */}
          {children && (
            <div className="flex-1 flex items-center justify-center max-w-2xl mx-8">
              {children}
            </div>
          )}

          {/* Right Section - System Status, User Info, Time, and Profile Menu */}
          <div className="flex items-center gap-6">
            {/* System Status */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                System Online
              </span>
            </div>

            {/* User Info */}
            <div className="text-right">
              <p className={`
                text-sm font-medium
                ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
              `}>
                {currentUser?.full_name || 'User'}
              </p>
              <p className={`
                text-xs
                ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
              `}>
                {currentUser?.role === 'primary' ? 'Primary User' : 'Staff'}
              </p>
            </div>

            {/* Time and Date */}
            <div className={`
              px-4 py-2 rounded-lg
              ${theme === 'dark'
                ? 'bg-gray-700/50 text-gray-300'
                : 'bg-gray-100 text-gray-700'
              }
            `}>
              <p className="text-sm font-mono">
                {currentTime.toLocaleTimeString()}
              </p>
              <p className="text-xs">
                {currentTime.toLocaleDateString()}
              </p>
            </div>

            {/* User Profile Menu */}
            <UserProfileMenu onNavigate={onNavigate} onLogout={onLogout} />
          </div>
        </div>
      </div>
    </header>
  )
}

