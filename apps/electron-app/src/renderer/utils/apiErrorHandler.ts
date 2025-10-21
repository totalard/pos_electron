/**
 * API Error Handler Utility
 * Wraps API calls and automatically shows error modal on failures
 */

import { useErrorStore } from '../stores/errorStore'
import { APIError } from './jsonrpc'

/**
 * Wrap an async function with automatic error handling
 * Shows error modal on API errors
 */
export async function withErrorHandler<T>(
  fn: () => Promise<T>,
  options?: {
    silent?: boolean // Don't show error modal
    onError?: (error: unknown) => void // Custom error handler
  }
): Promise<T | null> {
  try {
    return await fn()
  } catch (error) {
    // Call custom error handler if provided
    if (options?.onError) {
      options.onError(error)
    }

    // Show error modal unless silent mode
    if (!options?.silent) {
      useErrorStore.getState().showError(error)
    }

    // Log error for debugging
    if (error instanceof APIError) {
      console.error('API Error:', {
        code: error.code,
        message: error.message,
        data: error.data
      })
    } else {
      console.error('Error:', error)
    }

    return null
  }
}

/**
 * Create a wrapped version of an API function that automatically handles errors
 */
export function createErrorHandledAPI<TArgs extends any[], TReturn>(
  apiFn: (...args: TArgs) => Promise<TReturn>,
  options?: {
    silent?: boolean
    onError?: (error: unknown) => void
  }
): (...args: TArgs) => Promise<TReturn | null> {
  return async (...args: TArgs) => {
    return withErrorHandler(() => apiFn(...args), options)
  }
}
