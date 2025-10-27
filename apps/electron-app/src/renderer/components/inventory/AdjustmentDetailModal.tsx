import { useAppStore } from '../../stores'
import { Button } from '../common'
import type { StockAdjustment } from '../../stores/inventoryStore'

interface AdjustmentDetailModalProps {
  adjustment: StockAdjustment
  onClose: () => void
}

export function AdjustmentDetailModal({ adjustment, onClose }: AdjustmentDetailModalProps) {
  const { theme } = useAppStore()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const totalVariance = adjustment.lines?.reduce((sum, line) => sum + Math.abs(line.difference), 0) || 0
  const positiveVariance = adjustment.lines?.reduce((sum, line) => sum + (line.difference > 0 ? line.difference : 0), 0) || 0
  const negativeVariance = adjustment.lines?.reduce((sum, line) => sum + (line.difference < 0 ? Math.abs(line.difference) : 0), 0) || 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={`
        w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl
        ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}
      `}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Stock Adjustment Details
              </h2>
              <div className="flex items-center gap-3">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  adjustment.is_completed
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {adjustment.is_completed ? 'Completed' : 'Pending'}
                </span>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  ID: #{adjustment.id}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <p className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Items Adjusted
              </p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {adjustment.lines?.length || 0}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'}`}>
              <p className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-green-400' : 'text-green-700'}`}>
                Positive Variance
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                +{positiveVariance}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'}`}>
              <p className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-red-400' : 'text-red-700'}`}>
                Negative Variance
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                -{negativeVariance}
              </p>
            </div>
          </div>

          {/* Adjustment Info */}
          <div className={`
            grid grid-cols-2 gap-4 p-4 rounded-lg mb-6
            ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}
          `}>
            <div>
              <p className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Adjustment Date
              </p>
              <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatDate(adjustment.adjustment_date)}
              </p>
            </div>
            <div>
              <p className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Reason
              </p>
              <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {adjustment.reason}
              </p>
            </div>
            {adjustment.performed_by_name && (
              <div>
                <p className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Performed By
                </p>
                <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {adjustment.performed_by_name}
                </p>
              </div>
            )}
            <div>
              <p className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Created At
              </p>
              <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatDate(adjustment.created_at)}
              </p>
            </div>
          </div>

          {/* Notes */}
          {adjustment.notes && (
            <div className={`
              p-4 rounded-lg mb-6
              ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}
            `}>
              <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Notes
              </h3>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {adjustment.notes}
              </p>
            </div>
          )}

          {/* Line Items Table */}
          {adjustment.lines && adjustment.lines.length > 0 && (
            <div className="mb-6">
              <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Adjustment Line Items
              </h3>
              <div className={`
                rounded-lg overflow-hidden
                ${theme === 'dark' ? 'bg-gray-700/30 border border-gray-700' : 'bg-white border border-gray-200'}
              `}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <tr>
                        <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Product
                        </th>
                        <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Expected
                        </th>
                        <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Actual
                        </th>
                        <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Difference
                        </th>
                        <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Variance %
                        </th>
                        <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {adjustment.lines.map((line) => {
                        const variancePercent = line.expected_quantity > 0
                          ? ((line.difference / line.expected_quantity) * 100).toFixed(1)
                          : '0.0'
                        return (
                          <tr key={line.id} className={theme === 'dark' ? 'hover:bg-gray-700/20' : 'hover:bg-gray-50'}>
                            <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                              <div className="font-medium">
                                {line.product_name || `Product #${line.product_id}`}
                              </div>
                            </td>
                            <td className={`px-4 py-3 text-right text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {line.expected_quantity}
                            </td>
                            <td className={`px-4 py-3 text-right text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {line.actual_quantity}
                            </td>
                            <td className={`px-4 py-3 text-right text-sm font-bold ${
                              line.difference > 0
                                ? 'text-green-600 dark:text-green-400'
                                : line.difference < 0
                                ? 'text-red-600 dark:text-red-400'
                                : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {line.difference > 0 ? '+' : ''}{line.difference}
                            </td>
                            <td className={`px-4 py-3 text-right text-sm ${
                              Math.abs(parseFloat(variancePercent)) > 10
                                ? 'text-red-600 dark:text-red-400 font-semibold'
                                : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {variancePercent}%
                            </td>
                            <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {line.notes || '-'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot className={`${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <tr>
                        <td className={`px-4 py-3 text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          Total
                        </td>
                        <td className={`px-4 py-3 text-right text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {adjustment.lines.reduce((sum, line) => sum + line.expected_quantity, 0)}
                        </td>
                        <td className={`px-4 py-3 text-right text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {adjustment.lines.reduce((sum, line) => sum + line.actual_quantity, 0)}
                        </td>
                        <td className={`px-4 py-3 text-right text-sm font-bold ${
                          totalVariance > 0 ? 'text-yellow-600 dark:text-yellow-400' : theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          ±{totalVariance}
                        </td>
                        <td colSpan={2}></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" size="md" onClick={handlePrint}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Report
            </Button>
            <Button variant="primary" size="md" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
