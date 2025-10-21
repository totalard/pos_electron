import { ReactNode, useRef, useState, useEffect } from 'react'
import { useAppStore, useSettingsStore } from '../../stores'

/**
 * POSFooter component props
 */
export interface POSFooterProps {
  /** Subtotal amount */
  subtotal?: number
  /** Tax amount */
  tax?: number
  /** Total amount */
  total?: number
  /** Number of items in cart */
  itemCount?: number
  /** Quick action buttons */
  actions?: ReactNode
}

/**
 * Professional POS Footer component with transaction summary and quick actions
 * 
 * @example
 * ```tsx
 * <POSFooter
 *   subtotal={100.00}
 *   tax={8.00}
 *   total={108.00}
 *   itemCount={5}
 *   actions={<>...action buttons...</>}
 * />
 * ```
 */
export function POSFooter({
  subtotal = 0,
  tax = 0,
  total = 0,
  itemCount = 0,
  actions
}: POSFooterProps) {
  const { theme } = useAppStore()
  const { business } = useSettingsStore()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftScroll, setShowLeftScroll] = useState(false)
  const [showRightScroll, setShowRightScroll] = useState(false)

  // Check scroll position to show/hide indicators
  const checkScroll = () => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container
    setShowLeftScroll(scrollLeft > 0)
    setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 1)
  }

  useEffect(() => {
    checkScroll()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScroll)
      window.addEventListener('resize', checkScroll)
      return () => {
        container.removeEventListener('scroll', checkScroll)
        window.removeEventListener('resize', checkScroll)
      }
    }
  }, [actions])

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current
    if (!container) return
    const scrollAmount = 300
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    })
  }

  // Format currency based on settings
  const formatCurrency = (amount: number): string => {
    const { currencyConfig } = business
    const formatted = amount.toFixed(currencyConfig.decimalPlaces)
    const parts = formatted.split('.')
    
    // Add thousand separator
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, currencyConfig.thousandSeparator)
    
    const value = parts.join(currencyConfig.decimalSeparator)
    
    if (currencyConfig.symbolPosition === 'before') {
      return `${currencyConfig.symbol}${value}`
    } else {
      return `${value}${currencyConfig.symbol}`
    }
  }

  return (
    <div className={`
      border-t
      ${theme === 'dark' 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
      }
    `}>
      {/* Transaction Summary */}
      <div className={`
        px-6 py-4 border-b
        ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
      `}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Left: Item Count */}
          <div className="flex items-center gap-2">
            <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className={`
              text-sm font-medium
              ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
            `}>
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          </div>

          {/* Center: Transaction Breakdown */}
          <div className="flex items-center gap-8">
            {/* Subtotal */}
            <div className="flex flex-col items-end">
              <span className={`
                text-xs
                ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
              `}>
                Subtotal
              </span>
              <span className={`
                text-lg font-semibold
                ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}
              `}>
                {formatCurrency(subtotal)}
              </span>
            </div>

            {/* Tax */}
            <div className="flex flex-col items-end">
              <span className={`
                text-xs
                ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
              `}>
                Tax
              </span>
              <span className={`
                text-lg font-semibold
                ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}
              `}>
                {formatCurrency(tax)}
              </span>
            </div>

            {/* Total */}
            <div className="flex flex-col items-end">
              <span className={`
                text-xs
                ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
              `}>
                Total
              </span>
              <span className={`
                text-2xl font-bold
                ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
              `}>
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          {/* Right: Placeholder for balance */}
          <div className="w-32"></div>
        </div>
      </div>

      {/* Quick Actions - Single Line Scrollable */}
      <div className="px-6 py-3 relative">
        {/* Left Scroll Indicator */}
        {showLeftScroll && (
          <button
            onClick={() => scroll('left')}
            className={`
              absolute left-0 top-1/2 -translate-y-1/2 z-10
              w-10 h-full flex items-center justify-center
              ${theme === 'dark'
                ? 'bg-gradient-to-r from-gray-800 to-transparent'
                : 'bg-gradient-to-r from-white to-transparent'
              }
            `}
          >
            <svg className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Scrollable Action Buttons Container */}
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex items-center gap-2 min-w-max">
            {actions}
          </div>
        </div>

        {/* Right Scroll Indicator */}
        {showRightScroll && (
          <button
            onClick={() => scroll('right')}
            className={`
              absolute right-0 top-1/2 -translate-y-1/2 z-10
              w-10 h-full flex items-center justify-center
              ${theme === 'dark'
                ? 'bg-gradient-to-l from-gray-800 to-transparent'
                : 'bg-gradient-to-l from-white to-transparent'
              }
            `}
          >
            <svg className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

