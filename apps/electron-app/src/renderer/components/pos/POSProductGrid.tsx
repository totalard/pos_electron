import { useAppStore } from '../../stores'
import { CurrencyDisplay } from '../common'
import type { EnhancedProduct } from '../../services/api'

/**
 * POSProductGrid component props
 */
export interface POSProductGridProps {
  /** Array of products to display */
  products: EnhancedProduct[]
  /** Product click handler */
  onProductClick: (product: EnhancedProduct) => void
  /** Loading state */
  isLoading?: boolean
}

/**
 * POS Product Grid View - Touch-friendly grid layout for restaurant mode
 * 
 * Features:
 * - Large touch-friendly cards (minimum 120px height)
 * - Product images prominently displayed
 * - Quick add to cart functionality
 * - Stock status indicators
 * - Responsive grid layout
 * 
 * @example
 * ```tsx
 * <POSProductGrid
 *   products={products}
 *   onProductClick={handleAddToCart}
 * />
 * ```
 */
export function POSProductGrid({
  products,
  onProductClick,
  isLoading = false
}: POSProductGridProps) {
  const { theme } = useAppStore()

  const getStockStatus = (product: EnhancedProduct) => {
    if (product.product_type === 'service' || !product.track_inventory) {
      return null
    }

    if (product.stock_quantity <= 0) {
      return { label: 'Out', color: 'red' as const }
    }

    if (product.stock_quantity <= product.low_stock_threshold) {
      return { label: 'Low', color: 'yellow' as const }
    }

    return null
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p>Loading products...</p>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          <svg className="w-20 h-20 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-lg font-medium mb-1">No products found</p>
          <p className="text-sm">Try selecting a different category or adjusting filters</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 p-4">
      {products.map((product) => {
        const stockStatus = getStockStatus(product)
        const imageUrl = product.image_paths && product.image_paths.length > 0
          ? `http://localhost:8000/uploads/${product.image_paths[0]}`
          : null
        
        const isOutOfStock = product.track_inventory && 
          product.product_type !== 'service' && 
          product.stock_quantity <= 0

        return (
          <button
            key={product.id}
            onClick={() => !isOutOfStock && onProductClick(product)}
            disabled={isOutOfStock}
            className={`
              group relative flex flex-col rounded-xl overflow-hidden
              min-h-[140px] transition-all duration-300 ease-out
              transform
              ${theme === 'dark' 
                ? 'bg-gray-800 hover:bg-gray-750 active:bg-gray-700' 
                : 'bg-white hover:bg-gray-50 active:bg-gray-100'
              }
              ${isOutOfStock 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer hover:-translate-y-1'
              }
              border ${theme === 'dark' ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'}
            `}
          >
            {/* Product Image */}
            <div className={`
              relative w-full h-32 flex items-center justify-center overflow-hidden
              ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}
            `}>
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              ) : (
                <svg 
                  className={`w-12 h-12 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              )}
              
              {/* Stock Status Badge */}
              {stockStatus && (
                <div className="absolute top-2 right-2">
                  <span className={`
                    px-2 py-1 rounded-md text-xs font-bold
                    ${stockStatus.color === 'red'
                      ? 'bg-red-500 text-white'
                      : 'bg-yellow-500 text-gray-900'
                    }
                  `}>
                    {stockStatus.label}
                  </span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 p-3 flex flex-col">
              {/* Product Name */}
              <h3 className={`
                text-sm font-semibold mb-1 line-clamp-2 text-left
                ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
              `}>
                {product.name}
              </h3>

              {/* Price */}
              <div className="mt-auto">
                <CurrencyDisplay
                  amount={product.base_price}
                  className={`
                    text-lg font-bold
                    ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
                  `}
                />
              </div>
            </div>

            {/* Out of Stock Overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <span className="text-white font-bold text-lg">OUT OF STOCK</span>
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
