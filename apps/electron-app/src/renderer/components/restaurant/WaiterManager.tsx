import { useState } from 'react'
import { useAppStore, useSettingsStore } from '../../stores'
import { RightPanel } from '../common'
import type { Waiter } from '../../types/restaurant'

interface WaiterManagerProps {
  isOpen: boolean
  onClose: () => void
}

export function WaiterManager({ isOpen, onClose }: WaiterManagerProps) {
  const { theme } = useAppStore()
  const { restaurant, updateRestaurantSettings } = useSettingsStore()
  
  const [showWaiterDialog, setShowWaiterDialog] = useState(false)
  const [editingWaiter, setEditingWaiter] = useState<Waiter | null>(null)

  const handleAddWaiter = () => {
    setEditingWaiter(null)
    setShowWaiterDialog(true)
  }

  const handleEditWaiter = (waiter: Waiter) => {
    setEditingWaiter(waiter)
    setShowWaiterDialog(true)
  }

  const handleSaveWaiter = (waiterData: Partial<Waiter>) => {
    if (editingWaiter) {
      // Update existing waiter
      const updatedWaiters = restaurant.waiters.map(w =>
        w.id === editingWaiter.id ? { ...w, ...waiterData, updatedAt: new Date() } : w
      )
      updateRestaurantSettings({ waiters: updatedWaiters })
    } else {
      // Add new waiter
      const now = new Date()
      const newWaiter: Waiter = {
        id: `waiter-${Date.now()}`,
        name: waiterData.name || 'New Waiter',
        employeeId: waiterData.employeeId,
        phone: waiterData.phone,
        email: waiterData.email,
        isActive: waiterData.isActive !== undefined ? waiterData.isActive : true,
        assignedTables: waiterData.assignedTables || [],
        currentOrders: waiterData.currentOrders || [],
        createdAt: now,
        updatedAt: now
      }
      updateRestaurantSettings({ waiters: [...restaurant.waiters, newWaiter] })
    }
    setShowWaiterDialog(false)
  }

  const handleDeleteWaiter = (waiterId: string) => {
    if (confirm('Are you sure you want to delete this waiter?')) {
      const updatedWaiters = restaurant.waiters.filter(w => w.id !== waiterId)
      updateRestaurantSettings({ waiters: updatedWaiters })
    }
  }

  const handleToggleActive = (waiterId: string, isActive: boolean) => {
    const updatedWaiters = restaurant.waiters.map(w =>
      w.id === waiterId ? { ...w, isActive, updatedAt: new Date() } : w
    )
    updateRestaurantSettings({ waiters: updatedWaiters })
  }

  const getWaiterStats = (waiter: Waiter) => {
    return {
      tables: waiter.assignedTables.length,
      orders: waiter.currentOrders.length
    }
  }

  return (
    <>
      <RightPanel isOpen={isOpen} onClose={onClose} title="Waiter Management" width="lg">
        <div className="space-y-4">
          {/* Header with Add Button */}
          <div className="flex items-center justify-between">
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage waiters/servers for your restaurant
            </p>
            <button
              onClick={handleAddWaiter}
              className={`
                px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2
                ${theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
                }
              `}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Waiter
            </button>
          </div>

          {/* Waiters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {restaurant.waiters.length > 0 ? (
              restaurant.waiters.map(waiter => {
                const stats = getWaiterStats(waiter)
                return (
                  <div
                    key={waiter.id}
                    className={`
                      p-4 rounded-lg border-2 transition-all
                      ${waiter.isActive
                        ? theme === 'dark'
                          ? 'bg-gray-800/50 border-gray-700'
                          : 'bg-white border-gray-200'
                        : theme === 'dark'
                          ? 'bg-gray-800/30 border-gray-700 opacity-60'
                          : 'bg-gray-50 border-gray-300 opacity-60'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold
                          ${waiter.isActive
                            ? theme === 'dark'
                              ? 'bg-blue-600 text-white'
                              : 'bg-blue-500 text-white'
                            : theme === 'dark'
                              ? 'bg-gray-700 text-gray-400'
                              : 'bg-gray-300 text-gray-600'
                          }
                        `}>
                          {waiter.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {waiter.name}
                          </h4>
                          {waiter.employeeId && (
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                              ID: {waiter.employeeId}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className={`
                        px-2 py-1 rounded text-xs font-medium
                        ${waiter.isActive
                          ? theme === 'dark'
                            ? 'bg-green-600/30 text-green-400'
                            : 'bg-green-100 text-green-800'
                          : theme === 'dark'
                            ? 'bg-gray-700 text-gray-400'
                            : 'bg-gray-200 text-gray-600'
                        }
                      `}>
                        {waiter.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {/* Contact Info */}
                    {(waiter.phone || waiter.email) && (
                      <div className={`text-xs space-y-1 mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {waiter.phone && (
                          <div className="flex items-center gap-2">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {waiter.phone}
                          </div>
                        )}
                        {waiter.email && (
                          <div className="flex items-center gap-2">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {waiter.email}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    <div className={`
                      flex gap-4 mb-3 p-2 rounded
                      ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}
                    `}>
                      <div className="flex-1 text-center">
                        <div className={`text-lg font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                          {stats.tables}
                        </div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Tables
                        </div>
                      </div>
                      <div className="flex-1 text-center">
                        <div className={`text-lg font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                          {stats.orders}
                        </div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Orders
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleActive(waiter.id, !waiter.isActive)}
                        className={`
                          flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                          ${waiter.isActive
                            ? theme === 'dark'
                              ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
                              : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                            : theme === 'dark'
                              ? 'bg-green-600 hover:bg-green-500 text-white'
                              : 'bg-green-500 hover:bg-green-600 text-white'
                          }
                        `}
                      >
                        {waiter.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleEditWaiter(waiter)}
                        className={`
                          flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                          ${theme === 'dark'
                            ? 'bg-blue-600 hover:bg-blue-500 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                          }
                        `}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteWaiter(waiter.id)}
                        className={`
                          px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                          ${theme === 'dark'
                            ? 'bg-red-600 hover:bg-red-500 text-white'
                            : 'bg-red-500 hover:bg-red-600 text-white'
                          }
                        `}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className={`
                col-span-full text-center py-12 rounded-lg border-2 border-dashed
                ${theme === 'dark' ? 'border-gray-700 bg-gray-800/30' : 'border-gray-300 bg-gray-50'}
              `}>
                <svg className={`w-16 h-16 mx-auto mb-4 opacity-50 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  No waiters added yet
                </p>
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-500'}`}>
                  Click "Add Waiter" to create one
                </p>
              </div>
            )}
          </div>
        </div>
      </RightPanel>

      {/* Waiter Dialog */}
      {showWaiterDialog && (
        <WaiterDialog
          isOpen={showWaiterDialog}
          onClose={() => setShowWaiterDialog(false)}
          onSave={handleSaveWaiter}
          waiter={editingWaiter}
        />
      )}
    </>
  )
}

// Waiter Dialog Component
interface WaiterDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (waiter: Partial<Waiter>) => void
  waiter: Waiter | null
}

function WaiterDialog({ isOpen, onClose, onSave, waiter }: WaiterDialogProps) {
  const { theme } = useAppStore()
  const [name, setName] = useState(waiter?.name || '')
  const [employeeId, setEmployeeId] = useState(waiter?.employeeId || '')
  const [phone, setPhone] = useState(waiter?.phone || '')
  const [email, setEmail] = useState(waiter?.email || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      alert('Waiter name is required')
      return
    }
    onSave({
      name: name.trim(),
      employeeId: employeeId.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined
    })
  }

  return (
    <RightPanel isOpen={isOpen} onClose={onClose} title={waiter ? 'Edit Waiter' : 'Add Waiter'} width="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            placeholder="e.g., John Doe"
            required
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Employee ID
          </label>
          <input
            type="text"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            placeholder="e.g., EMP001"
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Phone
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            placeholder="e.g., +1234567890"
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            placeholder="e.g., john@example.com"
          />
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t mt-6">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-lg font-medium ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-4 py-2 rounded-lg font-medium ${
              theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {waiter ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </RightPanel>
  )
}
