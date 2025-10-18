import { useAppStore } from '../../stores'
import { ProductCard } from './ProductCard'
import { Grid } from '../layout'
import type { EnhancedProduct } from '../../services/api'

/**
 * ProductTileView component props
 */
export interface ProductTileViewProps {
  /** Array of products to display */
  products: EnhancedProduct[]
  /** Product click handler */
  onProductClick: (product: EnhancedProduct) => void
}

/**
 * ProductTileView component - Displays products as cards/tiles
 * 
 * Features:
 * - Grid layout with responsive columns
 * - Large product images
 * - Product name, price, and stock information
 * - Touch-safe cards (minimum 44x44px touch targets)
 * - Theme-aware styling
 * 
 * @example
 * ```tsx
 * <ProductTileView
 *   products={products}
 *   onProductClick={handleProductClick}
 * />
 * ```
 */
export function ProductTileView({
  products,
  onProductClick
}: ProductTileViewProps) {
  const { theme } = useAppStore()

  return (
    <>
      {products.length > 0 ? (
        <Grid cols={1} gap="lg" responsive={{ md: 2, lg: 3, xl: 4 }}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={onProductClick}
            />
          ))}
        </Grid>
      ) : (
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
    </>
  )
}

