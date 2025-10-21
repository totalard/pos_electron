import { useState } from 'react'
import { useAppStore } from '../../stores'
import { RightPanel } from '../common'

/**
 * DatePicker component props
 */
export interface DatePickerProps {
  /** Label text */
  label?: string
  /** Current selected date */
  value: Date | null
  /** Change handler */
  onChange: (date: Date | null) => void
  /** Minimum selectable date */
  minDate?: Date
  /** Maximum selectable date */
  maxDate?: Date
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
  /** Allow clearing date */
  clearable?: boolean
  /** Date format for display */
  dateFormat?: 'short' | 'medium' | 'long'
}

/**
 * Touch-friendly DatePicker component with calendar sidebar.
 * 
 * Features:
 * - Touch-optimized calendar interface
 * - Month/year navigation
 * - Min/max date constraints
 * - Multiple date formats
 * - Clearable selection
 * 
 * @example
 * ```tsx
 * <DatePicker
 *   label="Birth Date"
 *   value={birthDate}
 *   onChange={setBirthDate}
 *   maxDate={new Date()}
 *   clearable
 * />
 * ```
 */
export function DatePicker({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  error,
  helperText,
  fullWidth = true,
  disabled = false,
  required = false,
  clearable = false,
  dateFormat = 'medium'
}: DatePickerProps) {
  const { theme } = useAppStore()
  const [isOpen, setIsOpen] = useState(false)
  const [viewDate, setViewDate] = useState(value || new Date())

  const formatDate = (date: Date | null): string => {
    if (!date) return ''
    
    const formatOptions: Record<string, Intl.DateTimeFormatOptions> = {
      short: { year: 'numeric', month: 'numeric', day: 'numeric' },
      medium: { year: 'numeric', month: 'short', day: 'numeric' },
      long: { year: 'numeric', month: 'long', day: 'numeric' }
    }
    
    return date.toLocaleDateString(undefined, formatOptions[dateFormat])
  }

  const handleSelect = (date: Date) => {
    onChange(date)
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
  }

  const handleOpen = () => {
    if (!disabled) {
      setViewDate(value || new Date())
      setIsOpen(true)
    }
  }

  const isDateDisabled = (date: Date): boolean => {
    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true
    return false
  }

  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    
    const days: Date[] = []
    
    // Add empty slots for days before month starts
    const startDay = firstDay.getDay()
    for (let i = 0; i < startDay; i++) {
      days.push(new Date(year, month, -startDay + i + 1))
    }
    
    // Add all days in month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    
    // Add empty slots to complete the grid
    const remainingSlots = 42 - days.length
    for (let i = 1; i <= remainingSlots; i++) {
      days.push(new Date(year, month + 1, i))
    }
    
    return days
  }

  const previousMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
  }

  const previousYear = () => {
    setViewDate(new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1))
  }

  const nextYear = () => {
    setViewDate(new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1))
  }

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate()
  }

  const isToday = (date: Date): boolean => {
    return isSameDay(date, new Date())
  }

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === viewDate.getMonth()
  }

  const days = getDaysInMonth(viewDate)
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

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
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className={!value ? 'text-gray-500' : ''}>
              {value ? formatDate(value) : 'Select date'}
            </span>
          </div>
          
          {clearable && value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Clear date"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </button>
        
        {(error || helperText) && (
          <p className={helperClasses}>
            {error || helperText}
          </p>
        )}
      </div>

      {/* Calendar Panel */}
      <RightPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={label || 'Select Date'}
        width="md"
      >
        <div className="space-y-4">
          {/* Month/Year Navigation */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={previousYear}
              className={`
                p-2 rounded-lg min-w-[44px] min-h-[44px]
                ${theme === 'dark'
                  ? 'hover:bg-gray-700 text-white'
                  : 'hover:bg-gray-100 text-gray-900'
                }
              `}
              aria-label="Previous year"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              type="button"
              onClick={previousMonth}
              className={`
                p-2 rounded-lg min-w-[44px] min-h-[44px]
                ${theme === 'dark'
                  ? 'hover:bg-gray-700 text-white'
                  : 'hover:bg-gray-100 text-gray-900'
                }
              `}
              aria-label="Previous month"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className={`
              text-lg font-semibold flex-1 text-center
              ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
            `}>
              {viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </div>
            
            <button
              type="button"
              onClick={nextMonth}
              className={`
                p-2 rounded-lg min-w-[44px] min-h-[44px]
                ${theme === 'dark'
                  ? 'hover:bg-gray-700 text-white'
                  : 'hover:bg-gray-100 text-gray-900'
                }
              `}
              aria-label="Next month"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            <button
              type="button"
              onClick={nextYear}
              className={`
                p-2 rounded-lg min-w-[44px] min-h-[44px]
                ${theme === 'dark'
                  ? 'hover:bg-gray-700 text-white'
                  : 'hover:bg-gray-100 text-gray-900'
                }
              `}
              aria-label="Next year"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Calendar Grid */}
          <div>
            {/* Week days header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map(day => (
                <div
                  key={day}
                  className={`
                    text-center text-sm font-medium py-2
                    ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                  `}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, index) => {
                const isSelected = value && isSameDay(date, value)
                const isDisabled = isDateDisabled(date)
                const isCurrentMonthDay = isCurrentMonth(date)
                const isTodayDate = isToday(date)

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => !isDisabled && handleSelect(date)}
                    disabled={isDisabled}
                    className={`
                      min-h-[44px] rounded-lg text-center
                      transition-colors duration-200
                      ${isSelected
                        ? 'bg-primary-500 text-white font-bold'
                        : isTodayDate
                          ? theme === 'dark'
                            ? 'bg-gray-700 text-white font-semibold'
                            : 'bg-gray-200 text-gray-900 font-semibold'
                          : isCurrentMonthDay
                            ? theme === 'dark'
                              ? 'hover:bg-gray-700 text-white'
                              : 'hover:bg-gray-100 text-gray-900'
                            : theme === 'dark'
                              ? 'text-gray-600'
                              : 'text-gray-400'
                      }
                      ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {date.getDate()}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex gap-2 pt-4 border-t border-gray-700 dark:border-gray-600">
            <button
              type="button"
              onClick={() => handleSelect(new Date())}
              className={`
                flex-1 px-4 py-2 rounded-lg text-sm font-medium
                ${theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }
              `}
            >
              Today
            </button>
            {clearable && (
              <button
                type="button"
                onClick={() => {
                  onChange(null)
                  setIsOpen(false)
                }}
                className={`
                  flex-1 px-4 py-2 rounded-lg text-sm font-medium
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
      </RightPanel>
    </>
  )
}

DatePicker.displayName = 'DatePicker'
