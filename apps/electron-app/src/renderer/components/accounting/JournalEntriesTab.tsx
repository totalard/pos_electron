import { useState, useEffect } from 'react'
import { useAppStore } from '../../stores'
import { useCurrency } from '../../hooks/useCurrency'
import { accountingAPI } from '../../services/accountingAPI'
import { JournalEntryFormSidebar } from './JournalEntryFormSidebar'
import type { JournalEntry } from '../../types/accounting'

export function JournalEntriesTab() {
  const { theme } = useAppStore()
  const { formatCurrency } = useCurrency()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFormSidebar, setShowFormSidebar] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [posting, setPosting] = useState<number | null>(null)

  useEffect(() => {
    loadEntries()
  }, [filterStatus, filterType])

  const loadEntries = async () => {
    try {
      setLoading(true)
      setError(null)
      const filters: any = {}
      if (filterStatus !== 'all') filters.status = filterStatus
      if (filterType !== 'all') filters.entry_type = filterType
      const data = await accountingAPI.getJournalEntries(filters)
      setEntries(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load entries')
    } finally {
      setLoading(false)
    }
  }

  const handlePostEntry = async (entryId: number) => {
    try {
      setPosting(entryId)
      await accountingAPI.postJournalEntry(entryId)
      await loadEntries()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post entry')
    } finally {
      setPosting(null)
    }
  }

  const filteredEntries = entries.filter(entry => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      entry.entry_number.toLowerCase().includes(query) ||
      entry.description.toLowerCase().includes(query)
    )
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'posted':
        return 'text-green-600 bg-green-100'
      case 'void':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-yellow-600 bg-yellow-100'
    }
  }

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Journal Entries
          </h2>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Record and manage accounting transactions
          </p>
        </div>
        <button
          onClick={() => setShowFormSidebar(true)}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Entry
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search entries..."
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
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={`px-4 py-2 rounded-lg border ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-700 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="posted">Posted</option>
          <option value="void">Void</option>
        </select>
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
          <option value="general">General</option>
          <option value="sales">Sales</option>
          <option value="purchase">Purchase</option>
          <option value="payment">Payment</option>
          <option value="receipt">Receipt</option>
          <option value="adjustment">Adjustment</option>
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
                    Entry #
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Date
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Description
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Type
                  </th>
                  <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Amount
                  </th>
                  <th className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center">
                      <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        No journal entries found
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry) => (
                    <tr
                      key={entry.id}
                      onClick={() => {
                        setSelectedEntry(entry)
                        setShowFormSidebar(true)
                      }}
                      className={`hover:bg-opacity-50 cursor-pointer ${
                        theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        {entry.entry_number}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {new Date(entry.entry_date).toLocaleDateString()}
                      </td>
                      <td className={`px-6 py-4 text-sm ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        <div className="max-w-xs truncate">{entry.description}</div>
                        {entry.reference_number && (
                          <div className={`text-xs mt-1 ${
                            theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                          }`}>
                            Ref: {entry.reference_number}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {getTypeLabel(entry.entry_type)}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        {formatCurrency(entry.total_debit)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(entry.status)}`}>
                          {entry.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {entry.status === 'draft' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePostEntry(entry.id)
                            }}
                            disabled={posting === entry.id}
                            className="px-3 py-1 text-xs bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50 transition-colors"
                          >
                            {posting === entry.id ? 'Posting...' : 'Post'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Sidebar */}
      <JournalEntryFormSidebar
        isOpen={showFormSidebar}
        onClose={() => {
          setShowFormSidebar(false)
          setSelectedEntry(null)
        }}
        onSuccess={() => {
          setShowFormSidebar(false)
          setSelectedEntry(null)
          loadEntries()
        }}
        entry={selectedEntry}
      />
    </div>
  )
}
