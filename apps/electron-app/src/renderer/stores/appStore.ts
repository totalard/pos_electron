import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../services/api'

// Define the store state interface
export interface AppState {
  // Application state
  isLoading: boolean
  currentUser: User | null

  // UI state
  sidebarOpen: boolean
  theme: 'light' | 'dark'

  // Actions
  setLoading: (_loading: boolean) => void
  setCurrentUser: (_user: User | null) => void
  toggleSidebar: () => void
  setTheme: (_theme: 'light' | 'dark') => void
  reset: () => void
}

// Initial state
const initialState = {
  isLoading: false,
  currentUser: null,
  sidebarOpen: true,
  theme: 'light' as const
}

// Create the store with persistence
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      setCurrentUser: (user: User | null) => set({ currentUser: user }),

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setTheme: (theme: 'light' | 'dark') => set({ theme }),

      reset: () => set(initialState)
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen
      })
    }
  )
)

