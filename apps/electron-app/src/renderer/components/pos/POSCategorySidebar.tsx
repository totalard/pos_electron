import { useAppStore } from '../../stores'
import type { ProductCategory } from '../../services/api'

/**
 * POSCategorySidebar component props
 */
export interface POSCategorySidebarProps {
  /** Array of categories */
  categories: ProductCategory[]
  /** Selected category ID */
  selectedCategoryId: number | null
  /** Category selection handler */
  onCategorySelect: (categoryId: number | null) => void
  /** Loading state */
  isLoading?: boolean
}

/**
 * POS Category Sidebar - Touch-friendly category navigation
 * 
 * Features:
 * - Large touch targets (minimum 56px height)
 * - Category icons and colors
 * - "All Products" option
 * - Active state indication
 * - Scrollable list
 * 
 * @example
 * ```tsx
 * <POSCategorySidebar
 *   categories={categories}
 *   selectedCategoryId={selectedId}
 *   onCategorySelect={handleCategorySelect}
 * />
 * ```
 */
export function POSCategorySidebar({
  categories,
  selectedCategoryId,
  onCategorySelect,
  isLoading = false
}: POSCategorySidebarProps) {
  const { theme } = useAppStore()

  // Get category icon based on name (simple mapping)
  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase()
    
    if (name.includes('food') || name.includes('meal') || name.includes('dish')) {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
    
    if (name.includes('drink') || name.includes('beverage') || name.includes('coffee')) {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )
    }
    
    if (name.includes('dessert') || name.includes('sweet') || name.includes('cake')) {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      )
    }
    
    if (name.includes('electronic') || name.includes('tech') || name.includes('gadget')) {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    }
    
    if (name.includes('cloth') || name.includes('apparel') || name.includes('fashion')) {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      )
    }
    
    // Default icon
    return (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`
        px-4 py-4 border-b
        ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
      `}>
        <h2 className={`
          text-sm font-semibold uppercase tracking-wider
          ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
        `}>
          Categories
        </h2>
      </div>

      {/* Category List */}
      <div className="flex-1 overflow-y-auto">
        {/* All Products */}
        <button
          onClick={() => onCategorySelect(null)}
          className={`
            w-full flex items-center gap-3 px-4 py-4 border-b
            min-h-[56px] transition-colors
            ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
            ${selectedCategoryId === null
              ? theme === 'dark'
                ? 'bg-primary-900/30 border-l-4 border-l-primary-500'
                : 'bg-primary-50 border-l-4 border-l-primary-500'
              : theme === 'dark'
                ? 'hover:bg-gray-750 active:bg-gray-700'
                : 'hover:bg-gray-50 active:bg-gray-100'
            }
          `}
        >
          <div className={`
            flex-shrink-0
            ${selectedCategoryId === null
              ? theme === 'dark' ? 'text-primary-400' : 'text-primary-600'
              : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }
          `}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <span className={`
            text-sm font-semibold text-left
            ${selectedCategoryId === null
              ? theme === 'dark' ? 'text-white' : 'text-gray-900'
              : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }
          `}>
            All Products
          </span>
        </button>

        {/* Categories */}
        {categories
          .filter(cat => cat.is_active)
          .map((category) => {
            const isSelected = selectedCategoryId === category.id
            
            return (
              <button
                key={category.id}
                onClick={() => onCategorySelect(category.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-4 border-b
                  min-h-[56px] transition-colors
                  ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
                  ${isSelected
                    ? theme === 'dark'
                      ? 'bg-primary-900/30 border-l-4 border-l-primary-500'
                      : 'bg-primary-50 border-l-4 border-l-primary-500'
                    : theme === 'dark'
                      ? 'hover:bg-gray-750 active:bg-gray-700'
                      : 'hover:bg-gray-50 active:bg-gray-100'
                  }
                `}
              >
                {/* Category Icon */}
                <div className={`
                  flex-shrink-0
                  ${isSelected
                    ? theme === 'dark' ? 'text-primary-400' : 'text-primary-600'
                    : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }
                `}>
                  {getCategoryIcon(category.name)}
                </div>

                {/* Category Name */}
                <div className="flex-1 text-left min-w-0">
                  <span className={`
                    text-sm font-semibold truncate block
                    ${isSelected
                      ? theme === 'dark' ? 'text-white' : 'text-gray-900'
                      : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }
                  `}>
                    {category.name}
                  </span>
                  {category.description && (
                    <span className={`
                      text-xs truncate block
                      ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}
                    `}>
                      {category.description}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
      </div>

      {/* Empty State */}
      {categories.length === 0 && (
        <div className={`
          flex-1 flex items-center justify-center p-4 text-center
          ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}
        `}>
          <div>
            <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <p className="text-xs">No categories</p>
          </div>
        </div>
      )}
    </div>
  )
}
