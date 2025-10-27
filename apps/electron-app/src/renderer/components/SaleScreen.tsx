import { useState, useEffect } from 'react'
import { useAppStore, usePOSStore, useProductStore, useSettingsStore, useSessionStore, usePinStore } from '../stores'
import { POSHeader, POSFooter, POSProductGrid, POSProductList, POSCategorySidebar, POSCart, POSSearchBar, POSActionButton, CheckoutModal, DiscountDialog, ItemDiscountDialog, CashManagementDialog, EmailReceiptDialog, SessionCreationSidebar, SessionClosureDialog, CustomerSelector, POSStatusFooter, TransactionNotesDialog, PriceOverrideDialog, QuantityAdjustDialog, ParkedTransactionsDialog, SessionInfoSidebar, PinConfirmDialog } from './pos'
import { TableSelector, OrderTypeSelector, ProductCustomizationDialog, GuestCountSelector, AdditionalChargesSelector, AddressBookManager } from './restaurant'
import { ConfirmDialog, ResizablePanel } from './common'
import { useBarcodeScanner } from '../hooks'
import { posSessionAPI } from '../services/api'
import type { EnhancedProduct } from '../services/api'
import type { OrderType, ProductCustomization } from '../types/restaurant'

interface SaleScreenProps {
  onBack: () => void
}

export function SaleScreen({ onBack }: SaleScreenProps) {
  const { theme } = useAppStore()
  const { business, restaurant } = useSettingsStore()
  const { currentUser } = usePinStore()
  const { activeSession, setActiveSession, hasActiveSession } = useSessionStore()
  const {
    transactions,
    activeTransactionId,
    viewMode,
    categoryViewMode,
    selectedCategoryId,
    searchQuery,
    createTransaction,
    deleteTransaction,
    setActiveTransaction,
    setViewMode,
    setCategoryViewMode,
    setSelectedCategory,
    setSearchQuery,
    addToCart,
    clearCart,
    voidTransaction,
    parkTransaction,
    getCartItemCount,
    getCartSubtotal,
    getCartTax,
    getCartTotal,
    setOrderType,
    setTable,
    updateCartItemCustomization
  } = usePOSStore()
  const { products, categories, fetchProducts, fetchCategories, lookupByBarcode } = useProductStore()
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  
  // Dialog states
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [showDiscountDialog, setShowDiscountDialog] = useState(false)
  const [showCashInDialog, setShowCashInDialog] = useState(false)
  const [showCashOutDialog, setShowCashOutDialog] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [showVoidConfirm, setShowVoidConfirm] = useState(false)
  const [showParkConfirm, setShowParkConfirm] = useState(false)
  const [showHoldDialog, setShowHoldDialog] = useState(false)
  const [showNotesDialog, setShowNotesDialog] = useState(false)
  const [showPriceOverrideDialog, setShowPriceOverrideDialog] = useState(false)
  const [showQuantityDialog, setShowQuantityDialog] = useState(false)
  const [showRecallDialog, setShowRecallDialog] = useState(false)
  const [giftReceiptMode, setGiftReceiptMode] = useState(false)
  const [transactionNotes, setTransactionNotes] = useState('')
  const [selectedItemForPriceOverride, setSelectedItemForPriceOverride] = useState<any>(null)
  const [selectedItemForQuantity, setSelectedItemForQuantity] = useState<any>(null)
  
  // Restaurant dialog states
  const [showOrderTypeSelector, setShowOrderTypeSelector] = useState(false)
  const [showTableSelector, setShowTableSelector] = useState(false)
  const [showGuestCountSelector, setShowGuestCountSelector] = useState(false)
  const [showAdditionalChargesSelector, setShowAdditionalChargesSelector] = useState(false)
  const [showAddressBookManager, setShowAddressBookManager] = useState(false)
  const [showProductCustomization, setShowProductCustomization] = useState(false)
  const [selectedProductForCustomization, setSelectedProductForCustomization] = useState<EnhancedProduct | null>(null)
  const [selectedCartItemForCustomization, setSelectedCartItemForCustomization] = useState<string | null>(null)

  // Session dialog states
  const [showSessionCreation, setShowSessionCreation] = useState(false)
  const [showSessionClosure, setShowSessionClosure] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [showSessionSidebar, setShowSessionSidebar] = useState(false)
  const [showPinConfirm, setShowPinConfirm] = useState(false)

  // Check for active session on mount
  useEffect(() => {
    const checkSession = async () => {
      if (!currentUser) {
        setIsCheckingSession(false)
        return
      }

      try {
        const session = await posSessionAPI.getActiveSession(currentUser.id)
        if (session) {
          setActiveSession(session)
        } else {
          // No active session, show creation dialog
          setShowSessionCreation(true)
        }
      } catch (error) {
        console.error('Failed to check session:', error)
      } finally {
        setIsCheckingSession(false)
      }
    }

    checkSession()
  }, [currentUser])

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
    if (itemCount === 0) return
    setShowCheckoutModal(true)
  }

  const handleCheckoutComplete = (paymentMethod: string, amountPaid: number) => {
    console.log('Payment completed:', { paymentMethod, amountPaid, total })
    // Future: Integrate with backend sales API and receipt printer
    alert(`Payment successful! Method: ${paymentMethod}, Amount: ${amountPaid}`)
    clearCart()
  }

  const handleDiscount = () => {
    if (itemCount === 0) return
    setShowDiscountDialog(true)
  }

  const handleVoid = () => {
    if (itemCount === 0) return
    setShowVoidConfirm(true)
  }

  const handleVoidConfirm = () => {
    if (!activeTransactionId) return
    voidTransaction(activeTransactionId)
    clearCart()
    setShowVoidConfirm(false)
    alert('Transaction voided successfully')
  }

  const handlePark = () => {
    if (itemCount === 0) return
    setShowParkConfirm(true)
  }

  const handleParkConfirm = () => {
    if (!activeTransactionId) return
    parkTransaction(activeTransactionId)
    createTransaction()
    setShowParkConfirm(false)
    alert('Transaction parked successfully')
  }

  const handleOpenDrawer = () => {
    console.log('Opening cash drawer...')
    // Future: Integrate with cash drawer hardware via serial/USB
    alert('Cash drawer opened')
  }

  const handleCashIn = () => {
    setShowCashInDialog(true)
  }

  const handleCashInSubmit = (amount: number, reason: string) => {
    console.log('Cash In:', { amount, reason })
    // Future: Integrate with backend cash management API
    alert(`Cash In: ${amount} - ${reason}`)
  }

  const handleCashOut = () => {
    setShowCashOutDialog(true)
  }

  const handleCashOutSubmit = (amount: number, reason: string) => {
    console.log('Cash Out:', { amount, reason })
    // Future: Integrate with backend cash management API
    alert(`Cash Out: ${amount} - ${reason}`)
  }

  const handleAddCarryBag = () => {
    // Create a carry bag product and add to cart
    const carryBagProduct: EnhancedProduct = {
      id: 0,
      name: 'Carry Bag',
      sku: 'BAG-001',
      base_price: 5,
      is_active: true,
      category_id: 0,
      category_name: 'Accessories',
      stock_quantity: 999,
      product_type: 'simple',
      low_stock_threshold: 10,
      track_inventory: false,
      image_paths: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    addToCart(carryBagProduct, 1)
  }

  const handleGiftReceipt = () => {
    setGiftReceiptMode(!giftReceiptMode)
    alert(giftReceiptMode ? 'Gift receipt mode disabled' : 'Gift receipt mode enabled')
  }

  const handleEmailReceipt = () => {
    setShowEmailDialog(true)
  }

  const handleEmailSend = (email: string) => {
    console.log('Email receipt to:', email)
    // Future: Integrate with backend email service
    alert(`Receipt will be sent to ${email}`)
  }

  const [showCustomerSelector, setShowCustomerSelector] = useState(false)

  const handleCustomer = () => {
    setShowCustomerSelector(true)
  }

  const handleNotes = () => {
    setShowNotesDialog(true)
  }

  const handleNotesSave = (notes: string) => {
    setTransactionNotes(notes)
    console.log('Transaction notes saved:', notes)
    // Future: Save notes to transaction in store
  }

  const handleHold = () => {
    if (itemCount === 0) return
    // Hold is same as Park for now
    handlePark()
  }

  const handleRecall = () => {
    setShowRecallDialog(true)
  }

  const handleRecallTransaction = (transactionId: string) => {
    setActiveTransaction(transactionId)
    console.log('Recalled transaction:', transactionId)
  }

  const handlePriceOverride = () => {
    if (itemCount === 0) return
    const activeTransaction = transactions.find(t => t.id === activeTransactionId)
    if (activeTransaction && activeTransaction.items.length > 0) {
      // Select first item for demo - in real app, user would select item
      setSelectedItemForPriceOverride(activeTransaction.items[0])
      setShowPriceOverrideDialog(true)
    }
  }

  const handlePriceOverrideSubmit = (newPrice: number, reason: string) => {
    console.log('Price override:', { newPrice, reason })
    // Future: Update item price in cart
    alert(`Price overridden to $${newPrice.toFixed(2)} - ${reason}`)
  }

  const handleQuantity = () => {
    if (itemCount === 0) return
    const activeTransaction = transactions.find(t => t.id === activeTransactionId)
    if (activeTransaction && activeTransaction.items.length > 0) {
      // Select first item for demo - in real app, user would select item
      setSelectedItemForQuantity(activeTransaction.items[0])
      setShowQuantityDialog(true)
    }
  }

  const handleQuantityAdjust = (newQuantity: number) => {
    console.log('Quantity adjusted:', newQuantity)
    // Future: Update item quantity in cart
    alert(`Quantity adjusted to ${newQuantity}`)
  }

  // Restaurant-specific handlers
  const handleOrderTypeSelect = (orderType: OrderType) => {
    setOrderType(orderType)
    // If dine-in is selected and table management is enabled, show table selector
    if (orderType === 'dine-in' && business.enableTableManagement && restaurant.tables.length > 0) {
      setShowTableSelector(true)
    }
  }

  const handleTableSelect = (table: any, floor: any) => {
    setTable(table.id, table.name, floor.id, floor.name)
  }

  const handleProductCustomization = (customization: ProductCustomization, note?: string) => {
    if (selectedCartItemForCustomization) {
      updateCartItemCustomization(selectedCartItemForCustomization, customization)
    }
  }

  // Barcode scanner integration
  useBarcodeScanner({
    onScan: handleBarcodeScan,
    minLength: 3,
    timeout: 100,
    preventOnInputFocus: true
  })

  const leftPanel = (
    <div className="flex flex-col overflow-hidden h-full">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header with Tabs and User Info */}
          <POSHeader
            tabs={transactions.map(t => ({
              id: t.id,
              name: t.name,
              badge: t.items.reduce((sum, item) => sum + item.quantity, 0) || undefined,
              createdAt: t.createdAt,
              status: t.status
            }))}
            activeTabId={activeTransactionId || ''}
            onTabChange={setActiveTransaction}
            onTabClose={handleCloseTab}
            onAddTab={handleAddNewTab}
            closeable
            minTabs={1}
            onSessionInfoClick={() => setShowSessionSidebar(true)}
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

          {/* Content Area - Categories and Products */}
          <div className="flex-1 flex overflow-hidden">
            {/* Categories Sidebar */}
            <div className={`
              w-1/5 border-r overflow-hidden flex flex-col
              ${theme === 'dark' ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50/50'}
            `}>
              <POSCategorySidebar
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onCategorySelect={setSelectedCategory}
                viewMode={categoryViewMode}
                onViewModeChange={setCategoryViewMode}
                isLoading={isLoadingProducts}
              />
            </div>

            {/* Products Section */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Search Bar */}
              <div className={`
                px-4 py-3 border-b min-h-[48px] flex items-center
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
          </div>
        </div>

        {/* Footer with Transaction Summary and Actions - Inside Left Section */}
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
              variant="neutral"
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
              variant="neutral"
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
              variant="neutral"
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
              variant="neutral"
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
            <POSActionButton
              label="Customer"
              variant="neutral"
              size="md"
              onClick={handleCustomer}
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />
            <POSActionButton
              label="Notes"
              variant="neutral"
              size="md"
              onClick={handleNotes}
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              }
            />
            <POSActionButton
              label="Hold"
              variant="warning"
              size="md"
              onClick={handleHold}
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <POSActionButton
              label="Recall"
              variant="success"
              size="md"
              onClick={handleRecall}
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              }
            />
            <POSActionButton
              label="Price"
              variant="neutral"
              size="md"
              onClick={handlePriceOverride}
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <POSActionButton
              label="Quantity"
              variant="neutral"
              size="md"
              onClick={handleQuantity}
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
              }
            />
          </>
        }
      />

      {/* Status Footer */}
      <POSStatusFooter />
    </div>
  )

  const rightPanel = (
    <div className={`
      border-l flex flex-col h-full
      ${theme === 'dark' ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-white'}
    `}>
      <POSCart 
        showCustomer 
        onCustomerSelect={handleCustomer}
        onCheckout={handleCheckout}
        checkoutDisabled={itemCount === 0}
        onChangeOrderType={() => setShowOrderTypeSelector(true)}
        onChangeTable={() => setShowTableSelector(true)}
        onChangeGuestCount={() => setShowGuestCountSelector(true)}
        onManageCharges={() => setShowAdditionalChargesSelector(true)}
        onManageDeliveryAddress={() => setShowAddressBookManager(true)}
      />
    </div>
  )

  // Show loading state while checking session
  if (isCheckingSession) {
    return (
      <div className={`
        fixed inset-0 z-50 flex items-center justify-center
        ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}
      `}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mb-4"
            style={{ borderColor: theme === 'dark' ? '#60a5fa' : '#3b82f6', borderRightColor: 'transparent' }}
          />
          <p className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Loading session...
          </p>
        </div>
      </div>
    )
  }

  // Show session creation sidebar if no active session
  if (!activeSession) {
    return (
      <div className={`
        fixed inset-0 z-50 flex items-center justify-center
        ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}
      `}>
        <SessionCreationSidebar
          isOpen={true}
          onSessionCreated={() => {
            setShowSessionCreation(false)
          }}
          onCancel={() => {
            onBack()
          }}
        />
      </div>
    )
  }

  return (
    <div className={`
      fixed inset-0 z-50 flex flex-col
      ${theme === 'dark'
        ? 'bg-gray-900'
        : 'bg-gray-50'
      }
    `}>
      <ResizablePanel
        leftPanel={leftPanel}
        rightPanel={rightPanel}
        defaultLeftWidth={66.67}
        minLeftWidth={40}
        maxLeftWidth={80}
        storageKey="pos-screen-split"
      />

      {/* Dialogs */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        onComplete={handleCheckoutComplete}
      />

      <DiscountDialog
        isOpen={showDiscountDialog}
        onClose={() => setShowDiscountDialog(false)}
      />

      <ItemDiscountDialog
        isOpen={usePOSStore.getState().showDiscountDialog}
        onClose={() => usePOSStore.getState().setShowDiscountDialog(false)}
      />

      <CashManagementDialog
        isOpen={showCashInDialog}
        onClose={() => setShowCashInDialog(false)}
        type="in"
        onSubmit={handleCashInSubmit}
      />

      <CashManagementDialog
        isOpen={showCashOutDialog}
        onClose={() => setShowCashOutDialog(false)}
        type="out"
        onSubmit={handleCashOutSubmit}
      />

      <EmailReceiptDialog
        isOpen={showEmailDialog}
        onClose={() => setShowEmailDialog(false)}
        onSend={handleEmailSend}
      />

      <ConfirmDialog
        isOpen={showVoidConfirm}
        onClose={() => setShowVoidConfirm(false)}
        onConfirm={handleVoidConfirm}
        title="Void Transaction"
        message="Are you sure you want to void this transaction? This action cannot be undone."
        confirmText="Void"
        cancelText="Cancel"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={showParkConfirm}
        onClose={() => setShowParkConfirm(false)}
        onConfirm={handleParkConfirm}
        title="Park Transaction"
        message="Park this transaction and start a new one?"
        confirmText="Park"
        cancelText="Cancel"
        variant="warning"
      />

      {/* Transaction Notes Dialog */}
      <TransactionNotesDialog
        isOpen={showNotesDialog}
        onClose={() => setShowNotesDialog(false)}
        initialNotes={transactionNotes}
        onSave={handleNotesSave}
      />

      {/* Price Override Dialog */}
      {selectedItemForPriceOverride && (
        <PriceOverrideDialog
          isOpen={showPriceOverrideDialog}
          onClose={() => {
            setShowPriceOverrideDialog(false)
            setSelectedItemForPriceOverride(null)
          }}
          currentPrice={selectedItemForPriceOverride.unitPrice}
          productName={selectedItemForPriceOverride.product.name}
          onOverride={handlePriceOverrideSubmit}
        />
      )}

      {/* Quantity Adjust Dialog */}
      {selectedItemForQuantity && (
        <QuantityAdjustDialog
          isOpen={showQuantityDialog}
          onClose={() => {
            setShowQuantityDialog(false)
            setSelectedItemForQuantity(null)
          }}
          currentQuantity={selectedItemForQuantity.quantity}
          productName={selectedItemForQuantity.product.name}
          onAdjust={handleQuantityAdjust}
        />
      )}

      {/* Parked Transactions Dialog */}
      <ParkedTransactionsDialog
        isOpen={showRecallDialog}
        onClose={() => setShowRecallDialog(false)}
        onRecall={handleRecallTransaction}
      />

      {/* Restaurant Dialogs */}
      {business.mode === 'restaurant' && (
        <>
          <OrderTypeSelector
            isOpen={showOrderTypeSelector}
            onClose={() => setShowOrderTypeSelector(false)}
            onSelectOrderType={handleOrderTypeSelect}
          />

          <TableSelector
            isOpen={showTableSelector}
            onClose={() => setShowTableSelector(false)}
            onSelectTable={handleTableSelect}
          />

          <GuestCountSelector
            isOpen={showGuestCountSelector}
            onClose={() => setShowGuestCountSelector(false)}
          />

          <AdditionalChargesSelector
            isOpen={showAdditionalChargesSelector}
            onClose={() => setShowAdditionalChargesSelector(false)}
          />

          <AddressBookManager
            isOpen={showAddressBookManager}
            onClose={() => setShowAddressBookManager(false)}
          />

          {selectedProductForCustomization && (
            <ProductCustomizationDialog
              isOpen={showProductCustomization}
              onClose={() => {
                setShowProductCustomization(false)
                setSelectedProductForCustomization(null)
                setSelectedCartItemForCustomization(null)
              }}
              onSave={handleProductCustomization}
              productName={selectedProductForCustomization.name}
            />
          )}
        </>
      )}


      {showSessionClosure && (
        <SessionClosureDialog
          onSessionClosed={() => {
            setShowSessionClosure(false)
            onBack()
          }}
          onCancel={() => {
            setShowSessionClosure(false)
          }}
        />
      )}

      {/* Customer Selector */}
      <CustomerSelector
        isOpen={showCustomerSelector}
        onClose={() => setShowCustomerSelector(false)}
      />

      {/* Session Info Sidebar */}
      <SessionInfoSidebar
        isOpen={showSessionSidebar}
        onClose={() => setShowSessionSidebar(false)}
        onCloseSession={() => setShowPinConfirm(true)}
      />

      {/* PIN Confirmation Dialog */}
      <PinConfirmDialog
        isOpen={showPinConfirm}
        onClose={() => setShowPinConfirm(false)}
        onConfirm={() => setShowSessionClosure(true)}
        title="Close Session"
        message="Please enter your PIN to close the current session"
      />
    </div>
  )
}

