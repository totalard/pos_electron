import { useAppStore, useSettingsStore } from '../../stores'

export function ReceiptsPanel() {
  const { theme } = useAppStore()
  const { receipts, updateReceiptSettings } = useSettingsStore()

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Receipt Settings
        </h2>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Customize receipt templates and printing options
        </p>
      </div>

      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Show Logo</h4>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Display logo on receipts</p>
            </div>
            <button
              onClick={() => updateReceiptSettings({ showLogo: !receipts.showLogo })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${receipts.showLogo ? 'bg-blue-500' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${receipts.showLogo ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {receipts.showLogo && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Logo URL
              </label>
              <input
                type="text"
                value={receipts.logoUrl}
                onChange={(e) => updateReceiptSettings({ logoUrl: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder="Enter logo URL or path"
              />
            </div>
          )}

          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Header Text
            </label>
            <input
              type="text"
              value={receipts.headerText}
              onChange={(e) => updateReceiptSettings({ headerText: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Footer Text
            </label>
            <input
              type="text"
              value={receipts.footerText}
              onChange={(e) => updateReceiptSettings({ footerText: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Tax Breakdown</h4>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Show detailed tax breakdown</p>
            </div>
            <button
              onClick={() => updateReceiptSettings({ showTaxBreakdown: !receipts.showTaxBreakdown })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${receipts.showTaxBreakdown ? 'bg-blue-500' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${receipts.showTaxBreakdown ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Receipt Barcode</h4>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Show barcode on receipts</p>
            </div>
            <button
              onClick={() => updateReceiptSettings({ showBarcode: !receipts.showBarcode })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${receipts.showBarcode ? 'bg-blue-500' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${receipts.showBarcode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

