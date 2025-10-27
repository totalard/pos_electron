import { useState, useEffect } from 'react'
import { useAppStore } from '../../stores'
import { useCurrency } from '../../hooks/useCurrency'
import { Sidebar } from '../common'
import { accountingAPI } from '../../services/accountingAPI'
import type { FiscalYear } from '../../types/accounting'

export function YearEndTab() {
  const { theme } = useAppStore()
  const { formatCurrency } = useCurrency()
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateSidebar, setShowCreateSidebar] = useState(false)
  const [showClosingSidebar, setShowClosingSidebar] = useState(false)

  useEffect(() => {
    loadFiscalYears()
  }, [])

  const loadFiscalYears = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await accountingAPI.getFiscalYears()
      setFiscalYears(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load fiscal years')
    } finally {
      setLoading(false)
    }
  }

  const currentYear = fiscalYears.find(fy => fy.status === 'open')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'text-green-600 bg-green-100'
      case 'closed':
        return 'text-blue-600 bg-blue-100'
      case 'locked':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Year-End Management
          </h2>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage fiscal years and perform year-end closing
          </p>
        </div>
        <button
          onClick={() => setShowCreateSidebar(true)}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Fiscal Year
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Current Fiscal Year Card */}
      {currentYear && (
        <div className={`p-6 rounded-lg border ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Current Fiscal Year: {currentYear.year_name}
              </h3>
              <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {new Date(currentYear.start_date).toLocaleDateString()} - {new Date(currentYear.end_date).toLocaleDateString()}
              </p>
            </div>
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(currentYear.status)}`}>
              {currentYear.status.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-750' : 'bg-gray-50'}`}>
              <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Opening Balance
              </p>
              <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(currentYear.opening_balance)}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-750' : 'bg-gray-50'}`}>
              <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Income
              </p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(currentYear.total_income)}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-750' : 'bg-gray-50'}`}>
              <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Expenses
              </p>
              <p className="text-lg font-bold text-red-600">
                {formatCurrency(currentYear.total_expenses)}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-750' : 'bg-gray-50'}`}>
              <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Net Profit/Loss
              </p>
              <p className={`text-lg font-bold ${
                currentYear.net_profit_loss >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(Math.abs(currentYear.net_profit_loss))}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowClosingSidebar(true)}
            className="w-full px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium transition-colors"
          >
            Start Year-End Closing Wizard
          </button>
        </div>
      )}

      {/* Fiscal Years History */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      ) : (
        <div className={`rounded-lg border overflow-hidden ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Fiscal Years History
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={theme === 'dark' ? 'bg-gray-750' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Year
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Period
                  </th>
                  <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Opening
                  </th>
                  <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Closing
                  </th>
                  <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Net P/L
                  </th>
                  <th className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {fiscalYears.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        No fiscal years found
                      </div>
                    </td>
                  </tr>
                ) : (
                  fiscalYears.map((year) => (
                    <tr
                      key={year.id}
                      className={`${theme === 'dark' ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}`}
                    >
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        {year.year_name}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {new Date(year.start_date).toLocaleDateString()} - {new Date(year.end_date).toLocaleDateString()}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-right text-sm ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        {formatCurrency(year.opening_balance)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-right text-sm ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        {year.closing_balance ? formatCurrency(year.closing_balance) : '-'}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${
                        year.net_profit_loss >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(Math.abs(year.net_profit_loss))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(year.status)}`}>
                          {year.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Fiscal Year Sidebar */}
      <CreateFiscalYearSidebar
        isOpen={showCreateSidebar}
        onClose={() => setShowCreateSidebar(false)}
        onSuccess={() => {
          setShowCreateSidebar(false)
          loadFiscalYears()
        }}
      />

      {/* Year-End Closing Sidebar */}
      <YearEndClosingSidebar
        isOpen={showClosingSidebar}
        onClose={() => setShowClosingSidebar(false)}
        fiscalYear={currentYear}
      />
    </div>
  )
}

function CreateFiscalYearSidebar({ 
  isOpen, 
  onClose, 
  onSuccess 
}: { 
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const { theme } = useAppStore()
  const [formData, setFormData] = useState({
    year_name: '',
    start_date: '',
    end_date: '',
    opening_balance: 0
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSubmitting(true)
      setError(null)
      await accountingAPI.createFiscalYear(formData)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create fiscal year')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sidebar
      isOpen={isOpen}
      onClose={onClose}
      title="Create Fiscal Year"
      width="md"
      contentVariant="form"
      footerContent={
        <div className="p-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
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
            form="fiscal-year-form"
            disabled={submitting}
            className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 font-medium transition-colors"
          >
            {submitting ? 'Creating...' : 'Create Fiscal Year'}
          </button>
        </div>
      }
    >
      <form id="fiscal-year-form" onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className={`block text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Year Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.year_name}
            onChange={(e) => setFormData({ ...formData, year_name: e.target.value })}
            placeholder="e.g., FY 2024"
            className={`w-full px-3 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              End Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
            />
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Opening Balance
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.opening_balance}
            onChange={(e) => setFormData({ ...formData, opening_balance: parseFloat(e.target.value) || 0 })}
            className={`w-full px-3 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
          />
          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            This should match the closing balance of the previous fiscal year.
          </p>
        </div>
      </form>
    </Sidebar>
  )
}

function YearEndClosingSidebar({ 
  isOpen, 
  onClose, 
  fiscalYear 
}: { 
  isOpen: boolean
  onClose: () => void
  fiscalYear?: FiscalYear
}) {
  const { theme } = useAppStore()

  return (
    <Sidebar
      isOpen={isOpen}
      onClose={onClose}
      title="Year-End Closing Wizard"
      width="lg"
      contentVariant="default"
    >
      <div className="space-y-6">
        <div className={`p-4 rounded-lg border ${
          theme === 'dark' ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-800'}`}>
                Year-End Closing Wizard
              </p>
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'}`}>
                This feature is under development. The year-end closing process will:
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-lg border ${
          theme === 'dark' ? 'bg-gray-750 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h4 className={`text-md font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Year-End Closing Steps
          </h4>
          <ol className={`space-y-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <li className="flex items-start gap-2">
              <span className="font-bold">1.</span>
              <span>Verify all transactions are posted and reconciled</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">2.</span>
              <span>Generate final financial reports (Income Statement, Balance Sheet)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">3.</span>
              <span>Calculate net profit/loss for the year</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">4.</span>
              <span>Transfer income and expense balances to retained earnings</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">5.</span>
              <span>Create opening balances for the new fiscal year</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">6.</span>
              <span>Lock the fiscal year to prevent further modifications</span>
            </li>
          </ol>
        </div>

        <div className={`p-4 rounded-lg border ${
          theme === 'dark' ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'
        }`}>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            The year-end closing wizard will be available in a future update. For now, you can manually create journal entries to close the year.
          </p>
        </div>
      </div>
    </Sidebar>
  )
}
