import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Customer,
  CustomerCreate,
  CustomerUpdate,
  CustomerTransaction,
  CustomerCreditOperation,
  CustomerLoyaltyOperation,
  CustomerStatementRequest,
  CustomerStatementResponse
} from '../services/api'
import { customerAPI } from '../services/api'

// ============================================================================
// Types
// ============================================================================

interface CustomerFilters {
  search: string
  creditStatus: string | null
  hasCredit: boolean | null
}

interface CustomerPagination {
  skip: number
  limit: number
  total: number
}

export interface CustomerState {
  // Data
  customers: Customer[]
  selectedCustomer: Customer | null
  transactions: CustomerTransaction[]

  // UI State
  isLoading: boolean
  error: string | null
  viewMode: 'tile' | 'grid'

  // Filters & Pagination
  filters: CustomerFilters
  pagination: CustomerPagination

  // Actions - Customer CRUD
  fetchCustomers: () => Promise<void>
  fetchCustomer: (id: number) => Promise<void>
  createCustomer: (data: CustomerCreate) => Promise<Customer | null>
  updateCustomer: (id: number, data: CustomerUpdate) => Promise<Customer | null>
  deleteCustomer: (id: number) => Promise<boolean>

  // Actions - Credit Management
  addCredit: (customerId: number, operation: CustomerCreditOperation) => Promise<Customer | null>
  recordPayment: (customerId: number, operation: CustomerCreditOperation) => Promise<Customer | null>
  updateCreditLimit: (customerId: number, limit: number) => Promise<Customer | null>

  // Actions - Loyalty Management
  adjustLoyaltyPoints: (customerId: number, operation: CustomerLoyaltyOperation) => Promise<Customer | null>

  // Actions - Transactions
  fetchCustomerTransactions: (customerId: number) => Promise<void>
  generateStatement: (customerId: number, request: CustomerStatementRequest) => Promise<CustomerStatementResponse | null>

  // Actions - UI
  setSelectedCustomer: (customer: Customer | null) => void
  setViewMode: (mode: 'tile' | 'grid') => void
  setFilters: (filters: Partial<CustomerFilters>) => void
  clearFilters: () => void

  // Reset
  reset: () => void
}

// Initial state
const initialState = {
  customers: [],
  selectedCustomer: null,
  transactions: [],
  isLoading: false,
  error: null,
  viewMode: 'tile' as const,
  filters: {
    search: '',
    creditStatus: null,
    hasCredit: null
  },
  pagination: {
    skip: 0,
    limit: 100,
    total: 0
  }
}

// ============================================================================
// Store
// ============================================================================

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // ========================================================================
      // Customer CRUD Actions
      // ========================================================================
      
      fetchCustomers: async () => {
        set({ isLoading: true, error: null })
        try {
          const { filters, pagination } = get()
          const customers = await customerAPI.getAllCustomers({
            skip: pagination.skip,
            limit: pagination.limit,
            search: filters.search || undefined
          })
          
          set({ 
            customers,
            isLoading: false,
            pagination: { ...pagination, total: customers.length }
          })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch customers'
          set({ error: errorMessage, isLoading: false })
        }
      },
      
      fetchCustomer: async (id: number) => {
        set({ isLoading: true, error: null })
        try {
          const customer = await customerAPI.getCustomer(id)
          set({ selectedCustomer: customer, isLoading: false })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch customer'
          set({ error: errorMessage, isLoading: false })
        }
      },
      
      createCustomer: async (data: CustomerCreate) => {
        set({ isLoading: true, error: null })
        try {
          const customer = await customerAPI.createCustomer(data)
          set(state => ({
            customers: [...state.customers, customer],
            isLoading: false
          }))
          return customer
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create customer'
          set({ error: errorMessage, isLoading: false })
          return null
        }
      },
      
      updateCustomer: async (id: number, data: CustomerUpdate) => {
        set({ isLoading: true, error: null })
        try {
          const customer = await customerAPI.updateCustomer(id, data)
          set(state => ({
            customers: state.customers.map(c => c.id === id ? customer : c),
            selectedCustomer: state.selectedCustomer?.id === id ? customer : state.selectedCustomer,
            isLoading: false
          }))
          return customer
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update customer'
          set({ error: errorMessage, isLoading: false })
          return null
        }
      },
      
      deleteCustomer: async (id: number) => {
        set({ isLoading: true, error: null })
        try {
          await customerAPI.deleteCustomer(id)
          set(state => ({
            customers: state.customers.filter(c => c.id !== id),
            selectedCustomer: state.selectedCustomer?.id === id ? null : state.selectedCustomer,
            isLoading: false
          }))
          return true
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete customer'
          set({ error: errorMessage, isLoading: false })
          return false
        }
      },
      
      // ========================================================================
      // Credit Management Actions
      // ========================================================================
      
      addCredit: async (customerId: number, operation: CustomerCreditOperation) => {
        set({ isLoading: true, error: null })
        try {
          const customer = await customerAPI.addCredit(customerId, operation)
          set(state => ({
            customers: state.customers.map(c => c.id === customerId ? customer : c),
            selectedCustomer: state.selectedCustomer?.id === customerId ? customer : state.selectedCustomer,
            isLoading: false
          }))
          return customer
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to add credit'
          set({ error: errorMessage, isLoading: false })
          return null
        }
      },
      
      recordPayment: async (customerId: number, operation: CustomerCreditOperation) => {
        set({ isLoading: true, error: null })
        try {
          const customer = await customerAPI.recordPayment(customerId, operation)
          set(state => ({
            customers: state.customers.map(c => c.id === customerId ? customer : c),
            selectedCustomer: state.selectedCustomer?.id === customerId ? customer : state.selectedCustomer,
            isLoading: false
          }))
          return customer
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to record payment'
          set({ error: errorMessage, isLoading: false })
          return null
        }
      },
      
      updateCreditLimit: async (customerId: number, limit: number) => {
        set({ isLoading: true, error: null })
        try {
          const customer = await customerAPI.updateCreditLimit(customerId, limit)
          set(state => ({
            customers: state.customers.map(c => c.id === customerId ? customer : c),
            selectedCustomer: state.selectedCustomer?.id === customerId ? customer : state.selectedCustomer,
            isLoading: false
          }))
          return customer
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update credit limit'
          set({ error: errorMessage, isLoading: false })
          return null
        }
      },
      
      // ========================================================================
      // Loyalty Management Actions
      // ========================================================================
      
      adjustLoyaltyPoints: async (customerId: number, operation: CustomerLoyaltyOperation) => {
        set({ isLoading: true, error: null })
        try {
          const customer = await customerAPI.adjustLoyaltyPoints(customerId, operation)
          set(state => ({
            customers: state.customers.map(c => c.id === customerId ? customer : c),
            selectedCustomer: state.selectedCustomer?.id === customerId ? customer : state.selectedCustomer,
            isLoading: false
          }))
          return customer
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to adjust loyalty points'
          set({ error: errorMessage, isLoading: false })
          return null
        }
      },
      
      // ========================================================================
      // Transaction Actions
      // ========================================================================
      
      fetchCustomerTransactions: async (customerId: number) => {
        set({ isLoading: true, error: null })
        try {
          const transactions = await customerAPI.getCustomerTransactions(customerId)
          set({ transactions, isLoading: false })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch transactions'
          set({ error: errorMessage, isLoading: false })
        }
      },

      generateStatement: async (customerId: number, request: CustomerStatementRequest) => {
        set({ isLoading: true, error: null })
        try {
          const statement = await customerAPI.generateStatement(customerId, request)
          set({ isLoading: false })
          return statement
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to generate statement'
          set({ error: errorMessage, isLoading: false })
          return null
        }
      },
      
      // ========================================================================
      // UI Actions
      // ========================================================================
      
      setSelectedCustomer: (customer: Customer | null) => {
        set({ selectedCustomer: customer })
      },
      
      setViewMode: (mode: 'tile' | 'grid') => {
        set({ viewMode: mode })
      },
      
      setFilters: (filters: Partial<CustomerFilters>) => {
        set(state => ({
          filters: { ...state.filters, ...filters }
        }))
      },
      
      clearFilters: () => {
        set({
          filters: {
            search: '',
            creditStatus: null,
            hasCredit: null
          }
        })
      },
      
      // ========================================================================
      // Reset
      // ========================================================================
      
      reset: () => set(initialState)
    }),
    {
      name: 'customer-storage',
      partialize: (state) => ({
        viewMode: state.viewMode
      })
    }
  )
)

