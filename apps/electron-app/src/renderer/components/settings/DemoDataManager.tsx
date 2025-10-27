import { useState } from 'react'
import { useAppStore } from '../../stores'
import { Button } from '../common'

const API_BASE_URL = 'http://localhost:8000/api'

export function DemoDataManager() {
  const { theme } = useAppStore()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [stats, setStats] = useState<any>(null)

  const checkDemoStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/demo/status`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to check demo status:', error)
    }
  }

  const handleGenerateDemoData = async () => {
    if (!confirm('This will generate comprehensive demo data including products, customers, and transactions. Continue?')) {
      return
    }

    setIsGenerating(true)
    setMessage(null)

    try {
      const response = await fetch(`${API_BASE_URL}/demo/generate`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Failed to generate demo data')
      }

      const result = await response.json()
      setMessage({
        type: 'success',
        text: `Demo data generated successfully! Created ${result.data.products} products, ${result.data.customers} customers, ${result.data.discounts} discounts, ${result.data.sessions} sessions, and ${result.data.sales} sales.`
      })
      
      // Refresh stats
      await checkDemoStatus()
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to generate demo data'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClearDemoData = async () => {
    if (!confirm('⚠️ WARNING: This will delete ALL products, categories, customers, and transactions. This action cannot be undone. Are you sure?')) {
      return
    }

    if (!confirm('Are you ABSOLUTELY sure? This will permanently delete all data!')) {
      return
    }

    setIsClearing(true)
    setMessage(null)

    try {
      const response = await fetch(`${API_BASE_URL}/demo/clear`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to clear demo data')
      }

      setMessage({
        type: 'success',
        text: 'All demo data has been cleared successfully.'
      })
      
      // Refresh stats
      await checkDemoStatus()
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to clear demo data'
      })
    } finally {
      setIsClearing(false)
    }
  }

  // Check status on mount
  useState(() => {
    checkDemoStatus()
  })

  return (
    <div className={`
      rounded-xl p-6
      ${theme === 'dark'
        ? 'bg-gray-800/50 border border-gray-700'
        : 'bg-white border border-gray-200'
      }
    `}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`
          p-3 rounded-lg
          ${theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-50'}
        `}>
          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div>
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Demo Data Management
          </h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Generate or clear comprehensive demo data for testing
          </p>
        </div>
      </div>

      {/* Current Status */}
      {stats && (
        <div className={`
          p-4 rounded-lg mb-6
          ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}
        `}>
          <h4 className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Current Data Status
          </h4>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Categories</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stats.categories || 0}
              </p>
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Products</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stats.products}
              </p>
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Customers</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stats.customers}
              </p>
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Discounts</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stats.discounts || 0}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>POS Sessions</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stats.sessions || 0}
              </p>
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Sales</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stats.sales || 0}
              </p>
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Stock Transactions</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stats.transactions || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`
          p-4 rounded-lg mb-6
          ${message.type === 'success'
            ? theme === 'dark' ? 'bg-green-500/10 border border-green-500/50' : 'bg-green-50 border border-green-200'
            : theme === 'dark' ? 'bg-red-500/10 border border-red-500/50' : 'bg-red-50 border border-red-200'
          }
        `}>
          <p className={`text-sm ${
            message.type === 'success'
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}>
            {message.text}
          </p>
        </div>
      )}

      {/* Demo Data Info */}
      <div className={`
        p-4 rounded-lg mb-6
        ${theme === 'dark' ? 'bg-blue-500/10 border border-blue-500/50' : 'bg-blue-50 border border-blue-200'}
      `}>
        <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-900'}`}>
          What will be generated:
        </h4>
        <ul className={`text-sm space-y-1 ${theme === 'dark' ? 'text-blue-200' : 'text-blue-800'}`}>
          <li>• <strong>Product Categories</strong> - Hierarchical category structure</li>
          <li>• <strong>10 Simple Products</strong> - Electronics, food, home items with stock levels</li>
          <li>• <strong>2 Variation Products</strong> - T-shirts and shoes with multiple sizes/colors</li>
          <li>• <strong>2 Bundle Products</strong> - Office bundle and snack pack</li>
          <li>• <strong>4 Service Products</strong> - Repair and consultation services</li>
          <li>• <strong>10 Customers</strong> - With contact information</li>
          <li>• <strong>5 Discounts</strong> - Percentage, fixed amount, and promotional discounts</li>
          <li>• <strong>2 POS Sessions</strong> - One closed session and one active session</li>
          <li>• <strong>15 Sales Transactions</strong> - Historical sales with various payment methods</li>
          <li>• <strong>Stock Transactions</strong> - Purchase, sale, and adjustment records</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="primary"
          size="md"
          onClick={handleGenerateDemoData}
          disabled={isGenerating || isClearing}
          isLoading={isGenerating}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          Generate Demo Data
        </Button>
        
        <Button
          variant="danger"
          size="md"
          onClick={handleClearDemoData}
          disabled={isGenerating || isClearing}
          isLoading={isClearing}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          }
        >
          Clear All Data
        </Button>

        <Button
          variant="ghost"
          size="md"
          onClick={checkDemoStatus}
          disabled={isGenerating || isClearing}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          }
        >
          Refresh Status
        </Button>
      </div>

      {/* Warning */}
      <div className={`
        mt-6 p-3 rounded-lg
        ${theme === 'dark' ? 'bg-yellow-500/10 border border-yellow-500/50' : 'bg-yellow-50 border border-yellow-200'}
      `}>
        <p className={`text-xs ${theme === 'dark' ? 'text-yellow-200' : 'text-yellow-800'}`}>
          ⚠️ <strong>Warning:</strong> Use demo data only in development/testing environments. Clearing data is permanent and cannot be undone.
        </p>
      </div>
    </div>
  )
}
