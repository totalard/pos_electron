import { useState, useEffect } from 'react'
import { useAppStore, usePinStore } from '../../stores'
import { authAPI, type User, type UserCreate } from '../../services/api'

export function UserManagementPanel() {
  const { theme } = useAppStore()
  const { currentUser } = usePinStore()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

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

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      await authAPI.deleteUser(userId)
      await loadUsers()
    } catch (err) {
      console.error('Failed to delete user:', err)
      alert('Failed to delete user. Please try again.')
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
          onClick={() => setShowAddModal(true)}
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
                  onClick={() => {
                    setSelectedUser(user)
                    setShowEditModal(true)
                  }}
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
                    onClick={() => handleDeleteUser(user.id)}
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

      {/* Add/Edit User Modals will be implemented in the next part */}
    </div>
  )
}

