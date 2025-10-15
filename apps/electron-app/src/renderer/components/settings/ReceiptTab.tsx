import { useState, useEffect } from 'react'
import { useAppStore } from '../../stores'

interface ReceiptSettings {
  printReceipt: boolean
  showLogo: boolean
  showTaxBreakdown: boolean
  showItemDetails: boolean
  showBarcode: boolean
  footerMessage: string
  headerMessage: string
  paperSize: 'thermal-80mm' | 'thermal-58mm' | 'a4' | 'letter'
  printCopies: number
  autoprint: boolean
  showQRCode: boolean
  qrCodeContent: 'receipt-url' | 'feedback-url' | 'website'
}

export function ReceiptTab() {
  const { theme } = useAppStore()
  const [settings, setSettings] = useState<ReceiptSettings>({
    printReceipt: true,
    showLogo: true,
    showTaxBreakdown: true,
    showItemDetails: true,
    showBarcode: false,
    footerMessage: 'Thank you for your business!',
    headerMessage: '',
    paperSize: 'thermal-80mm',
    printCopies: 1,
    autoprint: true,
    showQRCode: false,
    qrCodeContent: 'feedback-url'
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Load saved settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('receiptSettings')
    if (saved) {
      try {
        setSettings(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to load receipt settings:', error)
      }
    }
  }, [])

  const handleToggle = (field: keyof ReceiptSettings) => {
    setSettings(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleChange = (field: keyof ReceiptSettings, value: string | number) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage(null)

    try {
      localStorage.setItem('receiptSettings', JSON.stringify(settings))
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setSaveMessage({ type: 'success', text: 'Receipt settings saved successfully!' })
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
          Receipt Settings
        </h2>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Configure receipt printing options for your offline POS system
        </p>
      </div>

      {/* Receipt Printing */}
      <div className={`
        p-6 rounded-lg space-y-6
        ${theme === 'dark'
          ? 'bg-gray-700/30 border border-gray-600'
          : 'bg-gray-50 border border-gray-200'
        }
      `}>
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Receipt Printing
        </h3>

        {/* Print Receipt - Touch-safe: 56px height */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            </div>
            <div>
              <p className={`font-medium text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Auto-Print Receipt
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Automatically print receipts after each transaction
              </p>
            </div>
          </div>
          {/* Touch-safe toggle: 48x48px minimum */}
          <button
            onClick={() => handleToggle('printReceipt')}
            className={`
              relative inline-flex h-12 w-20 items-center rounded-full transition-colors
              ${settings.printReceipt
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
                ${settings.printReceipt ? 'translate-x-10' : 'translate-x-2'}
              `}
            />
          </button>
        </div>
      </div>

      {/* Receipt Content */}
      <div className={`
        p-6 rounded-lg space-y-6
        ${theme === 'dark'
          ? 'bg-gray-700/30 border border-gray-600'
          : 'bg-gray-50 border border-gray-200'
        }
      `}>
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Receipt Content
        </h3>

        {/* Show Logo */}
        <div className="flex items-center justify-between py-2">
          <div>
            <p className={`font-medium text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Show Company Logo
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Display logo on receipts
            </p>
          </div>
          <button
            onClick={() => handleToggle('showLogo')}
            className={`
              relative inline-flex h-12 w-20 items-center rounded-full transition-colors
              ${settings.showLogo
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
                ${settings.showLogo ? 'translate-x-10' : 'translate-x-2'}
              `}
            />
          </button>
        </div>

        {/* Show Tax Breakdown */}
        <div className="flex items-center justify-between py-2">
          <div>
            <p className={`font-medium text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Show Tax Breakdown
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Display detailed tax information
            </p>
          </div>
          <button
            onClick={() => handleToggle('showTaxBreakdown')}
            className={`
              relative inline-flex h-12 w-20 items-center rounded-full transition-colors
              ${settings.showTaxBreakdown
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
                ${settings.showTaxBreakdown ? 'translate-x-10' : 'translate-x-2'}
              `}
            />
          </button>
        </div>

        {/* Show QR Code */}
        <div className="flex items-center justify-between py-2">
          <div>
            <p className={`font-medium text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Show QR Code
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Add QR code for digital receipt
            </p>
          </div>
          <button
            onClick={() => handleToggle('showQRCode')}
            className={`
              relative inline-flex h-12 w-20 items-center rounded-full transition-colors
              ${settings.showQRCode
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
                ${settings.showQRCode ? 'translate-x-10' : 'translate-x-2'}
              `}
            />
          </button>
        </div>

        {/* Auto Print */}
        <div className="flex items-center justify-between py-2">
          <div>
            <p className={`font-medium text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Auto Print
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Automatically print after payment
            </p>
          </div>
          <button
            onClick={() => handleToggle('autoprint')}
            className={`
              relative inline-flex h-12 w-20 items-center rounded-full transition-colors
              ${settings.autoprint
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
                ${settings.autoprint ? 'translate-x-10' : 'translate-x-2'}
              `}
            />
          </button>
        </div>
      </div>

      {/* Receipt Format */}
      <div className={`
        p-6 rounded-lg space-y-4
        ${theme === 'dark'
          ? 'bg-gray-700/30 border border-gray-600'
          : 'bg-gray-50 border border-gray-200'
        }
      `}>
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Receipt Format
        </h3>

        {/* Paper Size - Touch-safe: 56px height */}
        <div>
          <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Paper Size
          </label>
          <select
            value={settings.paperSize}
            onChange={(e) => handleChange('paperSize', e.target.value)}
            className={`
              w-full px-4 py-4 rounded-lg border text-base min-h-[56px]
              ${theme === 'dark'
                ? 'bg-gray-800 border-gray-600 text-white focus:border-primary-500'
                : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
              }
              focus:outline-none focus:ring-2 focus:ring-primary-500/20
            `}
          >
            <option value="thermal-80mm">Thermal 80mm (Standard)</option>
            <option value="thermal-58mm">Thermal 58mm (Compact)</option>
            <option value="a4">A4 Paper</option>
            <option value="letter">Letter Paper</option>
          </select>
        </div>

        {/* Footer Message - Touch-safe: 56px height */}
        <div>
          <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Footer Message
          </label>
          <textarea
            value={settings.footerMessage}
            onChange={(e) => handleChange('footerMessage', e.target.value)}
            placeholder="Thank you message..."
            rows={3}
            className={`
              w-full px-4 py-4 rounded-lg border text-base
              ${theme === 'dark'
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-primary-500'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-primary-500'
              }
              focus:outline-none focus:ring-2 focus:ring-primary-500/20
            `}
          />
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

