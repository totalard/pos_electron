import { ReactNode, useRef, useState, useEffect } from 'react'
import { useAppStore } from '../../stores'
import { CurrencyDisplay } from '../common'

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

  return (
    <div className={`
      border-t
      ${theme === 'dark' 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
      }
    `}>
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

