/**
 * Global Error Handler Store
 * Manages application-wide error display and handling
 */

import { create } from 'zustand'
import { formatErrorForDisplay } from '../utils/jsonrpc'

export interface ErrorDetails {
  title: string
  message: string
  code?: number
  stackTrace?: string
  details?: Record<string, unknown>
  timestamp: number
}

interface ErrorState {
  // Current error to display
  currentError: ErrorDetails | null
  
  // Error history (for debugging)
  errorHistory: ErrorDetails[]
  
  // Actions
  showError: (error: unknown) => void
  clearError: () => void
  clearHistory: () => void
}

export const useErrorStore = create<ErrorState>((set) => ({
  currentError: null,
  errorHistory: [],

  showError: (error: unknown) => {
    const errorDetails: ErrorDetails = {
      ...formatErrorForDisplay(error),
      timestamp: Date.now()
    }

    set((state) => ({
      currentError: errorDetails,
      errorHistory: [...state.errorHistory, errorDetails].slice(-50) // Keep last 50 errors
    }))
  },

  clearError: () => {
    set({ currentError: null })
  },

  clearHistory: () => {
    set({ errorHistory: [] })
  }
}))
