import { useEffect, useState } from 'react'
import { useAppStore, useInventoryStore } from '../../stores'
import { PageHeader, PageContainer } from '../layout'
import { Button, IconButton, ThemeToggle, LoadingSpinner, ErrorMessage } from '../common'
import { InventoryDashboard } from './InventoryDashboard'
import { StockTransactionsList } from './StockTransactionsList'
import { StockAdjustmentForm } from './StockAdjustmentForm'

interface InventoryScreenProps {
  onBack: () => void
}

export function InventoryScreen({ onBack }: InventoryScreenProps) {
  const { theme } = useAppStore()
  const {
    viewMode,
    isLoading,
    error,
    stats,
    settings,
    fetchStats,
    fetchSettings,
    fetchLowStockProducts,
    fetchTransactions,
    fetchAdjustments,
    setViewMode
  } = useInventoryStore()

  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false)

  // Load initial data
  useEffect(() => {
    fetchStats().catch(err => console.error('Failed to fetch stats:', err))
    fetchSettings().catch(err => console.error('Failed to fetch settings:', err))
    fetchLowStockProducts().catch(err => console.error('Failed to fetch low stock:', err))
    // Fetch transactions silently - endpoint may not be implemented yet
    fetchTransactions().catch(() => {
      // Silently handle transaction fetch errors
    })
    fetchAdjustments().catch(err => console.error('Failed to fetch adjustments:', err))
  }, [fetchStats, fetchSettings, fetchLowStockProducts, fetchTransactions, fetchAdjustments])

  const handleViewChange = (mode: typeof viewMode) => {
    setViewMode(mode)
  }

  const handleNewAdjustment = () => {
    setShowAdjustmentForm(true)
  }

  const handleCloseAdjustmentForm = () => {
    setShowAdjustmentForm(false)
    fetchAdjustments()
    fetchStats()
  }

  return (
    <div className={`
      h-screen w-screen flex flex-col
      ${theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
      }
    `}>
      {/* Header */}
      <PageHeader
        title="Inventory Management"
        subtitle="Track stock levels, transactions, and adjustments"
        showBackButton
        onBack={onBack}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        }
        actions={
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className={`
              flex items-center gap-1 p-1 rounded-lg
              ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}
            `}>
              <IconButton
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                }
                label="Overview"
                onClick={() => handleViewChange('overview')}
                variant={viewMode === 'overview' ? 'primary' : 'ghost'}
                size="sm"
              />
              <IconButton
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8l2 2 4-4" />
                  </svg>
                }
                label="Transactions"
                onClick={() => handleViewChange('transactions')}
                variant={viewMode === 'transactions' ? 'primary' : 'ghost'}
                size="sm"
              />
              <IconButton
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                }
                label="Adjustments"
                onClick={() => handleViewChange('adjustments')}
                variant={viewMode === 'adjustments' ? 'primary' : 'ghost'}
                size="sm"
              />
              <IconButton
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
                label="Reports"
                onClick={() => handleViewChange('reports')}
                variant={viewMode === 'reports' ? 'primary' : 'ghost'}
                size="sm"
              />
            </div>

            {settings?.enableStockAdjustment && (
              <Button
                variant="primary"
                size="md"
                onClick={handleNewAdjustment}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                New Adjustment
              </Button>
            )}
            <ThemeToggle size="md" />
          </div>
        }
      />

      {/* Main Content */}
      <PageContainer>
        {/* Error Message */}
        {error && (
          <ErrorMessage message={error} className="mb-4" />
        )}

        {/* Loading State */}
        {isLoading && !stats && (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Content Based on View Mode */}
        {!isLoading && (
          <>
            {viewMode === 'overview' && <InventoryDashboard />}
            {viewMode === 'transactions' && <StockTransactionsList />}
            {viewMode === 'adjustments' && (
              <div className={`
                p-6 rounded-xl
                ${theme === 'dark' 
                  ? 'bg-gray-800/50 border border-gray-700' 
                  : 'bg-white border border-gray-200'
                }
              `}>
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Stock Adjustments
                  </h3>
                  <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Create and manage bulk stock adjustments
                  </p>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleNewAdjustment}
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    }
                  >
                    Create Adjustment
                  </Button>
                </div>
              </div>
            )}
            {viewMode === 'reports' && (
              <div className={`
                p-6 rounded-xl
                ${theme === 'dark' 
                  ? 'bg-gray-800/50 border border-gray-700' 
                  : 'bg-white border border-gray-200'
                }
              `}>
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Inventory Reports
                  </h3>
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Analytics and reporting features coming soon
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </PageContainer>

      {/* Stock Adjustment Form Modal */}
      {showAdjustmentForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className={`
            w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4 rounded-xl shadow-2xl
            ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}
          `}>
            <StockAdjustmentForm onClose={handleCloseAdjustmentForm} />
          </div>
        </div>
      )}
    </div>
  )
}
