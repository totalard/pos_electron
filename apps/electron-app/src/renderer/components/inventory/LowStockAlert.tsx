import { useAppStore } from '../../stores'
import type { LowStockProduct } from '../../stores/inventoryStore'

interface LowStockAlertProps {
  product: LowStockProduct
}

export function LowStockAlert({ product }: LowStockAlertProps) {
  const { theme } = useAppStore()

  const stockPercentage = (product.current_stock / product.min_stock_level) * 100
  const isOutOfStock = product.current_stock === 0
  const isCritical = stockPercentage < 50

  return (
    <div className={`
      flex items-center justify-between p-4 rounded-lg transition-all duration-200
      ${theme === 'dark'
        ? 'bg-gray-700/50 hover:bg-gray-700/70'
        : 'bg-gray-50 hover:bg-gray-100'
      }
      ${isOutOfStock ? 'border-2 border-red-500/50' : isCritical ? 'border-2 border-yellow-500/50' : 'border border-gray-200 dark:border-gray-600'}
    `}>
      <div className="flex items-center gap-4 flex-1">
        {/* Product Image or Placeholder */}
        <div className={`
          w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0
          ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}
        `}>
          {product.image_path ? (
            <img
              src={product.image_path}
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {product.name}
            </h4>
            {isOutOfStock && (
              <span className="px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded">
                OUT OF STOCK
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              SKU: {product.sku}
            </span>
            {product.category_name && (
              <>
                <span className={`${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`}>•</span>
                <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {product.category_name}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Stock Level */}
        <div className="text-right">
          <div className={`text-2xl font-bold mb-1 ${
            isOutOfStock
              ? 'text-red-600 dark:text-red-500'
              : isCritical
              ? 'text-yellow-600 dark:text-yellow-500'
              : theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {product.current_stock}
          </div>
          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Min: {product.min_stock_level}
          </div>
        </div>

        {/* Stock Bar */}
        <div className="w-24">
          <div className={`h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
            <div
              className={`h-full transition-all duration-300 ${
                isOutOfStock
                  ? 'bg-red-500'
                  : isCritical
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(stockPercentage, 100)}%` }}
            />
          </div>
          <div className={`text-xs text-center mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {stockPercentage.toFixed(0)}%
          </div>
        </div>
      </div>
    </div>
  )
}
