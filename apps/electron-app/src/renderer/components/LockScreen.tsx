import { useState, useEffect } from 'react'
import { useAppStore, usePinStore } from '../stores'
import { useElapsedTime } from '../hooks'
import { authAPI } from '../services/api'

interface LockScreenProps {
  onUnlock: () => void
}

export function LockScreen({ onUnlock }: LockScreenProps) {
  const { theme } = useAppStore()
  const { currentUser } = usePinStore()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [lockStartTime] = useState(new Date())
  const elapsedTime = useElapsedTime(lockStartTime)

  useEffect(() => {
    // Clear PIN when component mounts
    setPin('')
    setError('')
  }, [])

  const handlePinChange = (value: string) => {
    if (value.length <= 6) {
      setPin(value)
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!pin) {
      setError('Please enter your PIN')
      return
    }

    if (!currentUser) {
      setError('No user session found')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await authAPI.login({ pin })
      
      if (response.success && response.user && response.user.id === currentUser.id) {
        onUnlock()
      } else {
        setError('Invalid PIN')
        setPin('')
      }
    } catch (err) {
      setError('Failed to verify PIN')
      setPin('')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNumberClick = (num: string) => {
    if (pin.length < 6) {
      handlePinChange(pin + num)
    }
  }

  const handleBackspace = () => {
    handlePinChange(pin.slice(0, -1))
  }

  const handleClear = () => {
    setPin('')
    setError('')
  }

  return (
    <div className={`
      fixed inset-0 z-[100] flex items-center justify-center
      ${theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-blue-50 via-white to-blue-100'
      }
    `}>
      <div className="w-full max-w-md p-8">
        {/* Lock Icon and User Info */}
        <div className="text-center mb-8">
          <div className={`
            w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center
            ${theme === 'dark' ? 'bg-gray-800 border-2 border-gray-700' : 'bg-white border-2 border-gray-200'}
          `}>
            <svg className={`w-12 h-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Screen Locked
          </h2>
          
          {currentUser && (
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Locked by <span className="font-semibold">{currentUser.full_name}</span>
            </p>
          )}
          
          <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
            Locked for {elapsedTime}
          </p>
        </div>

        {/* PIN Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PIN Display */}
          <div className={`
            p-6 rounded-xl text-center
            ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}
          `}>
            <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Enter PIN to Unlock
            </label>
            <div className="flex justify-center gap-2 mb-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`
                    w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-bold
                    ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}
                    ${i < pin.length 
                      ? (theme === 'dark' ? 'bg-blue-900/50 border-2 border-blue-600' : 'bg-blue-100 border-2 border-blue-500')
                      : (theme === 'dark' ? 'border border-gray-600' : 'border border-gray-300')
                    }
                  `}
                >
                  {i < pin.length && (
                    <span className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}>●</span>
                  )}
                </div>
              ))}
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
          </div>

          {/* Number Pad */}
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleNumberClick(num.toString())}
                disabled={isLoading}
                className={`
                  h-16 rounded-xl text-xl font-semibold
                  transition-all duration-150
                  ${theme === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-white border border-gray-700'
                    : 'bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-900 border border-gray-200'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transform active:scale-95
                `}
              >
                {num}
              </button>
            ))}
            
            {/* Clear Button */}
            <button
              type="button"
              onClick={handleClear}
              disabled={isLoading || !pin}
              className={`
                h-16 rounded-xl text-sm font-semibold
                transition-all duration-150
                ${theme === 'dark'
                  ? 'bg-red-900/30 hover:bg-red-900/50 active:bg-red-900/70 text-red-400 border border-red-800'
                  : 'bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 border border-red-200'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
                transform active:scale-95
              `}
            >
              Clear
            </button>
            
            {/* Zero Button */}
            <button
              type="button"
              onClick={() => handleNumberClick('0')}
              disabled={isLoading}
              className={`
                h-16 rounded-xl text-xl font-semibold
                transition-all duration-150
                ${theme === 'dark'
                  ? 'bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-white border border-gray-700'
                  : 'bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-900 border border-gray-200'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
                transform active:scale-95
              `}
            >
              0
            </button>
            
            {/* Backspace Button */}
            <button
              type="button"
              onClick={handleBackspace}
              disabled={isLoading || !pin}
              className={`
                h-16 rounded-xl text-sm font-semibold
                transition-all duration-150
                ${theme === 'dark'
                  ? 'bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-gray-300 border border-gray-700'
                  : 'bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-600 border border-gray-200'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
                transform active:scale-95
              `}
            >
              <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
              </svg>
            </button>
          </div>

          {/* Unlock Button */}
          <button
            type="submit"
            disabled={isLoading || pin.length === 0}
            className={`
              w-full h-14 rounded-xl font-semibold text-lg
              transition-all duration-150
              ${theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white'
                : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
              transform active:scale-95
            `}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Verifying...</span>
              </div>
            ) : (
              'Unlock'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
