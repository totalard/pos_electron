import { useState, useRef } from 'react'
import { useAppStore, usePOSStore } from '../../stores'

/**
 * POSSearchBar component props
 */
export interface POSSearchBarProps {
  /** Search query value */
  value: string
  /** Search change handler */
  onChange: (query: string) => void
  /** Barcode scan handler */
  onBarcodeScan?: (barcode: string) => void
  /** View mode */
  viewMode: 'grid' | 'list'
  /** View mode change handler */
  onViewModeChange: (mode: 'grid' | 'list') => void
  /** Placeholder text */
  placeholder?: string
}

/**
 * POS Search Bar - Touch-friendly search with barcode support
 * 
 * Features:
 * - Large touch-friendly input (minimum 48px height)
 * - Real-time search
 * - Barcode scanner integration
 * - View mode toggle (grid/list)
 * - Clear button
 * - Keyboard shortcuts
 * 
 * @example
 * ```tsx
 * <POSSearchBar
 *   value={searchQuery}
 *   onChange={setSearchQuery}
 *   onBarcodeScan={handleBarcodeScan}
 *   viewMode={viewMode}
 *   onViewModeChange={setViewMode}
 * />
 * ```
 */
export function POSSearchBar({
  value,
  onChange,
  onBarcodeScan,
  viewMode,
  onViewModeChange,
  placeholder = 'Search products...'
}: POSSearchBarProps) {
  const { theme } = useAppStore()
  const { barcodeScannerEnabled, toggleBarcodeScanner } = usePOSStore()
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Note: Barcode scanning is now handled globally via useBarcodeScanner hook in SaleScreen

  const handleClear = () => {
    onChange('')
    inputRef.current?.focus()
  }

  return (
    <div className="flex items-center gap-2">
      {/* Search Input */}
      <div className="flex-1 relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg 
            className={`w-5 h-5 transition-all duration-200 ${
              isFocused 
                ? 'scale-110 ' + (theme === 'dark' ? 'text-primary-400' : 'text-primary-600')
                : theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`
            w-full pl-12 pr-12 py-3 rounded-xl
            min-h-[48px] text-base
            transition-all duration-200
            ${theme === 'dark'
              ? 'bg-gray-800 text-white placeholder-gray-500 border-gray-700'
              : 'bg-white text-gray-900 placeholder-gray-400 border-gray-300'
            }
            ${isFocused
              ? theme === 'dark'
                ? 'border-2 border-primary-500 ring-4 ring-primary-500/20'
                : 'border-2 border-primary-500 ring-4 ring-primary-500/20'
              : 'border'
            }
            focus:outline-none
          `}
        />

        {/* Clear Button */}
        {value && (
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
            <button
              onClick={handleClear}
              className={`
                p-2 rounded-lg transition-all duration-200 ease-out
                transform hover:scale-110 active:scale-90
                ${theme === 'dark'
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                }
              `}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Barcode Scanner Toggle Button */}
      {onBarcodeScan && (
        <button
          onClick={toggleBarcodeScanner}
          className={`
            px-4 py-3 rounded-xl min-h-[48px] transition-all duration-200 ease-out
            flex items-center gap-2 font-medium
            transform hover:scale-105 active:scale-95
            ${barcodeScannerEnabled
              ? theme === 'dark'
                ? 'bg-green-600 hover:bg-green-700 text-white border-2 border-green-500 shadow-lg shadow-green-500/30'
                : 'bg-green-500 hover:bg-green-600 text-white border-2 border-green-400 shadow-lg shadow-green-400/30'
              : theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-2 border-gray-600'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700 border-2 border-gray-300'
            }
          `}
          title={barcodeScannerEnabled ? 'Barcode scanner enabled' : 'Barcode scanner disabled'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          <span className="text-sm">
            {barcodeScannerEnabled ? 'Scanner ON' : 'Scanner OFF'}
          </span>
        </button>
      )}

      {/* View Mode Toggle */}
      <div className={`
        flex items-center rounded-xl border overflow-hidden
        ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'}
      `}>
        <button
          onClick={() => onViewModeChange('grid')}
          className={`
            px-4 py-3 min-h-[48px] transition-all duration-200 ease-out
            transform active:scale-90
            ${viewMode === 'grid'
              ? theme === 'dark'
                ? 'bg-primary-600 text-white'
                : 'bg-primary-500 text-white'
              : theme === 'dark'
                ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }
          `}
          title="Grid view"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </button>
        <button
          onClick={() => onViewModeChange('list')}
          className={`
            px-4 py-3 min-h-[48px] transition-all duration-200 ease-out border-l
            transform active:scale-90
            ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}
            ${viewMode === 'list'
              ? theme === 'dark'
                ? 'bg-primary-600 text-white'
                : 'bg-primary-500 text-white'
              : theme === 'dark'
                ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }
          `}
          title="List view"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}
