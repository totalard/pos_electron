import { useState } from 'react'
import { useAppStore, useCustomerStore } from '../../stores'
import { RightPanel, Button, Badge } from '../common'
import { FormField } from '../forms'
import type { Customer, CustomerStatementResponse } from '../../services/api'

interface CustomerStatementPanelProps {
  customer: Customer
  onClose: () => void
}

export function CustomerStatementPanel({ customer, onClose }: CustomerStatementPanelProps) {
  const { theme } = useAppStore()
  const { generateStatement } = useCustomerStore()

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [statement, setStatement] = useState<CustomerStatementResponse | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // Handle generate statement
  const handleGenerateStatement = async () => {
    setIsGenerating(true)
    try {
      const result = await generateStatement(customer.id, {
        start_date: startDate || undefined,
        end_date: endDate || undefined
      })
      if (result) {
        setStatement(result)
      }
    } catch (error) {
      console.error('Failed to generate statement:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // Handle print statement
  const handlePrintStatement = () => {
    window.print()
  }

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  // Format transaction type
  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'credit_sale':
        return 'Credit Sale'
      case 'payment':
        return 'Payment'
      case 'credit_adjustment':
        return 'Credit Adjustment'
      case 'loyalty_earned':
        return 'Loyalty Earned'
      case 'loyalty_redeemed':
        return 'Loyalty Redeemed'
      default:
        return type
    }
  }

  return (
    <RightPanel
      isOpen={true}
      onClose={onClose}
      title={`Statement - ${customer.name}`}
      width="xl"
    >
      <div className="flex flex-col h-full">
        {/* Date Range Selection */}
        <div className={`
          p-4 rounded-lg mb-6
          ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}
        `}>
          <h4 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Statement Period
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Date">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`
                  w-full px-4 py-2 rounded-lg border transition-colors min-h-[44px]
                  ${theme === 'dark'
                    ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  }
                `}
              />
            </FormField>
            <FormField label="End Date">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`
                  w-full px-4 py-2 rounded-lg border transition-colors min-h-[44px]
                  ${theme === 'dark'
                    ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  }
                `}
              />
            </FormField>
          </div>
          <Button
            variant="primary"
            onClick={handleGenerateStatement}
            disabled={isGenerating}
            className="w-full mt-4 min-h-[44px]"
          >
            {isGenerating ? 'Generating...' : 'Generate Statement'}
          </Button>
        </div>

        {/* Statement Display */}
        {statement && (
          <div className="flex-1 overflow-y-auto">
            {/* Statement Header */}
            <div className={`
              p-6 rounded-lg mb-6
              ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}
            `}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Customer Statement
                  </h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {formatDate(statement.statement_period.start_date)} - {formatDate(statement.statement_period.end_date)}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={handlePrintStatement}
                  className="min-h-[44px]"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print
                </Button>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Customer Name
                  </p>
                  <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {statement.customer.name}
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Contact
                  </p>
                  <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {statement.customer.phone || statement.customer.email || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Balance Summary */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Opening Balance
                  </p>
                  <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    ${statement.opening_balance.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total Credits
                  </p>
                  <p className="text-lg font-bold text-orange-500">
                    ${statement.total_credits.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total Payments
                  </p>
                  <p className="text-lg font-bold text-green-500">
                    ${statement.total_payments.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Closing Balance
                  </p>
                  <p className={`text-lg font-bold ${statement.closing_balance > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                    ${statement.closing_balance.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <div className={`
              rounded-lg overflow-hidden
              ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}
            `}>
              <table className="w-full">
                <thead className={theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}>
                  <tr>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Date
                    </th>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Type
                    </th>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Description
                    </th>
                    <th className={`px-4 py-3 text-right text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Amount
                    </th>
                    <th className={`px-4 py-3 text-right text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {statement.transactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center">
                        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                          No transactions found for this period
                        </p>
                      </td>
                    </tr>
                  ) : (
                    statement.transactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className={`
                          border-t
                          ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}
                        `}
                      >
                        <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {formatDate(transaction.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={transaction.transaction_type === 'payment' ? 'success' : 'warning'}>
                            {getTransactionTypeLabel(transaction.transaction_type)}
                          </Badge>
                        </td>
                        <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {transaction.notes || transaction.reference_number || '-'}
                        </td>
                        <td className={`
                          px-4 py-3 text-sm text-right font-semibold
                          ${transaction.transaction_type === 'payment' ? 'text-green-500' : 'text-orange-500'}
                        `}>
                          {transaction.transaction_type === 'payment' ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
                        </td>
                        <td className={`px-4 py-3 text-sm text-right font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          ${transaction.balance_after.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!statement && !isGenerating && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Select a date range and click "Generate Statement"
              </p>
            </div>
          </div>
        )}
      </div>
    </RightPanel>
  )
}

