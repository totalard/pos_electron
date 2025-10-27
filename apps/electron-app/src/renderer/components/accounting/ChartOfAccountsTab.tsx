import { useState, useEffect } from 'react'
import { useAppStore } from '../../stores'
import { useCurrency } from '../../hooks/useCurrency'
import { accountingAPI } from '../../services/accountingAPI'
import { AccountFormSidebar } from './AccountFormSidebar'
import { AccountDetailSidebar } from './AccountDetailSidebar'
import type { Account, AccountType } from '../../types/accounting'

export function ChartOfAccountsTab() {
  const { theme } = useAppStore()
  const { formatCurrency } = useCurrency()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [showFormSidebar, setShowFormSidebar] = useState(false)
  const [showDetailSidebar, setShowDetailSidebar] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)

  useEffect(() => {
    loadAccounts()
  }, [filterType])

  const loadAccounts = async () => {
    try {
      setLoading(true)
      setError(null)
      const filters = filterType !== 'all' ? { account_type: filterType } : undefined
      const data = await accountingAPI.getAccounts(filters)
      setAccounts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load accounts')
    } finally {
      setLoading(false)
    }
  }

  const filteredAccounts = accounts.filter(acc =>
    acc.account_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    acc.account_code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const accountsByType = filteredAccounts.reduce((acc, account) => {
    const type = account.account_type
    if (!acc[type]) acc[type] = []
    acc[type].push(account)
    return acc
  }, {} as Record<string, Account[]>)

  const getTypeColor = (type: AccountType) => {
    const colors = {
      asset: 'text-blue-600 bg-blue-100',
      liability: 'text-red-600 bg-red-100',
      equity: 'text-purple-600 bg-purple-100',
      income: 'text-green-600 bg-green-100',
      expense: 'text-orange-600 bg-orange-100'
    }
    return colors[type] || 'text-gray-600 bg-gray-100'
  }

  const getTypeLabel = (type: AccountType) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Chart of Accounts
          </h2>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage your business accounts and track balances
          </p>
        </div>
        <button
          onClick={() => {
            setEditingAccount(null)
            setShowFormSidebar(true)
          }}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Account
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search accounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className={`px-4 py-2 rounded-lg border ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-700 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="all">All Types</option>
          <option value="asset">Assets</option>
          <option value="liability">Liabilities</option>
          <option value="equity">Equity</option>
          <option value="income">Income</option>
          <option value="expense">Expenses</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {(['asset', 'liability', 'equity', 'income', 'expense'] as AccountType[]).map((type) => {
              const typeAccounts = accountsByType[type] || []
              const totalBalance = typeAccounts.reduce((sum, acc) => sum + acc.current_balance, 0)
              return (
                <div
                  key={type}
                  className={`p-4 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className={`text-xs font-medium mb-1 ${getTypeColor(type)} px-2 py-1 rounded inline-block`}>
                    {getTypeLabel(type)}
                  </div>
                  <div className={`text-2xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(totalBalance)}
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {typeAccounts.length} accounts
                  </div>
                </div>
              )
            })}
          </div>

          {/* Accounts Table */}
          <div className={`rounded-lg border overflow-hidden ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={theme === 'dark' ? 'bg-gray-750' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Code
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Account Name
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Type
                    </th>
                    <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Balance
                    </th>
                    <th className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {filteredAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center">
                        <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                          No accounts found
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAccounts.map((account) => (
                      <tr
                        key={account.id}
                        onClick={() => {
                          setSelectedAccount(account)
                          setShowDetailSidebar(true)
                        }}
                        className={`hover:bg-opacity-50 cursor-pointer ${
                          theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                        }`}>
                          {account.account_code}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                        }`}>
                          <div className="flex items-center gap-2">
                            {account.is_system && (
                              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                              </svg>
                            )}
                            <span className="text-sm">{account.account_name}</span>
                          </div>
                          {account.description && (
                            <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                              {account.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getTypeColor(account.account_type)}`}>
                            {getTypeLabel(account.account_type)}
                          </span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                        }`}>
                          {formatCurrency(account.current_balance)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            account.is_active
                              ? 'text-green-600 bg-green-100'
                              : 'text-gray-600 bg-gray-100'
                          }`}>
                            {account.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Form Sidebar */}
      <AccountFormSidebar
        isOpen={showFormSidebar}
        onClose={() => {
          setShowFormSidebar(false)
          setEditingAccount(null)
        }}
        onSuccess={() => {
          setShowFormSidebar(false)
          setEditingAccount(null)
          loadAccounts()
        }}
        account={editingAccount}
      />

      {/* Detail Sidebar */}
      <AccountDetailSidebar
        isOpen={showDetailSidebar}
        onClose={() => {
          setShowDetailSidebar(false)
          setSelectedAccount(null)
        }}
        account={selectedAccount}
        onEdit={(account) => {
          setEditingAccount(account)
          setShowFormSidebar(true)
        }}
      />
    </div>
  )
}
