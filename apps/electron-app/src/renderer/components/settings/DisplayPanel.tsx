import { useAppStore, useSettingsStore } from '../../stores'
import { FormSection } from '../forms'

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
      {/* Panel Header */}
      <div className="mb-6">
        <h2 className={`
          text-2xl font-bold mb-2
          ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
        `}>
          Display Settings
        </h2>
        <p className={`
          text-sm
          ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
        `}>
          Customize the appearance and display options
        </p>
      </div>

      {/* Theme Section */}
      <div className={`
        p-4 rounded-lg
        ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}
      `}>
        <h3 className={`
          text-lg font-semibold mb-4
          ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
        `}>
          Theme
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Light Theme Button */}
          <button
            onClick={() => handleThemeChange('light')}
            className={`
              p-6 rounded-lg border-2 transition-all duration-200
              min-h-[120px] flex flex-col items-center justify-center gap-3
              ${display.theme === 'light'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 bg-white hover:border-gray-400'
              }
              focus:outline-none focus:ring-2 focus:ring-blue-500/20
            `}
            aria-label="Select light theme"
          >
            <svg className="w-12 h-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className={`
              font-medium
              ${display.theme === 'light' ? 'text-blue-600' : 'text-gray-700'}
            `}>
              Light
            </span>
          </button>

          {/* Dark Theme Button */}
          <button
            onClick={() => handleThemeChange('dark')}
            className={`
              p-6 rounded-lg border-2 transition-all duration-200
              min-h-[120px] flex flex-col items-center justify-center gap-3
              ${display.theme === 'dark'
                ? 'border-blue-500 bg-gray-800'
                : 'border-gray-300 bg-gray-100 hover:border-gray-400'
              }
              focus:outline-none focus:ring-2 focus:ring-blue-500/20
            `}
            aria-label="Select dark theme"
          >
            <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <span className={`
              font-medium
              ${display.theme === 'dark' ? 'text-blue-400' : 'text-gray-700'}
            `}>
              Dark
            </span>
          </button>
        </div>
      </div>

      {/* Font Size Section */}
      <div className={`
        p-4 rounded-lg
        ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}
      `}>
        <h3 className={`
          text-lg font-semibold mb-4
          ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
        `}>
          Font Size
        </h3>

        <div className="grid grid-cols-3 gap-4">
          {/* Small Font */}
          <button
            onClick={() => handleFontSizeChange('small')}
            className={`
              p-4 rounded-lg border-2 transition-all duration-200
              min-h-[80px] flex flex-col items-center justify-center gap-2
              ${display.fontSize === 'small'
                ? theme === 'dark'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-blue-500 bg-blue-50'
                : theme === 'dark'
                  ? 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              }
              focus:outline-none focus:ring-2 focus:ring-blue-500/20
            `}
            aria-label="Select small font size"
          >
            <span className={`
              text-sm font-medium
              ${display.fontSize === 'small'
                ? theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }
            `}>
              Small
            </span>
            <span className={`
              text-xs
              ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
            `}>
              Aa
            </span>
          </button>

          {/* Medium Font */}
          <button
            onClick={() => handleFontSizeChange('medium')}
            className={`
              p-4 rounded-lg border-2 transition-all duration-200
              min-h-[80px] flex flex-col items-center justify-center gap-2
              ${display.fontSize === 'medium'
                ? theme === 'dark'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-blue-500 bg-blue-50'
                : theme === 'dark'
                  ? 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              }
              focus:outline-none focus:ring-2 focus:ring-blue-500/20
            `}
            aria-label="Select medium font size"
          >
            <span className={`
              text-base font-medium
              ${display.fontSize === 'medium'
                ? theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }
            `}>
              Medium
            </span>
            <span className={`
              text-sm
              ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
            `}>
              Aa
            </span>
          </button>

          {/* Large Font */}
          <button
            onClick={() => handleFontSizeChange('large')}
            className={`
              p-4 rounded-lg border-2 transition-all duration-200
              min-h-[80px] flex flex-col items-center justify-center gap-2
              ${display.fontSize === 'large'
                ? theme === 'dark'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-blue-500 bg-blue-50'
                : theme === 'dark'
                  ? 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              }
              focus:outline-none focus:ring-2 focus:ring-blue-500/20
            `}
            aria-label="Select large font size"
          >
            <span className={`
              text-lg font-medium
              ${display.fontSize === 'large'
                ? theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }
            `}>
              Large
            </span>
            <span className={`
              text-base
              ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
            `}>
              Aa
            </span>
          </button>
        </div>

        <p className={`
          text-xs mt-3
          ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
        `}>
          Note: Font size changes will take effect on next app restart
        </p>
      </div>

      {/* Screen Timeout Section */}
      <FormSection
        title="Screen Timeout"
        description="Automatically dim or turn off screen after period of inactivity"
      >
        <div className="space-y-4">
          <div>
            <label className={`
              block text-sm font-medium mb-2
              ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
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
                w-full px-4 py-3 rounded-lg
                transition-colors duration-200
                min-h-[44px]
                ${theme === 'dark'
                  ? 'bg-gray-800 border border-gray-600 text-white focus:border-blue-500'
                  : 'bg-white border border-gray-300 text-gray-900 focus:border-blue-500'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500/20
              `}
              aria-label="Screen timeout in minutes"
            />
          </div>

          {/* Quick Timeout Presets */}
          <div className="grid grid-cols-4 gap-2">
            {[0, 5, 15, 30].map((minutes) => (
              <button
                key={minutes}
                onClick={() => handleScreenTimeoutChange(minutes)}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium
                  transition-all duration-200
                  min-h-[44px]
                  ${display.screenTimeout === minutes
                    ? 'bg-blue-500 text-white'
                    : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-500/20
                `}
                aria-label={`Set timeout to ${minutes} minutes`}
              >
                {minutes === 0 ? 'Never' : `${minutes}m`}
              </button>
            ))}
          </div>
        </div>
      </FormSection>
    </div>
  )
}

