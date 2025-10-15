import { useState, useEffect } from 'react'
import { useAppStore } from '../../stores'

interface InventorySettings {
  trackInventory: boolean
  lowStockThreshold: number
  enableLowStockAlerts: boolean
  autoReorderEnabled: boolean
  autoReorderThreshold: number
  defaultReorderQuantity: number
}

export function InventoryTab() {
  const { theme } = useAppStore()
  const [settings, setSettings] = useState<InventorySettings>({
    trackInventory: true,
    lowStockThreshold: 10,
    enableLowStockAlerts: true,
    autoReorderEnabled: false,
    autoReorderThreshold: 5,
    defaultReorderQuantity: 50
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Load saved settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('inventorySettings')
    if (saved) {
      try {
        setSettings(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to load inventory settings:', error)
      }
    }
  }, [])

  const handleToggle = (field: keyof InventorySettings) => {
    setSettings(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleChange = (field: keyof InventorySettings, value: number) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage(null)

    try {
      // Save to localStorage
      localStorage.setItem('inventorySettings', JSON.stringify(settings))
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setSaveMessage({ type: 'success', text: 'Inventory settings saved successfully!' })
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
          Inventory Settings
        </h2>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Configure inventory management and stock tracking preferences
        </p>
      </div>

      {/* General Inventory Settings */}
      <div className={`
        p-6 rounded-lg space-y-4
        ${theme === 'dark'
          ? 'bg-gray-700/30 border border-gray-600'
          : 'bg-gray-50 border border-gray-200'
        }
      `}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          General Settings
        </h3>

        {/* Track Inventory Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Track Inventory
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Enable inventory tracking for all products
            </p>
          </div>
          <button
            onClick={() => handleToggle('trackInventory')}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${settings.trackInventory
                ? 'bg-primary-600'
                : theme === 'dark'
                  ? 'bg-gray-600'
                  : 'bg-gray-300'
              }
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${settings.trackInventory ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className={`
        p-6 rounded-lg space-y-4
        ${theme === 'dark'
          ? 'bg-gray-700/30 border border-gray-600'
          : 'bg-gray-50 border border-gray-200'
        }
      `}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Low Stock Alerts
        </h3>

        {/* Enable Low Stock Alerts */}
        <div className="flex items-center justify-between">
          <div>
            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Enable Low Stock Alerts
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Get notified when products are running low
            </p>
          </div>
          <button
            onClick={() => handleToggle('enableLowStockAlerts')}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${settings.enableLowStockAlerts
                ? 'bg-primary-600'
                : theme === 'dark'
                  ? 'bg-gray-600'
                  : 'bg-gray-300'
              }
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${settings.enableLowStockAlerts ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>

        {/* Low Stock Threshold */}
        {settings.enableLowStockAlerts && (
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Low Stock Threshold
            </label>
            <input
              type="number"
              min="0"
              value={settings.lowStockThreshold}
              onChange={(e) => handleChange('lowStockThreshold', parseInt(e.target.value) || 0)}
              className={`
                w-full px-4 py-4 rounded-lg border text-base min-h-[56px]
                ${theme === 'dark'
                  ? 'bg-gray-800 border-gray-600 text-white focus:border-primary-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
                }
                focus:outline-none focus:ring-2 focus:ring-primary-500/20
              `}
            />
            <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              Alert when stock falls below this quantity
            </p>
          </div>
        )}
      </div>

      {/* Auto Reorder Settings */}
      <div className={`
        p-6 rounded-lg space-y-4
        ${theme === 'dark'
          ? 'bg-gray-700/30 border border-gray-600'
          : 'bg-gray-50 border border-gray-200'
        }
      `}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Auto Reorder
        </h3>

        {/* Enable Auto Reorder */}
        <div className="flex items-center justify-between">
          <div>
            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Enable Auto Reorder
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Automatically create purchase orders when stock is low
            </p>
          </div>
          <button
            onClick={() => handleToggle('autoReorderEnabled')}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${settings.autoReorderEnabled
                ? 'bg-primary-600'
                : theme === 'dark'
                  ? 'bg-gray-600'
                  : 'bg-gray-300'
              }
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${settings.autoReorderEnabled ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>

        {/* Auto Reorder Settings */}
        {settings.autoReorderEnabled && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Reorder Threshold
              </label>
              <input
                type="number"
                min="0"
                value={settings.autoReorderThreshold}
                onChange={(e) => handleChange('autoReorderThreshold', parseInt(e.target.value) || 0)}
                className={`
                  w-full px-4 py-4 rounded-lg border text-base min-h-[56px]
                  ${theme === 'dark'
                    ? 'bg-gray-800 border-gray-600 text-white focus:border-primary-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
                  }
                  focus:outline-none focus:ring-2 focus:ring-primary-500/20
                `}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Default Reorder Quantity
              </label>
              <input
                type="number"
                min="1"
                value={settings.defaultReorderQuantity}
                onChange={(e) => handleChange('defaultReorderQuantity', parseInt(e.target.value) || 1)}
                className={`
                  w-full px-4 py-4 rounded-lg border text-base min-h-[56px]
                  ${theme === 'dark'
                    ? 'bg-gray-800 border-gray-600 text-white focus:border-primary-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
                  }
                  focus:outline-none focus:ring-2 focus:ring-primary-500/20
                `}
              />
            </div>
          </div>
        )}
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

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`
            px-8 py-4 rounded-lg font-medium transition-colors text-base min-h-[56px]
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

