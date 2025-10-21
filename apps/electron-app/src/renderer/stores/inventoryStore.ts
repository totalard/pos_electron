import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types for inventory management
export interface StockTransaction {
  id: number
  transaction_type: 'purchase' | 'sale' | 'adjustment' | 'return' | 'damage' | 'transfer'
  product_id: number
  product_name?: string
  quantity: number
  stock_before: number
  stock_after: number
  unit_cost?: number
  total_cost?: number
  reference_number?: string
  notes?: string
  performed_by_id?: number
  performed_by_name?: string
  created_at: string
  updated_at: string
}

export interface StockAdjustment {
  id: number
  adjustment_date: string
  reason: string
  notes?: string
  performed_by_id?: number
  performed_by_name?: string
  is_completed: boolean
  lines?: StockAdjustmentLine[]
  created_at: string
  updated_at: string
}

export interface StockAdjustmentLine {
  id: number
  adjustment_id: number
  product_id: number
  product_name?: string
  expected_quantity: number
  actual_quantity: number
  difference: number
  notes?: string
}

export interface InventorySettings {
  enableStockTracking: boolean
  trackBySerialNumber: boolean
  trackByBatchNumber: boolean
  trackByExpiryDate: boolean
  enableLowStockAlerts: boolean
  lowStockThreshold: number
  lowStockThresholdType: 'absolute' | 'percentage'
  enableOutOfStockAlerts: boolean
  stockDeductionMode: 'automatic' | 'manual'
  allowNegativeStock: boolean
  deductOnSale: boolean
  deductOnOrder: boolean
  enableAutoReorder: boolean
  autoReorderThreshold: number
  autoReorderQuantity: number
  valuationMethod: 'FIFO' | 'LIFO' | 'Weighted Average'
  enableCostTracking: boolean
  enableWasteTracking: boolean
  enableStockAdjustment: boolean
}

export interface LowStockProduct {
  id: number
  name: string
  sku: string
  current_stock: number
  min_stock_level: number
  category_name?: string
  image_path?: string
}

export interface InventoryStats {
  totalProducts: number
  lowStockCount: number
  outOfStockCount: number
  totalStockValue: number
  recentTransactions: number
  pendingAdjustments: number
}

// Define the store state interface
export interface InventoryState {
  // Data state
  transactions: StockTransaction[]
  adjustments: StockAdjustment[]
  lowStockProducts: LowStockProduct[]
  stats: InventoryStats | null
  settings: InventorySettings | null
  selectedTransaction: StockTransaction | null
  selectedAdjustment: StockAdjustment | null

  // UI state
  isLoading: boolean
  error: string | null
  viewMode: 'overview' | 'transactions' | 'adjustments' | 'reports'

  // Filter state
  transactionFilters: {
    search: string
    transactionType: string | null
    productId: number | null
    dateFrom: string | null
    dateTo: string | null
  }

  adjustmentFilters: {
    search: string
    isCompleted: boolean | null
    dateFrom: string | null
    dateTo: string | null
  }

  // Pagination state
  pagination: {
    skip: number
    limit: number
    total: number
  }

  // Actions - Transactions
  fetchTransactions: () => Promise<void>
  fetchTransaction: (id: number) => Promise<void>
  createTransaction: (data: Partial<StockTransaction>) => Promise<StockTransaction>
  setSelectedTransaction: (transaction: StockTransaction | null) => void

  // Actions - Adjustments
  fetchAdjustments: () => Promise<void>
  fetchAdjustment: (id: number) => Promise<void>
  createAdjustment: (data: Partial<StockAdjustment>) => Promise<StockAdjustment>
  updateAdjustment: (id: number, data: Partial<StockAdjustment>) => Promise<StockAdjustment>
  completeAdjustment: (id: number) => Promise<void>
  setSelectedAdjustment: (adjustment: StockAdjustment | null) => void

  // Actions - Low Stock
  fetchLowStockProducts: () => Promise<void>

  // Actions - Stats
  fetchStats: () => Promise<void>

  // Actions - Settings
  fetchSettings: () => Promise<void>

  // Actions - Filters
  setTransactionFilters: (filters: Partial<InventoryState['transactionFilters']>) => void
  clearTransactionFilters: () => void
  setAdjustmentFilters: (filters: Partial<InventoryState['adjustmentFilters']>) => void
  clearAdjustmentFilters: () => void

  // Actions - Pagination
  setPagination: (pagination: Partial<InventoryState['pagination']>) => void

  // Actions - View Mode
  setViewMode: (mode: InventoryState['viewMode']) => void

  // Actions - Reset
  reset: () => void
}

// Initial state
const initialState = {
  transactions: [],
  adjustments: [],
  lowStockProducts: [],
  stats: null,
  settings: null,
  selectedTransaction: null,
  selectedAdjustment: null,
  isLoading: false,
  error: null,
  viewMode: 'overview' as const,
  transactionFilters: {
    search: '',
    transactionType: null,
    productId: null,
    dateFrom: null,
    dateTo: null
  },
  adjustmentFilters: {
    search: '',
    isCompleted: null,
    dateFrom: null,
    dateTo: null
  },
  pagination: {
    skip: 0,
    limit: 50,
    total: 0
  }
}

// API Base URL
const API_BASE_URL = 'http://localhost:8000/api'

// Create the store with persistence for view mode
export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ============================================================================
      // Transaction Actions
      // ============================================================================

      fetchTransactions: async () => {
        set({ isLoading: true, error: null })

        try {
          const { transactionFilters, pagination } = get()

          const params = new URLSearchParams()
          params.append('skip', pagination.skip.toString())
          params.append('limit', pagination.limit.toString())

          if (transactionFilters.search) params.append('search', transactionFilters.search)
          if (transactionFilters.transactionType) params.append('transaction_type', transactionFilters.transactionType)
          if (transactionFilters.productId) params.append('product_id', transactionFilters.productId.toString())
          if (transactionFilters.dateFrom) params.append('date_from', transactionFilters.dateFrom)
          if (transactionFilters.dateTo) params.append('date_to', transactionFilters.dateTo)

          const response = await fetch(`${API_BASE_URL}/products/stock-transactions?${params}`)
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
            throw new Error(errorData.detail || `HTTP ${response.status}: Failed to fetch transactions`)
          }

          const transactions = await response.json()

          set({
            transactions,
            isLoading: false,
            pagination: { ...pagination, total: transactions.length }
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch transactions',
            isLoading: false
          })
        }
      },

      fetchTransaction: async (id: number) => {
        set({ isLoading: true, error: null })

        try {
          const response = await fetch(`${API_BASE_URL}/inventory/transactions/${id}`)
          if (!response.ok) throw new Error('Failed to fetch transaction')

          const transaction = await response.json()
          set({ selectedTransaction: transaction, isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch transaction',
            isLoading: false
          })
        }
      },

      createTransaction: async (data: Partial<StockTransaction>) => {
        set({ isLoading: true, error: null })

        try {
          const response = await fetch(`${API_BASE_URL}/inventory/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })

          if (!response.ok) throw new Error('Failed to create transaction')

          const transaction = await response.json()

          set((state) => ({
            transactions: [transaction, ...state.transactions],
            isLoading: false
          }))

          return transaction
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to create transaction',
            isLoading: false
          })
          throw error
        }
      },

      setSelectedTransaction: (transaction: StockTransaction | null) => {
        set({ selectedTransaction: transaction })
      },

      // ============================================================================
      // Adjustment Actions
      // ============================================================================

      fetchAdjustments: async () => {
        set({ isLoading: true, error: null })

        try {
          const { adjustmentFilters, pagination } = get()

          const params = new URLSearchParams()
          params.append('skip', pagination.skip.toString())
          params.append('limit', pagination.limit.toString())

          if (adjustmentFilters.search) params.append('search', adjustmentFilters.search)
          if (adjustmentFilters.isCompleted !== null) params.append('is_completed', adjustmentFilters.isCompleted.toString())
          if (adjustmentFilters.dateFrom) params.append('date_from', adjustmentFilters.dateFrom)
          if (adjustmentFilters.dateTo) params.append('date_to', adjustmentFilters.dateTo)

          const response = await fetch(`${API_BASE_URL}/inventory/adjustments?${params}`)
          if (!response.ok) throw new Error('Failed to fetch adjustments')

          const adjustments = await response.json()

          set({
            adjustments,
            isLoading: false,
            pagination: { ...pagination, total: adjustments.length }
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch adjustments',
            isLoading: false
          })
        }
      },

      fetchAdjustment: async (id: number) => {
        set({ isLoading: true, error: null })

        try {
          const response = await fetch(`${API_BASE_URL}/inventory/adjustments/${id}`)
          if (!response.ok) throw new Error('Failed to fetch adjustment')

          const adjustment = await response.json()
          set({ selectedAdjustment: adjustment, isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch adjustment',
            isLoading: false
          })
        }
      },

      createAdjustment: async (data: Partial<StockAdjustment>) => {
        set({ isLoading: true, error: null })

        try {
          const response = await fetch(`${API_BASE_URL}/inventory/adjustments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })

          if (!response.ok) throw new Error('Failed to create adjustment')

          const adjustment = await response.json()

          set((state) => ({
            adjustments: [adjustment, ...state.adjustments],
            isLoading: false
          }))

          return adjustment
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to create adjustment',
            isLoading: false
          })
          throw error
        }
      },

      updateAdjustment: async (id: number, data: Partial<StockAdjustment>) => {
        set({ isLoading: true, error: null })

        try {
          const response = await fetch(`${API_BASE_URL}/inventory/adjustments/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })

          if (!response.ok) throw new Error('Failed to update adjustment')

          const adjustment = await response.json()

          set((state) => ({
            adjustments: state.adjustments.map((a) => (a.id === id ? adjustment : a)),
            selectedAdjustment: state.selectedAdjustment?.id === id ? adjustment : state.selectedAdjustment,
            isLoading: false
          }))

          return adjustment
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update adjustment',
            isLoading: false
          })
          throw error
        }
      },

      completeAdjustment: async (id: number) => {
        set({ isLoading: true, error: null })

        try {
          const response = await fetch(`${API_BASE_URL}/inventory/adjustments/${id}/complete`, {
            method: 'POST'
          })

          if (!response.ok) throw new Error('Failed to complete adjustment')

          const adjustment = await response.json()

          set((state) => ({
            adjustments: state.adjustments.map((a) => (a.id === id ? adjustment : a)),
            selectedAdjustment: state.selectedAdjustment?.id === id ? adjustment : state.selectedAdjustment,
            isLoading: false
          }))
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to complete adjustment',
            isLoading: false
          })
          throw error
        }
      },

      setSelectedAdjustment: (adjustment: StockAdjustment | null) => {
        set({ selectedAdjustment: adjustment })
      },

      // ============================================================================
      // Low Stock Actions
      // ============================================================================

      fetchLowStockProducts: async () => {
        try {
          // Fetch products and filter for low stock
          const response = await fetch(`${API_BASE_URL}/products?is_active=true`)
          if (!response.ok) throw new Error('Failed to fetch products')

          const products = await response.json()
          const lowStockProducts = products
            .filter((p: any) => p.track_inventory && p.stock_quantity <= p.low_stock_threshold)
            .map((p: any) => ({
              id: p.id,
              name: p.name,
              sku: p.sku || '',
              current_stock: p.stock_quantity,
              min_stock_level: p.low_stock_threshold,
              category_name: p.category_name,
              image_path: p.image_paths?.[0]
            }))
          
          set({ lowStockProducts })
        } catch (error) {
          console.error('Failed to fetch low stock products:', error)
          set({ lowStockProducts: [] })
        }
      },

      // ============================================================================
      // Stats Actions
      // ============================================================================

      fetchStats: async () => {
        try {
          // Fetch products to calculate stats
          const productsResponse = await fetch(`${API_BASE_URL}/products?is_active=true`)
          if (!productsResponse.ok) throw new Error('Failed to fetch products')

          const products = await productsResponse.json()
          
          // Calculate stats from products
          const totalProducts = products.length
          const lowStockCount = products.filter((p: any) => 
            p.track_inventory && p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold
          ).length
          const outOfStockCount = products.filter((p: any) => 
            p.track_inventory && p.stock_quantity === 0
          ).length
          const totalStockValue = products.reduce((sum: number, p: any) => 
            sum + (p.stock_quantity * (p.cost_price || 0)), 0
          )

          // Fetch recent transactions count
          const transactionsResponse = await fetch(`${API_BASE_URL}/products/stock-transactions?limit=10`)
          const transactions = transactionsResponse.ok ? await transactionsResponse.json() : []
          
          const stats = {
            totalProducts,
            lowStockCount,
            outOfStockCount,
            totalStockValue,
            recentTransactions: transactions.length,
            pendingAdjustments: 0 // TODO: Implement when adjustments endpoint supports filtering
          }

          set({ stats })
        } catch (error) {
          console.error('Failed to fetch stats:', error)
          // Set default stats to prevent blank screen
          set({
            stats: {
              totalProducts: 0,
              lowStockCount: 0,
              outOfStockCount: 0,
              totalStockValue: 0,
              recentTransactions: 0,
              pendingAdjustments: 0
            }
          })
        }
      },

      // ============================================================================
      // Settings Actions
      // ============================================================================

      fetchSettings: async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/settings/inventory`)
          if (!response.ok) throw new Error('Failed to fetch settings')

          const settings = await response.json()
          set({ settings })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch settings'
          })
        }
      },

      // ============================================================================
      // Filter Actions
      // ============================================================================

      setTransactionFilters: (filters: Partial<InventoryState['transactionFilters']>) => {
        set((state) => ({
          transactionFilters: { ...state.transactionFilters, ...filters }
        }))
      },

      clearTransactionFilters: () => {
        set({
          transactionFilters: {
            search: '',
            transactionType: null,
            productId: null,
            dateFrom: null,
            dateTo: null
          }
        })
      },

      setAdjustmentFilters: (filters: Partial<InventoryState['adjustmentFilters']>) => {
        set((state) => ({
          adjustmentFilters: { ...state.adjustmentFilters, ...filters }
        }))
      },

      clearAdjustmentFilters: () => {
        set({
          adjustmentFilters: {
            search: '',
            isCompleted: null,
            dateFrom: null,
            dateTo: null
          }
        })
      },

      // ============================================================================
      // Pagination Actions
      // ============================================================================

      setPagination: (pagination: Partial<InventoryState['pagination']>) => {
        set((state) => ({
          pagination: { ...state.pagination, ...pagination }
        }))
      },

      // ============================================================================
      // View Mode Actions
      // ============================================================================

      setViewMode: (mode: InventoryState['viewMode']) => {
        set({ viewMode: mode })
      },

      // ============================================================================
      // Reset
      // ============================================================================

      reset: () => {
        set(initialState)
      }
    }),
    {
      name: 'inventory-storage',
      partialize: (state) => ({
        viewMode: state.viewMode
      })
    }
  )
)
