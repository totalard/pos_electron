import { create } from 'zustand'
import { authAPI, type User } from '../services/api'

// Define the PIN store state interface
export interface PinState {
  // PIN state
  pin: string
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  attempts: number
  maxAttempts: number

  // User state
  currentUser: User | null

  // UI state
  showPin: boolean

  // Actions
  addDigit: (_digit: string) => void
  removeDigit: () => void
  clearPin: () => void
  submitPin: () => Promise<void>
  toggleShowPin: () => void
  reset: () => void
  initializeSystem: () => Promise<void>
}

// Configuration
const MAX_ATTEMPTS = 5
const MAX_PIN_LENGTH = 6

// Initial state
const initialState = {
  pin: '',
  isAuthenticated: false,
  isLoading: false,
  error: null,
  attempts: 0,
  maxAttempts: MAX_ATTEMPTS,
  currentUser: null,
  showPin: false
}

// Create the PIN store
export const usePinStore = create<PinState>((set, get) => ({
  ...initialState,
  
  addDigit: (digit: string) => {
    const { pin, isLoading, isAuthenticated } = get()
    
    // Don't allow input if loading or already authenticated
    if (isLoading || isAuthenticated) return
    
    // Don't allow more digits than max length
    if (pin.length >= MAX_PIN_LENGTH) return
    
    // Only allow numeric digits
    if (!/^\d$/.test(digit)) return
    
    set({ 
      pin: pin + digit,
      error: null // Clear any previous error
    })
  },
  
  removeDigit: () => {
    const { pin, isLoading, isAuthenticated } = get()
    
    // Don't allow input if loading or already authenticated
    if (isLoading || isAuthenticated) return
    
    set({ 
      pin: pin.slice(0, -1),
      error: null // Clear any previous error
    })
  },
  
  clearPin: () => {
    const { isLoading, isAuthenticated } = get()
    
    // Don't allow clearing if loading or already authenticated
    if (isLoading || isAuthenticated) return
    
    set({ 
      pin: '',
      error: null
    })
  },
  
  submitPin: async () => {
    const { pin, attempts, maxAttempts } = get()

    // Don't submit if PIN is empty
    if (!pin) {
      set({ error: 'Please enter a 6-digit PIN' })
      return
    }

    // Validate PIN is exactly 6 digits
    if (pin.length !== 6) {
      set({ error: 'PIN must be exactly 6 digits' })
      return
    }

    // Check if max attempts reached
    if (attempts >= maxAttempts) {
      set({ error: 'Maximum attempts reached. Please restart the application.' })
      return
    }

    set({ isLoading: true, error: null })

    try {
      // Call backend API for authentication
      const response = await authAPI.login({ pin })

      if (response.success && response.user) {
        set({
          isAuthenticated: true,
          isLoading: false,
          error: null,
          currentUser: response.user,
          pin: '' // Clear PIN after successful login
        })
      } else {
        const newAttempts = attempts + 1
        const remainingAttempts = maxAttempts - newAttempts

        set({
          isLoading: false,
          attempts: newAttempts,
          pin: '', // Clear PIN on failed attempt
          error: remainingAttempts > 0
            ? `Incorrect PIN. ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining.`
            : 'Maximum attempts reached. Please restart the application.'
        })
      }
    } catch (error) {
      const newAttempts = attempts + 1
      const remainingAttempts = maxAttempts - newAttempts

      set({
        isLoading: false,
        attempts: newAttempts,
        pin: '',
        error: remainingAttempts > 0
          ? `Incorrect PIN. ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining.`
          : 'Maximum attempts reached. Please restart the application.'
      })
    }
  },
  
  toggleShowPin: () => {
    set(state => ({ showPin: !state.showPin }))
  },

  reset: () => {
    set(initialState)
  },

  initializeSystem: async () => {
    set({ isLoading: true, error: null })

    try {
      // Try to get all users to check if system is initialized
      const users = await authAPI.getAllUsers()

      if (users.length === 0) {
        // No users exist, initialize primary user
        await authAPI.initializePrimaryUser()
        set({
          isLoading: false,
          error: null
        })
      } else {
        // System already initialized
        set({ isLoading: false })
      }
    } catch (error) {
      // If error is 404, try to initialize
      try {
        await authAPI.initializePrimaryUser()
        set({
          isLoading: false,
          error: null
        })
      } catch (initError) {
        set({
          isLoading: false,
          error: 'Failed to initialize system. Please check backend connection.'
        })
      }
    }
  }
}))

// Helper function to get PIN display (dots or actual digits)
export const getPinDisplay = (pin: string, showPin: boolean): string => {
  if (showPin) return pin
  return '•'.repeat(pin.length)
}

// Helper function to check if PIN is complete (for auto-submit)
export const isPinComplete = (pin: string): boolean => {
  return pin.length === 6 // Exactly 6 digits required for auto-submit
}
