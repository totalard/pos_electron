import { useState } from 'react'
import { useAppStore, usePinStore } from '../stores'

interface DashboardProps {
  onNavigate: (screen: 'sales' | 'products' | 'inventory' | 'users') => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { theme } = useAppStore()
  const { currentUser } = usePinStore()
  const [currentTime, setCurrentTime] = useState(new Date())

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
        <div className="max-w-7xl mx-auto px-6 py-4">
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

            {/* User Info and Time */}
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
                  {currentUser?.role === 'primary' ? 'Primary User' : 'Staff'}
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
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

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        {/* Quick Stats (Optional - can be implemented later) */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`
            rounded-xl p-6
            ${theme === 'dark' 
              ? 'bg-gray-800/50 border border-gray-700' 
              : 'bg-white border border-gray-200'
            }
          `}>
            <p className={`
              text-sm font-medium mb-1
              ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
            `}>
              Today's Sales
            </p>
            <p className={`
              text-3xl font-bold
              ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
            `}>
              $0.00
            </p>
          </div>

          <div className={`
            rounded-xl p-6
            ${theme === 'dark' 
              ? 'bg-gray-800/50 border border-gray-700' 
              : 'bg-white border border-gray-200'
            }
          `}>
            <p className={`
              text-sm font-medium mb-1
              ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
            `}>
              Total Products
            </p>
            <p className={`
              text-3xl font-bold
              ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
            `}>
              0
            </p>
          </div>

          <div className={`
            rounded-xl p-6
            ${theme === 'dark' 
              ? 'bg-gray-800/50 border border-gray-700' 
              : 'bg-white border border-gray-200'
            }
          `}>
            <p className={`
              text-sm font-medium mb-1
              ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
            `}>
              Low Stock Items
            </p>
            <p className={`
              text-3xl font-bold
              ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
            `}>
              0
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

