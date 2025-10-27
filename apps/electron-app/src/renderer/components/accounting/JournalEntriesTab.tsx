import { useState, useEffect } from 'react'
import { useAppStore } from '../../stores'
import { useCurrency } from '../../hooks/useCurrency'
import { accountingAPI } from '../../services/accountingAPI'
import type { JournalEntry, Account } from '../../types/accounting'

export function JournalEntriesTab() {
  const { theme } = useAppStore()
  const { formatCurrency } = useCurrency()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = async () => {
    try {
      setLoading(true)
      const data = await accountingAPI.getJournalEntries()
      setEntries(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load entries')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Journal Entries
      </h2>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">{error}</div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={entry.id} className={`p-4 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {entry.entry_number} - {entry.description}
              </h3>
              <div className="mt-2 text-sm">
                <div>Total: {formatCurrency(entry.total_debit)}</div>
                <div>Lines: {entry.lines.length}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
