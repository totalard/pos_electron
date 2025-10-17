import { useAppStore, useSettingsStore, SettingsSection } from '../../stores'

interface NavigationItem {
  id: SettingsSection
  title: string
  description: string
  icon: JSX.Element
  visible?: boolean
}

export function SettingsNavigation() {
  const { theme } = useAppStore()
  const { selectedSection, setSelectedSection, business } = useSettingsStore()

  const navigationItems: NavigationItem[] = [
    {
      id: 'general',
      title: 'General',
      description: 'General application settings',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      )
    },
    {
      id: 'business',
      title: 'Business',
      description: 'Restaurant or Retail mode',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      id: 'taxes',
      title: 'Taxes',
      description: 'Tax configuration settings',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'hardware',
      title: 'Hardware',
      description: 'Peripheral device settings',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'receipts',
      title: 'Receipts',
      description: 'Receipt template settings',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'inventory',
      title: 'Inventory',
      description: 'Inventory management settings',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      id: 'integration',
      title: 'Integration',
      description: 'Third-party integrations',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'backup',
      title: 'Backup & Restore',
      description: 'Data backup options',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      )
    },
    {
      id: 'about',
      title: 'About',
      description: 'App info & updates',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ]

  // Filter items based on business mode (if needed in future)
  const visibleItems = navigationItems.filter(item => item.visible !== false)

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-2">
        {visibleItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedSection(item.id)}
            className={`
              w-full text-left p-4 rounded-lg
              transition-all duration-200
              ${selectedSection === item.id
                ? theme === 'dark'
                  ? 'bg-blue-500/20 border-2 border-blue-500'
                  : 'bg-blue-50 border-2 border-blue-500'
                : theme === 'dark'
                  ? 'bg-gray-700/30 border-2 border-transparent hover:bg-gray-700/50 hover:border-gray-600'
                  : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100 hover:border-gray-300'
              }
            `}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className={`
                flex-shrink-0 p-2 rounded-lg
                ${selectedSection === item.id
                  ? 'bg-blue-500 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-600 text-gray-300'
                    : 'bg-gray-200 text-gray-600'
                }
              `}>
                {item.icon}
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <h3 className={`
                  font-semibold mb-1
                  ${selectedSection === item.id
                    ? theme === 'dark'
                      ? 'text-blue-400'
                      : 'text-blue-600'
                    : theme === 'dark'
                      ? 'text-white'
                      : 'text-gray-900'
                  }
                `}>
                  {item.title}
                </h3>
                <p className={`
                  text-sm
                  ${selectedSection === item.id
                    ? theme === 'dark'
                      ? 'text-blue-300'
                      : 'text-blue-600'
                    : theme === 'dark'
                      ? 'text-gray-400'
                      : 'text-gray-600'
                  }
                `}>
                  {item.description}
                </p>
              </div>

              {/* Selected Indicator */}
              {selectedSection === item.id && (
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

