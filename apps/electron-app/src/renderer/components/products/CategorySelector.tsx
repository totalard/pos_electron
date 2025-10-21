import { useState } from 'react'
import { useAppStore } from '../../stores'
import { RightPanel, Badge } from '../common'
import { CategoryTree } from './CategoryTree'
import { getCategoryPath, buildCategoryTree } from '../../utils/categoryTree'
import type { ProductCategory } from '../../services/api'

/**
 * CategorySelector component props
 */
export interface CategorySelectorProps {
  /** Label text */
  label?: string
  /** Current selected category ID */
  value: number | null
  /** Available categories */
  categories: ProductCategory[]
  /** Change handler */
  onChange: (categoryId: number | null) => void
  /** Error message */
  error?: string
  /** Helper text */
  helperText?: string
  /** Full width */
  fullWidth?: boolean
  /** Disabled state */
  disabled?: boolean
  /** Required field */
  required?: boolean
  /** Allow clearing selection */
  clearable?: boolean
  /** Exclude specific category IDs (useful when editing to prevent circular references) */
  excludeIds?: number[]
}

/**
 * Touch-friendly category selector with hierarchical tree view.
 * 
 * Opens a right sidebar with a tree view for selecting categories.
 * Shows breadcrumb path of selected category.
 * 
 * @example
 * ```tsx
 * <CategorySelector
 *   label="Category"
 *   value={productCategory}
 *   categories={categories}
 *   onChange={setProductCategory}
 *   clearable
 * />
 * ```
 */
export function CategorySelector({
  label,
  value,
  categories,
  onChange,
  error,
  helperText,
  fullWidth = true,
  disabled = false,
  required = false,
  clearable = false,
  excludeIds = []
}: CategorySelectorProps) {
  const { theme } = useAppStore()
  const [isOpen, setIsOpen] = useState(false)

  // Filter out excluded categories
  const availableCategories = categories.filter(cat => !excludeIds.includes(cat.id))

  // Find selected category
  const selectedCategory = availableCategories.find(cat => cat.id === value)

  // Get breadcrumb path
  const categoryPath = value
    ? getCategoryPath(buildCategoryTree(availableCategories), value)
    : []

  const handleSelect = (category: ProductCategory) => {
    onChange(category.id)
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
  }

  const handleOpen = () => {
    if (!disabled) {
      setIsOpen(true)
    }
  }

  const buttonClasses = `
    px-4 py-3 rounded-lg text-base text-left
    min-h-[44px]
    transition-colors duration-200
    flex items-center justify-between gap-2
    ${theme === 'dark'
      ? 'bg-gray-800 border border-gray-600 text-white hover:border-gray-500'
      : 'bg-white border border-gray-300 text-gray-900 hover:border-gray-400'
    }
    ${error ? 'border-red-500 hover:border-red-500' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${fullWidth ? 'w-full' : ''}
  `

  const labelClasses = `
    block text-sm font-medium mb-2
    ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
    ${error ? 'text-red-500' : ''}
  `

  const helperClasses = `
    mt-1 text-xs
    ${error
      ? theme === 'dark' ? 'text-red-400' : 'text-red-600'
      : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
    }
  `

  return (
    <>
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className={labelClasses}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <button
          type="button"
          onClick={handleOpen}
          disabled={disabled}
          className={buttonClasses}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            
            {selectedCategory ? (
              <div className="flex-1 min-w-0">
                {/* Breadcrumb path */}
                {categoryPath.length > 1 ? (
                  <div className="flex items-center gap-1 flex-wrap">
                    {categoryPath.map((cat, index) => (
                      <div key={cat.id} className="flex items-center gap-1">
                        <span className={`
                          text-sm truncate
                          ${index === categoryPath.length - 1
                            ? 'font-medium'
                            : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }
                        `}>
                          {cat.name}
                        </span>
                        {index < categoryPath.length - 1 && (
                          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="truncate">{selectedCategory.name}</span>
                )}
              </div>
            ) : (
              <span className="text-gray-500">Select category</span>
            )}
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            {clearable && selectedCategory && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Clear selection"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
        
        {(error || helperText) && (
          <p className={helperClasses}>
            {error || helperText}
          </p>
        )}
      </div>

      {/* Category Selection Panel */}
      <RightPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={label || 'Select Category'}
        width="md"
      >
        <div className="space-y-4">
          {/* Current Selection */}
          {selectedCategory && (
            <div className={`
              p-4 rounded-lg border
              ${theme === 'dark'
                ? 'bg-primary-900/30 border-primary-500'
                : 'bg-primary-50 border-primary-500'
              }
            `}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className={`
                    text-sm font-medium mb-1
                    ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
                  `}>
                    Current Selection
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    {categoryPath.map((cat, index) => (
                      <div key={cat.id} className="flex items-center gap-1">
                        <Badge color="primary" size="sm">{cat.name}</Badge>
                        {index < categoryPath.length - 1 && (
                          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                {clearable && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange(null)
                      setIsOpen(false)
                    }}
                    className={`
                      px-3 py-1.5 text-sm rounded-lg
                      ${theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                      }
                    `}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Category Tree */}
          <CategoryTree
            categories={availableCategories}
            selectedId={value}
            onSelect={handleSelect}
            showActions={false}
            showSearch={true}
            emptyMessage="No categories available"
          />
        </div>
      </RightPanel>
    </>
  )
}

CategorySelector.displayName = 'CategorySelector'
