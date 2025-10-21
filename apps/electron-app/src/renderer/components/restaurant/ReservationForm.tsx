import { useState, useEffect } from 'react'
import { useAppStore, useReservationStore, useSettingsStore } from '../../stores'
import { Modal, Button, Input } from '../common'
import type { TableReservation } from '../../types/restaurant'

interface ReservationFormProps {
  isOpen: boolean
  onClose: () => void
  reservation?: TableReservation | null
}

export function ReservationForm({ isOpen, onClose, reservation }: ReservationFormProps) {
  const { theme } = useAppStore()
  const { restaurant } = useSettingsStore()
  const { createReservation, updateReservation } = useReservationStore()

  const [formData, setFormData] = useState({
    tableId: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    guestCount: 2,
    reservationDate: '',
    reservationTime: '',
    duration: 90,
    specialRequests: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (reservation) {
      setFormData({
        tableId: reservation.tableId,
        customerName: reservation.customerName,
        customerPhone: reservation.customerPhone,
        customerEmail: reservation.customerEmail || '',
        guestCount: reservation.guestCount,
        reservationDate: new Date(reservation.reservationDate).toISOString().split('T')[0],
        reservationTime: reservation.reservationTime,
        duration: reservation.duration,
        specialRequests: reservation.specialRequests || ''
      })
    } else {
      // Reset form for new reservation
      const today = new Date()
      setFormData({
        tableId: '',
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        guestCount: 2,
        reservationDate: today.toISOString().split('T')[0],
        reservationTime: '19:00',
        duration: 90,
        specialRequests: ''
      })
    }
    setErrors({})
  }, [reservation, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.tableId) {
      newErrors.tableId = 'Please select a table'
    }

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required'
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Phone number is required'
    } else if (!/^\+?[\d\s-()]+$/.test(formData.customerPhone)) {
      newErrors.customerPhone = 'Invalid phone number format'
    }

    if (formData.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Invalid email format'
    }

    if (formData.guestCount < 1) {
      newErrors.guestCount = 'Guest count must be at least 1'
    }

    if (!formData.reservationDate) {
      newErrors.reservationDate = 'Reservation date is required'
    }

    if (!formData.reservationTime) {
      newErrors.reservationTime = 'Reservation time is required'
    }

    if (formData.duration < 15) {
      newErrors.duration = 'Duration must be at least 15 minutes'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const reservationData = {
      tableId: formData.tableId,
      customerName: formData.customerName.trim(),
      customerPhone: formData.customerPhone.trim(),
      customerEmail: formData.customerEmail.trim() || undefined,
      guestCount: formData.guestCount,
      reservationDate: new Date(formData.reservationDate),
      reservationTime: formData.reservationTime,
      duration: formData.duration,
      specialRequests: formData.specialRequests.trim() || undefined
    }

    if (reservation) {
      updateReservation(reservation.id, reservationData)
    } else {
      createReservation(reservationData)
    }

    onClose()
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const availableTables = restaurant.tables.filter(t => t.status === 'available' || t.id === formData.tableId)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={reservation ? 'Edit Reservation' : 'New Reservation'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Table Selection */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Table *
          </label>
          <select
            value={formData.tableId}
            onChange={(e) => handleChange('tableId', e.target.value)}
            className={`
              w-full px-4 py-2 rounded-lg border transition-colors
              ${theme === 'dark'
                ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500'
                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
              }
              ${errors.tableId ? 'border-red-500' : ''}
            `}
          >
            <option value="">Select a table</option>
            {availableTables.map(table => (
              <option key={table.id} value={table.id}>
                {table.name} - {table.capacity} seats
              </option>
            ))}
          </select>
          {errors.tableId && (
            <p className="text-red-500 text-xs mt-1">{errors.tableId}</p>
          )}
        </div>

        {/* Customer Name */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Customer Name *
          </label>
          <Input
            value={formData.customerName}
            onChange={(e) => handleChange('customerName', e.target.value)}
            placeholder="Enter customer name"
            error={errors.customerName}
          />
        </div>

        {/* Customer Phone */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Phone Number *
          </label>
          <Input
            type="tel"
            value={formData.customerPhone}
            onChange={(e) => handleChange('customerPhone', e.target.value)}
            placeholder="+1 (555) 123-4567"
            error={errors.customerPhone}
          />
        </div>

        {/* Customer Email */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Email (Optional)
          </label>
          <Input
            type="email"
            value={formData.customerEmail}
            onChange={(e) => handleChange('customerEmail', e.target.value)}
            placeholder="customer@example.com"
            error={errors.customerEmail}
          />
        </div>

        {/* Guest Count */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Number of Guests *
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={formData.guestCount}
            onChange={(e) => handleChange('guestCount', parseInt(e.target.value) || 1)}
            className={`
              w-full px-4 py-2 rounded-lg border transition-colors
              ${theme === 'dark'
                ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500'
                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
              }
              ${errors.guestCount ? 'border-red-500' : ''}
            `}
          />
          {errors.guestCount && (
            <p className="text-red-500 text-xs mt-1">{errors.guestCount}</p>
          )}
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Date *
            </label>
            <input
              type="date"
              value={formData.reservationDate}
              onChange={(e) => handleChange('reservationDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={`
                w-full px-4 py-2 rounded-lg border transition-colors
                ${theme === 'dark'
                  ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                }
                ${errors.reservationDate ? 'border-red-500' : ''}
              `}
            />
            {errors.reservationDate && (
              <p className="text-red-500 text-xs mt-1">{errors.reservationDate}</p>
            )}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Time *
            </label>
            <input
              type="time"
              value={formData.reservationTime}
              onChange={(e) => handleChange('reservationTime', e.target.value)}
              className={`
                w-full px-4 py-2 rounded-lg border transition-colors
                ${theme === 'dark'
                  ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                }
                ${errors.reservationTime ? 'border-red-500' : ''}
              `}
            />
            {errors.reservationTime && (
              <p className="text-red-500 text-xs mt-1">{errors.reservationTime}</p>
            )}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Duration (minutes) *
          </label>
          <select
            value={formData.duration}
            onChange={(e) => handleChange('duration', parseInt(e.target.value))}
            className={`
              w-full px-4 py-2 rounded-lg border transition-colors
              ${theme === 'dark'
                ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500'
                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
              }
            `}
          >
            <option value={30}>30 minutes</option>
            <option value={60}>1 hour</option>
            <option value={90}>1.5 hours</option>
            <option value={120}>2 hours</option>
            <option value={150}>2.5 hours</option>
            <option value={180}>3 hours</option>
          </select>
        </div>

        {/* Special Requests */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Special Requests (Optional)
          </label>
          <textarea
            value={formData.specialRequests}
            onChange={(e) => handleChange('specialRequests', e.target.value)}
            placeholder="Any special requests or dietary requirements..."
            rows={3}
            className={`
              w-full px-4 py-2 rounded-lg border transition-colors resize-none
              ${theme === 'dark'
                ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500'
                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
              }
            `}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
          >
            {reservation ? 'Update Reservation' : 'Create Reservation'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  )
}
