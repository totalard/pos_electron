import { useAppStore } from '../../stores'
import { Button } from '../common'
import { useCurrency } from '../../hooks/useCurrency'
import type { StockTransaction } from '../../stores/inventoryStore'

interface TransactionDetailModalProps {
  transaction: StockTransaction
  onClose: () => void
}

export function TransactionDetailModal({ transaction, onClose }: TransactionDetailModalProps) {
  const { theme } = useAppStore()
  const { formatCurrency } = useCurrency()

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'purchase': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'sale': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'adjustment': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
      case 'return': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'damage': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      case 'transfer': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={`
        w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl
        ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}
      `}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Transaction Details
              </h2>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getTransactionTypeColor(transaction.transaction_type)}`}>
                {transaction.transaction_type.toUpperCase()}
              </span>
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

          {/* Transaction Info Grid */}
          <div className={`
            grid grid-cols-2 gap-4 p-4 rounded-lg mb-6
            ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}
          `}>
            <div>
              <p className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Transaction ID
              </p>
              <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                #{transaction.id}
              </p>
            </div>
            <div>
              <p className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Date & Time
              </p>
              <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatDate(transaction.created_at)}
              </p>
            </div>
            <div>
              <p className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Product
              </p>
              <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {transaction.product_name || 'Unknown Product'}
              </p>
            </div>
            <div>
              <p className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Reference Number
              </p>
              <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {transaction.reference_number || 'N/A'}
              </p>
            </div>
            {transaction.performed_by_name && (
              <div>
                <p className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Performed By
                </p>
                <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {transaction.performed_by_name}
                </p>
              </div>
            )}
          </div>

          {/* Quantity & Stock Info */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className={`
              p-4 rounded-lg text-center
              ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}
            `}>
              <p className={`text-xs font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Quantity Change
              </p>
              <p className={`text-2xl font-bold ${
                transaction.quantity > 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {transaction.quantity > 0 ? '+' : ''}{transaction.quantity}
              </p>
            </div>
            <div className={`
              p-4 rounded-lg text-center
              ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}
            `}>
              <p className={`text-xs font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Stock Before
              </p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {transaction.stock_before}
              </p>
            </div>
            <div className={`
              p-4 rounded-lg text-center
              ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}
            `}>
              <p className={`text-xs font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Stock After
              </p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {transaction.stock_after}
              </p>
            </div>
          </div>

          {/* Cost Information */}
          {(transaction.unit_cost || transaction.total_cost) && (
            <div className={`
              p-4 rounded-lg mb-6
              ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}
            `}>
              <h3 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Cost Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {transaction.unit_cost && (
                  <div>
                    <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Unit Cost
                    </p>
                    <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(transaction.unit_cost)}
                    </p>
                  </div>
                )}
                {transaction.total_cost && (
                  <div>
                    <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Total Cost
                    </p>
                    <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(transaction.total_cost)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {transaction.notes && (
            <div className={`
              p-4 rounded-lg mb-6
              ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}
            `}>
              <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Notes
              </h3>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {transaction.notes}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" size="md" onClick={handlePrint}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
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
