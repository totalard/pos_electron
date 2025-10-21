import { useState, useEffect } from 'react'
import { useAppStore, usePOSStore, useProductStore, useSettingsStore } from '../stores'
import { POSHeader, POSFooter, POSProductGrid, POSProductList, POSCategorySidebar, POSCart, POSSearchBar, POSActionButton } from './pos'
import { useBarcodeScanner } from '../hooks'
import type { EnhancedProduct } from '../services/api'

interface SaleScreenProps {
  onBack: () => void
}

export function SaleScreen({ onBack }: SaleScreenProps) {
  const { theme } = useAppStore()
  const { business } = useSettingsStore()
  const {
    transactions,
    activeTransactionId,
    viewMode,
    selectedCategoryId,
    searchQuery,
    createTransaction,
    deleteTransaction,
    setActiveTransaction,
    setViewMode,
    setSelectedCategory,
    setSearchQuery,
    addToCart,
    getCartItemCount,
    getCartSubtotal,
    getCartTax,
    getCartTotal
  } = usePOSStore()
  const { products, categories, fetchProducts, fetchCategories, lookupByBarcode } = useProductStore()
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)

  // Initialize first transaction if none exists
  useEffect(() => {
    if (transactions.length === 0) {
      createTransaction()
    }
  }, [])

  // Load products and categories
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingProducts(true)
      try {
        await Promise.all([fetchProducts(), fetchCategories()])
      } catch (error) {
        console.error('Failed to load POS data:', error)
      } finally {
        setIsLoadingProducts(false)
      }
    }
    loadData()
  }, [])

  // Auto-set view mode based on business mode
  useEffect(() => {
    if (business.mode === 'restaurant' && viewMode !== 'grid') {
      setViewMode('grid')
    } else if (business.mode === 'retail' && viewMode !== 'list') {
      setViewMode('list')
    }
  }, [business.mode])

  // Filter products based on category and search
  const filteredProducts = products.filter(product => {
    // Filter by active status
    if (!product.is_active) return false

    // Filter by category
    if (selectedCategoryId !== null && product.category_id !== selectedCategoryId) {
      return false
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        product.name.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query) ||
        product.barcode?.toLowerCase().includes(query) ||
        product.category_name?.toLowerCase().includes(query)
      )
    }

    return true
  })

  // Transaction data
  const itemCount = getCartItemCount()
  const subtotal = getCartSubtotal()
  const tax = getCartTax()
  const total = getCartTotal()

  const handleAddNewTab = () => {
    createTransaction()
  }

  const handleCloseTab = (tabId: string) => {
    // Always allow closing - deleteTransaction will auto-create if it's the last tab
    deleteTransaction(tabId)
  }

  const handleProductClick = (product: EnhancedProduct) => {
    addToCart(product, 1)
  }

  const handleBarcodeScan = async (barcode: string) => {
    try {
      const product = await lookupByBarcode(barcode)
      if (product) {
        addToCart(product, 1)
      }
    } catch (error) {
      console.error('Product not found for barcode:', barcode)
    }
  }

  const handleCheckout = () => {
    console.log('Checkout clicked')
    // TODO: Implement checkout logic
  }

  const handleDiscount = () => {
    console.log('Discount clicked')
    // TODO: Implement discount logic
  }

  const handleVoid = () => {
    console.log('Void clicked')
    // TODO: Implement void logic
  }

  const handlePark = () => {
    console.log('Park clicked')
    // TODO: Implement park transaction logic
  }

  const handleOpenDrawer = () => {
    console.log('Open Drawer clicked')
    // TODO: Implement cash drawer open logic
  }

  const handleCashIn = () => {
    console.log('Cash In clicked')
    // TODO: Implement cash in logic
  }

  const handleCashOut = () => {
    console.log('Cash Out clicked')
    // TODO: Implement cash out logic
  }

  const handleAddCarryBag = () => {
    console.log('Add Carry Bag clicked')
    // TODO: Implement add carry bag to cart logic
  }

  const handleGiftReceipt = () => {
    console.log('Gift Receipt clicked')
    // TODO: Implement gift receipt logic
  }

  const handleEmailReceipt = () => {
    console.log('Email Receipt clicked')
    // TODO: Implement email receipt logic
  }

  // Barcode scanner integration
  useBarcodeScanner({
    onScan: handleBarcodeScan,
    minLength: 3,
    timeout: 100,
    preventOnInputFocus: true
  })

  return (
    <div className={`
      fixed inset-0 z-50 flex flex-col
      ${theme === 'dark'
        ? 'bg-gray-900'
        : 'bg-gray-50'
      }
    `}>
      {/* Header with Tabs and User Info */}
      <POSHeader
        tabs={transactions.map(t => ({
          id: t.id,
          name: t.name,
          badge: t.items.reduce((sum, item) => sum + item.quantity, 0) || undefined,
          createdAt: t.createdAt
        }))}
        activeTabId={activeTransactionId || ''}
        onTabChange={setActiveTransaction}
        onTabClose={handleCloseTab}
        onAddTab={handleAddNewTab}
        closeable
        minTabs={1}
        actions={
          <button
            onClick={onBack}
            className={`
              px-3 py-2 rounded-lg transition-colors
              ${theme === 'dark'
                ? 'hover:bg-gray-700 text-gray-300'
                : 'hover:bg-gray-100 text-gray-700'
              }
            `}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        }
      />

      {/* Main Content - Split Screen Layout (1/3 - 2/3) */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Section (1/3) - Categories */}
        <div className={`
          w-1/4 border-r overflow-hidden flex flex-col
          ${theme === 'dark' ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50/50'}
        `}>
          <POSCategorySidebar
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onCategorySelect={setSelectedCategory}
            isLoading={isLoadingProducts}
          />
        </div>

        {/* Middle Section (2/3) - Products */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search Bar */}
          <div className={`
            px-4 py-3 border-b
            ${theme === 'dark' ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-white'}
          `}>
            <POSSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onBarcodeScan={handleBarcodeScan}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              placeholder="Search products by name, SKU, or barcode..."
            />
          </div>

          {/* Product Display */}
          <div className="flex-1 overflow-hidden">
            {viewMode === 'grid' ? (
              <POSProductGrid
                products={filteredProducts}
                onProductClick={handleProductClick}
                isLoading={isLoadingProducts}
              />
            ) : (
              <POSProductList
                products={filteredProducts}
                onProductClick={handleProductClick}
                isLoading={isLoadingProducts}
              />
            )}
          </div>
        </div>

        {/* Right Section (1/3) - Cart */}
        <div className={`
          w-1/3 border-l overflow-hidden
          ${theme === 'dark' ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-white'}
        `}>
          <POSCart showCustomer />
        </div>
      </main>

      {/* Footer with Transaction Summary and Actions */}
      <POSFooter
        subtotal={subtotal}
        tax={tax}
        total={total}
        itemCount={itemCount}
        actions={
          <>
            <POSActionButton
              label="Open Drawer"
              variant="warning"
              size="md"
              onClick={handleOpenDrawer}
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              }
            />
            <POSActionButton
              label="Cash In"
              variant="success"
              size="md"
              onClick={handleCashIn}
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            />
            <POSActionButton
              label="Cash Out"
              variant="danger"
              size="md"
              onClick={handleCashOut}
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              }
            />
            <POSActionButton
              label="Carry Bag"
              variant="info"
              size="md"
              onClick={handleAddCarryBag}
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              }
            />
            <POSActionButton
              label="Discount"
              variant="secondary"
              size="md"
              onClick={handleDiscount}
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              }
            />
            <POSActionButton
              label="Gift Receipt"
              variant="purple"
              size="md"
              onClick={handleGiftReceipt}
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              }
            />
            <POSActionButton
              label="Email"
              variant="info"
              size="md"
              onClick={handleEmailReceipt}
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
            />
            <POSActionButton
              label="Void"
              variant="danger"
              size="md"
              onClick={handleVoid}
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              }
            />
            <POSActionButton
              label="Park"
              variant="warning"
              size="md"
              onClick={handlePark}
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              }
            />
          </>
        }
        primaryAction={{
          label: 'Checkout',
          onClick: handleCheckout,
          disabled: itemCount === 0
        }}
      />
    </div>
  )
}

