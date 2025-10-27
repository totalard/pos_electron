import { useState } from 'react'
import { useAppStore, usePinStore, useSessionStore, useSettingsStore } from '../../stores'
import { posSessionAPI } from '../../services/api'
import { Button, Input, Sidebar, CurrencyDisplay } from '../common'
import { NumberInput } from '../forms'
import { useCurrency } from '../../hooks'

interface SessionCreationSidebarProps {
  isOpen: boolean
  onSessionCreated: () => void
  onCancel: () => void
}

interface DenominationInput {
  value: number
  count: number
  label: string
}

const getDefaultDenominations = (formatCurrency: (amount: number) => string) => ({
  bills: [
    { value: 100, count: 0, label: formatCurrency(100) },
    { value: 50, count: 0, label: formatCurrency(50) },
    { value: 20, count: 0, label: formatCurrency(20) },
    { value: 10, count: 0, label: formatCurrency(10) },
    { value: 5, count: 0, label: formatCurrency(5) },
    { value: 1, count: 0, label: formatCurrency(1) }
  ],
  coins: [
    { value: 1, count: 0, label: formatCurrency(1) },
    { value: 0.25, count: 0, label: formatCurrency(0.25) },
    { value: 0.10, count: 0, label: formatCurrency(0.10) },
    { value: 0.05, count: 0, label: formatCurrency(0.05) },
    { value: 0.01, count: 0, label: formatCurrency(0.01) }
  ]
})

export function SessionCreationSidebar({ isOpen, onSessionCreated, onCancel }: SessionCreationSidebarProps) {
  const { theme } = useAppStore()
  const { currentUser } = usePinStore()
  const { setActiveSession } = useSessionStore()
  
  const { formatCurrency } = useCurrency()
  const [bills, setBills] = useState<DenominationInput[]>(() => getDefaultDenominations(formatCurrency).bills)
  const [coins, setCoins] = useState<DenominationInput[]>(() => getDefaultDenominations(formatCurrency).coins)
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

  const footerContent = (
    <div className={`
      px-6 py-4 flex gap-4 justify-end
      ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}
    `}>
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
  )

  return (
    <Sidebar
      isOpen={isOpen}
      onClose={onCancel}
      title="Start New POS Session"
      width="lg"
      contentVariant="form"
      footerContent={footerContent}
      closeOnBackdrop={false}
    >
      <div className="space-y-6">
        {/* Subtitle */}
        <p className={`
          text-sm
          ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
        `}>
          Count your opening cash to begin
        </p>

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
          <div className="grid grid-cols-2 gap-4">
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
                <div className="mt-2 text-right">
                  <CurrencyDisplay 
                    amount={bill.value * bill.count} 
                    className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                    showSymbol={false}
                  />
                </div>
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
              <CurrencyDisplay amount={billsTotal} />
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
          <div className="grid grid-cols-2 gap-4">
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
                <div className="mt-2 text-right">
                  <CurrencyDisplay 
                    amount={coin.value * coin.count} 
                    className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                    showSymbol={false}
                  />
                </div>
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
              <CurrencyDisplay amount={coinsTotal} />
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
            <div className="text-right">
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <CurrencyDisplay amount={grandTotal} />
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Opening Cash
              </p>
            </div>
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
    </Sidebar>
  )
}
