import { useEffect } from 'react'
import { useAppStore, useInventoryStore } from '../../stores'
import { Input, LoadingSpinner } from '../common'
import { TouchSelect } from '../forms'

export function StockTransactionsList() {
  const { theme } = useAppStore()
  const {
    transactions,
    isLoading,
    transactionFilters,
    fetchTransactions,
    setTransactionFilters,
    clearTransactionFilters
  } = useInventoryStore()

  useEffect(() => {
    fetchTransactions()
  }, [transactionFilters, fetchTransactions])

  const transactionTypeOptions = [
    { value: null, label: 'All Types' },
    { value: 'purchase', label: 'Purchase', description: 'Stock added via purchase' },
    { value: 'sale', label: 'Sale', description: 'Stock reduced via sale' },
    { value: 'adjustment', label: 'Adjustment', description: 'Manual stock adjustment' },
    { value: 'return', label: 'Return', description: 'Stock returned' },
    { value: 'damage', label: 'Damage', description: 'Stock damaged/lost' },
    { value: 'transfer', label: 'Transfer', description: 'Stock transfer' }
  ]

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'sale':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'adjustment':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
      case 'return':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'damage':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      case 'transfer':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className={`
        p-4 rounded-xl space-y-3
        ${theme === 'dark'
          ? 'bg-gray-800/50 border border-gray-700'
          : 'bg-white border border-gray-200'
        }
      `}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Search */}
          <Input
            type="text"
            placeholder="Search by product, reference..."
            value={transactionFilters.search}
            onChange={(e) => setTransactionFilters({ search: e.target.value })}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />

          {/* Transaction Type Filter */}
          <TouchSelect<string | null>
            label="Transaction Type"
            value={transactionFilters.transactionType}
            options={transactionTypeOptions}
            onChange={(value) => setTransactionFilters({ transactionType: value })}
            searchable
            clearable
            placeholder="All Types"
          />
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            type="date"
            label="From Date"
            value={transactionFilters.dateFrom || ''}
            onChange={(e) => setTransactionFilters({ dateFrom: e.target.value || null })}
          />
          <Input
            type="date"
            label="To Date"
            value={transactionFilters.dateTo || ''}
            onChange={(e) => setTransactionFilters({ dateTo: e.target.value || null })}
          />
        </div>

        {/* Clear Filters */}
        {(transactionFilters.search || transactionFilters.transactionType || transactionFilters.dateFrom || transactionFilters.dateTo) && (
          <button
            onClick={clearTransactionFilters}
            className={`
              text-sm font-medium px-4 py-2 rounded-lg transition-colors
              ${theme === 'dark'
                ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }
            `}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Transactions List */}
      <div className={`
        rounded-xl overflow-hidden
        ${theme === 'dark'
          ? 'bg-gray-800/50 border border-gray-700'
          : 'bg-white border border-gray-200'
        }
      `}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="md" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8l2 2 4-4" />
            </svg>
            <p className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              No transactions found
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Transactions will appear here as they occur
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`
                ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}
              `}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Date & Time
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Type
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Product
                  </th>
                  <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Quantity
                  </th>
                  <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Before
                  </th>
                  <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    After
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Reference
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Performed By
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {transactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className={`
                      transition-colors
                      ${theme === 'dark' ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'}
                    `}
                  >
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                      {formatDate(transaction.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTransactionTypeColor(transaction.transaction_type)}`}>
                        {transaction.transaction_type}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                      {transaction.product_name || `Product #${transaction.product_id}`}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${
                      transaction.quantity > 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {transaction.quantity > 0 ? '+' : ''}{transaction.quantity}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {transaction.stock_before}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {transaction.stock_after}
                    </td>
                    <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {transaction.reference_number || '-'}
                    </td>
                    <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {transaction.performed_by_name || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
