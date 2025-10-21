import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { EnhancedProduct } from '../services/api'
import type { ProductCustomization, RestaurantOrderMetadata, OrderType, OrderStatus } from '../types/restaurant'
import type { PaymentSplit, SplitPaymentConfig } from '../types/payment'

/**
 * Cart item with modifiers and customizations
 */
export interface CartItem {
  id: string // Unique ID for this cart item instance
  product: EnhancedProduct
  quantity: number
  unitPrice: number
  discount: number // Discount amount
  discountType: 'fixed' | 'percentage'
  tax: number
  subtotal: number
  total: number
  note?: string
  modifiers?: CartItemModifier[]
  variationId?: number
  variationName?: string
  // Restaurant-specific fields
  customization?: ProductCustomization
  courseName?: string // e.g., 'Appetizer', 'Main Course', 'Dessert'
  kitchenStatus?: OrderStatus
}

/**
 * Item modifier (e.g., extra cheese, no onions)
 */
export interface CartItemModifier {
  id: string
  name: string
  price: number
}

/**
 * POS transaction/tab
 */
export interface POSTransaction {
  id: string
  name: string
  items: CartItem[]
  customerId?: number
  customerName?: string
  subtotal: number
  tax: number
  discount: number
  total: number
  status: 'active' | 'parked' | 'completed' | 'voided'
  createdAt: Date
  updatedAt: Date
  note?: string
  // Restaurant-specific fields
  restaurantMetadata?: RestaurantOrderMetadata
  // Payment splitting
  splitPayment?: SplitPaymentConfig
}

/**
 * POS Store State
 */
export interface POSState {
  // Transactions (tabs)
  transactions: POSTransaction[]
  activeTransactionId: string | null
  
  // Product display
  viewMode: 'grid' | 'list'
  categoryViewMode: 'grid' | 'list'
  selectedCategoryId: number | null
  searchQuery: string
  
  // Barcode scanner
  barcodeScannerEnabled: boolean
  
  // UI state
  showNumpad: boolean
  showCustomerSelector: boolean
  showDiscountDialog: boolean
  selectedCartItemId: string | null
  
  // Restaurant-specific state
  showOrderTypeSelector: boolean
  showTableSelector: boolean
  showProductCustomization: boolean
  selectedProductForCustomization: string | null
  
  // Actions - Transaction Management
  createTransaction: (name?: string) => string
  deleteTransaction: (transactionId: string) => void
  setActiveTransaction: (transactionId: string) => void
  updateTransactionName: (transactionId: string, name: string) => void
  parkTransaction: (transactionId: string) => void
  voidTransaction: (transactionId: string) => void
  
  // Actions - Cart Management
  addToCart: (product: EnhancedProduct, quantity?: number, variationId?: number) => void
  removeFromCart: (itemId: string) => void
  updateCartItemQuantity: (itemId: string, quantity: number) => void
  updateCartItemPrice: (itemId: string, price: number) => void
  updateCartItemDiscount: (itemId: string, discount: number, type: 'fixed' | 'percentage') => void
  updateCartItemNote: (itemId: string, note: string) => void
  addCartItemModifier: (itemId: string, modifier: CartItemModifier) => void
  removeCartItemModifier: (itemId: string, modifierId: string) => void
  clearCart: () => void
  
  // Actions - Transaction Discount
  applyTransactionDiscount: (discount: number, type: 'fixed' | 'percentage') => void
  
  // Actions - Customer
  setCustomer: (customerId: number, customerName: string) => void
  clearCustomer: () => void
  
  // Actions - View & Filters
  setViewMode: (mode: 'grid' | 'list') => void
  setCategoryViewMode: (mode: 'grid' | 'list') => void
  setSelectedCategory: (categoryId: number | null) => void
  setSearchQuery: (query: string) => void
  
  // Actions - Barcode Scanner
  toggleBarcodeScanner: () => void
  setBarcodeScanner: (enabled: boolean) => void
  
  // Actions - UI State
  setShowNumpad: (show: boolean) => void
  setShowCustomerSelector: (show: boolean) => void
  setShowDiscountDialog: (show: boolean) => void
  setSelectedCartItem: (itemId: string | null) => void
  
  // Actions - Restaurant Features
  setOrderType: (orderType: OrderType) => void
  setTable: (tableId: string, tableName: string, floorId?: string, floorName?: string) => void
  clearTable: () => void
  setDeliveryAddress: (address: { street: string; city: string; state: string; zipCode: string; phone: string; instructions?: string }) => void
  clearDeliveryAddress: () => void
  updateCartItemCustomization: (itemId: string, customization: ProductCustomization) => void
  setShowOrderTypeSelector: (show: boolean) => void
  setShowTableSelector: (show: boolean) => void
  setShowProductCustomization: (show: boolean) => void
  setSelectedProductForCustomization: (productId: string | null) => void
  addAdditionalCharge: (chargeId: string, name: string, amount: number) => void
  removeAdditionalCharge: (chargeId: string) => void
  
  // Actions - Payment Splitting
  enableSplitPayment: () => void
  disableSplitPayment: () => void
  addPaymentSplit: (split: Omit<PaymentSplit, 'id' | 'isPaid'>) => string
  updatePaymentSplit: (splitId: string, updates: Partial<PaymentSplit>) => void
  removePaymentSplit: (splitId: string) => void
  markSplitAsPaid: (splitId: string, paymentMethod: string) => void
  calculateSplitAmounts: () => void
  
  // Computed getters
  getActiveTransaction: () => POSTransaction | null
  getCartItems: () => CartItem[]
  getCartItemCount: () => number
  getCartSubtotal: () => number
  getCartTax: () => number
  getCartTotal: () => number
  
  // Actions - Reset
  reset: () => void
}

// Helper function to generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// Helper function to calculate cart item total
const calculateCartItemTotal = (item: Omit<CartItem, 'subtotal' | 'total'>): { subtotal: number; total: number } => {
  const basePrice = item.unitPrice * item.quantity
  
  // Add modifiers
  const modifiersTotal = item.modifiers?.reduce((sum, mod) => sum + mod.price, 0) || 0
  const subtotalBeforeDiscount = basePrice + modifiersTotal
  
  // Apply discount
  let discountAmount = 0
  if (item.discountType === 'percentage') {
    discountAmount = subtotalBeforeDiscount * (item.discount / 100)
  } else {
    discountAmount = item.discount
  }
  
  const subtotal = subtotalBeforeDiscount - discountAmount
  const total = subtotal + item.tax
  
  return { subtotal, total }
}

// Helper function to recalculate transaction totals
const recalculateTransaction = (transaction: POSTransaction, taxRate: number = 0.08): POSTransaction => {
  const subtotal = transaction.items.reduce((sum, item) => sum + item.subtotal, 0)
  const tax = subtotal * taxRate
  const total = subtotal + tax - transaction.discount
  
  return {
    ...transaction,
    subtotal,
    tax,
    total,
    updatedAt: new Date()
  }
}

// Initial state
const initialState = {
  transactions: [],
  activeTransactionId: null,
  viewMode: 'grid' as const,
  categoryViewMode: 'list' as const,
  selectedCategoryId: null,
  searchQuery: '',
  barcodeScannerEnabled: true,
  showNumpad: false,
  showCustomerSelector: false,
  showDiscountDialog: false,
  selectedCartItemId: null,
  showOrderTypeSelector: false,
  showTableSelector: false,
  showProductCustomization: false,
  selectedProductForCustomization: null
}

/**
 * POS Store
 * Manages cart, transactions, and POS UI state
 */
export const usePOSStore = create<POSState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Transaction Management
      createTransaction: (name?: string) => {
        const id = generateId()
        const newTransaction: POSTransaction = {
          id,
          name: name || `Sale #${get().transactions.length + 1}`,
          items: [],
          subtotal: 0,
          tax: 0,
          discount: 0,
          total: 0,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        set(state => ({
          transactions: [...state.transactions, newTransaction],
          activeTransactionId: id
        }))
        
        return id
      },
      
      deleteTransaction: (transactionId: string) => {
        set(state => {
          const newTransactions = state.transactions.filter(t => t.id !== transactionId)
          let newActiveId = state.activeTransactionId
          
          // If this is the last tab, create a new one instead of deleting
          if (newTransactions.length === 0) {
            const id = generateId()
            const newTransaction: POSTransaction = {
              id,
              name: 'Sale #1',
              items: [],
              subtotal: 0,
              tax: 0,
              discount: 0,
              total: 0,
              status: 'active',
              createdAt: new Date(),
              updatedAt: new Date()
            }
            return {
              transactions: [newTransaction],
              activeTransactionId: id
            }
          }
          
          // If deleting active transaction, switch to first available
          if (state.activeTransactionId === transactionId) {
            newActiveId = newTransactions.length > 0 ? newTransactions[0].id : null
          }
          
          return {
            transactions: newTransactions,
            activeTransactionId: newActiveId
          }
        })
      },
      
      setActiveTransaction: (transactionId: string) => {
        set({ activeTransactionId: transactionId })
      },
      
      updateTransactionName: (transactionId: string, name: string) => {
        set(state => ({
          transactions: state.transactions.map(t =>
            t.id === transactionId ? { ...t, name, updatedAt: new Date() } : t
          )
        }))
      },
      
      parkTransaction: (transactionId: string) => {
        set(state => ({
          transactions: state.transactions.map(t =>
            t.id === transactionId ? { ...t, status: 'parked' as const, updatedAt: new Date() } : t
          )
        }))
      },
      
      voidTransaction: (transactionId: string) => {
        set(state => ({
          transactions: state.transactions.map(t =>
            t.id === transactionId ? { ...t, status: 'voided' as const, updatedAt: new Date() } : t
          )
        }))
      },
      
      // Cart Management
      addToCart: (product: EnhancedProduct, quantity: number = 1, variationId?: number) => {
        const activeTransaction = get().getActiveTransaction()
        if (!activeTransaction) return
        
        const itemId = generateId()
        const variation = variationId 
          ? product.variations?.find(v => v.id === variationId)
          : null
        
        const unitPrice = variation 
          ? product.base_price + variation.price_adjustment 
          : product.base_price
        const newItem: Omit<CartItem, 'subtotal' | 'total'> = {
          id: itemId,
          product,
          quantity,
          unitPrice,
          discount: 0,
          discountType: 'fixed',
          tax: 0,
          variationId,
          variationName: variation?.variation_name,
          modifiers: []
        }
        
        const { subtotal, total } = calculateCartItemTotal(newItem)
        const cartItem: CartItem = { ...newItem, subtotal, total }
        
        set(state => ({
          transactions: state.transactions.map(t =>
            t.id === activeTransaction.id
              ? recalculateTransaction({ ...t, items: [...t.items, cartItem] })
              : t
          )
        }))
      },
      
      removeFromCart: (itemId: string) => {
        const activeTransaction = get().getActiveTransaction()
        if (!activeTransaction) return
        
        set(state => ({
          transactions: state.transactions.map(t =>
            t.id === activeTransaction.id
              ? recalculateTransaction({ ...t, items: t.items.filter(item => item.id !== itemId) })
              : t
          )
        }))
      },
      
      updateCartItemQuantity: (itemId: string, quantity: number) => {
        const activeTransaction = get().getActiveTransaction()
        if (!activeTransaction || quantity < 1) return
        
        set(state => ({
          transactions: state.transactions.map(t =>
            t.id === activeTransaction.id
              ? recalculateTransaction({
                  ...t,
                  items: t.items.map(item => {
                    if (item.id === itemId) {
                      const updated = { ...item, quantity }
                      const { subtotal, total } = calculateCartItemTotal(updated)
                      return { ...updated, subtotal, total }
                    }
                    return item
                  })
                })
              : t
          )
        }))
      },
      
      updateCartItemPrice: (itemId: string, price: number) => {
        const activeTransaction = get().getActiveTransaction()
        if (!activeTransaction) return
        
        set(state => ({
          transactions: state.transactions.map(t =>
            t.id === activeTransaction.id
              ? recalculateTransaction({
                  ...t,
                  items: t.items.map(item => {
                    if (item.id === itemId) {
                      const updated = { ...item, unitPrice: price }
                      const { subtotal, total } = calculateCartItemTotal(updated)
                      return { ...updated, subtotal, total }
                    }
                    return item
                  })
                })
              : t
          )
        }))
      },
      
      updateCartItemDiscount: (itemId: string, discount: number, type: 'fixed' | 'percentage') => {
        const activeTransaction = get().getActiveTransaction()
        if (!activeTransaction) return
        
        set(state => ({
          transactions: state.transactions.map(t =>
            t.id === activeTransaction.id
              ? recalculateTransaction({
                  ...t,
                  items: t.items.map(item => {
                    if (item.id === itemId) {
                      const updated = { ...item, discount, discountType: type }
                      const { subtotal, total } = calculateCartItemTotal(updated)
                      return { ...updated, subtotal, total }
                    }
                    return item
                  })
                })
              : t
          )
        }))
      },
      
      updateCartItemNote: (itemId: string, note: string) => {
        const activeTransaction = get().getActiveTransaction()
        if (!activeTransaction) return
        
        set(state => ({
          transactions: state.transactions.map(t =>
            t.id === activeTransaction.id
              ? { ...t, items: t.items.map(item => item.id === itemId ? { ...item, note } : item), updatedAt: new Date() }
              : t
          )
        }))
      },
      
      addCartItemModifier: (itemId: string, modifier: CartItemModifier) => {
        const activeTransaction = get().getActiveTransaction()
        if (!activeTransaction) return
        
        set(state => ({
          transactions: state.transactions.map(t =>
            t.id === activeTransaction.id
              ? recalculateTransaction({
                  ...t,
                  items: t.items.map(item => {
                    if (item.id === itemId) {
                      const modifiers = [...(item.modifiers || []), modifier]
                      const updated = { ...item, modifiers }
                      const { subtotal, total } = calculateCartItemTotal(updated)
                      return { ...updated, subtotal, total }
                    }
                    return item
                  })
                })
              : t
          )
        }))
      },
      
      removeCartItemModifier: (itemId: string, modifierId: string) => {
        const activeTransaction = get().getActiveTransaction()
        if (!activeTransaction) return
        
        set(state => ({
          transactions: state.transactions.map(t =>
            t.id === activeTransaction.id
              ? recalculateTransaction({
                  ...t,
                  items: t.items.map(item => {
                    if (item.id === itemId) {
                      const modifiers = item.modifiers?.filter(m => m.id !== modifierId) || []
                      const updated = { ...item, modifiers }
                      const { subtotal, total } = calculateCartItemTotal(updated)
                      return { ...updated, subtotal, total }
                    }
                    return item
                  })
                })
              : t
          )
        }))
      },
      
      clearCart: () => {
        const activeTransaction = get().getActiveTransaction()
        if (!activeTransaction) return
        
        set(state => ({
          transactions: state.transactions.map(t =>
            t.id === activeTransaction.id
              ? recalculateTransaction({ ...t, items: [] })
              : t
          )
        }))
      },
      
      // Transaction Discount
      applyTransactionDiscount: (discount: number, type: 'fixed' | 'percentage') => {
        const activeTransaction = get().getActiveTransaction()
        if (!activeTransaction) return
        
        let discountAmount = discount
        if (type === 'percentage') {
          discountAmount = activeTransaction.subtotal * (discount / 100)
        }
        
        set(state => ({
          transactions: state.transactions.map(t =>
            t.id === activeTransaction.id
              ? recalculateTransaction({ ...t, discount: discountAmount })
              : t
          )
        }))
      },
      
      // Customer
      setCustomer: (customerId: number, customerName: string) => {
        const activeTransaction = get().getActiveTransaction()
        if (!activeTransaction) return
        
        set(state => ({
          transactions: state.transactions.map(t =>
            t.id === activeTransaction.id
              ? { ...t, customerId, customerName, updatedAt: new Date() }
              : t
          )
        }))
      },
      
      clearCustomer: () => {
        const activeTransaction = get().getActiveTransaction()
        if (!activeTransaction) return
        
        set(state => ({
          transactions: state.transactions.map(t =>
            t.id === activeTransaction.id
              ? { ...t, customerId: undefined, customerName: undefined, updatedAt: new Date() }
              : t
          )
        }))
      },
      
      // View & Filters
      setViewMode: (mode: 'grid' | 'list') => {
        set({ viewMode: mode })
      },
      
      setCategoryViewMode: (mode: 'grid' | 'list') => {
        set({ categoryViewMode: mode })
      },
      
      setSelectedCategory: (categoryId: number | null) => {
        set({ selectedCategoryId: categoryId })
      },
      
      setSearchQuery: (query: string) => {
        set({ searchQuery: query })
      },
      
      // Barcode Scanner
      toggleBarcodeScanner: () => {
        set(state => ({ barcodeScannerEnabled: !state.barcodeScannerEnabled }))
      },
      
      setBarcodeScanner: (enabled: boolean) => {
        set({ barcodeScannerEnabled: enabled })
      },
      
      // UI State
      setShowNumpad: (show: boolean) => {
        set({ showNumpad: show })
      },
      
      setShowCustomerSelector: (show: boolean) => {
        set({ showCustomerSelector: show })
      },
      
      setShowDiscountDialog: (show: boolean) => {
        set({ showDiscountDialog: show })
      },
      
      setSelectedCartItem: (itemId: string | null) => {
        set({ selectedCartItemId: itemId })
      },
      
      // Restaurant Features
      setOrderType: (orderType: OrderType) => {
        set(state => {
          const transaction = state.transactions.find(t => t.id === state.activeTransactionId)
          if (!transaction) return state
          
          const updatedTransaction = {
            ...transaction,
            restaurantMetadata: {
              ...transaction.restaurantMetadata,
              orderType,
              orderStatus: 'pending' as OrderStatus,
              additionalCharges: transaction.restaurantMetadata?.additionalCharges || []
            },
            updatedAt: new Date()
          }
          
          return {
            transactions: state.transactions.map(t =>
              t.id === state.activeTransactionId ? updatedTransaction : t
            )
          }
        })
      },
      
      setTable: (tableId: string, tableName: string, floorId?: string, floorName?: string) => {
        set(state => {
          const transaction = state.transactions.find(t => t.id === state.activeTransactionId)
          if (!transaction) return state
          
          const updatedTransaction = {
            ...transaction,
            restaurantMetadata: {
              ...transaction.restaurantMetadata,
              orderType: transaction.restaurantMetadata?.orderType || 'dine-in' as OrderType,
              orderStatus: transaction.restaurantMetadata?.orderStatus || 'pending' as OrderStatus,
              tableId,
              tableName,
              floorId,
              floorName,
              additionalCharges: transaction.restaurantMetadata?.additionalCharges || []
            },
            updatedAt: new Date()
          }
          
          return {
            transactions: state.transactions.map(t =>
              t.id === state.activeTransactionId ? updatedTransaction : t
            )
          }
        })
      },
      
      clearTable: () => {
        set(state => {
          const transaction = state.transactions.find(t => t.id === state.activeTransactionId)
          if (!transaction || !transaction.restaurantMetadata) return state
          
          const updatedTransaction = {
            ...transaction,
            restaurantMetadata: {
              ...transaction.restaurantMetadata,
              tableId: undefined,
              tableName: undefined,
              floorId: undefined,
              floorName: undefined
            },
            updatedAt: new Date()
          }
          
          return {
            transactions: state.transactions.map(t =>
              t.id === state.activeTransactionId ? updatedTransaction : t
            )
          }
        })
      },
      
      setDeliveryAddress: (address) => {
        set(state => {
          const transaction = state.transactions.find(t => t.id === state.activeTransactionId)
          if (!transaction) return state
          
          const updatedTransaction = {
            ...transaction,
            restaurantMetadata: {
              ...transaction.restaurantMetadata,
              orderType: transaction.restaurantMetadata?.orderType || 'delivery' as OrderType,
              orderStatus: transaction.restaurantMetadata?.orderStatus || 'pending' as OrderStatus,
              deliveryAddress: address,
              additionalCharges: transaction.restaurantMetadata?.additionalCharges || []
            },
            updatedAt: new Date()
          }
          
          return {
            transactions: state.transactions.map(t =>
              t.id === state.activeTransactionId ? updatedTransaction : t
            )
          }
        })
      },
      
      clearDeliveryAddress: () => {
        set(state => {
          const transaction = state.transactions.find(t => t.id === state.activeTransactionId)
          if (!transaction || !transaction.restaurantMetadata) return state
          
          const updatedTransaction = {
            ...transaction,
            restaurantMetadata: {
              ...transaction.restaurantMetadata,
              deliveryAddress: undefined
            },
            updatedAt: new Date()
          }
          
          return {
            transactions: state.transactions.map(t =>
              t.id === state.activeTransactionId ? updatedTransaction : t
            )
          }
        })
      },
      
      updateCartItemCustomization: (itemId: string, customization: ProductCustomization) => {
        set(state => {
          const transaction = state.transactions.find(t => t.id === state.activeTransactionId)
          if (!transaction) return state
          
          const updatedItems = transaction.items.map(item =>
            item.id === itemId ? { ...item, customization } : item
          )
          
          const updatedTransaction = recalculateTransaction({
            ...transaction,
            items: updatedItems
          })
          
          return {
            transactions: state.transactions.map(t =>
              t.id === state.activeTransactionId ? updatedTransaction : t
            )
          }
        })
      },
      
      setShowOrderTypeSelector: (show: boolean) => {
        set({ showOrderTypeSelector: show })
      },
      
      setShowTableSelector: (show: boolean) => {
        set({ showTableSelector: show })
      },
      
      setShowProductCustomization: (show: boolean) => {
        set({ showProductCustomization: show })
      },
      
      setSelectedProductForCustomization: (productId: string | null) => {
        set({ selectedProductForCustomization: productId })
      },
      
      addAdditionalCharge: (chargeId: string, name: string, amount: number) => {
        set(state => {
          const transaction = state.transactions.find(t => t.id === state.activeTransactionId)
          if (!transaction) return state
          
          const existingCharges = transaction.restaurantMetadata?.additionalCharges || []
          const chargeExists = existingCharges.some(c => c.chargeId === chargeId)
          
          if (chargeExists) return state
          
          const updatedTransaction = {
            ...transaction,
            restaurantMetadata: {
              ...transaction.restaurantMetadata,
              orderType: transaction.restaurantMetadata?.orderType || 'dine-in' as OrderType,
              orderStatus: transaction.restaurantMetadata?.orderStatus || 'pending' as OrderStatus,
              additionalCharges: [
                ...existingCharges,
                { chargeId, name, amount }
              ]
            },
            updatedAt: new Date()
          }
          
          // Recalculate totals with additional charges
          const subtotal = updatedTransaction.items.reduce((sum, item) => sum + item.subtotal, 0)
          const chargesTotal = updatedTransaction.restaurantMetadata.additionalCharges.reduce((sum, c) => sum + c.amount, 0)
          const tax = (subtotal + chargesTotal) * 0.08
          const total = subtotal + chargesTotal + tax - updatedTransaction.discount
          
          return {
            transactions: state.transactions.map(t =>
              t.id === state.activeTransactionId ? {
                ...updatedTransaction,
                subtotal: subtotal + chargesTotal,
                tax,
                total
              } : t
            )
          }
        })
      },
      
      removeAdditionalCharge: (chargeId: string) => {
        set(state => {
          const transaction = state.transactions.find(t => t.id === state.activeTransactionId)
          if (!transaction || !transaction.restaurantMetadata) return state
          
          const updatedTransaction = {
            ...transaction,
            restaurantMetadata: {
              ...transaction.restaurantMetadata,
              additionalCharges: transaction.restaurantMetadata.additionalCharges.filter(
                c => c.chargeId !== chargeId
              )
            },
            updatedAt: new Date()
          }
          
          // Recalculate totals without the removed charge
          const subtotal = updatedTransaction.items.reduce((sum, item) => sum + item.subtotal, 0)
          const chargesTotal = updatedTransaction.restaurantMetadata.additionalCharges.reduce((sum, c) => sum + c.amount, 0)
          const tax = (subtotal + chargesTotal) * 0.08
          const total = subtotal + chargesTotal + tax - updatedTransaction.discount
          
          return {
            transactions: state.transactions.map(t =>
              t.id === state.activeTransactionId ? {
                ...updatedTransaction,
                subtotal: subtotal + chargesTotal,
                tax,
                total
              } : t
            )
          }
        })
      },
      
      // Payment Splitting
      enableSplitPayment: () => {
        set(state => {
          const transaction = state.transactions.find(t => t.id === state.activeTransactionId)
          if (!transaction) return state
          
          const updatedTransaction = {
            ...transaction,
            splitPayment: {
              enabled: true,
              splits: [],
              totalAmount: transaction.total,
              remainingAmount: transaction.total
            },
            updatedAt: new Date()
          }
          
          return {
            transactions: state.transactions.map(t =>
              t.id === state.activeTransactionId ? updatedTransaction : t
            )
          }
        })
      },
      
      disableSplitPayment: () => {
        set(state => {
          const transaction = state.transactions.find(t => t.id === state.activeTransactionId)
          if (!transaction) return state
          
          const updatedTransaction = {
            ...transaction,
            splitPayment: undefined,
            updatedAt: new Date()
          }
          
          return {
            transactions: state.transactions.map(t =>
              t.id === state.activeTransactionId ? updatedTransaction : t
            )
          }
        })
      },
      
      addPaymentSplit: (splitData) => {
        const id = generateId()
        
        set(state => {
          const transaction = state.transactions.find(t => t.id === state.activeTransactionId)
          if (!transaction || !transaction.splitPayment) return state
          
          const newSplit: PaymentSplit = {
            ...splitData,
            id,
            isPaid: false
          }
          
          const updatedSplits = [...transaction.splitPayment.splits, newSplit]
          
          // Calculate remaining amount
          const paidAmount = updatedSplits
            .filter(s => s.isPaid)
            .reduce((sum, s) => sum + s.amount, 0)
          const remainingAmount = transaction.splitPayment.totalAmount - paidAmount
          
          const updatedTransaction = {
            ...transaction,
            splitPayment: {
              ...transaction.splitPayment,
              splits: updatedSplits,
              remainingAmount
            },
            updatedAt: new Date()
          }
          
          return {
            transactions: state.transactions.map(t =>
              t.id === state.activeTransactionId ? updatedTransaction : t
            )
          }
        })
        
        return id
      },
      
      updatePaymentSplit: (splitId, updates) => {
        set(state => {
          const transaction = state.transactions.find(t => t.id === state.activeTransactionId)
          if (!transaction || !transaction.splitPayment) return state
          
          const updatedSplits = transaction.splitPayment.splits.map(split =>
            split.id === splitId ? { ...split, ...updates } : split
          )
          
          // Recalculate remaining amount
          const paidAmount = updatedSplits
            .filter(s => s.isPaid)
            .reduce((sum, s) => sum + s.amount, 0)
          const remainingAmount = transaction.splitPayment.totalAmount - paidAmount
          
          const updatedTransaction = {
            ...transaction,
            splitPayment: {
              ...transaction.splitPayment,
              splits: updatedSplits,
              remainingAmount
            },
            updatedAt: new Date()
          }
          
          return {
            transactions: state.transactions.map(t =>
              t.id === state.activeTransactionId ? updatedTransaction : t
            )
          }
        })
      },
      
      removePaymentSplit: (splitId) => {
        set(state => {
          const transaction = state.transactions.find(t => t.id === state.activeTransactionId)
          if (!transaction || !transaction.splitPayment) return state
          
          const updatedSplits = transaction.splitPayment.splits.filter(s => s.id !== splitId)
          
          // Recalculate remaining amount
          const paidAmount = updatedSplits
            .filter(s => s.isPaid)
            .reduce((sum, s) => sum + s.amount, 0)
          const remainingAmount = transaction.splitPayment.totalAmount - paidAmount
          
          const updatedTransaction = {
            ...transaction,
            splitPayment: {
              ...transaction.splitPayment,
              splits: updatedSplits,
              remainingAmount
            },
            updatedAt: new Date()
          }
          
          return {
            transactions: state.transactions.map(t =>
              t.id === state.activeTransactionId ? updatedTransaction : t
            )
          }
        })
      },
      
      markSplitAsPaid: (splitId, paymentMethod) => {
        set(state => {
          const transaction = state.transactions.find(t => t.id === state.activeTransactionId)
          if (!transaction || !transaction.splitPayment) return state
          
          const updatedSplits = transaction.splitPayment.splits.map(split =>
            split.id === splitId
              ? { ...split, isPaid: true, paymentMethod, paidAt: new Date() }
              : split
          )
          
          // Recalculate remaining amount
          const paidAmount = updatedSplits
            .filter(s => s.isPaid)
            .reduce((sum, s) => sum + s.amount, 0)
          const remainingAmount = transaction.splitPayment.totalAmount - paidAmount
          
          const updatedTransaction = {
            ...transaction,
            splitPayment: {
              ...transaction.splitPayment,
              splits: updatedSplits,
              remainingAmount
            },
            updatedAt: new Date()
          }
          
          return {
            transactions: state.transactions.map(t =>
              t.id === state.activeTransactionId ? updatedTransaction : t
            )
          }
        })
      },
      
      calculateSplitAmounts: () => {
        set(state => {
          const transaction = state.transactions.find(t => t.id === state.activeTransactionId)
          if (!transaction || !transaction.splitPayment) return state
          
          const splits = transaction.splitPayment.splits.map(split => {
            let amount = split.amount
            
            // Calculate amount based on split type
            if (split.splitType === 'percentage' && split.percentage) {
              amount = (transaction.total * split.percentage) / 100
            } else if (split.splitType === 'items' && split.itemIds) {
              // Calculate total for specific items
              amount = transaction.items
                .filter(item => split.itemIds?.includes(item.id))
                .reduce((sum, item) => sum + item.total, 0)
            }
            
            return { ...split, amount }
          })
          
          // Recalculate remaining amount
          const paidAmount = splits
            .filter(s => s.isPaid)
            .reduce((sum, s) => sum + s.amount, 0)
          const remainingAmount = transaction.splitPayment.totalAmount - paidAmount
          
          const updatedTransaction = {
            ...transaction,
            splitPayment: {
              ...transaction.splitPayment,
              splits,
              remainingAmount
            },
            updatedAt: new Date()
          }
          
          return {
            transactions: state.transactions.map(t =>
              t.id === state.activeTransactionId ? updatedTransaction : t
            )
          }
        })
      },
      
      // Computed getters
      getActiveTransaction: () => {
        const state = get()
        return state.transactions.find(t => t.id === state.activeTransactionId) || null
      },
      
      getCartItems: () => {
        const transaction = get().getActiveTransaction()
        return transaction?.items || []
      },
      
      getCartItemCount: () => {
        const items = get().getCartItems()
        return items.reduce((sum, item) => sum + item.quantity, 0)
      },
      
      getCartSubtotal: () => {
        const transaction = get().getActiveTransaction()
        return transaction?.subtotal || 0
      },
      
      getCartTax: () => {
        const transaction = get().getActiveTransaction()
        return transaction?.tax || 0
      },
      
      getCartTotal: () => {
        const transaction = get().getActiveTransaction()
        return transaction?.total || 0
      },
      
      // Reset
      reset: () => {
        set(initialState)
      }
    }),
    {
      name: 'pos-storage',
      partialize: (state) => ({
        transactions: state.transactions,
        activeTransactionId: state.activeTransactionId,
        viewMode: state.viewMode,
        categoryViewMode: state.categoryViewMode,
        barcodeScannerEnabled: state.barcodeScannerEnabled
      })
    }
  )
)
