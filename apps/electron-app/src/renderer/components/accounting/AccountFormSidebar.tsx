import { useState, useEffect } from 'react'
import { useAppStore } from '../../stores'
import { useCurrency } from '../../hooks/useCurrency'
import { Sidebar } from '../common'
import { accountingAPI } from '../../services/accountingAPI'
import type { Account, AccountCreate, AccountType, AccountSubType } from '../../types/accounting'

interface AccountFormSidebarProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  account?: Account | null
}

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: 'asset', label: 'Asset' },
  { value: 'liability', label: 'Liability' },
  { value: 'equity', label: 'Equity' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' }
]

const ACCOUNT_SUBTYPES: { value: AccountSubType; label: string; types: AccountType[] }[] = [
  { value: 'cash', label: 'Cash', types: ['asset'] },
  { value: 'bank', label: 'Bank', types: ['asset'] },
  { value: 'inventory', label: 'Inventory', types: ['asset'] },
  { value: 'accounts_receivable', label: 'Accounts Receivable', types: ['asset'] },
  { value: 'accounts_payable', label: 'Accounts Payable', types: ['liability'] },
  { value: 'owners_capital', label: "Owner's Capital", types: ['equity'] },
  { value: 'retained_earnings', label: 'Retained Earnings', types: ['equity'] },
  { value: 'sales_revenue', label: 'Sales Revenue', types: ['income'] },
  { value: 'other_income', label: 'Other Income', types: ['income'] },
  { value: 'cost_of_goods_sold', label: 'Cost of Goods Sold', types: ['expense'] },
  { value: 'operating_expenses', label: 'Operating Expenses', types: ['expense'] },
  { value: 'rent', label: 'Rent', types: ['expense'] },
  { value: 'utilities', label: 'Utilities', types: ['expense'] },
  { value: 'salaries', label: 'Salaries', types: ['expense'] },
  { value: 'supplies', label: 'Supplies', types: ['expense'] },
  { value: 'marketing', label: 'Marketing', types: ['expense'] },
  { value: 'maintenance', label: 'Maintenance', types: ['expense'] },
  { value: 'transportation', label: 'Transportation', types: ['expense'] },
  { value: 'insurance', label: 'Insurance', types: ['expense'] },
  { value: 'taxes', label: 'Taxes', types: ['expense'] },
  { value: 'other_expenses', label: 'Other Expenses', types: ['expense'] }
]

export function AccountFormSidebar({ isOpen, onClose, onSuccess, account }: AccountFormSidebarProps) {
  const { theme } = useAppStore()
  const { formatCurrency } = useCurrency()
  
  const [formData, setFormData] = useState<AccountCreate>({
    account_code: '',
    account_name: '',
    account_type: 'asset',
    description: '',
    current_balance: 0,
    is_active: true
  })
  
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load account data when editing
  useEffect(() => {
    if (account) {
      setFormData({
        account_code: account.account_code,
        account_name: account.account_name,
        account_type: account.account_type,
        account_subtype: account.account_subtype,
        description: account.description || '',
        current_balance: account.current_balance,
        is_active: account.is_active,
        parent_account_id: account.parent_account_id
      })
    } else {
      // Reset form for new account
      setFormData({
        account_code: '',
        account_name: '',
        account_type: 'asset',
        description: '',
        current_balance: 0,
        is_active: true
      })
    }
    setError(null)
  }, [account, isOpen])

  const availableSubtypes = ACCOUNT_SUBTYPES.filter(st => 
    st.types.includes(formData.account_type)
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSubmitting(true)
      setError(null)
      
      if (account) {
        await accountingAPI.updateAccount(account.id, formData)
      } else {
        await accountingAPI.createAccount(formData)
      }
      
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save account')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!submitting) {
      onClose()
    }
  }

  return (
    <Sidebar
      isOpen={isOpen}
      onClose={handleClose}
      title={account ? 'Edit Account' : 'Create Account'}
      width="md"
      contentVariant="form"
      footerContent={
        <div className="p-6 flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className={`flex-1 px-4 py-2.5 rounded-lg border font-medium transition-colors ${
              theme === 'dark'
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50'
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="account-form"
            disabled={submitting}
            className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 font-medium transition-colors"
          >
            {submitting ? 'Saving...' : account ? 'Update Account' : 'Create Account'}
          </button>
        </div>
      }
    >
      <form id="account-form" onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Account Code & Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Account Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.account_code}
              onChange={(e) => setFormData({ ...formData, account_code: e.target.value })}
              placeholder="e.g., 1000"
              className={`w-full px-3 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Account Type <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.account_type}
              onChange={(e) => setFormData({ 
                ...formData, 
                account_type: e.target.value as AccountType,
                account_subtype: undefined // Reset subtype when type changes
              })}
              className={`w-full px-3 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
            >
              {ACCOUNT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Account Name */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Account Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.account_name}
            onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
            placeholder="e.g., Petty Cash"
            className={`w-full px-3 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
          />
        </div>

        {/* Account Subtype */}
        {availableSubtypes.length > 0 && (
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Account Subtype
            </label>
            <select
              value={formData.account_subtype || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                account_subtype: e.target.value as AccountSubType || undefined
              })}
              className={`w-full px-3 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
            >
              <option value="">None</option>
              {availableSubtypes.map((subtype) => (
                <option key={subtype.value} value={subtype.value}>
                  {subtype.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Description */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            placeholder="Optional description"
            className={`w-full px-3 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none`}
          />
        </div>

        {/* Opening Balance */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {account ? 'Current Balance' : 'Opening Balance'}
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.current_balance}
            onChange={(e) => setFormData({ ...formData, current_balance: parseFloat(e.target.value) || 0 })}
            className={`w-full px-3 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
          />
          {account && (
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Note: Modifying balance directly is not recommended. Use journal entries instead.
            </p>
          )}
        </div>

        {/* Active Status */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
          />
          <label 
            htmlFor="is_active" 
            className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
          >
            Active Account
          </label>
        </div>

        {account?.is_system && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-800">System Account</p>
                <p className="text-xs text-yellow-700 mt-1">
                  This is a system-managed account. Some fields may be restricted.
                </p>
              </div>
            </div>
          </div>
        )}
      </form>
    </Sidebar>
  )
}
