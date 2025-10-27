import { useState, useEffect } from 'react'
import { useAppStore } from '../../stores'
import { useCurrency } from '../../hooks/useCurrency'
import { Sidebar } from '../common'
import { accountingAPI } from '../../services/accountingAPI'
import type { JournalEntry, JournalEntryCreate, JournalEntryLineCreate, Account, JournalEntryType } from '../../types/accounting'

interface JournalEntryFormSidebarProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  entry?: JournalEntry | null
}

const ENTRY_TYPES: { value: JournalEntryType; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'sales', label: 'Sales' },
  { value: 'purchase', label: 'Purchase' },
  { value: 'payment', label: 'Payment' },
  { value: 'receipt', label: 'Receipt' },
  { value: 'adjustment', label: 'Adjustment' },
  { value: 'closing', label: 'Closing' },
  { value: 'opening', label: 'Opening' }
]

export function JournalEntryFormSidebar({ isOpen, onClose, onSuccess, entry }: JournalEntryFormSidebarProps) {
  const { theme } = useAppStore()
  const { formatCurrency } = useCurrency()
  
  const [accounts, setAccounts] = useState<Account[]>([])
  const [formData, setFormData] = useState<JournalEntryCreate>({
    entry_date: new Date().toISOString().split('T')[0],
    entry_type: 'general',
    description: '',
    notes: '',
    lines: [
      { account_id: 0, debit_amount: 0, credit_amount: 0, description: '' },
      { account_id: 0, debit_amount: 0, credit_amount: 0, description: '' }
    ],
    auto_post: false
  })
  
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingAccounts, setLoadingAccounts] = useState(false)

  // Load accounts
  useEffect(() => {
    if (isOpen) {
      loadAccounts()
    }
  }, [isOpen])

  // Load entry data when editing
  useEffect(() => {
    if (entry) {
      setFormData({
        entry_date: entry.entry_date,
        entry_type: entry.entry_type,
        description: entry.description,
        reference_type: entry.reference_type,
        reference_id: entry.reference_id,
        reference_number: entry.reference_number,
        notes: entry.notes || '',
        lines: entry.lines.map(line => ({
          account_id: line.account_id,
          debit_amount: line.debit_amount,
          credit_amount: line.credit_amount,
          description: line.description || ''
        })),
        auto_post: false
      })
    } else {
      // Reset form for new entry
      setFormData({
        entry_date: new Date().toISOString().split('T')[0],
        entry_type: 'general',
        description: '',
        notes: '',
        lines: [
          { account_id: 0, debit_amount: 0, credit_amount: 0, description: '' },
          { account_id: 0, debit_amount: 0, credit_amount: 0, description: '' }
        ],
        auto_post: false
      })
    }
    setError(null)
  }, [entry, isOpen])

  const loadAccounts = async () => {
    try {
      setLoadingAccounts(true)
      const data = await accountingAPI.getAccounts({ is_active: true })
      setAccounts(data)
    } catch (err) {
      console.error('Failed to load accounts:', err)
    } finally {
      setLoadingAccounts(false)
    }
  }

  const addLine = () => {
    setFormData({
      ...formData,
      lines: [...formData.lines, { account_id: 0, debit_amount: 0, credit_amount: 0, description: '' }]
    })
  }

  const removeLine = (index: number) => {
    if (formData.lines.length <= 2) return // Minimum 2 lines
    const newLines = formData.lines.filter((_, i) => i !== index)
    setFormData({ ...formData, lines: newLines })
  }

  const updateLine = (index: number, field: keyof JournalEntryLineCreate, value: any) => {
    const newLines = [...formData.lines]
    newLines[index] = { ...newLines[index], [field]: value }
    setFormData({ ...formData, lines: newLines })
  }

  const calculateTotals = () => {
    const totalDebit = formData.lines.reduce((sum, line) => sum + (line.debit_amount || 0), 0)
    const totalCredit = formData.lines.reduce((sum, line) => sum + (line.credit_amount || 0), 0)
    return { totalDebit, totalCredit, difference: totalDebit - totalCredit }
  }

  const { totalDebit, totalCredit, difference } = calculateTotals()
  const isBalanced = Math.abs(difference) < 0.01

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isBalanced) {
      setError('Entry is not balanced. Total debits must equal total credits.')
      return
    }

    // Validate all lines have accounts selected
    const invalidLines = formData.lines.filter(line => !line.account_id || line.account_id === 0)
    if (invalidLines.length > 0) {
      setError('All lines must have an account selected.')
      return
    }

    // Validate at least one debit and one credit
    const hasDebit = formData.lines.some(line => line.debit_amount > 0)
    const hasCredit = formData.lines.some(line => line.credit_amount > 0)
    if (!hasDebit || !hasCredit) {
      setError('Entry must have at least one debit and one credit.')
      return
    }
    
    try {
      setSubmitting(true)
      setError(null)
      
      await accountingAPI.createJournalEntry(formData)
      
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save journal entry')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!submitting) {
      onClose()
    }
  }

  return (
    <Sidebar
      isOpen={isOpen}
      onClose={handleClose}
      title={entry ? 'View Journal Entry' : 'Create Journal Entry'}
      width="xl"
      contentVariant="form"
      footerContent={
        !entry && (
          <div className="p-6 space-y-3">
            {/* Balance Status */}
            <div className={`p-3 rounded-lg border ${
              isBalanced
                ? theme === 'dark'
                  ? 'bg-green-900/20 border-green-700 text-green-400'
                  : 'bg-green-50 border-green-200 text-green-700'
                : theme === 'dark'
                  ? 'bg-red-900/20 border-red-700 text-red-400'
                  : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {isBalanced ? '✓ Entry Balanced' : '⚠ Entry Not Balanced'}
                </span>
                <span className="font-mono">
                  Difference: {formatCurrency(Math.abs(difference))}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className={`flex-1 px-4 py-2.5 rounded-lg border font-medium transition-colors ${
                  theme === 'dark'
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="journal-entry-form"
                disabled={submitting || !isBalanced}
                className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 font-medium transition-colors"
              >
                {submitting ? 'Saving...' : 'Create Entry'}
              </button>
            </div>
          </div>
        )
      }
    >
      <form id="journal-entry-form" onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {entry && entry.status === 'draft' && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              This entry is in draft status. Editing draft entries is not yet implemented.
            </p>
          </div>
        )}

        {/* Entry Date & Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Entry Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              disabled={!!entry}
              value={formData.entry_date}
              onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Entry Type <span className="text-red-500">*</span>
            </label>
            <select
              required
              disabled={!!entry}
              value={formData.entry_type}
              onChange={(e) => setFormData({ ...formData, entry_type: e.target.value as JournalEntryType })}
              className={`w-full px-3 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50`}
            >
              {ENTRY_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Description <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            disabled={!!entry}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of the transaction"
            className={`w-full px-3 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50`}
          />
        </div>

        {/* Journal Entry Lines */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className={`block text-sm font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Journal Entry Lines <span className="text-red-500">*</span>
            </label>
            {!entry && (
              <button
                type="button"
                onClick={addLine}
                className="px-3 py-1 text-sm bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
              >
                + Add Line
              </button>
            )}
          </div>

          {loadingAccounts ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {formData.lines.map((line, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Line {index + 1}
                    </span>
                    {!entry && formData.lines.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeLine(index)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {/* Account Selection */}
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Account
                      </label>
                      <select
                        disabled={!!entry}
                        value={line.account_id}
                        onChange={(e) => updateLine(index, 'account_id', parseInt(e.target.value))}
                        className={`w-full px-3 py-2 rounded border text-sm ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50`}
                      >
                        <option value={0}>Select account...</option>
                        {accounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.account_code} - {account.account_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Debit & Credit */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Debit
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          disabled={!!entry}
                          value={line.debit_amount || ''}
                          onChange={(e) => updateLine(index, 'debit_amount', parseFloat(e.target.value) || 0)}
                          className={`w-full px-3 py-2 rounded border text-sm ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Credit
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          disabled={!!entry}
                          value={line.credit_amount || ''}
                          onChange={(e) => updateLine(index, 'credit_amount', parseFloat(e.target.value) || 0)}
                          className={`w-full px-3 py-2 rounded border text-sm ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50`}
                        />
                      </div>
                    </div>

                    {/* Line Description */}
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Line Description (Optional)
                      </label>
                      <input
                        type="text"
                        disabled={!!entry}
                        value={line.description || ''}
                        onChange={(e) => updateLine(index, 'description', e.target.value)}
                        placeholder="Optional line description"
                        className={`w-full px-3 py-2 rounded border text-sm ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                        } focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Totals Summary */}
          <div className={`mt-4 p-4 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Debits
                </span>
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(totalDebit)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Credits
                </span>
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(totalCredit)}
                </span>
              </div>
              <div className={`pt-2 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Difference
                  </span>
                  <span className={`text-sm font-bold ${
                    isBalanced
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {formatCurrency(Math.abs(difference))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Notes
          </label>
          <textarea
            disabled={!!entry}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            placeholder="Optional notes"
            className={`w-full px-3 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none disabled:opacity-50`}
          />
        </div>

        {/* Auto Post Option */}
        {!entry && (
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="auto_post"
              checked={formData.auto_post}
              onChange={(e) => setFormData({ ...formData, auto_post: e.target.checked })}
              className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
            />
            <label 
              htmlFor="auto_post" 
              className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Automatically post entry after creation
            </label>
          </div>
        )}

        {/* Entry Info (when viewing) */}
        {entry && (
          <div className={`p-4 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Entry Information
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Entry Number</span>
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {entry.entry_number}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Status</span>
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                  entry.status === 'posted'
                    ? 'bg-green-100 text-green-700'
                    : entry.status === 'void'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {entry.status.toUpperCase()}
                </span>
              </div>
              {entry.created_by_name && (
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Created By</span>
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {entry.created_by_name}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </form>
    </Sidebar>
  )
}
