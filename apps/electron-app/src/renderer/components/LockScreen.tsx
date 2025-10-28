import { useState, useEffect } from 'react'
import { useAppStore, usePinStore } from '../stores'
import { useElapsedTime } from '../hooks'
import { authAPI } from '../services/api'
import { NumericKeypad } from './NumericKeypad'

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

  const handleDigitPress = (digit: string) => {
    if (pin.length < 6) {
      handlePinChange(pin + digit)
    }
  }

  const handleBackspace = () => {
    handlePinChange(pin.slice(0, -1))
  }

  const handleClear = () => {
    setPin('')
    setError('')
  }

  const handleKeypadSubmit = () => {
    if (pin.length === 6) {
      handleSubmit({ preventDefault: () => {} } as React.FormEvent)
    }
  }

  return (
    <div className={`
      fixed inset-0 z-[100] flex items-center justify-center
      ${theme === 'dark'
        ? 'bg-gray-900'
        : 'bg-gray-50'
      }
    `}>
      <div className="w-full max-w-md p-8">
        {/* Lock Icon and User Info */}
        <div className="text-center mb-8">
          <div className={`
            w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center
            ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}
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
            ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}
          `}>
            <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Enter PIN to Unlock
            </label>
            <div className="flex justify-center gap-3 mb-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`
                    w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-bold transition-all duration-200
                    ${i < pin.length 
                      ? (theme === 'dark' ? 'bg-blue-600 scale-105' : 'bg-blue-500 scale-105')
                      : (theme === 'dark' ? 'bg-gray-800 border border-gray-600' : 'bg-gray-100 border border-gray-300')
                    }
                  `}
                >
                  {i < pin.length && (
                    <span className="text-white">●</span>
                  )}
                </div>
              ))}
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
          </div>

          {/* Number Pad using NumericKeypad component */}
          <NumericKeypad
            onDigitPress={handleDigitPress}
            onBackspace={handleBackspace}
            onClear={handleClear}
            onSubmit={handleKeypadSubmit}
            disabled={isLoading}
          />
        </form>
      </div>
    </div>
  )
}
