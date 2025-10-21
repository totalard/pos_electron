import { useState, useEffect } from 'react'
import { useAppStore, useCustomerStore, usePinStore } from '../../stores'
import { PageHeader, PageContainer } from '../layout'
import { Button, Input, RightPanel, Toast, ConfirmDialog } from '../common'
import { ThemeToggle } from '../common'
import { CustomerCard } from './CustomerCard'
import { CustomerDetailPanel } from './CustomerDetailPanel'
import type { Customer } from '../../services/api'

interface CustomerManagementScreenProps {
  onBack: () => void
}

export function CustomerManagementScreen({ onBack }: CustomerManagementScreenProps) {
  const { theme } = useAppStore()
  const { currentUser } = usePinStore()
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
    <PageContainer>
      {/* Header */}
      <PageHeader
        title="Customer Management"
        subtitle={`${filteredCustomers.length} customer${filteredCustomers.length !== 1 ? 's' : ''}`}
        onBack={onBack}
        actions={
          <div className="flex items-center gap-3">
            <ThemeToggle size="md" />
            <Button
              variant="primary"
              onClick={handleAddCustomer}
              className="min-h-[44px] min-w-[44px]"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Customer
            </Button>
          </div>
        }
      />

      {/* Toolbar */}
      <div className={`
        p-4 rounded-xl mb-4
        ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'}
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
          title="Delete Customer"
          message={`Are you sure you want to delete ${customerToDelete.name}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteConfirm(false)
            setCustomerToDelete(null)
          }}
          variant="danger"
        />
      )}

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </PageContainer>
  )
}

