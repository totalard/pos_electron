/**
 * JSON-RPC 2.0 Client Implementation
 */

import { isDevelopment } from './env'

/**
 * JSON-RPC 2.0 Error object
 */
export interface JSONRPCError {
  code: number
  message: string
  data?: {
    httpStatus?: number
    validationErrors?: Array<{
      field: string
      message: string
      type: string
    }>
    stackTrace?: string
    detail?: string
    type?: string
    [key: string]: unknown
  }
}

/**
 * JSON-RPC 2.0 Response object
 */
export interface JSONRPCResponse<T = unknown> {
  jsonrpc: string
  id?: string | null
  result?: T
  error?: JSONRPCError
}

/**
 * Custom API Error class with JSON-RPC error details
 */
export class APIError extends Error {
  public code: number
  public data?: JSONRPCError['data']
  public httpStatus?: number
  public stackTrace?: string

  constructor(error: JSONRPCError) {
    super(error.message)
    this.name = 'APIError'
    this.code = error.code
    this.data = error.data
    this.httpStatus = error.data?.httpStatus
    this.stackTrace = error.data?.stackTrace
  }

  /**
   * Check if this is a validation error
   */
  isValidationError(): boolean {
    return this.code === -32001 && !!this.data?.validationErrors
  }

  /**
   * Check if this is an authentication error
   */
  isAuthError(): boolean {
    return this.code === -32002
  }

  /**
   * Check if this is a not found error
   */
  isNotFoundError(): boolean {
    return this.code === -32004
  }

  /**
   * Get validation errors if available
   */
  getValidationErrors() {
    return this.data?.validationErrors || []
  }

  /**
   * Get a user-friendly error message
   */
  getUserMessage(): string {
    if (this.isValidationError()) {
      const errors = this.getValidationErrors()
      if (errors.length > 0) {
        return errors.map(e => `${e.field}: ${e.message}`).join(', ')
      }
    }
    return this.message
  }
}

/**
 * Parse JSON-RPC response and handle errors
 */
export async function parseJSONRPCResponse<T>(response: Response): Promise<T> {
  // Check if response is ok (2xx status)
  if (!response.ok) {
    // Try to parse JSON-RPC error response
    try {
      const jsonRpcResponse: JSONRPCResponse<T> = await response.json()
      
      if (jsonRpcResponse.error) {
        throw new APIError(jsonRpcResponse.error)
      }
      
      // If no error in JSON-RPC but HTTP status is not ok, create generic error
      throw new APIError({
        code: -32603,
        message: `HTTP ${response.status}: ${response.statusText}`,
        data: { httpStatus: response.status }
      })
    } catch (error) {
      // If JSON parsing fails, throw generic error
      if (error instanceof APIError) {
        throw error
      }
      
      throw new APIError({
        code: -32603,
        message: `HTTP ${response.status}: ${response.statusText}`,
        data: { httpStatus: response.status }
      })
    }
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T
  }

  // Parse successful response
  try {
    const jsonRpcResponse: JSONRPCResponse<T> = await response.json()
    
    // Check for JSON-RPC error even in successful HTTP response
    if (jsonRpcResponse.error) {
      throw new APIError(jsonRpcResponse.error)
    }
    
    // Return the result
    return jsonRpcResponse.result as T
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }
    
    // JSON parsing error
    throw new APIError({
      code: -32700,
      message: 'Failed to parse response',
      data: { detail: error instanceof Error ? error.message : 'Unknown error' }
    })
  }
}

/**
 * Create a JSON-RPC request wrapper
 */
export async function jsonRpcFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, options)
    return await parseJSONRPCResponse<T>(response)
  } catch (error) {
    // Re-throw APIError as-is
    if (error instanceof APIError) {
      throw error
    }
    
    // Network or other errors
    throw new APIError({
      code: -32603,
      message: error instanceof Error ? error.message : 'Network error',
      data: { 
        type: error instanceof Error ? error.constructor.name : 'Unknown',
        detail: error instanceof Error ? error.message : String(error)
      }
    })
  }
}

/**
 * Format error for display
 */
export function formatErrorForDisplay(error: unknown): {
  title: string
  message: string
  code?: number
  stackTrace?: string
  details?: Record<string, unknown>
} {
  if (error instanceof APIError) {
    return {
      title: getErrorTitle(error.code),
      message: error.getUserMessage(),
      code: error.code,
      stackTrace: isDevelopment() ? error.stackTrace : undefined,
      details: isDevelopment() ? error.data : undefined
    }
  }

  if (error instanceof Error) {
    return {
      title: 'Error',
      message: error.message,
      stackTrace: isDevelopment() ? error.stack : undefined
    }
  }

  return {
    title: 'Unknown Error',
    message: String(error)
  }
}

/**
 * Get user-friendly error title based on error code
 */
function getErrorTitle(code: number): string {
  const titles: Record<number, string> = {
    [-32700]: 'Parse Error',
    [-32600]: 'Invalid Request',
    [-32601]: 'Method Not Found',
    [-32602]: 'Invalid Parameters',
    [-32603]: 'Internal Error',
    [-32001]: 'Validation Error',
    [-32002]: 'Authentication Required',
    [-32003]: 'Access Denied',
    [-32004]: 'Not Found',
    [-32005]: 'Conflict',
    [-32006]: 'Database Error',
    [-32007]: 'Business Logic Error'
  }

  return titles[code] || 'Error'
}
