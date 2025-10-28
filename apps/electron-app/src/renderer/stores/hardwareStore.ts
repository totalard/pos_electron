/**
 * Hardware Store
 * Manages hardware device state and provides hooks for hardware operations
 */

import { create } from 'zustand'
import type { DeviceInfo, PrinterConfig, HardwareEvent } from '../../preload/preload'

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
  
  // Active devices
  activePrinter: DeviceInfo | null
  
  // Status
  isInitialized: boolean
  isScanning: boolean
  printerStatus: {
    online: boolean
    paperStatus: 'ok' | 'low' | 'out' | 'unknown'
    error?: string
  } | null
  
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
  testPrinter: (printerId?: string, useEscPos?: boolean) => Promise<boolean>
  updatePrinterStatus: () => Promise<void>
  
  // Event handling
  handleHardwareEvent: (event: HardwareEvent) => void
  
  // Utility
  addLog: (type: 'info' | 'success' | 'warning' | 'error', message: string) => void
  clearLogs: () => void
  setDeviceType: (deviceId: string, deviceType: string) => Promise<boolean>
  setEscPosMode: (deviceId: string, useEscPos: boolean) => Promise<boolean>
}

export const useHardwareStore = create<HardwareState>((set, get) => ({
  // Initial state
  devices: [],
  printers: [],
  activePrinter: null,
  isInitialized: false,
  isScanning: false,
  printerStatus: null,
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
          printers: result.data.printers || []
        })
        get().addLog('info', `Found ${result.data.usb?.length || 0} USB devices, ${result.data.printers?.length || 0} printers`)
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
  testPrinter: async (printerId?: string, useEscPos?: boolean) => {
    try {
      const api = getElectronAPI()
      if (!api) return false
      
      const mode = useEscPos ? 'ESC/POS' : 'Standard'
      get().addLog('info', `Initiating test print (${mode} mode)...`)
      
      if (printerId) {
        get().addLog('info', `Connecting to selected printer...`)
      }
      
      const result = await api.printer.test(printerId, useEscPos)
      if (result.success) {
        get().addLog('success', `✓ Test print sent successfully (${mode} mode)`)
        // Refresh printer status after test
        get().updatePrinterStatus()
        return true
      } else {
        get().addLog('error', `✗ Test print failed: ${result.error}`)
        return false
      }
    } catch (error) {
      get().addLog('error', `✗ Test print error: ${String(error)}`)
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
        }
        break
      
      case 'device-error':
        get().addLog('error', `Device error: ${event.error || 'Unknown error'}`)
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
  },

  // Set device type manually
  setDeviceType: async (deviceId: string, deviceType: string) => {
    try {
      const api = getElectronAPI()
      if (!api) return false

      const result = await api.hardware.setDeviceType(deviceId, deviceType)
      if (result.success) {
        get().addLog('success', `Device type set to ${deviceType}`)
        // Refresh device lists
        await get().scanDevices()
        return true
      } else {
        get().addLog('error', `Failed to set device type: ${result.error}`)
        return false
      }
    } catch (error) {
      get().addLog('error', `Set device type error: ${String(error)}`)
      return false
    }
  },

  // Set ESC/POS mode for a device
  setEscPosMode: async (deviceId: string, useEscPos: boolean) => {
    try {
      const api = getElectronAPI()
      if (!api) return false

      const result = await api.hardware.setEscPosMode(deviceId, useEscPos)
      if (result.success) {
        const mode = useEscPos ? 'ESC/POS' : 'Standard'
        get().addLog('success', `Printer mode set to ${mode}`)
        // Refresh device lists
        await get().scanDevices()
        return true
      } else {
        get().addLog('error', `Failed to set printer mode: ${result.error}`)
        return false
      }
    } catch (error) {
      get().addLog('error', `Set printer mode error: ${String(error)}`)
      return false
    }
  }
}))
