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
    <div className="h-screen w-screen flex overflow-hidden bg-slate-950">
      {/* Left Side - Feature Carousel (1/3 width) */}
      <div className="hidden lg:flex lg:w-1/3 w-full h-full">
        <FeatureCarousel />
      </div>

      {/* Right Side - User Selection / PIN Entry (2/3 width) */}
      <div className={`
        w-full lg:w-2/3 flex items-center justify-center overflow-hidden relative
        transition-all duration-300
        ${theme === 'dark'
          ? 'bg-gradient-to-br from-slate-950 to-gray-950'
          : 'bg-gradient-to-br from-gray-50 to-blue-50'
        }
      `}>
        {/* Theme Toggle - Top Right Corner */}
        <div className="absolute top-6 right-6 z-50 animate-fade-in">
          <ThemeToggle size="md" className="backdrop-blur-xl bg-white/10 dark:bg-gray-800/30 rounded-full p-2 shadow-lg hover:scale-110 transition-transform" />
        </div>
        {/* Animated background gradients - Minimal */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`
            absolute -top-40 -right-40 w-80 h-80 rounded-full
            blur-3xl animate-float-slow
            ${theme === 'dark' ? 'bg-blue-600/15' : 'bg-blue-400/10'}
          `} />
          <div className={`
            absolute -bottom-40 -left-40 w-80 h-80 rounded-full
            blur-3xl animate-float-medium
            ${theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-300/8'}
          `} style={{ animationDelay: '1.5s' }} />
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
            <div className="animate-fade-in">
              <div className="text-center mb-12">
                <h1 className={`
                  text-6xl font-bold mb-3 tracking-tight
                  bg-gradient-to-r bg-clip-text text-transparent
                  ${theme === 'dark'
                    ? 'from-blue-400 to-blue-300'
                    : 'from-blue-600 to-blue-700'
                  }
                `}>
                  Welcome Back
                </h1>
                <div className={`w-16 h-1.5 mx-auto mb-4 rounded-full ${theme === 'dark' ? 'bg-blue-500' : 'bg-blue-500'}`} />
                <p className={`
                  text-xl font-medium
                  ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
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
                      group flex flex-col items-center p-8 rounded-2xl
                      backdrop-blur-xl border transition-all duration-300
                      transform hover:scale-105 active:scale-100
                      min-h-[200px] justify-center
                      animate-scale-in
                      ${theme === 'dark'
                        ? 'bg-gray-800/40 border-gray-700/50 hover:border-primary-500/50 active:border-primary-600/70 hover:shadow-2xl hover:shadow-primary-900/20'
                        : 'bg-white/40 border-white/60 hover:border-primary-400/50 active:border-primary-500/70 hover:shadow-2xl hover:shadow-primary-500/10'
                      }
                    `}
                    style={{ animationDelay: `${index * 100}ms` }}
                    aria-label={`Select user ${user.full_name}`}
                  >
                    {/* Avatar with Glow - Enhanced */}
                    <div className="relative mb-3">
                      <div className={`
                        absolute inset-0 rounded-full opacity-40 blur-lg
                        ${theme === 'dark'
                          ? 'bg-blue-600'
                          : 'bg-blue-500'
                        }
                        group-hover:opacity-60 transition-opacity duration-300
                      `} />
                      <Avatar
                        name={user.full_name}
                        color={getAvatarColor(user)}
                        size="xl"
                        className="relative shadow-xl group-hover:scale-110 group-active:scale-100 transition-transform duration-200"
                      />
                    </div>

                    {/* Name */}
                    <span className={`
                      text-base font-semibold mb-2 text-center
                      ${theme === 'dark'
                        ? 'text-gray-100 group-hover:text-primary-300'
                        : 'text-gray-900 group-hover:text-primary-600'
                      }
                      transition-colors
                    `}>
                      {user.full_name}
                    </span>

                    {/* Role Badge */}
                    <span className={`
                      px-3 py-1.5 text-xs font-semibold rounded-full
                      transition-all duration-300
                      ${user.role === 'admin'
                        ? theme === 'dark'
                          ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                          : 'bg-yellow-100/80 text-yellow-700 border border-yellow-300'
                        : theme === 'dark'
                          ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                          : 'bg-primary-100/80 text-primary-700 border border-primary-300'
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
            <div className="animate-fade-in">
              {/* Back Button - Touch-safe with minimum 44x44px */}
              <button
                onClick={handleBackToUserSelection}
                className={`
                  mb-8 px-4 py-3 min-h-[44px] flex items-center gap-2
                  rounded-xl transition-all duration-200
                  group
                  ${theme === 'dark'
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700/50 active:bg-gray-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 active:bg-gray-200'
                  }
                `}
                aria-label="Back to user selection"
              >
                <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-medium">Back</span>
              </button>

              {/* User Info Card - Enhanced */}
              <div className={`
                text-center mb-10 p-6 rounded-2xl
                backdrop-blur-xl border
                ${theme === 'dark'
                  ? 'bg-gray-800/40 border-gray-700/50'
                  : 'bg-white/70 border-white/80'
                }
              `}>
                <div className="relative min-w-[64px] min-h-[64px] w-16 h-16 mx-auto mb-4">
                  <div className={`
                    absolute inset-0 rounded-full opacity-40 blur-lg
                    ${theme === 'dark'
                      ? 'bg-blue-600'
                      : 'bg-blue-500'
                    }
                  `} />
                  <Avatar
                    name={selectedUser.full_name}
                    color={getAvatarColor(selectedUser)}
                    size="lg"
                    className="relative shadow-xl"
                  />
                </div>
                <h2 className={`
                  text-2xl font-bold mb-2
                  ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}
                `}>
                  {selectedUser.full_name}
                </h2>
                <p className={`
                  text-base font-medium
                  ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
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
                  fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50
                  ${theme === 'dark' ? 'bg-black/40' : 'bg-white/40'}
                `}>
                  <div className={`
                    animate-scale-in flex flex-col items-center justify-center
                    rounded-3xl p-8 backdrop-blur-xl border
                    ${theme === 'dark'
                      ? 'bg-gray-800/50 border-gray-700/50'
                      : 'bg-white/60 border-white/80'
                    }
                  `}>
                    <div className={`
                      w-16 h-16 rounded-full flex items-center justify-center mb-4
                      bg-gradient-to-br from-green-400 to-green-600 animate-icon-pulse
                    `}>
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-green-300' : 'text-green-600'}`}>
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

