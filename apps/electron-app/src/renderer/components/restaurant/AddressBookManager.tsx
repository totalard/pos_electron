import { useState } from 'react'
import { useAppStore, useAddressStore } from '../../stores'
import { RightPanel, Button, Input } from '../common'
import { AddressForm } from './AddressForm'
import type { CustomerAddress } from '../../types/restaurant'

interface AddressBookManagerProps {
  isOpen: boolean
  onClose: () => void
  customerId?: number
  onSelectAddress?: (address: CustomerAddress) => void
}

export function AddressBookManager({ 
  isOpen, 
  onClose, 
  customerId,
  onSelectAddress 
}: AddressBookManagerProps) {
  const { theme } = useAppStore()
  const {
    searchQuery,
    setSearchQuery,
    getFilteredAddresses,
    getAddressesByCustomer,
    deleteAddress,
    setDefaultAddress
  } = useAddressStore()

  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null)

  const addresses = customerId 
    ? getAddressesByCustomer(customerId)
    : getFilteredAddresses()

  const handleAddAddress = () => {
    setEditingAddress(null)
    setShowForm(true)
  }

  const handleEditAddress = (address: CustomerAddress) => {
    setEditingAddress(address)
    setShowForm(true)
  }

  const handleDeleteAddress = (id: string) => {
    if (confirm('Delete this address? This action cannot be undone.')) {
      deleteAddress(id)
    }
  }

  const handleSetDefault = (id: string) => {
    setDefaultAddress(id, customerId)
  }

  const handleSelectAddress = (address: CustomerAddress) => {
    if (onSelectAddress) {
      onSelectAddress(address)
      onClose()
    }
  }

  const formatAddress = (address: CustomerAddress): string => {
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`
  }

  return (
    <>
      <RightPanel isOpen={isOpen} onClose={onClose} title="Address Book" width="lg">
        <div className="space-y-4">
          {/* Action Bar */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleAddAddress}
              variant="primary"
              className="flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Address
            </Button>

            {!customerId && (
              <div className="flex-1 min-w-[200px]">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search addresses..."
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Address List */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {addresses.length > 0 ? (
              addresses.map(address => (
                <div
                  key={address.id}
                  className={`
                    p-4 rounded-lg border-2 transition-all
                    ${address.isDefault
                      ? theme === 'dark'
                        ? 'border-blue-600 bg-blue-600/10'
                        : 'border-blue-500 bg-blue-50'
                      : theme === 'dark'
                        ? 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }
                    ${onSelectAddress ? 'cursor-pointer' : ''}
                  `}
                  onClick={() => onSelectAddress && handleSelectAddress(address)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`
                          px-2 py-1 rounded text-xs font-semibold uppercase
                          ${theme === 'dark'
                            ? 'bg-gray-700 text-gray-300'
                            : 'bg-gray-200 text-gray-700'
                          }
                        `}>
                          {address.label}
                        </span>
                        {address.isDefault && (
                          <span className={`
                            px-2 py-1 rounded text-xs font-semibold
                            ${theme === 'dark'
                              ? 'bg-blue-600 text-white'
                              : 'bg-blue-500 text-white'
                            }
                          `}>
                            DEFAULT
                          </span>
                        )}
                      </div>

                      {/* Customer Info */}
                      <div className="space-y-1 mb-2">
                        <p className={`font-semibold text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {address.customerName}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm opacity-90">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {address.phone}
                          </span>
                          {address.email && (
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {address.email}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Address */}
                      <div className={`
                        p-3 rounded text-sm
                        ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-50'}
                      `}>
                        <div className="flex items-start gap-2">
                          <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <div className="flex-1">
                            <p className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                              {formatAddress(address)}
                            </p>
                            {address.landmark && (
                              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                Landmark: {address.landmark}
                              </p>
                            )}
                            {address.instructions && (
                              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                Instructions: {address.instructions}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {!onSelectAddress && (
                      <div className="flex flex-col gap-1">
                        {!address.isDefault && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSetDefault(address.id)
                            }}
                            className={`
                              p-2 rounded transition-colors
                              ${theme === 'dark'
                                ? 'hover:bg-blue-600/30 text-blue-400'
                                : 'hover:bg-blue-100 text-blue-700'
                              }
                            `}
                            title="Set as Default"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditAddress(address)
                          }}
                          className={`
                            p-2 rounded transition-colors
                            ${theme === 'dark'
                              ? 'hover:bg-gray-600/30 text-gray-400'
                              : 'hover:bg-gray-100 text-gray-700'
                            }
                          `}
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteAddress(address.id)
                          }}
                          className={`
                            p-2 rounded transition-colors
                            ${theme === 'dark'
                              ? 'hover:bg-red-600/30 text-red-400'
                              : 'hover:bg-red-100 text-red-700'
                            }
                          `}
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className={`
                text-center py-12
                ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}
              `}>
                <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-sm font-medium">No addresses found</p>
                <p className="text-xs mt-1">Add a new address to get started</p>
              </div>
            )}
          </div>
        </div>
      </RightPanel>

      {/* Address Form Dialog */}
      <AddressForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false)
          setEditingAddress(null)
        }}
        address={editingAddress}
        customerId={customerId}
      />
    </>
  )
}
