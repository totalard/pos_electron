import { useAppStore, useSettingsStore, SettingsSection } from '../../stores'

interface NavigationItem {
  id: SettingsSection
  title: string
  description: string
  icon: JSX.Element
  color: string // Tailwind color class for the tile
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
      color: 'blue',
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
      color: 'green',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      id: 'denominations',
      title: 'Cash Denominations',
      description: 'Bills & coins per currency',
      color: 'yellow',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: 'taxes',
      title: 'Taxes',
      description: 'Tax configuration settings',
      color: 'purple',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'payments',
      title: 'Payments',
      description: 'Payment methods & options',
      color: 'green',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      )
    },
    {
      id: 'hardware',
      title: 'Hardware',
      description: 'Peripheral device settings',
      color: 'orange',
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
      color: 'pink',
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
      color: 'emerald',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      id: 'restaurant',
      title: 'Restaurant',
      description: 'Restaurant-specific features',
      color: 'orange',
      visible: business.mode === 'restaurant',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: 'integration',
      title: 'Integration',
      description: 'Third-party integrations',
      color: 'indigo',
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
      color: 'amber',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      )
    },
    {
      id: 'display',
      title: 'Display',
      description: 'Theme & appearance',
      color: 'violet',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'security',
      title: 'Security',
      description: 'PIN & access control',
      color: 'red',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    {
      id: 'users',
      title: 'User Management',
      description: 'Manage users & roles',
      color: 'teal',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      id: 'demo',
      title: 'Demo Data',
      description: 'Generate or clear demo data',
      color: 'cyan',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      id: 'about',
      title: 'About',
      description: 'App info & updates',
      color: 'gray',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ]

  // Filter items based on business mode (if needed in future)
  const visibleItems = navigationItems.filter(item => item.visible !== false)

  // Helper function to get color classes based on item color and theme
  const getColorClasses = (color: string, isSelected: boolean) => {
    const colorMap: Record<string, { bg: string; border: string; icon: string; text: string; textLight: string }> = {
      blue: { bg: 'bg-blue-500/20', border: 'border-blue-500', icon: 'bg-blue-500', text: 'text-blue-600', textLight: 'text-blue-400' },
      green: { bg: 'bg-green-500/20', border: 'border-green-500', icon: 'bg-green-500', text: 'text-green-600', textLight: 'text-green-400' },
      emerald: { bg: 'bg-emerald-500/20', border: 'border-emerald-500', icon: 'bg-emerald-500', text: 'text-emerald-600', textLight: 'text-emerald-400' },
      purple: { bg: 'bg-purple-500/20', border: 'border-purple-500', icon: 'bg-purple-500', text: 'text-purple-600', textLight: 'text-purple-400' },
      orange: { bg: 'bg-orange-500/20', border: 'border-orange-500', icon: 'bg-orange-500', text: 'text-orange-600', textLight: 'text-orange-400' },
      pink: { bg: 'bg-pink-500/20', border: 'border-pink-500', icon: 'bg-pink-500', text: 'text-pink-600', textLight: 'text-pink-400' },
      cyan: { bg: 'bg-cyan-500/20', border: 'border-cyan-500', icon: 'bg-cyan-500', text: 'text-cyan-600', textLight: 'text-cyan-400' },
      indigo: { bg: 'bg-indigo-500/20', border: 'border-indigo-500', icon: 'bg-indigo-500', text: 'text-indigo-600', textLight: 'text-indigo-400' },
      amber: { bg: 'bg-amber-500/20', border: 'border-amber-500', icon: 'bg-amber-500', text: 'text-amber-600', textLight: 'text-amber-400' },
      violet: { bg: 'bg-violet-500/20', border: 'border-violet-500', icon: 'bg-violet-500', text: 'text-violet-600', textLight: 'text-violet-400' },
      red: { bg: 'bg-red-500/20', border: 'border-red-500', icon: 'bg-red-500', text: 'text-red-600', textLight: 'text-red-400' },
      teal: { bg: 'bg-teal-500/20', border: 'border-teal-500', icon: 'bg-teal-500', text: 'text-teal-600', textLight: 'text-teal-400' },
      gray: { bg: 'bg-gray-500/20', border: 'border-gray-500', icon: 'bg-gray-500', text: 'text-gray-600', textLight: 'text-gray-400' }
    }

    return colorMap[color] || colorMap.blue
  }

  return (
    <div className="p-4 space-y-3">
      {visibleItems.map((item) => {
          const colors = getColorClasses(item.color, selectedSection === item.id)
          const isSelected = selectedSection === item.id

          return (
            <button
              key={item.id}
              onClick={() => setSelectedSection(item.id)}
              className={`
                w-full text-left p-4 rounded-xl min-h-[80px]
                transition-all duration-200
                transform hover:scale-[1.02] active:scale-[0.98]
                ${isSelected
                  ? `${colors.bg} border-2 ${colors.border} shadow-lg`
                  : theme === 'dark'
                    ? 'bg-gray-700/30 border-2 border-transparent hover:bg-gray-700/50 hover:border-gray-600 shadow-md'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100 hover:border-gray-300 shadow-md'
                }
              `}
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className={`
                  flex-shrink-0 p-3 rounded-xl shadow-md
                  transition-all duration-200
                  ${isSelected
                    ? `${colors.icon} text-white`
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
                    font-semibold mb-1 text-base
                    ${isSelected
                      ? theme === 'dark'
                        ? colors.textLight
                        : colors.text
                      : theme === 'dark'
                        ? 'text-white'
                        : 'text-gray-900'
                    }
                  `}>
                    {item.title}
                  </h3>
                  <p className={`
                    text-sm
                    ${isSelected
                      ? theme === 'dark'
                        ? colors.textLight
                        : colors.text
                      : theme === 'dark'
                        ? 'text-gray-400'
                        : 'text-gray-600'
                    }
                  `}>
                    {item.description}
                  </p>
                </div>

                {/* Selected Indicator */}
                {isSelected && (
                  <div className="flex-shrink-0">
                    <svg className={`w-6 h-6 ${colors.icon.replace('bg-', 'text-')}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          )
        })}
    </div>
  )
}

