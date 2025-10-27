import { useMemo } from 'react'
import { useAppStore } from '../../stores'
import { useCurrency } from '../../hooks/useCurrency'
import type { StockTransaction } from '../../stores/inventoryStore'

interface TransactionAnalyticsProps {
  transactions: StockTransaction[]
}

export function TransactionAnalytics({ transactions }: TransactionAnalyticsProps) {
  const { theme } = useAppStore()
  const { formatCurrency } = useCurrency()

  const analytics = useMemo(() => {
    const byType = transactions.reduce((acc, t) => {
      acc[t.transaction_type] = (acc[t.transaction_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byTypeValue = transactions.reduce((acc, t) => {
      acc[t.transaction_type] = (acc[t.transaction_type] || 0) + (t.total_cost || 0)
      return acc
    }, {} as Record<string, number>)

    const totalValue = transactions.reduce((sum, t) => sum + (t.total_cost || 0), 0)
    const totalIn = transactions.filter(t => t.quantity > 0).reduce((sum, t) => sum + t.quantity, 0)
    const totalOut = transactions.filter(t => t.quantity < 0).reduce((sum, t) => sum + Math.abs(t.quantity), 0)

    // Group by date for trend
    const byDate = transactions.reduce((acc, t) => {
      const date = new Date(t.created_at).toLocaleDateString()
      if (!acc[date]) {
        acc[date] = { count: 0, value: 0 }
      }
      acc[date].count++
      acc[date].value += t.total_cost || 0
      return acc
    }, {} as Record<string, { count: number; value: number }>)

    // Top products by transaction count
    const productCounts = transactions.reduce((acc, t) => {
      const key = t.product_name || 'Unknown'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topProducts = Object.entries(productCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    return {
      byType,
      byTypeValue,
      totalValue,
      totalIn,
      totalOut,
      byDate,
      topProducts
    }
  }, [transactions])

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'purchase': return 'bg-green-500'
      case 'sale': return 'bg-blue-500'
      case 'adjustment': return 'bg-purple-500'
      case 'return': return 'bg-yellow-500'
      case 'damage': return 'bg-red-500'
      case 'transfer': return 'bg-indigo-500'
      default: return 'bg-gray-500'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'purchase': return '📥'
      case 'sale': return '📤'
      case 'adjustment': return '✏️'
      case 'return': return '↩️'
      case 'damage': return '⚠️'
      case 'transfer': return '🔄'
      default: return '📦'
    }
  }

  if (transactions.length === 0) {
    return (
      <div className={`
        p-8 rounded-xl text-center
        ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}
      `}>
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
          No transaction data available for analytics
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <p className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Total Transactions
          </p>
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {transactions.length}
          </p>
        </div>
        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <p className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Total Value
          </p>
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {formatCurrency(analytics.totalValue)}
          </p>
        </div>
        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <p className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Total Stock In
          </p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            +{analytics.totalIn}
          </p>
        </div>
        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <p className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Total Stock Out
          </p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">
            -{analytics.totalOut}
          </p>
        </div>
      </div>

      {/* Transaction Type Breakdown */}
      <div className={`
        p-6 rounded-xl
        ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}
      `}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Transaction Type Breakdown
        </h3>
        <div className="space-y-3">
          {Object.entries(analytics.byType).map(([type, count]) => {
            const percentage = (count / transactions.length) * 100
            const value = analytics.byTypeValue[type] || 0
            return (
              <div key={type}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getTypeIcon(type)}</span>
                    <span className={`font-medium capitalize ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {type}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {count}
                    </span>
                    <span className={`text-sm ml-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      ({percentage.toFixed(1)}%)
                    </span>
                    {value > 0 && (
                      <span className={`text-sm ml-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        • {formatCurrency(value)}
                      </span>
                    )}
                  </div>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div
                    className={`h-full ${getTypeColor(type)} transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top Products */}
      <div className={`
        p-6 rounded-xl
        ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}
      `}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Most Active Products
        </h3>
        <div className="space-y-2">
          {analytics.topProducts.map(([product, count], index) => (
            <div
              key={product}
              className={`
                flex items-center justify-between p-3 rounded-lg
                ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}
              `}
            >
              <div className="flex items-center gap-3">
                <span className={`
                  w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm
                  ${index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-orange-600 text-white' :
                    theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-300 text-gray-700'}
                `}>
                  {index + 1}
                </span>
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {product}
                </span>
              </div>
              <span className={`font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {count} transactions
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Activity */}
      <div className={`
        p-6 rounded-xl
        ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}
      `}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Daily Activity (Last 7 Days)
        </h3>
        <div className="space-y-2">
          {Object.entries(analytics.byDate)
            .slice(-7)
            .map(([date, data]) => (
              <div
                key={date}
                className={`
                  flex items-center justify-between p-3 rounded-lg
                  ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}
                `}
              >
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {date}
                </span>
                <div className="text-right">
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {data.count} transactions
                  </span>
                  {data.value > 0 && (
                    <span className={`text-sm ml-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      • {formatCurrency(data.value)}
                    </span>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
