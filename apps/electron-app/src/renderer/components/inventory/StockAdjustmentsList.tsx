import { useEffect, useState } from 'react'
import { useAppStore, useInventoryStore } from '../../stores'
import { Input, LoadingSpinner, Button } from '../common'
import { TouchSelect } from '../forms'
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

  useEffect(() => {
    fetchAdjustments()
  }, [adjustmentFilters, fetchAdjustments])

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
          p-12 rounded-xl text-center
          ${theme === 'dark'
            ? 'bg-gray-800/50 border border-gray-700'
            : 'bg-white border border-gray-200'
          }
        `}>
          <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            No Adjustments Found
          </h3>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {adjustmentFilters.search || adjustmentFilters.isCompleted !== null
              ? 'Try adjusting your filters'
              : 'Create your first stock adjustment to get started'
            }
          </p>
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
                        icon={
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        }
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedAdjustment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`
            w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl
            ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}
          `}>
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Adjustment Details
                  </h2>
                  <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {formatDate(selectedAdjustment.adjustment_date)}
                  </p>
                </div>
                <button
                  onClick={handleCloseDetails}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'hover:bg-gray-700 text-gray-400'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Info */}
              <div className={`
                grid grid-cols-2 gap-4 p-4 rounded-lg mb-6
                ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}
              `}>
                <div>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Reason</p>
                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {selectedAdjustment.reason}
                  </p>
                </div>
                <div>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Status</p>
                  <span className={`
                    inline-block px-2 py-1 rounded-full text-xs font-medium
                    ${selectedAdjustment.is_completed
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }
                  `}>
                    {selectedAdjustment.is_completed ? 'Completed' : 'Pending'}
                  </span>
                </div>
                {selectedAdjustment.notes && (
                  <div className="col-span-2">
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Notes</p>
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {selectedAdjustment.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Line Items */}
              {selectedAdjustment.lines && selectedAdjustment.lines.length > 0 && (
                <div>
                  <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Adjustment Lines
                  </h3>
                  <div className={`
                    rounded-lg overflow-hidden
                    ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}
                  `}>
                    <table className="w-full">
                      <thead className={`${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                        <tr>
                          <th className={`px-4 py-2 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Product
                          </th>
                          <th className={`px-4 py-2 text-right text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Expected
                          </th>
                          <th className={`px-4 py-2 text-right text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Actual
                          </th>
                          <th className={`px-4 py-2 text-right text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Difference
                          </th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        {selectedAdjustment.lines.map((line) => (
                          <tr key={line.id}>
                            <td className={`px-4 py-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                              {line.product_name || `Product #${line.product_id}`}
                            </td>
                            <td className={`px-4 py-2 text-sm text-right ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {line.expected_quantity}
                            </td>
                            <td className={`px-4 py-2 text-sm text-right ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {line.actual_quantity}
                            </td>
                            <td className={`px-4 py-2 text-sm text-right font-medium ${
                              line.difference > 0
                                ? 'text-green-600 dark:text-green-400'
                                : line.difference < 0
                                ? 'text-red-600 dark:text-red-400'
                                : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {line.difference > 0 ? '+' : ''}{line.difference}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end mt-6">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleCloseDetails}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
