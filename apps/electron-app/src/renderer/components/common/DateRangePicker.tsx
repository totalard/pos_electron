import { useState } from 'react'
import { useAppStore } from '../../stores'

export interface DateRange {
  startDate: Date | null
  endDate: Date | null
  preset?: string
}

interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
  presets?: Array<{ label: string; days: number }>
}

const defaultPresets = [
  { label: 'Today', days: 0 },
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 90 Days', days: 90 },
  { label: 'This Month', days: -1 },
  { label: 'Last Month', days: -2 }
]

export function DateRangePicker({ value, onChange, presets = defaultPresets }: DateRangePickerProps) {
  const { theme } = useAppStore()
  const [showCustom, setShowCustom] = useState(false)

  const handlePresetClick = (preset: { label: string; days: number }) => {
    let endDate = new Date()
    let startDate: Date

    if (preset.days === 0) {
      // Today
      startDate = new Date()
      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(23, 59, 59, 999)
    } else if (preset.days === -1) {
      // This month
      startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1)
      endDate.setHours(23, 59, 59, 999)
    } else if (preset.days === -2) {
      // Last month
      startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1)
      endDate = new Date(endDate.getFullYear(), endDate.getMonth(), 0)
      endDate.setHours(23, 59, 59, 999)
    } else {
      // Days ago
      startDate = new Date()
      startDate.setDate(startDate.getDate() - preset.days)
      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(23, 59, 59, 999)
    }

    onChange({ startDate, endDate, preset: preset.label })
    setShowCustom(false)
  }

  const handleCustomDateChange = (type: 'start' | 'end', dateStr: string) => {
    const date = new Date(dateStr)
    if (type === 'start') {
      date.setHours(0, 0, 0, 0)
      onChange({ ...value, startDate: date, preset: 'Custom' })
    } else {
      date.setHours(23, 59, 59, 999)
      onChange({ ...value, endDate: date, preset: 'Custom' })
    }
  }

  const formatDate = (date: Date | null) => {
    if (!date) return ''
    return date.toISOString().split('T')[0]
  }

  return (
    <div className={`
      rounded-lg p-4 border
      ${theme === 'dark' 
        ? 'bg-gray-800/50 border-gray-700' 
        : 'bg-white border-gray-200'
      }
    `}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`
          text-sm font-semibold
          ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}
        `}>
          Date Range
        </h3>
        <button
          onClick={() => setShowCustom(!showCustom)}
          className={`
            text-xs px-3 py-1 rounded-md transition-colors
            ${theme === 'dark'
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }
          `}
        >
          {showCustom ? 'Presets' : 'Custom'}
        </button>
      </div>

      {!showCustom ? (
        <div className="grid grid-cols-2 gap-2">
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handlePresetClick(preset)}
              className={`
                px-3 py-2 rounded-md text-sm font-medium transition-all
                ${value.preset === preset.label
                  ? theme === 'dark'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-500 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }
              `}
            >
              {preset.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className={`
              block text-xs font-medium mb-1
              ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
            `}>
              Start Date
            </label>
            <input
              type="date"
              value={formatDate(value.startDate)}
              onChange={(e) => handleCustomDateChange('start', e.target.value)}
              className={`
                w-full px-3 py-2 rounded-md text-sm border
                ${theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-gray-200'
                  : 'bg-white border-gray-300 text-gray-900'
                }
              `}
            />
          </div>
          <div>
            <label className={`
              block text-xs font-medium mb-1
              ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
            `}>
              End Date
            </label>
            <input
              type="date"
              value={formatDate(value.endDate)}
              onChange={(e) => handleCustomDateChange('end', e.target.value)}
              className={`
                w-full px-3 py-2 rounded-md text-sm border
                ${theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-gray-200'
                  : 'bg-white border-gray-300 text-gray-900'
                }
              `}
            />
          </div>
        </div>
      )}

      {value.startDate && value.endDate && (
        <div className={`
          mt-3 pt-3 border-t text-xs
          ${theme === 'dark' 
            ? 'border-gray-700 text-gray-400' 
            : 'border-gray-200 text-gray-600'
          }
        `}>
          {value.startDate.toLocaleDateString()} - {value.endDate.toLocaleDateString()}
        </div>
      )}
    </div>
  )
}
