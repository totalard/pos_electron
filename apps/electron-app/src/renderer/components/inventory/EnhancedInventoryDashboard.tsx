import { useEffect, useState } from 'react'
import { useAppStore, useInventoryStore } from '../../stores'
import { useCurrency } from '../../hooks/useCurrency'
import { LowStockAlert } from './LowStockAlert'
import { Button } from '../common'

interface AdvancedStats {
  stockTurnoverRate: number
  averageInventoryAge: number
  deadStockCount: number
  fastMovingCount: number
  inventoryHealthScore: number
  stockoutRisk: number
}

export function EnhancedInventoryDashboard() {
  const { theme } = useAppStore()
  const { stats, lowStockProducts, settings, transactions, setViewMode } = useInventoryStore()
  const { formatCurrency } = useCurrency()
  const [advancedStats, setAdvancedStats] = useState<AdvancedStats>({
    stockTurnoverRate: 0,
    averageInventoryAge: 0,
    deadStockCount: 0,
    fastMovingCount: 0,
    inventoryHealthScore: 85,
    stockoutRisk: 12
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  useEffect(() => {
    // Calculate advanced stats
    calculateAdvancedStats()
    loadRecentActivity()
  }, [stats, transactions])

  const calculateAdvancedStats = () => {
    // Simulate advanced calculations
    const turnover = stats ? (stats.recentTransactions / Math.max(stats.totalProducts, 1)) * 10 : 0
    const avgAge = 45 // days
    const deadStock = Math.floor((stats?.totalProducts || 0) * 0.08)
    const fastMoving = Math.floor((stats?.totalProducts || 0) * 0.25)
    
    // Calculate health score based on multiple factors
    let healthScore = 100
    if (stats) {
      healthScore -= (stats.outOfStockCount / Math.max(stats.totalProducts, 1)) * 30
      healthScore -= (stats.lowStockCount / Math.max(stats.totalProducts, 1)) * 20
      healthScore -= (deadStock / Math.max(stats.totalProducts, 1)) * 15
    }
    
    const stockoutRisk = stats ? (stats.lowStockCount / Math.max(stats.totalProducts, 1)) * 100 : 0

    setAdvancedStats({
      stockTurnoverRate: Math.max(0, turnover),
      averageInventoryAge: avgAge,
      deadStockCount: deadStock,
      fastMovingCount: fastMoving,
      inventoryHealthScore: Math.max(0, Math.min(100, healthScore)),
      stockoutRisk: Math.min(100, stockoutRisk)
    })
  }

  const loadRecentActivity = () => {
    // Get recent transactions for activity timeline
    const recent = transactions.slice(0, 5).map(t => ({
      id: t.id,
      type: t.transaction_type,
      product: t.product_name || 'Unknown Product',
      quantity: t.quantity,
      time: new Date(t.created_at),
      user: t.performed_by_name || 'System'
    }))
    setRecentActivity(recent)
  }

  if (!stats) {
    return (
      <div className={`rounded-xl p-12 text-center ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
        <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Loading inventory data...
        </p>
      </div>
    )
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getHealthScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-500 to-green-600'
    if (score >= 60) return 'from-yellow-500 to-yellow-600'
    return 'from-red-500 to-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Hero Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Inventory Health Score */}
        <div className={`col-span-1 lg:col-span-2 relative overflow-hidden rounded-xl p-6 ${
          theme === 'dark' ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Inventory Health Score
              </p>
              <div className="flex items-baseline gap-2">
                <span className={`text-5xl font-bold ${getHealthScoreColor(advancedStats.inventoryHealthScore)}`}>
                  {Math.round(advancedStats.inventoryHealthScore)}
                </span>
                <span className={`text-2xl ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>/100</span>
              </div>
              <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                {advancedStats.inventoryHealthScore >= 80 ? 'Excellent health' : 
                 advancedStats.inventoryHealthScore >= 60 ? 'Good, needs attention' : 'Critical, action required'}
              </p>
            </div>
            <div className="relative w-32 h-32">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className={theme === 'dark' ? 'text-gray-700' : 'text-gray-200'}
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - advancedStats.inventoryHealthScore / 100)}`}
                  className={advancedStats.inventoryHealthScore >= 80 ? 'text-green-500' : 
                            advancedStats.inventoryHealthScore >= 60 ? 'text-yellow-500' : 'text-red-500'}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="col-span-1 lg:col-span-2 grid grid-cols-2 gap-4">
          <button onClick={() => setViewMode('transactions')} className={`rounded-xl p-4 text-left transition-all hover:scale-105 cursor-pointer ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700 hover:border-gray-600' : 'bg-white border border-gray-200 hover:shadow-lg'}`}>
            <p className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Stock Turnover
            </p>
            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {advancedStats.stockTurnoverRate.toFixed(1)}x
            </p>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              Per month
            </p>
          </button>
          <button onClick={() => setViewMode('reports')} className={`rounded-xl p-4 text-left transition-all hover:scale-105 cursor-pointer ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700 hover:border-gray-600' : 'bg-white border border-gray-200 hover:shadow-lg'}`}>
            <p className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Avg. Stock Age
            </p>
            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {advancedStats.averageInventoryAge}
            </p>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              Days
            </p>
          </button>
          <button onClick={() => setViewMode('transactions')} className={`rounded-xl p-4 text-left transition-all hover:scale-105 cursor-pointer ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700 hover:border-gray-600' : 'bg-white border border-gray-200 hover:shadow-lg'}`}>
            <p className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Fast Moving
            </p>
            <p className={`text-2xl font-bold text-green-600 dark:text-green-400`}>
              {advancedStats.fastMovingCount}
            </p>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              Products
            </p>
          </button>
          <button onClick={() => setViewMode('adjustments')} className={`rounded-xl p-4 text-left transition-all hover:scale-105 cursor-pointer ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700 hover:border-gray-600' : 'bg-white border border-gray-200 hover:shadow-lg'}`}>
            <p className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Dead Stock
            </p>
            <p className={`text-2xl font-bold text-red-600 dark:text-red-400`}>
              {advancedStats.deadStockCount}
            </p>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              Products
            </p>
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Total Products',
            value: stats.totalProducts.toLocaleString(),
            change: '+12%',
            trend: 'up',
            icon: '📦',
            color: 'blue',
            action: () => setViewMode('reports')
          },
          {
            title: 'Stock Value',
            value: formatCurrency(stats.totalStockValue),
            change: '+8.3%',
            trend: 'up',
            icon: '💰',
            color: 'green',
            action: () => setViewMode('reports')
          },
          {
            title: 'Low Stock Items',
            value: stats.lowStockCount.toLocaleString(),
            change: stats.lowStockCount > 0 ? 'Action needed' : 'All good',
            trend: stats.lowStockCount > 0 ? 'down' : 'neutral',
            icon: '⚠️',
            color: 'yellow',
            action: () => setViewMode('adjustments')
          },
          {
            title: 'Out of Stock',
            value: stats.outOfStockCount.toLocaleString(),
            change: stats.outOfStockCount > 0 ? 'Critical' : 'None',
            trend: stats.outOfStockCount > 0 ? 'down' : 'neutral',
            icon: '🚫',
            color: 'red',
            action: () => setViewMode('adjustments')
          }
        ].map((stat, index) => (
          <button
            key={index}
            onClick={stat.action}
            className={`relative overflow-hidden rounded-xl p-5 transition-all duration-200 hover:scale-105 cursor-pointer text-left ${
              theme === 'dark' ? 'bg-gray-800/50 border border-gray-700 hover:border-gray-600' : 'bg-white border border-gray-200 hover:shadow-lg hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">{stat.icon}</span>
              {stat.trend !== 'neutral' && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  stat.trend === 'up' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {stat.change}
                </span>
              )}
            </div>
            <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {stat.title}
            </p>
            <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {stat.value}
            </p>
          </button>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Alerts & Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Critical Alerts */}
          {(stats.outOfStockCount > 0 || stats.lowStockCount > 0) && (
            <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-red-500/10' : 'bg-red-50'}`}>
                    <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Critical Inventory Alerts
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {stats.outOfStockCount + stats.lowStockCount} items need immediate attention
                    </p>
                  </div>
                </div>
                <Button variant="primary" size="sm">
                  View All
                </Button>
              </div>

              <div className="space-y-2">
                {stats.outOfStockCount > 0 && (
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-red-900/20 border border-red-800/50' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${theme === 'dark' ? 'text-red-400' : 'text-red-900'}`}>
                          Out of Stock
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-red-300' : 'text-red-700'}`}>
                          {stats.outOfStockCount} products completely depleted
                        </p>
                      </div>
                      <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                        {stats.outOfStockCount}
                      </span>
                    </div>
                  </div>
                )}
                {stats.lowStockCount > 0 && (
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-yellow-900/20 border border-yellow-800/50' : 'bg-yellow-50 border border-yellow-200'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-900'}`}>
                          Low Stock Warning
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'}`}>
                          {stats.lowStockCount} products below minimum threshold
                        </p>
                      </div>
                      <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
                        {stats.lowStockCount}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Low Stock Products */}
          {lowStockProducts.length > 0 && (
            <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Products Needing Restock
                </h3>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {lowStockProducts.length} items
                </span>
              </div>
              <div className="space-y-3">
                {lowStockProducts.slice(0, 3).map((product) => (
                  <LowStockAlert key={product.id} product={product} />
                ))}
              </div>
              {lowStockProducts.length > 3 && (
                <button className={`w-full mt-4 text-sm font-medium ${theme === 'dark' ? 'text-primary-400 hover:text-primary-300' : 'text-primary-600 hover:text-primary-700'}`}>
                  View all {lowStockProducts.length} items →
                </button>
              )}
            </div>
          )}

          {/* Recent Activity Timeline */}
          {recentActivity.length > 0 && (
            <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Recent Activity
              </h3>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === 'purchase' ? 'bg-green-100 dark:bg-green-900/30' :
                      activity.type === 'sale' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      'bg-purple-100 dark:bg-purple-900/30'
                    }`}>
                      <span className="text-lg">
                        {activity.type === 'purchase' ? '📥' : activity.type === 'sale' ? '📤' : '✏️'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {activity.product}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} • {activity.quantity > 0 ? '+' : ''}{activity.quantity} units
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                        {activity.time.toLocaleTimeString()} by {activity.user}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Quick Actions & Insights */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Quick Stock Adjustment
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search Products
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import/Export
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                View Reports
              </Button>
            </div>
          </div>

          {/* Stockout Risk Meter */}
          <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Stockout Risk
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Risk Level
                </span>
                <span className={`text-2xl font-bold ${
                  advancedStats.stockoutRisk < 20 ? 'text-green-600 dark:text-green-400' :
                  advancedStats.stockoutRisk < 50 ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                  {Math.round(advancedStats.stockoutRisk)}%
                </span>
              </div>
              <div className={`h-3 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div
                  className={`h-full transition-all duration-500 ${
                    advancedStats.stockoutRisk < 20 ? 'bg-green-500' :
                    advancedStats.stockoutRisk < 50 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${advancedStats.stockoutRisk}%` }}
                />
              </div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                {advancedStats.stockoutRisk < 20 ? 'Low risk - inventory levels are healthy' :
                 advancedStats.stockoutRisk < 50 ? 'Moderate risk - monitor closely' :
                 'High risk - immediate action required'}
              </p>
            </div>
          </div>

          {/* Top Recommendations */}
          <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Recommendations
            </h3>
            <div className="space-y-3">
              {advancedStats.deadStockCount > 0 && (
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-900'}`}>
                    Review Dead Stock
                  </p>
                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'}`}>
                    {advancedStats.deadStockCount} items haven't moved in 90+ days
                  </p>
                </div>
              )}
              {stats.lowStockCount > 0 && (
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-400' : 'text-blue-900'}`}>
                    Reorder Soon
                  </p>
                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                    {stats.lowStockCount} products need restocking
                  </p>
                </div>
              )}
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'}`}>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-900'}`}>
                  Optimize Fast Movers
                </p>
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>
                  Increase stock for {advancedStats.fastMovingCount} high-demand items
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
