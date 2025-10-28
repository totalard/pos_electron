import { useState, useEffect } from 'react'
import { FeatureCarousel } from './FeatureCarousel'
import { PinEntryPanel } from './PinEntryPanel'
import { usePinStore } from '../stores'
import { useAppStore } from '../stores'
import { authAPI, type User } from '../services/api'
import { Avatar, LoadingSpinner, Button } from './common'
import { ThemeToggle } from './common/ThemeToggle'

interface LoginProps {
  onAuthenticated?: () => void
}

/**
 * Login component - User authentication screen with PIN entry
 * Features split-screen layout with feature carousel and user selection/PIN entry
 * Supports touch-safe UI with minimum 44x44px touch targets
 */

export function Login({ onAuthenticated }: LoginProps) {
  const { theme } = useAppStore()
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [userLoadError, setUserLoadError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const {
    pin,
    isAuthenticated,
    isLoading,
    error,
    attempts,
    maxAttempts,
    addDigit,
    removeDigit,
    clearPin,
    submitPin
  } = usePinStore()

  // Load users on mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoadingUsers(true)
        setUserLoadError(null)
        
        const fetchedUsers = await authAPI.getAllUsers()
        if (fetchedUsers && Array.isArray(fetchedUsers)) {
          setUsers(fetchedUsers.filter((u: User) => u.is_active))
        }
      } catch (err) {
        // Error modal will be shown automatically by global error handler
        // Just update local state for UI feedback
        console.error('Failed to load users:', err)
      } finally {
        setIsLoadingUsers(false)
      }
    }

    loadUsers()
  }, [])

  // Call onAuthenticated when authentication succeeds
  useEffect(() => {
    if (isAuthenticated && onAuthenticated) {
      setShowSuccess(true)
      setTimeout(() => {
        onAuthenticated()
      }, 600)
    }
  }, [isAuthenticated, onAuthenticated])

  // Reset PIN when user changes
  useEffect(() => {
    clearPin()
  }, [selectedUser, clearPin])

  const handleUserSelect = (user: User) => {
    setSelectedUser(user)
    clearPin()
  }

  const handleBackToUserSelection = () => {
    setSelectedUser(null)
    clearPin()
  }

  const remainingAttempts = maxAttempts - attempts

  // Get avatar color based on user's avatar_color or user ID
  const getAvatarColor = (user: User): 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'cyan' | 'indigo' | 'red' | 'teal' | 'amber' => {
    if (user.avatar_color) {
      return user.avatar_color as any
    }
    const colors: Array<'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'cyan' | 'indigo' | 'red' | 'teal' | 'amber'> = [
      'blue', 'green', 'purple', 'pink', 'orange', 'red', 'indigo', 'teal'
    ]
    return colors[user.id % colors.length]
  }

  return (
    <div className={`h-screen w-screen flex overflow-hidden ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Left Side - Feature Carousel (1/3 width) */}
      <div className="hidden lg:flex lg:w-1/3 w-full h-full">
        <FeatureCarousel />
      </div>

      {/* Right Side - User Selection / PIN Entry (2/3 width) */}
      <div className={`
        w-full lg:w-2/3 flex items-center justify-center overflow-hidden relative
        transition-colors duration-300
        ${theme === 'dark'
          ? 'bg-gray-900'
          : 'bg-white'
        }
      `}>
        {/* Theme Toggle - Top Right Corner */}
        <div className="absolute top-8 right-8 z-50 animate-smooth-fade-in">
          <ThemeToggle size="md" className="rounded-lg p-2 hover:scale-105 active:scale-95 transition-all duration-200" />
        </div>

        <div className="w-full max-w-md px-8 py-12 relative z-10">
          {/* Loading State */}
          {isLoadingUsers && (
            <div className="flex flex-col items-center justify-center min-h-96">
              <LoadingSpinner size="xl" centered />
              <p className={`
                mt-6 text-sm font-medium
                ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
              `}>
                Loading users...
              </p>
            </div>
          )}

          {/* Error Loading Users */}
          {userLoadError && !isLoadingUsers && (
            <div className="text-center">
              <div className={`
                rounded-2xl p-6 mb-6 backdrop-blur-xl border
                ${theme === 'dark'
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-red-50/80 border-red-200'
                }
              `}>
                <svg className={`w-12 h-12 mx-auto mb-3 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2M7.08 6.47A9.002 9.002 0 1 1 3.5 12.5" />
                </svg>
                <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-red-300' : 'text-red-800'}`}>
                  Connection Error
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-red-300/80' : 'text-red-700'}`}>
                  {userLoadError}
                </p>
              </div>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          )}

          {/* User Selection Screen */}
          {!isLoadingUsers && !userLoadError && !selectedUser && (
            <div className="animate-smooth-fade-in">
              <div className="text-center mb-12">
                <h1 className={`
                  text-5xl font-bold mb-4 tracking-tight
                  ${theme === 'dark'
                    ? 'text-white'
                    : 'text-gray-900'
                  }
                `}>
                  Welcome Back
                </h1>
                <div className={`w-12 h-1 mx-auto mb-6 rounded-full ${theme === 'dark' ? 'bg-blue-500' : 'bg-blue-500'}`} />
                <p className={`
                  text-lg font-medium
                  ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                `}>
                  Select your account to continue
                </p>
              </div>

              {/* User Grid - Touch-safe with minimum 44x44px targets */}
              <div className={`grid gap-6 mb-8 ${users.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' : 'grid-cols-2'}`}>
                {users.map((user, index) => (
                  <button
                    key={user.id}
                    onClick={() => handleUserSelect(user)}
                    className={`
                      group flex flex-col items-center p-8 rounded-xl
                      border transition-all duration-200
                      hover:scale-[1.02] active:scale-[0.98]
                      min-h-[200px] justify-center
                      animate-smooth-scale-in
                      ${theme === 'dark'
                        ? 'bg-gray-800 border-gray-700 hover:border-blue-600'
                        : 'bg-white border-gray-200 hover:border-blue-500'
                      }
                    `}
                    style={{ animationDelay: `${index * 100}ms` }}
                    aria-label={`Select user ${user.full_name}`}
                  >
                    {/* Avatar - Minimal */}
                    <div className="mb-4">
                      <Avatar
                        name={user.full_name}
                        color={getAvatarColor(user)}
                        size="xl"
                        className="group-hover:scale-105 group-active:scale-100 transition-transform duration-200"
                      />
                    </div>

                    {/* Name */}
                    <span className={`
                      text-base font-semibold mb-3 text-center
                      ${theme === 'dark'
                        ? 'text-white group-hover:text-blue-400'
                        : 'text-gray-900 group-hover:text-blue-600'
                      }
                      transition-colors duration-200
                    `}>
                      {user.full_name}
                    </span>

                    {/* Role Badge */}
                    <span className={`
                      px-3 py-1.5 text-xs font-semibold rounded-lg
                      transition-all duration-200
                      ${user.role === 'admin'
                        ? theme === 'dark'
                          ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                          : 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                        : theme === 'dark'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          : 'bg-blue-100 text-blue-700 border border-blue-300'
                      }
                    `}>
                      {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                    </span>
                  </button>
                ))}
              </div>

              {/* No Users Message */}
              {users.length === 0 && (
                <div className={`
                  text-center py-12 rounded-2xl
                  ${theme === 'dark'
                    ? 'bg-gray-800/30'
                    : 'bg-gray-100/30'
                  }
                `}>
                  <p className={`
                    text-lg
                    ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                  `}>
                    No active users found
                  </p>
                </div>
              )}
            </div>
          )}

          {/* PIN Entry Screen */}
          {!isLoadingUsers && !userLoadError && selectedUser && (
            <div className="animate-smooth-fade-in">
              {/* Back Button - Touch-safe with minimum 44x44px */}
              <button
                onClick={handleBackToUserSelection}
                className={`
                  mb-8 px-4 py-3 min-h-[44px] flex items-center gap-2
                  rounded-lg transition-all duration-200
                  group hover:scale-[1.02] active:scale-[0.98]
                  ${theme === 'dark'
                    ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
                aria-label="Back to user selection"
              >
                <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-medium">Back</span>
              </button>

              {/* User Info Card - Minimal */}
              <div className={`
                text-center mb-10 p-6 rounded-xl
                border
                ${theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
                }
              `}>
                <div className="w-16 h-16 mx-auto mb-4">
                  <Avatar
                    name={selectedUser.full_name}
                    color={getAvatarColor(selectedUser)}
                    size="lg"
                  />
                </div>
                <h2 className={`
                  text-2xl font-bold mb-2
                  ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
                `}>
                  {selectedUser.full_name}
                </h2>
                <p className={`
                  text-base font-medium
                  ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                `}>
                  Enter your 6-digit PIN
                </p>
              </div>

              {/* PIN Entry Panel */}
              <PinEntryPanel
                pin={pin}
                onDigitAdd={addDigit}
                onBackspace={removeDigit}
                onClear={clearPin}
                onSubmit={submitPin}
                disabled={showSuccess}
                isLoading={isLoading}
                error={error || undefined}
                attempts={attempts}
                maxAttempts={maxAttempts}
                title=""
                subtitle=""
                showKeypad={true}
              />

              {/* Success Overlay */}
              {showSuccess && (
                <div className={`
                  fixed inset-0 flex items-center justify-center z-50
                  ${theme === 'dark' ? 'bg-black/50' : 'bg-white/50'}
                `}>
                  <div className={`
                    animate-smooth-scale-in flex flex-col items-center justify-center
                    rounded-2xl p-8 border
                    ${theme === 'dark'
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-white border-gray-200'
                    }
                  `}>
                    <div className={`
                      w-16 h-16 rounded-full flex items-center justify-center mb-4
                      bg-green-500
                    `}>
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                      Authentication Successful!
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

