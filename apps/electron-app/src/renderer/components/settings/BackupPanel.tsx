import { useState } from 'react'
import { useAppStore, useSettingsStore } from '../../stores'
import { Toast } from '../common'

export function BackupPanel() {
  const { theme } = useAppStore()
  const { backup, updateBackupSettings, performBackup } = useSettingsStore()
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' })

  const handleBackupNow = async () => {
    try {
      await performBackup()
      setToast({ show: true, message: 'Backup completed successfully!', type: 'success' })
    } catch (error) {
      setToast({ show: true, message: 'Backup failed: ' + (error instanceof Error ? error.message : 'Unknown error'), type: 'error' })
    }
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
          <div className="flex items-center justify-between min-h-[44px] gap-4">
            <div>
              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Enable Auto Backup</h4>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Automatically backup data</p>
            </div>
            <button
              onClick={() => updateBackupSettings({ enableAutoBackup: !backup.enableAutoBackup })}
              className={`
                relative inline-flex h-8 w-14 items-center rounded-full
                transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500/20
                ${backup.enableAutoBackup ? 'bg-blue-500' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}
              `}
              aria-label="Toggle auto backup"
            >
              <span className={`
                inline-block h-6 w-6 transform rounded-full bg-white
                transition-transform duration-200
                ${backup.enableAutoBackup ? 'translate-x-7' : 'translate-x-1'}
              `} />
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
                  className={`
                    w-full px-4 py-3 rounded-lg border
                    min-h-[44px]
                    transition-colors duration-200
                    ${theme === 'dark'
                      ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                    }
                    focus:outline-none focus:ring-2 focus:ring-blue-500/20
                  `}
                  aria-label="Backup interval in hours"
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
                  className={`
                    w-full px-4 py-3 rounded-lg border
                    min-h-[44px]
                    transition-colors duration-200
                    ${theme === 'dark'
                      ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                    }
                    focus:outline-none focus:ring-2 focus:ring-blue-500/20
                  `}
                  placeholder="/path/to/backup"
                  aria-label="Backup location path"
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
            className={`
              w-full px-6 py-3 rounded-lg font-medium
              min-h-[44px]
              transition-all duration-200
              ${theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white'
                : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white'
              }
              focus:outline-none focus:ring-2 focus:ring-blue-500/20
            `}
            aria-label="Backup now"
          >
            Backup Now
          </button>
          <button
            className={`
              w-full px-6 py-3 rounded-lg font-medium
              min-h-[44px]
              transition-all duration-200
              ${theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-900'
              }
              focus:outline-none focus:ring-2 focus:ring-blue-500/20
            `}
            aria-label="Restore from backup"
          >
            Restore from Backup
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        isOpen={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
        message={toast.message}
        type={toast.type}
        duration={3000}
      />
    </div>
  )
}

