import { contextBridge, ipcRenderer } from 'electron'

// Hardware types
export interface DeviceInfo {
  id: string
  name: string
  type: string
  connection: string
  status: string
  vendorId?: number
  productId?: number
  manufacturer?: string
  serialNumber?: string
  path?: string
  address?: string
  port?: string
  useEscPos?: boolean
}

export interface PrinterConfig {
  connection: 'USB' | 'Network' | 'Serial'
  port?: string
  address?: string
  baudRate?: number
  vendorId?: number
  productId?: number
}

export interface ScannerConfig {
  connection: 'USB' | 'Serial' | 'Bluetooth'
  vendorId?: number
  productId?: number
  path?: string
  prefix?: string
  suffix?: string
}

export interface HardwareEvent {
  type: 'device-connected' | 'device-disconnected' | 'device-error' | 'scan-data'
  device?: DeviceInfo
  data?: any
  error?: string
}

// Define the API interface
export interface IElectronAPI {
  // Add your API methods here
  platform: NodeJS.Platform
  versions: {
    node: string
    chrome: string
    electron: string
  }
  // Network status API
  checkNetworkStatus: () => Promise<{ isOnline: boolean }>
  
  // Hardware APIs
  hardware: {
    initialize: () => Promise<{ success: boolean; error?: string }>
    scanDevices: () => Promise<{ success: boolean; data?: any; error?: string }>
    getDevices: () => Promise<{ success: boolean; data?: DeviceInfo[]; error?: string }>
    getDevicesByType: (type: string) => Promise<{ success: boolean; data?: DeviceInfo[]; error?: string }>
    setDeviceType: (deviceId: string, deviceType: string) => Promise<{ success: boolean; error?: string }>
    setEscPosMode: (deviceId: string, useEscPos: boolean) => Promise<{ success: boolean; error?: string }>
    onHardwareEvent: (callback: (event: HardwareEvent) => void) => () => void
  }

  printer: {
    scan: () => Promise<{ success: boolean; data?: DeviceInfo[]; error?: string }>
    connect: (config: PrinterConfig) => Promise<{ success: boolean; error?: string }>
    disconnect: () => Promise<{ success: boolean; error?: string }>
    print: (data: string) => Promise<{ success: boolean; error?: string }>
    test: (printerId?: string, useEscPos?: boolean) => Promise<{ success: boolean; error?: string }>
    getStatus: () => Promise<{ success: boolean; data?: any; error?: string }>
    getActive: () => Promise<{ success: boolean; data?: DeviceInfo | null; error?: string }>
  }
  
  scanner: {
    scan: () => Promise<{ success: boolean; data?: DeviceInfo[]; error?: string }>
    connect: (config: ScannerConfig) => Promise<{ success: boolean; error?: string }>
    disconnect: () => Promise<{ success: boolean; error?: string }>
    test: () => Promise<{ success: boolean; error?: string }>
    getActive: () => Promise<{ success: boolean; data?: DeviceInfo | null; error?: string }>
  }
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const electronAPI: IElectronAPI = {
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  },
  checkNetworkStatus: () => ipcRenderer.invoke('check-network-status'),
  
  // Hardware APIs
  hardware: {
    initialize: () => ipcRenderer.invoke('hardware:initialize'),
    scanDevices: () => ipcRenderer.invoke('hardware:scan-devices'),
    getDevices: () => ipcRenderer.invoke('hardware:get-devices'),
    getDevicesByType: (type: string) => ipcRenderer.invoke('hardware:get-devices-by-type', type),
    setDeviceType: (deviceId: string, deviceType: string) => ipcRenderer.invoke('hardware:set-device-type', deviceId, deviceType),
    setEscPosMode: (deviceId: string, useEscPos: boolean) => ipcRenderer.invoke('hardware:set-escpos-mode', deviceId, useEscPos),
    onHardwareEvent: (callback: (event: HardwareEvent) => void) => {
      const listener = (_event: any, data: HardwareEvent) => callback(data)
      ipcRenderer.on('hardware-event', listener)
      return () => ipcRenderer.removeListener('hardware-event', listener)
    }
  },

  // Printer APIs
  printer: {
    scan: () => ipcRenderer.invoke('printer:scan'),
    connect: (config: PrinterConfig) => ipcRenderer.invoke('printer:connect', config),
    disconnect: () => ipcRenderer.invoke('printer:disconnect'),
    print: (data: string) => ipcRenderer.invoke('printer:print', data),
    test: (printerId?: string, useEscPos?: boolean) => ipcRenderer.invoke('printer:test', printerId, useEscPos),
    getStatus: () => ipcRenderer.invoke('printer:status'),
    getActive: () => ipcRenderer.invoke('printer:get-active')
  },
  
  // Scanner APIs
  scanner: {
    scan: () => ipcRenderer.invoke('scanner:scan'),
    connect: (config: ScannerConfig) => ipcRenderer.invoke('scanner:connect', config),
    disconnect: () => ipcRenderer.invoke('scanner:disconnect'),
    test: () => ipcRenderer.invoke('scanner:test'),
    getActive: () => ipcRenderer.invoke('scanner:get-active')
  }
}

// Use contextBridge to safely expose the API
contextBridge.exposeInMainWorld('electronAPI', electronAPI)

// Log successful preload
console.log('[Preload] Electron API successfully exposed to renderer')

// Type augmentation for window object
declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}

