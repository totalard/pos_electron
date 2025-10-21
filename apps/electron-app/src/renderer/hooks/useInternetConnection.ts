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
      // Try to fetch a small resource with no-cache to verify actual connectivity
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
      
      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache',
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      setStatus({
        isOnline: true,
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
