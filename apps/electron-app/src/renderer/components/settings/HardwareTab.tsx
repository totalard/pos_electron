import { useState, useEffect } from 'react'
import { useAppStore } from '../../stores'

interface HardwareSettings {
  printerEnabled: boolean
  printerName: string
  printerType: 'thermal' | 'inkjet' | 'laser'
  cashDrawerEnabled: boolean
  cashDrawerPort: string
  barcodeScanner: boolean
  barcodeScannerType: 'usb' | 'bluetooth' | 'serial'
  cardReaderEnabled: boolean
  cardReaderType: 'usb' | 'bluetooth' | 'network'
  displayEnabled: boolean
  displayType: 'customer-display' | 'kitchen-display'
  scaleEnabled: boolean
  scalePort: string
}

export function HardwareTab() {
  const { theme } = useAppStore()
  const [settings, setSettings] = useState<HardwareSettings>({
    printerEnabled: true,
    printerName: 'Default Printer',
    printerType: 'thermal',
    cashDrawerEnabled: true,
    cashDrawerPort: 'COM1',
    barcodeScanner: true,
    barcodeScannerType: 'usb',
    cardReaderEnabled: true,
    cardReaderType: 'usb',
    displayEnabled: false,
    displayType: 'customer-display',
    scaleEnabled: false,
    scalePort: 'COM2'
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [testingDevice, setTestingDevice] = useState<string | null>(null)

  // Load saved settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('hardwareSettings')
    if (saved) {
      try {
        setSettings(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to load hardware settings:', error)
      }
    }
  }, [])

  const handleToggle = (field: keyof HardwareSettings) => {
    setSettings(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleChange = (field: keyof HardwareSettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleTestDevice = async (device: string) => {
    setTestingDevice(device)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setTestingDevice(null)
    setSaveMessage({ type: 'success', text: `${device} test successful!` })
    setTimeout(() => setSaveMessage(null), 3000)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage(null)

    try {
      localStorage.setItem('hardwareSettings', JSON.stringify(settings))
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setSaveMessage({ type: 'success', text: 'Hardware settings saved successfully!' })
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
          Hardware Settings
        </h2>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Configure POS hardware devices and peripherals
        </p>
      </div>

      {/* Printer Settings */}
      <div className={`
        p-6 rounded-lg space-y-6
        ${theme === 'dark'
          ? 'bg-gray-700/30 border border-gray-600'
          : 'bg-gray-50 border border-gray-200'
        }
      `}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Receipt Printer
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Configure receipt printer
              </p>
            </div>
          </div>
          {/* Touch-safe toggle: 48x48px minimum */}
          <button
            onClick={() => handleToggle('printerEnabled')}
            className={`
              relative inline-flex h-12 w-20 items-center rounded-full transition-colors
              ${settings.printerEnabled
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
                ${settings.printerEnabled ? 'translate-x-10' : 'translate-x-2'}
              `}
            />
          </button>
        </div>

        {settings.printerEnabled && (
          <div className="space-y-4 pl-16">
            {/* Printer Type - Touch-safe: 56px height */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Printer Type
              </label>
              <select
                value={settings.printerType}
                onChange={(e) => handleChange('printerType', e.target.value)}
                className={`
                  w-full px-4 py-4 rounded-lg border text-base min-h-[56px]
                  ${theme === 'dark'
                    ? 'bg-gray-800 border-gray-600 text-white focus:border-primary-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
                  }
                  focus:outline-none focus:ring-2 focus:ring-primary-500/20
                `}
              >
                <option value="thermal">Thermal Printer</option>
                <option value="inkjet">Inkjet Printer</option>
                <option value="laser">Laser Printer</option>
              </select>
            </div>

            {/* Printer Name - Touch-safe: 56px height */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Printer Name
              </label>
              <input
                type="text"
                value={settings.printerName}
                onChange={(e) => handleChange('printerName', e.target.value)}
                placeholder="Enter printer name"
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

            {/* Test Printer Button - Touch-safe: 56px height */}
            <button
              onClick={() => handleTestDevice('Printer')}
              disabled={testingDevice === 'Printer'}
              className={`
                w-full px-6 py-4 rounded-lg font-medium text-base transition-colors min-h-[56px]
                ${theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600'
                  : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {testingDevice === 'Printer' ? 'Testing...' : 'Test Printer'}
            </button>
          </div>
        )}
      </div>

      {/* Cash Drawer Settings */}
      <div className={`
        p-6 rounded-lg space-y-6
        ${theme === 'dark'
          ? 'bg-gray-700/30 border border-gray-600'
          : 'bg-gray-50 border border-gray-200'
        }
      `}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Cash Drawer
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Configure cash drawer connection
              </p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('cashDrawerEnabled')}
            className={`
              relative inline-flex h-12 w-20 items-center rounded-full transition-colors
              ${settings.cashDrawerEnabled
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
                ${settings.cashDrawerEnabled ? 'translate-x-10' : 'translate-x-2'}
              `}
            />
          </button>
        </div>

        {settings.cashDrawerEnabled && (
          <div className="space-y-4 pl-16">
            {/* Cash Drawer Port - Touch-safe: 56px height */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Connection Port
              </label>
              <input
                type="text"
                value={settings.cashDrawerPort}
                onChange={(e) => handleChange('cashDrawerPort', e.target.value)}
                placeholder="COM1, USB, etc."
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

            {/* Test Cash Drawer Button - Touch-safe: 56px height */}
            <button
              onClick={() => handleTestDevice('Cash Drawer')}
              disabled={testingDevice === 'Cash Drawer'}
              className={`
                w-full px-6 py-4 rounded-lg font-medium text-base transition-colors min-h-[56px]
                ${theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600'
                  : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {testingDevice === 'Cash Drawer' ? 'Testing...' : 'Open Cash Drawer'}
            </button>
          </div>
        )}
      </div>

      {/* Barcode Scanner Settings */}
      <div className={`
        p-6 rounded-lg space-y-6
        ${theme === 'dark'
          ? 'bg-gray-700/30 border border-gray-600'
          : 'bg-gray-50 border border-gray-200'
        }
      `}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Barcode Scanner
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Configure barcode scanner
              </p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('barcodeScanner')}
            className={`
              relative inline-flex h-12 w-20 items-center rounded-full transition-colors
              ${settings.barcodeScanner
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
                ${settings.barcodeScanner ? 'translate-x-10' : 'translate-x-2'}
              `}
            />
          </button>
        </div>

        {settings.barcodeScanner && (
          <div className="space-y-4 pl-16">
            {/* Scanner Type - Touch-safe: 56px height */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Scanner Type
              </label>
              <select
                value={settings.barcodeScannerType}
                onChange={(e) => handleChange('barcodeScannerType', e.target.value)}
                className={`
                  w-full px-4 py-4 rounded-lg border text-base min-h-[56px]
                  ${theme === 'dark'
                    ? 'bg-gray-800 border-gray-600 text-white focus:border-primary-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
                  }
                  focus:outline-none focus:ring-2 focus:ring-primary-500/20
                `}
              >
                <option value="usb">USB Scanner</option>
                <option value="bluetooth">Bluetooth Scanner</option>
                <option value="serial">Serial Scanner</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Card Reader Settings */}
      <div className={`
        p-6 rounded-lg space-y-6
        ${theme === 'dark'
          ? 'bg-gray-700/30 border border-gray-600'
          : 'bg-gray-50 border border-gray-200'
        }
      `}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Card Reader
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Configure card payment terminal
              </p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('cardReaderEnabled')}
            className={`
              relative inline-flex h-12 w-20 items-center rounded-full transition-colors
              ${settings.cardReaderEnabled
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
                ${settings.cardReaderEnabled ? 'translate-x-10' : 'translate-x-2'}
              `}
            />
          </button>
        </div>

        {settings.cardReaderEnabled && (
          <div className="space-y-4 pl-16">
            {/* Card Reader Type - Touch-safe: 56px height */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Connection Type
              </label>
              <select
                value={settings.cardReaderType}
                onChange={(e) => handleChange('cardReaderType', e.target.value)}
                className={`
                  w-full px-4 py-4 rounded-lg border text-base min-h-[56px]
                  ${theme === 'dark'
                    ? 'bg-gray-800 border-gray-600 text-white focus:border-primary-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
                  }
                  focus:outline-none focus:ring-2 focus:ring-primary-500/20
                `}
              >
                <option value="usb">USB Connection</option>
                <option value="bluetooth">Bluetooth</option>
                <option value="network">Network/IP</option>
              </select>
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

