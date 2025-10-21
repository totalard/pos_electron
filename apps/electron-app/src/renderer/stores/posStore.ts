import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { EnhancedProduct } from '../services/api'

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
  selectedCategoryId: number | null
  searchQuery: string
  
  // Barcode scanner
  barcodeScannerEnabled: boolean
  
  // UI state
  showNumpad: boolean
  showCustomerSelector: boolean
  showDiscountDialog: boolean
  selectedCartItemId: string | null
  
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
  selectedCategoryId: null,
  searchQuery: '',
  barcodeScannerEnabled: true,
  showNumpad: false,
  showCustomerSelector: false,
  showDiscountDialog: false,
  selectedCartItemId: null
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
        barcodeScannerEnabled: state.barcodeScannerEnabled
      })
    }
  )
)
