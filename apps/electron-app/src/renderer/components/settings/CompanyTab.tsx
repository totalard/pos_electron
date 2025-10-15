import { useState, useEffect } from 'react'
import { useAppStore } from '../../stores'

interface CompanySettings {
  companyName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  currency: string
  taxId: string
  businessLicense: string
  website: string
  logo: string // Base64 encoded image or file path
}

const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
]

export function CompanyTab() {
  const { theme } = useAppStore()
  const [settings, setSettings] = useState<CompanySettings>({
    companyName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    currency: 'USD',
    taxId: '',
    businessLicense: '',
    website: '',
    logo: ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')

  // Load saved settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('companySettings')
    if (saved) {
      try {
        const parsedSettings = JSON.parse(saved)
        setSettings(parsedSettings)
        if (parsedSettings.logo) {
          setLogoPreview(parsedSettings.logo)
        }
      } catch (error) {
        console.error('Failed to load company settings:', error)
      }
    }
  }, [])

  const handleChange = (field: keyof CompanySettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setSaveMessage({ type: 'error', text: 'Logo file size must be less than 2MB' })
        setTimeout(() => setSaveMessage(null), 3000)
        return
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setSaveMessage({ type: 'error', text: 'Please upload an image file' })
        setTimeout(() => setSaveMessage(null), 3000)
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setLogoPreview(base64String)
        setSettings(prev => ({ ...prev, logo: base64String }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveLogo = () => {
    setLogoPreview('')
    setSettings(prev => ({ ...prev, logo: '' }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage(null)

    try {
      // Save to localStorage
      localStorage.setItem('companySettings', JSON.stringify(settings))
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setSaveMessage({ type: 'success', text: 'Company settings saved successfully!' })
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
          Company Settings
        </h2>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Manage your company information and preferences
        </p>
      </div>

      {/* Company Logo */}
      <div className={`
        p-6 rounded-lg space-y-4
        ${theme === 'dark'
          ? 'bg-gray-700/30 border border-gray-600'
          : 'bg-gray-50 border border-gray-200'
        }
      `}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Company Logo
        </h3>

        <div className="flex items-start gap-6">
          {/* Logo Preview */}
          <div className={`
            w-40 h-40 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden
            ${theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'}
          `}>
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Company Logo"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center p-4">
                <svg className={`w-12 h-12 mx-auto mb-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  No logo
                </p>
              </div>
            )}
          </div>

          {/* Upload Controls */}
          <div className="flex-1 space-y-4">
            <div>
              <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Upload your company logo
              </p>
              <p className={`text-xs mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Recommended: Square image, max 2MB (PNG, JPG, or SVG)
              </p>
            </div>

            <div className="flex gap-3">
              {/* Upload Button - Touch-safe: 56px */}
              <label className={`
                px-6 py-4 rounded-lg font-medium transition-colors cursor-pointer text-base min-h-[56px] flex items-center gap-2
                ${theme === 'dark'
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-primary-500 hover:bg-primary-600 text-white'
                }
              `}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload Logo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>

              {/* Remove Button - Touch-safe: 56px */}
              {logoPreview && (
                <button
                  onClick={handleRemoveLogo}
                  className={`
                    px-6 py-4 rounded-lg font-medium transition-colors text-base min-h-[56px] flex items-center gap-2
                    ${theme === 'dark'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                    }
                  `}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Company Information */}
      <div className={`
        p-6 rounded-lg space-y-4
        ${theme === 'dark'
          ? 'bg-gray-700/30 border border-gray-600'
          : 'bg-gray-50 border border-gray-200'
        }
      `}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Company Information
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Company Name */}
          <div className="col-span-2">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Company Name *
            </label>
            {/* Touch-safe input: 56px height */}
            <input
              type="text"
              value={settings.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              placeholder="Enter company name"
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

          {/* Email */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Email
            </label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="company@example.com"
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

          {/* Phone */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Phone
            </label>
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
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
        </div>

        {/* POS-specific fields */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          {/* Tax ID */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Tax ID / EIN
            </label>
            <input
              type="text"
              value={settings.taxId}
              onChange={(e) => handleChange('taxId', e.target.value)}
              placeholder="XX-XXXXXXX"
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

          {/* Business License */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Business License
            </label>
            <input
              type="text"
              value={settings.businessLicense}
              onChange={(e) => handleChange('businessLicense', e.target.value)}
              placeholder="License number"
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

          {/* Website */}
          <div className="col-span-2">
            <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Website
            </label>
            <input
              type="url"
              value={settings.website}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="https://www.example.com"
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
        </div>
      </div>

      {/* Address Information */}
      <div className={`
        p-6 rounded-lg space-y-4
        ${theme === 'dark'
          ? 'bg-gray-700/30 border border-gray-600'
          : 'bg-gray-50 border border-gray-200'
        }
      `}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Address
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Street Address - Touch-safe: 56px height */}
          <div className="col-span-2">
            <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Street Address
            </label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="123 Main Street"
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

          {/* City - Touch-safe: 56px height */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              City
            </label>
            <input
              type="text"
              value={settings.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="New York"
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

          {/* State/Province - Touch-safe: 56px height */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              State/Province
            </label>
            <input
              type="text"
              value={settings.state}
              onChange={(e) => handleChange('state', e.target.value)}
              placeholder="NY"
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

          {/* ZIP Code - Touch-safe: 56px height */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              ZIP/Postal Code
            </label>
            <input
              type="text"
              value={settings.zipCode}
              onChange={(e) => handleChange('zipCode', e.target.value)}
              placeholder="10001"
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

          {/* Country - Touch-safe: 56px height */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Country
            </label>
            <input
              type="text"
              value={settings.country}
              onChange={(e) => handleChange('country', e.target.value)}
              placeholder="United States"
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
        </div>
      </div>

      {/* Currency Selection */}
      <div className={`
        p-6 rounded-lg space-y-4
        ${theme === 'dark'
          ? 'bg-gray-700/30 border border-gray-600'
          : 'bg-gray-50 border border-gray-200'
        }
      `}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Currency
        </h3>

        <div>
          <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Default Currency *
          </label>
          {/* Touch-safe select: 56px height */}
          <select
            value={settings.currency}
            onChange={(e) => handleChange('currency', e.target.value)}
            className={`
              w-full px-4 py-4 rounded-lg border text-base min-h-[56px]
              ${theme === 'dark'
                ? 'bg-gray-800 border-gray-600 text-white focus:border-primary-500'
                : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
              }
              focus:outline-none focus:ring-2 focus:ring-primary-500/20
            `}
          >
            {currencies.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.symbol} - {currency.name} ({currency.code})
              </option>
            ))}
          </select>
          <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
            This currency will be used for all transactions and reports
          </p>
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

