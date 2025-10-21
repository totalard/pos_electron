import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TableReservation } from '../types/restaurant'

/**
 * Reservation Store State
 */
export interface ReservationState {
  reservations: TableReservation[]
  selectedDate: Date | null
  viewMode: 'calendar' | 'list'
  filterStatus: 'all' | 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no-show'
  
  // Actions - Reservation Management
  createReservation: (reservation: Omit<TableReservation, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => string
  updateReservation: (id: string, updates: Partial<TableReservation>) => void
  deleteReservation: (id: string) => void
  confirmReservation: (id: string) => void
  cancelReservation: (id: string, reason?: string) => void
  markAsSeated: (id: string) => void
  markAsCompleted: (id: string) => void
  markAsNoShow: (id: string) => void
  
  // Actions - View & Filters
  setSelectedDate: (date: Date | null) => void
  setViewMode: (mode: 'calendar' | 'list') => void
  setFilterStatus: (status: ReservationState['filterStatus']) => void
  
  // Computed getters
  getReservation: (id: string) => TableReservation | undefined
  getReservationsByDate: (date: Date) => TableReservation[]
  getReservationsByTable: (tableId: string) => TableReservation[]
  getReservationsByStatus: (status: TableReservation['status']) => TableReservation[]
  getUpcomingReservations: () => TableReservation[]
  getTodayReservations: () => TableReservation[]
  
  // Actions - Reset
  reset: () => void
}

// Helper function to generate unique IDs
const generateId = () => `res-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// Helper function to check if two dates are on the same day
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

// Helper function to check if a date is today
const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date())
}

// Initial state
const initialState = {
  reservations: [],
  selectedDate: null,
  viewMode: 'calendar' as const,
  filterStatus: 'all' as const
}

/**
 * Reservation Store
 * Manages table reservations with calendar and list views
 */
export const useReservationStore = create<ReservationState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Reservation Management
      createReservation: (reservationData) => {
        const now = new Date()
        const id = generateId()
        const newReservation: TableReservation = {
          ...reservationData,
          id,
          status: 'pending',
          createdAt: now,
          updatedAt: now
        }
        
        set(state => ({
          reservations: [...state.reservations, newReservation]
        }))
        
        return id
      },
      
      updateReservation: (id, updates) => {
        set(state => ({
          reservations: state.reservations.map(res =>
            res.id === id
              ? { ...res, ...updates, updatedAt: new Date() }
              : res
          )
        }))
      },
      
      deleteReservation: (id) => {
        set(state => ({
          reservations: state.reservations.filter(res => res.id !== id)
        }))
      },
      
      confirmReservation: (id) => {
        get().updateReservation(id, { status: 'confirmed' })
      },
      
      cancelReservation: (id, reason) => {
        get().updateReservation(id, {
          status: 'cancelled',
          specialRequests: reason
            ? `${get().getReservation(id)?.specialRequests || ''}\nCancellation reason: ${reason}`.trim()
            : get().getReservation(id)?.specialRequests
        })
      },
      
      markAsSeated: (id) => {
        get().updateReservation(id, { status: 'seated' })
      },
      
      markAsCompleted: (id) => {
        get().updateReservation(id, { status: 'completed' })
      },
      
      markAsNoShow: (id) => {
        get().updateReservation(id, { status: 'no-show' })
      },
      
      // View & Filters
      setSelectedDate: (date) => {
        set({ selectedDate: date })
      },
      
      setViewMode: (mode) => {
        set({ viewMode: mode })
      },
      
      setFilterStatus: (status) => {
        set({ filterStatus: status })
      },
      
      // Computed getters
      getReservation: (id) => {
        return get().reservations.find(res => res.id === id)
      },
      
      getReservationsByDate: (date) => {
        return get().reservations.filter(res =>
          isSameDay(res.reservationDate, date)
        ).sort((a, b) => a.reservationTime.localeCompare(b.reservationTime))
      },
      
      getReservationsByTable: (tableId) => {
        return get().reservations.filter(res =>
          res.tableId === tableId && res.status !== 'completed' && res.status !== 'cancelled'
        ).sort((a, b) => a.reservationDate.getTime() - b.reservationDate.getTime())
      },
      
      getReservationsByStatus: (status) => {
        return get().reservations.filter(res => res.status === status)
          .sort((a, b) => a.reservationDate.getTime() - b.reservationDate.getTime())
      },
      
      getUpcomingReservations: () => {
        const now = new Date()
        return get().reservations.filter(res => {
          const resDate = new Date(res.reservationDate)
          return resDate >= now && (res.status === 'pending' || res.status === 'confirmed')
        }).sort((a, b) => a.reservationDate.getTime() - b.reservationDate.getTime())
      },
      
      getTodayReservations: () => {
        return get().reservations.filter(res =>
          isToday(res.reservationDate)
        ).sort((a, b) => a.reservationTime.localeCompare(b.reservationTime))
      },
      
      // Reset
      reset: () => {
        set(initialState)
      }
    }),
    {
      name: 'reservation-storage',
      version: 1
    }
  )
)
