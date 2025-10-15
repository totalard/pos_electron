  import { useState } from 'react'
import { authAPI, type UserCreate } from '../services/api'
import { useAppStore } from '../stores'

interface AddUserModalProps {
  isOpen: boolean
  onClose: () => void
  onUserCreated: () => void
  currentUserId: number
}

interface FormData {
  full_name: string
  mobile_number: string
  email: string
  pin: string
  confirmPin: string
  notes: string
}

interface FormErrors {
  full_name?: string
  mobile_number?: string
  email?: string
  pin?: string
  confirmPin?: string
  general?: string
}

export function AddUserModal({ isOpen, onClose, onUserCreated, currentUserId }: AddUserModalProps) {
  const { theme } = useAppStore()
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    mobile_number: '',
    email: '',
    pin: '',
    confirmPin: '',
    notes: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPin, setShowPin] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Full name validation
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required'
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = 'Full name must be at least 2 characters'
    }

    // PIN validation
    if (!formData.pin) {
      newErrors.pin = 'PIN is required'
    } else if (!/^\d{6}$/.test(formData.pin)) {
      newErrors.pin = 'PIN must be exactly 6 digits'
    }

    // Confirm PIN validation
    if (!formData.confirmPin) {
      newErrors.confirmPin = 'Please confirm your PIN'
    } else if (formData.pin !== formData.confirmPin) {
      newErrors.confirmPin = 'PINs do not match'
    }

    // Email validation (optional but must be valid if provided)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Mobile number validation (optional but must be valid if provided)
    if (formData.mobile_number && !/^\+?[\d\s\-\(\)]{10,}$/.test(formData.mobile_number)) {
      newErrors.mobile_number = 'Please enter a valid mobile number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      const userData: UserCreate = {
        full_name: formData.full_name.trim(),
        pin: formData.pin,
        mobile_number: formData.mobile_number.trim() || undefined,
        email: formData.email.trim() || undefined,
        notes: formData.notes.trim() || undefined
      }

      await authAPI.createUser(userData, currentUserId)
      
      // Reset form
      setFormData({
        full_name: '',
        mobile_number: '',
        email: '',
        pin: '',
        confirmPin: '',
        notes: ''
      })
      
      onUserCreated()
      onClose()
    } catch (error: any) {
      console.error('Failed to create user:', error)
      setErrors({
        general: error.message || 'Failed to create user. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (field in errors) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        full_name: '',
        mobile_number: '',
        email: '',
        pin: '',
        confirmPin: '',
        notes: ''
      })
      setErrors({})
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className={`
        relative w-full max-w-md mx-4 rounded-xl shadow-2xl
        ${theme === 'dark' 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-200'
        }
      `}>
        {/* Header */}
        <div className={`
          px-6 py-4 border-b
          ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
        `}>
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Add New User
            </h2>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className={`
                p-2 rounded-lg transition-colors
                ${theme === 'dark' 
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* General Error */}
          {errors.general && (
            <div className={`
              p-3 rounded-lg text-sm
              ${theme === 'dark' 
                ? 'bg-red-900/30 text-red-400 border border-red-800' 
                : 'bg-red-50 text-red-700 border border-red-200'
              }
            `}>
              {errors.general}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Full Name *
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              disabled={isSubmitting}
              className={`
                w-full px-3 py-2 rounded-lg border text-sm
                ${theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }
                ${errors.full_name 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                  : 'focus:border-primary-500 focus:ring-primary-500/20'
                }
                focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed
              `}
              placeholder="Enter user's full name"
            />
            {errors.full_name && (
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                {errors.full_name}
              </p>
            )}
          </div>

          {/* PIN */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              PIN *
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={formData.pin}
                onChange={(e) => handleInputChange('pin', e.target.value.replace(/\D/g, '').slice(0, 6))}
                disabled={isSubmitting}
                className={`
                  w-full px-3 py-2 pr-10 rounded-lg border text-sm font-mono
                  ${theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }
                  ${errors.pin 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                    : 'focus:border-primary-500 focus:ring-primary-500/20'
                  }
                  focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed
                `}
                placeholder="123456"
                maxLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                disabled={isSubmitting}
                className={`
                  absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded
                  ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showPin ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  )}
                </svg>
              </button>
            </div>
            {errors.pin && (
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                {errors.pin}
              </p>
            )}
          </div>

          {/* Confirm PIN */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Confirm PIN *
            </label>
            <input
              type={showPin ? 'text' : 'password'}
              value={formData.confirmPin}
              onChange={(e) => handleInputChange('confirmPin', e.target.value.replace(/\D/g, '').slice(0, 6))}
              disabled={isSubmitting}
              className={`
                w-full px-3 py-2 rounded-lg border text-sm font-mono
                ${theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }
                ${errors.confirmPin
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : 'focus:border-primary-500 focus:ring-primary-500/20'
                }
                focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed
              `}
              placeholder="123456"
              maxLength={6}
            />
            {errors.confirmPin && (
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                {errors.confirmPin}
              </p>
            )}
          </div>

          {/* Mobile Number (Optional) */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Mobile Number
            </label>
            <input
              type="tel"
              value={formData.mobile_number}
              onChange={(e) => handleInputChange('mobile_number', e.target.value)}
              disabled={isSubmitting}
              className={`
                w-full px-3 py-2 rounded-lg border text-sm
                ${theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }
                ${errors.mobile_number
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : 'focus:border-primary-500 focus:ring-primary-500/20'
                }
                focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed
              `}
              placeholder="+1 (555) 123-4567"
            />
            {errors.mobile_number && (
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                {errors.mobile_number}
              </p>
            )}
          </div>

          {/* Email (Optional) */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={isSubmitting}
              className={`
                w-full px-3 py-2 rounded-lg border text-sm
                ${theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }
                ${errors.email
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : 'focus:border-primary-500 focus:ring-primary-500/20'
                }
                focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed
              `}
              placeholder="user@example.com"
            />
            {errors.email && (
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                {errors.email}
              </p>
            )}
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              disabled={isSubmitting}
              rows={3}
              className={`
                w-full px-3 py-2 rounded-lg border text-sm resize-none
                ${theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }
                focus:border-primary-500 focus:ring-primary-500/20
                focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed
              `}
              placeholder="Additional notes about the user (optional)"
            />
          </div>

          {/* Role Info */}
          <div className={`
            p-3 rounded-lg text-sm
            ${theme === 'dark'
              ? 'bg-blue-900/30 text-blue-400 border border-blue-800'
              : 'bg-blue-50 text-blue-700 border border-blue-200'
            }
          `}>
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium">Staff User</p>
                <p className="text-xs mt-1 opacity-90">
                  New users are automatically created with staff role. Only the primary admin can create users.
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className={`
          px-6 py-4 border-t flex items-center justify-end gap-3
          ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
        `}>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors
              ${theme === 'dark'
                ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors
              ${theme === 'dark'
                ? 'bg-primary-600 hover:bg-primary-700 text-white'
                : 'bg-primary-500 hover:bg-primary-600 text-white'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating...
              </span>
            ) : (
              'Create User'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
