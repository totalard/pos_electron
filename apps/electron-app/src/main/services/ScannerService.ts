/**
 * Barcode Scanner Service
 * Handles barcode scanner detection, connection, and scan data processing
 * Supports USB HID scanners
 */

import { EventEmitter } from 'events'
import HID from 'node-hid'
import { DeviceInfo, DeviceType, ConnectionType, DeviceStatus, ScannerData, KNOWN_SCANNER_IDS } from './types'

export interface ScannerConfig {
  connection: 'USB' | 'Serial' | 'Bluetooth'
  vendorId?: number
  productId?: number
  path?: string
  prefix?: string
  suffix?: string
}

export class ScannerService extends EventEmitter {
  private connectedScanners: Map<string, DeviceInfo> = new Map()
  private activeScanner: DeviceInfo | null = null
  private hidDevice: HID.HID | null = null
  private scanBuffer: string = ''
  private lastScanTime: number = 0
  private scanTimeout: NodeJS.Timeout | null = null

  constructor() {
    super()
  }

  /**
   * Scan for available barcode scanners
   */
  scanScanners(): DeviceInfo[] {
    const devices = HID.devices()
    const scanners: DeviceInfo[] = []

    devices.forEach((device) => {
      // Check if it's a known scanner or HID keyboard device (most scanners emulate keyboards)
      const isKnownScanner = KNOWN_SCANNER_IDS.some((s) => s.vendorId === device.vendorId)
      const isHIDKeyboard = device.usagePage === 0x01 && device.usage === 0x06 // Generic Desktop, Keyboard

      if (isKnownScanner || (isHIDKeyboard && this.isPotentialScanner(device))) {
        const knownManufacturer = KNOWN_SCANNER_IDS.find((s) => s.vendorId === device.vendorId)
        
        const scannerInfo: DeviceInfo = {
          id: `scanner-${device.vendorId}-${device.productId}-${device.path}`,
          name: device.product || `${knownManufacturer?.name || 'USB'} Barcode Scanner`,
          type: DeviceType.SCANNER,
          connection: ConnectionType.HID,
          status: DeviceStatus.READY,
          vendorId: device.vendorId,
          productId: device.productId,
          manufacturer: device.manufacturer || knownManufacturer?.name || 'Unknown',
          serialNumber: device.serialNumber,
          path: device.path
        }

        scanners.push(scannerInfo)
        this.connectedScanners.set(scannerInfo.id, scannerInfo)
      }
    })

    this.emit('scanners-detected', scanners)
    return scanners
  }

  /**
   * Check if device is potentially a scanner
   */
  private isPotentialScanner(device: HID.Device): boolean {
    const product = (device.product || '').toLowerCase()
    const manufacturer = (device.manufacturer || '').toLowerCase()

    return (
      product.includes('scanner') ||
      product.includes('barcode') ||
      product.includes('reader') ||
      manufacturer.includes('scanner') ||
      manufacturer.includes('barcode')
    )
  }

  /**
   * Connect to a scanner
   */
  connect(config: ScannerConfig): boolean {
    try {
      if (config.connection === 'USB' || config.connection === 'Serial') {
        return this.connectHID(config)
      }
      return false
    } catch (error) {
      console.error('Error connecting to scanner:', error)
      this.emit('scanner-error', { error: String(error) })
      return false
    }
  }

  /**
   * Connect to HID scanner
   */
  private connectHID(config: ScannerConfig): boolean {
    if (!config.path && (!config.vendorId || !config.productId)) {
      throw new Error('Path or Vendor/Product ID required for HID connection')
    }

    try {
      // Find device
      let device: HID.Device | undefined

      if (config.path) {
        const devices = HID.devices()
        device = devices.find((d) => d.path === config.path)
      } else {
        const devices = HID.devices()
        device = devices.find(
          (d) => d.vendorId === config.vendorId && d.productId === config.productId
        )
      }

      if (!device) {
        throw new Error('Scanner device not found')
      }

      // Open HID device
      this.hidDevice = new HID.HID(device.path!)

      // Set up data listener
      this.hidDevice.on('data', (data: Buffer) => {
        this.handleScanData(data, config)
      })

      this.hidDevice.on('error', (error: Error) => {
        console.error('HID device error:', error)
        this.emit('scanner-error', { error: String(error) })
      })

      const scannerInfo: DeviceInfo = {
        id: `scanner-${device.vendorId}-${device.productId}`,
        name: device.product || 'USB Barcode Scanner',
        type: DeviceType.SCANNER,
        connection: ConnectionType.HID,
        status: DeviceStatus.CONNECTED,
        vendorId: device.vendorId,
        productId: device.productId,
        manufacturer: device.manufacturer || 'Unknown',
        path: device.path
      }

      this.activeScanner = scannerInfo
      this.emit('scanner-connected', scannerInfo)
      console.log('Scanner connected:', scannerInfo.name)
      return true
    } catch (error) {
      console.error('Error opening HID device:', error)
      throw error
    }
  }

  /**
   * Handle scan data from HID device
   */
  private handleScanData(data: Buffer, config: ScannerConfig): void {
    const now = Date.now()

    // Clear buffer if too much time has passed (new scan)
    if (now - this.lastScanTime > 100) {
      this.scanBuffer = ''
    }

    this.lastScanTime = now

    // Parse HID keyboard data
    // Most scanners send data as keyboard HID reports
    // Byte 0: Modifier keys
    // Byte 1: Reserved
    // Bytes 2-7: Key codes

    const keyCode = data[2]
    if (keyCode === 0) return // No key pressed

    const char = this.hidKeyCodeToChar(keyCode, data[0])
    
    if (char === '\n' || char === '\r') {
      // End of scan
      if (this.scanBuffer.length > 0) {
        this.processScan(this.scanBuffer, config)
        this.scanBuffer = ''
      }
    } else if (char) {
      this.scanBuffer += char
    }

    // Set timeout to process scan if no more data comes
    if (this.scanTimeout) {
      clearTimeout(this.scanTimeout)
    }

    this.scanTimeout = setTimeout(() => {
      if (this.scanBuffer.length > 0) {
        this.processScan(this.scanBuffer, config)
        this.scanBuffer = ''
      }
    }, 200)
  }

  /**
   * Convert HID key code to character
   */
  private hidKeyCodeToChar(keyCode: number, modifier: number): string | null {
    const shift = (modifier & 0x22) !== 0 // Left or Right Shift

    // HID keyboard key codes
    const keyMap: { [key: number]: [string, string] } = {
      0x04: ['a', 'A'], 0x05: ['b', 'B'], 0x06: ['c', 'C'], 0x07: ['d', 'D'],
      0x08: ['e', 'E'], 0x09: ['f', 'F'], 0x0a: ['g', 'G'], 0x0b: ['h', 'H'],
      0x0c: ['i', 'I'], 0x0d: ['j', 'J'], 0x0e: ['k', 'K'], 0x0f: ['l', 'L'],
      0x10: ['m', 'M'], 0x11: ['n', 'N'], 0x12: ['o', 'O'], 0x13: ['p', 'P'],
      0x14: ['q', 'Q'], 0x15: ['r', 'R'], 0x16: ['s', 'S'], 0x17: ['t', 'T'],
      0x18: ['u', 'U'], 0x19: ['v', 'V'], 0x1a: ['w', 'W'], 0x1b: ['x', 'X'],
      0x1c: ['y', 'Y'], 0x1d: ['z', 'Z'],
      0x1e: ['1', '!'], 0x1f: ['2', '@'], 0x20: ['3', '#'], 0x21: ['4', '$'],
      0x22: ['5', '%'], 0x23: ['6', '^'], 0x24: ['7', '&'], 0x25: ['8', '*'],
      0x26: ['9', '('], 0x27: ['0', ')'],
      0x28: ['\n', '\n'], // Enter
      0x2c: [' ', ' '], // Space
      0x2d: ['-', '_'], 0x2e: ['=', '+'], 0x2f: ['[', '{'], 0x30: [']', '}'],
      0x31: ['\\', '|'], 0x33: [';', ':'], 0x34: ["'", '"'], 0x35: ['`', '~'],
      0x36: [',', '<'], 0x37: ['.', '>'], 0x38: ['/', '?']
    }

    const mapping = keyMap[keyCode]
    if (mapping) {
      return shift ? mapping[1] : mapping[0]
    }

    return null
  }

  /**
   * Process scanned barcode
   */
  private processScan(barcode: string, config: ScannerConfig): void {
    // Remove prefix and suffix if configured
    let processedBarcode = barcode.trim()

    if (config.prefix && processedBarcode.startsWith(config.prefix)) {
      processedBarcode = processedBarcode.substring(config.prefix.length)
    }

    if (config.suffix && processedBarcode.endsWith(config.suffix)) {
      processedBarcode = processedBarcode.substring(0, processedBarcode.length - config.suffix.length)
    }

    const scanData: ScannerData = {
      barcode: processedBarcode,
      type: this.detectBarcodeType(processedBarcode),
      timestamp: Date.now()
    }

    this.emit('scan-data', scanData)
    console.log('Barcode scanned:', scanData.barcode, 'Type:', scanData.type)
  }

  /**
   * Detect barcode type based on pattern
   */
  private detectBarcodeType(barcode: string): string {
    if (/^\d{13}$/.test(barcode)) return 'EAN-13'
    if (/^\d{12}$/.test(barcode)) return 'UPC-A'
    if (/^\d{8}$/.test(barcode)) return 'EAN-8'
    if (/^[0-9A-Z\-. $/+%]+$/.test(barcode)) return 'CODE-39'
    if (/^\d+$/.test(barcode)) return 'CODE-128'
    return 'UNKNOWN'
  }

  /**
   * Disconnect from scanner
   */
  disconnect(): void {
    if (this.scanTimeout) {
      clearTimeout(this.scanTimeout)
      this.scanTimeout = null
    }

    if (this.hidDevice) {
      try {
        this.hidDevice.close()
      } catch (error) {
        console.error('Error closing HID device:', error)
      }
      this.hidDevice = null
    }

    if (this.activeScanner) {
      this.emit('scanner-disconnected', this.activeScanner)
      this.activeScanner = null
    }

    this.scanBuffer = ''
    console.log('Scanner disconnected')
  }

  /**
   * Get connected scanners
   */
  getConnectedScanners(): DeviceInfo[] {
    return Array.from(this.connectedScanners.values())
  }

  /**
   * Get active scanner
   */
  getActiveScanner(): DeviceInfo | null {
    return this.activeScanner
  }

  /**
   * Test scanner
   */
  testScanner(): boolean {
    if (!this.activeScanner) {
      return false
    }

    console.log('Scanner is ready. Please scan a barcode to test.')
    return true
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.disconnect()
    this.connectedScanners.clear()
    this.removeAllListeners()
  }
}

// Singleton instance
let instance: ScannerService | null = null

export function getScannerService(): ScannerService {
  if (!instance) {
    instance = new ScannerService()
  }
  return instance
}
