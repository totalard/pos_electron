import { useState } from 'react'
import { useAppStore } from '../../stores'
import { RightPanel } from '../common'

/**
 * DateRangePicker component props
 */
export interface DateRangePickerProps {
  /** Label text */
  label?: string
  /** Current selected start date */
  startDate: Date | null
  /** Current selected end date */
  endDate: Date | null
  /** Change handler for date range */
  onChange: (startDate: Date | null, endDate: Date | null) => void
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
  /** Allow clearing dates */
  clearable?: boolean
  /** Date format for display */
  dateFormat?: 'short' | 'medium' | 'long'
  /** Quick range presets */
  showPresets?: boolean
}

type RangeSelection = 'start' | 'end'

/**
 * Touch-friendly DateRangePicker component with calendar sidebar.
 * 
 * Features:
 * - Touch-optimized calendar interface
 * - Range selection (start and end dates)
 * - Quick range presets (Today, This Week, This Month, etc.)
 * - Month/year navigation
 * - Min/max date constraints
 * - Multiple date formats
 * - Clearable selection
 * 
 * @example
 * ```tsx
 * <DateRangePicker
 *   label="Date Range"
 *   startDate={startDate}
 *   endDate={endDate}
 *   onChange={(start, end) => {
 *     setStartDate(start)
 *     setEndDate(end)
 *   }}
 *   showPresets
 *   clearable
 * />
 * ```
 */
export function DateRangePicker({
  label,
  startDate,
  endDate,
  onChange,
  minDate,
  maxDate,
  error,
  helperText,
  fullWidth = true,
  disabled = false,
  required = false,
  clearable = true,
  dateFormat = 'medium',
  showPresets = true
}: DateRangePickerProps) {
  const { theme } = useAppStore()
  const [isOpen, setIsOpen] = useState(false)
  const [viewDate, setViewDate] = useState(startDate || new Date())
  const [selectingRange, setSelectingRange] = useState<RangeSelection>('start')
  const [tempStartDate, setTempStartDate] = useState<Date | null>(startDate)
  const [tempEndDate, setTempEndDate] = useState<Date | null>(endDate)

  const formatDate = (date: Date | null): string => {
    if (!date) return ''
    
    const formatOptions: Record<string, Intl.DateTimeFormatOptions> = {
      short: { year: 'numeric', month: 'numeric', day: 'numeric' },
      medium: { year: 'numeric', month: 'short', day: 'numeric' },
      long: { year: 'numeric', month: 'long', day: 'numeric' }
    }
    
    return date.toLocaleDateString(undefined, formatOptions[dateFormat])
  }

  const handleOpen = () => {
    if (!disabled) {
      setTempStartDate(startDate)
      setTempEndDate(endDate)
      setViewDate(startDate || new Date())
      setSelectingRange('start')
      setIsOpen(true)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleApply = () => {
    onChange(tempStartDate, tempEndDate)
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null, null)
  }

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return

    if (selectingRange === 'start') {
      setTempStartDate(date)
      setTempEndDate(null)
      setSelectingRange('end')
    } else {
      // If selecting end date and it's before start, swap them
      if (tempStartDate && date < tempStartDate) {
        setTempEndDate(tempStartDate)
        setTempStartDate(date)
      } else {
        setTempEndDate(date)
      }
    }
  }

  const handlePreset = (preset: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    let start: Date
    let end: Date = new Date(today)

    switch (preset) {
      case 'today':
        start = new Date(today)
        break
      case 'yesterday':
        start = new Date(today)
        start.setDate(start.getDate() - 1)
        end = new Date(start)
        break
      case 'last7days':
        start = new Date(today)
        start.setDate(start.getDate() - 6)
        break
      case 'last30days':
        start = new Date(today)
        start.setDate(start.getDate() - 29)
        break
      case 'thisWeek':
        start = new Date(today)
        start.setDate(start.getDate() - start.getDay())
        break
      case 'lastWeek':
        start = new Date(today)
        start.setDate(start.getDate() - start.getDay() - 7)
        end = new Date(start)
        end.setDate(end.getDate() + 6)
        break
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1)
        break
      case 'lastMonth':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        end = new Date(today.getFullYear(), today.getMonth(), 0)
        break
      case 'thisYear':
        start = new Date(today.getFullYear(), 0, 1)
        break
      default:
        return
    }

    setTempStartDate(start)
    setTempEndDate(end)
    setViewDate(start)
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

  const isInRange = (date: Date): boolean => {
    if (!tempStartDate || !tempEndDate) return false
    const dateTime = date.getTime()
    return dateTime >= tempStartDate.getTime() && dateTime <= tempEndDate.getTime()
  }

  const isRangeStart = (date: Date): boolean => {
    return tempStartDate ? isSameDay(date, tempStartDate) : false
  }

  const isRangeEnd = (date: Date): boolean => {
    return tempEndDate ? isSameDay(date, tempEndDate) : false
  }

  const days = getDaysInMonth(viewDate)
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const presets = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'last7days', label: 'Last 7 Days' },
    { id: 'last30days', label: 'Last 30 Days' },
    { id: 'thisWeek', label: 'This Week' },
    { id: 'lastWeek', label: 'Last Week' },
    { id: 'thisMonth', label: 'This Month' },
    { id: 'lastMonth', label: 'Last Month' },
    { id: 'thisYear', label: 'This Year' }
  ]

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

  const displayText = startDate && endDate
    ? `${formatDate(startDate)} - ${formatDate(endDate)}`
    : startDate
    ? `${formatDate(startDate)} - Select end date`
    : 'Select date range'

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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className={`truncate ${!startDate && !endDate ? 'text-gray-500' : ''}`}>
              {displayText}
            </span>
          </div>
          
          {clearable && (startDate || endDate) && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
              aria-label="Clear date range"
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
        onClose={handleClose}
        title={label || 'Select Date Range'}
        width="lg"
      >
        <div className="h-full flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Quick Presets */}
            {showPresets && (
              <div>
                <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Quick Select
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handlePreset(preset.id)}
                      className={`
                        px-3 py-2 rounded-lg text-sm font-medium
                        transition-colors duration-200
                        ${theme === 'dark'
                          ? 'bg-gray-700 hover:bg-gray-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                        }
                      `}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Range Selection Indicator */}
            <div className={`
              p-4 rounded-lg border
              ${theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}
            `}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-xs font-medium mb-1 block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Start Date
                  </label>
                  <div className={`
                    text-sm font-semibold
                    ${selectingRange === 'start'
                      ? theme === 'dark' ? 'text-primary-400' : 'text-primary-600'
                      : theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }
                  `}>
                    {tempStartDate ? formatDate(tempStartDate) : 'Not selected'}
                  </div>
                </div>
                <div>
                  <label className={`text-xs font-medium mb-1 block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    End Date
                  </label>
                  <div className={`
                    text-sm font-semibold
                    ${selectingRange === 'end'
                      ? theme === 'dark' ? 'text-primary-400' : 'text-primary-600'
                      : theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }
                  `}>
                    {tempEndDate ? formatDate(tempEndDate) : 'Not selected'}
                  </div>
                </div>
              </div>
            </div>

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
                  const isDisabled = isDateDisabled(date)
                  const isCurrentMonthDay = isCurrentMonth(date)
                  const isTodayDate = isToday(date)
                  const inRange = isInRange(date)
                  const isStart = isRangeStart(date)
                  const isEnd = isRangeEnd(date)

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => !isDisabled && handleDateClick(date)}
                      disabled={isDisabled}
                      className={`
                        min-h-[44px] rounded-lg text-center
                        transition-colors duration-200
                        ${isStart || isEnd
                          ? 'bg-primary-500 text-white font-bold'
                          : inRange
                            ? theme === 'dark'
                              ? 'bg-primary-500/20 text-white'
                              : 'bg-primary-100 text-gray-900'
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
          </div>

          {/* Footer Actions */}
          <div className={`
            border-t p-4 flex gap-2
            ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}
          `}>
            {clearable && (
              <button
                type="button"
                onClick={() => {
                  setTempStartDate(null)
                  setTempEndDate(null)
                  setSelectingRange('start')
                }}
                className={`
                  flex-1 px-4 py-2 rounded-lg text-sm font-medium
                  transition-colors duration-200
                  ${theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }
                `}
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              className={`
                flex-1 px-4 py-2 rounded-lg text-sm font-medium
                transition-colors duration-200
                ${theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }
              `}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={!tempStartDate || !tempEndDate}
              className={`
                flex-1 px-4 py-2 rounded-lg text-sm font-medium
                transition-colors duration-200
                ${theme === 'dark'
                  ? 'bg-primary-600 hover:bg-primary-700 text-white disabled:bg-gray-700 disabled:text-gray-500'
                  : 'bg-primary-500 hover:bg-primary-600 text-white disabled:bg-gray-200 disabled:text-gray-400'
                }
                disabled:cursor-not-allowed
              `}
            >
              Apply
            </button>
          </div>
        </div>
      </RightPanel>
    </>
  )
}

DateRangePicker.displayName = 'DateRangePicker'
