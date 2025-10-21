import { useMemo } from 'react'
import { useAppStore, useProductStore } from '../../stores'
import type { EnhancedProduct } from '../../services/api'

export function ProductDashboard() {
  const { theme } = useAppStore()
  const { products, categories } = useProductStore()

  // Calculate statistics
  const stats = useMemo(() => {
    const activeProducts = products.filter(p => p.is_active)
    
    const totalProducts = activeProducts.length
    const totalCategories = categories.filter(c => c.is_active).length
    
    const lowStockProducts = activeProducts.filter(p => 
      p.track_inventory && 
      p.stock_quantity > 0 && 
      p.stock_quantity <= (p.low_stock_threshold || 10)
    )
    
    const outOfStockProducts = activeProducts.filter(p => 
      p.track_inventory && 
      p.stock_quantity === 0
    )
    
    const totalStockValue = activeProducts.reduce((sum, p) => {
      const cost = p.cost_price || 0
      const quantity = p.stock_quantity || 0
      return sum + (cost * quantity)
    }, 0)
    
    const totalRetailValue = activeProducts.reduce((sum, p) => {
      const price = p.base_price || 0
      const quantity = p.stock_quantity || 0
      return sum + (price * quantity)
    }, 0)

    // Product type breakdown
    const productTypes = activeProducts.reduce((acc, p) => {
      const type = p.product_type || 'simple'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalProducts,
      totalCategories,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      totalStockValue,
      totalRetailValue,
      productTypes
    }
  }, [products, categories])

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
      bgColor: theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-50',
      textColor: theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
    },
    {
      title: 'Categories',
      value: stats.totalCategories.toLocaleString(),
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      color: 'from-purple-500 to-purple-700',
      bgColor: theme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-50',
      textColor: theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
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
      textColor: theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600',
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
      textColor: theme === 'dark' ? 'text-red-400' : 'text-red-600',
      alert: stats.outOfStockCount > 0
    },
    {
      title: 'Stock Value (Cost)',
      value: `$${stats.totalStockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-green-500 to-green-700',
      bgColor: theme === 'dark' ? 'bg-green-500/10' : 'bg-green-50',
      textColor: theme === 'dark' ? 'text-green-400' : 'text-green-600'
    },
    {
      title: 'Retail Value',
      value: `$${stats.totalRetailValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'from-emerald-500 to-emerald-700',
      bgColor: theme === 'dark' ? 'bg-emerald-500/10' : 'bg-emerald-50',
      textColor: theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
    }
  ]

  return (
    <div className="space-y-4">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`
              rounded-xl p-5 border transition-all duration-300 hover:shadow-lg
              ${stat.bgColor}
              ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
              ${stat.alert ? 'ring-2 ring-offset-2 ' + (theme === 'dark' ? 'ring-yellow-500/50' : 'ring-yellow-400/50') : ''}
            `}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`
                p-2 rounded-lg
                ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'}
              `}>
                <div className={stat.textColor}>
                  {stat.icon}
                </div>
              </div>
              {stat.alert && (
                <div className={`
                  px-2 py-1 rounded-full text-xs font-semibold
                  ${theme === 'dark' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'}
                `}>
                  Alert
                </div>
              )}
            </div>
            <div>
              <p className={`
                text-sm font-medium mb-1
                ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
              `}>
                {stat.title}
              </p>
              <p className={`
                text-2xl font-bold
                ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
              `}>
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Product Type Breakdown */}
      {Object.keys(stats.productTypes).length > 0 && (
        <div className={`
          rounded-xl p-5 border
          ${theme === 'dark' ? 'bg-gray-800/30 border-gray-700' : 'bg-white border-gray-200'}
        `}>
          <h3 className={`
            text-sm font-semibold mb-3
            ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
          `}>
            Product Type Distribution
          </h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(stats.productTypes).map(([type, count]) => (
              <div
                key={type}
                className={`
                  px-4 py-2 rounded-lg border
                  ${theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}
                `}
              >
                <span className={`
                  text-xs font-medium uppercase
                  ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                `}>
                  {type}
                </span>
                <span className={`
                  ml-2 text-sm font-bold
                  ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
                `}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
