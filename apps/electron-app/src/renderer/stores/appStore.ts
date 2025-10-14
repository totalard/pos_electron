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
  setLoading: (loading: boolean) => void
  setCurrentUser: (user: string | null) => void
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark') => void
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
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setCurrentUser: (user) => set({ currentUser: user }),
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  setTheme: (theme) => set({ theme }),
  
  reset: () => set(initialState)
}))

