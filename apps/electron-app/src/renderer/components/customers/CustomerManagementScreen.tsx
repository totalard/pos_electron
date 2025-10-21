import { useState, useEffect, useMemo } from 'react'
import { useAppStore, useCustomerStore } from '../../stores'
import { PageHeader, PageContainer } from '../layout'
import { Button, Input, Toast, ConfirmDialog, ThemeToggle, IconButton } from '../common'
import { CustomerCard } from './CustomerCard'
import { CustomerDetailPanel } from './CustomerDetailPanel'
import { CustomerDashboard } from './CustomerDashboard'
import type { Customer } from '../../services/api'

interface CustomerManagementScreenProps {
  onBack: () => void
}

export function CustomerManagementScreen({ onBack }: CustomerManagementScreenProps) {
  const { theme } = useAppStore()
  const {
    customers,
    isLoading,
    error,
    viewMode,
    filters,
    fetchCustomers,
    setViewMode,
    setFilters,
    clearFilters,
    deleteCustomer
  } = useCustomerStore()

  const [screenView, setScreenView] = useState<'dashboard' | 'list'>('dashboard')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [panelMode, setPanelMode] = useState<'closed' | 'view' | 'add' | 'edit'>('closed')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Fetch customers on mount
  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  // Handle search
  const handleSearch = (value: string) => {
    setFilters({ search: value })
    fetchCustomers()
  }

  // Handle view mode toggle
  const handleViewModeToggle = () => {
    setViewMode(viewMode === 'tile' ? 'grid' : 'tile')
  }

  // Handle add customer
  const handleAddCustomer = () => {
    setSelectedCustomer(null)
    setPanelMode('add')
  }

  // Handle view customer
  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setPanelMode('view')
  }

  // Handle edit customer
  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setPanelMode('edit')
  }

  // Handle delete customer
  const handleDeleteCustomer = (customer: Customer) => {
    setCustomerToDelete(customer)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!customerToDelete) return

    const success = await deleteCustomer(customerToDelete.id)
    if (success) {
      setToast({ message: 'Customer deleted successfully', type: 'success' })
      setShowDeleteConfirm(false)
      setCustomerToDelete(null)
      if (selectedCustomer?.id === customerToDelete.id) {
        setPanelMode('closed')
        setSelectedCustomer(null)
      }
    } else {
      setToast({ message: 'Failed to delete customer', type: 'error' })
    }
  }

  // Handle panel close
  const handlePanelClose = () => {
    setPanelMode('closed')
    setSelectedCustomer(null)
    fetchCustomers() // Refresh list
  }

  // Handle panel save success
  const handlePanelSuccess = (message: string) => {
    setToast({ message, type: 'success' })
    setPanelMode('closed')
    setSelectedCustomer(null)
    fetchCustomers()
  }

  // Filter customers based on filters
  const filteredCustomers = customers.filter(customer => {
    if (filters.creditStatus && customer.credit_status !== filters.creditStatus) {
      return false
    }
    if (filters.hasCredit !== null) {
      const hasCredit = customer.credit_balance > 0
      if (filters.hasCredit !== hasCredit) {
        return false
      }
    }
    return true
  })

  return (
    <div className={`
      min-h-screen
      ${theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
      }
    `}>
      <PageContainer>
        {/* Header */}
        <PageHeader
          title="Customer Management"
          subtitle={screenView === 'dashboard' ? 'Overview and analytics' : `${filteredCustomers.length} customer${filteredCustomers.length !== 1 ? 's' : ''}`}
          onBack={onBack}
          showBackButton
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          actions={
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className={`
                flex items-center gap-1 p-1 rounded-lg
                ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}
              `}>
                <IconButton
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  }
                  label="Dashboard"
                  onClick={() => setScreenView('dashboard')}
                  variant={screenView === 'dashboard' ? 'primary' : 'ghost'}
                  size="sm"
                />
                <IconButton
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  }
                  label="List"
                  onClick={() => setScreenView('list')}
                  variant={screenView === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                />
              </div>
              
              <Button
                variant="primary"
                size="md"
                onClick={handleAddCustomer}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                Add Customer
              </Button>
              <ThemeToggle size="md" />
            </div>
          }
        />

        {/* Content with proper spacing */}
        <div className="mt-6">
          {/* Content Based on Screen View */}
          {screenView === 'dashboard' ? (
            <CustomerDashboard />
          ) : (
            <>
              {/* Toolbar */}
              <div className={`
                p-4 rounded-xl mb-4
                ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}
              `}>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search customers by name, phone, or email..."
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* View Mode Toggle */}
              <Button
                variant="secondary"
                onClick={handleViewModeToggle}
                className="min-h-[44px] min-w-[44px]"
                title={viewMode === 'tile' ? 'Switch to Grid View' : 'Switch to Tile View'}
              >
                {viewMode === 'tile' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </Button>

              {/* Clear Filters */}
              {(filters.search || filters.creditStatus || filters.hasCredit !== null) && (
                <Button
                  variant="secondary"
                  onClick={clearFilters}
                  className="min-h-[44px]"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Customer List */}
          <div className={`
            p-4 rounded-xl
            ${theme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-50'}
          `}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-12">
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              No customers found. Add your first customer to get started.
            </p>
          </div>
        ) : (
          <div className={`
            grid gap-4
            ${viewMode === 'tile' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
            }
          `}>
            {filteredCustomers.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                viewMode={viewMode}
                onView={() => handleViewCustomer(customer)}
                onEdit={() => handleEditCustomer(customer)}
                onDelete={() => handleDeleteCustomer(customer)}
              />
            ))}
          </div>
        )}
              </div>
            </>
          )}
        </div>

        {/* Customer Detail Panel */}
        {panelMode !== 'closed' && (
          <CustomerDetailPanel
            customer={selectedCustomer}
            mode={panelMode}
            onClose={handlePanelClose}
            onSuccess={handlePanelSuccess}
          />
        )}

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && customerToDelete && (
          <ConfirmDialog
            isOpen={showDeleteConfirm}
            title="Delete Customer"
            message={`Are you sure you want to delete ${customerToDelete.name}? This action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
            onConfirm={confirmDelete}
            onClose={() => {
              setShowDeleteConfirm(false)
              setCustomerToDelete(null)
            }}
            variant="danger"
          />
        )}

        {/* Toast Notifications */}
        {toast && (
          <Toast
            isOpen={!!toast}
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </PageContainer>
    </div>
  )
}

