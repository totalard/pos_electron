import { useState, useEffect } from 'react'
import { authAPI, type User } from '../services/api'
import { useAppStore, usePinStore } from '../stores'
import { AddUserModal } from './AddUserModal'

interface UserManagementProps {
  onBack: () => void
  onLogout: () => void
}

type ViewMode = 'list' | 'grid'
type SortField = 'name' | 'email' | 'role' | 'created_at' | 'last_login'
type SortOrder = 'asc' | 'desc'

export function UserManagement({ onBack, onLogout }: UserManagementProps) {
  const { theme } = useAppStore()
  const { currentUser } = usePinStore()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set())
  const [filterRole, setFilterRole] = useState<'all' | 'primary' | 'staff'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showAddUserModal, setShowAddUserModal] = useState(false)

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Function to load users
  const loadUsers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const fetchedUsers = await authAPI.getAllUsers()
      setUsers(fetchedUsers)
    } catch (err) {
      console.error('Failed to load users:', err)
      setError('Failed to load users. Please check backend connection.')
    } finally {
      setIsLoading(false)
    }
  }

  // Load users on mount
  useEffect(() => {
    loadUsers()
  }, [])

  // Filter and sort users
  useEffect(() => {
    let filtered = [...users]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(user =>
        user.full_name.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.mobile_number?.includes(query)
      )
    }

    // Apply role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole)
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      const isActive = filterStatus === 'active'
      filtered = filtered.filter(user => user.is_active === isActive)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortField) {
        case 'name':
          aValue = a.full_name.toLowerCase()
          bValue = b.full_name.toLowerCase()
          break
        case 'email':
          aValue = a.email?.toLowerCase() || ''
          bValue = b.email?.toLowerCase() || ''
          break
        case 'role':
          aValue = a.role
          bValue = b.role
          break
        case 'created_at':
          aValue = new Date(a.created_at)
          bValue = new Date(b.created_at)
          break
        case 'last_login':
          aValue = a.last_login ? new Date(a.last_login) : new Date(0)
          bValue = b.last_login ? new Date(b.last_login) : new Date(0)
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    setFilteredUsers(filtered)
  }, [users, searchQuery, filterRole, filterStatus, sortField, sortOrder])

  // Helper functions
  const getUserInitials = (fullName: string): string => {
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getAvatarColor = (userId: number): string => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
      'from-yellow-500 to-yellow-600',
      'from-red-500 to-red-600',
      'from-teal-500 to-teal-600'
    ]
    return colors[userId % colors.length]
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const handleUserCreated = async () => {
    // Refresh the user list after creating a new user
    await loadUsers()
  }

  const handleSelectUser = (userId: number) => {
    const newSelected = new Set(selectedUsers)
    if (newSelected.has(userId)) {
      newSelected.delete(userId)
    } else {
      newSelected.add(userId)
    }
    setSelectedUsers(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)))
    }
  }

  const clearSelection = () => {
    setSelectedUsers(new Set())
  }

  if (isLoading) {
    return (
      <div className={`
        min-h-screen flex items-center justify-center
        ${theme === 'dark'
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
          : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
        }
      `}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Loading users...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`
        min-h-screen flex items-center justify-center
        ${theme === 'dark'
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
          : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
        }
      `}>
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Error Loading Users
          </h2>
          <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={onBack}
              className={`
                px-6 py-2 rounded-lg transition-colors
                ${theme === 'dark'
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
                }
              `}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`
      min-h-screen
      ${theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
      }
    `}>
      {/* Enhanced Header */}
      <header className={`
        border-b
        ${theme === 'dark'
          ? 'bg-gray-800/50 border-gray-700'
          : 'bg-white/80 border-gray-200'
        }
        backdrop-blur-sm
      `}>
        <div className="w-full px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left Section - Logo and Navigation */}
            <div className="flex items-center gap-6">
              <button
                onClick={onBack}
                className={`
                  flex items-center p-2 rounded-lg transition-colors
                  ${theme === 'dark'
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
                title="Back to Dashboard"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="flex items-center gap-3">
                <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center
                  ${theme === 'dark'
                    ? 'bg-gradient-to-br from-primary-600 to-primary-800'
                    : 'bg-gradient-to-br from-primary-500 to-primary-700'
                  }
                `}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    User Management
                  </h1>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Manage system users and permissions
                  </p>
                </div>
              </div>
            </div>

            {/* Center Section - Search */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search users by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`
                    w-full pl-10 pr-4 py-2 rounded-lg border
                    ${theme === 'dark'
                      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-primary-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-primary-500'
                    }
                    focus:outline-none focus:ring-2 focus:ring-primary-500/20
                  `}
                />
              </div>
            </div>

            {/* Right Section - Actions and Time */}
            <div className="flex items-center gap-4">
              {/* Add User Button - Only for Admin Users */}
              {currentUser?.role === 'primary' && (
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className={`
                    px-4 py-2 rounded-lg font-medium transition-colors
                    ${theme === 'dark'
                      ? 'bg-primary-600 hover:bg-primary-700 text-white'
                      : 'bg-primary-500 hover:bg-primary-600 text-white'
                    }
                  `}
                >
                  Add User
                </button>
              )}

              <div className={`
                px-3 py-2 rounded-lg text-sm
                ${theme === 'dark'
                  ? 'bg-gray-700/50 text-gray-300'
                  : 'bg-gray-100 text-gray-700'
                }
              `}>
                {currentTime.toLocaleTimeString()}
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                  ${theme === 'dark'
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700/50 border border-gray-600'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 border border-gray-300'
                  }
                `}
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-8">
          <div className={`
            rounded-xl p-6
            ${theme === 'dark'
              ? 'bg-gray-800/50 border border-gray-700'
              : 'bg-white border border-gray-200'
            }
          `}>
            <div className="flex items-center justify-between mb-2">
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Users
              </p>
              <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {users.length}
            </p>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              All registered users
            </p>
          </div>

          <div className={`
            rounded-xl p-6
            ${theme === 'dark'
              ? 'bg-gray-800/50 border border-gray-700'
              : 'bg-white border border-gray-200'
            }
          `}>
            <div className="flex items-center justify-between mb-2">
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Active Users
              </p>
              <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-green-400' : 'text-green-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {users.filter(u => u.is_active).length}
            </p>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              Currently active
            </p>
          </div>

          <div className={`
            rounded-xl p-6
            ${theme === 'dark'
              ? 'bg-gray-800/50 border border-gray-700'
              : 'bg-white border border-gray-200'
            }
          `}>
            <div className="flex items-center justify-between mb-2">
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Admin Users
              </p>
              <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {users.filter(u => u.role === 'primary').length}
            </p>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              Primary users
            </p>
          </div>

          <div className={`
            rounded-xl p-6
            ${theme === 'dark'
              ? 'bg-gray-800/50 border border-gray-700'
              : 'bg-white border border-gray-200'
            }
          `}>
            <div className="flex items-center justify-between mb-2">
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Staff Users
              </p>
              <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {users.filter(u => u.role === 'staff').length}
            </p>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              Staff members
            </p>
          </div>

          <div className={`
            rounded-xl p-6
            ${theme === 'dark'
              ? 'bg-gray-800/50 border border-gray-700'
              : 'bg-white border border-gray-200'
            }
          `}>
            <div className="flex items-center justify-between mb-2">
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Filtered Results
              </p>
              <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
              </svg>
            </div>
            <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {filteredUsers.length}
            </p>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              Current view
            </p>
          </div>

          <div className={`
            rounded-xl p-6
            ${theme === 'dark'
              ? 'bg-gray-800/50 border border-gray-700'
              : 'bg-white border border-gray-200'
            }
          `}>
            <div className="flex items-center justify-between mb-2">
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Selected
              </p>
              <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {selectedUsers.size}
            </p>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              Users selected
            </p>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Left Side - Filters */}
          <div className="flex flex-wrap gap-4 flex-1">
            {/* Role Filter */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className={`
                px-3 py-2 rounded-lg border text-sm
                ${theme === 'dark'
                  ? 'bg-gray-700/50 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
                }
                focus:outline-none focus:ring-2 focus:ring-primary-500/20
              `}
            >
              <option value="all">All Roles</option>
              <option value="primary">Admin Users</option>
              <option value="staff">Staff Users</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className={`
                px-3 py-2 rounded-lg border text-sm
                ${theme === 'dark'
                  ? 'bg-gray-700/50 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
                }
                focus:outline-none focus:ring-2 focus:ring-primary-500/20
              `}
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            {/* Sort Options */}
            <select
              value={`${sortField}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-')
                setSortField(field as SortField)
                setSortOrder(order as SortOrder)
              }}
              className={`
                px-3 py-2 rounded-lg border text-sm
                ${theme === 'dark'
                  ? 'bg-gray-700/50 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
                }
                focus:outline-none focus:ring-2 focus:ring-primary-500/20
              `}
            >
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="email-asc">Email A-Z</option>
              <option value="email-desc">Email Z-A</option>
              <option value="role-asc">Role A-Z</option>
              <option value="role-desc">Role Z-A</option>
              <option value="created_at-desc">Newest First</option>
              <option value="created_at-asc">Oldest First</option>
              <option value="last_login-desc">Recent Login</option>
              <option value="last_login-asc">Oldest Login</option>
            </select>
          </div>

          {/* Right Side - View Controls and Actions */}
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className={`
              flex rounded-lg border
              ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}
            `}>
              <button
                onClick={() => setViewMode('list')}
                className={`
                  px-3 py-2 text-sm font-medium rounded-l-lg transition-colors
                  ${viewMode === 'list'
                    ? theme === 'dark'
                      ? 'bg-primary-600 text-white'
                      : 'bg-primary-500 text-white'
                    : theme === 'dark'
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`
                  px-3 py-2 text-sm font-medium rounded-r-lg transition-colors
                  ${viewMode === 'grid'
                    ? theme === 'dark'
                      ? 'bg-primary-600 text-white'
                      : 'bg-primary-500 text-white'
                    : theme === 'dark'
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>

            {/* Bulk Actions */}
            {selectedUsers.size > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={clearSelection}
                  className={`
                    px-3 py-2 text-sm rounded-lg transition-colors
                    ${theme === 'dark'
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }
                  `}
                >
                  Clear ({selectedUsers.size})
                </button>
                <button className={`
                  px-3 py-2 text-sm rounded-lg transition-colors
                  ${theme === 'dark'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                  }
                `}>
                  Bulk Actions
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Users List/Grid */}
        <div className={`
          rounded-xl
          ${theme === 'dark'
            ? 'bg-gray-800/50 border border-gray-700'
            : 'bg-white border border-gray-200'
          }
        `}>
          <div className={`
            px-6 py-4 border-b flex items-center justify-between
            ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
          `}>
            <div className="flex items-center gap-4">
              <h2 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Users ({filteredUsers.length})
              </h2>
              {filteredUsers.length > 0 && (
                <button
                  onClick={handleSelectAll}
                  className={`
                    text-sm px-3 py-1 rounded-lg transition-colors
                    ${theme === 'dark'
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }
                  `}
                >
                  {selectedUsers.size === filteredUsers.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <svg className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {searchQuery || filterRole !== 'all' || filterStatus !== 'all'
                  ? 'No users match your filters'
                  : 'No users found'
                }
              </p>
              {(searchQuery || filterRole !== 'all' || filterStatus !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setFilterRole('all')
                    setFilterStatus('all')
                  }}
                  className={`
                    mt-4 px-4 py-2 text-sm rounded-lg transition-colors
                    ${theme === 'dark'
                      ? 'text-primary-400 hover:text-primary-300 hover:bg-gray-700/50'
                      : 'text-primary-600 hover:text-primary-700 hover:bg-primary-50'
                    }
                  `}
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : viewMode === 'list' ? (
            <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredUsers.map((user) => (
                <div key={user.id} className={`
                  px-6 py-4 transition-colors
                  ${theme === 'dark' ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'}
                `}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />

                      {/* Avatar */}
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold
                        bg-gradient-to-br ${getAvatarColor(user.id)}
                      `}>
                        {getUserInitials(user.full_name)}
                      </div>

                      {/* User Info */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {user.full_name}
                          </h3>
                          <span className={`
                            px-2 py-1 text-xs rounded-full font-medium
                            ${user.role === 'primary'
                              ? theme === 'dark'
                                ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-800'
                                : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                              : theme === 'dark'
                                ? 'bg-gray-700 text-gray-300 border border-gray-600'
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }
                          `}>
                            {user.role === 'primary' ? 'Admin' : 'Staff'}
                          </span>
                          {!user.is_active && (
                            <span className={`
                              px-2 py-1 text-xs rounded-full font-medium
                              ${theme === 'dark'
                                ? 'bg-red-900/30 text-red-400 border border-red-800'
                                : 'bg-red-100 text-red-800 border border-red-200'
                              }
                            `}>
                              Inactive
                            </span>
                          )}
                        </div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {user.email && <span>{user.email}</span>}
                          {user.mobile_number && <span className="ml-2">• {user.mobile_number}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Actions and Info */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {user.last_login ? `Last login: ${formatDate(user.last_login)}` : 'Never logged in'}
                        </p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                          Created: {formatDate(user.created_at)}
                        </p>
                      </div>

                      {/* Action Menu */}
                      <button className={`
                        p-2 rounded-lg transition-colors
                        ${theme === 'dark'
                          ? 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }
                      `}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6 p-6">
              {filteredUsers.map((user) => (
                <div key={user.id} className={`
                  relative rounded-xl p-6 transition-all duration-200 hover:scale-105
                  ${theme === 'dark'
                    ? 'bg-gray-700/50 border border-gray-600 hover:border-gray-500'
                    : 'bg-gray-50 border border-gray-200 hover:border-gray-300'
                  }
                  ${selectedUsers.has(user.id)
                    ? theme === 'dark'
                      ? 'ring-2 ring-primary-500 border-primary-500'
                      : 'ring-2 ring-primary-500 border-primary-500'
                    : ''
                  }
                `}>
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                    className="absolute top-4 right-4 w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />

                  {/* Avatar */}
                  <div className={`
                    w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-bold mx-auto mb-4
                    bg-gradient-to-br ${getAvatarColor(user.id)}
                  `}>
                    {getUserInitials(user.full_name)}
                  </div>

                  {/* User Info */}
                  <div className="text-center">
                    <h3 className={`text-lg font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {user.full_name}
                    </h3>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className={`
                        px-2 py-1 text-xs rounded-full font-medium
                        ${user.role === 'primary'
                          ? theme === 'dark'
                            ? 'bg-yellow-900/30 text-yellow-400'
                            : 'bg-yellow-100 text-yellow-800'
                          : theme === 'dark'
                            ? 'bg-gray-600 text-gray-300'
                            : 'bg-gray-200 text-gray-600'
                        }
                      `}>
                        {user.role === 'primary' ? 'Admin' : 'Staff'}
                      </span>
                      {!user.is_active && (
                        <span className={`
                          px-2 py-1 text-xs rounded-full font-medium
                          ${theme === 'dark'
                            ? 'bg-red-900/30 text-red-400'
                            : 'bg-red-100 text-red-800'
                          }
                        `}>
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {user.email && <div>{user.email}</div>}
                      {user.mobile_number && <div>{user.mobile_number}</div>}
                    </div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      <div>{user.last_login ? `Last: ${formatDate(user.last_login)}` : 'Never logged in'}</div>
                      <div>Created: {formatDate(user.created_at)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onUserCreated={handleUserCreated}
        currentUserId={currentUser?.id || 1}
      />
    </div>
  )
}
