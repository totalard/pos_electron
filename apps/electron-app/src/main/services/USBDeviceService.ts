/**
 * USB Device Detection and Monitoring Service
 * Handles real-time USB device detection, identification, and monitoring
 */

import { EventEmitter } from 'events'
import usb from 'usb'
import { DeviceInfo, DeviceType, ConnectionType, DeviceStatus, KNOWN_PRINTER_IDS, KNOWN_SCANNER_IDS } from './types'

export class USBDeviceService extends EventEmitter {
  private devices: Map<string, DeviceInfo> = new Map()
  private isMonitoring = false
  private attachHandler: ((device: usb.Device) => void) | null = null
  private detachHandler: ((device: usb.Device) => void) | null = null
  private manualDeviceTypes: Map<string, DeviceType> = new Map() // Store manually assigned device types

  constructor() {
    super()
  }

  /**
   * Start monitoring USB devices
   */
  startMonitoring(): void {
    if (this.isMonitoring) {
      return
    }

    this.isMonitoring = true

    // Initial scan
    this.scanDevices()

    // Try to set up hotplug monitoring if available
    try {
      // Check if usb.on is available (some environments don't support it)
      if (typeof (usb as any).on === 'function') {
        // Create handlers
        this.attachHandler = (device: usb.Device) => {
          console.log('USB device attached:', device)
          this.handleDeviceAttach(device)
        }

        this.detachHandler = (device: usb.Device) => {
          console.log('USB device detached:', device)
          this.handleDeviceDetach(device)
        }

        // Listen for device attach/detach events
        (usb as any).on('attach', this.attachHandler);
        (usb as any).on('detach', this.detachHandler)
        
        console.log('USB hotplug monitoring enabled')
      } else {
        console.log('USB hotplug monitoring not available - using manual scanning only')
      }
    } catch (error) {
      console.warn('Could not enable USB hotplug monitoring:', error)
      console.log('USB device monitoring will use manual scanning only')
    }

    console.log('USB device monitoring started')
  }

  /**
   * Stop monitoring USB devices
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) {
      return
    }

    this.isMonitoring = false
    
    // Remove event listeners if they were set up
    try {
      if (this.attachHandler && typeof (usb as any).removeListener === 'function') {
        (usb as any).removeListener('attach', this.attachHandler)
        this.attachHandler = null
      }
      
      if (this.detachHandler && typeof (usb as any).removeListener === 'function') {
        (usb as any).removeListener('detach', this.detachHandler)
        this.detachHandler = null
      }
    } catch (error) {
      console.warn('Error removing USB event listeners:', error)
    }
    
    console.log('USB device monitoring stopped')
  }

  /**
   * Scan for currently connected USB devices
   */
  scanDevices(): DeviceInfo[] {
    const devices = usb.getDeviceList()
    const detectedDevices: DeviceInfo[] = []

    devices.forEach((device) => {
      const deviceInfo = this.createDeviceInfo(device)
      if (deviceInfo) {
        this.devices.set(deviceInfo.id, deviceInfo)
        detectedDevices.push(deviceInfo)
      }
    })

    return detectedDevices
  }

  /**
   * Get all detected devices
   */
  getDevices(): DeviceInfo[] {
    return Array.from(this.devices.values())
  }

  /**
   * Get devices by type
   */
  getDevicesByType(type: DeviceType): DeviceInfo[] {
    return Array.from(this.devices.values()).filter((device) => device.type === type)
  }

  /**
   * Get device by ID
   */
  getDevice(id: string): DeviceInfo | undefined {
    return this.devices.get(id)
  }

  /**
   * Manually set device type (for unknown devices)
   */
  setDeviceType(deviceId: string, deviceType: DeviceType): boolean {
    const device = this.devices.get(deviceId)
    if (!device) {
      return false
    }

    // Store the manual assignment
    this.manualDeviceTypes.set(deviceId, deviceType)

    // Update the device info
    device.type = deviceType
    this.devices.set(deviceId, device)

    // Emit event
    this.emit('device-type-changed', device)
    console.log(`Device ${device.name} manually set to type: ${deviceType}`)

    return true
  }

  /**
   * Get manually assigned device type
   */
  getManualDeviceType(deviceId: string): DeviceType | undefined {
    return this.manualDeviceTypes.get(deviceId)
  }

  /**
   * Clear manual device type assignment
   */
  clearManualDeviceType(deviceId: string): void {
    this.manualDeviceTypes.delete(deviceId)
    
    // Re-scan to get automatic type
    const devices = usb.getDeviceList()
    devices.forEach((usbDevice) => {
      const id = this.getDeviceId(usbDevice)
      if (id === deviceId) {
        const deviceInfo = this.createDeviceInfo(usbDevice)
        if (deviceInfo) {
          this.devices.set(deviceId, deviceInfo)
        }
      }
    })
  }

  /**
   * Handle device attach event
   */
  private handleDeviceAttach(device: usb.Device): void {
    const deviceInfo = this.createDeviceInfo(device)
    if (deviceInfo) {
      this.devices.set(deviceInfo.id, deviceInfo)
      this.emit('device-connected', deviceInfo)
      console.log('Device connected:', deviceInfo.name, deviceInfo.type)
    }
  }

  /**
   * Handle device detach event
   */
  private handleDeviceDetach(device: usb.Device): void {
    const deviceId = this.getDeviceId(device)
    const deviceInfo = this.devices.get(deviceId)
    
    if (deviceInfo) {
      this.devices.delete(deviceId)
      this.emit('device-disconnected', deviceInfo)
      console.log('Device disconnected:', deviceInfo.name, deviceInfo.type)
    }
  }

  /**
   * Create device info from USB device
   */
  private createDeviceInfo(device: usb.Device): DeviceInfo | null {
    try {
      const descriptor = device.deviceDescriptor
      const vendorId = descriptor.idVendor
      const productId = descriptor.idProduct

      // Try to open device to get more info
      let manufacturer = 'Unknown'
      let product = 'Unknown Device'
      let serialNumber = ''

      try {
        device.open()
        
        if (descriptor.iManufacturer) {
          manufacturer = device.getStringDescriptor(descriptor.iManufacturer) || manufacturer
        }
        
        if (descriptor.iProduct) {
          product = device.getStringDescriptor(descriptor.iProduct) || product
        }
        
        if (descriptor.iSerialNumber) {
          serialNumber = device.getStringDescriptor(descriptor.iSerialNumber) || ''
        }
        
        device.close()
      } catch (error) {
        // Device might be in use or require permissions
        console.warn('Could not open device for details:', error)
      }

      const deviceId = this.getDeviceId(device)
      
      // Check if device has a manually assigned type
      const manualType = this.manualDeviceTypes.get(deviceId)
      const deviceType = manualType || this.identifyDeviceType(vendorId, productId, product)
      
      // Get known manufacturer name
      const knownManufacturer = this.getKnownManufacturer(vendorId)
      if (knownManufacturer) {
        manufacturer = knownManufacturer
      }

      const deviceInfo: DeviceInfo = {
        id: deviceId,
        name: `${manufacturer} ${product}`,
        type: deviceType,
        connection: ConnectionType.USB,
        status: DeviceStatus.CONNECTED,
        vendorId,
        productId,
        manufacturer,
        serialNumber,
        path: `USB:${vendorId.toString(16)}:${productId.toString(16)}`
      }

      return deviceInfo
    } catch (error) {
      console.error('Error creating device info:', error)
      return null
    }
  }

  /**
   * Get unique device ID
   */
  private getDeviceId(device: usb.Device): string {
    const descriptor = device.deviceDescriptor
    return `usb-${descriptor.idVendor}-${descriptor.idProduct}-${device.busNumber}-${device.deviceAddress}`
  }

  /**
   * Identify device type based on vendor/product ID and name
   */
  private identifyDeviceType(vendorId: number, _productId: number, productName: string): DeviceType {
    // Check if it's a known printer
    const isPrinter = KNOWN_PRINTER_IDS.some((p) => p.vendorId === vendorId)
    if (isPrinter) {
      return DeviceType.PRINTER
    }

    // Check if it's a known scanner
    const isScanner = KNOWN_SCANNER_IDS.some((s) => s.vendorId === vendorId)
    if (isScanner) {
      return DeviceType.SCANNER
    }

    // Check product name for hints
    const nameLower = productName.toLowerCase()
    if (nameLower.includes('printer') || nameLower.includes('receipt')) {
      return DeviceType.PRINTER
    }
    if (nameLower.includes('scanner') || nameLower.includes('barcode')) {
      return DeviceType.SCANNER
    }
    if (nameLower.includes('scale') || nameLower.includes('weight')) {
      return DeviceType.SCALE
    }
    if (nameLower.includes('drawer') || nameLower.includes('cash')) {
      return DeviceType.CASH_DRAWER
    }
    if (nameLower.includes('display')) {
      return DeviceType.CUSTOMER_DISPLAY
    }

    return DeviceType.UNKNOWN
  }

  /**
   * Get known manufacturer name
   */
  private getKnownManufacturer(vendorId: number): string | null {
    const printer = KNOWN_PRINTER_IDS.find((p) => p.vendorId === vendorId)
    if (printer) return printer.name

    const scanner = KNOWN_SCANNER_IDS.find((s) => s.vendorId === vendorId)
    if (scanner) return scanner.name

    return null
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stopMonitoring()
    this.devices.clear()
    this.removeAllListeners()
  }
}

// Singleton instance
let instance: USBDeviceService | null = null

export function getUSBDeviceService(): USBDeviceService {
  if (!instance) {
    instance = new USBDeviceService()
  }
  return instance
}
