import { useState } from 'react'
import { useAppStore, usePOSStore, useSettingsStore } from '../../stores'
import { IconButton, CurrencyDisplay } from '../common'
import { SwipeableCartItem } from './SwipeableCartItem'
import { RestaurantInfoBar } from '../restaurant'

/**
 * POSCart component props
 */
export interface POSCartProps {
  /** Show customer info */
  showCustomer?: boolean
  /** Customer selection handler */
  onCustomerSelect?: () => void
  /** Checkout handler */
  onCheckout?: () => void
  /** Disable checkout button */
  checkoutDisabled?: boolean
  /** Handler for changing order type */
  onChangeOrderType?: () => void
  /** Handler for changing table */
  onChangeTable?: () => void
  /** Handler for changing guest count */
  onChangeGuestCount?: () => void
  /** Handler for managing additional charges */
  onManageCharges?: () => void
  /** Handler for delivery address */
  onManageDeliveryAddress?: () => void
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
  onCustomerSelect,
  onCheckout,
  checkoutDisabled = false,
  onChangeOrderType,
  onChangeTable,
  onChangeGuestCount,
  onManageCharges,
  onManageDeliveryAddress
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

  return (
    <div className="flex flex-col h-full">
      {/* Enhanced Header */}
      <div className={`
        px-4 py-4 border-b
        ${theme === 'dark' ? 'border-gray-700 bg-gradient-to-r from-gray-800 to-gray-800/80' : 'border-gray-200 bg-gradient-to-r from-gray-50 to-white'}
      `}>
        <div className="flex items-center justify-between mb-3">
          <h2 className={`
            text-lg font-bold tracking-tight
            ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
          `}>
            Shopping Cart
          </h2>
          <div className={`
            px-3 py-1 rounded-full text-xs font-semibold
            ${theme === 'dark' ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-700'}
          `}>
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
          </div>
        </div>

        {/* Restaurant Info Bar - Order Type, Table, Guest Count */}
        {business.mode === 'restaurant' && transaction?.restaurantMetadata && (
          <div className="mb-3">
            <RestaurantInfoBar
              onChangeOrderType={onChangeOrderType}
              onChangeTable={onChangeTable}
              onChangeGuestCount={onChangeGuestCount}
              onManageDeliveryAddress={onManageDeliveryAddress}
            />
          </div>
        )}
        
        {/* Customer Section */}
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
              w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
              min-h-[44px] transition-all duration-200
              ${theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600'
                : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm'
              }
            `}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-sm font-medium">Add Customer</span>
          </button>
        ) : null}
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

      {/* Cart Summary & Checkout */}
      {cartItems.length > 0 && transaction && (
        <div className={`
          border-t
          ${theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}
        `}>
          {/* Summary Section */}
          <div className="px-4 py-4 space-y-2">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className={`
                text-sm font-mono
                ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
              `}>
                Subtotal
              </span>
              <CurrencyDisplay
                amount={transaction.subtotal}
                className={`
                  text-sm font-mono font-semibold
                  ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}
                `}
              />
            </div>

            {/* Discount */}
            {transaction.discount > 0 && (
              <div className="flex items-center justify-between">
                <span className={`
                  text-sm font-mono
                  ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                `}>
                  Discount
                </span>
                <CurrencyDisplay
                  amount={transaction.discount}
                  className="text-sm font-mono font-semibold text-red-500"
                  prefix="-"
                />
              </div>
            )}

            {/* Additional Charges (Restaurant Mode) */}
            {business.mode === 'restaurant' && transaction.restaurantMetadata?.additionalCharges && transaction.restaurantMetadata.additionalCharges.length > 0 && (
              <div className="space-y-1">
                {transaction.restaurantMetadata.additionalCharges.map((charge) => (
                  <div key={charge.chargeId} className="flex items-center justify-between">
                    <span className={`
                      text-sm font-mono
                      ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                    `}>
                      {charge.name}
                    </span>
                    <CurrencyDisplay
                      amount={charge.amount}
                      className={`
                        text-sm font-mono font-semibold
                        ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}
                      `}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Manage Charges Button (Restaurant Mode) */}
            {business.mode === 'restaurant' && onManageCharges && (
              <button
                onClick={onManageCharges}
                className={`
                  w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                  transition-colors
                  ${theme === 'dark'
                    ? 'bg-gray-700/50 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }
                `}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Manage Charges
              </button>
            )}

            {/* Tax */}
            <div className="flex items-center justify-between">
              <span className={`
                text-sm font-mono
                ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
              `}>
                Tax
              </span>
              <CurrencyDisplay
                amount={transaction.tax}
                className={`
                  text-sm font-mono font-semibold
                  ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}
                `}
              />
            </div>

            {/* Total */}
            <div className={`
              flex items-center justify-between pt-3 border-t
              ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}
            `}>
              <span className={`
                text-base font-mono font-bold
                ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
              `}>
                Total
              </span>
              <CurrencyDisplay
                amount={transaction.total}
                className={`
                  text-xl font-mono font-bold
                  ${theme === 'dark' ? 'text-primary-400' : 'text-primary-600'}
                `}
              />
            </div>
          </div>

          {/* Checkout Button */}
          {onCheckout && (
            <div className="px-4 pb-4">
              <button
                onClick={onCheckout}
                disabled={checkoutDisabled}
                className={`
                  w-full py-4 px-6 rounded-xl font-bold text-lg
                  transition-all duration-200 transform
                  flex items-center justify-center gap-3
                  shadow-lg hover:shadow-xl
                  ${checkoutDisabled
                    ? theme === 'dark'
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : theme === 'dark'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white hover:scale-[1.02] active:scale-[0.98]'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white hover:scale-[1.02] active:scale-[0.98]'
                  }
                `}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Checkout</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
