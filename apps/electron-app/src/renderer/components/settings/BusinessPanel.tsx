import { useState } from 'react'
import { useAppStore, useSettingsStore, BusinessMode } from '../../stores'
import { useCurrency } from '../../hooks/useCurrency'
import { FormSection, TouchSelect, Toggle, Checkbox, NumberInput } from '../forms'

export function BusinessPanel() {
  const { theme } = useAppStore()
  const { business, setBusinessMode, updateBusinessSettings } = useSettingsStore()
  const { formatCurrency } = useCurrency()
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

  const timezones = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)', description: 'UTC and Coordinates' },
    { value: 'Africa/Cairo', label: 'Cairo (EET/EEST)', description: 'Africa' },
    { value: 'Africa/Johannesburg', label: 'Johannesburg (SAST)', description: 'Africa' },
    { value: 'Africa/Lagos', label: 'Lagos (WAT)', description: 'Africa' },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)', description: 'Asia' },
    { value: 'Asia/Dubai', label: 'Dubai (GST)', description: 'Asia' },
    { value: 'Asia/Kolkata', label: 'India (IST)', description: 'Asia' },
    { value: 'Asia/Bangkok', label: 'Bangkok (ICT)', description: 'Asia' },
    { value: 'Asia/Singapore', label: 'Singapore (SGT)', description: 'Asia' },
    { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)', description: 'Asia' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)', description: 'Asia' },
    { value: 'Asia/Seoul', label: 'Seoul (KST)', description: 'Asia' },
    { value: 'Asia/Manila', label: 'Manila (PHT)', description: 'Asia' },
    { value: 'Europe/London', label: 'London (GMT/BST)', description: 'Europe' },
    { value: 'Europe/Paris', label: 'Paris (CET/CEST)', description: 'Europe' },
    { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)', description: 'Europe' },
    { value: 'Europe/Amsterdam', label: 'Amsterdam (CET/CEST)', description: 'Europe' },
    { value: 'Europe/Madrid', label: 'Madrid (CET/CEST)', description: 'Europe' },
    { value: 'Europe/Rome', label: 'Rome (CET/CEST)', description: 'Europe' },
    { value: 'Europe/Brussels', label: 'Brussels (CET/CEST)', description: 'Europe' },
    { value: 'Europe/Vienna', label: 'Vienna (CET/CEST)', description: 'Europe' },
    { value: 'Europe/Prague', label: 'Prague (CET/CEST)', description: 'Europe' },
    { value: 'Europe/Warsaw', label: 'Warsaw (CET/CEST)', description: 'Europe' },
    { value: 'Europe/Moscow', label: 'Moscow (MSK)', description: 'Europe' },
    { value: 'Europe/Istanbul', label: 'Istanbul (EET/EEST)', description: 'Europe' },
    { value: 'Asia/Riyadh', label: 'Saudi Arabia (AST)', description: 'Middle East' },
    { value: 'Asia/Kuwait', label: 'Kuwait (AST)', description: 'Middle East' },
    { value: 'Asia/Bahrain', label: 'Bahrain (AST)', description: 'Middle East' },
    { value: 'Asia/Qatar', label: 'Qatar (AST)', description: 'Middle East' },
    { value: 'Asia/Oman', label: 'Oman (GST)', description: 'Middle East' },
    { value: 'Asia/Jerusalem', label: 'Israel (IST/IDT)', description: 'Middle East' },
    { value: 'America/New_York', label: 'Eastern Time (EST/EDT)', description: 'North America' },
    { value: 'America/Chicago', label: 'Central Time (CST/CDT)', description: 'North America' },
    { value: 'America/Denver', label: 'Mountain Time (MST/MDT)', description: 'North America' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PST/PDT)', description: 'North America' },
    { value: 'America/Anchorage', label: 'Alaska (AKST/AKDT)', description: 'North America' },
    { value: 'Pacific/Honolulu', label: 'Hawaii (HST)', description: 'North America' },
    { value: 'America/Toronto', label: 'Toronto (EST/EDT)', description: 'North America' },
    { value: 'America/Mexico_City', label: 'Mexico City (CST/CDT)', description: 'North America' },
    { value: 'America/Sao_Paulo', label: 'São Paulo (BRT/BRST)', description: 'South America' },
    { value: 'America/Buenos_Aires', label: 'Buenos Aires (ART)', description: 'South America' },
    { value: 'America/Santiago', label: 'Santiago (CLT/CLST)', description: 'South America' },
    { value: 'America/Bogota', label: 'Bogota (COT)', description: 'South America' },
    { value: 'America/Lima', label: 'Lima (PET)', description: 'South America' },
    { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)', description: 'Australia & Pacific' },
    { value: 'Australia/Melbourne', label: 'Melbourne (AEDT/AEST)', description: 'Australia & Pacific' },
    { value: 'Australia/Brisbane', label: 'Brisbane (AEST)', description: 'Australia & Pacific' },
    { value: 'Australia/Perth', label: 'Perth (AWST)', description: 'Australia & Pacific' },
    { value: 'Australia/Adelaide', label: 'Adelaide (ACDT/ACST)', description: 'Australia & Pacific' },
    { value: 'Pacific/Auckland', label: 'Auckland (NZDT/NZST)', description: 'Australia & Pacific' }
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
        <FormSection
          title="Restaurant Features"
          description="Configure restaurant-specific features"
        >
          <div className="space-y-4">
            <Toggle
              checked={business.enableTableManagement}
              onChange={(checked) => handleToggle('enableTableManagement', checked)}
              label="Table Management"
              description="Enable table assignment and management"
            />
            <Toggle
              checked={business.enableReservations}
              onChange={(checked) => handleToggle('enableReservations', checked)}
              label="Reservations"
              description="Enable table reservation system"
            />
            <Toggle
              checked={business.enableKitchenDisplay}
              onChange={(checked) => handleToggle('enableKitchenDisplay', checked)}
              label="Kitchen Display System"
              description="Send orders to kitchen display"
            />
          </div>
        </FormSection>
      )}

      {/* Retail Mode Features */}
      {business.mode === 'retail' && (
        <FormSection
          title="Retail Features"
          description="Configure retail-specific features"
        >
          <div className="space-y-4">
            <Toggle
              checked={business.enableBarcodeScanner}
              onChange={(checked) => handleToggle('enableBarcodeScanner', checked)}
              label="Barcode Scanner"
              description="Enable barcode scanning for products"
            />
            <Toggle
              checked={business.enableLoyaltyProgram}
              onChange={(checked) => handleToggle('enableLoyaltyProgram', checked)}
              label="Loyalty Program"
              description="Enable customer loyalty rewards"
            />
            <Toggle
              checked={business.enableQuickCheckout}
              onChange={(checked) => handleToggle('enableQuickCheckout', checked)}
              label="Quick Checkout"
              description="Enable fast checkout process"
            />
          </div>
        </FormSection>
      )}

      {/* Currency Configuration Section */}
      <FormSection
        title="Currency Configuration"
        description="Configure currency display and formatting"
      >
        <div className="space-y-4">
          {/* Currency Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TouchSelect
              label="Currency"
              value={business.currencyConfig.code}
              options={currencies.map(curr => ({
                value: curr.code,
                label: `${curr.code} - ${curr.name}`
              }))}
              onChange={(value) => {
                const selected = currencies.find(c => c.code === value)
                if (selected) {
                  updateBusinessSettings({
                    currencyConfig: {
                      ...business.currencyConfig,
                      code: selected.code,
                      symbol: selected.symbol,
                      decimalPlaces: selected.decimals
                    }
                  })
                }
              }}
              searchable
            />

            <TouchSelect
              label="Symbol Position"
              value={business.currencyConfig.symbolPosition}
              options={[
                { value: 'before', label: `Before Amount (${business.currencyConfig.symbol}100)` },
                { value: 'after', label: `After Amount (100${business.currencyConfig.symbol})` }
              ]}
              onChange={(value) => handleCurrencyChange('symbolPosition', value as string)}
            />

            <NumberInput
              label="Decimal Places"
              value={business.currencyConfig.decimalPlaces}
              onChange={(value) => handleCurrencyChange('decimalPlaces', value)}
              min={0}
              max={3}
              step={1}
              showButtons
            />

            <TouchSelect
              label="Thousand Separator"
              value={business.currencyConfig.thousandSeparator}
              options={[
                { value: ',', label: 'Comma (1,234.56)' },
                { value: '.', label: 'Period (1.234,56)' },
                { value: ' ', label: 'Space (1 234.56)' },
                { value: '', label: 'None (1234.56)' }
              ]}
              onChange={(value) => handleCurrencyChange('thousandSeparator', value as string)}
            />

            <TouchSelect
              label="Decimal Separator"
              value={business.currencyConfig.decimalSeparator}
              options={[
                { value: '.', label: 'Period (1,234.56)' },
                { value: ',', label: 'Comma (1.234,56)' }
              ]}
              onChange={(value) => handleCurrencyChange('decimalSeparator', value as string)}
            />

            <div className="flex items-center">
              <Checkbox
                checked={business.currencyConfig.showCurrencyCode}
                onChange={(checked) => handleCurrencyChange('showCurrencyCode', checked)}
                label="Show Currency Code"
              />
            </div>
          </div>

          {/* Preview */}
          <div className={`p-4 rounded-lg border-2 ${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Preview:
              </span>
              <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(previewAmount)}
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
                <Checkbox
                  checked={business.currencyConfig.regionSpecific.india.enabled}
                  onChange={(checked) => handleCurrencyChange('regionSpecific.india.enabled', checked)}
                  label="Enable India-Specific Features"
                />
                {business.currencyConfig.regionSpecific.india.enabled && (
                  <div className="ml-8 space-y-3">
                    <Checkbox
                      checked={business.currencyConfig.regionSpecific.india.gstEnabled}
                      onChange={(checked) => handleCurrencyChange('regionSpecific.india.gstEnabled', checked)}
                      label="Enable GST"
                      size="sm"
                    />
                    <Checkbox
                      checked={business.currencyConfig.regionSpecific.india.showPaisa}
                      onChange={(checked) => handleCurrencyChange('regionSpecific.india.showPaisa', checked)}
                      label="Show Paisa (Decimal Places)"
                      size="sm"
                    />
                    <Checkbox
                      checked={business.currencyConfig.regionSpecific.india.useIndianNumbering}
                      onChange={(checked) => handleCurrencyChange('regionSpecific.india.useIndianNumbering', checked)}
                      label="Use Indian Numbering System (Lakhs/Crores)"
                      size="sm"
                    />
                  </div>
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
              <Checkbox
                checked={business.currencyConfig.regionSpecific.middleEast.enabled}
                onChange={(checked) => handleCurrencyChange('regionSpecific.middleEast.enabled', checked)}
                label="Enable Middle East-Specific Features"
              />
            </div>
          )}
        </div>
      </FormSection>

      {/* Timezone Configuration Section */}
      <FormSection
        title="Timezone Configuration"
        description="Set the business timezone for accurate time tracking, reporting, and scheduling"
      >
        <div className="space-y-4">
          <TouchSelect
            label="Business Timezone"
            value={business.timezone || 'UTC'}
            options={timezones}
            onChange={(value) => updateBusinessSettings({ timezone: value as string })}
            searchable
            helperText="This timezone affects transaction timestamps, report generation, business hours scheduling, and shift management"
          />

          {/* Timezone Information */}
          <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800 border border-gray-600' : 'bg-white border border-gray-200'}`}>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              <span className="font-medium">📍 Current Timezone: </span>
              {business.timezone || 'UTC'}
            </p>
          </div>
        </div>
      </FormSection>
    </div>
  )
}

