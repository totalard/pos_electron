import { create } from 'zustand'

// Define the PIN store state interface
export interface PinState {
  // PIN state
  pin: string
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  attempts: number
  maxAttempts: number
  
  // UI state
  showPin: boolean
  
  // Actions
  addDigit: (_digit: string) => void
  removeDigit: () => void
  clearPin: () => void
  submitPin: () => Promise<void>
  toggleShowPin: () => void
  reset: () => void
}

// Configuration
const CORRECT_PIN = '1234' // In production, this should be configurable/encrypted
const MAX_ATTEMPTS = 3
const MAX_PIN_LENGTH = 6

// Initial state
const initialState = {
  pin: '',
  isAuthenticated: false,
  isLoading: false,
  error: null,
  attempts: 0,
  maxAttempts: MAX_ATTEMPTS,
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
      set({ error: 'Please enter a PIN' })
      return
    }
    
    // Check if max attempts reached
    if (attempts >= maxAttempts) {
      set({ error: 'Maximum attempts reached. Please restart the application.' })
      return
    }
    
    set({ isLoading: true, error: null })
    
    try {
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (pin === CORRECT_PIN) {
        set({ 
          isAuthenticated: true,
          isLoading: false,
          error: null
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
    } catch {
      set({
        isLoading: false,
        error: 'Authentication failed. Please try again.'
      })
    }
  },
  
  toggleShowPin: () => {
    set(state => ({ showPin: !state.showPin }))
  },
  
  reset: () => {
    set(initialState)
  }
}))

// Helper function to get PIN display (dots or actual digits)
export const getPinDisplay = (pin: string, showPin: boolean): string => {
  if (showPin) return pin
  return '•'.repeat(pin.length)
}

// Helper function to check if PIN is complete (for auto-submit)
export const isPinComplete = (pin: string): boolean => {
  return pin.length >= 4 // Minimum PIN length for auto-submit
}
