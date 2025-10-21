import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CustomerAddress } from '../types/restaurant'

/**
 * Address Store State
 */
export interface AddressState {
  addresses: CustomerAddress[]
  searchQuery: string
  
  // Actions - Address Management
  createAddress: (address: Omit<CustomerAddress, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateAddress: (id: string, updates: Partial<CustomerAddress>) => void
  deleteAddress: (id: string) => void
  setDefaultAddress: (id: string, customerId?: number) => void
  
  // Actions - Search & Filters
  setSearchQuery: (query: string) => void
  
  // Computed getters
  getAddress: (id: string) => CustomerAddress | undefined
  getAddressesByCustomer: (customerId: number) => CustomerAddress[]
  getDefaultAddress: (customerId?: number) => CustomerAddress | undefined
  getFilteredAddresses: () => CustomerAddress[]
  
  // Actions - Reset
  reset: () => void
}

// Helper function to generate unique IDs
const generateId = () => `addr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// Initial state
const initialState = {
  addresses: [],
  searchQuery: ''
}

/**
 * Address Store
 * Manages customer delivery addresses
 */
export const useAddressStore = create<AddressState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Address Management
      createAddress: (addressData) => {
        const now = new Date()
        const id = generateId()
        
        // If this is set as default, unset other defaults for this customer
        if (addressData.isDefault && addressData.customerId) {
          set(state => ({
            addresses: state.addresses.map(addr =>
              addr.customerId === addressData.customerId
                ? { ...addr, isDefault: false }
                : addr
            )
          }))
        }
        
        const newAddress: CustomerAddress = {
          ...addressData,
          id,
          createdAt: now,
          updatedAt: now
        }
        
        set(state => ({
          addresses: [...state.addresses, newAddress]
        }))
        
        return id
      },
      
      updateAddress: (id, updates) => {
        const address = get().getAddress(id)
        
        // If setting as default, unset other defaults for this customer
        if (updates.isDefault && address?.customerId) {
          set(state => ({
            addresses: state.addresses.map(addr =>
              addr.customerId === address.customerId && addr.id !== id
                ? { ...addr, isDefault: false }
                : addr
            )
          }))
        }
        
        set(state => ({
          addresses: state.addresses.map(addr =>
            addr.id === id
              ? { ...addr, ...updates, updatedAt: new Date() }
              : addr
          )
        }))
      },
      
      deleteAddress: (id) => {
        set(state => ({
          addresses: state.addresses.filter(addr => addr.id !== id)
        }))
      },
      
      setDefaultAddress: (id, customerId) => {
        const address = get().getAddress(id)
        const targetCustomerId = customerId || address?.customerId
        
        if (!targetCustomerId) return
        
        set(state => ({
          addresses: state.addresses.map(addr =>
            addr.customerId === targetCustomerId
              ? { ...addr, isDefault: addr.id === id, updatedAt: new Date() }
              : addr
          )
        }))
      },
      
      // Search & Filters
      setSearchQuery: (query) => {
        set({ searchQuery: query })
      },
      
      // Computed getters
      getAddress: (id) => {
        return get().addresses.find(addr => addr.id === id)
      },
      
      getAddressesByCustomer: (customerId) => {
        return get().addresses
          .filter(addr => addr.customerId === customerId)
          .sort((a, b) => {
            // Default address first
            if (a.isDefault && !b.isDefault) return -1
            if (!a.isDefault && b.isDefault) return 1
            // Then by most recently updated
            return b.updatedAt.getTime() - a.updatedAt.getTime()
          })
      },
      
      getDefaultAddress: (customerId) => {
        if (customerId) {
          return get().addresses.find(
            addr => addr.customerId === customerId && addr.isDefault
          )
        }
        // If no customerId, return any default address (for guest orders)
        return get().addresses.find(addr => addr.isDefault)
      },
      
      getFilteredAddresses: () => {
        const { addresses, searchQuery } = get()
        
        if (!searchQuery.trim()) {
          return addresses.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        }
        
        const query = searchQuery.toLowerCase()
        return addresses.filter(addr =>
          addr.customerName.toLowerCase().includes(query) ||
          addr.phone.toLowerCase().includes(query) ||
          addr.street.toLowerCase().includes(query) ||
          addr.city.toLowerCase().includes(query) ||
          addr.label.toLowerCase().includes(query) ||
          addr.email?.toLowerCase().includes(query)
        ).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      },
      
      // Reset
      reset: () => {
        set(initialState)
      }
    }),
    {
      name: 'address-storage',
      version: 1
    }
  )
)
