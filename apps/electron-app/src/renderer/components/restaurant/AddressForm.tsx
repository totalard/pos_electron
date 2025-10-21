import { useState, useEffect } from 'react'
import { useAppStore, useAddressStore } from '../../stores'
import { Modal, Button, Input } from '../common'
import type { CustomerAddress } from '../../types/restaurant'

interface AddressFormProps {
  isOpen: boolean
  onClose: () => void
  address?: CustomerAddress | null
  customerId?: number
}

export function AddressForm({ isOpen, onClose, address, customerId }: AddressFormProps) {
  const { theme } = useAppStore()
  const { createAddress, updateAddress } = useAddressStore()

  const [formData, setFormData] = useState({
    customerId: customerId,
    customerName: '',
    phone: '',
    email: '',
    label: 'Home',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    landmark: '',
    instructions: '',
    isDefault: false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (address) {
      setFormData({
        customerId: address.customerId,
        customerName: address.customerName,
        phone: address.phone,
        email: address.email || '',
        label: address.label,
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        landmark: address.landmark || '',
        instructions: address.instructions || '',
        isDefault: address.isDefault
      })
    } else {
      // Reset form for new address
      setFormData({
        customerId: customerId,
        customerName: '',
        phone: '',
        email: '',
        label: 'Home',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        landmark: '',
        instructions: '',
        isDefault: false
      })
    }
    setErrors({})
  }, [address, customerId, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!formData.label.trim()) {
      newErrors.label = 'Address label is required'
    }

    if (!formData.street.trim()) {
      newErrors.street = 'Street address is required'
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required'
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required'
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required'
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Invalid ZIP code format (e.g., 12345 or 12345-6789)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const addressData = {
      customerId: formData.customerId,
      customerName: formData.customerName.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() || undefined,
      label: formData.label.trim(),
      street: formData.street.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      zipCode: formData.zipCode.trim(),
      landmark: formData.landmark.trim() || undefined,
      instructions: formData.instructions.trim() || undefined,
      isDefault: formData.isDefault
    }

    if (address) {
      updateAddress(address.id, addressData)
    } else {
      createAddress(addressData)
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

  const labelOptions = ['Home', 'Office', 'Other']

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={address ? 'Edit Address' : 'New Address'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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

        {/* Phone and Email */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Phone Number *
            </label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
              error={errors.phone}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Email (Optional)
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="customer@example.com"
              error={errors.email}
            />
          </div>
        </div>

        {/* Address Label */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Address Label *
          </label>
          <div className="flex gap-2">
            {labelOptions.map(label => (
              <button
                key={label}
                type="button"
                onClick={() => handleChange('label', label)}
                className={`
                  flex-1 px-4 py-2 rounded-lg font-medium transition-colors
                  ${formData.label === label
                    ? theme === 'dark'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500 text-white'
                    : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }
                `}
              >
                {label}
              </button>
            ))}
          </div>
          {errors.label && (
            <p className="text-red-500 text-xs mt-1">{errors.label}</p>
          )}
        </div>

        {/* Street Address */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Street Address *
          </label>
          <Input
            value={formData.street}
            onChange={(e) => handleChange('street', e.target.value)}
            placeholder="123 Main Street, Apt 4B"
            error={errors.street}
          />
        </div>

        {/* City, State, ZIP */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              City *
            </label>
            <Input
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="New York"
              error={errors.city}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              State *
            </label>
            <Input
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
              placeholder="NY"
              maxLength={2}
              error={errors.state}
            />
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            ZIP Code *
          </label>
          <Input
            value={formData.zipCode}
            onChange={(e) => handleChange('zipCode', e.target.value)}
            placeholder="12345"
            error={errors.zipCode}
          />
        </div>

        {/* Landmark */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Landmark (Optional)
          </label>
          <Input
            value={formData.landmark}
            onChange={(e) => handleChange('landmark', e.target.value)}
            placeholder="Near Central Park"
          />
        </div>

        {/* Delivery Instructions */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Delivery Instructions (Optional)
          </label>
          <textarea
            value={formData.instructions}
            onChange={(e) => handleChange('instructions', e.target.value)}
            placeholder="Ring doorbell twice, leave at door, etc."
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

        {/* Set as Default */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isDefault"
            checked={formData.isDefault}
            onChange={(e) => handleChange('isDefault', e.target.checked)}
            className={`
              w-5 h-5 rounded cursor-pointer
              ${theme === 'dark'
                ? 'bg-gray-800 border-gray-600'
                : 'bg-white border-gray-300'
              }
            `}
          />
          <label
            htmlFor="isDefault"
            className={`text-sm font-medium cursor-pointer ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
          >
            Set as default address
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
          >
            {address ? 'Update Address' : 'Add Address'}
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
