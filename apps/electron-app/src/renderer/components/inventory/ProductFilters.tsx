import { useState } from 'react'
import { useAppStore } from '../../stores'

interface LocalProductFilters {
  search: string
  category_ids: number[]
  product_type: string
  is_active?: boolean
  is_featured?: boolean
  is_low_stock?: boolean
  min_price?: number
  max_price?: number
  hsn_code: string
}

interface ProductFiltersProps {
  filters: LocalProductFilters
  onFiltersChange: (filters: LocalProductFilters) => void
}

export function ProductFilters({ filters, onFiltersChange }: ProductFiltersProps) {
  const { theme } = useAppStore()
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleFilterChange = (key: keyof LocalProductFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      category_ids: [],
      product_type: '',
      hsn_code: ''
    })
  }

  const hasActiveFilters = filters.search || 
    filters.category_ids.length > 0 || 
    filters.product_type || 
    filters.is_active !== undefined ||
    filters.is_featured !== undefined ||
    filters.is_low_stock !== undefined ||
    filters.min_price !== undefined ||
    filters.max_price !== undefined ||
    filters.hsn_code

  return (
    <div className={`
      ${theme === 'dark'
        ? 'bg-gray-800/30 border border-gray-700'
        : 'bg-gray-50 border border-gray-200'
      }
      rounded-lg p-6 mb-6
    `}>
      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Search */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Search
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search products, SKU, barcode..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className={`
                w-full pl-10 pr-4 py-2 rounded-lg border
                ${theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-primary-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-primary-500'
                }
                focus:outline-none focus:ring-2 focus:ring-primary-500/20
              `}
            />
          </div>
        </div>

        {/* Product Type */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Product Type
          </label>
          <select
            value={filters.product_type}
            onChange={(e) => handleFilterChange('product_type', e.target.value)}
            className={`
              w-full px-3 py-2 rounded-lg border
              ${theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white focus:border-primary-500'
                : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
              }
              focus:outline-none focus:ring-2 focus:ring-primary-500/20
            `}
          >
            <option value="">All Types</option>
            <option value="simple">Simple</option>
            <option value="variable">Variable</option>
            <option value="bundle">Bundle</option>
            <option value="service">Service</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Status
          </label>
          <select
            value={filters.is_active === undefined ? '' : filters.is_active ? 'active' : 'inactive'}
            onChange={(e) => handleFilterChange('is_active', e.target.value === '' ? undefined : e.target.value === 'active')}
            className={`
              w-full px-3 py-2 rounded-lg border
              ${theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white focus:border-primary-500'
                : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
              }
              focus:outline-none focus:ring-2 focus:ring-primary-500/20
            `}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Stock Status */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Stock Status
          </label>
          <select
            value={filters.is_low_stock === undefined ? '' : filters.is_low_stock ? 'low' : 'normal'}
            onChange={(e) => handleFilterChange('is_low_stock', e.target.value === '' ? undefined : e.target.value === 'low')}
            className={`
              w-full px-3 py-2 rounded-lg border
              ${theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white focus:border-primary-500'
                : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
              }
              focus:outline-none focus:ring-2 focus:ring-primary-500/20
            `}
          >
            <option value="">All Stock</option>
            <option value="low">Low Stock</option>
            <option value="normal">Normal Stock</option>
          </select>
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`
            flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors
            ${theme === 'dark'
              ? 'text-gray-300 hover:text-white hover:bg-gray-700'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }
          `}
        >
          <svg className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          Advanced Filters
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className={`
              px-3 py-1 rounded-lg text-sm font-medium transition-colors
              ${theme === 'dark'
                ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20'
                : 'text-red-600 hover:text-red-700 hover:bg-red-50'
              }
            `}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* HSN Code */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              HSN Code
            </label>
            <input
              type="text"
              placeholder="Enter HSN code"
              value={filters.hsn_code}
              onChange={(e) => handleFilterChange('hsn_code', e.target.value)}
              className={`
                w-full px-3 py-2 rounded-lg border
                ${theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-primary-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-primary-500'
                }
                focus:outline-none focus:ring-2 focus:ring-primary-500/20
              `}
            />
          </div>

          {/* Min Price */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Min Price
            </label>
            <input
              type="number"
              placeholder="0.00"
              step="0.01"
              min="0"
              value={filters.min_price || ''}
              onChange={(e) => handleFilterChange('min_price', e.target.value ? parseFloat(e.target.value) : undefined)}
              className={`
                w-full px-3 py-2 rounded-lg border
                ${theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-primary-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-primary-500'
                }
                focus:outline-none focus:ring-2 focus:ring-primary-500/20
              `}
            />
          </div>

          {/* Max Price */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Max Price
            </label>
            <input
              type="number"
              placeholder="999.99"
              step="0.01"
              min="0"
              value={filters.max_price || ''}
              onChange={(e) => handleFilterChange('max_price', e.target.value ? parseFloat(e.target.value) : undefined)}
              className={`
                w-full px-3 py-2 rounded-lg border
                ${theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-primary-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-primary-500'
                }
                focus:outline-none focus:ring-2 focus:ring-primary-500/20
              `}
            />
          </div>

          {/* Featured */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Featured
            </label>
            <select
              value={filters.is_featured === undefined ? '' : filters.is_featured ? 'featured' : 'not-featured'}
              onChange={(e) => handleFilterChange('is_featured', e.target.value === '' ? undefined : e.target.value === 'featured')}
              className={`
                w-full px-3 py-2 rounded-lg border
                ${theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-primary-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
                }
                focus:outline-none focus:ring-2 focus:ring-primary-500/20
              `}
            >
              <option value="">All Products</option>
              <option value="featured">Featured Only</option>
              <option value="not-featured">Not Featured</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
