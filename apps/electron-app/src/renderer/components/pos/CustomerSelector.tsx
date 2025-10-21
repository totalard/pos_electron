import { useState, useEffect } from 'react'
import { useAppStore, useCustomerStore, usePOSStore } from '../../stores'
import { Modal, Input, Button, Avatar } from '../common'
import type { Customer } from '../../services/api'

export interface CustomerSelectorProps {
  isOpen: boolean
  onClose: () => void
}

export function CustomerSelector({ isOpen, onClose }: CustomerSelectorProps) {
  const { theme } = useAppStore()
  const { customers, fetchCustomers, isLoading } = useCustomerStore()
  const { setCustomer } = usePOSStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchCustomers()
      setSearchQuery('')
      setSelectedCustomer(null)
    }
  }, [isOpen])

  const filteredCustomers = customers.filter(customer => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      customer.name.toLowerCase().includes(query) ||
      customer.phone?.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query)
    )
  })

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
  }

  const handleConfirm = () => {
    if (selectedCustomer) {
      setCustomer(selectedCustomer.id, selectedCustomer.name)
      onClose()
    }
  }

  const getCustomerInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Customer"
      size="lg"
    >
      <div className="space-y-4">
        {/* Search Input */}
        <div>
          <Input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>

        {/* Customer List */}
        <div className={`
          border rounded-lg overflow-hidden
          ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
        `}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className={`
              text-center py-12
              ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
            `}>
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-sm font-medium">No customers found</p>
              <p className="text-xs mt-1">Try a different search term</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {filteredCustomers.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => handleSelectCustomer(customer)}
                  className={`
                    w-full flex items-center gap-3 p-4 transition-colors
                    ${selectedCustomer?.id === customer.id
                      ? (theme === 'dark' ? 'bg-blue-900/30 border-l-4 border-blue-500' : 'bg-blue-50 border-l-4 border-blue-500')
                      : (theme === 'dark' ? 'hover:bg-gray-800 border-l-4 border-transparent' : 'hover:bg-gray-50 border-l-4 border-transparent')
                    }
                  `}
                >
                  <Avatar
                    name={customer.name}
                    size="md"
                    color="blue"
                  />
                  <div className="flex-1 text-left min-w-0">
                    <p className={`
                      text-sm font-semibold truncate
                      ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
                    `}>
                      {customer.name}
                    </p>
                    <div className={`
                      flex items-center gap-2 text-xs
                      ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                    `}>
                      {customer.phone && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {customer.phone}
                        </span>
                      )}
                      {customer.email && (
                        <span className="flex items-center gap-1 truncate">
                          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {customer.email}
                        </span>
                      )}
                    </div>
                  </div>
                  {selectedCustomer?.id === customer.id && (
                    <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-2">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={!selectedCustomer}
          >
            Select Customer
          </Button>
        </div>
      </div>
    </Modal>
  )
}
