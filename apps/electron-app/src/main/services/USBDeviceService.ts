/**
 * USB Device Detection and Monitoring Service
 * Handles real-time USB device detection, identification, and monitoring
 */

import { EventEmitter } from 'events'
import usb from 'usb'
import { DeviceInfo, DeviceType, ConnectionType, DeviceStatus, KNOWN_PRINTER_IDS, KNOWN_SCANNER_IDS } from './types'
import { getDevicePersistenceService, DevicePersistenceService } from './DevicePersistenceService'

export class USBDeviceService extends EventEmitter {
  private devices: Map<string, DeviceInfo> = new Map()
  private isMonitoring = false
  private attachHandler: ((device: usb.Device) => void) | null = null
  private detachHandler: ((device: usb.Device) => void) | null = null
  private manualDeviceTypes: Map<string, DeviceType> = new Map() // Store manually assigned device types
  private persistenceService: DevicePersistenceService

  constructor() {
    super()
    this.persistenceService = getDevicePersistenceService()
    this.loadPersistedDeviceTypes()
  }

  /**
   * Load persisted device types from storage
   */
  private loadPersistedDeviceTypes(): void {
    const configs = this.persistenceService.getAllConfigs()
    configs.forEach(config => {
      this.manualDeviceTypes.set(config.deviceId, config.type)
    })
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
          this.handleDeviceAttach(device)
        }

        this.detachHandler = (device: usb.Device) => {
          this.handleDeviceDetach(device)
        }

        // Listen for device attach/detach events
        (usb as any).on('attach', this.attachHandler);
        (usb as any).on('detach', this.detachHandler)
      }
    } catch (error) {
      // USB hotplug monitoring not available - will use manual scanning only
    }
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
      // Ignore errors when removing listeners
    }
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

    // Persist the device type
    this.persistenceService.saveDeviceConfig(deviceId, deviceType, device.useEscPos)

    // Update the device info
    device.type = deviceType
    this.devices.set(deviceId, device)

    // Emit event
    this.emit('device-type-changed', device)

    return true
  }

  /**
   * Get manually assigned device type
   */
  getManualDeviceType(deviceId: string): DeviceType | undefined {
    return this.manualDeviceTypes.get(deviceId)
  }

  /**
   * Set ESC/POS mode for a device
   */
  setEscPosMode(deviceId: string, useEscPos: boolean): boolean {
    const device = this.devices.get(deviceId)
    if (!device) {
      return false
    }

    // Update device info
    device.useEscPos = useEscPos
    this.devices.set(deviceId, device)

    // Persist the setting
    this.persistenceService.saveDeviceConfig(deviceId, device.type, useEscPos)

    return true
  }

  /**
   * Clear manual device type assignment
   */
  clearManualDeviceType(deviceId: string): void {
    this.manualDeviceTypes.delete(deviceId)
    this.persistenceService.removeDeviceConfig(deviceId)

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

      // Use basic device info
      let manufacturer = 'Unknown'
      const product = 'Unknown Device'
      const serialNumber = ''

      const deviceId = this.getDeviceId(device)
      
      // Check if device has a manually assigned type
      const manualType = this.manualDeviceTypes.get(deviceId)
      const deviceType = manualType || this.identifyDeviceType(vendorId, productId, product)
      
      // Get known manufacturer name
      const knownManufacturer = this.getKnownManufacturer(vendorId)
      if (knownManufacturer) {
        manufacturer = knownManufacturer
      }

      // Load persisted ESC/POS mode setting
      const persistedEscPos = this.persistenceService.getEscPosMode(deviceId)

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
        path: `USB:${vendorId.toString(16)}:${productId.toString(16)}`,
        useEscPos: persistedEscPos !== undefined ? persistedEscPos : false
      }

      return deviceInfo
    } catch (error) {
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
