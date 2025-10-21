import { useAppStore } from '../../stores'
import { Badge } from '../common'
import type { EnhancedProduct } from '../../services/api'

/**
 * ProductGridView component props
 */
export interface ProductGridViewProps {
  /** Array of products to display */
  products: EnhancedProduct[]
  /** Selected product ID */
  selectedProductId?: number
  /** Product click handler */
  onProductClick: (product: EnhancedProduct) => void
}

/**
 * ProductGridView component - Displays products in a compact table/grid format
 * 
 * Features:
 * - Compact table layout with columns for image, name, SKU, price, stock, and actions
 * - Touch-safe row selection (minimum 44px height)
 * - Responsive design
 * - Theme-aware styling
 * - Stock status indicators
 * - Product type badges
 * 
 * @example
 * ```tsx
 * <ProductGridView
 *   products={products}
 *   selectedProductId={selectedProduct?.id}
 *   onProductClick={handleProductClick}
 * />
 * ```
 */
export function ProductGridView({
  products,
  selectedProductId,
  onProductClick
}: ProductGridViewProps) {
  const { theme } = useAppStore()

  const getProductTypeColor = (type: string) => {
    switch (type) {
      case 'simple':
        return 'blue'
      case 'variation':
        return 'purple'
      case 'bundle':
        return 'green'
      case 'service':
        return 'orange'
      default:
        return 'gray'
    }
  }

  const getStockStatus = (product: EnhancedProduct) => {
    if (product.product_type === 'service' || !product.track_inventory) {
      return { label: 'N/A', color: 'gray' as const }
    }

    if (product.stock_quantity <= 0) {
      return { label: 'Out of Stock', color: 'red' as const }
    }

    if (product.stock_quantity <= product.low_stock_threshold) {
      return { label: 'Low Stock', color: 'yellow' as const }
    }

    return { label: 'In Stock', color: 'green' as const }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        {/* Table Header */}
        <thead>
          <tr className={`
            border-b
            ${theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}
          `}>
            <th className={`
              px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider
              ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
            `}>
              Image
            </th>
            <th className={`
              px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider
              ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
            `}>
              Name
            </th>
            <th className={`
              px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider
              ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
            `}>
              SKU
            </th>
            <th className={`
              px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider
              ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
            `}>
              Type
            </th>
            <th className={`
              px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider
              ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
            `}>
              Price
            </th>
            <th className={`
              px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider
              ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
            `}>
              Stock
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {products.map((product) => {
            const stockStatus = getStockStatus(product)
            const imageUrl = product.image_paths && product.image_paths.length > 0
              ? `http://localhost:8000/uploads/${product.image_paths[0]}`
              : null

            return (
              <tr
                key={product.id}
                onClick={() => onProductClick(product)}
                className={`
                  border-b cursor-pointer transition-colors min-h-[44px]
                  ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
                  ${selectedProductId === product.id
                    ? theme === 'dark'
                      ? 'bg-blue-900/30'
                      : 'bg-blue-50'
                    : theme === 'dark'
                      ? 'hover:bg-gray-700/50'
                      : 'hover:bg-gray-50'
                  }
                `}
              >
                {/* Image */}
                <td className="px-4 py-3">
                  <div className={`
                    w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center
                    ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}
                  `}>
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    )}
                  </div>
                </td>

                {/* Name */}
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className={`
                      text-sm font-medium
                      ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
                    `}>
                      {product.name}
                    </span>
                    {product.category_name && (
                      <span className={`
                        text-xs
                        ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                      `}>
                        {product.category_name}
                      </span>
                    )}
                  </div>
                </td>

                {/* SKU */}
                <td className="px-4 py-3">
                  <span className={`
                    text-sm
                    ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
                  `}>
                    {product.sku || '-'}
                  </span>
                </td>

                {/* Type */}
                <td className="px-4 py-3">
                  <Badge color={getProductTypeColor(product.product_type)} size="sm">
                    {product.product_type}
                  </Badge>
                </td>

                {/* Price */}
                <td className="px-4 py-3">
                  <span className={`
                    text-sm font-semibold
                    ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}
                  `}>
                    ${product.base_price.toFixed(2)}
                  </span>
                </td>

                {/* Stock */}
                <td className="px-4 py-3">
                  {product.track_inventory && product.product_type !== 'service' ? (
                    <div className="flex flex-col gap-1">
                      <Badge color={stockStatus.color} size="sm">
                        {stockStatus.label}
                      </Badge>
                      <span className={`
                        text-xs
                        ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                      `}>
                        Qty: {product.stock_quantity}
                      </span>
                    </div>
                  ) : (
                    <Badge color="gray" size="sm">
                      N/A
                    </Badge>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Empty State */}
      {products.length === 0 && (
        <div className={`
          text-center py-12 px-4
          ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
        `}>
          <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-sm font-medium mb-1">No products found</p>
          <p className="text-xs">Try adjusting your filters</p>
        </div>
      )}
    </div>
  )
}

