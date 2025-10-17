import { useAppStore, useSettingsStore } from '../../stores'

export function TaxesPanel() {
  const { theme } = useAppStore()
  const { taxes, updateTaxSettings } = useSettingsStore()

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Tax Settings
        </h2>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Configure tax rates and tax calculation settings
        </p>
      </div>

      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Default Tax Rate (%)
            </label>
            <input
              type="number"
              step="0.01"
              value={taxes.defaultTaxRate}
              onChange={(e) => updateTaxSettings({ defaultTaxRate: parseFloat(e.target.value) || 0 })}
              className={`w-full px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Tax Label
            </label>
            <input
              type="text"
              value={taxes.taxLabel}
              onChange={(e) => updateTaxSettings({ taxLabel: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Tax Inclusive Pricing
              </h4>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Prices include tax
              </p>
            </div>
            <button
              onClick={() => updateTaxSettings({ taxInclusive: !taxes.taxInclusive })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${taxes.taxInclusive ? 'bg-blue-500' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${taxes.taxInclusive ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Multiple Tax Rates
              </h4>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Enable different tax rates per product
              </p>
            </div>
            <button
              onClick={() => updateTaxSettings({ enableMultipleTaxRates: !taxes.enableMultipleTaxRates })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${taxes.enableMultipleTaxRates ? 'bg-blue-500' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${taxes.enableMultipleTaxRates ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

