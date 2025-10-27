import { useEffect, useState } from 'react'
import { useAppStore, useInventoryStore } from '../../stores'
import { Input, LoadingSpinner, Button } from '../common'
import { TouchSelect } from '../forms'
import { AdjustmentDetailModal } from './AdjustmentDetailModal'
import { QuickAdjustmentModal } from './QuickAdjustmentModal'
import type { StockAdjustment } from '../../stores/inventoryStore'

export function StockAdjustmentsList() {
  const { theme } = useAppStore()
  const {
    adjustments,
    isLoading,
    adjustmentFilters,
    fetchAdjustments,
    setAdjustmentFilters,
    clearAdjustmentFilters
  } = useInventoryStore()

  const [selectedAdjustment, setSelectedAdjustment] = useState<StockAdjustment | null>(null)
  const [showQuickAdjustment, setShowQuickAdjustment] = useState(false)

  useEffect(() => {
    fetchAdjustments()
  }, [adjustmentFilters])

  const handleQuickAdjustmentSuccess = () => {
    fetchAdjustments()
    setShowQuickAdjustment(false)
  }

  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Reason', 'Status', 'Items', 'Total Variance', 'Performed By', 'Notes']
    const rows = adjustments.map(adj => [
      adj.id,
      new Date(adj.adjustment_date).toLocaleString(),
      adj.reason,
      adj.is_completed ? 'Completed' : 'Pending',
      adj.lines?.length || 0,
      adj.lines?.reduce((sum, line) => sum + Math.abs(line.difference), 0) || 0,
      adj.performed_by_name || 'Unknown',
      adj.notes || ''
    ])

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `stock-adjustments-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const statusOptions = [
    { value: null, label: 'All Status' },
    { value: true, label: 'Completed' },
    { value: false, label: 'Pending' }
  ]

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

  const handleViewDetails = (adjustment: StockAdjustment) => {
    setSelectedAdjustment(adjustment)
  }

  const handleCloseDetails = () => {
    setSelectedAdjustment(null)
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search */}
          <Input
            type="text"
            placeholder="Search by reason, notes..."
            value={adjustmentFilters.search}
            onChange={(e) => setAdjustmentFilters({ search: e.target.value })}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />

          {/* Status Filter */}
          <TouchSelect<boolean | null>
            label="Status"
            value={adjustmentFilters.isCompleted}
            options={statusOptions}
            onChange={(value) => setAdjustmentFilters({ isCompleted: value })}
            searchable={false}
            clearable
            placeholder="All Status"
          />

          {/* Clear Filters */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="md"
              onClick={clearAdjustmentFilters}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              }
            >
              Clear Filters
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={handleExportCSV}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              }
            >
              Export CSV
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setShowQuickAdjustment(true)}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
            >
              Quick Adjust
            </Button>
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            type="date"
            label="From Date"
            value={adjustmentFilters.dateFrom || ''}
            onChange={(e) => setAdjustmentFilters({ dateFrom: e.target.value || null })}
          />
          <Input
            type="date"
            label="To Date"
            value={adjustmentFilters.dateTo || ''}
            onChange={(e) => setAdjustmentFilters({ dateTo: e.target.value || null })}
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Adjustments List */}
      {!isLoading && adjustments.length === 0 && (
        <div className={`
          p-12 rounded-xl text-center relative overflow-hidden
          ${theme === 'dark'
            ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700'
            : 'bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200'
          }
        `}>
          {/* Decorative background elements */}
          <div className={`absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 ${theme === 'dark' ? 'bg-purple-500' : 'bg-purple-300'}`}></div>
          <div className={`absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10 ${theme === 'dark' ? 'bg-pink-500' : 'bg-pink-300'}`}></div>
          
          <div className="relative z-10">
            <div className="mb-4 inline-block">
              <div className="text-6xl animate-pulse">⚡</div>
            </div>
            <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {adjustmentFilters.search || adjustmentFilters.isCompleted !== null
                ? 'No Adjustments Match Your Search'
                : 'No Stock Adjustments Yet'}
            </h3>
            <p className={`mb-2 text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {adjustmentFilters.search || adjustmentFilters.isCompleted !== null
                ? '🔍 Try adjusting your filters to find what you\'re looking for'
                : '🎯 Perfect your inventory with quick adjustments!'}
            </p>
            <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {adjustmentFilters.search || adjustmentFilters.isCompleted !== null
                ? ''
                : 'Make physical count adjustments, correct discrepancies, and manage inventory variances with ease.'}
            </p>
            {!adjustmentFilters.search && adjustmentFilters.isCompleted === null && (
              <div className="space-y-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setShowQuickAdjustment(true)}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Create Your First Adjustment
                </Button>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                  💡 Tip: Use quick adjustments for fast physical count corrections
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {!isLoading && adjustments.length > 0 && (
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
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Date
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Reason
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Items
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Status
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Performed By
                  </th>
                  <th className={`px-4 py-3 text-center text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {adjustments.map((adjustment) => (
                  <tr
                    key={adjustment.id}
                    className={`transition-colors ${theme === 'dark' ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'}`}
                  >
                    <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                      {formatDate(adjustment.adjustment_date)}
                    </td>
                    <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                      <div className="font-medium">{adjustment.reason}</div>
                      {adjustment.notes && (
                        <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                          {adjustment.notes.substring(0, 50)}{adjustment.notes.length > 50 ? '...' : ''}
                        </div>
                      )}
                    </td>
                    <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {adjustment.lines?.length || 0} items
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${adjustment.is_completed
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }
                      `}>
                        {adjustment.is_completed ? 'Completed' : 'Pending'}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {adjustment.performed_by_name || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(adjustment)}
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
      )}

      {/* Modals */}
      {selectedAdjustment && (
        <AdjustmentDetailModal
          adjustment={selectedAdjustment}
          onClose={handleCloseDetails}
        />
      )}

      {showQuickAdjustment && (
        <QuickAdjustmentModal
          onClose={() => setShowQuickAdjustment(false)}
          onSuccess={handleQuickAdjustmentSuccess}
        />
      )}
    </div>
  )
}
