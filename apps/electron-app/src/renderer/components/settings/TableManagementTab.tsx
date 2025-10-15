import { useState, useEffect } from 'react'
import { useAppStore } from '../../stores'

interface TableSettings {
  enableTableManagement: boolean
  numberOfTables: number
  defaultTableCapacity: number
  enableReservations: boolean
  reservationDuration: number
  enableWaitlist: boolean
  autoAssignTables: boolean
  enableTableMerging: boolean
  enableTableTransfer: boolean
  showTableStatus: boolean
}

export function TableManagementTab() {
  const { theme } = useAppStore()
  const [settings, setSettings] = useState<TableSettings>({
    enableTableManagement: true,
    numberOfTables: 20,
    defaultTableCapacity: 4,
    enableReservations: true,
    reservationDuration: 90,
    enableWaitlist: true,
    autoAssignTables: false,
    enableTableMerging: true,
    enableTableTransfer: true,
    showTableStatus: true
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Load saved settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tableManagementSettings')
    if (saved) {
      try {
        setSettings(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to load table management settings:', error)
      }
    }
  }, [])

  const handleToggle = (field: keyof TableSettings) => {
    setSettings(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleChange = (field: keyof TableSettings, value: number) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage(null)

    try {
      localStorage.setItem('tableManagementSettings', JSON.stringify(settings))
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setSaveMessage({ type: 'success', text: 'Table management settings saved successfully!' })
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
          Table Management
        </h2>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Configure table management and reservation settings for your restaurant
        </p>
      </div>

      {/* Basic Table Settings */}
      <div className={`
        p-6 rounded-lg space-y-6
        ${theme === 'dark'
          ? 'bg-gray-700/30 border border-gray-600'
          : 'bg-gray-50 border border-gray-200'
        }
      `}>
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Basic Settings
        </h3>

        {/* Enable Table Management - Touch-safe: 56px height */}
        <div className="flex items-center justify-between py-2">
          <div>
            <p className={`font-medium text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Enable Table Management
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Turn on table tracking and management
            </p>
          </div>
          {/* Touch-safe toggle: 48x48px minimum */}
          <button
            onClick={() => handleToggle('enableTableManagement')}
            className={`
              relative inline-flex h-12 w-20 items-center rounded-full transition-colors
              ${settings.enableTableManagement
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
                ${settings.enableTableManagement ? 'translate-x-10' : 'translate-x-2'}
              `}
            />
          </button>
        </div>

        {settings.enableTableManagement && (
          <>
            {/* Number of Tables - Touch-safe: 56px height */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Number of Tables
              </label>
              <input
                type="number"
                value={settings.numberOfTables}
                onChange={(e) => handleChange('numberOfTables', parseInt(e.target.value) || 0)}
                min="1"
                max="200"
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

            {/* Default Table Capacity - Touch-safe: 56px height */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Default Table Capacity (seats)
              </label>
              <input
                type="number"
                value={settings.defaultTableCapacity}
                onChange={(e) => handleChange('defaultTableCapacity', parseInt(e.target.value) || 0)}
                min="1"
                max="20"
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

            {/* Show Table Status */}
            <div className="flex items-center justify-between py-2">
              <div>
                <p className={`font-medium text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Show Table Status
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Display real-time table availability
                </p>
              </div>
              <button
                onClick={() => handleToggle('showTableStatus')}
                className={`
                  relative inline-flex h-12 w-20 items-center rounded-full transition-colors
                  ${settings.showTableStatus
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
                    ${settings.showTableStatus ? 'translate-x-10' : 'translate-x-2'}
                  `}
                />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Reservation Settings */}
      {settings.enableTableManagement && (
        <div className={`
          p-6 rounded-lg space-y-6
          ${theme === 'dark'
            ? 'bg-gray-700/30 border border-gray-600'
            : 'bg-gray-50 border border-gray-200'
          }
        `}>
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Reservations
          </h3>

          {/* Enable Reservations */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className={`font-medium text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Enable Reservations
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Allow customers to book tables in advance
              </p>
            </div>
            <button
              onClick={() => handleToggle('enableReservations')}
              className={`
                relative inline-flex h-12 w-20 items-center rounded-full transition-colors
                ${settings.enableReservations
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
                  ${settings.enableReservations ? 'translate-x-10' : 'translate-x-2'}
                `}
              />
            </button>
          </div>

          {settings.enableReservations && (
            <div>
              <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Default Reservation Duration (minutes)
              </label>
              <input
                type="number"
                value={settings.reservationDuration}
                onChange={(e) => handleChange('reservationDuration', parseInt(e.target.value) || 0)}
                min="30"
                max="300"
                step="15"
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
          )}

          {/* Enable Waitlist */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className={`font-medium text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Enable Waitlist
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Manage walk-in customers waiting for tables
              </p>
            </div>
            <button
              onClick={() => handleToggle('enableWaitlist')}
              className={`
                relative inline-flex h-12 w-20 items-center rounded-full transition-colors
                ${settings.enableWaitlist
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
                  ${settings.enableWaitlist ? 'translate-x-10' : 'translate-x-2'}
                `}
              />
            </button>
          </div>
        </div>
      )}

      {/* Advanced Table Features */}
      {settings.enableTableManagement && (
        <div className={`
          p-6 rounded-lg space-y-6
          ${theme === 'dark'
            ? 'bg-gray-700/30 border border-gray-600'
            : 'bg-gray-50 border border-gray-200'
          }
        `}>
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Advanced Features
          </h3>

          {/* Auto Assign Tables */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className={`font-medium text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Auto Assign Tables
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Automatically assign available tables to new orders
              </p>
            </div>
            <button
              onClick={() => handleToggle('autoAssignTables')}
              className={`
                relative inline-flex h-12 w-20 items-center rounded-full transition-colors
                ${settings.autoAssignTables
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
                  ${settings.autoAssignTables ? 'translate-x-10' : 'translate-x-2'}
                `}
              />
            </button>
          </div>

          {/* Enable Table Merging */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className={`font-medium text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Enable Table Merging
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Allow combining multiple tables for large parties
              </p>
            </div>
            <button
              onClick={() => handleToggle('enableTableMerging')}
              className={`
                relative inline-flex h-12 w-20 items-center rounded-full transition-colors
                ${settings.enableTableMerging
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
                  ${settings.enableTableMerging ? 'translate-x-10' : 'translate-x-2'}
                `}
              />
            </button>
          </div>

          {/* Enable Table Transfer */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className={`font-medium text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Enable Table Transfer
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Allow moving orders between tables
              </p>
            </div>
            <button
              onClick={() => handleToggle('enableTableTransfer')}
              className={`
                relative inline-flex h-12 w-20 items-center rounded-full transition-colors
                ${settings.enableTableTransfer
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
                  ${settings.enableTableTransfer ? 'translate-x-10' : 'translate-x-2'}
                `}
              />
            </button>
          </div>
        </div>
      )}

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

