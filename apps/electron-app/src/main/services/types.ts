/**
 * Hardware Service Types
 * Shared type definitions for hardware services
 */

export interface DeviceInfo {
  id: string
  name: string
  type: DeviceType
  connection: ConnectionType
  status: DeviceStatus
  vendorId?: number
  productId?: number
  manufacturer?: string
  serialNumber?: string
  path?: string
  address?: string
  port?: string
  useEscPos?: boolean // ESC/POS mode for printers (true = ESC/POS, false = standard)
}

export enum DeviceType {
  PRINTER = 'printer',
  SCANNER = 'scanner',
  CASH_DRAWER = 'cash_drawer',
  SCALE = 'scale',
  PAYMENT_TERMINAL = 'payment_terminal',
  CUSTOMER_DISPLAY = 'customer_display',
  UNKNOWN = 'unknown'
}

export enum ConnectionType {
  USB = 'USB',
  NETWORK = 'Network',
  SERIAL = 'Serial',
  BLUETOOTH = 'Bluetooth',
  HID = 'HID'
}

export enum DeviceStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  BUSY = 'busy',
  READY = 'ready'
}

export interface PrinterStatus {
  online: boolean
  paperStatus: 'ok' | 'low' | 'out' | 'unknown'
  error?: string
}

export interface ScannerData {
  barcode: string
  type: string
  timestamp: number
}

export interface HardwareEvent {
  type: 'device-connected' | 'device-disconnected' | 'device-error' | 'scan-data'
  device?: DeviceInfo
  data?: any
  error?: string
}

// Known POS printer vendor/product IDs
export const KNOWN_PRINTER_IDS = [
  { vendorId: 0x04b8, name: 'Epson' }, // Epson
  { vendorId: 0x0519, name: 'Star Micronics' }, // Star Micronics
  { vendorId: 0x0fe6, name: 'ICS Advent' }, // ICS Advent
  { vendorId: 0x154f, name: 'Wincor Nixdorf' }, // Wincor Nixdorf
  { vendorId: 0x0483, name: 'STMicroelectronics' }, // Generic POS
  { vendorId: 0x1504, name: 'Bixolon' }, // Bixolon
  { vendorId: 0x0dd4, name: 'Custom Engineering' }, // Custom
]

// Known barcode scanner vendor/product IDs
export const KNOWN_SCANNER_IDS = [
  { vendorId: 0x05e0, name: 'Symbol Technologies' }, // Symbol/Zebra
  { vendorId: 0x0c2e, name: 'Honeywell' }, // Honeywell
  { vendorId: 0x1eab, name: 'Datalogic' }, // Datalogic
  { vendorId: 0x0536, name: 'Hand Held Products' }, // HHP
  { vendorId: 0x1a86, name: 'QinHeng Electronics' }, // Generic USB-Serial
]
