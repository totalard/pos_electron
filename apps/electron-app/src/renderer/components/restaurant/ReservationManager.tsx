import { useState } from 'react'
import { useAppStore, useReservationStore, useSettingsStore } from '../../stores'
import { Modal, Button } from '../common'
import { ReservationCalendar } from './ReservationCalendar'
import { ReservationForm } from './ReservationForm'
import type { TableReservation } from '../../types/restaurant'

interface ReservationManagerProps {
  isOpen: boolean
  onClose: () => void
}

export function ReservationManager({ isOpen, onClose }: ReservationManagerProps) {
  const { theme } = useAppStore()
  const { restaurant } = useSettingsStore()
  const {
    reservations,
    filterStatus,
    setFilterStatus,
    confirmReservation,
    cancelReservation,
    markAsSeated,
    markAsCompleted,
    markAsNoShow,
    deleteReservation,
    getUpcomingReservations,
    getTodayReservations
  } = useReservationStore()

  const [showCalendar, setShowCalendar] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingReservation, setEditingReservation] = useState<TableReservation | null>(null)
  const [viewMode, setViewMode] = useState<'upcoming' | 'today' | 'all'>('upcoming')

  const getFilteredReservations = () => {
    let filtered: TableReservation[] = []
    
    switch (viewMode) {
      case 'upcoming':
        filtered = getUpcomingReservations()
        break
      case 'today':
        filtered = getTodayReservations()
        break
      case 'all':
        filtered = [...reservations].sort((a, b) => 
          new Date(b.reservationDate).getTime() - new Date(a.reservationDate).getTime()
        )
        break
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(res => res.status === filterStatus)
    }

    return filtered
  }

  const filteredReservations = getFilteredReservations()

  const handleAddReservation = () => {
    setEditingReservation(null)
    setShowForm(true)
  }

  const handleEditReservation = (reservation: TableReservation) => {
    setEditingReservation(reservation)
    setShowForm(true)
  }

  const handleConfirm = (id: string) => {
    if (confirm('Confirm this reservation?')) {
      confirmReservation(id)
    }
  }

  const handleCancel = (id: string) => {
    const reason = prompt('Cancellation reason (optional):')
    if (reason !== null) {
      cancelReservation(id, reason || undefined)
    }
  }

  const handleSeated = (id: string) => {
    markAsSeated(id)
  }

  const handleCompleted = (id: string) => {
    markAsCompleted(id)
  }

  const handleNoShow = (id: string) => {
    if (confirm('Mark this reservation as no-show?')) {
      markAsNoShow(id)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this reservation? This action cannot be undone.')) {
      deleteReservation(id)
    }
  }

  const getStatusColor = (status: TableReservation['status']) => {
    switch (status) {
      case 'pending':
        return theme === 'dark' ? 'bg-yellow-600/20 text-yellow-400 border-yellow-600' : 'bg-yellow-50 text-yellow-700 border-yellow-300'
      case 'confirmed':
        return theme === 'dark' ? 'bg-green-600/20 text-green-400 border-green-600' : 'bg-green-50 text-green-700 border-green-300'
      case 'seated':
        return theme === 'dark' ? 'bg-blue-600/20 text-blue-400 border-blue-600' : 'bg-blue-50 text-blue-700 border-blue-300'
      case 'completed':
        return theme === 'dark' ? 'bg-gray-600/20 text-gray-400 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-300'
      case 'cancelled':
        return theme === 'dark' ? 'bg-red-600/20 text-red-400 border-red-600' : 'bg-red-50 text-red-700 border-red-300'
      case 'no-show':
        return theme === 'dark' ? 'bg-orange-600/20 text-orange-400 border-orange-600' : 'bg-orange-50 text-orange-700 border-orange-300'
      default:
        return theme === 'dark' ? 'bg-gray-600/20 text-gray-400 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-300'
    }
  }

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getTableName = (tableId: string): string => {
    const table = restaurant.tables.find(t => t.id === tableId)
    return table?.name || 'Unknown Table'
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Reservation Manager" size="2xl">
        <div className="space-y-4">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleAddReservation}
              variant="primary"
              className="flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Reservation
            </Button>
            
            <Button
              onClick={() => setShowCalendar(true)}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Calendar View
            </Button>
          </div>

          {/* View Mode Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { value: 'upcoming', label: 'Upcoming' },
              { value: 'today', label: 'Today' },
              { value: 'all', label: 'All' }
            ].map(mode => (
              <button
                key={mode.value}
                onClick={() => setViewMode(mode.value as any)}
                className={`
                  px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors
                  ${viewMode === mode.value
                    ? theme === 'dark'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500 text-white'
                    : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }
                `}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {/* Status Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { value: 'all', label: 'All Status' },
              { value: 'pending', label: 'Pending' },
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'seated', label: 'Seated' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
              { value: 'no-show', label: 'No Show' }
            ].map(status => (
              <button
                key={status.value}
                onClick={() => setFilterStatus(status.value as any)}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                  ${filterStatus === status.value
                    ? theme === 'dark'
                      ? 'bg-gray-600 text-white'
                      : 'bg-gray-300 text-gray-900'
                    : theme === 'dark'
                      ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {status.label}
              </button>
            ))}
          </div>

          {/* Reservations List */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredReservations.length > 0 ? (
              filteredReservations.map(reservation => (
                <div
                  key={reservation.id}
                  className={`
                    p-4 rounded-lg border-2
                    ${getStatusColor(reservation.status)}
                  `}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-lg">
                          {formatDate(reservation.reservationDate)} - {formatTime(reservation.reservationTime)}
                        </span>
                        <span className={`
                          px-2 py-0.5 rounded text-xs font-medium uppercase
                          ${getStatusColor(reservation.status)}
                        `}>
                          {reservation.status}
                        </span>
                      </div>

                      {/* Customer Info */}
                      <div className="space-y-1 mb-3">
                        <p className="font-semibold text-base">{reservation.customerName}</p>
                        <div className="flex flex-wrap gap-4 text-sm opacity-90">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {reservation.customerPhone}
                          </span>
                          {reservation.customerEmail && (
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {reservation.customerEmail}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm opacity-90">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {reservation.guestCount} {reservation.guestCount === 1 ? 'guest' : 'guests'}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Table: {getTableName(reservation.tableId)}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {reservation.duration} min
                          </span>
                        </div>
                      </div>

                      {/* Special Requests */}
                      {reservation.specialRequests && (
                        <div className={`
                          p-2 rounded text-sm mt-2
                          ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'}
                        `}>
                          <span className="font-medium">Special Requests: </span>
                          {reservation.specialRequests}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-1">
                      {reservation.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleConfirm(reservation.id)}
                            className={`
                              p-2 rounded transition-colors
                              ${theme === 'dark'
                                ? 'hover:bg-green-600/30 text-green-400'
                                : 'hover:bg-green-100 text-green-700'
                              }
                            `}
                            title="Confirm"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleCancel(reservation.id)}
                            className={`
                              p-2 rounded transition-colors
                              ${theme === 'dark'
                                ? 'hover:bg-red-600/30 text-red-400'
                                : 'hover:bg-red-100 text-red-700'
                              }
                            `}
                            title="Cancel"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </>
                      )}
                      
                      {reservation.status === 'confirmed' && (
                        <>
                          <button
                            onClick={() => handleSeated(reservation.id)}
                            className={`
                              p-2 rounded transition-colors
                              ${theme === 'dark'
                                ? 'hover:bg-blue-600/30 text-blue-400'
                                : 'hover:bg-blue-100 text-blue-700'
                              }
                            `}
                            title="Mark as Seated"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleNoShow(reservation.id)}
                            className={`
                              p-2 rounded transition-colors
                              ${theme === 'dark'
                                ? 'hover:bg-orange-600/30 text-orange-400'
                                : 'hover:bg-orange-100 text-orange-700'
                              }
                            `}
                            title="Mark as No Show"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        </>
                      )}
                      
                      {reservation.status === 'seated' && (
                        <button
                          onClick={() => handleCompleted(reservation.id)}
                          className={`
                            p-2 rounded transition-colors
                            ${theme === 'dark'
                              ? 'hover:bg-gray-600/30 text-gray-400'
                              : 'hover:bg-gray-100 text-gray-700'
                            }
                          `}
                          title="Mark as Completed"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      )}

                      <button
                        onClick={() => handleEditReservation(reservation)}
                        className={`
                          p-2 rounded transition-colors
                          ${theme === 'dark'
                            ? 'hover:bg-gray-600/30 text-gray-400'
                            : 'hover:bg-gray-100 text-gray-700'
                          }
                        `}
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      <button
                        onClick={() => handleDelete(reservation.id)}
                        className={`
                          p-2 rounded transition-colors
                          ${theme === 'dark'
                            ? 'hover:bg-red-600/30 text-red-400'
                            : 'hover:bg-red-100 text-red-700'
                          }
                        `}
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={`
                text-center py-12
                ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}
              `}>
                <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-medium">No reservations found</p>
                <p className="text-xs mt-1">Create a new reservation to get started</p>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Calendar Dialog */}
      <ReservationCalendar
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        onSelectReservation={(reservation) => {
          setShowCalendar(false)
          handleEditReservation(reservation)
        }}
      />

      {/* Reservation Form Dialog */}
      <ReservationForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false)
          setEditingReservation(null)
        }}
        reservation={editingReservation}
      />
    </>
  )
}
