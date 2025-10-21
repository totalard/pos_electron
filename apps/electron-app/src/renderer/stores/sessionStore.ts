import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { POSSession } from '../services/api'

/**
 * Session Store State
 */
export interface SessionState {
  // Active session
  activeSession: POSSession | null
  
  // Actions
  setActiveSession: (session: POSSession | null) => void
  clearSession: () => void
  updateSessionTotals: (totals: {
    total_sales?: number
    total_cash_in?: number
    total_cash_out?: number
  }) => void
  
  // Computed getters
  hasActiveSession: () => boolean
  getSessionId: () => number | null
}

/**
 * Session Store
 * Manages active POS session state
 */
export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      activeSession: null,
      
      setActiveSession: (session: POSSession | null) => {
        set({ activeSession: session })
      },
      
      clearSession: () => {
        set({ activeSession: null })
      },
      
      updateSessionTotals: (totals) => {
        const { activeSession } = get()
        if (!activeSession) return
        
        set({
          activeSession: {
            ...activeSession,
            total_sales: totals.total_sales ?? activeSession.total_sales,
            total_cash_in: totals.total_cash_in ?? activeSession.total_cash_in,
            total_cash_out: totals.total_cash_out ?? activeSession.total_cash_out
          }
        })
      },
      
      hasActiveSession: () => {
        return get().activeSession !== null && get().activeSession?.status === 'active'
      },
      
      getSessionId: () => {
        return get().activeSession?.id ?? null
      }
    }),
    {
      name: 'session-storage',
      partialize: (state) => ({
        activeSession: state.activeSession
      })
    }
  )
)
