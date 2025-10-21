import { useAppStore, useSettingsStore, usePOSStore } from '../../stores'
import { IconButton } from '../common'

/**
 * POSCart component props
 */
export interface POSCartProps {
  /** Show customer info */
  showCustomer?: boolean
  /** Customer selection handler */
  onCustomerSelect?: () => void
}

/**
 * POS Cart Component - Interactive shopping cart with item management
 * 
 * Features:
 * - Touch-friendly quantity controls (44px+ buttons)
 * - Item editing and removal
 * - Price and discount display
 * - Customer information
 * - Scrollable item list
 * - Real-time totals
 * 
 * @example
 * ```tsx
 * <POSCart
 *   showCustomer
 *   onCustomerSelect={handleCustomerSelect}
 * />
 * ```
 */
export function POSCart({
  showCustomer = true,
  onCustomerSelect
}: POSCartProps) {
  const { theme } = useAppStore()
  const { business } = useSettingsStore()
  const {
    getCartItems,
    getActiveTransaction,
    updateCartItemQuantity,
    removeFromCart,
    clearCustomer
  } = usePOSStore()

  const cartItems = getCartItems()
  const transaction = getActiveTransaction()

  const formatCurrency = (amount: number): string => {
    const { currencyConfig } = business
    const formatted = amount.toFixed(currencyConfig.decimalPlaces)
    const parts = formatted.split('.')
    
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, currencyConfig.thousandSeparator)
    
    const value = parts.join(currencyConfig.decimalSeparator)
    
    if (currencyConfig.symbolPosition === 'before') {
      return `${currencyConfig.symbol}${value}`
    } else {
      return `${value}${currencyConfig.symbol}`
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with Customer Info */}
      <div className={`
        px-4 py-3 border-b
        ${theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}
      `}>
        {showCustomer && transaction?.customerId ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <svg className={`w-5 h-5 flex-shrink-0 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {transaction.customerName}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Customer
                </p>
              </div>
            </div>
            <IconButton
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              }
              label="Remove customer"
              onClick={clearCustomer}
              variant="ghost"
              size="sm"
            />
          </div>
        ) : showCustomer && onCustomerSelect ? (
          <button
            onClick={onCustomerSelect}
            className={`
              w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg
              min-h-[44px] transition-colors
              ${theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }
            `}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-sm font-medium">Add Customer</span>
          </button>
        ) : (
          <h2 className={`
            text-sm font-semibold uppercase tracking-wider
            ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
          `}>
            Cart Items
          </h2>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto">
        {cartItems.length === 0 ? (
          <div className={`
            flex flex-col items-center justify-center h-full p-6 text-center
            ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}
          `}>
            <svg className="w-16 h-16 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-sm font-medium mb-1">Cart is empty</p>
            <p className="text-xs">Add products to start a sale</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className={`
                  p-4 transition-all duration-200 ease-out
                  ${theme === 'dark' ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}
                  hover:shadow-md
                `}
              >
                {/* Item Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className={`
                      text-sm font-semibold truncate
                      ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
                    `}>
                      {item.product.name}
                    </h3>
                    {item.variationName && (
                      <p className={`
                        text-xs
                        ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                      `}>
                        {item.variationName}
                      </p>
                    )}
                    {item.note && (
                      <p className={`
                        text-xs italic mt-1
                        ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}
                      `}>
                        Note: {item.note}
                      </p>
                    )}
                  </div>
                  <IconButton
                    icon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    }
                    label="Remove item"
                    onClick={() => removeFromCart(item.id)}
                    variant="ghost"
                    size="sm"
                  />
                </div>

                {/* Modifiers */}
                {item.modifiers && item.modifiers.length > 0 && (
                  <div className={`
                    mb-3 pl-3 border-l-2
                    ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
                  `}>
                    {item.modifiers.map((modifier) => (
                      <div key={modifier.id} className="flex items-center justify-between py-1">
                        <span className={`
                          text-xs
                          ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                        `}>
                          + {modifier.name}
                        </span>
                        <span className={`
                          text-xs font-medium
                          ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
                        `}>
                          {formatCurrency(modifier.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quantity Controls & Price */}
                <div className="flex items-center justify-between">
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className={`
                        w-10 h-10 rounded-lg flex items-center justify-center
                        transition-all duration-200 ease-out
                        transform active:scale-90
                        ${item.quantity <= 1
                          ? theme === 'dark'
                            ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : theme === 'dark'
                            ? 'bg-gray-700 hover:bg-gray-600 text-white active:bg-gray-600 hover:scale-105'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-900 active:bg-gray-400 hover:scale-105'
                        }
                      `}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>

                    <div className={`
                      min-w-[48px] text-center text-lg font-bold
                      ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
                    `}>
                      {item.quantity}
                    </div>

                    <button
                      onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                      className={`
                        w-10 h-10 rounded-lg flex items-center justify-center
                        transition-all duration-200 ease-out
                        transform hover:scale-105 active:scale-90
                        ${theme === 'dark'
                          ? 'bg-primary-600 hover:bg-primary-700 text-white active:bg-primary-700'
                          : 'bg-primary-500 hover:bg-primary-600 text-white active:bg-primary-600'
                        }
                      `}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <div className={`
                      text-base font-bold
                      ${theme === 'dark' ? 'text-primary-400' : 'text-primary-600'}
                    `}>
                      {formatCurrency(item.total)}
                    </div>
                    {item.discount > 0 && (
                      <div className={`
                        text-xs line-through
                        ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}
                      `}>
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Summary */}
      {cartItems.length > 0 && transaction && (
        <div className={`
          px-4 py-4 border-t space-y-2
          ${theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}
        `}>
          {/* Subtotal */}
          <div className="flex items-center justify-between">
            <span className={`
              text-sm
              ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
            `}>
              Subtotal
            </span>
            <span className={`
              text-sm font-semibold
              ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}
            `}>
              {formatCurrency(transaction.subtotal)}
            </span>
          </div>

          {/* Discount */}
          {transaction.discount > 0 && (
            <div className="flex items-center justify-between">
              <span className={`
                text-sm
                ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
              `}>
                Discount
              </span>
              <span className="text-sm font-semibold text-red-500">
                -{formatCurrency(transaction.discount)}
              </span>
            </div>
          )}

          {/* Tax */}
          <div className="flex items-center justify-between">
            <span className={`
              text-sm
              ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
            `}>
              Tax
            </span>
            <span className={`
              text-sm font-semibold
              ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}
            `}>
              {formatCurrency(transaction.tax)}
            </span>
          </div>

          {/* Total */}
          <div className={`
            flex items-center justify-between pt-2 border-t
            ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}
          `}>
            <span className={`
              text-base font-bold
              ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
            `}>
              Total
            </span>
            <span className={`
              text-xl font-bold
              ${theme === 'dark' ? 'text-primary-400' : 'text-primary-600'}
            `}>
              {formatCurrency(transaction.total)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
