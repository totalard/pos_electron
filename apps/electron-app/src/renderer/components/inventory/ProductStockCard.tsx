import { useAppStore } from '../../stores'
import type { EnhancedProduct } from '../../services/api'

interface ProductStockCardProps {
  product: EnhancedProduct
  onAdjust?: (product: EnhancedProduct) => void
}

export function ProductStockCard({ product, onAdjust }: ProductStockCardProps) {
  const { theme } = useAppStore()

  const stockLevel = product.stock_quantity || 0
  const minLevel = product.low_stock_threshold || 0
  const maxLevel = 100 // Default max level since it's not in EnhancedProduct

  const stockPercentage = maxLevel > 0 ? (stockLevel / maxLevel) * 100 : 0
  const isLowStock = stockLevel <= minLevel && stockLevel > 0
  const isOutOfStock = stockLevel === 0

  const getStockStatus = () => {
    if (isOutOfStock) return { label: 'Out of Stock', color: 'text-red-600 dark:text-red-400' }
    if (isLowStock) return { label: 'Low Stock', color: 'text-yellow-600 dark:text-yellow-400' }
    return { label: 'In Stock', color: 'text-green-600 dark:text-green-400' }
  }

  const status = getStockStatus()

  return (
    <div className={`
      rounded-xl p-6 transition-all duration-200
      ${theme === 'dark'
        ? 'bg-gray-800/50 border border-gray-700 hover:bg-gray-800/70'
        : 'bg-white border border-gray-200 hover:shadow-lg'
      }
      ${isOutOfStock ? 'ring-2 ring-red-500/50' : isLowStock ? 'ring-2 ring-yellow-500/50' : ''}
    `}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className={`text-lg font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {product.name}
          </h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            SKU: {product.sku}
          </p>
        </div>
        <span className={`px-3 py-1 text-sm font-medium rounded-full ${status.color} ${
          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          {status.label}
        </span>
      </div>

      {/* Stock Level */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Current Stock
          </span>
          <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {stockLevel}
          </span>
        </div>

        {/* Progress Bar */}
        <div className={`h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <div
            className={`h-full transition-all duration-300 ${
              isOutOfStock
                ? 'bg-red-500'
                : isLowStock
                ? 'bg-yellow-500'
                : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(stockPercentage, 100)}%` }}
          />
        </div>

        {/* Stock Levels */}
        <div className="flex items-center justify-between mt-2 text-xs">
          <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Min: {minLevel}
          </span>
          <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Max: {maxLevel}
          </span>
        </div>
      </div>

      {/* Stock Value */}
      {product.cost_price && (
        <div className={`
          p-3 rounded-lg mb-4
          ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}
        `}>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Stock Value
            </span>
            <span className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              ${(stockLevel * product.cost_price).toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              Cost per unit: ${product.cost_price.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      {onAdjust && (
        <button
          onClick={() => onAdjust(product)}
          className={`
            w-full py-2 px-4 rounded-lg font-medium transition-colors
            ${theme === 'dark'
              ? 'bg-primary-600 hover:bg-primary-700 text-white'
              : 'bg-primary-500 hover:bg-primary-600 text-white'
            }
          `}
        >
          Adjust Stock
        </button>
      )}
    </div>
  )
}
