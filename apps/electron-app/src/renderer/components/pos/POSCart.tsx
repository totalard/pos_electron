import { useState } from 'react'
import { useAppStore, useSettingsStore, usePOSStore } from '../../stores'
import { IconButton } from '../common'
import { SwipeableCartItem } from './SwipeableCartItem'

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
    clearCustomer,
    setSelectedCartItem,
    setShowDiscountDialog
  } = usePOSStore()

  const cartItems = getCartItems()
  const transaction = getActiveTransaction()

  const handleItemDiscountClick = (itemId: string) => {
    setSelectedCartItem(itemId)
    setShowDiscountDialog(true)
  }

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
          <div>
            {cartItems.map((item) => (
              <SwipeableCartItem
                key={item.id}
                item={item}
                onRemove={removeFromCart}
                onQuantityChange={updateCartItemQuantity}
                onDiscountClick={handleItemDiscountClick}
              />
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
