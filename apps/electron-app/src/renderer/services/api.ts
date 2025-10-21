/**
 * API service for communicating with the Python backend
 */

import { jsonRpcFetch, APIError } from '../utils/jsonrpc'
import { getApiUrl } from '../utils/env'

const API_BASE_URL = `${getApiUrl()}/api`

// ============================================================================
// Types
// ============================================================================

export interface User {
  id: number
  full_name: string
  mobile_number?: string
  email?: string
  avatar_color?: string
  role: 'admin' | 'user'
  is_active: boolean
  notes?: string
  last_login?: string
  created_at: string
  updated_at: string
}

export interface UserCreate {
  full_name: string
  mobile_number?: string
  pin: string
  email?: string
  avatar_color?: string
  notes?: string
}

export interface UserLogin {
  pin: string
}

export interface LoginResponse {
  success: boolean
  message: string
  user?: User
  token?: string
}

// ============================================================================
// Customer Types
// ============================================================================

export interface Customer {
  id: number
  name: string
  phone?: string
  email?: string
  address?: string
  loyalty_points: number
  credit_limit: number
  credit_balance: number
  credit_status: 'good' | 'warning' | 'exceeded' | 'blocked'
  created_at: string
  updated_at: string
}

export interface CustomerCreate {
  name: string
  phone?: string
  email?: string
  address?: string
  loyalty_points?: number
}

export interface CustomerUpdate {
  name?: string
  phone?: string
  email?: string
  address?: string
  loyalty_points?: number
}

export interface CustomerCreditOperation {
  amount: number
  reference_number?: string
  notes?: string
}

export interface CustomerLoyaltyOperation {
  points: number
  notes?: string
}

export interface CustomerTransaction {
  id: number
  customer_id: number
  transaction_type: string
  amount: number
  loyalty_points: number
  balance_before: number
  balance_after: number
  loyalty_points_before: number
  loyalty_points_after: number
  reference_number?: string
  notes?: string
  created_at: string
  created_by_id?: number
}

export interface CustomerStatementRequest {
  start_date?: string
  end_date?: string
}

export interface CustomerStatementResponse {
  customer: Customer
  transactions: CustomerTransaction[]
  opening_balance: number
  closing_balance: number
  total_credits: number
  total_payments: number
  statement_period: {
    start_date?: string
    end_date?: string
  }
}

// ============================================================================
// User Activity Types
// ============================================================================

export interface UserActivityLog {
  id: number
  user_id: number
  activity_type: string
  description?: string
  session_id?: string
  ip_address?: string
  duration_ms?: number
  metadata?: Record<string, any>
  created_at: string
}

export interface UserActivityLogCreate {
  activity_type: string
  description?: string
  session_id?: string
  ip_address?: string
  duration_ms?: number
  metadata?: Record<string, any>
}

export interface UserPerformanceMetrics {
  user_id: number
  user_name: string
  total_sales: number
  total_transactions: number
  total_revenue: number
  average_transaction_value: number
  login_count: number
  last_login?: string
  period_start: string
  period_end: string
}

export interface Product {
  id: number
  name: string
  sku?: string
  barcode?: string
  description?: string
  item_type: 'product' | 'service'
  category: string
  cost_price: number
  selling_price: number
  tax_rate: number
  track_inventory: boolean
  current_stock: number
  min_stock_level: number
  max_stock_level: number
  is_active: boolean
  image_url?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface ProductCreate {
  name: string
  sku?: string
  barcode?: string
  description?: string
  item_type?: 'product' | 'service'
  category?: string
  cost_price?: number
  selling_price: number
  tax_rate?: number
  track_inventory?: boolean
  current_stock?: number
  min_stock_level?: number
  max_stock_level?: number
  is_active?: boolean
  image_url?: string
  notes?: string
}

export interface ProductUpdate {
  name?: string
  sku?: string
  barcode?: string
  description?: string
  product_type?: string
  category_id?: number
  base_price?: number
  cost_price?: number
  tax_id?: number
  stock_quantity?: number
  low_stock_threshold?: number
  track_inventory?: boolean
  is_active?: boolean
  notes?: string
}

// ============================================================================
// Product Management Types (New Comprehensive System)
// ============================================================================

export interface ProductCategory {
  id: number
  name: string
  description?: string
  image_path?: string
  parent_category_id?: number
  parent_category_name?: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductCategoryCreate {
  name: string
  description?: string
  parent_category_id?: number
  display_order?: number
  is_active?: boolean
}

export interface ProductCategoryUpdate {
  name?: string
  description?: string
  parent_category_id?: number
  display_order?: number
  is_active?: boolean
}

export interface ProductVariation {
  id: number
  parent_product_id: number
  variation_name: string
  sku?: string
  barcode?: string
  price_adjustment: number
  cost_price?: number
  stock_quantity: number
  attributes: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductVariationCreate {
  variation_name: string
  sku?: string
  barcode?: string
  price_adjustment?: number
  cost_price?: number
  stock_quantity?: number
  attributes?: Record<string, any>
  is_active?: boolean
}

export interface ProductVariationUpdate {
  variation_name?: string
  sku?: string
  barcode?: string
  price_adjustment?: number
  cost_price?: number
  stock_quantity?: number
  attributes?: Record<string, any>
  is_active?: boolean
}

export interface ProductBundleComponent {
  id: number
  bundle_product_id: number
  component_product_id: number
  quantity: number
  created_at: string
  updated_at: string
}

export interface ProductBundleComponentCreate {
  component_product_id: number
  quantity: number
}

export interface EnhancedProduct {
  id: number
  name: string
  sku?: string
  barcode?: string
  description?: string
  product_type: 'simple' | 'bundle' | 'variation' | 'service'
  category_id?: number
  category_name?: string
  base_price: number
  cost_price?: number
  tax_id?: number
  tax_name?: string
  stock_quantity: number
  low_stock_threshold: number
  track_inventory: boolean
  is_active: boolean
  image_paths: string[]
  notes?: string
  variations?: ProductVariation[]
  bundle_components?: ProductBundleComponent[]
  created_at: string
  updated_at: string
}

export interface EnhancedProductCreate {
  name: string
  sku?: string
  barcode?: string
  description?: string
  product_type?: string
  category_id?: number
  base_price: number
  cost_price?: number
  tax_id?: number
  stock_quantity?: number
  low_stock_threshold?: number
  track_inventory?: boolean
  is_active?: boolean
  image_paths?: string[]
  notes?: string
  variations?: ProductVariationCreate[]
  bundle_components?: ProductBundleComponentCreate[]
}

export interface StockTransaction {
  id: number
  transaction_type: string
  product_id: number
  quantity: number
  stock_before: number
  stock_after: number
  unit_cost?: number
  total_cost?: number
  reference_number?: string
  notes?: string
  created_at: string
}

export interface StockTransactionCreate {
  product_id: number
  transaction_type: string
  quantity: number
  unit_cost?: number
  reference_number?: string
  notes?: string
}

// ============================================================================
// API Error Handling
// ============================================================================

// Export APIError from jsonrpc module
export { APIError } from '../utils/jsonrpc'

// Helper function to handle responses with JSON-RPC
async function handleResponse<T>(response: Response, silent = false): Promise<T> {
  const { parseJSONRPCResponse, APIError } = await import('../utils/jsonrpc')
  const { useErrorStore } = await import('../stores/errorStore')
  
  try {
    return await parseJSONRPCResponse<T>(response)
  } catch (error) {
    // Show error modal automatically unless silent mode
    if (!silent && error instanceof APIError) {
      useErrorStore.getState().showError(error)
    }
    throw error
  }
}

// ============================================================================
// Authentication API
// ============================================================================

export const authAPI = {
  /**
   * Initialize the primary user on first app launch
   */
  async initializePrimaryUser(silent = false): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/initialize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    return handleResponse<User>(response, silent)
  },

  /**
   * Login with PIN
   */
  async login(credentials: UserLogin): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })
    return handleResponse<LoginResponse>(response)
  },

  /**
   * Get all users
   */
  async getAllUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/auth/users`)
    return handleResponse<User[]>(response)
  },

  /**
   * Get a specific user
   */
  async getUser(userId: number): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`)
    return handleResponse<User>(response)
  },

  /**
   * Create a new user
   */
  async createUser(userData: UserCreate, createdById: number = 1): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/users?created_by_id=${createdById}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })
    return handleResponse<User>(response)
  },

  /**
   * Update user information
   */
  async updateUser(userId: number, userData: Partial<UserCreate>): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })
    return handleResponse<User>(response)
  },

  /**
   * Change user PIN
   */
  async changePin(userId: number, oldPin: string, newPin: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}/change-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ old_pin: oldPin, new_pin: newPin })
    })
    return handleResponse<{ success: boolean; message: string }>(response)
  },

  /**
   * Delete (deactivate) a user
   */
  async deleteUser(userId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
      method: 'DELETE'
    })
    return handleResponse<void>(response)
  }
}

// ============================================================================
// Products API
// ============================================================================

export const productsAPI = {
  /**
   * Get all products with optional filters
   */
  async getAllProducts(params?: {
    skip?: number
    limit?: number
    is_active?: boolean
    item_type?: string
    category?: string
    search?: string
  }): Promise<Product[]> {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value))
        }
      })
    }
    
    const url = `${API_BASE_URL}/products?${queryParams.toString()}`
    const response = await fetch(url)
    return handleResponse<Product[]>(response)
  },

  /**
   * Get a specific product
   */
  async getProduct(productId: number): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`)
    return handleResponse<Product>(response)
  },

  /**
   * Create a new product
   */
  async createProduct(productData: ProductCreate, createdById: number = 1): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/products?created_by_id=${createdById}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    })
    return handleResponse<Product>(response)
  },

  /**
   * Update a product
   */
  async updateProduct(productId: number, productData: Partial<ProductCreate>): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    })
    return handleResponse<Product>(response)
  },

  /**
   * Delete (deactivate) a product
   */
  async deleteProduct(productId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'DELETE'
    })
    return handleResponse<void>(response)
  }
}

// ============================================================================
// Settings Types
// ============================================================================

export interface GeneralSettings {
  storeName: string
  storeAddress: string
  storePhone: string
  storeEmail: string
  currency: string
  language: string
  timezone: string
}

export interface BusinessSettings {
  mode: 'restaurant' | 'retail'
  enableTableManagement: boolean
  enableReservations: boolean
  enableKitchenDisplay: boolean
  enableBarcodeScanner: boolean
  enableLoyaltyProgram: boolean
  enableQuickCheckout: boolean
}

export interface TaxSettings {
  defaultTaxRate: number
  taxInclusive: boolean
  taxLabel: string
  enableMultipleTaxRates: boolean
}

export interface PaymentSettings {
  methods: Array<{
    id: string
    name: string
    enabled: boolean
    icon: string
    requiresTerminal: boolean
    allowPartialPayment: boolean
    order: number
  }>
  enableSplitPayment: boolean
  enableTipping: boolean
  defaultTipPercentages: number[]
  cashRoundingEnabled: boolean
  cashRoundingAmount: number
}

export interface RestaurantSettings {
  floors: Array<{
    id: string
    name: string
    description?: string
    order: number
    isActive: boolean
  }>
  tables: Array<{
    id: string
    floorId: string
    name: string
    capacity: number
    status: 'available' | 'occupied' | 'reserved' | 'cleaning'
    position?: { x: number; y: number }
    shape?: 'square' | 'circle' | 'rectangle'
  }>
  enableDineIn: boolean
  enableTakeaway: boolean
  enableDelivery: boolean
  enableDriveThru: boolean
  defaultOrderType: 'dine-in' | 'takeaway' | 'delivery' | 'drive-thru'
  additionalCharges: Array<{
    id: string
    type: 'parcel' | 'delivery' | 'service' | 'packaging' | 'custom'
    name: string
    amount: number
    isPercentage: boolean
    isOptional: boolean
    applicableOrderTypes: Array<'dine-in' | 'takeaway' | 'delivery' | 'drive-thru'>
    isActive: boolean
    description?: string
  }>
  enableProductNotes: boolean
  enableSpicyLevel: boolean
  enableSaltLevel: boolean
  enableCookingPreferences: boolean
  customizationOptions: {
    spicyLevels: string[]
    saltLevels: string[]
    cookingPreferences: string[]
  }
  enableKitchenOrders: boolean
  enableCourseManagement: boolean
  courses: string[]
  defaultPrepTime: number
  enableTableService: boolean
  enableWaiterAssignment: boolean
  enableGuestCount: boolean
  autoReleaseTableTime: number
}

export interface HardwareSettings {
  printerEnabled: boolean
  printerName: string
  cashDrawerEnabled: boolean
  barcodeReaderEnabled: boolean
  displayEnabled: boolean
}

export interface ReceiptSettings {
  showLogo: boolean
  logoUrl: string
  headerText: string
  footerText: string
  showTaxBreakdown: boolean
  showBarcode: boolean
}

export interface InventorySettings {
  enableLowStockAlerts: boolean
  lowStockThreshold: number
  enableAutoReorder: boolean
  autoReorderThreshold: number
}

export interface IntegrationSettings {
  enableCloudSync: boolean
  cloudSyncInterval: number
  enableEmailReceipts: boolean
  smtpServer: string
  smtpPort: number
  smtpUsername: string
}

export interface BackupSettings {
  enableAutoBackup: boolean
  backupInterval: number
  backupLocation: string
  lastBackupDate: string | null
  compressionEnabled?: boolean
  encryptionEnabled?: boolean
  backupType?: 'full' | 'incremental' | 'selective'
  retentionDays?: number
  maxBackupCount?: number
}

export interface DisplaySettings {
  theme: 'light' | 'dark'
  fontSize: 'small' | 'medium' | 'large'
  screenTimeout: number
}

export interface SecuritySettings {
  sessionTimeout: number
  requirePinForRefunds: boolean
  requirePinForVoids: boolean
  requirePinForDiscounts: boolean
}

export interface SystemInfo {
  appVersion: string
  buildNumber: string
  lastUpdateCheck: string | null
  databaseVersion: string
}

export interface Settings {
  id: number
  general: GeneralSettings
  business: BusinessSettings
  taxes: TaxSettings
  payments: PaymentSettings
  hardware: HardwareSettings
  receipts: ReceiptSettings
  inventory: InventorySettings
  restaurant: RestaurantSettings
  integration: IntegrationSettings
  backup: BackupSettings
  display: DisplaySettings
  security: SecuritySettings
  about: SystemInfo
  created_at: string
  updated_at: string
}

export interface SettingsUpdate {
  general?: Partial<GeneralSettings>
  business?: Partial<BusinessSettings>
  taxes?: Partial<TaxSettings>
  payments?: Partial<PaymentSettings>
  hardware?: Partial<HardwareSettings>
  receipts?: Partial<ReceiptSettings>
  inventory?: Partial<InventorySettings>
  restaurant?: Partial<RestaurantSettings>
  integration?: Partial<IntegrationSettings>
  backup?: Partial<BackupSettings>
  display?: Partial<DisplaySettings>
  security?: Partial<SecuritySettings>
  about?: Partial<SystemInfo>
}

// ============================================================================
// Settings API
// ============================================================================

export const settingsAPI = {
  /**
   * Get application settings
   */
  async getSettings(): Promise<Settings> {
    const response = await fetch(`${API_BASE_URL}/settings`)
    return handleResponse<Settings>(response)
  },

  /**
   * Update application settings
   */
  async updateSettings(settingsData: SettingsUpdate): Promise<Settings> {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settingsData)
    })
    return handleResponse<Settings>(response)
  },

  /**
   * Perform basic database backup
   */
  async performBackup(location?: string): Promise<{
    success: boolean
    message: string
    backup_file: string
    timestamp: string
  }> {
    const response = await fetch(`${API_BASE_URL}/settings/backup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location })
    })
    return handleResponse(response)
  },

  /**
   * Perform advanced database backup with compression, encryption, and selective options
   */
  async performAdvancedBackup(
    options: {
      compression_enabled: boolean
      backup_type: 'full' | 'incremental' | 'selective'
      selected_tables?: string[]
    },
    onProgress?: (progress: { status: string; progress: number; message: string; estimatedRemaining?: number }) => void
  ): Promise<{
    success: boolean
    message: string
    backup_file: string
    size_bytes: number
    checksum: string
    compressed: boolean
    timestamp: string
  }> {
    const response = await fetch(`${API_BASE_URL}/settings/backup/advanced`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options)
    })
    
    // Simulate progress updates if callback is provided
    if (onProgress) {
      onProgress({ status: 'in_progress', progress: 50, message: 'Creating backup...' })
    }
    
    return handleResponse(response)
  },

  /**
   * Restore database from backup
   */
  async restoreBackup(
    filePath: string,
    onProgress?: (progress: { status: string; progress: number; message: string; estimatedRemaining?: number }) => void
  ): Promise<{
    success: boolean
    message: string
    restored_from: string
    pre_restore_backup: string
  }> {
    const response = await fetch(`${API_BASE_URL}/settings/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath })
    })
    
    // Simulate progress updates if callback is provided
    if (onProgress) {
      onProgress({ status: 'in_progress', progress: 50, message: 'Restoring from backup...' })
    }
    
    return handleResponse(response)
  },

  /**
   * List all available backups
   */
  async listBackups(): Promise<Array<{
    filename: string
    path: string
    size_bytes: number
    size_mb: number
    created_at: string
    is_compressed: boolean
    metadata?: {
      checksum: string
      compression_enabled: boolean
      encryption_enabled: boolean
      backup_type: string
      database_size_bytes: number
      database_size_mb: number
      status: string
    }
  }>> {
    const response = await fetch(`${API_BASE_URL}/settings/backups`)
    const data = await handleResponse<{
      total: number
      backups: Array<{
        filename: string
        path: string
        size_bytes: number
        size_mb: number
        created_at: string
        is_compressed: boolean
        metadata?: {
          checksum: string
          compression_enabled: boolean
          encryption_enabled: boolean
          backup_type: string
          database_size_bytes: number
          database_size_mb: number
          status: string
        }
      }>
    }>(response)
    return data.backups
  },

  /**
   * Delete a specific backup
   */
  async deleteBackup(filename: string): Promise<{
    success: boolean
    message: string
    deleted_file: string
  }> {
    const response = await fetch(`${API_BASE_URL}/settings/backups/${filename}`, {
      method: 'DELETE'
    })
    return handleResponse(response)
  },

  /**
   * Verify backup integrity
   */
  async verifyBackup(filename: string): Promise<{
    verified: boolean
    filename: string
    checksum_match: boolean
    file_exists: boolean
    message: string
  }> {
    const response = await fetch(`${API_BASE_URL}/settings/backups/${filename}/verify`, {
      method: 'POST'
    })
    return handleResponse(response)
  },

  /**
   * Get database information
   */
  async getDatabaseInfo(): Promise<{
    path: string
    size_bytes?: number
    size_mb?: number
    exists: boolean
  }> {
    const response = await fetch(`${API_BASE_URL}/settings/database-info`)
    return handleResponse(response)
  }
}

// ============================================================================
// Product Management API (New Comprehensive System)
// ============================================================================

export const productManagementAPI = {
  // ============================================================================
  // Category Endpoints
  // ============================================================================

  /**
   * Get all product categories
   */
  async getAllCategories(params?: {
    parent_id?: number
    is_active?: boolean
  }): Promise<ProductCategory[]> {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value))
        }
      })
    }

    const url = `${API_BASE_URL}/product-management/categories?${queryParams.toString()}`
    const response = await fetch(url)
    return handleResponse<ProductCategory[]>(response)
  },

  /**
   * Get a specific category
   */
  async getCategory(categoryId: number): Promise<ProductCategory> {
    const response = await fetch(`${API_BASE_URL}/product-management/categories/${categoryId}`)
    return handleResponse<ProductCategory>(response)
  },

  /**
   * Create a new category
   */
  async createCategory(categoryData: ProductCategoryCreate): Promise<ProductCategory> {
    const response = await fetch(`${API_BASE_URL}/product-management/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData)
    })
    return handleResponse<ProductCategory>(response)
  },

  /**
   * Update a category
   */
  async updateCategory(categoryId: number, categoryData: ProductCategoryUpdate): Promise<ProductCategory> {
    const response = await fetch(`${API_BASE_URL}/product-management/categories/${categoryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData)
    })
    return handleResponse<ProductCategory>(response)
  },

  /**
   * Delete a category
   */
  async deleteCategory(categoryId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/product-management/categories/${categoryId}`, {
      method: 'DELETE'
    })
    return handleResponse<void>(response)
  },

  /**
   * Upload category image
   */
  async uploadCategoryImage(categoryId: number, file: File): Promise<{ success: boolean; image_path: string }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/product-management/categories/${categoryId}/image`, {
      method: 'POST',
      body: formData
    })
    return handleResponse(response)
  },

  /**
   * Delete category image
   */
  async deleteCategoryImage(categoryId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/product-management/categories/${categoryId}/image`, {
      method: 'DELETE'
    })
    return handleResponse<void>(response)
  },

  // ============================================================================
  // Product Endpoints
  // ============================================================================

  /**
   * Get all products with filters
   */
  async getAllProducts(params?: {
    skip?: number
    limit?: number
    search?: string
    product_type?: string
    category_id?: number
    is_active?: boolean
  }): Promise<EnhancedProduct[]> {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value))
        }
      })
    }

    const url = `${API_BASE_URL}/product-management/?${queryParams.toString()}`
    const response = await fetch(url)
    return handleResponse<EnhancedProduct[]>(response)
  },

  /**
   * Get a specific product with full details
   */
  async getProduct(productId: number): Promise<EnhancedProduct> {
    const response = await fetch(`${API_BASE_URL}/product-management/products/${productId}`)
    return handleResponse<EnhancedProduct>(response)
  },

  /**
   * Lookup product by barcode
   */
  async lookupByBarcode(barcode: string): Promise<EnhancedProduct> {
    const response = await fetch(`${API_BASE_URL}/product-management/products/barcode/${barcode}`)
    return handleResponse<EnhancedProduct>(response)
  },

  /**
   * Create a new product
   */
  async createProduct(productData: EnhancedProductCreate): Promise<EnhancedProduct> {
    const response = await fetch(`${API_BASE_URL}/product-management/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    })
    return handleResponse<EnhancedProduct>(response)
  },

  /**
   * Update a product
   */
  async updateProduct(productId: number, productData: ProductUpdate): Promise<EnhancedProduct> {
    const response = await fetch(`${API_BASE_URL}/product-management/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    })
    return handleResponse<EnhancedProduct>(response)
  },

  /**
   * Delete a product (soft delete)
   */
  async deleteProduct(productId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/product-management/products/${productId}`, {
      method: 'DELETE'
    })
    return handleResponse<void>(response)
  },

  /**
   * Upload product images
   */
  async uploadProductImages(productId: number, files: File[]): Promise<{
    success: boolean
    image_paths: string[]
    total_images: number
    message: string
  }> {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))

    const response = await fetch(`${API_BASE_URL}/product-management/products/${productId}/images`, {
      method: 'POST',
      body: formData
    })
    return handleResponse(response)
  },

  /**
   * Delete a product image
   */
  async deleteProductImage(productId: number, imageIndex: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/product-management/products/${productId}/images/${imageIndex}`, {
      method: 'DELETE'
    })
    return handleResponse<void>(response)
  },

  // ============================================================================
  // Product Variation Endpoints
  // ============================================================================

  /**
   * Get all variations for a product
   */
  async getProductVariations(productId: number): Promise<ProductVariation[]> {
    const response = await fetch(`${API_BASE_URL}/product-management/products/${productId}/variations`)
    return handleResponse<ProductVariation[]>(response)
  },

  /**
   * Create a new variation
   */
  async createProductVariation(productId: number, variationData: ProductVariationCreate): Promise<ProductVariation> {
    const response = await fetch(`${API_BASE_URL}/product-management/products/${productId}/variations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(variationData)
    })
    return handleResponse<ProductVariation>(response)
  },

  /**
   * Update a variation
   */
  async updateProductVariation(
    productId: number,
    variationId: number,
    variationData: ProductVariationUpdate
  ): Promise<ProductVariation> {
    const response = await fetch(
      `${API_BASE_URL}/product-management/products/${productId}/variations/${variationId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(variationData)
      }
    )
    return handleResponse<ProductVariation>(response)
  },

  /**
   * Delete a variation
   */
  async deleteProductVariation(productId: number, variationId: number): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/product-management/products/${productId}/variations/${variationId}`,
      {
        method: 'DELETE'
      }
    )
    return handleResponse<void>(response)
  },

  // ============================================================================
  // Product Bundle Endpoints
  // ============================================================================

  /**
   * Get all bundle components for a product
   */
  async getBundleComponents(productId: number): Promise<ProductBundleComponent[]> {
    const response = await fetch(`${API_BASE_URL}/product-management/products/${productId}/bundle-components`)
    return handleResponse<ProductBundleComponent[]>(response)
  },

  /**
   * Add a component to a bundle
   */
  async addBundleComponent(
    productId: number,
    componentData: ProductBundleComponentCreate
  ): Promise<ProductBundleComponent> {
    const response = await fetch(`${API_BASE_URL}/product-management/products/${productId}/bundle-components`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(componentData)
    })
    return handleResponse<ProductBundleComponent>(response)
  },

  /**
   * Remove a component from a bundle
   */
  async removeBundleComponent(productId: number, componentId: number): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/product-management/products/${productId}/bundle-components/${componentId}`,
      {
        method: 'DELETE'
      }
    )
    return handleResponse<void>(response)
  }
}

// ============================================================================
// Customer API
// ============================================================================

export const customerAPI = {
  /**
   * Get all customers with optional filters
   */
  async getAllCustomers(params?: {
    skip?: number
    limit?: number
    search?: string
  }): Promise<Customer[]> {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value))
        }
      })
    }

    const url = `${API_BASE_URL}/customers?${queryParams.toString()}`
    const response = await fetch(url)
    return handleResponse<Customer[]>(response)
  },

  /**
   * Get a specific customer
   */
  async getCustomer(customerId: number): Promise<Customer> {
    const response = await fetch(`${API_BASE_URL}/customers/${customerId}`)
    return handleResponse<Customer>(response)
  },

  /**
   * Create a new customer
   */
  async createCustomer(data: CustomerCreate, createdById: number = 1): Promise<Customer> {
    const response = await fetch(`${API_BASE_URL}/customers?created_by_id=${createdById}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    return handleResponse<Customer>(response)
  },

  /**
   * Update a customer
   */
  async updateCustomer(customerId: number, data: CustomerUpdate): Promise<Customer> {
    const response = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    return handleResponse<Customer>(response)
  },

  /**
   * Delete a customer
   */
  async deleteCustomer(customerId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
      method: 'DELETE'
    })
    return handleResponse<void>(response)
  },

  /**
   * Add credit to a customer
   */
  async addCredit(customerId: number, operation: CustomerCreditOperation, createdById: number = 1): Promise<Customer> {
    const response = await fetch(`${API_BASE_URL}/customers/${customerId}/credit/add?created_by_id=${createdById}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(operation)
    })
    return handleResponse<Customer>(response)
  },

  /**
   * Record a payment from a customer
   */
  async recordPayment(customerId: number, operation: CustomerCreditOperation, createdById: number = 1): Promise<Customer> {
    const response = await fetch(`${API_BASE_URL}/customers/${customerId}/credit/payment?created_by_id=${createdById}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(operation)
    })
    return handleResponse<Customer>(response)
  },

  /**
   * Update customer's credit limit
   */
  async updateCreditLimit(customerId: number, limit: number): Promise<Customer> {
    const response = await fetch(`${API_BASE_URL}/customers/${customerId}/credit/limit?limit=${limit}`, {
      method: 'PUT'
    })
    return handleResponse<Customer>(response)
  },

  /**
   * Adjust loyalty points
   */
  async adjustLoyaltyPoints(customerId: number, operation: CustomerLoyaltyOperation, createdById: number = 1): Promise<Customer> {
    const response = await fetch(`${API_BASE_URL}/customers/${customerId}/loyalty/adjust?created_by_id=${createdById}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(operation)
    })
    return handleResponse<Customer>(response)
  },

  /**
   * Get customer transactions
   */
  async getCustomerTransactions(customerId: number, params?: {
    skip?: number
    limit?: number
    transaction_type?: string
  }): Promise<CustomerTransaction[]> {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value))
        }
      })
    }

    const url = `${API_BASE_URL}/customers/${customerId}/transactions?${queryParams.toString()}`
    const response = await fetch(url)
    return handleResponse<CustomerTransaction[]>(response)
  },

  /**
   * Generate customer statement
   */
  async generateStatement(customerId: number, request: CustomerStatementRequest): Promise<CustomerStatementResponse> {
    const response = await fetch(`${API_BASE_URL}/customers/${customerId}/statement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    })
    return handleResponse<CustomerStatementResponse>(response)
  }
}

// ============================================================================
// User Activity API
// ============================================================================

export const userActivityAPI = {
  /**
   * Create an activity log entry
   */
  async createActivityLog(userId: number, data: UserActivityLogCreate): Promise<UserActivityLog> {
    const response = await fetch(`${API_BASE_URL}/user-activity/?user_id=${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    return handleResponse<UserActivityLog>(response)
  },

  /**
   * Get activity logs for a user
   */
  async getUserActivityLogs(userId: number, params?: {
    skip?: number
    limit?: number
    activity_type?: string
    session_id?: string
    start_date?: string
    end_date?: string
  }): Promise<UserActivityLog[]> {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value))
        }
      })
    }

    const url = `${API_BASE_URL}/user-activity/user/${userId}?${queryParams.toString()}`
    const response = await fetch(url)
    return handleResponse<UserActivityLog[]>(response)
  },

  /**
   * Get activity logs for a session
   */
  async getSessionActivityLogs(sessionId: string): Promise<UserActivityLog[]> {
    const response = await fetch(`${API_BASE_URL}/user-activity/session/${sessionId}`)
    return handleResponse<UserActivityLog[]>(response)
  },

  /**
   * Get performance metrics for a user
   */
  async getUserPerformanceMetrics(userId: number, params?: {
    start_date?: string
    end_date?: string
  }): Promise<UserPerformanceMetrics> {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value))
        }
      })
    }

    const url = `${API_BASE_URL}/user-activity/user/${userId}/performance?${queryParams.toString()}`
    const response = await fetch(url)
    return handleResponse<UserPerformanceMetrics>(response)
  },

  /**
   * Get performance metrics for all users
   */
  async getAllUsersPerformanceMetrics(params?: {
    start_date?: string
    end_date?: string
  }): Promise<UserPerformanceMetrics[]> {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value))
        }
      })
    }

    const url = `${API_BASE_URL}/user-activity/performance/all?${queryParams.toString()}`
    const response = await fetch(url)
    return handleResponse<UserPerformanceMetrics[]>(response)
  }
}

// ============================================================================
// POS Session Types
// ============================================================================

export interface DenominationCount {
  value: number
  count: number
  total: number
}

export interface CashDenominations {
  bills?: DenominationCount[]
  coins?: DenominationCount[]
}

export interface POSSession {
  id: number
  session_number: string
  user_id: number
  user_name: string
  status: 'active' | 'closed' | 'suspended'
  opening_cash: number
  opening_denominations: Record<string, any>
  closing_cash?: number
  closing_denominations?: Record<string, any>
  expected_cash?: number
  cash_variance?: number
  total_sales: number
  total_cash_in: number
  total_cash_out: number
  payment_summary: Record<string, any>
  opened_at: string
  closed_at?: string
  opening_notes?: string
  closing_notes?: string
}

export interface SessionCreateRequest {
  user_id: number
  opening_cash: number
  opening_denominations: Record<string, any>
  opening_notes?: string
}

export interface SessionCloseRequest {
  closing_cash: number
  closing_denominations: Record<string, any>
  closing_notes?: string
}

export interface PaymentSummaryItem {
  payment_method: string
  count: number
  total: number
}

export interface SessionSummary {
  session_id: number
  session_number: string
  user_name: string
  status: string
  opened_at: string
  closed_at?: string
  opening_cash: number
  closing_cash?: number
  expected_cash?: number
  cash_variance?: number
  total_sales: number
  total_cash_in: number
  total_cash_out: number
  payment_summary: PaymentSummaryItem[]
  sales_count: number
}

// ============================================================================
// POS Session API
// ============================================================================

export const posSessionAPI = {
  /**
   * Create a new POS session
   */
  async createSession(request: SessionCreateRequest): Promise<POSSession> {
    const response = await fetch(`${API_BASE_URL}/pos-sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    })
    return handleResponse<POSSession>(response)
  },

  /**
   * Get active session for a user
   */
  async getActiveSession(userId: number): Promise<POSSession | null> {
    const response = await fetch(`${API_BASE_URL}/pos-sessions/active?user_id=${userId}`)
    return handleResponse<POSSession | null>(response)
  },

  /**
   * Close a session
   */
  async closeSession(sessionId: number, request: SessionCloseRequest): Promise<POSSession> {
    const response = await fetch(`${API_BASE_URL}/pos-sessions/${sessionId}/close`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    })
    return handleResponse<POSSession>(response)
  },

  /**
   * Get session summary
   */
  async getSessionSummary(sessionId: number): Promise<SessionSummary> {
    const response = await fetch(`${API_BASE_URL}/pos-sessions/${sessionId}/summary`)
    return handleResponse<SessionSummary>(response)
  },

  /**
   * List sessions with optional filters
   */
  async listSessions(params?: {
    user_id?: number
    status?: string
    skip?: number
    limit?: number
  }): Promise<POSSession[]> {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value))
        }
      })
    }

    const url = `${API_BASE_URL}/pos-sessions?${queryParams.toString()}`
    const response = await fetch(url)
    return handleResponse<POSSession[]>(response)
  }
}
