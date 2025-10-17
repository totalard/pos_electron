import { useState } from 'react'
import { useAppStore, useSettingsStore, usePinStore } from '../../stores'
import { authAPI } from '../../services/api'

export function SecurityPanel() {
  const { theme } = useAppStore()
  const { security, updateSecuritySettings } = useSettingsStore()
  const { currentUser } = usePinStore()
  
  const [oldPin, setOldPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [pinSuccess, setPinSuccess] = useState('')
  const [isChangingPin, setIsChangingPin] = useState(false)

  const handleSecurityChange = async (field: keyof typeof security, value: boolean | number) => {
    await updateSecuritySettings({ [field]: value })
  }

  const handlePinChange = async () => {
    setPinError('')
    setPinSuccess('')

    // Validation
    if (!oldPin || !newPin || !confirmPin) {
      setPinError('All fields are required')
      return
    }

    if (newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
      setPinError('New PIN must be exactly 6 digits')
      return
    }

    if (newPin !== confirmPin) {
      setPinError('New PIN and confirmation do not match')
      return
    }

    if (oldPin === newPin) {
      setPinError('New PIN must be different from old PIN')
      return
    }

    setIsChangingPin(true)

    try {
      if (currentUser) {
        await authAPI.changePin(currentUser.id, oldPin, newPin)
        setPinSuccess('PIN changed successfully')
        setOldPin('')
        setNewPin('')
        setConfirmPin('')
      }
    } catch (error) {
      setPinError(error instanceof Error ? error.message : 'Failed to change PIN')
    } finally {
      setIsChangingPin(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Panel Header */}
      <div className="mb-6">
        <h2 className={`
          text-2xl font-bold mb-2
          ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
        `}>
          Security Settings
        </h2>
        <p className={`
          text-sm
          ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
        `}>
          Manage security and access control settings
        </p>
      </div>

      {/* PIN Change Section */}
      <div className={`
        p-4 rounded-lg
        ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}
      `}>
        <h3 className={`
          text-lg font-semibold mb-4
          ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
        `}>
          Change PIN
        </h3>

        <div className="space-y-4 max-w-md">
          {/* Old PIN */}
          <div>
            <label className={`
              block text-sm font-medium mb-2
              ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
            `}>
              Current PIN
            </label>
            <input
              type="password"
              value={oldPin}
              onChange={(e) => setOldPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className={`
                w-full px-4 py-3 rounded-lg text-lg tracking-widest
                transition-colors duration-200
                ${theme === 'dark'
                  ? 'bg-gray-800 border border-gray-600 text-white focus:border-blue-500'
                  : 'bg-white border border-gray-300 text-gray-900 focus:border-blue-500'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500/20
              `}
              placeholder="••••••"
              aria-label="Current PIN"
            />
          </div>

          {/* New PIN */}
          <div>
            <label className={`
              block text-sm font-medium mb-2
              ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
            `}>
              New PIN
            </label>
            <input
              type="password"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className={`
                w-full px-4 py-3 rounded-lg text-lg tracking-widest
                transition-colors duration-200
                ${theme === 'dark'
                  ? 'bg-gray-800 border border-gray-600 text-white focus:border-blue-500'
                  : 'bg-white border border-gray-300 text-gray-900 focus:border-blue-500'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500/20
              `}
              placeholder="••••••"
              aria-label="New PIN"
            />
          </div>

          {/* Confirm PIN */}
          <div>
            <label className={`
              block text-sm font-medium mb-2
              ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
            `}>
              Confirm New PIN
            </label>
            <input
              type="password"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className={`
                w-full px-4 py-3 rounded-lg text-lg tracking-widest
                transition-colors duration-200
                ${theme === 'dark'
                  ? 'bg-gray-800 border border-gray-600 text-white focus:border-blue-500'
                  : 'bg-white border border-gray-300 text-gray-900 focus:border-blue-500'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500/20
              `}
              placeholder="••••••"
              aria-label="Confirm New PIN"
            />
          </div>

          {/* Error/Success Messages */}
          {pinError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-500">{pinError}</p>
            </div>
          )}
          {pinSuccess && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-green-500">{pinSuccess}</p>
            </div>
          )}

          {/* Change PIN Button - Touch-safe 44x44px minimum */}
          <button
            onClick={handlePinChange}
            disabled={isChangingPin}
            className={`
              w-full px-6 py-3 rounded-lg font-medium
              transition-all duration-200
              min-h-[44px]
              ${isChangingPin
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
              }
              text-white
              focus:outline-none focus:ring-2 focus:ring-blue-500/20
            `}
            aria-label="Change PIN"
          >
            {isChangingPin ? 'Changing PIN...' : 'Change PIN'}
          </button>
        </div>
      </div>

      {/* Session & Access Control Section */}
      <div className={`
        p-4 rounded-lg
        ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}
      `}>
        <h3 className={`
          text-lg font-semibold mb-4
          ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
        `}>
          Session & Access Control
        </h3>

        <div className="space-y-4">
          {/* Session Timeout */}
          <div>
            <label className={`
              block text-sm font-medium mb-2
              ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
            `}>
              Session Timeout (minutes, 0 = disabled)
            </label>
            <input
              type="number"
              value={security.sessionTimeout}
              onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value) || 0)}
              min={0}
              max={1440}
              className={`
                w-full px-4 py-3 rounded-lg
                transition-colors duration-200
                min-h-[44px]
                ${theme === 'dark'
                  ? 'bg-gray-800 border border-gray-600 text-white focus:border-blue-500'
                  : 'bg-white border border-gray-300 text-gray-900 focus:border-blue-500'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500/20
              `}
              aria-label="Session timeout in minutes"
            />
            <p className={`
              text-xs mt-1
              ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
            `}>
              Automatically log out after period of inactivity
            </p>
          </div>

          {/* Require PIN for Refunds */}
          <div className="flex items-center justify-between min-h-[44px]">
            <div>
              <label className={`
                text-sm font-medium
                ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
              `}>
                Require PIN for Refunds
              </label>
              <p className={`
                text-xs
                ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
              `}>
                Require PIN verification to process refunds
              </p>
            </div>
            <button
              onClick={() => handleSecurityChange('requirePinForRefunds', !security.requirePinForRefunds)}
              className={`
                relative inline-flex h-8 w-14 items-center rounded-full
                transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500/20
                ${security.requirePinForRefunds ? 'bg-blue-500' : 'bg-gray-300'}
              `}
              aria-label="Toggle require PIN for refunds"
            >
              <span
                className={`
                  inline-block h-6 w-6 transform rounded-full bg-white
                  transition-transform duration-200
                  ${security.requirePinForRefunds ? 'translate-x-7' : 'translate-x-1'}
                `}
              />
            </button>
          </div>

          {/* Require PIN for Voids */}
          <div className="flex items-center justify-between min-h-[44px]">
            <div>
              <label className={`
                text-sm font-medium
                ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
              `}>
                Require PIN for Voids
              </label>
              <p className={`
                text-xs
                ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
              `}>
                Require PIN verification to void transactions
              </p>
            </div>
            <button
              onClick={() => handleSecurityChange('requirePinForVoids', !security.requirePinForVoids)}
              className={`
                relative inline-flex h-8 w-14 items-center rounded-full
                transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500/20
                ${security.requirePinForVoids ? 'bg-blue-500' : 'bg-gray-300'}
              `}
              aria-label="Toggle require PIN for voids"
            >
              <span
                className={`
                  inline-block h-6 w-6 transform rounded-full bg-white
                  transition-transform duration-200
                  ${security.requirePinForVoids ? 'translate-x-7' : 'translate-x-1'}
                `}
              />
            </button>
          </div>

          {/* Require PIN for Discounts */}
          <div className="flex items-center justify-between min-h-[44px]">
            <div>
              <label className={`
                text-sm font-medium
                ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
              `}>
                Require PIN for Discounts
              </label>
              <p className={`
                text-xs
                ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
              `}>
                Require PIN verification to apply discounts
              </p>
            </div>
            <button
              onClick={() => handleSecurityChange('requirePinForDiscounts', !security.requirePinForDiscounts)}
              className={`
                relative inline-flex h-8 w-14 items-center rounded-full
                transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500/20
                ${security.requirePinForDiscounts ? 'bg-blue-500' : 'bg-gray-300'}
              `}
              aria-label="Toggle require PIN for discounts"
            >
              <span
                className={`
                  inline-block h-6 w-6 transform rounded-full bg-white
                  transition-transform duration-200
                  ${security.requirePinForDiscounts ? 'translate-x-7' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

