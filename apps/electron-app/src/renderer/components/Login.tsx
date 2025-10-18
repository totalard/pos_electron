import { useState, useEffect } from 'react'
import { FeatureCarousel } from './FeatureCarousel'
import { NumericKeypad } from './NumericKeypad'
import { usePinStore } from '../stores'
import { authAPI, type User } from '../services/api'
import { Avatar, LoadingSpinner, ErrorMessage, Button } from './common'

interface LoginProps {
  onAuthenticated?: () => void
}

export function Login({ onAuthenticated }: LoginProps) {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [userLoadError, setUserLoadError] = useState<string | null>(null)

  const {
    pin,
    isAuthenticated,
    isLoading,
    error,
    attempts,
    maxAttempts,
    showPin,
    addDigit,
    removeDigit,
    clearPin,
    submitPin,
    toggleShowPin
  } = usePinStore()

  // Load users on mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoadingUsers(true)
        setUserLoadError(null)
        const fetchedUsers = await authAPI.getAllUsers()
        setUsers(fetchedUsers.filter(u => u.is_active))
      } catch (err) {
        console.error('Failed to load users:', err)
        setUserLoadError('Failed to load users. Please check backend connection.')
      } finally {
        setIsLoadingUsers(false)
      }
    }

    loadUsers()
  }, [])

  // Call onAuthenticated when authentication succeeds
  useEffect(() => {
    if (isAuthenticated && onAuthenticated) {
      onAuthenticated()
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
    <div className="h-screen w-screen flex overflow-hidden">
      {/* Left Side - Feature Carousel */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5">
        <FeatureCarousel />
      </div>

      {/* Right Side - User Selection / PIN Entry */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="w-full max-w-md px-8 py-12">
          {/* Loading State */}
          {isLoadingUsers && (
            <LoadingSpinner size="xl" centered text="Loading users..." />
          )}

          {/* Error Loading Users */}
          {userLoadError && !isLoadingUsers && (
            <div className="text-center">
              <ErrorMessage type="error" className="mb-6">
                <div className="mb-2 font-semibold">Connection Error</div>
                <p className="text-sm">{userLoadError}</p>
              </ErrorMessage>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          )}

          {/* User Selection Screen */}
          {!isLoadingUsers && !userLoadError && !selectedUser && (
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-12">
                Select your account to continue
              </p>

              {/* User Grid - Touch-safe with minimum 44x44px targets */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleUserSelect(user)}
                    className="group flex flex-col items-center p-8 rounded-2xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 active:border-primary-600 dark:active:border-primary-500 hover:shadow-lg active:shadow-md transition-all duration-150 transform hover:scale-105 active:scale-100 min-h-[200px] justify-center"
                    aria-label={`Select user ${user.full_name}`}
                  >
                    {/* Avatar - Touch-safe size */}
                    <Avatar
                      name={user.full_name}
                      color={getAvatarColor(user)}
                      size="2xl"
                      className="mb-4 shadow-lg group-hover:scale-110 group-active:scale-100 transition-transform duration-150"
                    />

                    {/* Name */}
                    <span className="text-base font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors text-center">
                      {user.full_name}
                    </span>

                    {/* Role Badge */}
                    <span className={`
                      mt-3 px-3 py-1.5 text-xs font-medium rounded-full
                      ${user.role === 'admin'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }
                    `}>
                      {user.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </button>
                ))}
              </div>

              {/* No Users Message */}
              {users.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No active users found</p>
                </div>
              )}
            </div>
          )}

          {/* PIN Entry Screen */}
          {!isLoadingUsers && !userLoadError && selectedUser && (
            <div>
              {/* Back Button - Touch-safe with minimum 44x44px */}
              <button
                onClick={handleBackToUserSelection}
                className="mb-6 px-4 py-3 min-h-[44px] flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white active:text-gray-800 dark:active:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 active:bg-gray-200 dark:active:bg-gray-600/50 rounded-lg transition-all duration-150"
                aria-label="Back to user selection"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>

              {/* User Info */}
              <div className="text-center mb-8">
                <Avatar
                  name={selectedUser.full_name}
                  color={getAvatarColor(selectedUser)}
                  size="2xl"
                  className="mb-4 shadow-xl mx-auto"
                />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {selectedUser.full_name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Enter your 6-digit PIN
                </p>
              </div>

              {/* PIN Display */}
              <div className="mb-8 max-w-sm mx-auto">
                <div className="flex justify-center items-center gap-4 mb-4 p-6 rounded-2xl bg-white/80 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 backdrop-blur-sm shadow-lg">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className={`
                        w-4 h-4 rounded-full transition-all duration-300
                        ${index < pin.length
                          ? 'bg-primary-600 dark:bg-primary-400 scale-110'
                          : 'bg-gray-200 dark:bg-gray-600 border-2 border-gray-300 dark:border-gray-500'
                        }
                      `}
                    />
                  ))}
                </div>

                {/* Show/Hide PIN Toggle */}
                <div className="flex justify-center">
                  <button
                    onClick={toggleShowPin}
                    disabled={isLoading}
                    className="text-sm px-4 py-2 rounded-lg transition-colors duration-200 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                  >
                    {showPin ? 'Hide PIN' : 'Show PIN'}
                  </button>
                </div>

                {/* PIN Value Display (when show is enabled) */}
                {showPin && pin && (
                  <div className="text-center mt-2 text-2xl font-mono tracking-widest text-gray-700 dark:text-gray-300">
                    {pin}
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <ErrorMessage type="error" className="mb-6">
                  {error}
                </ErrorMessage>
              )}

              {/* Attempts Remaining */}
              {attempts > 0 && remainingAttempts > 0 && (
                <div className="mb-6 text-center text-sm text-gray-600 dark:text-gray-400">
                  {remainingAttempts} attempt{remainingAttempts === 1 ? '' : 's'} remaining
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="mb-6">
                  <LoadingSpinner size="md" centered />
                </div>
              )}

              {/* Numeric Keypad */}
              <NumericKeypad
                onDigitPress={addDigit}
                onBackspace={removeDigit}
                onClear={clearPin}
                onSubmit={submitPin}
                disabled={isLoading || attempts >= maxAttempts}
                className="justify-center"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

