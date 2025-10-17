import { useAppStore, useSettingsStore } from '../../stores'

export function IntegrationPanel() {
  const { theme } = useAppStore()
  const { integration, updateIntegrationSettings } = useSettingsStore()

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Integration Settings
        </h2>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Configure third-party integrations and cloud services
        </p>
      </div>

      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Cloud Sync
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Enable Cloud Sync</h4>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Sync data to cloud storage</p>
            </div>
            <button
              onClick={() => updateIntegrationSettings({ enableCloudSync: !integration.enableCloudSync })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${integration.enableCloudSync ? 'bg-blue-500' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${integration.enableCloudSync ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {integration.enableCloudSync && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Sync Interval (minutes)
              </label>
              <input
                type="number"
                value={integration.cloudSyncInterval}
                onChange={(e) => updateIntegrationSettings({ cloudSyncInterval: parseInt(e.target.value) || 60 })}
                className={`w-full px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
            </div>
          )}
        </div>
      </div>

      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Email Receipts
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Enable Email Receipts</h4>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Send receipts via email</p>
            </div>
            <button
              onClick={() => updateIntegrationSettings({ enableEmailReceipts: !integration.enableEmailReceipts })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${integration.enableEmailReceipts ? 'bg-blue-500' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${integration.enableEmailReceipts ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {integration.enableEmailReceipts && (
            <>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  SMTP Server
                </label>
                <input
                  type="text"
                  value={integration.smtpServer}
                  onChange={(e) => updateIntegrationSettings({ smtpServer: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  placeholder="smtp.example.com"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  SMTP Port
                </label>
                <input
                  type="number"
                  value={integration.smtpPort}
                  onChange={(e) => updateIntegrationSettings({ smtpPort: parseInt(e.target.value) || 587 })}
                  className={`w-full px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Username
                </label>
                <input
                  type="text"
                  value={integration.smtpUsername}
                  onChange={(e) => updateIntegrationSettings({ smtpUsername: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  placeholder="your-email@example.com"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

