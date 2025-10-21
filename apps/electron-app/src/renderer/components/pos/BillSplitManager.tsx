import { useState } from 'react'
import { useAppStore, usePOSStore } from '../../stores'
import { Modal, Button, CurrencyDisplay } from '../common'
import type { PaymentSplit } from '../../types/payment'

interface BillSplitManagerProps {
  isOpen: boolean
  onClose: () => void
}

export function BillSplitManager({ isOpen, onClose }: BillSplitManagerProps) {
  const { theme } = useAppStore()
  const {
    getActiveTransaction,
    getCartItems,
    enableSplitPayment,
    disableSplitPayment,
    addPaymentSplit,
    updatePaymentSplit,
    removePaymentSplit,
    markSplitAsPaid,
    calculateSplitAmounts
  } = usePOSStore()

  const transaction = getActiveTransaction()
  const cartItems = getCartItems()
  const [splitType, setSplitType] = useState<'equal' | 'amount' | 'percentage' | 'items'>('equal')
  const [splitCount, setSplitCount] = useState(2)
  const [customAmount, setCustomAmount] = useState('')
  const [customPercentage, setCustomPercentage] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [splitName, setSplitName] = useState('')

  if (!transaction) return null

  const isSplitEnabled = transaction.splitPayment?.enabled || false
  const splits = transaction.splitPayment?.splits || []
  const totalAmount = transaction.total
  const remainingAmount = transaction.splitPayment?.remainingAmount || totalAmount

  const handleEnableSplit = () => {
    enableSplitPayment()
  }

  const handleDisableSplit = () => {
    if (confirm('Disable bill splitting? All splits will be removed.')) {
      disableSplitPayment()
    }
  }

  const handleAddEqualSplit = () => {
    const amount = totalAmount / splitCount
    
    for (let i = 0; i < splitCount; i++) {
      addPaymentSplit({
        name: `Person ${i + 1}`,
        splitType: 'equal',
        amount: parseFloat(amount.toFixed(2))
      })
    }
    
    calculateSplitAmounts()
  }

  const handleAddCustomSplit = () => {
    if (!splitName.trim()) {
      alert('Please enter a name for this split')
      return
    }

    let amount = 0

    if (splitType === 'amount') {
      amount = parseFloat(customAmount) || 0
      if (amount <= 0 || amount > remainingAmount) {
        alert(`Amount must be between 0 and ${remainingAmount.toFixed(2)}`)
        return
      }
    } else if (splitType === 'percentage') {
      const percentage = parseFloat(customPercentage) || 0
      if (percentage <= 0 || percentage > 100) {
        alert('Percentage must be between 0 and 100')
        return
      }
      amount = (totalAmount * percentage) / 100
    } else if (splitType === 'items') {
      if (selectedItems.length === 0) {
        alert('Please select at least one item')
        return
      }
      amount = cartItems
        .filter(item => selectedItems.includes(item.id))
        .reduce((sum, item) => sum + item.total, 0)
    }

    addPaymentSplit({
      name: splitName.trim(),
      splitType,
      amount: parseFloat(amount.toFixed(2)),
      percentage: splitType === 'percentage' ? parseFloat(customPercentage) : undefined,
      itemIds: splitType === 'items' ? selectedItems : undefined
    })

    // Reset form
    setSplitName('')
    setCustomAmount('')
    setCustomPercentage('')
    setSelectedItems([])
    
    calculateSplitAmounts()
  }

  const handleRemoveSplit = (splitId: string) => {
    if (confirm('Remove this split?')) {
      removePaymentSplit(splitId)
      calculateSplitAmounts()
    }
  }

  const handleMarkAsPaid = (splitId: string) => {
    const paymentMethod = prompt('Enter payment method (e.g., Cash, Card):')
    if (paymentMethod) {
      markSplitAsPaid(splitId, paymentMethod)
    }
  }

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const allPaid = splits.length > 0 && splits.every(s => s.isPaid)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bill Splitting" size="2xl">
      <div className="space-y-4">
        {/* Enable/Disable Split */}
        {!isSplitEnabled ? (
          <div className={`
            p-6 rounded-lg text-center
            ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}
          `}>
            <svg className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Split Bill
            </h3>
            <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Divide the bill among multiple people or payment methods
            </p>
            <Button onClick={handleEnableSplit} variant="primary">
              Enable Bill Splitting
            </Button>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className={`
              p-4 rounded-lg border-2
              ${theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-300 bg-gray-50'}
            `}>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total Amount
                  </p>
                  <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <CurrencyDisplay amount={totalAmount} />
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Paid
                  </p>
                  <p className={`text-xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                    <CurrencyDisplay amount={totalAmount - remainingAmount} />
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Remaining
                  </p>
                  <p className={`text-xl font-bold ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    <CurrencyDisplay amount={remainingAmount} />
                  </p>
                </div>
              </div>
            </div>

            {/* Split Type Selection */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Split Method
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: 'equal', label: 'Equal', icon: '=' },
                  { value: 'amount', label: 'Amount', icon: '$' },
                  { value: 'percentage', label: 'Percent', icon: '%' },
                  { value: 'items', label: 'Items', icon: '📦' }
                ].map(method => (
                  <button
                    key={method.value}
                    onClick={() => setSplitType(method.value as any)}
                    className={`
                      px-3 py-2 rounded-lg font-medium transition-colors
                      ${splitType === method.value
                        ? theme === 'dark'
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-500 text-white'
                        : theme === 'dark'
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }
                    `}
                  >
                    <div className="text-lg mb-1">{method.icon}</div>
                    <div className="text-xs">{method.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Split Configuration */}
            <div className={`
              p-4 rounded-lg border
              ${theme === 'dark' ? 'border-gray-700 bg-gray-800/30' : 'border-gray-300 bg-white'}
            `}>
              {splitType === 'equal' && (
                <div className="space-y-3">
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Number of People
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={splitCount}
                    onChange={(e) => setSplitCount(parseInt(e.target.value) || 2)}
                    className={`
                      w-full px-4 py-2 rounded-lg border
                      ${theme === 'dark'
                        ? 'bg-gray-800 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                      }
                    `}
                  />
                  <Button onClick={handleAddEqualSplit} variant="primary" className="w-full">
                    Split Equally
                  </Button>
                </div>
              )}

              {(splitType === 'amount' || splitType === 'percentage' || splitType === 'items') && (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={splitName}
                    onChange={(e) => setSplitName(e.target.value)}
                    placeholder="Split name (e.g., John, Card 1)"
                    className={`
                      w-full px-4 py-2 rounded-lg border
                      ${theme === 'dark'
                        ? 'bg-gray-800 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                      }
                    `}
                  />

                  {splitType === 'amount' && (
                    <input
                      type="number"
                      step="0.01"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="Enter amount"
                      className={`
                        w-full px-4 py-2 rounded-lg border
                        ${theme === 'dark'
                          ? 'bg-gray-800 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                        }
                      `}
                    />
                  )}

                  {splitType === 'percentage' && (
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      value={customPercentage}
                      onChange={(e) => setCustomPercentage(e.target.value)}
                      placeholder="Enter percentage (0-100)"
                      className={`
                        w-full px-4 py-2 rounded-lg border
                        ${theme === 'dark'
                          ? 'bg-gray-800 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                        }
                      `}
                    />
                  )}

                  {splitType === 'items' && (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {cartItems.map(item => (
                        <label
                          key={item.id}
                          className={`
                            flex items-center gap-3 p-2 rounded cursor-pointer
                            ${selectedItems.includes(item.id)
                              ? theme === 'dark'
                                ? 'bg-blue-600/20'
                                : 'bg-blue-50'
                              : theme === 'dark'
                                ? 'hover:bg-gray-700'
                                : 'hover:bg-gray-100'
                            }
                          `}
                        >
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => toggleItemSelection(item.id)}
                            className="w-5 h-5"
                          />
                          <div className="flex-1">
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {item.product.name}
                            </p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              <CurrencyDisplay amount={item.total} />
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  <Button onClick={handleAddCustomSplit} variant="primary" className="w-full">
                    Add Split
                  </Button>
                </div>
              )}
            </div>

            {/* Splits List */}
            <div className="space-y-2">
              <h3 className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Payment Splits ({splits.length})
              </h3>
              
              {splits.length > 0 ? (
                splits.map(split => (
                  <div
                    key={split.id}
                    className={`
                      p-3 rounded-lg border-2
                      ${split.isPaid
                        ? theme === 'dark'
                          ? 'border-green-600 bg-green-600/10'
                          : 'border-green-500 bg-green-50'
                        : theme === 'dark'
                          ? 'border-gray-700 bg-gray-800/50'
                          : 'border-gray-300 bg-white'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {split.name}
                          </p>
                          <span className={`
                            px-2 py-0.5 rounded text-xs font-medium uppercase
                            ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}
                          `}>
                            {split.splitType}
                          </span>
                          {split.isPaid && (
                            <span className={`
                              px-2 py-0.5 rounded text-xs font-semibold
                              ${theme === 'dark' ? 'bg-green-600 text-white' : 'bg-green-500 text-white'}
                            `}>
                              PAID
                            </span>
                          )}
                        </div>
                        <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          <CurrencyDisplay amount={split.amount} />
                        </p>
                        {split.paymentMethod && (
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            via {split.paymentMethod}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-1">
                        {!split.isPaid && (
                          <>
                            <button
                              onClick={() => handleMarkAsPaid(split.id)}
                              className={`
                                p-2 rounded transition-colors
                                ${theme === 'dark'
                                  ? 'hover:bg-green-600/30 text-green-400'
                                  : 'hover:bg-green-100 text-green-700'
                                }
                              `}
                              title="Mark as Paid"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleRemoveSplit(split.id)}
                              className={`
                                p-2 rounded transition-colors
                                ${theme === 'dark'
                                  ? 'hover:bg-red-600/30 text-red-400'
                                  : 'hover:bg-red-100 text-red-700'
                                }
                              `}
                              title="Remove"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`
                  text-center py-8
                  ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}
                `}>
                  <p className="text-sm">No splits added yet</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              {allPaid ? (
                <Button onClick={onClose} variant="primary" className="flex-1">
                  Complete Payment
                </Button>
              ) : (
                <>
                  <Button onClick={handleDisableSplit} variant="secondary">
                    Disable Splitting
                  </Button>
                  <Button onClick={onClose} variant="secondary" className="flex-1">
                    Close
                  </Button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
