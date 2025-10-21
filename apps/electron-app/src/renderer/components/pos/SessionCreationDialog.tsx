import { useState, useEffect } from 'react'
import { useAppStore, usePinStore, useSessionStore } from '../../stores'
import { posSessionAPI } from '../../services/api'
import { Button, Input } from '../common'

interface SessionCreationDialogProps {
  onSessionCreated: () => void
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

export function SessionCreationDialog({ onSessionCreated, onCancel }: SessionCreationDialogProps) {
  const { theme } = useAppStore()
  const { currentUser } = usePinStore()
  const { setActiveSession } = useSessionStore()
  
  const [bills, setBills] = useState<DenominationInput[]>(BILL_DENOMINATIONS)
  const [coins, setCoins] = useState<DenominationInput[]>(COIN_DENOMINATIONS)
  const [notes, setNotes] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const handleCreate = async () => {
    if (!currentUser) {
      setError('No user logged in')
      return
    }

    setIsCreating(true)
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

      // Create session
      const session = await posSessionAPI.createSession({
        user_id: currentUser.id,
        opening_cash: grandTotal,
        opening_denominations: denominationsData,
        opening_notes: notes || undefined
      })

      // Update store
      setActiveSession(session)

      // Notify parent
      onSessionCreated()
    } catch (err: any) {
      console.error('Failed to create session:', err)
      setError(err.message || 'Failed to create session')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`
        w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl
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
            Start New POS Session
          </h2>
          <p className={`
            mt-1 text-sm
            ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
          `}>
            Count your opening cash to begin
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

          {/* Bills Section */}
          <div>
            <h3 className={`
              text-lg font-semibold mb-4
              ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
            `}>
              Bills
            </h3>
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
                  <label className={`
                    block text-sm font-medium mb-2
                    ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
                  `}>
                    {bill.label}
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={bill.count}
                    onChange={(e) => updateDenomination('bills', index, parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="text-center"
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
              mt-4 p-3 rounded-lg text-right
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

          {/* Coins Section */}
          <div>
            <h3 className={`
              text-lg font-semibold mb-4
              ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
            `}>
              Coins
            </h3>
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
                  <label className={`
                    block text-sm font-medium mb-2
                    ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
                  `}>
                    {coin.label}
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={coin.count}
                    onChange={(e) => updateDenomination('coins', index, parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="text-center"
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
              mt-4 p-3 rounded-lg text-right
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

          {/* Grand Total */}
          <div className={`
            p-6 rounded-xl border-2
            ${theme === 'dark'
              ? 'bg-primary-900/20 border-primary-500'
              : 'bg-primary-50 border-primary-500'
            }
          `}>
            <div className="flex items-center justify-between">
              <span className={`
                text-xl font-bold
                ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
              `}>
                Opening Cash Total:
              </span>
              <span className="text-3xl font-bold text-primary-500">
                ${grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={`
              block text-sm font-medium mb-2
              ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
            `}>
              Opening Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this session..."
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
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreate}
              disabled={isCreating || grandTotal === 0}
              className="min-w-[150px]"
            >
              {isCreating ? 'Creating...' : 'Start Session'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
