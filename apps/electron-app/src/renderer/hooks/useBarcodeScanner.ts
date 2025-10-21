import { useEffect, useRef } from 'react'
import { usePOSStore } from '../stores'

/**
 * Barcode scanner hook configuration
 */
export interface BarcodeScannerConfig {
  /** Callback when barcode is scanned */
  onScan: (barcode: string) => void
  /** Minimum barcode length (default: 3) */
  minLength?: number
  /** Maximum time between keystrokes in ms (default: 100) */
  timeout?: number
  /** Prevent scanning when input is focused (default: true) */
  preventOnInputFocus?: boolean
}

/**
 * Custom hook for barcode scanner integration
 * 
 * Features:
 * - Global keyboard event listener
 * - Pattern-based barcode detection
 * - Configurable timeout for distinguishing scanner vs manual typing
 * - Enable/disable toggle from store
 * - Prevents scanning when input fields are focused
 * 
 * How it works:
 * - Barcode scanners typically send keystrokes very quickly (< 50ms between chars)
 * - Manual typing is slower (> 100ms between chars)
 * - Scanner sends Enter key at the end
 * - Buffer is cleared after timeout or Enter key
 * 
 * @example
 * ```tsx
 * useBarcodeScanner({
 *   onScan: (barcode) => {
 *     console.log('Scanned:', barcode)
 *     addProductByBarcode(barcode)
 *   },
 *   minLength: 5,
 *   timeout: 100
 * })
 * ```
 */
export function useBarcodeScanner({
  onScan,
  minLength = 3,
  timeout = 100,
  preventOnInputFocus = true
}: BarcodeScannerConfig) {
  const { barcodeScannerEnabled } = usePOSStore()
  const barcodeBufferRef = useRef<string>('')
  const timestampRef = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Only attach listener if scanner is enabled
    if (!barcodeScannerEnabled) {
      return
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scanning when input/textarea/select is focused
      if (preventOnInputFocus) {
        const target = e.target as HTMLElement
        const tagName = target.tagName.toLowerCase()
        const isContentEditable = target.isContentEditable
        
        if (
          tagName === 'input' ||
          tagName === 'textarea' ||
          tagName === 'select' ||
          isContentEditable
        ) {
          return
        }
      }

      const currentTime = Date.now()
      const timeDiff = currentTime - timestampRef.current

      // Enter key - process barcode
      if (e.key === 'Enter') {
        e.preventDefault()
        
        if (barcodeBufferRef.current.length >= minLength) {
          onScan(barcodeBufferRef.current.trim())
        }
        
        // Clear buffer
        barcodeBufferRef.current = ''
        timestampRef.current = 0
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        
        return
      }

      // Single character key
      if (e.key.length === 1) {
        // If time between keystrokes is too long, reset buffer (manual typing)
        if (timeDiff > timeout && barcodeBufferRef.current.length > 0) {
          barcodeBufferRef.current = ''
        }

        // Add character to buffer
        barcodeBufferRef.current += e.key
        timestampRef.current = currentTime

        // Clear buffer after timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        
        timeoutRef.current = setTimeout(() => {
          barcodeBufferRef.current = ''
          timestampRef.current = 0
        }, timeout)
      }
    }

    // Attach global listener
    window.addEventListener('keydown', handleKeyDown)

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [barcodeScannerEnabled, onScan, minLength, timeout, preventOnInputFocus])

  return {
    isEnabled: barcodeScannerEnabled
  }
}
