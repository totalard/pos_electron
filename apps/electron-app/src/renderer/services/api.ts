/**
 * API service for communicating with the Python backend
 */

const API_BASE_URL = 'http://localhost:8001/api'

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

class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message)
    this.name = 'APIError'
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new APIError(
      error.detail || `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      error
    )
  }
  
  // Handle 204 No Content
  if (response.status === 204) {
    return null as T
  }
  
  return response.json()
}

// ============================================================================
// Authentication API
// ============================================================================

export const authAPI = {
  /**
   * Initialize the primary user on first app launch
   */
  async initializePrimaryUser(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/initialize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    return handleResponse<User>(response)
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
  hardware: HardwareSettings
  receipts: ReceiptSettings
  inventory: InventorySettings
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
  hardware?: Partial<HardwareSettings>
  receipts?: Partial<ReceiptSettings>
  inventory?: Partial<InventorySettings>
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
    if (!response.ok) {
      throw new APIError('Failed to delete category', response.status)
    }
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
    if (!response.ok) {
      throw new APIError('Failed to delete category image', response.status)
    }
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
    if (!response.ok) {
      throw new APIError('Failed to delete product', response.status)
    }
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
    if (!response.ok) {
      throw new APIError('Failed to delete product image', response.status)
    }
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
    if (!response.ok) {
      throw new APIError('Failed to delete variation', response.status)
    }
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
    if (!response.ok) {
      throw new APIError('Failed to remove bundle component', response.status)
    }
  }
}

export { APIError }

