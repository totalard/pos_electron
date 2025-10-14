import { create } from 'zustand'

// Define the store state interface
export interface AppState {
  // Application state
  isLoading: boolean
  currentUser: string | null
  
  // UI state
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  
  // Actions
  setLoading: (_loading: boolean) => void
  setCurrentUser: (_user: string | null) => void
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

// Create the store
export const useAppStore = create<AppState>((set) => ({
  ...initialState,
  
  setLoading: (loading: boolean) => set({ isLoading: loading }),

  setCurrentUser: (user: string | null) => set({ currentUser: user }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setTheme: (theme: 'light' | 'dark') => set({ theme }),
  
  reset: () => set(initialState)
}))

