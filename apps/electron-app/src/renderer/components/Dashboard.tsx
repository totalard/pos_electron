import { useState, useEffect } from 'react'
import { useAppStore, usePinStore, useSettingsStore } from '../stores'
import { MenuCard } from './pos'
import { Grid, PageHeader } from './layout'
import { ThemeToggle } from './common'
import { DashboardAnalytics } from './DashboardAnalytics'

interface DashboardProps {
  onNavigate: (screen: 'sales' | 'products' | 'inventory' | 'users' | 'settings' | 'customers' | 'transactions' | 'restaurant') => void
  onLock?: () => void
  onLogout?: () => void
}

export function Dashboard({ onNavigate, onLock, onLogout }: DashboardProps) {
  const { theme } = useAppStore()
  const { currentUser } = usePinStore()
  const { business } = useSettingsStore()
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const menuItems = [
    {
      id: 'sales',
      title: 'Point of Sale',
      description: 'Process sales and transactions',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'from-blue-500 to-blue-700',
      available: true
    },
    {
      id: 'products',
      title: 'Products & Services',
      description: 'Manage products and services',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: 'from-green-500 to-green-700',
      available: true
    },
    {
      id: 'inventory',
      title: 'Inventory',
      description: 'Track and manage stock',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      color: 'from-purple-500 to-purple-700',
      available: true
    },
    {
      id: 'customers',
      title: 'Customer Management',
      description: 'Manage customers and loyalty',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'from-pink-500 to-pink-700',
      available: true
    },
    {
      id: 'transactions',
      title: 'Transaction Management',
      description: 'View all transactions and reports',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      color: 'from-orange-500 to-orange-700',
      available: true
    },
    {
      id: 'restaurant',
      title: 'Restaurant Management',
      description: 'Manage restaurant operations',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'from-red-500 to-red-700',
      available: business.mode === 'restaurant'
    }
  ]

  // Filter out unavailable items
  const availableMenuItems = menuItems.filter(item => item.available)

  return (
    <div className={`
      min-h-screen w-screen p-4
      ${theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
      }
    `}>
      {/* Header */}
      <header className={`
        border-b
        ${theme === 'dark'
          ? 'bg-gray-800/50 border-gray-700'
          : 'bg-white/80 border-gray-200'
        }
        backdrop-blur-sm rounded-t-xl
      `}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center gap-4">
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center
                ${theme === 'dark' 
                  ? 'bg-gradient-to-br from-primary-600 to-primary-800' 
                  : 'bg-gradient-to-br from-primary-500 to-primary-700'
                }
              `}>
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className={`
                  text-2xl font-bold
                  ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
                `}>
                  MidLogic POS
                </h1>
                <p className={`
                  text-sm
                  ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                `}>
                  Point of Sale System
                </p>
              </div>
            </div>

            {/* User Info, Time, Settings, and Theme Toggle */}
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className={`
                  text-sm font-medium
                  ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
                `}>
                  {currentUser?.full_name || 'User'}
                </p>
                <p className={`
                  text-xs
                  ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                `}>
                  {currentUser?.role === 'admin' ? 'Administrator' : 'User'}
                </p>
              </div>
              <div className={`
                px-4 py-2 rounded-lg
                ${theme === 'dark'
                  ? 'bg-gray-700/50 text-gray-300'
                  : 'bg-gray-100 text-gray-700'
                }
              `}>
                <p className="text-sm font-mono">
                  {currentTime.toLocaleTimeString()}
                </p>
                <p className="text-xs">
                  {currentTime.toLocaleDateString()}
                </p>
              </div>
              {onLock && (
                <button
                  onClick={onLock}
                  className={`
                    p-3 rounded-xl transition-all duration-200
                    transform hover:scale-110 active:scale-95
                    ${theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }
                  `}
                  title="Lock Screen"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </button>
              )}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className={`
                    p-3 rounded-xl transition-all duration-200
                    transform hover:scale-110 active:scale-95
                    ${theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }
                  `}
                  title="Logout"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              )}
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => onNavigate('settings')}
                  className={`
                    p-3 rounded-xl transition-all duration-200
                    transform hover:scale-110 active:scale-95
                    ${theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }
                  `}
                  title="Settings"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              )}
              <ThemeToggle size="md" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`
        px-6 py-8 rounded-b-xl
        ${theme === 'dark' ? 'bg-gray-800/30' : 'bg-white/50'}
      `}>
        {/* Menu Grid - Touch-safe with minimum 44x44px targets */}
        <Grid cols={1} gap="lg" responsive={{ md: 2, lg: 3, xl: 6 }}>
          {availableMenuItems.map((item) => (
            <MenuCard
              key={item.id}
              title={item.title}
              description={item.description}
              icon={item.icon}
              gradient={item.color}
              available={item.available}
              onClick={() => onNavigate(item.id as any)}
            />
          ))}
        </Grid>

        {/* Comprehensive Analytics Dashboard */}
        <div className="mt-12">
          <DashboardAnalytics />
        </div>
      </main>
    </div>
  )
}

