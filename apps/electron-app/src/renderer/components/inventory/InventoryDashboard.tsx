import { useAppStore, useInventoryStore } from '../../stores'
import { LowStockAlert } from './LowStockAlert'

export function InventoryDashboard() {
  const { theme } = useAppStore()
  const { stats, lowStockProducts, settings } = useInventoryStore()

  // Show loading state if stats not available yet
  if (!stats) {
    return (
      <div className={`
        rounded-xl p-12 text-center
        ${theme === 'dark'
          ? 'bg-gray-800/50 border border-gray-700'
          : 'bg-white border border-gray-200'
        }
      `}>
        <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Loading inventory data...
        </p>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts.toLocaleString(),
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: 'from-blue-500 to-blue-700',
      bgColor: theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-50'
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockCount.toLocaleString(),
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      color: 'from-yellow-500 to-yellow-700',
      bgColor: theme === 'dark' ? 'bg-yellow-500/10' : 'bg-yellow-50',
      alert: stats.lowStockCount > 0
    },
    {
      title: 'Out of Stock',
      value: stats.outOfStockCount.toLocaleString(),
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      color: 'from-red-500 to-red-700',
      bgColor: theme === 'dark' ? 'bg-red-500/10' : 'bg-red-50',
      alert: stats.outOfStockCount > 0
    },
    {
      title: 'Total Stock Value',
      value: `$${stats.totalStockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-green-500 to-green-700',
      bgColor: theme === 'dark' ? 'bg-green-500/10' : 'bg-green-50'
    },
    {
      title: 'Recent Transactions',
      value: stats.recentTransactions.toLocaleString(),
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8l2 2 4-4" />
        </svg>
      ),
      color: 'from-purple-500 to-purple-700',
      bgColor: theme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-50'
    },
    {
      title: 'Pending Adjustments',
      value: stats.pendingAdjustments.toLocaleString(),
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      color: 'from-indigo-500 to-indigo-700',
      bgColor: theme === 'dark' ? 'bg-indigo-500/10' : 'bg-indigo-50'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`
              relative overflow-hidden rounded-xl p-6 transition-all duration-200
              ${theme === 'dark'
                ? 'bg-gray-800/50 border border-gray-700 hover:bg-gray-800/70'
                : 'bg-white border border-gray-200 hover:shadow-lg'
              }
              ${stat.alert ? 'ring-2 ring-offset-2 ' + (theme === 'dark' ? 'ring-yellow-500/50 ring-offset-gray-900' : 'ring-yellow-500/30 ring-offset-white') : ''}
            `}
          >
            {/* Background Icon */}
            <div className={`absolute top-4 right-4 ${stat.bgColor} rounded-lg p-3`}>
              <div className={`text-transparent bg-clip-text bg-gradient-to-br ${stat.color}`}>
                {stat.icon}
              </div>
            </div>

            {/* Content */}
            <div className="relative">
              <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {stat.title}
              </p>
              <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stat.value}
              </p>
              {stat.alert && (
                <div className="mt-2 flex items-center gap-1 text-yellow-600 dark:text-yellow-500">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-medium">Needs Attention</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Low Stock Alerts */}
      {settings?.enableLowStockAlerts && lowStockProducts.length > 0 && (
        <div className={`
          rounded-xl p-6
          ${theme === 'dark'
            ? 'bg-gray-800/50 border border-gray-700'
            : 'bg-white border border-gray-200'
          }
        `}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`
                p-2 rounded-lg
                ${theme === 'dark' ? 'bg-yellow-500/10' : 'bg-yellow-50'}
              `}>
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Low Stock Alerts
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {lowStockProducts.length} product{lowStockProducts.length !== 1 ? 's' : ''} need{lowStockProducts.length === 1 ? 's' : ''} restocking
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {lowStockProducts.slice(0, 5).map((product) => (
              <LowStockAlert key={product.id} product={product} />
            ))}
          </div>

          {lowStockProducts.length > 5 && (
            <div className="mt-4 text-center">
              <button
                className={`
                  text-sm font-medium
                  ${theme === 'dark'
                    ? 'text-primary-400 hover:text-primary-300'
                    : 'text-primary-600 hover:text-primary-700'
                  }
                `}
              >
                View all {lowStockProducts.length} low stock items →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Settings Info */}
      {settings && (
        <div className={`
          rounded-xl p-6
          ${theme === 'dark'
            ? 'bg-gray-800/50 border border-gray-700'
            : 'bg-white border border-gray-200'
          }
        `}>
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Inventory Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <div className={`
                w-2 h-2 rounded-full
                ${settings.enableStockTracking ? 'bg-green-500' : 'bg-gray-400'}
              `} />
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Stock Tracking: {settings.enableStockTracking ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`
                w-2 h-2 rounded-full
                ${settings.deductOnSale ? 'bg-green-500' : 'bg-gray-400'}
              `} />
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Auto Deduct: {settings.deductOnSale ? 'On Sale' : 'Manual'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`
                w-2 h-2 rounded-full
                ${settings.allowNegativeStock ? 'bg-yellow-500' : 'bg-green-500'}
              `} />
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Negative Stock: {settings.allowNegativeStock ? 'Allowed' : 'Blocked'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`
                w-2 h-2 rounded-full
                ${settings.enableAutoReorder ? 'bg-green-500' : 'bg-gray-400'}
              `} />
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Auto Reorder: {settings.enableAutoReorder ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Valuation: {settings.valuationMethod}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Low Stock: {settings.lowStockThreshold} ({settings.lowStockThresholdType})
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
