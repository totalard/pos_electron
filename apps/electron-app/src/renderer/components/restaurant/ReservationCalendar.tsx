import { useState, useMemo } from 'react'
import { useAppStore, useReservationStore } from '../../stores'
import { Modal } from '../common'
import type { TableReservation } from '../../types/restaurant'

interface ReservationCalendarProps {
  isOpen: boolean
  onClose: () => void
  onSelectReservation?: (reservation: TableReservation) => void
}

export function ReservationCalendar({ isOpen, onClose, onSelectReservation }: ReservationCalendarProps) {
  const { theme } = useAppStore()
  const { reservations, selectedDate, setSelectedDate, getReservationsByDate } = useReservationStore()
  
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'day'>('month')

  // Calendar calculations
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
  const startDate = new Date(monthStart)
  startDate.setDate(startDate.getDate() - startDate.getDay()) // Start from Sunday
  
  const endDate = new Date(monthEnd)
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay())) // End on Saturday

  const calendarDays = useMemo(() => {
    const days: Date[] = []
    const current = new Date(startDate)
    
    while (current <= endDate) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }, [startDate, endDate])

  const getReservationCountForDate = (date: Date): number => {
    return reservations.filter(res => {
      const resDate = new Date(res.reservationDate)
      return (
        resDate.getFullYear() === date.getFullYear() &&
        resDate.getMonth() === date.getMonth() &&
        resDate.getDate() === date.getDate()
      )
    }).length
  }

  const isToday = (date: Date): boolean => {
    const today = new Date()
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    )
  }

  const isSelectedDate = (date: Date): boolean => {
    if (!selectedDate) return false
    return (
      date.getFullYear() === selectedDate.getFullYear() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getDate() === selectedDate.getDate()
    )
  }

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentMonth.getMonth()
  }

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const handleToday = () => {
    const today = new Date()
    setCurrentMonth(today)
    setSelectedDate(today)
    setViewMode('day')
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setViewMode('day')
  }

  const handleReservationClick = (reservation: TableReservation) => {
    if (onSelectReservation) {
      onSelectReservation(reservation)
      onClose()
    }
  }

  const formatMonthYear = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const formatTime = (time: string): string => {
    // Assuming time is in HH:MM format
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
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

  const dayReservations = selectedDate ? getReservationsByDate(selectedDate) : []

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reservation Calendar" size="2xl">
      <div className="space-y-4">
        {/* View Mode Toggle */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('month')}
              className={`
                px-4 py-2 rounded-lg font-medium transition-colors
                ${viewMode === 'month'
                  ? theme === 'dark'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-500 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }
              `}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`
                px-4 py-2 rounded-lg font-medium transition-colors
                ${viewMode === 'day'
                  ? theme === 'dark'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-500 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }
              `}
            >
              Day
            </button>
          </div>
          
          <button
            onClick={handleToday}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors
              ${theme === 'dark'
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }
            `}
          >
            Today
          </button>
        </div>

        {/* Month View */}
        {viewMode === 'month' && (
          <div className="space-y-4">
            {/* Month Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePreviousMonth}
                className={`
                  p-2 rounded-lg transition-colors
                  ${theme === 'dark'
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-200 text-gray-700'
                  }
                `}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatMonthYear(currentMonth)}
              </h3>
              
              <button
                onClick={handleNextMonth}
                className={`
                  p-2 rounded-lg transition-colors
                  ${theme === 'dark'
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-200 text-gray-700'
                  }
                `}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div
                  key={day}
                  className={`
                    text-center text-xs font-semibold py-2
                    ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                  `}
                >
                  {day}
                </div>
              ))}
              
              {/* Calendar Days */}
              {calendarDays.map((date, index) => {
                const count = getReservationCountForDate(date)
                const isTodayDate = isToday(date)
                const isSelected = isSelectedDate(date)
                const isInCurrentMonth = isCurrentMonth(date)
                
                return (
                  <button
                    key={index}
                    onClick={() => handleDateClick(date)}
                    className={`
                      aspect-square p-2 rounded-lg transition-all relative
                      ${isSelected
                        ? theme === 'dark'
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-500 text-white'
                        : isTodayDate
                          ? theme === 'dark'
                            ? 'bg-blue-600/20 text-blue-400 border-2 border-blue-600'
                            : 'bg-blue-50 text-blue-700 border-2 border-blue-500'
                          : theme === 'dark'
                            ? 'hover:bg-gray-700 text-gray-300'
                            : 'hover:bg-gray-100 text-gray-700'
                      }
                      ${!isInCurrentMonth && 'opacity-40'}
                    `}
                  >
                    <div className="text-sm font-medium">{date.getDate()}</div>
                    {count > 0 && (
                      <div className={`
                        absolute bottom-1 left-1/2 transform -translate-x-1/2
                        w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold
                        ${isSelected
                          ? 'bg-white text-blue-600'
                          : theme === 'dark'
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-500 text-white'
                        }
                      `}>
                        {count}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Day View */}
        {viewMode === 'day' && (
          <div className="space-y-4">
            {/* Date Header */}
            <div className={`
              text-center p-4 rounded-lg
              ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}
            `}>
              <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {selectedDate?.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {dayReservations.length} {dayReservations.length === 1 ? 'reservation' : 'reservations'}
              </p>
            </div>

            {/* Reservations List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {dayReservations.length > 0 ? (
                dayReservations.map(reservation => (
                  <button
                    key={reservation.id}
                    onClick={() => handleReservationClick(reservation)}
                    className={`
                      w-full p-4 rounded-lg border-2 text-left transition-all
                      ${getStatusColor(reservation.status)}
                      hover:shadow-md
                    `}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-base">
                            {formatTime(reservation.reservationTime)}
                          </span>
                          <span className={`
                            px-2 py-0.5 rounded text-xs font-medium uppercase
                            ${getStatusColor(reservation.status)}
                          `}>
                            {reservation.status}
                          </span>
                        </div>
                        <p className="font-medium truncate">{reservation.customerName}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm opacity-90">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {reservation.guestCount} {reservation.guestCount === 1 ? 'guest' : 'guests'}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {reservation.duration} min
                          </span>
                        </div>
                        {reservation.customerPhone && (
                          <p className="text-xs mt-1 opacity-75">{reservation.customerPhone}</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className={`
                  text-center py-12
                  ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}
                `}>
                  <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm font-medium">No reservations for this day</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
