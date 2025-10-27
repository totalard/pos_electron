import { useState, useEffect } from 'react'
import { useAppStore, useSettingsStore } from '../../stores'
import { useCurrency } from '../../hooks/useCurrency'
import { FormSection, Toggle, NumberInput } from '../forms'
import { Button } from '../common'
import { 
  CURRENCY_DENOMINATIONS, 
  getDenominationsForCurrency,
  formatDenominationLabel 
} from '../../config/currencyDenominations'
import type { DenominationConfig, CurrencyDenominationsConfig } from '../../stores/settingsStore'

export function DenominationManagementPanel() {
  const { theme } = useAppStore()
  const { business, updateBusinessSettings } = useSettingsStore()
  const { formatCurrency, currencyConfig } = useCurrency()

  const [localConfig, setLocalConfig] = useState<CurrencyDenominationsConfig | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  // Load or initialize denomination config for current currency
  useEffect(() => {
    try {
      const currentCurrency = currencyConfig?.code
      if (!currentCurrency) return

      const existingConfig = business?.denominationsConfig?.[currentCurrency]

      if (existingConfig) {
        setLocalConfig(existingConfig)
      } else {
        // Initialize with defaults
        const defaults = getDenominationsForCurrency(currentCurrency)
        const newConfig: CurrencyDenominationsConfig = {
          useDefaults: true,
          bills: defaults.bills.map(value => ({
            value,
            enabled: true,
            label: formatDenominationLabel(
              value,
              currencyConfig.symbol,
              currencyConfig.symbolPosition,
              currencyConfig.decimalPlaces
            )
          })),
          coins: defaults.coins.map(value => ({
            value,
            enabled: true,
            label: formatDenominationLabel(
              value,
              currencyConfig.symbol,
              currencyConfig.symbolPosition,
              currencyConfig.decimalPlaces
            )
          }))
        }
        setLocalConfig(newConfig)
      }
      setHasChanges(false)
    } catch (error) {
      console.error('Error loading denomination config:', error)
    }
  }, [currencyConfig?.code, currencyConfig?.symbol, currencyConfig?.symbolPosition, currencyConfig?.decimalPlaces, business?.denominationsConfig, formatCurrency])

  const handleToggleDenomination = (type: 'bills' | 'coins', index: number) => {
    if (!localConfig) return

    const updated = { ...localConfig }
    const items = type === 'bills' ? [...updated.bills] : [...updated.coins]
    items[index] = { ...items[index], enabled: !items[index].enabled }

    if (type === 'bills') {
      updated.bills = items
    } else {
      updated.coins = items
    }

    updated.useDefaults = false
    setLocalConfig(updated)
    setHasChanges(true)
  }

  const handleAddDenomination = (type: 'bills' | 'coins', value: number) => {
    if (!localConfig || !value || value <= 0) return

    const updated = { ...localConfig }
    const items = type === 'bills' ? [...updated.bills] : [...updated.coins]
    
    // Check if denomination already exists
    if (items.some(item => item.value === value)) {
      return
    }

    const newDenom: DenominationConfig = {
      value,
      enabled: true,
      label: formatDenominationLabel(
        value,
        currencyConfig.symbol,
        currencyConfig.symbolPosition,
        currencyConfig.decimalPlaces
      )
    }

    items.push(newDenom)
    items.sort((a, b) => b.value - a.value) // Sort descending

    if (type === 'bills') {
      updated.bills = items
    } else {
      updated.coins = items
    }

    updated.useDefaults = false
    setLocalConfig(updated)
    setHasChanges(true)
  }

  const handleRemoveDenomination = (type: 'bills' | 'coins', index: number) => {
    if (!localConfig) return

    const updated = { ...localConfig }
    const items = type === 'bills' ? [...updated.bills] : [...updated.coins]
    items.splice(index, 1)

    if (type === 'bills') {
      updated.bills = items
    } else {
      updated.coins = items
    }

    updated.useDefaults = false
    setLocalConfig(updated)
    setHasChanges(true)
  }

  const handleResetToDefaults = () => {
    const defaults = getDenominationsForCurrency(currencyConfig.code)
    const newConfig: CurrencyDenominationsConfig = {
      useDefaults: true,
      bills: defaults.bills.map(value => ({
        value,
        enabled: true,
        label: formatDenominationLabel(
          value,
          currencyConfig.symbol,
          currencyConfig.symbolPosition,
          currencyConfig.decimalPlaces
        )
      })),
      coins: defaults.coins.map(value => ({
        value,
        enabled: true,
        label: formatDenominationLabel(
          value,
          currencyConfig.symbol,
          currencyConfig.symbolPosition,
          currencyConfig.decimalPlaces
        )
      }))
    }
    setLocalConfig(newConfig)
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!localConfig) return

    const updatedDenominations = {
      ...business.denominationsConfig,
      [currencyConfig.code]: localConfig
    }

    await updateBusinessSettings({
      denominationsConfig: updatedDenominations
    })

    setHasChanges(false)
  }

  if (!localConfig) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Loading Cash Denominations...
          </div>
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
            Currency: {currencyConfig?.code || 'Loading...'}
          </div>
        </div>
      </div>
    )
  }

  const currencyInfo = CURRENCY_DENOMINATIONS[currencyConfig.code]

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Panel Header */}
        <div className="mb-6">
          <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Cash Denomination Management
          </h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Configure bills and coins for {currencyInfo?.name || currencyConfig.code} ({currencyConfig.code})
          </p>
        </div>

        {localConfig && (
          <>
            {/* Currency Info Banner */}
            <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-semibold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-900'}`}>
                    Current Currency: {currencyConfig.code}
                  </h3>
                  <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                    {localConfig.useDefaults ? 'Using default denominations' : 'Using custom denominations'}
                  </p>
                </div>
                <Button
                  onClick={handleResetToDefaults}
                  variant="secondary"
                  size="sm"
                >
                  Reset to Defaults
                </Button>
              </div>
            </div>

            {/* Bills Section */}
            <FormSection
              title="Bills / Notes"
              description="Configure available bill denominations for cash transactions"
            >
              <div className="space-y-3">
                {localConfig.bills.map((bill, index) => (
                  <DenominationRow
                    key={`bill-${bill.value}`}
                    denomination={bill}
                    onToggle={() => handleToggleDenomination('bills', index)}
                    onRemove={() => handleRemoveDenomination('bills', index)}
                    theme={theme}
                    formatCurrency={formatCurrency}
                  />
                ))}
                
                <AddDenominationRow
                  type="bills"
                  onAdd={handleAddDenomination}
                  theme={theme}
                  currencyConfig={currencyConfig}
                />
              </div>
            </FormSection>

            {/* Coins Section */}
            <FormSection
              title="Coins"
              description="Configure available coin denominations for cash transactions"
            >
              <div className="space-y-3">
                {localConfig.coins.map((coin, index) => (
                  <DenominationRow
                    key={`coin-${coin.value}`}
                    denomination={coin}
                    onToggle={() => handleToggleDenomination('coins', index)}
                    onRemove={() => handleRemoveDenomination('coins', index)}
                    theme={theme}
                    formatCurrency={formatCurrency}
                  />
                ))}
                
                <AddDenominationRow
                  type="coins"
                  onAdd={handleAddDenomination}
                  theme={theme}
                  currencyConfig={currencyConfig}
                />
              </div>
            </FormSection>

            {/* Save Button */}
            {hasChanges && (
              <div className={`sticky bottom-0 p-4 rounded-lg border-2 ${theme === 'dark' ? 'bg-gray-800 border-green-500/50' : 'bg-white border-green-500'}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    You have unsaved changes
                  </span>
                  <Button onClick={handleSave} variant="primary">
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

interface DenominationRowProps {
  denomination: DenominationConfig
  onToggle: () => void
  onRemove: () => void
  theme: string
  formatCurrency: (amount: number) => string
}

function DenominationRow({ denomination, onToggle, onRemove, theme, formatCurrency }: DenominationRowProps) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${
      theme === 'dark' 
        ? denomination.enabled ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-800/30 border-gray-700'
        : denomination.enabled ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-center gap-3 flex-1">
        <Toggle
          checked={denomination.enabled}
          onChange={onToggle}
          size="sm"
        />
        <div>
          <div className={`font-semibold ${
            denomination.enabled 
              ? theme === 'dark' ? 'text-white' : 'text-gray-900'
              : theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          }`}>
            {formatCurrency(denomination.value)}
          </div>
          {denomination.label && (
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              Value: {denomination.value}
            </div>
          )}
        </div>
      </div>
      <button
        onClick={onRemove}
        className={`p-2 rounded hover:bg-red-500/20 transition-colors ${
          theme === 'dark' ? 'text-red-400' : 'text-red-600'
        }`}
        title="Remove denomination"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  )
}

interface AddDenominationRowProps {
  type: 'bills' | 'coins'
  onAdd: (type: 'bills' | 'coins', value: number) => void
  theme: string
  currencyConfig: any
}

function AddDenominationRow({ type, onAdd, theme, currencyConfig }: AddDenominationRowProps) {
  const [value, setValue] = useState<number>(0)
  const [showInput, setShowInput] = useState(false)

  const handleAdd = () => {
    if (value > 0) {
      onAdd(type, value)
      setValue(0)
      setShowInput(false)
    }
  }

  if (!showInput) {
    return (
      <button
        onClick={() => setShowInput(true)}
        className={`w-full p-3 rounded-lg border-2 border-dashed transition-colors ${
          theme === 'dark'
            ? 'border-gray-600 hover:border-gray-500 text-gray-400 hover:text-gray-300'
            : 'border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-700'
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Custom {type === 'bills' ? 'Bill' : 'Coin'}</span>
        </div>
      </button>
    )
  }

  return (
    <div className={`flex items-center gap-2 p-3 rounded-lg border ${
      theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-white border-gray-300'
    }`}>
      <NumberInput
        value={value}
        onChange={setValue}
        min={0}
        step={type === 'coins' ? 0.01 : 1}
        placeholder={`Enter ${type === 'bills' ? 'bill' : 'coin'} value`}
        className="flex-1"
      />
      <Button onClick={handleAdd} size="sm" variant="primary">
        Add
      </Button>
      <Button onClick={() => setShowInput(false)} size="sm" variant="secondary">
        Cancel
      </Button>
    </div>
  )
}
