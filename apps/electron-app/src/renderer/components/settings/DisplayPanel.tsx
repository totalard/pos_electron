import { useAppStore, useSettingsStore } from '../../stores'
import { FormSection } from '../forms'

/**
 * Enhanced Display Panel with WCAG AA Contrast Compliance
 *
 * Features:
 * - Improved visual design with better hierarchy
 * - WCAG AA compliant text contrast (4.5:1 for normal text, 3:1 for large text)
 * - Enhanced theme selection with accessible buttons
 * - Touch-safe UI elements (minimum 44x44px)
 * - Theme-aware styling with proper contrast in both light and dark modes
 * - Clear visual feedback for all interactive elements
 */
export function DisplayPanel() {
  const { theme, setTheme } = useAppStore()
  const { display, updateDisplaySettings } = useSettingsStore()

  const handleThemeChange = async (newTheme: 'light' | 'dark') => {
    setTheme(newTheme)
    await updateDisplaySettings({ theme: newTheme })
  }

  const handleFontSizeChange = async (fontSize: 'small' | 'medium' | 'large') => {
    await updateDisplaySettings({ fontSize })
  }

  const handleScreenTimeoutChange = async (timeout: number) => {
    await updateDisplaySettings({ screenTimeout: timeout })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Panel Header - Enhanced contrast */}
      <div className="mb-6">
        <h2 className={`
          text-2xl font-bold mb-2
          ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
        `}>
          Display Settings
        </h2>
        <p className={`
          text-sm
          ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
        `}>
          Customize the appearance and display options
        </p>
      </div>

      {/* Theme Section - Enhanced design */}
      <div className={`
        p-5 rounded-lg border shadow-sm
        ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}
      `}>
        <div className="flex items-center gap-3 mb-5">
          <div className={`p-3 rounded-lg ${
            theme === 'dark' ? 'bg-indigo-900/40' : 'bg-indigo-100'
          }`}>
            <span className="text-2xl" aria-hidden="true">🎨</span>
          </div>
          <div>
            <h3 className={`
              text-lg font-bold
              ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
            `}>
              Theme
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Choose your preferred color scheme
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Light Theme Button - Enhanced */}
          <button
            onClick={() => handleThemeChange('light')}
            className={`
              p-6 rounded-lg border-2 transition-all duration-200 shadow-sm
              min-h-[120px] flex flex-col items-center justify-center gap-3
              ${display.theme === 'light'
                ? 'border-blue-600 bg-blue-100 shadow-md'
                : 'border-gray-300 bg-white hover:border-gray-400 hover:shadow-md'
              }
              focus:outline-none focus:ring-2 focus:ring-blue-500/50
            `}
            aria-label="Select light theme"
            aria-pressed={display.theme === 'light'}
          >
            <svg className="w-14 h-14 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className={`
              font-bold text-base
              ${display.theme === 'light' ? 'text-blue-800' : 'text-gray-800'}
            `}>
              Light
            </span>
            {display.theme === 'light' && (
              <span className="text-xs font-medium text-blue-700">Active</span>
            )}
          </button>

          {/* Dark Theme Button - Enhanced */}
          <button
            onClick={() => handleThemeChange('dark')}
            className={`
              p-6 rounded-lg border-2 transition-all duration-200 shadow-sm
              min-h-[120px] flex flex-col items-center justify-center gap-3
              ${display.theme === 'dark'
                ? 'border-blue-500 bg-gray-800 shadow-md'
                : 'border-gray-300 bg-gray-100 hover:border-gray-400 hover:shadow-md'
              }
              focus:outline-none focus:ring-2 focus:ring-blue-500/50
            `}
            aria-label="Select dark theme"
            aria-pressed={display.theme === 'dark'}
          >
            <svg className="w-14 h-14 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <span className={`
              font-bold text-base
              ${display.theme === 'dark' ? 'text-blue-300' : 'text-gray-800'}
            `}>
              Dark
            </span>
            {display.theme === 'dark' && (
              <span className="text-xs font-medium text-blue-300">Active</span>
            )}
          </button>
        </div>
      </div>

      {/* Font Size Section - Enhanced design */}
      <div className={`
        p-5 rounded-lg border shadow-sm
        ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}
      `}>
        <div className="flex items-center gap-3 mb-5">
          <div className={`p-3 rounded-lg ${
            theme === 'dark' ? 'bg-green-900/40' : 'bg-green-100'
          }`}>
            <span className="text-2xl" aria-hidden="true">📝</span>
          </div>
          <div>
            <h3 className={`
              text-lg font-bold
              ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
            `}>
              Font Size
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Adjust text size for better readability
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Small Font - Enhanced */}
          <button
            onClick={() => handleFontSizeChange('small')}
            className={`
              p-5 rounded-lg border-2 transition-all duration-200 shadow-sm
              min-h-[90px] flex flex-col items-center justify-center gap-2
              ${display.fontSize === 'small'
                ? theme === 'dark'
                  ? 'border-blue-500 bg-blue-900/30 shadow-md'
                  : 'border-blue-600 bg-blue-100 shadow-md'
                : theme === 'dark'
                  ? 'border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:shadow-md'
                  : 'border-gray-300 bg-white hover:border-gray-400 hover:shadow-md'
              }
              focus:outline-none focus:ring-2 focus:ring-blue-500/50
            `}
            aria-label="Select small font size"
            aria-pressed={display.fontSize === 'small'}
          >
            <span className={`
              text-sm font-bold
              ${display.fontSize === 'small'
                ? theme === 'dark' ? 'text-blue-300' : 'text-blue-800'
                : theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
              }
            `}>
              Small
            </span>
            <span className={`
              text-xs font-medium
              ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
            `}>
              Aa
            </span>
          </button>

          {/* Medium Font - Enhanced */}
          <button
            onClick={() => handleFontSizeChange('medium')}
            className={`
              p-5 rounded-lg border-2 transition-all duration-200 shadow-sm
              min-h-[90px] flex flex-col items-center justify-center gap-2
              ${display.fontSize === 'medium'
                ? theme === 'dark'
                  ? 'border-blue-500 bg-blue-900/30 shadow-md'
                  : 'border-blue-600 bg-blue-100 shadow-md'
                : theme === 'dark'
                  ? 'border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:shadow-md'
                  : 'border-gray-300 bg-white hover:border-gray-400 hover:shadow-md'
              }
              focus:outline-none focus:ring-2 focus:ring-blue-500/50
            `}
            aria-label="Select medium font size"
            aria-pressed={display.fontSize === 'medium'}
          >
            <span className={`
              text-base font-bold
              ${display.fontSize === 'medium'
                ? theme === 'dark' ? 'text-blue-300' : 'text-blue-800'
                : theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
              }
            `}>
              Medium
            </span>
            <span className={`
              text-sm font-medium
              ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
            `}>
              Aa
            </span>
          </button>

          {/* Large Font - Enhanced */}
          <button
            onClick={() => handleFontSizeChange('large')}
            className={`
              p-5 rounded-lg border-2 transition-all duration-200 shadow-sm
              min-h-[90px] flex flex-col items-center justify-center gap-2
              ${display.fontSize === 'large'
                ? theme === 'dark'
                  ? 'border-blue-500 bg-blue-900/30 shadow-md'
                  : 'border-blue-600 bg-blue-100 shadow-md'
                : theme === 'dark'
                  ? 'border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:shadow-md'
                  : 'border-gray-300 bg-white hover:border-gray-400 hover:shadow-md'
              }
              focus:outline-none focus:ring-2 focus:ring-blue-500/50
            `}
            aria-label="Select large font size"
            aria-pressed={display.fontSize === 'large'}
          >
            <span className={`
              text-lg font-bold
              ${display.fontSize === 'large'
                ? theme === 'dark' ? 'text-blue-300' : 'text-blue-800'
                : theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
              }
            `}>
              Large
            </span>
            <span className={`
              text-base font-medium
              ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
            `}>
              Aa
            </span>
          </button>
        </div>

        <div className={`mt-4 p-3 rounded-lg border ${
          theme === 'dark' ? 'bg-amber-900/20 border-amber-700' : 'bg-amber-50 border-amber-300'
        }`}>
          <p className={`text-sm font-medium flex items-center gap-2 ${
            theme === 'dark' ? 'text-amber-200' : 'text-amber-800'
          }`}>
            <span aria-hidden="true">ℹ️</span>
            Font size changes will take effect on next app restart
          </p>
        </div>
      </div>

      {/* Screen Timeout Section - Enhanced design */}
      <div className={`
        p-5 rounded-lg border shadow-sm
        ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}
      `}>
        <div className="flex items-center gap-3 mb-5">
          <div className={`p-3 rounded-lg ${
            theme === 'dark' ? 'bg-orange-900/40' : 'bg-orange-100'
          }`}>
            <span className="text-2xl" aria-hidden="true">⏱️</span>
          </div>
          <div>
            <h3 className={`
              text-lg font-bold
              ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
            `}>
              Screen Timeout
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Automatically dim or turn off screen after period of inactivity
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className={`
              block text-sm font-semibold mb-2
              ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}
            `}>
              Timeout Duration (minutes, 0 = never)
            </label>
            <input
              type="number"
              value={display.screenTimeout}
              onChange={(e) => handleScreenTimeoutChange(parseInt(e.target.value) || 0)}
              min={0}
              max={1440}
              className={`
                w-full px-4 py-3 rounded-lg text-base font-medium
                transition-colors duration-200 shadow-sm
                min-h-[44px]
                ${theme === 'dark'
                  ? 'bg-gray-700 border border-gray-600 text-white focus:border-blue-400'
                  : 'bg-white border border-gray-300 text-gray-900 focus:border-blue-600'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500/30
              `}
              aria-label="Screen timeout in minutes"
            />
          </div>

          {/* Quick Timeout Presets - Enhanced */}
          <div>
            <p className={`text-sm font-semibold mb-3 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
            }`}>
              Quick Presets
            </p>
            <div className="grid grid-cols-4 gap-3">
              {[0, 5, 15, 30].map((minutes) => (
                <button
                  key={minutes}
                  onClick={() => handleScreenTimeoutChange(minutes)}
                  className={`
                    px-3 py-3 rounded-lg text-sm font-bold
                    transition-all duration-200 shadow-sm
                    min-h-[44px]
                    ${display.screenTimeout === minutes
                      ? 'bg-blue-600 text-white shadow-md border-2 border-blue-700'
                      : theme === 'dark'
                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 border-2 border-gray-600 hover:border-gray-500'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-2 border-gray-300 hover:border-gray-400'
                    }
                    focus:outline-none focus:ring-2 focus:ring-blue-500/50
                  `}
                  aria-label={`Set timeout to ${minutes} minutes`}
                  aria-pressed={display.screenTimeout === minutes}
                >
                  {minutes === 0 ? 'Never' : `${minutes}m`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

