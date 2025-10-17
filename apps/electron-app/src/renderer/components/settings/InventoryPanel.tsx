import { useAppStore, useSettingsStore } from '../../stores'

export function InventoryPanel() {
  const { theme } = useAppStore()
  const { inventory, updateInventorySettings } = useSettingsStore()

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Inventory Settings
        </h2>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Configure inventory management and stock alerts
        </p>
      </div>

      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Low Stock Alerts</h4>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Get notified when stock is low</p>
            </div>
            <button
              onClick={() => updateInventorySettings({ enableLowStockAlerts: !inventory.enableLowStockAlerts })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${inventory.enableLowStockAlerts ? 'bg-blue-500' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${inventory.enableLowStockAlerts ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {inventory.enableLowStockAlerts && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Low Stock Threshold
              </label>
              <input
                type="number"
                value={inventory.lowStockThreshold}
                onChange={(e) => updateInventorySettings({ lowStockThreshold: parseInt(e.target.value) || 0 })}
                className={`w-full px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Auto Reorder</h4>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Automatically create reorder suggestions</p>
            </div>
            <button
              onClick={() => updateInventorySettings({ enableAutoReorder: !inventory.enableAutoReorder })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${inventory.enableAutoReorder ? 'bg-blue-500' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${inventory.enableAutoReorder ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {inventory.enableAutoReorder && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Auto Reorder Threshold
              </label>
              <input
                type="number"
                value={inventory.autoReorderThreshold}
                onChange={(e) => updateInventorySettings({ autoReorderThreshold: parseInt(e.target.value) || 0 })}
                className={`w-full px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

