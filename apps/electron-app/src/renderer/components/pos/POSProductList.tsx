import { useAppStore, useSettingsStore } from '../../stores'
import type { EnhancedProduct } from '../../services/api'

/**
 * POSProductList component props
 */
export interface POSProductListProps {
  /** Array of products to display */
  products: EnhancedProduct[]
  /** Product click handler */
  onProductClick: (product: EnhancedProduct) => void
  /** Loading state */
  isLoading?: boolean
}

/**
 * POS Product List View - Compact list layout for retail mode
 * 
 * Features:
 * - Compact rows with essential information
 * - Touch-friendly (minimum 56px row height)
 * - Quick scanning of SKU and prices
 * - Stock quantity display
 * - Fast scrolling performance
 * 
 * @example
 * ```tsx
 * <POSProductList
 *   products={products}
 *   onProductClick={handleAddToCart}
 * />
 * ```
 */
export function POSProductList({
  products,
  onProductClick,
  isLoading = false
}: POSProductListProps) {
  const { theme } = useAppStore()
  const { business } = useSettingsStore()

  const formatCurrency = (amount: number): string => {
    const { currencyConfig } = business
    const formatted = amount.toFixed(currencyConfig.decimalPlaces)
    const parts = formatted.split('.')
    
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, currencyConfig.thousandSeparator)
    
    const value = parts.join(currencyConfig.decimalSeparator)
    
    if (currencyConfig.symbolPosition === 'before') {
      return `${currencyConfig.symbol}${value}`
    } else {
      return `${value}${currencyConfig.symbol}`
    }
  }

  const getStockStatusColor = (product: EnhancedProduct) => {
    if (product.product_type === 'service' || !product.track_inventory) {
      return theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
    }

    if (product.stock_quantity <= 0) {
      return 'text-red-500'
    }

    if (product.stock_quantity <= product.low_stock_threshold) {
      return 'text-yellow-500'
    }

    return theme === 'dark' ? 'text-green-400' : 'text-green-600'
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
    <div className="flex flex-col h-full">
      {/* Table Header */}
      <div className={`
        sticky top-0 z-10 grid grid-cols-12 gap-3 px-4 py-3 border-b
        ${theme === 'dark' 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-gray-50 border-gray-200'
        }
      `}>
        <div className="col-span-1"></div>
        <div className={`
          col-span-5 text-xs font-semibold uppercase tracking-wider
          ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
        `}>
          Product
        </div>
        <div className={`
          col-span-2 text-xs font-semibold uppercase tracking-wider
          ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
        `}>
          SKU
        </div>
        <div className={`
          col-span-2 text-xs font-semibold uppercase tracking-wider text-right
          ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
        `}>
          Price
        </div>
        <div className={`
          col-span-2 text-xs font-semibold uppercase tracking-wider text-right
          ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
        `}>
          Stock
        </div>
      </div>

      {/* Product List */}
      <div className="flex-1 overflow-y-auto">
        {products.map((product) => {
          const imageUrl = product.image_paths && product.image_paths.length > 0
            ? `http://localhost:8000/uploads/${product.image_paths[0]}`
            : null
          
          const isOutOfStock = product.track_inventory && 
            product.product_type !== 'service' && 
            product.stock_quantity <= 0

          const stockColor = getStockStatusColor(product)

          return (
            <button
              key={product.id}
              onClick={() => !isOutOfStock && onProductClick(product)}
              disabled={isOutOfStock}
              className={`
                group w-full grid grid-cols-12 gap-3 px-4 py-3 border-b
                min-h-[56px] transition-all duration-200 ease-out
                ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
                ${isOutOfStock 
                  ? 'opacity-50 cursor-not-allowed' 
                  : theme === 'dark'
                    ? 'hover:bg-gray-750 active:bg-gray-700 hover:shadow-md hover:border-gray-600'
                    : 'hover:bg-gray-50 active:bg-gray-100 hover:shadow-md hover:border-gray-300'
                }
              `}
            >
              {/* Product Image */}
              <div className="col-span-1 flex items-center">
                <div className={`
                  w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0
                  ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}
                `}>
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg 
                      className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Product Name & Category */}
              <div className="col-span-5 flex flex-col justify-center text-left min-w-0">
                <span className={`
                  text-sm font-semibold truncate
                  ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
                `}>
                  {product.name}
                </span>
                {product.category_name && (
                  <span className={`
                    text-xs truncate
                    ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                  `}>
                    {product.category_name}
                  </span>
                )}
              </div>

              {/* SKU */}
              <div className="col-span-2 flex items-center">
                <span className={`
                  text-sm font-mono
                  ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
                `}>
                  {product.sku || '-'}
                </span>
              </div>

              {/* Price */}
              <div className="col-span-2 flex items-center justify-end">
                <span className={`
                  text-base font-bold
                  ${theme === 'dark' ? 'text-primary-400' : 'text-primary-600'}
                `}>
                  {formatCurrency(product.base_price)}
                </span>
              </div>

              {/* Stock */}
              <div className="col-span-2 flex items-center justify-end">
                {product.track_inventory && product.product_type !== 'service' ? (
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${stockColor}`}>
                      {product.stock_quantity}
                    </span>
                    {isOutOfStock && (
                      <span className="text-xs font-medium text-red-500">OUT</span>
                    )}
                  </div>
                ) : (
                  <span className={`
                    text-xs font-medium
                    ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}
                  `}>
                    N/A
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
