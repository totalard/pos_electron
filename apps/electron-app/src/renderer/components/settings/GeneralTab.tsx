import { useState, useEffect } from 'react'
import { useAppStore } from '../../stores'

interface GeneralSettings {
  businessType: 'restaurant' | 'retail'
  enableShiftManagement: boolean
  shiftDuration: number
  requireShiftStart: boolean
  requireShiftEnd: boolean
  enableCashManagement: boolean
  requireOpeningFloat: boolean
  defaultOpeningFloat: number
  enableOrderNumbers: boolean
  orderNumberPrefix: string
  enableCustomerDisplay: boolean
  soundEnabled: boolean
  soundVolume: number
}

export function GeneralTab() {
  const { theme } = useAppStore()
  const [settings, setSettings] = useState<GeneralSettings>({
    businessType: 'retail',
    enableShiftManagement: true,
    shiftDuration: 8,
    requireShiftStart: true,
    requireShiftEnd: true,
    enableCashManagement: true,
    requireOpeningFloat: true,
    defaultOpeningFloat: 200,
    enableOrderNumbers: true,
    orderNumberPrefix: 'ORD',
    enableCustomerDisplay: false,
    soundEnabled: true,
    soundVolume: 50
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Load saved settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('generalSettings')
    if (saved) {
      try {
        setSettings(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to load general settings:', error)
      }
    }
  }, [])

  const handleToggle = (field: keyof GeneralSettings) => {
    setSettings(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleChange = (field: keyof GeneralSettings, value: string | number) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage(null)

    try {
      localStorage.setItem('generalSettings', JSON.stringify(settings))

      // Dispatch custom event to notify Settings component of business type change
      window.dispatchEvent(new Event('generalSettingsChanged'))

      await new Promise(resolve => setTimeout(resolve, 500))

      setSaveMessage({ type: 'success', text: 'Settings saved successfully!' })
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Failed to save settings' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          General Settings
        </h2>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Configure basic system preferences
        </p>
      </div>

      {/* Business Type Selection - Touch-safe: 80px height buttons */}
      <div className={`
        p-6 rounded-lg
        ${theme === 'dark'
          ? 'bg-gray-700/30 border border-gray-600'
          : 'bg-gray-50 border border-gray-200'
        }
      `}>
        <label className={`block text-base font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Business Type
        </label>

        <div className="grid grid-cols-2 gap-6">
          {/* Restaurant Option - Touch-safe: min 80px height */}
          <button
            onClick={() => handleChange('businessType', 'restaurant')}
            className={`
              p-8 rounded-lg border-2 transition-all min-h-[80px]
              ${settings.businessType === 'restaurant'
                ? theme === 'dark'
                  ? 'border-primary-500 bg-primary-900/20'
                  : 'border-primary-500 bg-primary-50'
                : theme === 'dark'
                  ? 'border-gray-600 hover:border-gray-500'
                  : 'border-gray-300 hover:border-gray-400'
              }
            `}
          >
            <div className="flex flex-col items-center gap-3">
              <svg className={`w-14 h-14 ${settings.businessType === 'restaurant' ? 'text-primary-500' : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div className="text-center">
                <p className={`font-semibold text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Restaurant
                </p>
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Food & beverage service
                </p>
              </div>
              {settings.businessType === 'restaurant' && (
                <div className="mt-2">
                  <svg className="w-7 h-7 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </button>

          {/* Retail Option - Touch-safe: min 80px height */}
          <button
            onClick={() => handleChange('businessType', 'retail')}
            className={`
              p-8 rounded-lg border-2 transition-all min-h-[80px]
              ${settings.businessType === 'retail'
                ? theme === 'dark'
                  ? 'border-primary-500 bg-primary-900/20'
                  : 'border-primary-500 bg-primary-50'
                : theme === 'dark'
                  ? 'border-gray-600 hover:border-gray-500'
                  : 'border-gray-300 hover:border-gray-400'
              }
            `}
          >
            <div className="flex flex-col items-center gap-3">
              <svg className={`w-14 h-14 ${settings.businessType === 'retail' ? 'text-primary-500' : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <div className="text-center">
                <p className={`font-semibold text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Retail
                </p>
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Product sales & services
                </p>
              </div>
              {settings.businessType === 'retail' && (
                <div className="mt-2">
                  <svg className="w-7 h-7 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        </div>

        <p className={`text-sm mt-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
          This setting affects the default features and workflows available in the system.
        </p>
      </div>

      {/* Shift Management Settings */}
      <div className={`
        p-6 rounded-lg space-y-6
        ${theme === 'dark'
          ? 'bg-gray-700/30 border border-gray-600'
          : 'bg-gray-50 border border-gray-200'
        }
      `}>
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Shift Management
        </h3>

        {/* Enable Shift Management - Touch-safe: 56px height */}
        <div className="flex items-center justify-between py-2">
          <div>
            <p className={`font-medium text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Enable Shift Management
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Track employee shifts and work hours
            </p>
          </div>
          {/* Touch-safe toggle: 48x48px minimum */}
          <button
            onClick={() => handleToggle('enableShiftManagement')}
            className={`
              relative inline-flex h-12 w-20 items-center rounded-full transition-colors
              ${settings.enableShiftManagement
                ? 'bg-primary-600'
                : theme === 'dark'
                  ? 'bg-gray-600'
                  : 'bg-gray-300'
              }
            `}
          >
            <span
              className={`
                inline-block h-8 w-8 transform rounded-full bg-white transition-transform shadow-lg
                ${settings.enableShiftManagement ? 'translate-x-10' : 'translate-x-2'}
              `}
            />
          </button>
        </div>

        {settings.enableShiftManagement && (
          <>
            {/* Require Shift Start */}
            <div className="flex items-center justify-between py-2">
              <div>
                <p className={`font-medium text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Require Shift Start
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Staff must clock in before using POS
                </p>
              </div>
              <button
                onClick={() => handleToggle('requireShiftStart')}
                className={`
                  relative inline-flex h-12 w-20 items-center rounded-full transition-colors
                  ${settings.requireShiftStart
                    ? 'bg-primary-600'
                    : theme === 'dark'
                      ? 'bg-gray-600'
                      : 'bg-gray-300'
                  }
                `}
              >
                <span
                  className={`
                    inline-block h-8 w-8 transform rounded-full bg-white transition-transform shadow-lg
                    ${settings.requireShiftStart ? 'translate-x-10' : 'translate-x-2'}
                  `}
                />
              </button>
            </div>

            {/* Require Shift End */}
            <div className="flex items-center justify-between py-2">
              <div>
                <p className={`font-medium text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Require Shift End
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Staff must clock out after shift
                </p>
              </div>
              <button
                onClick={() => handleToggle('requireShiftEnd')}
                className={`
                  relative inline-flex h-12 w-20 items-center rounded-full transition-colors
                  ${settings.requireShiftEnd
                    ? 'bg-primary-600'
                    : theme === 'dark'
                      ? 'bg-gray-600'
                      : 'bg-gray-300'
                  }
                `}
              >
                <span
                  className={`
                    inline-block h-8 w-8 transform rounded-full bg-white transition-transform shadow-lg
                    ${settings.requireShiftEnd ? 'translate-x-10' : 'translate-x-2'}
                  `}
                />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Cash Management Settings */}
      <div className={`
        p-6 rounded-lg space-y-6
        ${theme === 'dark'
          ? 'bg-gray-700/30 border border-gray-600'
          : 'bg-gray-50 border border-gray-200'
        }
      `}>
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Cash Management
        </h3>

        {/* Enable Cash Management */}
        <div className="flex items-center justify-between py-2">
          <div>
            <p className={`font-medium text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Enable Cash Management
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Track cash drawer and reconciliation
            </p>
          </div>
          <button
            onClick={() => handleToggle('enableCashManagement')}
            className={`
              relative inline-flex h-12 w-20 items-center rounded-full transition-colors
              ${settings.enableCashManagement
                ? 'bg-primary-600'
                : theme === 'dark'
                  ? 'bg-gray-600'
                  : 'bg-gray-300'
              }
            `}
          >
            <span
              className={`
                inline-block h-8 w-8 transform rounded-full bg-white transition-transform shadow-lg
                ${settings.enableCashManagement ? 'translate-x-10' : 'translate-x-2'}
              `}
            />
          </button>
        </div>

        {settings.enableCashManagement && (
          <>
            {/* Require Opening Float */}
            <div className="flex items-center justify-between py-2">
              <div>
                <p className={`font-medium text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Require Opening Float
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Require cash count at shift start
                </p>
              </div>
              <button
                onClick={() => handleToggle('requireOpeningFloat')}
                className={`
                  relative inline-flex h-12 w-20 items-center rounded-full transition-colors
                  ${settings.requireOpeningFloat
                    ? 'bg-primary-600'
                    : theme === 'dark'
                      ? 'bg-gray-600'
                      : 'bg-gray-300'
                  }
                `}
              >
                <span
                  className={`
                    inline-block h-8 w-8 transform rounded-full bg-white transition-transform shadow-lg
                    ${settings.requireOpeningFloat ? 'translate-x-10' : 'translate-x-2'}
                  `}
                />
              </button>
            </div>

            {/* Default Opening Float - Touch-safe: 56px height */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Default Opening Float Amount
              </label>
              <input
                type="number"
                value={settings.defaultOpeningFloat}
                onChange={(e) => handleChange('defaultOpeningFloat', parseFloat(e.target.value) || 0)}
                min="0"
                step="10"
                className={`
                  w-full px-4 py-4 rounded-lg border text-base min-h-[56px]
                  ${theme === 'dark'
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-primary-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-primary-500'
                  }
                  focus:outline-none focus:ring-2 focus:ring-primary-500/20
                `}
              />
            </div>
          </>
        )}
      </div>

      {/* System Settings */}
      <div className={`
        p-6 rounded-lg space-y-6
        ${theme === 'dark'
          ? 'bg-gray-700/30 border border-gray-600'
          : 'bg-gray-50 border border-gray-200'
        }
      `}>
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          System Settings
        </h3>

        {/* Enable Order Numbers */}
        <div className="flex items-center justify-between py-2">
          <div>
            <p className={`font-medium text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Enable Order Numbers
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Generate sequential order numbers
            </p>
          </div>
          <button
            onClick={() => handleToggle('enableOrderNumbers')}
            className={`
              relative inline-flex h-12 w-20 items-center rounded-full transition-colors
              ${settings.enableOrderNumbers
                ? 'bg-primary-600'
                : theme === 'dark'
                  ? 'bg-gray-600'
                  : 'bg-gray-300'
              }
            `}
          >
            <span
              className={`
                inline-block h-8 w-8 transform rounded-full bg-white transition-transform shadow-lg
                ${settings.enableOrderNumbers ? 'translate-x-10' : 'translate-x-2'}
              `}
            />
          </button>
        </div>

        {/* Sound Enabled */}
        <div className="flex items-center justify-between py-2">
          <div>
            <p className={`font-medium text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Sound Effects
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Enable button clicks and notifications
            </p>
          </div>
          <button
            onClick={() => handleToggle('soundEnabled')}
            className={`
              relative inline-flex h-12 w-20 items-center rounded-full transition-colors
              ${settings.soundEnabled
                ? 'bg-primary-600'
                : theme === 'dark'
                  ? 'bg-gray-600'
                  : 'bg-gray-300'
              }
            `}
          >
            <span
              className={`
                inline-block h-8 w-8 transform rounded-full bg-white transition-transform shadow-lg
                ${settings.soundEnabled ? 'translate-x-10' : 'translate-x-2'}
              `}
            />
          </button>
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`
          p-4 rounded-lg flex items-center gap-3
          ${saveMessage.type === 'success'
            ? theme === 'dark'
              ? 'bg-green-900/20 border border-green-700 text-green-400'
              : 'bg-green-50 border border-green-200 text-green-700'
            : theme === 'dark'
              ? 'bg-red-900/20 border border-red-700 text-red-400'
              : 'bg-red-50 border border-red-200 text-red-700'
          }
        `}>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            {saveMessage.type === 'success' ? (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            )}
          </svg>
          <span className="text-sm font-medium">{saveMessage.text}</span>
        </div>
      )}

      {/* Save Button - Touch-safe: 56px height */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`
            px-8 py-4 rounded-lg font-medium text-base transition-colors min-h-[56px]
            ${theme === 'dark'
              ? 'bg-primary-600 hover:bg-primary-700 text-white'
              : 'bg-primary-500 hover:bg-primary-600 text-white'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

