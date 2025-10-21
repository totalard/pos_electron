import { useState, useEffect } from 'react'
import { useAppStore } from '../../stores'
import { PageHeader, PageContainer } from '../layout'
import { Button, Input, ThemeToggle } from '../common'
import { DateRangePicker } from '../forms'

interface TransactionManagementScreenProps {
  onBack: () => void
}

interface Transaction {
  id: number
  transaction_type: string
  amount: number
  description: string
  reference_number?: string
  status?: string
  user_name?: string
  customer_name?: string
  created_at: string
  metadata?: Record<string, any>
}

interface TransactionSummary {
  total_sales: number
  total_cash_in: number
  total_cash_out: number
  total_expenses: number
  total_credit_sales: number
  total_payments: number
  net_cash_flow: number
  transaction_count: number
}

const API_BASE_URL = 'http://localhost:8000/api'

export function TransactionManagementScreen({ onBack }: TransactionManagementScreenProps) {
  const { theme } = useAppStore()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [summary, setSummary] = useState<TransactionSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const transactionTypes = [
    { id: 'sale', label: 'Sales', color: 'bg-blue-500' },
    { id: 'stock_in', label: 'Stock In', color: 'bg-green-500' },
    { id: 'stock_out', label: 'Stock Out', color: 'bg-orange-500' },
    { id: 'cash_in', label: 'Cash In', color: 'bg-emerald-500' },
    { id: 'cash_out', label: 'Cash Out', color: 'bg-red-500' },
    { id: 'expense', label: 'Expenses', color: 'bg-purple-500' },
    { id: 'credit', label: 'Credit Sales', color: 'bg-yellow-500' },
    { id: 'payment', label: 'Payments', color: 'bg-cyan-500' }
  ]

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setHasSearched(true)

      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: '50'
      })

      if (selectedTypes.length > 0) {
        params.append('transaction_types', selectedTypes.join(','))
      }
      if (startDate) {
        params.append('start_date', startDate.toISOString().split('T')[0])
      }
      if (endDate) {
        params.append('end_date', endDate.toISOString().split('T')[0])
      }
      if (searchQuery) {
        params.append('search_query', searchQuery)
      }

      const response = await fetch(`${API_BASE_URL}/transactions/overview?${params}`)
      if (!response.ok) throw new Error('Failed to fetch transactions')

      const data = await response.json()
      setTransactions(data.transactions)
      setSummary(data.summary)
      setTotalPages(Math.ceil(data.total / 50))
    } catch (err) {
      console.error('Error fetching transactions:', err)
      setError('Failed to load transactions')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [currentPage, selectedTypes, startDate, endDate])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchTransactions()
  }

  const toggleTypeFilter = (typeId: string) => {
    setSelectedTypes(prev =>
      prev.includes(typeId)
        ? prev.filter(t => t !== typeId)
        : [...prev, typeId]
    )
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSelectedTypes([])
    setStartDate(null)
    setEndDate(null)
    setSearchQuery('')
    setCurrentPage(1)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTypeColor = (type: string) => {
    return transactionTypes.find(t => t.id === type)?.color || 'bg-gray-500'
  }

  const getTypeLabel = (type: string) => {
    return transactionTypes.find(t => t.id === type)?.label || type
  }

  return (
    <div className={`
      min-h-screen
      ${theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
      }
    `}>
      <PageContainer>
        <PageHeader
          title="Transaction Management"
          subtitle="View and manage all transactions"
          showBackButton
          onBack={onBack}
          actions={
            <div className="flex items-center gap-3">
              <ThemeToggle size="sm" />
            </div>
          }
        />

        <div className="p-6 space-y-6">
        {/* Enhanced Summary Dashboard */}
        {summary && (
          <div className="space-y-4">
            {/* Primary Stats - Top Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`rounded-xl p-6 border transition-all hover:shadow-lg ${theme === 'dark' ? 'bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-700/50' : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'}`}>
                    <svg className={`w-6 h-6 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Sales
                </p>
                <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                  {formatCurrency(summary.total_sales)}
                </p>
              </div>

              <div className={`rounded-xl p-6 border transition-all hover:shadow-lg ${theme === 'dark' ? 'bg-gradient-to-br from-red-900/20 to-red-800/10 border-red-700/50' : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-red-500/20' : 'bg-red-100'}`}>
                    <svg className={`w-6 h-6 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Expenses
                </p>
                <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                  {formatCurrency(summary.total_expenses)}
                </p>
              </div>

              <div className={`rounded-xl p-6 border transition-all hover:shadow-lg ${summary.net_cash_flow >= 0 ? (theme === 'dark' ? 'bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-700/50' : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200') : (theme === 'dark' ? 'bg-gradient-to-br from-orange-900/20 to-orange-800/10 border-orange-700/50' : 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200')}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${summary.net_cash_flow >= 0 ? (theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100') : (theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-100')}`}>
                    <svg className={`w-6 h-6 ${summary.net_cash_flow >= 0 ? (theme === 'dark' ? 'text-blue-400' : 'text-blue-600') : (theme === 'dark' ? 'text-orange-400' : 'text-orange-600')}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Net Cash Flow
                </p>
                <p className={`text-3xl font-bold ${summary.net_cash_flow >= 0 ? (theme === 'dark' ? 'text-blue-400' : 'text-blue-600') : (theme === 'dark' ? 'text-orange-400' : 'text-orange-600')}`}>
                  {formatCurrency(summary.net_cash_flow)}
                </p>
              </div>

              <div className={`rounded-xl p-6 border transition-all hover:shadow-lg ${theme === 'dark' ? 'bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-700/50' : 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                    <svg className={`w-6 h-6 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Transactions
                </p>
                <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                  {summary.transaction_count}
                </p>
              </div>
            </div>

            {/* Secondary Stats - Bottom Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`rounded-xl p-5 border ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Cash In
                    </p>
                    <p className={`text-lg font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      {formatCurrency(summary.total_cash_in)}
                    </p>
                  </div>
                  <svg className={`w-8 h-8 ${theme === 'dark' ? 'text-emerald-400/30' : 'text-emerald-600/30'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>

              <div className={`rounded-xl p-5 border ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Cash Out
                    </p>
                    <p className={`text-lg font-bold ${theme === 'dark' ? 'text-rose-400' : 'text-rose-600'}`}>
                      {formatCurrency(summary.total_cash_out)}
                    </p>
                  </div>
                  <svg className={`w-8 h-8 ${theme === 'dark' ? 'text-rose-400/30' : 'text-rose-600/30'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </div>
              </div>

              <div className={`rounded-xl p-5 border ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Credit Sales
                    </p>
                    <p className={`text-lg font-bold ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
                      {formatCurrency(summary.total_credit_sales)}
                    </p>
                  </div>
                  <svg className={`w-8 h-8 ${theme === 'dark' ? 'text-yellow-400/30' : 'text-yellow-600/30'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
              </div>

              <div className={`rounded-xl p-5 border ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Payments Received
                    </p>
                    <p className={`text-lg font-bold ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>
                      {formatCurrency(summary.total_payments)}
                    </p>
                  </div>
                  <svg className={`w-8 h-8 ${theme === 'dark' ? 'text-cyan-400/30' : 'text-cyan-600/30'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Filters
          </h3>

          {/* Search */}
          <div className="mb-4">
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transactions..."
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch}>Search</Button>
            </div>
          </div>

          {/* Date Range */}
          <div className="mb-4">
            <DateRangePicker
              label="Date Range"
              startDate={startDate}
              endDate={endDate}
              onChange={(start, end) => {
                setStartDate(start)
                setEndDate(end)
                setCurrentPage(1)
              }}
              showPresets
              clearable
              fullWidth
            />
          </div>

          {/* Transaction Types */}
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Transaction Types
            </label>
            <div className="flex flex-wrap gap-2">
              {transactionTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => toggleTypeFilter(type.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedTypes.includes(type.id)
                      ? `${type.color} text-white`
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={clearFilters} variant="secondary">
            Clear Filters
          </Button>
        </div>

        {/* Transactions List */}
        <div className={`rounded-xl overflow-hidden ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="p-6">
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Transactions
            </h3>

            {isLoading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mb-4"
                  style={{ borderColor: theme === 'dark' ? '#60a5fa' : '#3b82f6', borderRightColor: 'transparent' }}
                />
                <p className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Loading transactions...
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <svg className={`mx-auto h-16 w-16 mb-4 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                  Error Loading Transactions
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {error}
                </p>
                <Button onClick={fetchTransactions} variant="primary" className="mt-4">
                  Try Again
                </Button>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-16">
                <svg className={`mx-auto h-16 w-16 mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {hasSearched && (selectedTypes.length > 0 || startDate || endDate || searchQuery) 
                    ? 'No Matching Transactions' 
                    : 'No Transactions Yet'}
                </p>
                <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {hasSearched && (selectedTypes.length > 0 || startDate || endDate || searchQuery)
                    ? 'Try adjusting your filters to see more results'
                    : 'Transactions will appear here once you start making sales, expenses, or other activities'}
                </p>
                {(selectedTypes.length > 0 || startDate || endDate || searchQuery) && (
                  <Button onClick={clearFilters} variant="secondary">
                    Clear All Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map((transaction) => (
                  <div
                    key={`${transaction.transaction_type}-${transaction.id}`}
                    className={`p-4 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    } transition-colors cursor-pointer`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getTypeColor(transaction.transaction_type)}`}>
                          {getTypeLabel(transaction.transaction_type)}
                        </span>
                        <div className="flex-1">
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {transaction.description}
                          </p>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {transaction.reference_number && (
                              <span className="mr-4">Ref: {transaction.reference_number}</span>
                            )}
                            {transaction.user_name && (
                              <span className="mr-4">By: {transaction.user_name}</span>
                            )}
                            {transaction.customer_name && (
                              <span>Customer: {transaction.customer_name}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          ['cash_in', 'sale', 'payment'].includes(transaction.transaction_type)
                            ? theme === 'dark' ? 'text-green-400' : 'text-green-600'
                            : theme === 'dark' ? 'text-red-400' : 'text-red-600'
                        }`}>
                          {['cash_in', 'sale', 'payment'].includes(transaction.transaction_type) ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {formatDate(transaction.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={`border-t p-4 flex items-center justify-between ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <Button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                variant="secondary"
              >
                Previous
              </Button>
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                Page {currentPage} of {totalPages}
              </span>
              <Button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                variant="secondary"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
      </PageContainer>
    </div>
  )
}
