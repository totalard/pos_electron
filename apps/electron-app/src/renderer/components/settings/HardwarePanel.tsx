import { useAppStore, useSettingsStore } from '../../stores'

export function HardwarePanel() {
  const { theme } = useAppStore()
  const { hardware, updateHardwareSettings } = useSettingsStore()

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Hardware Settings
        </h2>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Configure peripheral devices and hardware
        </p>
      </div>

      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Receipt Printer</h4>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Enable receipt printing</p>
            </div>
            <button
              onClick={() => updateHardwareSettings({ printerEnabled: !hardware.printerEnabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${hardware.printerEnabled ? 'bg-blue-500' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${hardware.printerEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {hardware.printerEnabled && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Printer Name
              </label>
              <input
                type="text"
                value={hardware.printerName}
                onChange={(e) => updateHardwareSettings({ printerName: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder="Enter printer name"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Cash Drawer</h4>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Enable cash drawer control</p>
            </div>
            <button
              onClick={() => updateHardwareSettings({ cashDrawerEnabled: !hardware.cashDrawerEnabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${hardware.cashDrawerEnabled ? 'bg-blue-500' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${hardware.cashDrawerEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Barcode Reader</h4>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Enable barcode scanner</p>
            </div>
            <button
              onClick={() => updateHardwareSettings({ barcodeReaderEnabled: !hardware.barcodeReaderEnabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${hardware.barcodeReaderEnabled ? 'bg-blue-500' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${hardware.barcodeReaderEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Customer Display</h4>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Enable customer-facing display</p>
            </div>
            <button
              onClick={() => updateHardwareSettings({ displayEnabled: !hardware.displayEnabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${hardware.displayEnabled ? 'bg-blue-500' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${hardware.displayEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

