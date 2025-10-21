import { useState, ReactNode } from 'react'
import { useAppStore } from '../../stores'
import { Sidebar } from '../common'

/**
 * Option type for TouchSelect
 */
export interface TouchSelectOption<T = string | number> {
  value: T
  label: string
  description?: string
  icon?: ReactNode
  disabled?: boolean
}

/**
 * TouchSelect component props
 */
export interface TouchSelectProps<T = string | number> {
  /** Label text */
  label?: string
  /** Current selected value */
  value: T | null
  /** Options array */
  options: TouchSelectOption<T>[]
  /** Change handler */
  onChange: (value: T | null) => void
  /** Placeholder text */
  placeholder?: string
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
  /** Search/filter options */
  searchable?: boolean
  /** Custom empty state message */
  emptyMessage?: string
}

/**
 * Touch-friendly Select component that opens a right sidebar for selection.
 * 
 * Replaces traditional dropdown with a touch-optimized sidebar interface.
 * Supports search, icons, descriptions, and clear functionality.
 * 
 * @example
 * ```tsx
 * <TouchSelect
 *   label="Category"
 *   value={selectedCategory}
 *   options={categories.map(cat => ({
 *     value: cat.id,
 *     label: cat.name,
 *     description: cat.description
 *   }))}
 *   onChange={setSelectedCategory}
 *   searchable
 *   clearable
 * />
 * ```
 */
export function TouchSelect<T = string | number>({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select an option',
  error,
  helperText,
  fullWidth = true,
  disabled = false,
  required = false,
  clearable = false,
  searchable = false,
  emptyMessage = 'No options available'
}: TouchSelectProps<T>) {
  const { theme } = useAppStore()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Find selected option
  const selectedOption = options.find(opt => opt.value === value)

  // Filter options based on search
  const filteredOptions = searchable && searchQuery
    ? options.filter(opt =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opt.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options

  const handleSelect = (optionValue: T) => {
    onChange(optionValue)
    setIsOpen(false)
    setSearchQuery('')
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

  const handleClose = () => {
    setIsOpen(false)
    setSearchQuery('')
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
            {selectedOption?.icon && (
              <span className="flex-shrink-0">{selectedOption.icon}</span>
            )}
            <span className={`truncate ${!selectedOption ? 'text-gray-500' : ''}`}>
              {selectedOption?.label || placeholder}
            </span>
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            {clearable && selectedOption && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className={`
                  p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700
                  transition-colors
                `}
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

      {/* Selection Panel */}
      <Sidebar
        isOpen={isOpen}
        onClose={handleClose}
        title={label || 'Select Option'}
        width="md"
        contentVariant="list"
      >
        {/* Search */}
        {searchable && (
          <div className="sticky top-0 z-10 px-4 pb-4 pt-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className={`
                w-full px-4 py-3 rounded-lg text-base
                min-h-[44px]
                ${theme === 'dark'
                  ? 'bg-gray-700 border border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500'
                }
                focus:outline-none focus:ring-2 focus:ring-primary-500/20
              `}
              autoFocus
            />
          </div>
        )}

        {/* Options List */}
        {filteredOptions.length === 0 ? (
          <div className={`
            text-center py-8 px-4
            ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
          `}>
            {emptyMessage}
          </div>
        ) : (
          <div className="space-y-2 px-4">
            {filteredOptions.map((option) => {
              const isSelected = option.value === value
              const isDisabled = option.disabled

              return (
                <button
                  key={String(option.value)}
                  type="button"
                  onClick={() => !isDisabled && handleSelect(option.value)}
                  disabled={isDisabled}
                  className={`
                    w-full px-4 py-3 rounded-lg text-left
                    min-h-[44px]
                    transition-colors duration-200
                    flex items-start gap-3
                    ${isSelected
                      ? theme === 'dark'
                        ? 'bg-primary-600 text-white'
                        : 'bg-primary-500 text-white'
                      : theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                    }
                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {option.icon && (
                    <span className="flex-shrink-0 mt-0.5">{option.icon}</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{option.label}</div>
                    {option.description && (
                      <div className={`
                        text-sm mt-1
                        ${isSelected
                          ? 'text-white/80'
                          : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }
                      `}>
                        {option.description}
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </Sidebar>
    </>
  )
}

TouchSelect.displayName = 'TouchSelect'
