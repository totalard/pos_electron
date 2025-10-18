import { useAppStore } from '../../stores'
import { Card, Badge, IconButton } from '../common'
import type { EnhancedProduct } from '../../services/api'

interface ProductCardProps {
  product: EnhancedProduct
  onEdit: (product: EnhancedProduct) => void
}

export function ProductCard({ product, onEdit }: ProductCardProps) {
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
  
  const getStockStatus = () => {
    if (product.product_type === 'service' || !product.track_inventory) {
      return { label: 'N/A', color: 'gray' }
    }
    
    if (product.stock_quantity <= 0) {
      return { label: 'Out of Stock', color: 'red' }
    }
    
    if (product.stock_quantity <= product.low_stock_threshold) {
      return { label: 'Low Stock', color: 'yellow' }
    }
    
    return { label: 'In Stock', color: 'green' }
  }
  
  const stockStatus = getStockStatus()
  
  // Get first image or placeholder
  const imageUrl = product.image_paths && product.image_paths.length > 0
    ? `http://localhost:8001/uploads/${product.image_paths[0]}`
    : null
  
  return (
    <Card
      className="group cursor-pointer hover:shadow-xl transition-all duration-200"
      onClick={() => onEdit(product)}
    >
      {/* Product Image */}
      <div className={`
        relative w-full h-48 rounded-t-xl overflow-hidden
        ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}
      `}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className={`w-20 h-20 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}
        
        {/* Product Type Badge */}
        <div className="absolute top-3 left-3">
          <Badge color={getProductTypeColor(product.product_type)} size="sm">
            {product.product_type}
          </Badge>
        </div>
        
        {/* Stock Status Badge */}
        <div className="absolute top-3 right-3">
          <Badge color={stockStatus.color} size="sm">
            {stockStatus.label}
          </Badge>
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-4">
        {/* Product Name */}
        <h3 className={`
          text-lg font-semibold mb-1 truncate
          ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
        `}>
          {product.name}
        </h3>
        
        {/* Category */}
        {product.category_name && (
          <p className={`
            text-sm mb-2
            ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
          `}>
            {product.category_name}
          </p>
        )}
        
        {/* SKU & Barcode */}
        <div className={`
          text-xs mb-3 space-y-1
          ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}
        `}>
          {product.sku && <div>SKU: {product.sku}</div>}
          {product.barcode && <div>Barcode: {product.barcode}</div>}
        </div>
        
        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className={`
            text-2xl font-bold
            ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}
          `}>
            ${product.base_price.toFixed(2)}
          </span>
          {product.cost_price && (
            <span className={`
              text-sm line-through
              ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}
            `}>
              ${product.cost_price.toFixed(2)}
            </span>
          )}
        </div>
        
        {/* Stock Quantity */}
        {product.track_inventory && product.product_type !== 'service' && (
          <div className={`
            flex items-center justify-between py-2 px-3 rounded-lg
            ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}
          `}>
            <span className={`
              text-sm font-medium
              ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
            `}>
              Stock
            </span>
            <span className={`
              text-sm font-bold
              ${product.stock_quantity <= product.low_stock_threshold
                ? 'text-red-500'
                : theme === 'dark' ? 'text-green-400' : 'text-green-600'
              }
            `}>
              {product.stock_quantity} units
            </span>
          </div>
        )}
        
        {/* Variations Count */}
        {product.product_type === 'variation' && product.variations && product.variations.length > 0 && (
          <div className={`
            mt-2 text-sm
            ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
          `}>
            {product.variations.length} variation{product.variations.length !== 1 ? 's' : ''}
          </div>
        )}
        
        {/* Bundle Components Count */}
        {product.product_type === 'bundle' && product.bundle_components && product.bundle_components.length > 0 && (
          <div className={`
            mt-2 text-sm
            ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
          `}>
            {product.bundle_components.length} component{product.bundle_components.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
      
      {/* Edit Button (visible on hover) */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <IconButton
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          }
          onClick={(e) => {
            e.stopPropagation()
            onEdit(product)
          }}
          variant="primary"
          size="md"
          label="Edit product"
        />
      </div>
    </Card>
  )
}

