/**
 * Environment utilities
 */

// Type assertion for Vite environment
const env = (import.meta as any).env || {}

export const isDevelopment = (): boolean => {
  return env.MODE === 'development' || 
         env.VITE_NODE_ENV === 'development' ||
         env.DEV === true
}

export const isProduction = (): boolean => {
  return !isDevelopment()
}

export const getApiUrl = (): string => {
  return env.VITE_API_URL || 'http://localhost:8000'
}

export const getAppName = (): string => {
  return env.VITE_APP_NAME || 'POS Application'
}

export const getAppVersion = (): string => {
  return env.VITE_APP_VERSION || '1.0.0'
}
