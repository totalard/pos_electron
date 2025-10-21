import { useState, useEffect } from 'react'
import { useAppStore, useCustomerStore } from '../../stores'
import { RightPanel, Input, Button, Badge } from '../common'
import { FormField } from '../forms'
import { CustomerStatementPanel } from './CustomerStatementPanel'
import type { Customer, CustomerCreate, CustomerUpdate } from '../../services/api'

interface CustomerDetailPanelProps {
  customer: Customer | null
  mode: 'view' | 'add' | 'edit'
  onClose: () => void
  onSuccess: (message: string) => void
}

export function CustomerDetailPanel({ customer, mode, onClose, onSuccess }: CustomerDetailPanelProps) {
  const { theme } = useAppStore()
  const { createCustomer, updateCustomer, addCredit, recordPayment, updateCreditLimit, adjustLoyaltyPoints } = useCustomerStore()

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    credit_limit: '0.00'
  })

  const [activeTab, setActiveTab] = useState<'details' | 'credit' | 'loyalty' | 'statement'>('details')
  const [showStatementPanel, setShowStatementPanel] = useState(false)
  const [creditAmount, setCreditAmount] = useState('')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [loyaltyPoints, setLoyaltyPoints] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form data
  useEffect(() => {
    if (customer && (mode === 'view' || mode === 'edit')) {
      setFormData({
        name: customer.name,
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || '',
        credit_limit: customer.credit_limit.toFixed(2)
      })
    }
  }, [customer, mode])

  // Handle form submit
  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      return
    }

    setIsSubmitting(true)
    try {
      if (mode === 'add') {
        const data: CustomerCreate = {
          name: formData.name,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
          address: formData.address || undefined
        }
        await createCustomer(data)
        onSuccess('Customer created successfully')
      } else if (mode === 'edit' && customer) {
        const data: CustomerUpdate = {
          name: formData.name,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
          address: formData.address || undefined
        }
        await updateCustomer(customer.id, data)
        
        // Update credit limit if changed
        const newLimit = parseFloat(formData.credit_limit)
        if (newLimit !== customer.credit_limit) {
          await updateCreditLimit(customer.id, newLimit)
        }
        
        onSuccess('Customer updated successfully')
      }
    } catch (error) {
      console.error('Failed to save customer:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle credit operations
  const handleAddCredit = async () => {
    if (!customer || !creditAmount) return

    setIsSubmitting(true)
    try {
      await addCredit(customer.id, {
        amount: parseFloat(creditAmount),
        notes: notes || undefined
      })
      setCreditAmount('')
      setNotes('')
      onSuccess('Credit added successfully')
    } catch (error) {
      console.error('Failed to add credit:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRecordPayment = async () => {
    if (!customer || !paymentAmount) return

    setIsSubmitting(true)
    try {
      await recordPayment(customer.id, {
        amount: parseFloat(paymentAmount),
        notes: notes || undefined
      })
      setPaymentAmount('')
      setNotes('')
      onSuccess('Payment recorded successfully')
    } catch (error) {
      console.error('Failed to record payment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle loyalty operations
  const handleAdjustLoyalty = async () => {
    if (!customer || !loyaltyPoints) return

    setIsSubmitting(true)
    try {
      await adjustLoyaltyPoints(customer.id, {
        points: parseInt(loyaltyPoints),
        notes: notes || undefined
      })
      setLoyaltyPoints('')
      setNotes('')
      onSuccess('Loyalty points adjusted successfully')
    } catch (error) {
      console.error('Failed to adjust loyalty points:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const title = mode === 'add' ? 'Add Customer' : mode === 'edit' ? 'Edit Customer' : customer?.name || 'Customer Details'

  return (
    <RightPanel
      isOpen={true}
      onClose={onClose}
      title={title}
      width="lg"
    >
      <div className="flex flex-col h-full">
        {/* Tabs (only in view mode) */}
        {mode === 'view' && customer && (
          <div className={`
            flex border-b mb-6
            ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
          `}>
            {['details', 'credit', 'loyalty'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`
                  px-6 py-3 font-medium transition-colors min-h-[44px]
                  ${activeTab === tab
                    ? theme === 'dark'
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-blue-600 border-b-2 border-blue-600'
                    : theme === 'dark'
                      ? 'text-gray-400 hover:text-gray-300'
                      : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Details Tab */}
          {(mode !== 'view' || activeTab === 'details') && (
            <div className="space-y-6">
              {/* Form Header for Add/Edit Mode */}
              {mode !== 'view' && (
                <div className={`
                  p-4 rounded-lg
                  ${theme === 'dark' ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'}
                `}>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {mode === 'add' ? 'Create New Customer' : 'Update Customer Information'}
                      </p>
                      <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {mode === 'add' ? 'Fill in the customer details below to add them to your system.' : 'Modify the fields below to update customer information.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {/* Basic Information Section */}
              <div className={`
                p-5 rounded-lg space-y-4
                ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-50 border border-gray-200'}
              `}>
                <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Basic Information
                </h4>
                
                <FormField label="Customer Name" required>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                    disabled={mode === 'view'}
                    required
                  />
                </FormField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Phone">
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      disabled={mode === 'view'}
                    />
                  </FormField>

                  <FormField label="Email">
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="customer@example.com"
                      disabled={mode === 'view'}
                    />
                  </FormField>
                </div>

                <FormField label="Address">
                  <Input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Street address, City, State, ZIP"
                    disabled={mode === 'view'}
                  />
                </FormField>
              </div>

              {mode !== 'add' && (
                <FormField label="Credit Limit">
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.credit_limit}
                    onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })}
                    placeholder="0.00"
                    disabled={mode === 'view'}
                  />
                </FormField>
              )}

              {mode === 'view' && customer && (
                <>
                  <FormField label="Credit Balance">
                    <div className={`
                      p-3 rounded-lg font-bold text-lg
                      ${customer.credit_balance > 0
                        ? 'text-orange-500 bg-orange-500/10'
                        : 'text-green-500 bg-green-500/10'
                      }
                    `}>
                      ${customer.credit_balance.toFixed(2)}
                    </div>
                  </FormField>

                  <FormField label="Loyalty Points">
                    <div className={`
                      p-3 rounded-lg font-bold text-lg text-blue-500 bg-blue-500/10
                    `}>
                      {customer.loyalty_points} points
                    </div>
                  </FormField>
                </>
              )}
            </div>
          )}

          {/* Credit Tab */}
          {mode === 'view' && activeTab === 'credit' && customer && (
            <div className="space-y-6">
              {/* Credit Summary */}
              <div className={`
                p-4 rounded-lg
                ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}
              `}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Credit Balance
                    </p>
                    <p className="text-2xl font-bold text-orange-500">
                      ${customer.credit_balance.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Credit Limit
                    </p>
                    <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      ${customer.credit_limit.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Add Credit */}
              <div>
                <h4 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Add Credit
                </h4>
                <FormField label="Amount">
                  <Input
                    type="number"
                    step="0.01"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </FormField>
                <FormField label="Notes">
                  <Input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional notes"
                  />
                </FormField>
                <Button
                  variant="primary"
                  onClick={handleAddCredit}
                  disabled={!creditAmount || isSubmitting}
                  className="w-full min-h-[44px]"
                >
                  Add Credit
                </Button>
              </div>

              {/* Record Payment */}
              <div>
                <h4 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Record Payment
                </h4>
                <FormField label="Amount">
                  <Input
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </FormField>
                <Button
                  variant="primary"
                  onClick={handleRecordPayment}
                  disabled={!paymentAmount || isSubmitting}
                  className="w-full min-h-[44px]"
                >
                  Record Payment
                </Button>
              </div>
            </div>
          )}

          {/* Loyalty Tab */}
          {mode === 'view' && activeTab === 'loyalty' && customer && (
            <div className="space-y-6">
              {/* Loyalty Summary */}
              <div className={`
                p-4 rounded-lg
                ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}
              `}>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Current Points
                </p>
                <p className="text-3xl font-bold text-blue-500">
                  {customer.loyalty_points}
                </p>
              </div>

              {/* Adjust Points */}
              <div>
                <h4 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Adjust Loyalty Points
                </h4>
                <FormField label="Points (positive to add, negative to redeem)">
                  <Input
                    type="number"
                    value={loyaltyPoints}
                    onChange={(e) => setLoyaltyPoints(e.target.value)}
                    placeholder="0"
                  />
                </FormField>
                <FormField label="Notes">
                  <Input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional notes"
                  />
                </FormField>
                <Button
                  variant="primary"
                  onClick={handleAdjustLoyalty}
                  disabled={!loyaltyPoints || isSubmitting}
                  className="w-full min-h-[44px]"
                >
                  Adjust Points
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {mode !== 'view' && (
          <div className={`
            flex gap-3 pt-4 border-t
            ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
          `}>
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1 min-h-[44px]"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!formData.name.trim() || isSubmitting}
              className="flex-1 min-h-[44px]"
            >
              {mode === 'add' ? 'Create Customer' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>
    </RightPanel>
  )
}

