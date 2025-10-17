import { useAppStore, useSettingsStore } from '../../stores'

export function AboutPanel() {
  const { theme } = useAppStore()
  const { about, checkForUpdates } = useSettingsStore()

  const handleCheckUpdates = async () => {
    await checkForUpdates()
    alert('You are using the latest version!')
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          About
        </h2>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Application information and updates
        </p>
      </div>

      <div className={`p-6 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
        <div className={`inline-flex p-4 rounded-full mb-4 ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-500/10'}`}>
          <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          MidLogic POS
        </h3>
        <p className={`text-lg mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Point of Sale System
        </p>
      </div>

      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Version Information
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Version</span>
            <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{about.appVersion}</span>
          </div>
          <div className="flex justify-between">
            <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Build Number</span>
            <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{about.buildNumber}</span>
          </div>
          {about.lastUpdateCheck && (
            <div className="flex justify-between">
              <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Last Update Check</span>
              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {new Date(about.lastUpdateCheck).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Updates
        </h3>
        <button
          onClick={handleCheckUpdates}
          className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
        >
          Check for Updates
        </button>
      </div>

      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Technology Stack
        </h3>
        <div className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          <p>• Electron - Desktop application framework</p>
          <p>• React - UI library</p>
          <p>• TypeScript - Type-safe JavaScript</p>
          <p>• Tailwind CSS v4 - Styling framework</p>
          <p>• Zustand - State management</p>
          <p>• FastAPI - Backend API</p>
          <p>• Tortoise ORM - Database ORM</p>
          <p>• SQLite - Database</p>
        </div>
      </div>

      <div className={`p-4 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          © 2024 MidLogic. All rights reserved.
        </p>
      </div>
    </div>
  )
}

