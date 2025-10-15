import { useState, useEffect } from 'react'
import { useAppStore } from '../../stores'

interface PaymentMethod {
  id: string
  name: string
  enabled: boolean
  icon: string
}

interface PaymentSettings {
  enableCash: boolean
  enableCard: boolean
  enableMobile: boolean
  enableGiftCard: boolean
  enableStoreCredit: boolean
  cashRoundingEnabled: boolean
  cashRoundingAmount: number
  tipEnabled: boolean
  tipSuggestions: number[]
  splitPaymentEnabled: boolean
  partialPaymentEnabled: boolean
  requireSignatureAmount: number
  autoOpenCashDrawer: boolean
}

export function PaymentTab() {
  const { theme } = useAppStore()
  const [settings, setSettings] = useState<PaymentSettings>({
    enableCash: true,
    enableCard: true,
    enableMobile: false,
    enableGiftCard: false,
    enableStoreCredit: false,
    cashRoundingEnabled: false,
    cashRoundingAmount: 0.05,
    tipEnabled: true,
    tipSuggestions: [15, 18, 20, 25],
    splitPaymentEnabled: true,
    partialPaymentEnabled: false,
    requireSignatureAmount: 25,
    autoOpenCashDrawer: true
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Load saved settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('paymentSettings')
    if (saved) {
      try {
        setSettings(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to load payment settings:', error)
      }
    }
  }, [])

  const handleToggle = (field: keyof PaymentSettings) => {
    setSettings(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleChange = (field: keyof PaymentSettings, value: number) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage(null)

    try {
      localStorage.setItem('paymentSettings', JSON.stringify(settings))
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setSaveMessage({ type: 'success', text: 'Payment settings saved successfully!' })
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
          Payment Settings
        </h2>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Configure payment methods and processing options
        </p>
      </div>

      {/* Payment Methods */}
      <div className={`
        p-6 rounded-lg space-y-6
        ${theme === 'dark'
          ? 'bg-gray-700/30 border border-gray-600'
          : 'bg-gray-50 border border-gray-200'
        }
      `}>
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Accepted Payment Methods
        </h3>

        {/* Cash Payment - Touch-safe: 56px height */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className={`font-medium text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Cash
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Accept cash payments
              </p>
            </div>
          </div>
          {/* Touch-safe toggle: 48x48px minimum */}
          <button
            onClick={() => handleToggle('enableCash')}
            className={`
              relative inline-flex h-12 w-20 items-center rounded-full transition-colors
              ${settings.enableCash
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
                ${settings.enableCash ? 'translate-x-10' : 'translate-x-2'}
              `}
            />
          </button>
        </div>

        {/* Card Payment - Touch-safe: 56px height */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <p className={`font-medium text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Credit/Debit Card
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Accept card payments
              </p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('enableCard')}
            className={`
              relative inline-flex h-12 w-20 items-center rounded-full transition-colors
              ${settings.enableCard
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
                ${settings.enableCard ? 'translate-x-10' : 'translate-x-2'}
              `}
            />
          </button>
        </div>

        {/* Mobile Payment - Touch-safe: 56px height */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className={`font-medium text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Mobile Payments
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Apple Pay, Google Pay, etc.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('enableMobile')}
            className={`
              relative inline-flex h-12 w-20 items-center rounded-full transition-colors
              ${settings.enableMobile
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
                ${settings.enableMobile ? 'translate-x-10' : 'translate-x-2'}
              `}
            />
          </button>
        </div>

        {/* Gift Card - Touch-safe: 56px height */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <div>
              <p className={`font-medium text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Gift Cards
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Accept gift card payments
              </p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('enableGiftCard')}
            className={`
              relative inline-flex h-12 w-20 items-center rounded-full transition-colors
              ${settings.enableGiftCard
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
                ${settings.enableGiftCard ? 'translate-x-10' : 'translate-x-2'}
              `}
            />
          </button>
        </div>
      </div>

      {/* Payment Options */}
      <div className={`
        p-6 rounded-lg space-y-6
        ${theme === 'dark'
          ? 'bg-gray-700/30 border border-gray-600'
          : 'bg-gray-50 border border-gray-200'
        }
      `}>
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Payment Options
        </h3>

        {/* Tip Settings */}
        <div className="flex items-center justify-between py-2">
          <div>
            <p className={`font-medium text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Enable Tips
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Allow customers to add tips
            </p>
          </div>
          <button
            onClick={() => handleToggle('tipEnabled')}
            className={`
              relative inline-flex h-12 w-20 items-center rounded-full transition-colors
              ${settings.tipEnabled
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
                ${settings.tipEnabled ? 'translate-x-10' : 'translate-x-2'}
              `}
            />
          </button>
        </div>

        {/* Split Payment */}
        <div className="flex items-center justify-between py-2">
          <div>
            <p className={`font-medium text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Split Payments
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Allow splitting bills across multiple payments
            </p>
          </div>
          <button
            onClick={() => handleToggle('splitPaymentEnabled')}
            className={`
              relative inline-flex h-12 w-20 items-center rounded-full transition-colors
              ${settings.splitPaymentEnabled
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
                ${settings.splitPaymentEnabled ? 'translate-x-10' : 'translate-x-2'}
              `}
            />
          </button>
        </div>

        {/* Auto Open Cash Drawer */}
        <div className="flex items-center justify-between py-2">
          <div>
            <p className={`font-medium text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Auto Open Cash Drawer
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Automatically open drawer on cash payment
            </p>
          </div>
          <button
            onClick={() => handleToggle('autoOpenCashDrawer')}
            className={`
              relative inline-flex h-12 w-20 items-center rounded-full transition-colors
              ${settings.autoOpenCashDrawer
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
                ${settings.autoOpenCashDrawer ? 'translate-x-10' : 'translate-x-2'}
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

