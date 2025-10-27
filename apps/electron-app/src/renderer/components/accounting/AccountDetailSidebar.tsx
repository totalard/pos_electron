import { useState, useEffect } from 'react'
import { useAppStore } from '../../stores'
import { useCurrency } from '../../hooks/useCurrency'
import { Sidebar } from '../common'
import { accountingAPI } from '../../services/accountingAPI'
import type { Account, AccountBalance } from '../../types/accounting'

interface AccountDetailSidebarProps {
  isOpen: boolean
  onClose: () => void
  account: Account | null
  onEdit?: (account: Account) => void
}

export function AccountDetailSidebar({ isOpen, onClose, account, onEdit }: AccountDetailSidebarProps) {
  const { theme } = useAppStore()
  const { formatCurrency } = useCurrency()
  
  const [balanceData, setBalanceData] = useState<AccountBalance | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && account) {
      loadBalanceData()
    }
  }, [isOpen, account])

  const loadBalanceData = async () => {
    if (!account) return
    
    try {
      setLoading(true)
      setError(null)
      const data = await accountingAPI.getAccountBalance(account.id)
      setBalanceData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load balance data')
    } finally {
      setLoading(false)
    }
  }

  if (!account) return null

  const getTypeColor = (type: string) => {
    const colors = {
      asset: 'text-blue-600 bg-blue-100',
      liability: 'text-red-600 bg-red-100',
      equity: 'text-purple-600 bg-purple-100',
      income: 'text-green-600 bg-green-100',
      expense: 'text-orange-600 bg-orange-100'
    }
    return colors[type as keyof typeof colors] || 'text-gray-600 bg-gray-100'
  }

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  return (
    <Sidebar
      isOpen={isOpen}
      onClose={onClose}
      title="Account Details"
      width="lg"
      contentVariant="default"
      footerContent={
        onEdit && (
          <div className="p-6">
            <button
              onClick={() => {
                onEdit(account)
                onClose()
              }}
              className="w-full px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium transition-colors"
            >
              Edit Account
            </button>
          </div>
        )
      }
    >
      <div className="space-y-6">
        {/* Header Info */}
        <div className={`p-4 rounded-lg border ${
          theme === 'dark' ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {account.account_name}
                </h3>
                {account.is_system && (
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                  </svg>
                )}
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Code: {account.account_code}
              </p>
            </div>
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
              account.is_active
                ? 'text-green-600 bg-green-100'
                : 'text-gray-600 bg-gray-100'
            }`}>
              {account.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 text-xs font-medium rounded ${getTypeColor(account.account_type)}`}>
              {getTypeLabel(account.account_type)}
            </span>
            {account.account_subtype && (
              <span className={`px-2 py-1 text-xs font-medium rounded ${
                theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
              }`}>
                {account.account_subtype.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            )}
          </div>
        </div>

        {/* Current Balance */}
        <div className={`p-6 rounded-lg border ${
          theme === 'dark' ? 'bg-gray-750 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Current Balance
          </p>
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {formatCurrency(account.current_balance)}
          </p>
        </div>

        {/* Balance Details */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        ) : balanceData && (
          <div className={`p-4 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-750 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h4 className={`text-sm font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Transaction Summary
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Debits
                </span>
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(balanceData.total_debit)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Credits
                </span>
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(balanceData.total_credit)}
                </span>
              </div>
              <div className={`pt-3 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Transactions
                  </span>
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {balanceData.transaction_count}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        {account.description && (
          <div className={`p-4 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-750 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h4 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Description
            </h4>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {account.description}
            </p>
          </div>
        )}

        {/* Parent Account */}
        {account.parent_account_name && (
          <div className={`p-4 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-750 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h4 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Parent Account
            </h4>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {account.parent_account_name}
            </p>
          </div>
        )}

        {/* Metadata */}
        <div className={`p-4 rounded-lg border ${
          theme === 'dark' ? 'bg-gray-750 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Metadata
          </h4>
          <div className="space-y-2">
            {account.created_by_name && (
              <div className="flex justify-between items-center">
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Created By
                </span>
                <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {account.created_by_name}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Created At
              </span>
              <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {new Date(account.created_at).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Last Updated
              </span>
              <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {new Date(account.updated_at).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  )
}
