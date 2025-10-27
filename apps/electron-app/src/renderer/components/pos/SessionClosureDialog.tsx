import { useState, useEffect } from 'react'
import { useAppStore, useSessionStore } from '../../stores'
import { posSessionAPI, type SessionSummary } from '../../services/api'
import { Button, Input } from '../common'
import { NumberInput } from '../forms'

interface SessionClosureDialogProps {
  onSessionClosed: () => void
  onCancel: () => void
}

interface DenominationInput {
  value: number
  count: number
  label: string
}

const BILL_DENOMINATIONS: DenominationInput[] = [
  { value: 100, count: 0, label: '$100' },
  { value: 50, count: 0, label: '$50' },
  { value: 20, count: 0, label: '$20' },
  { value: 10, count: 0, label: '$10' },
  { value: 5, count: 0, label: '$5' },
  { value: 1, count: 0, label: '$1' }
]

const COIN_DENOMINATIONS: DenominationInput[] = [
  { value: 1, count: 0, label: '$1' },
  { value: 0.25, count: 0, label: '25¢' },
  { value: 0.10, count: 0, label: '10¢' },
  { value: 0.05, count: 0, label: '5¢' },
  { value: 0.01, count: 0, label: '1¢' }
]

export function SessionClosureDialog({ onSessionClosed, onCancel }: SessionClosureDialogProps) {
  const { theme } = useAppStore()
  const { activeSession, clearSession } = useSessionStore()
  
  const [bills, setBills] = useState<DenominationInput[]>(BILL_DENOMINATIONS)
  const [coins, setCoins] = useState<DenominationInput[]>(COIN_DENOMINATIONS)
  const [notes, setNotes] = useState('')
  const [isClosing, setIsClosing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<SessionSummary | null>(null)
  const [isLoadingSummary, setIsLoadingSummary] = useState(true)

  useEffect(() => {
    if (activeSession) {
      loadSessionSummary()
    }
  }, [activeSession])

  const loadSessionSummary = async () => {
    if (!activeSession) return

    setIsLoadingSummary(true)
    try {
      const data = await posSessionAPI.getSessionSummary(activeSession.id)
      setSummary(data)
    } catch (err: any) {
      console.error('Failed to load session summary:', err)
      setError('Failed to load session summary')
    } finally {
      setIsLoadingSummary(false)
    }
  }

  const calculateTotal = (denominations: DenominationInput[]) => {
    return denominations.reduce((sum, d) => sum + (d.value * d.count), 0)
  }

  const billsTotal = calculateTotal(bills)
  const coinsTotal = calculateTotal(coins)
  const grandTotal = billsTotal + coinsTotal

  const updateDenomination = (
    type: 'bills' | 'coins',
    index: number,
    count: number
  ) => {
    const setter = type === 'bills' ? setBills : setCoins
    const current = type === 'bills' ? bills : coins
    
    const updated = [...current]
    updated[index] = { ...updated[index], count: Math.max(0, count) }
    setter(updated)
  }

  const handleClose = async () => {
    if (!activeSession) {
      setError('No active session')
      return
    }

    setIsClosing(true)
    setError(null)

    try {
      // Prepare denominations data
      const denominationsData = {
        bills: bills.map(b => ({
          value: b.value,
          count: b.count,
          total: b.value * b.count
        })),
        coins: coins.map(c => ({
          value: c.value,
          count: c.count,
          total: c.value * c.count
        })),
        total_bills: billsTotal,
        total_coins: coinsTotal,
        grand_total: grandTotal
      }

      // Close session
      await posSessionAPI.closeSession(activeSession.id, {
        closing_cash: grandTotal,
        closing_denominations: denominationsData,
        closing_notes: notes || undefined
      })

      // Clear session from store
      clearSession()

      // Notify parent
      onSessionClosed()
    } catch (err: any) {
      console.error('Failed to close session:', err)
      setError(err.message || 'Failed to close session')
    } finally {
      setIsClosing(false)
    }
  }

  const expectedCash = activeSession 
    ? activeSession.opening_cash + 
      (summary?.payment_summary.find(p => p.payment_method === 'cash')?.total || 0) +
      activeSession.total_cash_in - 
      activeSession.total_cash_out
    : 0

  const variance = grandTotal - expectedCash

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`
        w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl
        ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}
      `}>
        {/* Header */}
        <div className={`
          sticky top-0 z-10 px-6 py-4 border-b
          ${theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
          }
        `}>
          <h2 className={`
            text-2xl font-bold
            ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
          `}>
            Close POS Session
          </h2>
          <p className={`
            mt-1 text-sm
            ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
          `}>
            Session: {activeSession?.session_number}
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {/* Session Summary */}
          {isLoadingSummary ? (
            <div className="text-center py-8">
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                Loading session summary...
              </p>
            </div>
          ) : summary && (
            <div className={`
              p-6 rounded-xl border
              ${theme === 'dark'
                ? 'bg-gray-700/30 border-gray-600'
                : 'bg-gray-50 border-gray-200'
              }
            `}>
              <h3 className={`
                text-lg font-semibold mb-4
                ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
              `}>
                Session Summary
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total Sales
                  </p>
                  <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    ${summary.total_sales.toFixed(2)}
                  </p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    {summary.sales_count} transactions
                  </p>
                </div>
                
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Opening Cash
                  </p>
                  <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    ${summary.opening_cash.toFixed(2)}
                  </p>
                </div>
                
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Cash In
                  </p>
                  <p className={`text-xl font-bold text-green-500`}>
                    +${summary.total_cash_in.toFixed(2)}
                  </p>
                </div>
                
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Cash Out
                  </p>
                  <p className={`text-xl font-bold text-red-500`}>
                    -${summary.total_cash_out.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Payment Method Breakdown */}
              {summary.payment_summary.length > 0 && (
                <div className="mt-6">
                  <h4 className={`
                    text-sm font-semibold mb-3
                    ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
                  `}>
                    Payment Methods
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {summary.payment_summary.map((payment) => (
                      <div
                        key={payment.payment_method}
                        className={`
                          p-3 rounded-lg
                          ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-white'}
                        `}
                      >
                        <p className={`text-xs uppercase ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {payment.payment_method}
                        </p>
                        <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          ${payment.total.toFixed(2)}
                        </p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                          {payment.count} sales
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cash Count Section */}
          <div>
            <h3 className={`
              text-lg font-semibold mb-4
              ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
            `}>
              Count Closing Cash
            </h3>

            {/* Bills */}
            <div className="mb-6">
              <h4 className={`
                text-md font-medium mb-3
                ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
              `}>
                Bills
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {bills.map((bill, index) => (
                  <div
                    key={bill.value}
                    className={`
                      p-4 rounded-lg border
                      ${theme === 'dark'
                        ? 'bg-gray-700/50 border-gray-600'
                        : 'bg-gray-50 border-gray-200'
                      }
                    `}
                  >
                    <NumberInput
                      label={bill.label}
                      value={bill.count}
                      onChange={(value) => updateDenomination('bills', index, value)}
                      min={0}
                      step={1}
                      showButtons
                      fullWidth
                    />
                    <p className={`
                      mt-2 text-sm text-right font-medium
                      ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                    `}>
                      ${(bill.value * bill.count).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              <div className={`
                mt-3 p-3 rounded-lg text-right
                ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-100'}
              `}>
                <span className={`
                  text-lg font-bold
                  ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
                `}>
                  Bills Total: ${billsTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Coins */}
            <div>
              <h4 className={`
                text-md font-medium mb-3
                ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
              `}>
                Coins
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {coins.map((coin, index) => (
                  <div
                    key={coin.value}
                    className={`
                      p-4 rounded-lg border
                      ${theme === 'dark'
                        ? 'bg-gray-700/50 border-gray-600'
                        : 'bg-gray-50 border-gray-200'
                      }
                    `}
                  >
                    <NumberInput
                      label={coin.label}
                      value={coin.count}
                      onChange={(value) => updateDenomination('coins', index, value)}
                      min={0}
                      step={1}
                      showButtons
                      fullWidth
                    />
                    <p className={`
                      mt-2 text-sm text-right font-medium
                      ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                    `}>
                      ${(coin.value * coin.count).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              <div className={`
                mt-3 p-3 rounded-lg text-right
                ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-100'}
              `}>
                <span className={`
                  text-lg font-bold
                  ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
                `}>
                  Coins Total: ${coinsTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Reconciliation */}
          <div className={`
            p-6 rounded-xl border-2
            ${variance === 0
              ? theme === 'dark'
                ? 'bg-green-900/20 border-green-500'
                : 'bg-green-50 border-green-500'
              : variance > 0
                ? theme === 'dark'
                  ? 'bg-blue-900/20 border-blue-500'
                  : 'bg-blue-50 border-blue-500'
                : theme === 'dark'
                  ? 'bg-red-900/20 border-red-500'
                  : 'bg-red-50 border-red-500'
            }
          `}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Counted Cash:
                </span>
                <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  ${grandTotal.toFixed(2)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Expected Cash:
                </span>
                <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  ${expectedCash.toFixed(2)}
                </span>
              </div>
              
              <div className={`
                pt-3 border-t flex items-center justify-between
                ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}
              `}>
                <span className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Variance:
                </span>
                <span className={`
                  text-2xl font-bold
                  ${variance === 0
                    ? 'text-green-500'
                    : variance > 0
                      ? 'text-blue-500'
                      : 'text-red-500'
                  }
                `}>
                  {variance >= 0 ? '+' : ''}${variance.toFixed(2)}
                </span>
              </div>
              
              {variance !== 0 && (
                <p className={`text-sm text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {variance > 0 ? 'Overage detected' : 'Shortage detected'}
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={`
              block text-sm font-medium mb-2
              ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
            `}>
              Closing Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this session closure..."
              rows={3}
              className={`
                w-full px-4 py-2 rounded-lg border resize-none
                ${theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }
                focus:ring-2 focus:ring-primary-500 focus:border-transparent
              `}
            />
          </div>
        </div>

        {/* Footer */}
        <div className={`
          sticky bottom-0 px-6 py-4 border-t
          ${theme === 'dark'
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
          }
        `}>
          <div className="flex gap-4 justify-end">
            <Button
              variant="secondary"
              onClick={onCancel}
              disabled={isClosing}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleClose}
              disabled={isClosing}
              className="min-w-[150px]"
            >
              {isClosing ? 'Closing...' : 'Close Session'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
