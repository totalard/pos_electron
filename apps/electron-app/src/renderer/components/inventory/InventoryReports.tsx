import { useEffect, useState } from 'react'
import { useAppStore } from '../../stores'
import { LoadingSpinner, Button } from '../common'
import { useCurrency } from '../../hooks/useCurrency'

interface InventoryValuation {
  total_cost_value: number
  total_selling_value: number
  potential_profit: number
  profit_margin_percentage: number
  total_products: number
  total_quantity: number
  category_breakdown: Record<string, {
    cost_value: number
    selling_value: number
    potential_profit: number
    quantity: number
    products: number
  }>
}

interface ReorderSuggestion {
  product_id: number
  product_name: string
  sku: string
  current_stock: number
  min_stock_level: number
  max_stock_level: number
  suggested_quantity: number
  estimated_cost: number
  urgency: 'critical' | 'high' | 'medium'
}

interface ABCAnalysis {
  a_items: { products: any[], count: number, total_value: number, percentage_of_total: number }
  b_items: { products: any[], count: number, total_value: number, percentage_of_total: number }
  c_items: { products: any[], count: number, total_value: number, percentage_of_total: number }
  total_value: number
  total_products: number
}

export function InventoryReports() {
  const { theme } = useAppStore()
  const { formatCurrency } = useCurrency()
  const [activeTab, setActiveTab] = useState<'valuation' | 'reorder' | 'abc'>('valuation')
  const [isLoading, setIsLoading] = useState(false)
  const [valuation, setValuation] = useState<InventoryValuation | null>(null)
  const [reorderSuggestions, setReorderSuggestions] = useState<{ suggestions: ReorderSuggestion[], total_products: number, critical_count: number, high_priority_count: number, total_estimated_cost: number } | null>(null)
  const [abcAnalysis, setABCAnalysis] = useState<ABCAnalysis | null>(null)

  const API_BASE_URL = 'http://localhost:8000/api'

  useEffect(() => {
    if (activeTab === 'valuation') {
      fetchValuation()
    } else if (activeTab === 'reorder') {
      fetchReorderSuggestions()
    } else if (activeTab === 'abc') {
      fetchABCAnalysis()
    }
  }, [activeTab])

  const fetchValuation = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/products/inventory/valuation`)
      if (response.ok) {
        const data = await response.json()
        setValuation(data)
      }
    } catch (error) {
      console.error('Failed to fetch valuation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchReorderSuggestions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/products/inventory/reorder-suggestions`)
      if (response.ok) {
        const data = await response.json()
        setReorderSuggestions(data)
      }
    } catch (error) {
      console.error('Failed to fetch reorder suggestions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchABCAnalysis = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/products/inventory/abc-analysis`)
      if (response.ok) {
        const data = await response.json()
        setABCAnalysis(data)
      }
    } catch (error) {
      console.error('Failed to fetch ABC analysis:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: 'valuation', label: 'Inventory Valuation', icon: '💰' },
    { id: 'reorder', label: 'Reorder Suggestions', icon: '📦' },
    { id: 'abc', label: 'ABC Analysis', icon: '📊' }
  ]

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className={`
        flex gap-2 p-1 rounded-xl
        ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}
      `}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200
              ${activeTab === tab.id
                ? theme === 'dark'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-primary-500 text-white shadow-lg'
                : theme === 'dark'
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }
            `}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Valuation Report */}
      {!isLoading && activeTab === 'valuation' && valuation && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Cost Value</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(valuation.total_cost_value)}
              </p>
            </div>
            <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Selling Value</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(valuation.total_selling_value)}
              </p>
            </div>
            <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Potential Profit</p>
              <p className={`text-2xl font-bold text-green-600 dark:text-green-400`}>
                {formatCurrency(valuation.potential_profit)}
              </p>
            </div>
            <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Profit Margin</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {valuation.profit_margin_percentage.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Category Breakdown
            </h3>
            <div className="space-y-3">
              {Object.entries(valuation.category_breakdown).map(([category, data]) => (
                <div key={category} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{category}</h4>
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {data.products} products • {data.quantity} units
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Cost</p>
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(data.cost_value)}
                      </p>
                    </div>
                    <div>
                      <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Selling</p>
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(data.selling_value)}
                      </p>
                    </div>
                    <div>
                      <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Profit</p>
                      <p className={`font-medium text-green-600 dark:text-green-400`}>
                        {formatCurrency(data.potential_profit)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reorder Suggestions */}
      {!isLoading && activeTab === 'reorder' && reorderSuggestions && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Products</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {reorderSuggestions.total_products}
              </p>
            </div>
            <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50 border border-red-700/50' : 'bg-white border border-red-200'}`}>
              <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Critical</p>
              <p className={`text-2xl font-bold text-red-600 dark:text-red-400`}>
                {reorderSuggestions.critical_count}
              </p>
            </div>
            <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50 border border-yellow-700/50' : 'bg-white border border-yellow-200'}`}>
              <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>High Priority</p>
              <p className={`text-2xl font-bold text-yellow-600 dark:text-yellow-400`}>
                {reorderSuggestions.high_priority_count}
              </p>
            </div>
            <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Estimated Cost</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(reorderSuggestions.total_estimated_cost)}
              </p>
            </div>
          </div>

          {/* Suggestions List */}
          {reorderSuggestions.suggestions.length > 0 ? (
            <div className={`rounded-xl overflow-hidden ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <table className="w-full">
                <thead className={`${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <tr>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Product</th>
                    <th className={`px-4 py-3 text-right text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Current</th>
                    <th className={`px-4 py-3 text-right text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Min Level</th>
                    <th className={`px-4 py-3 text-right text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Suggested Qty</th>
                    <th className={`px-4 py-3 text-right text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Est. Cost</th>
                    <th className={`px-4 py-3 text-center text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Urgency</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {reorderSuggestions.suggestions.map((suggestion) => (
                    <tr key={suggestion.product_id} className={`${theme === 'dark' ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'}`}>
                      <td className={`px-4 py-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                        <div className="font-medium">{suggestion.product_name}</div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{suggestion.sku}</div>
                      </td>
                      <td className={`px-4 py-3 text-right ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {suggestion.current_stock}
                      </td>
                      <td className={`px-4 py-3 text-right ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {suggestion.min_stock_level}
                      </td>
                      <td className={`px-4 py-3 text-right font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {suggestion.suggested_quantity}
                      </td>
                      <td className={`px-4 py-3 text-right ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                        {formatCurrency(suggestion.estimated_cost)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${suggestion.urgency === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                            suggestion.urgency === 'high' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}
                        `}>
                          {suggestion.urgency}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={`p-12 rounded-xl text-center ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                No reorder suggestions at this time
              </p>
            </div>
          )}
        </div>
      )}

      {/* ABC Analysis */}
      {!isLoading && activeTab === 'abc' && abcAnalysis && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'A Items (High Value)', data: abcAnalysis.a_items, color: 'green' },
              { label: 'B Items (Medium Value)', data: abcAnalysis.b_items, color: 'yellow' },
              { label: 'C Items (Low Value)', data: abcAnalysis.c_items, color: 'blue' }
            ].map(({ label, data, color }) => (
              <div key={label} className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                <h4 className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{label}</h4>
                <p className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {data.count} products
                </p>
                <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Value: {formatCurrency(data.total_value)}
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {data.percentage_of_total.toFixed(1)}% of total
                </p>
              </div>
            ))}
          </div>

          {/* Category Tabs */}
          <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Product Distribution
            </h3>
            <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              ABC analysis helps prioritize inventory management by categorizing products based on their value contribution.
              Focus on A items for tight control, B items for moderate control, and C items for simple controls.
            </p>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between text-sm">
                <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Products</span>
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{abcAnalysis.total_products}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Value</span>
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(abcAnalysis.total_value)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
