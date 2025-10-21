import { ReactNode } from 'react'
import { useAppStore, useSettingsStore } from '../../stores'
import { Button } from '../common'

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
  /** Primary action button (e.g., Checkout) */
  primaryAction?: {
    label: string
    onClick: () => void
    disabled?: boolean
  }
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
 *   primaryAction={{
 *     label: 'Checkout',
 *     onClick: handleCheckout
 *   }}
 * />
 * ```
 */
export function POSFooter({
  subtotal = 0,
  tax = 0,
  total = 0,
  itemCount = 0,
  actions,
  primaryAction
}: POSFooterProps) {
  const { theme } = useAppStore()
  const { business } = useSettingsStore()

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

      {/* Quick Actions */}
      <div className="px-6 py-3 flex items-center gap-4">
        {/* Left: Quick Action Buttons - Scrollable with hidden scrollbar */}
        <div className="flex-1 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2">
            {actions}
          </div>
        </div>

        {/* Right: Primary Action - Fixed Position */}
        {primaryAction && (
          <Button
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled}
            variant="primary"
            size="lg"
            className={`
              min-w-[240px] min-h-[64px] text-xl font-bold flex-shrink-0
              shadow-xl hover:shadow-2xl
              ${theme === 'dark' 
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600' 
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600'
              }
              transform hover:scale-105 transition-all duration-200
              ring-2 ring-blue-400/50
            `}
          >
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>{primaryAction.label}</span>
            </div>
          </Button>
        )}
      </div>
    </div>
  )
}

