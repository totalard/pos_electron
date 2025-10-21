import { useState, useEffect } from 'react'
import { useAppStore, usePinStore } from '../../stores'
import { ConfirmDialog } from './ConfirmDialog'

interface UserCardProps {
  onLogout?: () => void
  showLogoutButton?: boolean
}

export function UserCard({ onLogout, showLogoutButton = true }: UserCardProps) {
  const { theme } = useAppStore()
  const { currentUser } = usePinStore()
  const [timeElapsed, setTimeElapsed] = useState('')
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  useEffect(() => {
    if (!currentUser?.last_login) return

    const updateElapsedTime = () => {
      const loginTime = new Date(currentUser.last_login!)
      const now = new Date()
      const diffMs = now.getTime() - loginTime.getTime()
      
      const hours = Math.floor(diffMs / (1000 * 60 * 60))
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)

      if (hours > 0) {
        setTimeElapsed(`${hours}h ${minutes}m`)
      } else if (minutes > 0) {
        setTimeElapsed(`${minutes}m ${seconds}s`)
      } else {
        setTimeElapsed(`${seconds}s`)
      }
    }

    updateElapsedTime()
    const interval = setInterval(updateElapsedTime, 1000)

    return () => clearInterval(interval)
  }, [currentUser])

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true)
  }

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false)
    if (onLogout) {
      onLogout()
    }
  }

  if (!currentUser) return null

  return (
    <>
      <div className={`
        flex items-center gap-3 px-4 py-2 rounded-lg border
        ${theme === 'dark'
          ? 'bg-gray-700/50 border-gray-600'
          : 'bg-gray-100 border-gray-200'
        }
      `}>
        {/* User Avatar */}
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: currentUser.avatar_color || '#3B82F6' }}
        >
          {currentUser.full_name.charAt(0).toUpperCase()}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <p className={`
            text-sm font-medium truncate
            ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
          `}>
            {currentUser.full_name}
          </p>
          <p className={`
            text-xs truncate
            ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
          `}>
            {currentUser.role === 'admin' ? 'Administrator' : 'User'} • {timeElapsed}
          </p>
        </div>

        {/* Logout Button */}
        {showLogoutButton && (
          <button
            onClick={handleLogoutClick}
            className={`
              p-2 rounded-md transition-colors
              ${theme === 'dark'
                ? 'hover:bg-gray-600 text-gray-300 hover:text-white'
                : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
              }
            `}
            title="Logout"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        )}
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleConfirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout? Any unsaved changes will be lost."
        confirmText="Logout"
        variant="danger"
      />
    </>
  )
}
