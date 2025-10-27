import { useEffect, useState } from 'react'
import { useAppStore, useInventoryStore } from '../../stores'
import { Input, LoadingSpinner, Button } from '../common'
import { TouchSelect } from '../forms'
import { useCurrency } from '../../hooks/useCurrency'
import { TransactionDetailModal } from './TransactionDetailModal'
import { NewTransactionModal } from './NewTransactionModal'
import { TransactionAnalytics } from './TransactionAnalytics'
import type { StockTransaction } from '../../stores/inventoryStore'

export function EnhancedStockTransactionsList() {
  const { theme } = useAppStore()
  const {
    transactions,
    isLoading,
    transactionFilters,
    fetchTransactions,
    setTransactionFilters,
    clearTransactionFilters
  } = useInventoryStore()
  const { formatCurrency } = useCurrency()

  const [selectedTransactions, setSelectedTransactions] = useState<Set<number>>(new Set())
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'analytics'>('list')
  const [groupBy, setGroupBy] = useState<'none' | 'type' | 'date' | 'product'>('none')
  const [selectedTransaction, setSelectedTransaction] = useState<StockTransaction | null>(null)
  const [showNewTransaction, setShowNewTransaction] = useState(false)

  useEffect(() => {
    fetchTransactions()
  }, [transactionFilters])

  const handleTransactionSuccess = () => {
    fetchTransactions()
    setShowNewTransaction(false)
  }

  const handleExportCSV = () => {
    const headers = ['ID', 'Type', 'Product', 'Quantity', 'Unit Cost', 'Total Cost', 'Reference', 'Date', 'Notes']
    const rows = transactions.map(t => [
      t.id,
      t.transaction_type,
      t.product_name || 'Unknown',
      t.quantity,
      t.unit_cost || '',
      t.total_cost || '',
      t.reference_number || '',
      new Date(t.created_at).toLocaleString(),
      t.notes || ''
    ])

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `stock-transactions-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

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

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase': return '📥'
      case 'sale': return '📤'
      case 'adjustment': return '✏️'
      case 'return': return '↩️'
      case 'damage': return '⚠️'
      case 'transfer': return '🔄'
      default: return '📦'
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

  const toggleSelectTransaction = (id: number) => {
    const newSelected = new Set(selectedTransactions)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedTransactions(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedTransactions.size === transactions.length) {
      setSelectedTransactions(new Set())
    } else {
      setSelectedTransactions(new Set(transactions.map(t => t.id)))
    }
  }

  const groupedTransactions = () => {
    if (groupBy === 'none') return { 'All Transactions': transactions }
    
    const grouped: Record<string, typeof transactions> = {}
    transactions.forEach(t => {
      let key = ''
      if (groupBy === 'type') {
        key = t.transaction_type.charAt(0).toUpperCase() + t.transaction_type.slice(1)
      } else if (groupBy === 'date') {
        key = new Date(t.created_at).toLocaleDateString()
      } else if (groupBy === 'product') {
        key = t.product_name || 'Unknown Product'
      }
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(t)
    })
    return grouped
  }

  const calculateSummary = () => {
    const summary = {
      totalTransactions: transactions.length,
      totalValue: transactions.reduce((sum, t) => sum + (t.total_cost || 0), 0),
      stockIn: transactions.filter(t => t.quantity > 0).reduce((sum, t) => sum + t.quantity, 0),
      stockOut: transactions.filter(t => t.quantity < 0).reduce((sum, t) => sum + Math.abs(t.quantity), 0)
    }
    return summary
  }

  const summary = calculateSummary()

  return (
    <div className="space-y-4">
      {/* Enhanced Filters & Actions */}
      <div className={`
        p-4 rounded-xl space-y-4
        ${theme === 'dark'
          ? 'bg-gray-800/50 border border-gray-700'
          : 'bg-white border border-gray-200'
        }
      `}>
        {/* Top Row - Search & View Options */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <Input
              type="text"
              placeholder="Search by product, reference, notes..."
              value={transactionFilters.search}
              onChange={(e) => setTransactionFilters({ search: e.target.value })}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </div>

          {/* View Mode Toggle */}
          <div className={`flex gap-1 p-1 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? theme === 'dark' ? 'bg-primary-600 text-white' : 'bg-primary-500 text-white'
                  : theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
              title="List View"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? theme === 'dark' ? 'bg-primary-600 text-white' : 'bg-primary-500 text-white'
                  : theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Grid View"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`px-3 py-2 rounded-md transition-colors ${
                viewMode === 'analytics'
                  ? theme === 'dark' ? 'bg-primary-600 text-white' : 'bg-primary-500 text-white'
                  : theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Analytics View"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
          </div>

          {/* Bulk Actions */}
          {selectedTransactions.size > 0 && (
            <div className="flex items-center gap-2">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {selectedTransactions.size} selected
              </span>
              <Button variant="secondary" size="sm">
                Export Selected
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedTransactions(new Set())}>
                Clear
              </Button>
            </div>
          )}
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <TouchSelect<string | null>
            label="Transaction Type"
            value={transactionFilters.transactionType}
            options={transactionTypeOptions}
            onChange={(value) => setTransactionFilters({ transactionType: value })}
            searchable
            clearable
            placeholder="All Types"
          />

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

          <TouchSelect<string>
            label="Group By"
            value={groupBy}
            options={[
              { value: 'none', label: 'No Grouping' },
              { value: 'type', label: 'Transaction Type' },
              { value: 'date', label: 'Date' },
              { value: 'product', label: 'Product' }
            ]}
            onChange={(value) => setGroupBy(value as any)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearTransactionFilters}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            }
          >
            Clear Filters
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" onClick={() => setShowNewTransaction(true)}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Transaction
            </Button>
            <Button variant="secondary" size="sm" onClick={handleExportCSV}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <p className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Total Transactions
          </p>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {summary.totalTransactions}
          </p>
        </div>
        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <p className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Total Value
          </p>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {formatCurrency(summary.totalValue)}
          </p>
        </div>
        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <p className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Stock In
          </p>
          <p className={`text-2xl font-bold text-green-600 dark:text-green-400`}>
            +{summary.stockIn}
          </p>
        </div>
        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <p className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Stock Out
          </p>
          <p className={`text-2xl font-bold text-red-600 dark:text-red-400`}>
            -{summary.stockOut}
          </p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && transactions.length === 0 && (
        <div className={`
          p-12 rounded-xl text-center relative overflow-hidden
          ${theme === 'dark'
            ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700'
            : 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200'
          }
        `}>
          {/* Decorative background elements */}
          <div className={`absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 ${theme === 'dark' ? 'bg-blue-500' : 'bg-blue-300'}`}></div>
          <div className={`absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10 ${theme === 'dark' ? 'bg-indigo-500' : 'bg-indigo-300'}`}></div>
          
          <div className="relative z-10">
            <div className="mb-4 inline-block">
              <div className="text-6xl animate-bounce">📊</div>
            </div>
            <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {transactionFilters.search || transactionFilters.transactionType
                ? 'No Transactions Match Your Search'
                : 'Your Transaction Log is Empty'}
            </h3>
            <p className={`mb-2 text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {transactionFilters.search || transactionFilters.transactionType
                ? '🔍 Try adjusting your filters to find what you\'re looking for'
                : '✨ Start tracking your stock movements today!'}
            </p>
            <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {transactionFilters.search || transactionFilters.transactionType
                ? ''
                : 'Record purchases, sales, returns, damages, and transfers to maintain a complete audit trail of your inventory.'}
            </p>
            {!transactionFilters.search && !transactionFilters.transactionType && (
              <div className="space-y-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setShowNewTransaction(true)}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Your First Transaction
                </Button>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                  💡 Tip: You can record purchases, sales, returns, damages, and transfers
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics View */}
      {!isLoading && transactions.length > 0 && viewMode === 'analytics' && (
        <TransactionAnalytics transactions={transactions} />
      )}

      {/* Transactions Display */}
      {!isLoading && transactions.length > 0 && viewMode !== 'analytics' && (
        <div className="space-y-4">
          {Object.entries(groupedTransactions()).map(([groupName, groupTransactions]) => (
            <div key={groupName}>
              {groupBy !== 'none' && (
                <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {groupName} ({groupTransactions.length})
                </h3>
              )}

              {viewMode === 'list' ? (
                <div className={`
                  rounded-xl overflow-hidden
                  ${theme === 'dark'
                    ? 'bg-gray-800/50 border border-gray-700'
                    : 'bg-white border border-gray-200'
                  }
                `}>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className={`${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <tr>
                          <th className="px-4 py-3 text-left">
                            <input
                              type="checkbox"
                              checked={selectedTransactions.size === groupTransactions.length}
                              onChange={toggleSelectAll}
                              className="rounded"
                            />
                          </th>
                          <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Type
                          </th>
                          <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Product
                          </th>
                          <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Quantity
                          </th>
                          <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Value
                          </th>
                          <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Date
                          </th>
                          <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Reference
                          </th>
                          <th className={`px-4 py-3 text-center text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        {groupTransactions.map((transaction) => (
                          <tr
                            key={transaction.id}
                            className={`transition-colors ${theme === 'dark' ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'}`}
                          >
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={selectedTransactions.has(transaction.id)}
                                onChange={() => toggleSelectTransaction(transaction.id)}
                                className="rounded"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{getTransactionIcon(transaction.transaction_type)}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTransactionTypeColor(transaction.transaction_type)}`}>
                                  {transaction.transaction_type}
                                </span>
                              </div>
                            </td>
                            <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                              {transaction.product_name || 'Unknown Product'}
                            </td>
                            <td className={`px-4 py-3 text-right text-sm font-medium ${
                              transaction.quantity > 0
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {transaction.quantity > 0 ? '+' : ''}{transaction.quantity}
                            </td>
                            <td className={`px-4 py-3 text-right text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {transaction.total_cost ? formatCurrency(transaction.total_cost) : '-'}
                            </td>
                            <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {formatDate(transaction.created_at)}
                            </td>
                            <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {transaction.reference_number || '-'}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedTransaction(transaction)}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className={`p-4 rounded-xl transition-all hover:scale-105 ${
                        theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200 hover:shadow-lg'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-3xl">{getTransactionIcon(transaction.transaction_type)}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTransactionTypeColor(transaction.transaction_type)}`}>
                          {transaction.transaction_type}
                        </span>
                      </div>
                      <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {transaction.product_name || 'Unknown Product'}
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Quantity:</span>
                          <span className={`font-medium ${
                            transaction.quantity > 0
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {transaction.quantity > 0 ? '+' : ''}{transaction.quantity}
                          </span>
                        </div>
                        {transaction.total_cost && (
                          <div className="flex justify-between">
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Value:</span>
                            <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(transaction.total_cost)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Date:</span>
                          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <button
                          onClick={() => setSelectedTransaction(transaction)}
                          className={`mt-2 w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                            theme === 'dark'
                              ? 'bg-gray-700 hover:bg-gray-600 text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                          }`}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}

      {showNewTransaction && (
        <NewTransactionModal
          onClose={() => setShowNewTransaction(false)}
          onSuccess={handleTransactionSuccess}
        />
      )}
    </div>
  )
}
