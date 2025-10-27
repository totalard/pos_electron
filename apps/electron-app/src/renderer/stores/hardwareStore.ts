/**
 * Hardware Store
 * Manages hardware device state and provides hooks for hardware operations
 */

import { create } from 'zustand'
import type { DeviceInfo, PrinterConfig, ScannerConfig, HardwareEvent } from '../../preload/preload'

// Helper to safely access electronAPI
const getElectronAPI = () => {
  if (typeof window !== 'undefined' && window.electronAPI) {
    return window.electronAPI
  }
  return null
}

interface HardwareState {
  // Device lists
  devices: DeviceInfo[]
  printers: DeviceInfo[]
  scanners: DeviceInfo[]
  
  // Active devices
  activePrinter: DeviceInfo | null
  activeScanner: DeviceInfo | null
  
  // Status
  isInitialized: boolean
  isScanning: boolean
  printerStatus: {
    online: boolean
    paperStatus: 'ok' | 'low' | 'out' | 'unknown'
    error?: string
  } | null
  
  // Recent scans
  recentScans: Array<{
    barcode: string
    type: string
    timestamp: number
  }>
  
  // Logs
  logs: Array<{
    timestamp: number
    type: 'info' | 'success' | 'warning' | 'error'
    message: string
  }>
  
  // Actions
  initialize: () => Promise<void>
  scanDevices: () => Promise<void>
  getDevices: () => Promise<void>
  getDevicesByType: (type: string) => Promise<DeviceInfo[]>
  
  // Printer actions
  scanPrinters: () => Promise<void>
  connectPrinter: (config: PrinterConfig) => Promise<boolean>
  disconnectPrinter: () => Promise<void>
  printData: (data: string) => Promise<boolean>
  testPrinter: () => Promise<boolean>
  updatePrinterStatus: () => Promise<void>
  
  // Scanner actions
  scanScanners: () => Promise<void>
  connectScanner: (config: ScannerConfig) => Promise<boolean>
  disconnectScanner: () => Promise<void>
  testScanner: () => Promise<boolean>
  
  // Event handling
  handleHardwareEvent: (event: HardwareEvent) => void
  
  // Utility
  addLog: (type: 'info' | 'success' | 'warning' | 'error', message: string) => void
  clearLogs: () => void
}

export const useHardwareStore = create<HardwareState>((set, get) => ({
  // Initial state
  devices: [],
  printers: [],
  scanners: [],
  activePrinter: null,
  activeScanner: null,
  isInitialized: false,
  isScanning: false,
  printerStatus: null,
  recentScans: [],
  logs: [],

  // Initialize hardware system
  initialize: async () => {
    try {
      const api = getElectronAPI()
      if (!api) {
        get().addLog('warning', 'Electron API not available - hardware features disabled')
        return
      }

      const result = await api.hardware.initialize()
      if (result.success) {
        set({ isInitialized: true })
        get().addLog('success', 'Hardware system initialized')
        
        // Initial device scan
        await get().scanDevices()
        
        // Set up event listener
        api.hardware.onHardwareEvent((event) => {
          get().handleHardwareEvent(event)
        })
      } else {
        get().addLog('error', `Hardware initialization failed: ${result.error}`)
      }
    } catch (error) {
      get().addLog('error', `Hardware initialization error: ${String(error)}`)
    }
  },

  // Scan all devices
  scanDevices: async () => {
    set({ isScanning: true })
    try {
      const api = getElectronAPI()
      if (!api) return
      const result = await api.hardware.scanDevices()
      if (result.success && result.data) {
        set({
          devices: result.data.usb || [],
          printers: result.data.printers || [],
          scanners: result.data.scanners || []
        })
        get().addLog('info', `Found ${result.data.usb?.length || 0} USB devices, ${result.data.printers?.length || 0} printers, ${result.data.scanners?.length || 0} scanners`)
      }
    } catch (error) {
      get().addLog('error', `Device scan error: ${String(error)}`)
    } finally {
      set({ isScanning: false })
    }
  },

  // Get all devices
  getDevices: async () => {
    try {
      const api = getElectronAPI()
      if (!api) return
      const result = await api.hardware.getDevices()
      if (result.success && result.data) {
        set({ devices: result.data })
      }
    } catch (error) {
      get().addLog('error', `Get devices error: ${String(error)}`)
    }
  },

  // Get devices by type
  getDevicesByType: async (type: string) => {
    try {
      const api = getElectronAPI()
      if (!api) return []
      const result = await api.hardware.getDevicesByType(type)
      if (result.success && result.data) {
        return result.data
      }
      return []
    } catch (error) {
      get().addLog('error', `Get devices by type error: ${String(error)}`)
      return []
    }
  },

  // Scan printers
  scanPrinters: async () => {
    try {
      const api = getElectronAPI()
      if (!api) return
      const result = await api.printer.scan()
      if (result.success && result.data) {
        set({ printers: result.data })
        get().addLog('info', `Found ${result.data.length} printers`)
      }
    } catch (error) {
      get().addLog('error', `Printer scan error: ${String(error)}`)
    }
  },

  // Connect to printer
  connectPrinter: async (config: PrinterConfig) => {
    try {
      const api = getElectronAPI()
      if (!api) return false
      const result = await api.printer.connect(config)
      if (result.success) {
        const activeResult = await api.printer.getActive()
        if (activeResult.success && activeResult.data) {
          set({ activePrinter: activeResult.data })
          get().addLog('success', `Connected to printer: ${activeResult.data.name}`)
          await get().updatePrinterStatus()
        }
        return true
      } else {
        get().addLog('error', `Printer connection failed: ${result.error}`)
        return false
      }
    } catch (error) {
      get().addLog('error', `Printer connection error: ${String(error)}`)
      return false
    }
  },

  // Disconnect printer
  disconnectPrinter: async () => {
    try {
      const api = getElectronAPI()
      if (!api) return
      const result = await api.printer.disconnect()
      if (result.success) {
        set({ activePrinter: null, printerStatus: null })
        get().addLog('info', 'Printer disconnected')
      }
    } catch (error) {
      get().addLog('error', `Printer disconnect error: ${String(error)}`)
    }
  },

  // Print data
  printData: async (data: string) => {
    try {
      const api = getElectronAPI()
      if (!api) return false
      const result = await api.printer.print(data)
      if (result.success) {
        get().addLog('success', 'Print job sent')
        return true
      } else {
        get().addLog('error', `Print failed: ${result.error}`)
        return false
      }
    } catch (error) {
      get().addLog('error', `Print error: ${String(error)}`)
      return false
    }
  },

  // Test printer
  testPrinter: async () => {
    try {
      const api = getElectronAPI()
      if (!api) return false
      const result = await api.printer.test()
      if (result.success) {
        get().addLog('success', 'Test print sent')
        return true
      } else {
        get().addLog('error', `Test print failed: ${result.error}`)
        return false
      }
    } catch (error) {
      get().addLog('error', `Test print error: ${String(error)}`)
      return false
    }
  },

  // Update printer status
  updatePrinterStatus: async () => {
    try {
      const api = getElectronAPI()
      if (!api) return
      const result = await api.printer.getStatus()
      if (result.success && result.data) {
        set({ printerStatus: result.data })
      }
    } catch (error) {
      get().addLog('error', `Printer status error: ${String(error)}`)
    }
  },

  // Scan scanners
  scanScanners: async () => {
    try {
      const api = getElectronAPI()
      if (!api) return
      const result = await api.scanner.scan()
      if (result.success && result.data) {
        set({ scanners: result.data })
        get().addLog('info', `Found ${result.data.length} scanners`)
      }
    } catch (error) {
      get().addLog('error', `Scanner scan error: ${String(error)}`)
    }
  },

  // Connect to scanner
  connectScanner: async (config: ScannerConfig) => {
    try {
      const api = getElectronAPI()
      if (!api) return false
      const result = await api.scanner.connect(config)
      if (result.success) {
        const activeResult = await api.scanner.getActive()
        if (activeResult.success && activeResult.data) {
          set({ activeScanner: activeResult.data })
          get().addLog('success', `Connected to scanner: ${activeResult.data.name}`)
        }
        return true
      } else {
        get().addLog('error', `Scanner connection failed: ${result.error}`)
        return false
      }
    } catch (error) {
      get().addLog('error', `Scanner connection error: ${String(error)}`)
      return false
    }
  },

  // Disconnect scanner
  disconnectScanner: async () => {
    try {
      const api = getElectronAPI()
      if (!api) return
      const result = await api.scanner.disconnect()
      if (result.success) {
        set({ activeScanner: null })
        get().addLog('info', 'Scanner disconnected')
      }
    } catch (error) {
      get().addLog('error', `Scanner disconnect error: ${String(error)}`)
    }
  },

  // Test scanner
  testScanner: async () => {
    try {
      const api = getElectronAPI()
      if (!api) return false
      const result = await api.scanner.test()
      if (result.success) {
        get().addLog('success', 'Scanner is ready. Please scan a barcode.')
        return true
      } else {
        get().addLog('error', `Scanner test failed: ${result.error}`)
        return false
      }
    } catch (error) {
      get().addLog('error', `Scanner test error: ${String(error)}`)
      return false
    }
  },

  // Handle hardware events
  handleHardwareEvent: (event: HardwareEvent) => {
    switch (event.type) {
      case 'device-connected':
        if (event.device) {
          get().addLog('info', `Device connected: ${event.device.name}`)
          get().scanDevices()
        }
        break
      
      case 'device-disconnected':
        if (event.device) {
          get().addLog('warning', `Device disconnected: ${event.device.name}`)
          get().scanDevices()
          
          // Update active devices
          const state = get()
          if (state.activePrinter?.id === event.device.id) {
            set({ activePrinter: null, printerStatus: null })
          }
          if (state.activeScanner?.id === event.device.id) {
            set({ activeScanner: null })
          }
        }
        break
      
      case 'device-error':
        get().addLog('error', `Device error: ${event.error || 'Unknown error'}`)
        break
      
      case 'scan-data':
        if (event.data) {
          const scan = {
            barcode: event.data.barcode,
            type: event.data.type,
            timestamp: event.data.timestamp
          }
          set((state) => ({
            recentScans: [scan, ...state.recentScans].slice(0, 50) // Keep last 50 scans
          }))
          get().addLog('success', `Barcode scanned: ${event.data.barcode}`)
        }
        break
    }
  },

  // Add log entry
  addLog: (type, message) => {
    set((state) => ({
      logs: [
        {
          timestamp: Date.now(),
          type,
          message
        },
        ...state.logs
      ].slice(0, 100) // Keep last 100 logs
    }))
  },

  // Clear logs
  clearLogs: () => {
    set({ logs: [] })
  }
}))
