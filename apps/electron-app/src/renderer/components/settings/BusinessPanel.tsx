import { useState } from 'react'
import { useAppStore, useSettingsStore, BusinessMode } from '../../stores'

export function BusinessPanel() {
  const { theme } = useAppStore()
  const { business, setBusinessMode, updateBusinessSettings } = useSettingsStore()
  const [previewAmount] = useState(1234.56)

  const handleModeChange = (mode: BusinessMode) => {
    setBusinessMode(mode)
  }

  const handleToggle = (field: keyof typeof business, value: boolean) => {
    updateBusinessSettings({ [field]: value })
  }

  const handleCurrencyChange = (field: string, value: any) => {
    const keys = field.split('.')
    if (keys.length === 1) {
      updateBusinessSettings({
        currencyConfig: {
          ...business.currencyConfig,
          [field]: value
        }
      })
    } else if (keys.length === 3) {
      updateBusinessSettings({
        currencyConfig: {
          ...business.currencyConfig,
          regionSpecific: {
            ...business.currencyConfig.regionSpecific,
            [keys[1]]: {
              ...business.currencyConfig.regionSpecific[keys[1] as 'india' | 'middleEast'],
              [keys[2]]: value
            }
          }
        }
      })
    }
  }

  const formatPreview = () => {
    const { symbol, symbolPosition, decimalPlaces, thousandSeparator, decimalSeparator } = business.currencyConfig
    const parts = previewAmount.toFixed(decimalPlaces).split('.')
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator)
    const formatted = parts[1] ? `${integerPart}${decimalSeparator}${parts[1]}` : integerPart
    return symbolPosition === 'before' ? `${symbol}${formatted}` : `${formatted}${symbol}`
  }

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar', decimals: 2 },
    { code: 'EUR', symbol: '€', name: 'Euro', decimals: 2 },
    { code: 'GBP', symbol: '£', name: 'British Pound', decimals: 2 },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee', decimals: 2 },
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', decimals: 2 },
    { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal', decimals: 2 },
    { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar', decimals: 3 },
    { code: 'BHD', symbol: 'د.ب', name: 'Bahraini Dinar', decimals: 3 },
    { code: 'OMR', symbol: 'ر.ع', name: 'Omani Rial', decimals: 3 },
    { code: 'QAR', symbol: 'ر.ق', name: 'Qatari Riyal', decimals: 2 }
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Panel Header */}
      <div className="mb-6">
        <h2 className={`
          text-2xl font-bold mb-2
          ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
        `}>
          Business Settings
        </h2>
        <p className={`
          text-sm
          ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
        `}>
          Configure your business type and mode-specific features
        </p>
      </div>

      {/* Business Mode Selector */}
      <div className={`
        p-4 rounded-lg
        ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}
      `}>
        <h3 className={`
          text-lg font-semibold mb-4
          ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
        `}>
          Business Mode
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Restaurant Mode */}
          <button
            onClick={() => handleModeChange('restaurant')}
            className={`
              p-6 rounded-lg border-2 transition-all duration-200
              ${business.mode === 'restaurant'
                ? theme === 'dark'
                  ? 'bg-blue-500/20 border-blue-500'
                  : 'bg-blue-50 border-blue-500'
                : theme === 'dark'
                  ? 'bg-gray-800/50 border-gray-600 hover:border-gray-500'
                  : 'bg-white border-gray-300 hover:border-gray-400'
              }
            `}
          >
            <div className="flex flex-col items-center text-center">
              <div className={`
                p-3 rounded-full mb-3
                ${business.mode === 'restaurant'
                  ? 'bg-blue-500 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-200 text-gray-600'
                }
              `}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className={`
                font-semibold mb-1
                ${business.mode === 'restaurant'
                  ? theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  : theme === 'dark' ? 'text-white' : 'text-gray-900'
                }
              `}>
                Restaurant Mode
              </h4>
              <p className={`
                text-sm
                ${business.mode === 'restaurant'
                  ? theme === 'dark' ? 'text-blue-300' : 'text-blue-600'
                  : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }
              `}>
                Table management, kitchen display, reservations
              </p>
            </div>
          </button>

          {/* Retail Mode */}
          <button
            onClick={() => handleModeChange('retail')}
            className={`
              p-6 rounded-lg border-2 transition-all duration-200
              ${business.mode === 'retail'
                ? theme === 'dark'
                  ? 'bg-blue-500/20 border-blue-500'
                  : 'bg-blue-50 border-blue-500'
                : theme === 'dark'
                  ? 'bg-gray-800/50 border-gray-600 hover:border-gray-500'
                  : 'bg-white border-gray-300 hover:border-gray-400'
              }
            `}
          >
            <div className="flex flex-col items-center text-center">
              <div className={`
                p-3 rounded-full mb-3
                ${business.mode === 'retail'
                  ? 'bg-blue-500 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-200 text-gray-600'
                }
              `}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h4 className={`
                font-semibold mb-1
                ${business.mode === 'retail'
                  ? theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  : theme === 'dark' ? 'text-white' : 'text-gray-900'
                }
              `}>
                Retail Mode
              </h4>
              <p className={`
                text-sm
                ${business.mode === 'retail'
                  ? theme === 'dark' ? 'text-blue-300' : 'text-blue-600'
                  : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }
              `}>
                Barcode scanning, quick checkout, loyalty programs
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Restaurant Mode Features */}
      {business.mode === 'restaurant' && (
        <div className={`
          p-4 rounded-lg animate-fadeIn
          ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}
        `}>
          <h3 className={`
            text-lg font-semibold mb-4
            ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
          `}>
            Restaurant Features
          </h3>

          <div className="space-y-4">
            {/* Table Management */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Table Management
                </h4>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Enable table assignment and management
                </p>
              </div>
              <button
                onClick={() => handleToggle('enableTableManagement', !business.enableTableManagement)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${business.enableTableManagement ? 'bg-blue-500' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${business.enableTableManagement ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>

            {/* Reservations */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Reservations
                </h4>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Enable table reservation system
                </p>
              </div>
              <button
                onClick={() => handleToggle('enableReservations', !business.enableReservations)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${business.enableReservations ? 'bg-blue-500' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${business.enableReservations ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>

            {/* Kitchen Display */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Kitchen Display System
                </h4>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Send orders to kitchen display
                </p>
              </div>
              <button
                onClick={() => handleToggle('enableKitchenDisplay', !business.enableKitchenDisplay)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${business.enableKitchenDisplay ? 'bg-blue-500' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${business.enableKitchenDisplay ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Retail Mode Features */}
      {business.mode === 'retail' && (
        <div className={`
          p-4 rounded-lg animate-fadeIn
          ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}
        `}>
          <h3 className={`
            text-lg font-semibold mb-4
            ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
          `}>
            Retail Features
          </h3>

          <div className="space-y-4">
            {/* Barcode Scanner */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Barcode Scanner
                </h4>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Enable barcode scanning for products
                </p>
              </div>
              <button
                onClick={() => handleToggle('enableBarcodeScanner', !business.enableBarcodeScanner)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${business.enableBarcodeScanner ? 'bg-blue-500' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${business.enableBarcodeScanner ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>

            {/* Loyalty Program */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Loyalty Program
                </h4>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Enable customer loyalty rewards
                </p>
              </div>
              <button
                onClick={() => handleToggle('enableLoyaltyProgram', !business.enableLoyaltyProgram)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${business.enableLoyaltyProgram ? 'bg-blue-500' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${business.enableLoyaltyProgram ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>

            {/* Quick Checkout */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Quick Checkout
                </h4>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Enable fast checkout process
                </p>
              </div>
              <button
                onClick={() => handleToggle('enableQuickCheckout', !business.enableQuickCheckout)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${business.enableQuickCheckout ? 'bg-blue-500' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${business.enableQuickCheckout ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Currency Configuration Section */}
      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Currency Configuration
        </h3>

        <div className="space-y-4">
          {/* Currency Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Currency
              </label>
              <select
                value={business.currencyConfig.code}
                onChange={(e) => {
                  const selected = currencies.find(c => c.code === e.target.value)
                  if (selected) {
                    handleCurrencyChange('code', selected.code)
                    handleCurrencyChange('symbol', selected.symbol)
                    handleCurrencyChange('decimalPlaces', selected.decimals)
                  }
                }}
                className={`w-full px-4 py-2 rounded-lg min-h-[44px] ${theme === 'dark' ? 'bg-gray-800 border border-gray-600 text-white focus:border-blue-500' : 'bg-white border border-gray-300 text-gray-900 focus:border-blue-500'} focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                {currencies.map(curr => (
                  <option key={curr.code} value={curr.code}>{curr.code} - {curr.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Symbol Position
              </label>
              <select
                value={business.currencyConfig.symbolPosition}
                onChange={(e) => handleCurrencyChange('symbolPosition', e.target.value)}
                className={`w-full px-4 py-2 rounded-lg min-h-[44px] ${theme === 'dark' ? 'bg-gray-800 border border-gray-600 text-white focus:border-blue-500' : 'bg-white border border-gray-300 text-gray-900 focus:border-blue-500'} focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                <option value="before">Before Amount ({business.currencyConfig.symbol}100)</option>
                <option value="after">After Amount (100{business.currencyConfig.symbol})</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Decimal Places
              </label>
              <input
                type="number"
                min="0"
                max="3"
                value={business.currencyConfig.decimalPlaces}
                onChange={(e) => handleCurrencyChange('decimalPlaces', parseInt(e.target.value))}
                className={`w-full px-4 py-2 rounded-lg min-h-[44px] ${theme === 'dark' ? 'bg-gray-800 border border-gray-600 text-white focus:border-blue-500' : 'bg-white border border-gray-300 text-gray-900 focus:border-blue-500'} focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Thousand Separator
              </label>
              <select
                value={business.currencyConfig.thousandSeparator}
                onChange={(e) => handleCurrencyChange('thousandSeparator', e.target.value)}
                className={`w-full px-4 py-2 rounded-lg min-h-[44px] ${theme === 'dark' ? 'bg-gray-800 border border-gray-600 text-white focus:border-blue-500' : 'bg-white border border-gray-300 text-gray-900 focus:border-blue-500'} focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                <option value=",">Comma (1,234.56)</option>
                <option value=".">Period (1.234,56)</option>
                <option value=" ">Space (1 234.56)</option>
                <option value="">None (1234.56)</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Decimal Separator
              </label>
              <select
                value={business.currencyConfig.decimalSeparator}
                onChange={(e) => handleCurrencyChange('decimalSeparator', e.target.value)}
                className={`w-full px-4 py-2 rounded-lg min-h-[44px] ${theme === 'dark' ? 'bg-gray-800 border border-gray-600 text-white focus:border-blue-500' : 'bg-white border border-gray-300 text-gray-900 focus:border-blue-500'} focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                <option value=".">Period (1,234.56)</option>
                <option value=",">Comma (1.234,56)</option>
              </select>
            </div>

            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={business.currencyConfig.showCurrencyCode}
                  onChange={(e) => handleCurrencyChange('showCurrencyCode', e.target.checked)}
                  className="w-5 h-5 rounded"
                />
                <span className={`ml-3 text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Show Currency Code
                </span>
              </label>
            </div>
          </div>

          {/* Preview */}
          <div className={`p-4 rounded-lg border-2 ${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Preview:
              </span>
              <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatPreview()}
                {business.currencyConfig.showCurrencyCode && ` ${business.currencyConfig.code}`}
              </span>
            </div>
          </div>

          {/* India-Specific Settings */}
          {business.currencyConfig.code === 'INR' && (
            <div className={`p-4 rounded-lg border-2 ${theme === 'dark' ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'}`}>
              <h4 className={`text-md font-semibold mb-3 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-900'}`}>
                India-Specific Settings
              </h4>
              <div className="space-y-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={business.currencyConfig.regionSpecific.india.enabled}
                    onChange={(e) => handleCurrencyChange('regionSpecific.india.enabled', e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                  <span className={`ml-3 text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Enable India-Specific Features
                  </span>
                </label>
                {business.currencyConfig.regionSpecific.india.enabled && (
                  <>
                    <label className="flex items-center cursor-pointer ml-8">
                      <input
                        type="checkbox"
                        checked={business.currencyConfig.regionSpecific.india.gstEnabled}
                        onChange={(e) => handleCurrencyChange('regionSpecific.india.gstEnabled', e.target.checked)}
                        className="w-5 h-5 rounded"
                      />
                      <span className={`ml-3 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Enable GST
                      </span>
                    </label>
                    <label className="flex items-center cursor-pointer ml-8">
                      <input
                        type="checkbox"
                        checked={business.currencyConfig.regionSpecific.india.showPaisa}
                        onChange={(e) => handleCurrencyChange('regionSpecific.india.showPaisa', e.target.checked)}
                        className="w-5 h-5 rounded"
                      />
                      <span className={`ml-3 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Show Paisa (Decimal Places)
                      </span>
                    </label>
                    <label className="flex items-center cursor-pointer ml-8">
                      <input
                        type="checkbox"
                        checked={business.currencyConfig.regionSpecific.india.useIndianNumbering}
                        onChange={(e) => handleCurrencyChange('regionSpecific.india.useIndianNumbering', e.target.checked)}
                        className="w-5 h-5 rounded"
                      />
                      <span className={`ml-3 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Use Indian Numbering System (Lakhs/Crores)
                      </span>
                    </label>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Middle East Settings */}
          {['AED', 'SAR', 'KWD', 'BHD', 'OMR', 'QAR'].includes(business.currencyConfig.code) && (
            <div className={`p-4 rounded-lg border-2 ${theme === 'dark' ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200'}`}>
              <h4 className={`text-md font-semibold mb-3 ${theme === 'dark' ? 'text-green-400' : 'text-green-900'}`}>
                Middle East Settings
              </h4>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={business.currencyConfig.regionSpecific.middleEast.enabled}
                  onChange={(e) => handleCurrencyChange('regionSpecific.middleEast.enabled', e.target.checked)}
                  className="w-5 h-5 rounded"
                />
                <span className={`ml-3 text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Enable Middle East-Specific Features
                </span>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

