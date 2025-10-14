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

export { APIError }

