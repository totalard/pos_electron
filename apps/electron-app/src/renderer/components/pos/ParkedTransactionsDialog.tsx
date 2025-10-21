import { useAppStore, usePOSStore } from '../../stores'
import { Modal, Button } from '../common'

interface ParkedTransactionsDialogProps {
  isOpen: boolean
  onClose: () => void
  onRecall: (transactionId: string) => void
}

/**
 * Dialog for viewing and recalling parked transactions
 */
export function ParkedTransactionsDialog({ 
  isOpen, 
  onClose, 
  onRecall 
}: ParkedTransactionsDialogProps) {
  const { theme } = useAppStore()
  const { transactions } = usePOSStore()

  // Filter parked transactions
  const parkedTransactions = transactions.filter(t => t.status === 'parked')

  const handleRecall = (transactionId: string) => {
    onRecall(transactionId)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Parked Transactions" size="lg">
      <div className="space-y-4">
        {parkedTransactions.length === 0 ? (
          <div className={`
            text-center py-12
            ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}
          `}>
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-lg font-medium">No Parked Transactions</p>
            <p className="text-sm mt-2">Parked transactions will appear here</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {parkedTransactions.map((transaction) => {
              const itemCount = transaction.items.reduce((sum, item) => sum + item.quantity, 0)
              const total = transaction.items.reduce((sum, item) => sum + item.total, 0)
              
              return (
                <div
                  key={transaction.id}
                  className={`
                    p-4 rounded-lg border cursor-pointer transition-all
                    ${theme === 'dark'
                      ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700 hover:border-primary-500'
                      : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-primary-500'
                    }
                  `}
                  onClick={() => handleRecall(transaction.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {transaction.name}
                        </h3>
                        <span className={`
                          px-2 py-0.5 rounded-full text-xs font-medium
                          ${theme === 'dark' ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-700'}
                        `}>
                          Parked
                        </span>
                      </div>
                      <div className={`flex items-center gap-4 mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                        <span>•</span>
                        <span className="font-semibold">${total.toFixed(2)}</span>
                        <span>•</span>
                        <span>{new Date(transaction.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <Button variant="primary" size="sm" onClick={() => handleRecall(transaction.id)}>
                      Recall
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}
