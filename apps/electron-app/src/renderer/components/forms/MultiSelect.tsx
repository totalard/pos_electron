import { useState, ReactNode } from 'react'
import { useAppStore } from '../../stores'
import { RightPanel, Badge } from '../common'

/**
 * Option type for MultiSelect
 */
export interface MultiSelectOption<T = string | number> {
  value: T
  label: string
  description?: string
  icon?: ReactNode
  disabled?: boolean
}

/**
 * MultiSelect component props
 */
export interface MultiSelectProps<T = string | number> {
  /** Label text */
  label?: string
  /** Current selected values */
  value: T[]
  /** Options array */
  options: MultiSelectOption<T>[]
  /** Change handler */
  onChange: (values: T[]) => void
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
  /** Search/filter options */
  searchable?: boolean
  /** Maximum selections allowed (0 = unlimited) */
  maxSelections?: number
  /** Show count badge */
  showCount?: boolean
  /** Custom empty state message */
  emptyMessage?: string
}

/**
 * Touch-friendly Multi-Select component with sidebar interface.
 * 
 * Allows selecting multiple options with checkboxes in a right sidebar.
 * Supports search, icons, descriptions, and selection limits.
 * 
 * @example
 * ```tsx
 * <MultiSelect
 *   label="Tags"
 *   value={selectedTags}
 *   options={tags.map(tag => ({
 *     value: tag.id,
 *     label: tag.name
 *   }))}
 *   onChange={setSelectedTags}
 *   searchable
 *   showCount
 * />
 * ```
 */
export function MultiSelect<T = string | number>({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select options',
  error,
  helperText,
  fullWidth = true,
  disabled = false,
  required = false,
  searchable = false,
  maxSelections = 0,
  showCount = true,
  emptyMessage = 'No options available'
}: MultiSelectProps<T>) {
  const { theme } = useAppStore()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Get selected options
  const selectedOptions = options.filter(opt => value.includes(opt.value))

  // Filter options based on search
  const filteredOptions = searchable && searchQuery
    ? options.filter(opt =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opt.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options

  const handleToggle = (optionValue: T) => {
    const isSelected = value.includes(optionValue)
    
    if (isSelected) {
      // Remove from selection
      onChange(value.filter(v => v !== optionValue))
    } else {
      // Add to selection (check max limit)
      if (maxSelections === 0 || value.length < maxSelections) {
        onChange([...value, optionValue])
      }
    }
  }

  const handleSelectAll = () => {
    const selectableOptions = filteredOptions.filter(opt => !opt.disabled)
    const allValues = selectableOptions.map(opt => opt.value)
    
    if (maxSelections > 0) {
      onChange(allValues.slice(0, maxSelections))
    } else {
      onChange(allValues)
    }
  }

  const handleClearAll = () => {
    onChange([])
  }

  const handleRemoveOption = (optionValue: T, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(value.filter(v => v !== optionValue))
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

  const isMaxReached = maxSelections > 0 && value.length >= maxSelections

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
            {selectedOptions.length === 0 ? (
              <span className="text-gray-500">{placeholder}</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {selectedOptions.slice(0, 3).map((option) => (
                  <Badge
                    key={String(option.value)}
                    color="primary"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    {option.label}
                    <button
                      type="button"
                      onClick={(e) => handleRemoveOption(option.value, e)}
                      className="hover:bg-primary-700 rounded-full p-0.5"
                      aria-label={`Remove ${option.label}`}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </Badge>
                ))}
                {selectedOptions.length > 3 && (
                  <Badge color="gray" size="sm">
                    +{selectedOptions.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {showCount && selectedOptions.length > 0 && (
              <Badge color="primary" size="sm">
                {selectedOptions.length}
              </Badge>
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
      <RightPanel
        isOpen={isOpen}
        onClose={handleClose}
        title={label || 'Select Options'}
        width="md"
      >
        <div className="space-y-4">
          {/* Header Actions */}
          <div className="flex items-center justify-between gap-2 pb-4 border-b border-gray-700 dark:border-gray-600">
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {value.length} selected
              {maxSelections > 0 && ` of ${maxSelections} max`}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                disabled={isMaxReached}
                className={`
                  px-3 py-1.5 text-sm rounded-lg
                  ${theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors
                `}
              >
                Select All
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                disabled={value.length === 0}
                className={`
                  px-3 py-1.5 text-sm rounded-lg
                  ${theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors
                `}
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Search */}
          {searchable && (
            <div className="sticky top-0 z-10">
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
              text-center py-8
              ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
            `}>
              {emptyMessage}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredOptions.map((option) => {
                const isSelected = value.includes(option.value)
                const isDisabled = option.disabled || (!isSelected && isMaxReached)

                return (
                  <button
                    key={String(option.value)}
                    type="button"
                    onClick={() => !isDisabled && handleToggle(option.value)}
                    disabled={isDisabled}
                    className={`
                      w-full px-4 py-3 rounded-lg text-left
                      min-h-[44px]
                      transition-colors duration-200
                      flex items-start gap-3
                      ${theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                      }
                      ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {/* Checkbox */}
                    <div className="flex-shrink-0 mt-0.5">
                      <div className={`
                        w-5 h-5 rounded border-2 flex items-center justify-center
                        ${isSelected
                          ? 'bg-primary-500 border-primary-500'
                          : theme === 'dark'
                            ? 'border-gray-500'
                            : 'border-gray-400'
                        }
                      `}>
                        {isSelected && (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {option.icon && (
                      <span className="flex-shrink-0 mt-0.5">{option.icon}</span>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{option.label}</div>
                      {option.description && (
                        <div className={`
                          text-sm mt-1
                          ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                        `}>
                          {option.description}
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </RightPanel>
    </>
  )
}

MultiSelect.displayName = 'MultiSelect'
