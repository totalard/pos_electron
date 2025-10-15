import { useState } from 'react'
import { useAppStore, usePinStore } from '../stores'

interface UserProfileMenuProps {
  onNavigate?: (screen: 'settings') => void
  onLogout?: () => void
}

export function UserProfileMenu({ onNavigate, onLogout }: UserProfileMenuProps) {
  const { theme, toggleTheme } = useAppStore()
  const { currentUser } = usePinStore()
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setShowProfileMenu(!showProfileMenu)}
        className={`
          w-10 h-10 rounded-full flex items-center justify-center
          ${theme === 'dark'
            ? 'bg-primary-600 hover:bg-primary-700'
            : 'bg-primary-500 hover:bg-primary-600'
          }
          transition-colors
        `}
        title="User Profile"
      >
        <span className="text-white text-sm font-bold">
          {currentUser?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
        </span>
      </button>

      {/* Dropdown Menu */}
      {showProfileMenu && (
        <>
          {/* Backdrop to close menu */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowProfileMenu(false)}
          />

          {/* Menu */}
          <div className={`
            absolute right-0 mt-2 w-64 rounded-lg shadow-lg z-20
            ${theme === 'dark'
              ? 'bg-gray-800 border border-gray-700'
              : 'bg-white border border-gray-200'
            }
          `}>
            {/* User Info Section */}
            <div className={`
              px-4 py-3 border-b
              ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
            `}>
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {currentUser?.full_name || 'User'}
              </p>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {currentUser?.role === 'primary' ? 'Primary User' : 'Staff'}
              </p>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => {
                  toggleTheme()
                  setShowProfileMenu(false)
                }}
                className={`
                  w-full px-4 py-2 flex items-center gap-3 transition-colors
                  ${theme === 'dark'
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-700'
                  }
                `}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {theme === 'dark' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  )}
                </svg>
                <span className="text-sm">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>

              {/* Settings */}
              {onNavigate && (
                <button
                  onClick={() => {
                    setShowProfileMenu(false)
                    onNavigate('settings')
                  }}
                  className={`
                    w-full px-4 py-2 flex items-center gap-3 transition-colors
                    ${theme === 'dark'
                      ? 'hover:bg-gray-700 text-gray-300'
                      : 'hover:bg-gray-100 text-gray-700'
                    }
                  `}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm">Settings</span>
                </button>
              )}

              {/* Divider */}
              <div className={`my-2 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`} />

              {/* Logout */}
              {onLogout && (
                <button
                  onClick={() => {
                    setShowProfileMenu(false)
                    onLogout()
                  }}
                  className={`
                    w-full px-4 py-2 flex items-center gap-3 transition-colors
                    ${theme === 'dark'
                      ? 'hover:bg-red-900/30 text-red-400'
                      : 'hover:bg-red-50 text-red-600'
                    }
                  `}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="text-sm font-medium">Logout</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

