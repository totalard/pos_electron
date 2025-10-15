import { useState } from 'react'
import { useAppStore, usePinStore } from '../stores'

interface DashboardProps {
  onNavigate: (screen: 'sales' | 'products' | 'inventory' | 'users' | 'settings') => void
  onLogout?: () => void
}

export function Dashboard({ onNavigate, onLogout }: DashboardProps) {
  const { theme, toggleTheme } = useAppStore()
  const { currentUser } = usePinStore()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  // Update time every second
  useState(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  })

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
      id: 'users',
      title: 'User Management',
      description: 'Manage users and permissions',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'from-orange-500 to-orange-700',
      available: currentUser?.role === 'primary' // Only available to primary user
    }
  ]

  return (
    <div className={`
      min-h-screen
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
        backdrop-blur-sm
      `}>
        <div className="w-full px-8 py-4">
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

            {/* Center Section - Search and Quick Actions */}
            <div className="flex items-center gap-6 flex-1 justify-center max-w-2xl">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search products, customers, or transactions..."
                  className={`
                    w-full pl-10 pr-4 py-2 rounded-lg border
                    ${theme === 'dark'
                      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-primary-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-primary-500'
                    }
                    focus:outline-none focus:ring-2 focus:ring-primary-500/20
                  `}
                />
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <button className={`
                  p-2 rounded-lg transition-colors
                  ${theme === 'dark'
                    ? 'hover:bg-gray-700/50 text-gray-300 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                  }
                `} title="Quick Sale">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
                <button className={`
                  p-2 rounded-lg transition-colors
                  ${theme === 'dark'
                    ? 'hover:bg-gray-700/50 text-gray-300 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                  }
                `} title="Notifications">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.07 2.82l3.12 3.12M7.05 5.84l3.12 3.12M4.03 8.86l3.12 3.12M1.01 11.88l3.12 3.12" />
                  </svg>
                </button>
                <button className={`
                  p-2 rounded-lg transition-colors
                  ${theme === 'dark'
                    ? 'hover:bg-gray-700/50 text-gray-300 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                  }
                `} title="Settings">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Right Section - System Status, User Info and Time */}
            <div className="flex items-center gap-6">
              {/* System Status */}
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  System Online
                </span>
              </div>

              {/* User Info */}
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
                  {currentUser?.role === 'primary' ? 'Primary User' : 'Staff'}
                </p>
              </div>

              {/* Time and Date */}
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

              {/* User Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${theme === 'dark'
                      ? 'bg-primary-600 hover:bg-primary-700'
                      : 'bg-primary-500 hover:bg-primary-600'
                    }
                    transition-colors
                  `}
                >
                  <span className="text-white text-sm font-bold">
                    {currentUser?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <>
                    {/* Backdrop to close menu */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowProfileMenu(false)}
                    />

                    {/* Menu */}
                    <div className={`
                      absolute right-0 mt-2 w-64 rounded-lg shadow-lg z-20
                      ${theme === 'dark'
                        ? 'bg-gray-800 border border-gray-700'
                        : 'bg-white border border-gray-200'
                      }
                    `}>
                      {/* User Info Section */}
                      <div className={`
                        px-4 py-3 border-b
                        ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
                      `}>
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {currentUser?.full_name || 'User'}
                        </p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {currentUser?.role === 'primary' ? 'Primary User' : 'Staff'}
                        </p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        {/* Dark Mode Toggle */}
                        <button
                          onClick={() => {
                            toggleTheme()
                            setShowProfileMenu(false)
                          }}
                          className={`
                            w-full px-4 py-2 flex items-center gap-3 transition-colors
                            ${theme === 'dark'
                              ? 'hover:bg-gray-700 text-gray-300'
                              : 'hover:bg-gray-100 text-gray-700'
                            }
                          `}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {theme === 'dark' ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            )}
                          </svg>
                          <span className="text-sm">
                            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                          </span>
                        </button>

                        {/* Settings */}
                        <button
                          onClick={() => {
                            setShowProfileMenu(false)
                            onNavigate('settings')
                          }}
                          className={`
                            w-full px-4 py-2 flex items-center gap-3 transition-colors
                            ${theme === 'dark'
                              ? 'hover:bg-gray-700 text-gray-300'
                              : 'hover:bg-gray-100 text-gray-700'
                            }
                          `}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-sm">Settings</span>
                        </button>

                        {/* Divider */}
                        <div className={`my-2 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`} />

                        {/* Logout */}
                        {onLogout && (
                          <button
                            onClick={() => {
                              setShowProfileMenu(false)
                              onLogout()
                            }}
                            className={`
                              w-full px-4 py-2 flex items-center gap-3 transition-colors
                              ${theme === 'dark'
                                ? 'hover:bg-red-900/30 text-red-400'
                                : 'hover:bg-red-50 text-red-600'
                              }
                            `}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span className="text-sm font-medium">Logout</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className={`
            text-3xl font-bold mb-2
            ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
          `}>
            Welcome back, {currentUser?.full_name?.split(' ')[0] || 'User'}!
          </h2>
          <p className={`
            text-lg
            ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
          `}>
            What would you like to do today?
          </p>
        </div>

        {/* Menu Grid - Adjusted for full width */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-12">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => item.available && onNavigate(item.id as any)}
              disabled={!item.available}
              className={`
                group relative overflow-hidden rounded-2xl p-8
                transition-all duration-300
                ${item.available
                  ? 'hover:scale-105 hover:shadow-2xl cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'
                }
                ${theme === 'dark'
                  ? 'bg-gray-800/50 border border-gray-700 hover:border-gray-600'
                  : 'bg-white border border-gray-200 hover:border-gray-300'
                }
              `}
            >
              {/* Background Gradient */}
              <div className={`
                absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300
                bg-gradient-to-br ${item.color}
              `} />

              {/* Icon */}
              <div className={`
                mb-4 text-transparent bg-clip-text bg-gradient-to-br ${item.color}
              `}>
                {item.icon}
              </div>

              {/* Content */}
              <h3 className={`
                text-xl font-bold mb-2
                ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
              `}>
                {item.title}
              </h3>
              <p className={`
                text-sm
                ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
              `}>
                {item.description}
              </p>

              {/* Arrow Icon */}
              {item.available && (
                <div className={`
                  absolute bottom-4 right-4 opacity-0 group-hover:opacity-100
                  transition-opacity duration-300
                  ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                `}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Quick Stats - Enhanced for full width */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          <div className={`
            rounded-xl p-6
            ${theme === 'dark'
              ? 'bg-gray-800/50 border border-gray-700'
              : 'bg-white border border-gray-200'
            }
          `}>
            <div className="flex items-center justify-between mb-2">
              <p className={`
                text-sm font-medium
                ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
              `}>
                Today's Sales
              </p>
              <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-green-400' : 'text-green-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <p className={`
              text-3xl font-bold
              ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
            `}>
              $0.00
            </p>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              +0% from yesterday
            </p>
          </div>

          <div className={`
            rounded-xl p-6
            ${theme === 'dark'
              ? 'bg-gray-800/50 border border-gray-700'
              : 'bg-white border border-gray-200'
            }
          `}>
            <div className="flex items-center justify-between mb-2">
              <p className={`
                text-sm font-medium
                ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
              `}>
                Total Products
              </p>
              <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className={`
              text-3xl font-bold
              ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
            `}>
              0
            </p>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              Active inventory
            </p>
          </div>

          <div className={`
            rounded-xl p-6
            ${theme === 'dark'
              ? 'bg-gray-800/50 border border-gray-700'
              : 'bg-white border border-gray-200'
            }
          `}>
            <div className="flex items-center justify-between mb-2">
              <p className={`
                text-sm font-medium
                ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
              `}>
                Low Stock Items
              </p>
              <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className={`
              text-3xl font-bold
              ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
            `}>
              0
            </p>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              Need restocking
            </p>
          </div>

          <div className={`
            rounded-xl p-6
            ${theme === 'dark'
              ? 'bg-gray-800/50 border border-gray-700'
              : 'bg-white border border-gray-200'
            }
          `}>
            <div className="flex items-center justify-between mb-2">
              <p className={`
                text-sm font-medium
                ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
              `}>
                Transactions
              </p>
              <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className={`
              text-3xl font-bold
              ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
            `}>
              0
            </p>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              Today's count
            </p>
          </div>

          <div className={`
            rounded-xl p-6
            ${theme === 'dark'
              ? 'bg-gray-800/50 border border-gray-700'
              : 'bg-white border border-gray-200'
            }
          `}>
            <div className="flex items-center justify-between mb-2">
              <p className={`
                text-sm font-medium
                ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
              `}>
                Active Users
              </p>
              <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className={`
              text-3xl font-bold
              ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
            `}>
              1
            </p>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              Currently online
            </p>
          </div>

          <div className={`
            rounded-xl p-6
            ${theme === 'dark'
              ? 'bg-gray-800/50 border border-gray-700'
              : 'bg-white border border-gray-200'
            }
          `}>
            <div className="flex items-center justify-between mb-2">
              <p className={`
                text-sm font-medium
                ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
              `}>
                System Health
              </p>
              <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-green-400' : 'text-green-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className={`
              text-3xl font-bold
              ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
            `}>
              100%
            </p>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              All systems operational
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

