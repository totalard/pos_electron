import { useState, useEffect } from 'react'

export interface InternetConnectionStatus {
  isOnline: boolean
  isChecking: boolean
  lastChecked: Date | null
}

/**
 * Hook to monitor internet connection status
 * Checks both browser online status and actual connectivity
 */
export function useInternetConnection(checkInterval: number = 30000) {
  const [status, setStatus] = useState<InternetConnectionStatus>({
    isOnline: navigator.onLine,
    isChecking: false,
    lastChecked: null
  })

  // Check actual internet connectivity by making a request
  const checkConnectivity = async () => {
    setStatus(prev => ({ ...prev, isChecking: true }))
    
    try {
      // Use a reliable endpoint that supports CORS
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
      
      // Try multiple endpoints for reliability
      const endpoints = [
        'https://dns.google/resolve?name=google.com&type=A',
        'https://1.1.1.1/cdn-cgi/trace'
      ]
      
      let connected = false
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            method: 'GET',
            cache: 'no-cache',
            signal: controller.signal
          })
          
          if (response.ok) {
            connected = true
            break
          }
        } catch {
          continue
        }
      }
      
      clearTimeout(timeoutId)
      
      setStatus({
        isOnline: connected,
        isChecking: false,
        lastChecked: new Date()
      })
    } catch (error) {
      setStatus({
        isOnline: false,
        isChecking: false,
        lastChecked: new Date()
      })
    }
  }

  useEffect(() => {
    // Initial check
    checkConnectivity()

    // Set up periodic checks
    const intervalId = setInterval(checkConnectivity, checkInterval)

    // Listen to browser online/offline events
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }))
      checkConnectivity() // Verify actual connectivity
    }

    const handleOffline = () => {
      setStatus({
        isOnline: false,
        isChecking: false,
        lastChecked: new Date()
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Cleanup
    return () => {
      clearInterval(intervalId)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [checkInterval])

  return status
}
