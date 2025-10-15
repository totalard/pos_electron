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
  role: 'primary' | 'staff'
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
  notes?: string
}

export interface UserLogin {
  pin: string
  user_id?: number
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

export interface CompanySettings {
  id: number
  // General Settings
  business_type: string
  language: string
  timezone: string
  number_format: string

  // Company Information
  company_name?: string
  company_email?: string
  company_phone?: string
  company_address_street?: string
  company_address_city?: string
  company_address_state?: string
  company_address_zip?: string
  company_address_country?: string
  currency: string

  // Multiple Locations/Branches
  enable_multi_location: boolean
  locations: any[]

  // Fiscal Year Settings
  fiscal_year_start_month: number
  fiscal_year_start_day: number

  // Business Hours
  business_hours: Record<string, any>

  // Tax Settings
  tax_rates: any[]
  enable_tax_exemptions: boolean
  tax_exemption_codes: any[]
  enable_compound_tax: boolean
  tax_reporting_frequency: string

  // Inventory Settings
  track_inventory: boolean
  low_stock_threshold: number
  enable_low_stock_alerts: boolean
  auto_reorder_enabled: boolean
  auto_reorder_threshold: number
  default_reorder_quantity: number

  // Barcode Settings
  barcode_format: string
  auto_generate_barcodes: boolean

  // Unit of Measure
  enable_uom_conversions: boolean
  uom_conversions: any[]

  // Batch/Serial Number Tracking
  enable_batch_tracking: boolean
  enable_serial_tracking: boolean

  created_at: string
  updated_at: string
}

export interface UserSettings {
  id: number
  user_id: number

  // Accessibility Settings
  date_format: string
  font_size: string
  high_contrast: boolean
  reduced_motion: boolean

  // Color Blind Modes
  color_blind_mode: string

  // Screen Reader Support
  enable_screen_reader: boolean

  // Keyboard Shortcuts
  keyboard_shortcuts: Record<string, any>
  enable_keyboard_shortcuts: boolean

  // Language Override
  language_override?: string

  // Timezone Override
  timezone_override?: string

  // Notification Preferences
  enable_notifications: boolean
  notification_sound: boolean

  // Dashboard Preferences
  dashboard_layout: Record<string, any>

  created_at: string
  updated_at: string
}

// ============================================================================
// Settings API
// ============================================================================

export const settingsAPI = {
  /**
   * Get company settings
   */
  async getCompanySettings(): Promise<CompanySettings> {
    const response = await fetch(`${API_BASE_URL}/settings/company`)
    return handleResponse<CompanySettings>(response)
  },

  /**
   * Update company settings
   */
  async updateCompanySettings(settings: Partial<CompanySettings>): Promise<CompanySettings> {
    const response = await fetch(`${API_BASE_URL}/settings/company`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settings)
    })
    return handleResponse<CompanySettings>(response)
  },

  /**
   * Get user settings by user ID
   */
  async getUserSettings(userId: number): Promise<UserSettings> {
    const response = await fetch(`${API_BASE_URL}/settings/user/${userId}`)
    return handleResponse<UserSettings>(response)
  },

  /**
   * Update user settings by user ID
   */
  async updateUserSettings(userId: number, settings: Partial<UserSettings>): Promise<UserSettings> {
    const response = await fetch(`${API_BASE_URL}/settings/user/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settings)
    })
    return handleResponse<UserSettings>(response)
  },

  /**
   * Reset user settings to defaults
   */
  async resetUserSettings(userId: number): Promise<{ message: string; settings: UserSettings }> {
    const response = await fetch(`${API_BASE_URL}/settings/user/${userId}`, {
      method: 'DELETE'
    })
    return handleResponse<{ message: string; settings: UserSettings }>(response)
  }
}

export { APIError }

