import { useAppStore, useSettingsStore } from '../../stores'

export function GeneralPanel() {
  const { theme } = useAppStore()
  const { general, updateGeneralSettings } = useSettingsStore()

  const handleInputChange = (field: keyof typeof general, value: string) => {
    updateGeneralSettings({ [field]: value })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Panel Header */}
      <div className="mb-6">
        <h2 className={`
          text-2xl font-bold mb-2
          ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
        `}>
          General Settings
        </h2>
        <p className={`
          text-sm
          ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
        `}>
          Configure basic application settings and store information
        </p>
      </div>

      {/* Store Information Section */}
      <div className={`
        p-4 rounded-lg
        ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}
      `}>
        <h3 className={`
          text-lg font-semibold mb-4
          ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
        `}>
          Store Information
        </h3>

        <div className="space-y-4">
          {/* Store Name */}
          <div>
            <label className={`
              block text-sm font-medium mb-2
              ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
            `}>
              Store Name
            </label>
            <input
              type="text"
              value={general.storeName}
              onChange={(e) => handleInputChange('storeName', e.target.value)}
              className={`
                w-full px-4 py-2 rounded-lg
                transition-colors duration-200
                ${theme === 'dark'
                  ? 'bg-gray-800 border border-gray-600 text-white focus:border-blue-500'
                  : 'bg-white border border-gray-300 text-gray-900 focus:border-blue-500'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500/20
              `}
              placeholder="Enter store name"
            />
          </div>

          {/* Store Address */}
          <div>
            <label className={`
              block text-sm font-medium mb-2
              ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
            `}>
              Store Address
            </label>
            <textarea
              value={general.storeAddress}
              onChange={(e) => handleInputChange('storeAddress', e.target.value)}
              rows={3}
              className={`
                w-full px-4 py-2 rounded-lg
                transition-colors duration-200
                ${theme === 'dark'
                  ? 'bg-gray-800 border border-gray-600 text-white focus:border-blue-500'
                  : 'bg-white border border-gray-300 text-gray-900 focus:border-blue-500'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500/20
              `}
              placeholder="Enter store address"
            />
          </div>

          {/* Store Phone */}
          <div>
            <label className={`
              block text-sm font-medium mb-2
              ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
            `}>
              Phone Number
            </label>
            <input
              type="tel"
              value={general.storePhone}
              onChange={(e) => handleInputChange('storePhone', e.target.value)}
              className={`
                w-full px-4 py-2 rounded-lg
                transition-colors duration-200
                ${theme === 'dark'
                  ? 'bg-gray-800 border border-gray-600 text-white focus:border-blue-500'
                  : 'bg-white border border-gray-300 text-gray-900 focus:border-blue-500'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500/20
              `}
              placeholder="Enter phone number"
            />
          </div>

          {/* Store Email */}
          <div>
            <label className={`
              block text-sm font-medium mb-2
              ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
            `}>
              Email Address
            </label>
            <input
              type="email"
              value={general.storeEmail}
              onChange={(e) => handleInputChange('storeEmail', e.target.value)}
              className={`
                w-full px-4 py-2 rounded-lg
                transition-colors duration-200
                ${theme === 'dark'
                  ? 'bg-gray-800 border border-gray-600 text-white focus:border-blue-500'
                  : 'bg-white border border-gray-300 text-gray-900 focus:border-blue-500'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500/20
              `}
              placeholder="Enter email address"
            />
          </div>
        </div>
      </div>

      {/* Regional Settings Section */}
      <div className={`
        p-4 rounded-lg
        ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}
      `}>
        <h3 className={`
          text-lg font-semibold mb-4
          ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
        `}>
          Regional Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Currency */}
          <div>
            <label className={`
              block text-sm font-medium mb-2
              ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
            `}>
              Currency
            </label>
            <select
              value={general.currency}
              onChange={(e) => handleInputChange('currency', e.target.value)}
              className={`
                w-full px-4 py-2 rounded-lg
                transition-colors duration-200
                ${theme === 'dark'
                  ? 'bg-gray-800 border border-gray-600 text-white focus:border-blue-500'
                  : 'bg-white border border-gray-300 text-gray-900 focus:border-blue-500'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500/20
              `}
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="INR">INR - Indian Rupee</option>
              <option value="JPY">JPY - Japanese Yen</option>
            </select>
          </div>

          {/* Language */}
          <div>
            <label className={`
              block text-sm font-medium mb-2
              ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
            `}>
              Language
            </label>
            <select
              value={general.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
              className={`
                w-full px-4 py-2 rounded-lg
                transition-colors duration-200
                ${theme === 'dark'
                  ? 'bg-gray-800 border border-gray-600 text-white focus:border-blue-500'
                  : 'bg-white border border-gray-300 text-gray-900 focus:border-blue-500'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500/20
              `}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="zh">Chinese</option>
            </select>
          </div>

          {/* Timezone */}
          <div>
            <label className={`
              block text-sm font-medium mb-2
              ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
            `}>
              Timezone
            </label>
            <select
              value={general.timezone}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
              className={`
                w-full px-4 py-2 rounded-lg
                transition-colors duration-200
                ${theme === 'dark'
                  ? 'bg-gray-800 border border-gray-600 text-white focus:border-blue-500'
                  : 'bg-white border border-gray-300 text-gray-900 focus:border-blue-500'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500/20
              `}
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Asia/Kolkata">India</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

