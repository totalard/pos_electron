import { useState } from 'react'
import { useAppStore } from '../../stores'
import { useCurrency } from '../../hooks/useCurrency'
import { Sidebar } from '../common'
import { accountingAPI } from '../../services/accountingAPI'
import type { FinancialReport, TrialBalance } from '../../types/accounting'

type ReportType = 'income_statement' | 'balance_sheet' | 'trial_balance' | 'cash_flow'

export function ReportsTab() {
  const { theme } = useAppStore()
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null)
  
  const reports = [
    { 
      type: 'income_statement' as ReportType, 
      name: 'Income Statement', 
      description: 'Profit & Loss report showing revenue and expenses', 
      icon: '💰' 
    },
    { 
      type: 'balance_sheet' as ReportType, 
      name: 'Balance Sheet', 
      description: 'Assets, Liabilities, and Equity snapshot', 
      icon: '⚖️' 
    },
    { 
      type: 'trial_balance' as ReportType, 
      name: 'Trial Balance', 
      description: 'Verify that debits equal credits', 
      icon: '✅' 
    },
    { 
      type: 'cash_flow' as ReportType, 
      name: 'Cash Flow', 
      description: 'Cash in and out tracking (Coming Soon)', 
      icon: '💵',
      disabled: true
    }
  ]
  
  return (
    <div className="space-y-4">
      <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Financial Reports
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report) => (
          <button
            key={report.type}
            onClick={() => !report.disabled && setSelectedReport(report.type)}
            disabled={report.disabled}
            className={`
              p-6 rounded-lg border text-left transition-all
              ${report.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'}
              ${theme === 'dark' 
                ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                : 'bg-white border-gray-200 hover:shadow-lg'
              }
            `}
          >
            <div className="text-3xl mb-2">{report.icon}</div>
            <h3 className={`text-lg font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {report.name}
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {report.description}
            </p>
          </button>
        ))}
      </div>

      {/* Report Viewers */}
      {selectedReport === 'income_statement' && (
        <IncomeStatementViewer
          isOpen={true}
          onClose={() => setSelectedReport(null)}
        />
      )}
      {selectedReport === 'balance_sheet' && (
        <BalanceSheetViewer
          isOpen={true}
          onClose={() => setSelectedReport(null)}
        />
      )}
      {selectedReport === 'trial_balance' && (
        <TrialBalanceViewer
          isOpen={true}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  )
}

function IncomeStatementViewer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { theme } = useAppStore()
  const { formatCurrency } = useCurrency()
  const [report, setReport] = useState<FinancialReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setMonth(date.getMonth() - 1)
    return date.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])

  const loadReport = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await accountingAPI.getIncomeStatement(startDate, endDate)
      setReport(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sidebar
      isOpen={isOpen}
      onClose={onClose}
      title="Income Statement"
      width="lg"
      contentVariant="default"
      footerContent={
        <div className="p-6">
          <button
            onClick={onClose}
            className={`w-full px-4 py-2.5 rounded-lg border font-medium transition-colors ${
              theme === 'dark'
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Close
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Date Range Filters */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
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
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
            />
          </div>
        </div>

        <button
          onClick={loadReport}
          disabled={loading}
          className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 font-medium transition-colors"
        >
          {loading ? 'Generating Report...' : 'Generate Report'}
        </button>

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {report && (
          <div className="space-y-6">
            {/* Report Header */}
            <div className={`p-4 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Income Statement
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {new Date(report.start_date).toLocaleDateString()} - {new Date(report.end_date).toLocaleDateString()}
              </p>
            </div>

            {/* Income Section */}
            <div className={`p-4 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-750 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h4 className={`text-md font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Revenue
              </h4>
              {report.income_items && report.income_items.length > 0 ? (
                <div className="space-y-2">
                  {report.income_items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        {item.account_name}
                      </span>
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                  <div className={`pt-2 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Total Revenue
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(report.total_income)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Revenue: {formatCurrency(report.total_income)}
                </p>
              )}
            </div>

            {/* Expenses Section */}
            <div className={`p-4 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-750 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h4 className={`text-md font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Expenses
              </h4>
              {report.expense_items && report.expense_items.length > 0 ? (
                <div className="space-y-2">
                  {report.expense_items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        {item.account_name}
                      </span>
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                  <div className={`pt-2 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Total Expenses
                      </span>
                      <span className="text-lg font-bold text-red-600">
                        {formatCurrency(report.total_expenses)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Expenses: {formatCurrency(report.total_expenses)}
                </p>
              )}
            </div>

            {/* Net Profit/Loss */}
            <div className={`p-6 rounded-lg border ${
              report.net_profit >= 0
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex justify-between items-center">
                <span className={`text-lg font-bold ${
                  report.net_profit >= 0 ? 'text-green-800' : 'text-red-800'
                }`}>
                  {report.net_profit >= 0 ? 'Net Profit' : 'Net Loss'}
                </span>
                <span className={`text-2xl font-bold ${
                  report.net_profit >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(Math.abs(report.net_profit))}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Sidebar>
  )
}

function BalanceSheetViewer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { theme } = useAppStore()
  
  return (
    <Sidebar
      isOpen={isOpen}
      onClose={onClose}
      title="Balance Sheet"
      width="lg"
      contentVariant="default"
    >
      <div className={`p-8 text-center rounded-lg border ${
        theme === 'dark' ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'
      }`}>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Balance Sheet report viewer coming soon. Backend endpoint exists but needs frontend implementation.
        </p>
      </div>
    </Sidebar>
  )
}

function TrialBalanceViewer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { theme } = useAppStore()
  const { formatCurrency } = useCurrency()
  const [report, setReport] = useState<TrialBalance | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0])

  const loadReport = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await accountingAPI.getTrialBalance(asOfDate)
      setReport(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sidebar
      isOpen={isOpen}
      onClose={onClose}
      title="Trial Balance"
      width="xl"
      contentVariant="default"
      footerContent={
        <div className="p-6">
          <button
            onClick={onClose}
            className={`w-full px-4 py-2.5 rounded-lg border font-medium transition-colors ${
              theme === 'dark'
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Close
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* As Of Date Filter */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            As Of Date
          </label>
          <input
            type="date"
            value={asOfDate}
            onChange={(e) => setAsOfDate(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
          />
        </div>

        <button
          onClick={loadReport}
          disabled={loading}
          className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 font-medium transition-colors"
        >
          {loading ? 'Generating Report...' : 'Generate Report'}
        </button>

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {report && (
          <div className="space-y-6">
            {/* Report Header */}
            <div className={`p-4 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Trial Balance
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                As of {new Date(report.as_of_date).toLocaleDateString()}
              </p>
              <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                report.is_balanced
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {report.is_balanced ? '✓ Balanced' : '⚠ Not Balanced'}
              </div>
            </div>

            {/* Accounts Table */}
            <div className={`rounded-lg border overflow-hidden ${
              theme === 'dark' ? 'bg-gray-750 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className={theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}>
                    <tr>
                      <th className={`px-4 py-3 text-left text-xs font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Account
                      </th>
                      <th className={`px-4 py-3 text-right text-xs font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Debit
                      </th>
                      <th className={`px-4 py-3 text-right text-xs font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Credit
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {report.accounts.map((account) => (
                      <tr key={account.account_id}>
                        <td className={`px-4 py-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                          <div className="font-medium">{account.account_name}</div>
                          <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                            {account.account_code}
                          </div>
                        </td>
                        <td className={`px-4 py-3 text-right font-medium ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                        }`}>
                          {account.total_debit > 0 ? formatCurrency(account.total_debit) : '-'}
                        </td>
                        <td className={`px-4 py-3 text-right font-medium ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                        }`}>
                          {account.total_credit > 0 ? formatCurrency(account.total_credit) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className={`border-t-2 ${theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-50'}`}>
                    <tr>
                      <td className={`px-4 py-3 font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Total
                      </td>
                      <td className={`px-4 py-3 text-right font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(report.total_debit)}
                      </td>
                      <td className={`px-4 py-3 text-right font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(report.total_credit)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </Sidebar>
  )
}
