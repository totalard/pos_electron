import { useAppStore } from '../../stores'
import { Button, Badge } from '../common'
import type { EnhancedProduct } from '../../services/api'

interface ProductDetailViewProps {
  product: EnhancedProduct
  onEdit: () => void
  onClose: () => void
}

export function ProductDetailView({ product, onEdit, onClose }: ProductDetailViewProps) {
  const { theme } = useAppStore()
  
  const getProductTypeColor = (type: string) => {
    switch (type) {
      case 'simple': return 'blue'
      case 'variation': return 'purple'
      case 'bundle': return 'green'
      case 'service': return 'orange'
      default: return 'gray'
    }
  }
  
  const getStockStatus = () => {
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
  
  const stockStatus = getStockStatus()
  
  // Get first image or placeholder
  const imageUrl = product.image_paths && product.image_paths.length > 0
    ? `http://localhost:8001/uploads/${product.image_paths[0]}`
    : null

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className={`
        p-4 border-b flex items-center justify-between
        ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
      `}>
        <h2 className={`
          text-lg font-semibold
          ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
        `}>
          Product Details
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={onEdit}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            }
          >
            Edit
          </Button>
          <button
            onClick={onClose}
            className={`
              p-2 rounded-lg transition-colors
              ${theme === 'dark'
                ? 'hover:bg-gray-700 text-gray-400'
                : 'hover:bg-gray-100 text-gray-600'
              }
            `}
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Product Image */}
        <div className={`
          relative w-full h-64 rounded-xl overflow-hidden mb-6
          ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}
        `}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className={`w-24 h-24 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge color={getProductTypeColor(product.product_type)}>
              {product.product_type}
            </Badge>
            <Badge color={stockStatus.color}>
              {stockStatus.label}
            </Badge>
          </div>
        </div>
        
        {/* Product Name */}
        <h1 className={`
          text-2xl font-bold mb-2
          ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
        `}>
          {product.name}
        </h1>
        
        {/* Category */}
        {product.category_name && (
          <p className={`
            text-sm mb-4
            ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
          `}>
            {product.category_name}
          </p>
        )}
        
        {/* Description */}
        {product.description && (
          <p className={`
            text-sm mb-6
            ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
          `}>
            {product.description}
          </p>
        )}
        
        {/* Price */}
        <div className="mb-6">
          <div className={`
            text-3xl font-bold
            ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}
          `}>
            ${product.base_price.toFixed(2)}
          </div>
          {product.cost_price && product.cost_price > 0 && (
            <div className={`
              text-sm mt-1
              ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
            `}>
              Cost: ${product.cost_price.toFixed(2)}
            </div>
          )}
        </div>
        
        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* SKU */}
          {product.sku && (
            <div>
              <div className={`
                text-xs font-medium mb-1
                ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
              `}>
                SKU
              </div>
              <div className={`
                text-sm font-mono
                ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
              `}>
                {product.sku}
              </div>
            </div>
          )}
          
          {/* Barcode */}
          {product.barcode && (
            <div>
              <div className={`
                text-xs font-medium mb-1
                ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
              `}>
                Barcode
              </div>
              <div className={`
                text-sm font-mono
                ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
              `}>
                {product.barcode}
              </div>
            </div>
          )}
          
          {/* Stock Quantity */}
          {product.track_inventory && (
            <div>
              <div className={`
                text-xs font-medium mb-1
                ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
              `}>
                Stock Quantity
              </div>
              <div className={`
                text-sm font-semibold
                ${product.stock_quantity <= 0
                  ? 'text-red-500'
                  : product.stock_quantity <= product.low_stock_threshold
                    ? 'text-yellow-500'
                    : theme === 'dark' ? 'text-green-400' : 'text-green-600'
                }
              `}>
                {product.stock_quantity} units
              </div>
            </div>
          )}
          
          {/* Low Stock Threshold */}
          {product.track_inventory && (
            <div>
              <div className={`
                text-xs font-medium mb-1
                ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
              `}>
                Low Stock Alert
              </div>
              <div className={`
                text-sm
                ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
              `}>
                {product.low_stock_threshold} units
              </div>
            </div>
          )}
          
          {/* Tax */}
          {product.tax_name && (
            <div>
              <div className={`
                text-xs font-medium mb-1
                ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
              `}>
                Tax
              </div>
              <div className={`
                text-sm
                ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
              `}>
                {product.tax_name}
              </div>
            </div>
          )}
          
          {/* Status */}
          <div>
            <div className={`
              text-xs font-medium mb-1
              ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
            `}>
              Status
            </div>
            <Badge color={product.is_active ? 'green' : 'red'}>
              {product.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
        
        {/* Notes */}
        {product.notes && (
          <div>
            <div className={`
              text-xs font-medium mb-2
              ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
            `}>
              Notes
            </div>
            <div className={`
              p-3 rounded-lg text-sm
              ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}
            `}>
              {product.notes}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

