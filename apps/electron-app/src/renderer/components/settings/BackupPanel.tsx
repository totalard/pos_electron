import { useAppStore, useSettingsStore } from '../../stores'

export function BackupPanel() {
  const { theme } = useAppStore()
  const { backup, updateBackupSettings, performBackup } = useSettingsStore()

  const handleBackupNow = async () => {
    await performBackup()
    alert('Backup completed successfully!')
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Backup & Restore
        </h2>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Manage data backups and restoration
        </p>
      </div>

      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Automatic Backup
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Enable Auto Backup</h4>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Automatically backup data</p>
            </div>
            <button
              onClick={() => updateBackupSettings({ enableAutoBackup: !backup.enableAutoBackup })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${backup.enableAutoBackup ? 'bg-blue-500' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${backup.enableAutoBackup ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {backup.enableAutoBackup && (
            <>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Backup Interval (hours)
                </label>
                <input
                  type="number"
                  value={backup.backupInterval}
                  onChange={(e) => updateBackupSettings({ backupInterval: parseInt(e.target.value) || 24 })}
                  className={`w-full px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Backup Location
                </label>
                <input
                  type="text"
                  value={backup.backupLocation}
                  onChange={(e) => updateBackupSettings({ backupLocation: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  placeholder="/path/to/backup"
                />
              </div>
            </>
          )}

          {backup.lastBackupDate && (
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Last backup: {new Date(backup.lastBackupDate).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Manual Backup
        </h3>
        <div className="space-y-4">
          <button
            onClick={handleBackupNow}
            className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
          >
            Backup Now
          </button>
          <button
            className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
          >
            Restore from Backup
          </button>
        </div>
      </div>
    </div>
  )
}

