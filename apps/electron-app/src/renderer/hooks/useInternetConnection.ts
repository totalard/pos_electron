import { useState, useEffect } from 'react'

export interface InternetConnectionStatus {
  isOnline: boolean
  isChecking: boolean
  lastChecked: Date | null
}

/**
 * Hook to monitor internet connection status
 * Uses Electron IPC for reliable network checks, with fallback to browser API
 */
export function useInternetConnection(checkInterval: number = 30000) {
  const [status, setStatus] = useState<InternetConnectionStatus>({
    isOnline: navigator.onLine,
    isChecking: false,
    lastChecked: null
  })

  // Check actual internet connectivity
  const checkConnectivity = async () => {
    setStatus(prev => ({ ...prev, isChecking: true }))
    
    try {
      let connected = navigator.onLine // Start with browser status
      
      // Try to use Electron IPC for more reliable check
      if (window.electronAPI?.checkNetworkStatus) {
        try {
          const result = await window.electronAPI.checkNetworkStatus()
          connected = result.isOnline
        } catch (error) {
          // If IPC fails, fall back to browser API
          console.debug('IPC network check failed, using browser API', error)
          connected = navigator.onLine
        }
      } else {
        // Fallback: try a simple fetch to verify connectivity
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 5000)
          
          const response = await fetch('https://www.google.com/generate_204', {
            method: 'GET',
            cache: 'no-cache',
            signal: controller.signal
          })
          
          clearTimeout(timeoutId)
          connected = response.ok || response.status === 204
        } catch {
          // If fetch fails, use browser online status
          connected = navigator.onLine
        }
      }
      
      setStatus({
        isOnline: connected,
        isChecking: false,
        lastChecked: new Date()
      })
    } catch (error) {
      console.error('Network check error:', error)
      setStatus({
        isOnline: navigator.onLine,
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
