import { useState, useEffect } from 'react'
import { useAppStore } from '../../stores'
import { useCurrency } from '../../hooks/useCurrency'
import { purchaseAPI } from '../../services/accountingAPI'
import { PurchaseFormSidebar } from './PurchaseFormSidebar'
import { Sidebar } from '../common'
import type { Purchase } from '../../types/accounting'

export function PurchasesTab() {
  const { theme } = useAppStore()
  const { formatCurrency } = useCurrency()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFormSidebar, setShowFormSidebar] = useState(false)
  const [showDetailSidebar, setShowDetailSidebar] = useState(false)
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null)
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [receiving, setReceiving] = useState<number | null>(null)

  useEffect(() => {
    loadPurchases()
  }, [filterStatus])

  const loadPurchases = async () => {
    try {
      setLoading(true)
      setError(null)
      const filters: any = {}
      if (filterStatus !== 'all') filters.status = filterStatus
      const data = await purchaseAPI.getPurchases(filters)
      setPurchases(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load purchases')
    } finally {
      setLoading(false)
    }
  }

  const handleReceivePurchase = async (purchaseId: number) => {
    try {
      setReceiving(purchaseId)
      await purchaseAPI.receivePurchase(purchaseId)
      await loadPurchases()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to receive purchase')
    } finally {
      setReceiving(null)
    }
  }

  const filteredPurchases = purchases.filter(purchase => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      purchase.purchase_number.toLowerCase().includes(query) ||
      purchase.vendor_name.toLowerCase().includes(query) ||
      (purchase.invoice_number && purchase.invoice_number.toLowerCase().includes(query))
    )
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received':
        return 'text-green-600 bg-green-100'
      case 'ordered':
        return 'text-blue-600 bg-blue-100'
      case 'partial':
        return 'text-yellow-600 bg-yellow-100'
      case 'cancelled':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-100'
      case 'partial':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-red-600 bg-red-100'
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Purchase Orders
          </h2>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage inventory purchases and vendor orders
          </p>
        </div>
        <button
          onClick={() => {
            setEditingPurchase(null)
            setShowFormSidebar(true)
          }}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Purchase
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search purchases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={`px-4 py-2 rounded-lg border ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-700 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="ordered">Ordered</option>
          <option value="received">Received</option>
          <option value="partial">Partial</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      ) : (
        <div className={`rounded-lg border overflow-hidden ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={theme === 'dark' ? 'bg-gray-750' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Purchase #
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Vendor
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Date
                  </th>
                  <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Total
                  </th>
                  <th className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Payment
                  </th>
                  <th className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center">
                      <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        No purchases found
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPurchases.map((purchase) => (
                    <tr
                      key={purchase.id}
                      onClick={() => {
                        setSelectedPurchase(purchase)
                        setShowDetailSidebar(true)
                      }}
                      className={`hover:bg-opacity-50 cursor-pointer ${
                        theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        {purchase.purchase_number}
                      </td>
                      <td className={`px-6 py-4 text-sm ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        <div>{purchase.vendor_name}</div>
                        {purchase.invoice_number && (
                          <div className={`text-xs mt-1 ${
                            theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                          }`}>
                            Invoice: {purchase.invoice_number}
                          </div>
                        )}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {new Date(purchase.purchase_date).toLocaleDateString()}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        {formatCurrency(purchase.total_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(purchase.status)}`}>
                          {purchase.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getPaymentStatusColor(purchase.payment_status)}`}>
                          {purchase.payment_status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {purchase.status === 'ordered' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleReceivePurchase(purchase.id)
                            }}
                            disabled={receiving === purchase.id}
                            className="px-3 py-1 text-xs bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50 transition-colors"
                          >
                            {receiving === purchase.id ? 'Receiving...' : 'Receive'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Sidebar */}
      <PurchaseFormSidebar
        isOpen={showFormSidebar}
        onClose={() => {
          setShowFormSidebar(false)
          setEditingPurchase(null)
        }}
        onSuccess={() => {
          setShowFormSidebar(false)
          setEditingPurchase(null)
          loadPurchases()
        }}
        purchase={editingPurchase}
      />

      {/* Detail Sidebar */}
      {selectedPurchase && (
        <PurchaseDetailSidebar
          isOpen={showDetailSidebar}
          onClose={() => {
            setShowDetailSidebar(false)
            setSelectedPurchase(null)
          }}
          purchase={selectedPurchase}
          onEdit={(purchase) => {
            setEditingPurchase(purchase)
            setShowFormSidebar(true)
            setShowDetailSidebar(false)
          }}
        />
      )}
    </div>
  )
}

function PurchaseDetailSidebar({ 
  isOpen, 
  onClose, 
  purchase, 
  onEdit 
}: { 
  isOpen: boolean
  onClose: () => void
  purchase: Purchase
  onEdit?: (purchase: Purchase) => void
}) {
  const { theme } = useAppStore()
  const { formatCurrency } = useCurrency()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received':
        return 'text-green-600 bg-green-100'
      case 'ordered':
        return 'text-blue-600 bg-blue-100'
      case 'partial':
        return 'text-yellow-600 bg-yellow-100'
      case 'cancelled':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <Sidebar
      isOpen={isOpen}
      onClose={onClose}
      title="Purchase Details"
      width="lg"
      contentVariant="default"
      footerContent={
        onEdit && purchase.status === 'draft' && (
          <div className="p-6">
            <button
              onClick={() => onEdit(purchase)}
              className="w-full px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium transition-colors"
            >
              Edit Purchase
            </button>
          </div>
        )
      }
    >
      <div className="space-y-6">
        {/* Header Info */}
        <div className={`p-4 rounded-lg border ${
          theme === 'dark' ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {purchase.purchase_number}
              </h3>
              <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {new Date(purchase.purchase_date).toLocaleDateString()}
              </p>
            </div>
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(purchase.status)}`}>
              {purchase.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Vendor Information */}
        <div className={`p-4 rounded-lg border ${
          theme === 'dark' ? 'bg-gray-750 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Vendor Information
          </h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {purchase.vendor_name}
              </span>
            </div>
            {purchase.vendor_contact && (
              <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                {purchase.vendor_contact}
              </div>
            )}
            {purchase.vendor_address && (
              <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                {purchase.vendor_address}
              </div>
            )}
            {purchase.invoice_number && (
              <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                Invoice: {purchase.invoice_number}
              </div>
            )}
          </div>
        </div>

        {/* Items */}
        <div className={`p-4 rounded-lg border ${
          theme === 'dark' ? 'bg-gray-750 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Items ({purchase.items.length})
          </h4>
          <div className="space-y-3">
            {purchase.items.map((item, index) => (
              <div key={index} className={`p-3 rounded border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {item.product_name}
                    </div>
                    {item.barcode && (
                      <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                        Barcode: {item.barcode}
                      </div>
                    )}
                  </div>
                  <div className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(item.total_cost)}
                  </div>
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {item.quantity} × {formatCurrency(item.unit_cost)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className={`p-4 rounded-lg border ${
          theme === 'dark' ? 'bg-gray-750 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Summary
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Subtotal</span>
              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(purchase.subtotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Tax</span>
              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(purchase.tax_amount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Shipping</span>
              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(purchase.shipping_cost)}
              </span>
            </div>
            <div className={`pt-2 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-between">
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Total</span>
                <span className="text-lg font-bold text-teal-600">
                  {formatCurrency(purchase.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className={`p-4 rounded-lg border ${
          theme === 'dark' ? 'bg-gray-750 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Payment Information
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Payment Method</span>
              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {purchase.payment_method || 'Not specified'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Amount Paid</span>
              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(purchase.amount_paid)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Status</span>
              <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                purchase.payment_status === 'paid'
                  ? 'bg-green-100 text-green-700'
                  : purchase.payment_status === 'partial'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {purchase.payment_status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {purchase.notes && (
          <div className={`p-4 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-750 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h4 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Notes
            </h4>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {purchase.notes}
            </p>
          </div>
        )}
      </div>
    </Sidebar>
  )
}
