import { useState, useEffect } from 'react'
import { useAppStore, usePinStore } from '../../stores'
import { authAPI, type User, type UserCreate } from '../../services/api'
import { RightPanel, Input, Button, Toggle, ConfirmDialog, Toast } from '../common'

type PanelMode = 'closed' | 'add' | 'edit'

export function UserManagementPanel() {
  const { theme } = useAppStore()
  const { currentUser } = usePinStore()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [panelMode, setPanelMode] = useState<PanelMode>('closed')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    mobile_number: '',
    email: '',
    pin: '',
    confirmPin: '',
    avatar_color: 'blue',
    is_active: true,
    notes: ''
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; user: User | null }>({ show: false, user: null })
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' })

  // Avatar colors
  const avatarColors = [
    { id: 'blue', class: 'bg-blue-500', name: 'Blue' },
    { id: 'green', class: 'bg-green-500', name: 'Green' },
    { id: 'purple', class: 'bg-purple-500', name: 'Purple' },
    { id: 'orange', class: 'bg-orange-500', name: 'Orange' },
    { id: 'pink', class: 'bg-pink-500', name: 'Pink' },
    { id: 'cyan', class: 'bg-cyan-500', name: 'Cyan' },
    { id: 'indigo', class: 'bg-indigo-500', name: 'Indigo' },
    { id: 'red', class: 'bg-red-500', name: 'Red' },
    { id: 'teal', class: 'bg-teal-500', name: 'Teal' },
    { id: 'amber', class: 'bg-amber-500', name: 'Amber' }
  ]

  // Load users
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const fetchedUsers = await authAPI.getAllUsers()
      setUsers(fetchedUsers)
    } catch (err) {
      console.error('Failed to load users:', err)
      setError('Failed to load users. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (user: User) => {
    setDeleteConfirm({ show: true, user })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.user) return

    try {
      await authAPI.deleteUser(deleteConfirm.user.id)
      await loadUsers()
      setToast({ show: true, message: 'User deleted successfully', type: 'success' })
    } catch (err) {
      console.error('Failed to delete user:', err)
      setToast({ show: true, message: 'Failed to delete user. Please try again.', type: 'error' })
    } finally {
      setDeleteConfirm({ show: false, user: null })
    }
  }

  const getUserInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getAvatarColor = (color?: string) => {
    const colorObj = avatarColors.find(c => c.id === color)
    return colorObj?.class || 'bg-blue-500'
  }

  const openAddPanel = () => {
    setFormData({
      full_name: '',
      mobile_number: '',
      email: '',
      pin: '',
      confirmPin: '',
      avatar_color: 'blue',
      is_active: true,
      notes: ''
    })
    setFormErrors({})
    setSelectedUser(null)
    setPanelMode('add')
  }

  const openEditPanel = (user: User) => {
    setFormData({
      full_name: user.full_name,
      mobile_number: user.mobile_number || '',
      email: user.email || '',
      pin: '',
      confirmPin: '',
      avatar_color: user.avatar_color || 'blue',
      is_active: user.is_active,
      notes: user.notes || ''
    })
    setFormErrors({})
    setSelectedUser(user)
    setPanelMode('edit')
  }

  const closePanel = () => {
    setPanelMode('closed')
    setSelectedUser(null)
    setFormData({
      full_name: '',
      mobile_number: '',
      email: '',
      pin: '',
      confirmPin: '',
      avatar_color: 'blue',
      is_active: true,
      notes: ''
    })
    setFormErrors({})
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.full_name.trim()) {
      errors.full_name = 'Full name is required'
    }

    if (panelMode === 'add') {
      if (!formData.pin) {
        errors.pin = 'PIN is required'
      } else if (!/^\d{6}$/.test(formData.pin)) {
        errors.pin = 'PIN must be exactly 6 digits'
      }

      if (formData.pin !== formData.confirmPin) {
        errors.confirmPin = 'PINs do not match'
      }
    } else if (panelMode === 'edit' && formData.pin) {
      // Only validate PIN if user is changing it
      if (!/^\d{6}$/.test(formData.pin)) {
        errors.pin = 'PIN must be exactly 6 digits'
      }

      if (formData.pin !== formData.confirmPin) {
        errors.confirmPin = 'PINs do not match'
      }
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSaving(true)
    try {
      const userData: UserCreate = {
        full_name: formData.full_name,
        mobile_number: formData.mobile_number || undefined,
        email: formData.email || undefined,
        avatar_color: formData.avatar_color,
        notes: formData.notes || undefined,
        pin: formData.pin
      }

      if (panelMode === 'add') {
        await authAPI.createUser(userData, currentUser?.id || 1)
      } else if (panelMode === 'edit' && selectedUser) {
        // For edit, only include PIN if it's being changed
        const updateData: Partial<UserCreate> & { is_active?: boolean } = {
          full_name: formData.full_name,
          mobile_number: formData.mobile_number || undefined,
          email: formData.email || undefined,
          avatar_color: formData.avatar_color,
          notes: formData.notes || undefined,
          is_active: formData.is_active
        }

        if (formData.pin) {
          updateData.pin = formData.pin
        }

        await authAPI.updateUser(selectedUser.id, updateData)
      }

      await loadUsers()
      closePanel()
    } catch (err) {
      console.error('Failed to save user:', err)
      setFormErrors({ submit: 'Failed to save user. Please try again.' })
    } finally {
      setIsSaving(false)
    }
  }

  // Check if current user is admin
  if (currentUser?.role !== 'admin') {
    return (
      <div className="p-6">
        <div className={`
          p-6 rounded-lg text-center
          ${theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-600'}
        `}>
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <p>Only admin users can access User Management.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            User Management
          </h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage users, roles, and access control
          </p>
        </div>
        <button
          onClick={openAddPanel}
          className={`
            px-6 py-3 rounded-lg font-medium min-h-[44px]
            transition-all duration-200
            ${theme === 'dark'
              ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white'
              : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white'
            }
            shadow-md hover:shadow-lg
          `}
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add User
          </div>
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${theme === 'dark' ? 'border-blue-400' : 'border-blue-600'}`} />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-600'}`}>
          {error}
        </div>
      )}

      {/* Users Grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <div
              key={user.id}
              className={`
                p-6 rounded-xl border-2
                transition-all duration-200
                ${theme === 'dark'
                  ? 'bg-gray-700/30 border-gray-600 hover:border-gray-500'
                  : 'bg-white border-gray-200 hover:border-gray-300'
                }
                shadow-md hover:shadow-lg
              `}
            >
              {/* User Avatar */}
              <div className="flex items-center gap-4 mb-4">
                <div className={`
                  w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold
                  ${getAvatarColor(user.avatar_color)}
                `}>
                  {getUserInitials(user.full_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-lg truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {user.full_name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`
                      px-2 py-1 rounded text-xs font-medium
                      ${user.role === 'admin'
                        ? theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                        : theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }
                    `}>
                      {user.role.toUpperCase()}
                    </span>
                    {!user.is_active && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'}`}>
                        INACTIVE
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* User Details */}
              <div className={`space-y-2 mb-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {user.mobile_number && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {user.mobile_number}
                  </div>
                )}
                {user.email && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {user.email}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => openEditPanel(user)}
                  className={`
                    flex-1 px-4 py-2 rounded-lg font-medium min-h-[44px]
                    transition-all duration-200
                    ${theme === 'dark'
                      ? 'bg-gray-600 hover:bg-gray-500 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                    }
                  `}
                >
                  Edit
                </button>
                {user.role !== 'admin' && (
                  <button
                    onClick={() => handleDeleteClick(user)}
                    className={`
                      px-4 py-2 rounded-lg font-medium min-h-[44px]
                      transition-all duration-200
                      ${theme === 'dark'
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                      }
                    `}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit User Panel */}
      <RightPanel
        isOpen={panelMode !== 'closed'}
        onClose={closePanel}
        title={panelMode === 'add' ? 'Add New User' : 'Edit User'}
        width="md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <Input
            label="Full Name"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            error={formErrors.full_name}
            required
            placeholder="Enter full name"
          />

          {/* Mobile Number */}
          <Input
            label="Mobile Number"
            type="tel"
            value={formData.mobile_number}
            onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
            error={formErrors.mobile_number}
            placeholder="Enter mobile number"
          />

          {/* Email */}
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={formErrors.email}
            placeholder="Enter email address"
          />

          {/* PIN */}
          <Input
            label={panelMode === 'add' ? 'PIN (6 digits)' : 'New PIN (leave empty to keep current)'}
            type="password"
            value={formData.pin}
            onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '').slice(0, 6) })}
            error={formErrors.pin}
            required={panelMode === 'add'}
            placeholder="Enter 6-digit PIN"
            maxLength={6}
          />

          {/* Confirm PIN */}
          <Input
            label="Confirm PIN"
            type="password"
            value={formData.confirmPin}
            onChange={(e) => setFormData({ ...formData, confirmPin: e.target.value.replace(/\D/g, '').slice(0, 6) })}
            error={formErrors.confirmPin}
            required={panelMode === 'add' || !!formData.pin}
            placeholder="Re-enter PIN"
            maxLength={6}
          />

          {/* Avatar Color */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Avatar Color
            </label>
            <div className="grid grid-cols-5 gap-3">
              {avatarColors.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, avatar_color: color.id })}
                  className={`
                    w-full aspect-square rounded-lg transition-all min-h-[44px]
                    ${color.class}
                    ${formData.avatar_color === color.id
                      ? 'ring-4 ring-offset-2 ring-offset-gray-800 ring-white scale-110'
                      : 'hover:scale-105'
                    }
                  `}
                  aria-label={`Select ${color.name} color`}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Active Status (Edit only) */}
          {panelMode === 'edit' && (
            <Toggle
              checked={formData.is_active}
              onChange={(checked) => setFormData({ ...formData, is_active: checked })}
              label="Active User"
              description="Inactive users cannot log in"
            />
          )}

          {/* Notes */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className={`
                w-full px-4 py-3 rounded-lg border transition-colors resize-none
                ${theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500/20
              `}
              placeholder="Add any notes about this user..."
            />
          </div>

          {/* Error Message */}
          {formErrors.submit && (
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-600'}`}>
              {formErrors.submit}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isSaving}
              disabled={isSaving}
            >
              {panelMode === 'add' ? 'Create User' : 'Update User'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={closePanel}
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>
        </form>
      </RightPanel>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, user: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        message={`Are you sure you want to delete ${deleteConfirm.user?.full_name}? This action cannot be undone.`}
        variant="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Toast Notification */}
      <Toast
        isOpen={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
        message={toast.message}
        type={toast.type}
        duration={3000}
      />
    </div>
  )
}

