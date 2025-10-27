/**
 * Hardware Manager
 * Coordinates all hardware services and provides unified interface
 */

import { EventEmitter } from 'events'
import { getUSBDeviceService, USBDeviceService } from './USBDeviceService'
import { getPrinterService, PrinterService, PrinterConfig } from './PrinterService'
import { getScannerService, ScannerService, ScannerConfig } from './ScannerService'
import { DeviceInfo, DeviceType, HardwareEvent } from './types'

export class HardwareManager extends EventEmitter {
  private usbService: USBDeviceService
  private printerService: PrinterService
  private scannerService: ScannerService
  private isInitialized = false

  constructor() {
    super()
    this.usbService = getUSBDeviceService()
    this.printerService = getPrinterService()
    this.scannerService = getScannerService()
  }

  /**
   * Initialize hardware manager
   */
  initialize(): void {
    if (this.isInitialized) {
      return
    }

    // Start USB device monitoring
    this.usbService.startMonitoring()

    // Set up event forwarding
    this.setupEventForwarding()

    this.isInitialized = true
    console.log('Hardware Manager initialized')
  }

  /**
   * Set up event forwarding from services
   */
  private setupEventForwarding(): void {
    // USB Device events
    this.usbService.on('device-connected', (device: DeviceInfo) => {
      this.emit('hardware-event', {
        type: 'device-connected',
        device
      } as HardwareEvent)
    })

    this.usbService.on('device-disconnected', (device: DeviceInfo) => {
      this.emit('hardware-event', {
        type: 'device-disconnected',
        device
      } as HardwareEvent)
    })

    // Printer events
    this.printerService.on('printer-connected', (device: DeviceInfo) => {
      this.emit('hardware-event', {
        type: 'device-connected',
        device
      } as HardwareEvent)
    })

    this.printerService.on('printer-disconnected', (device: DeviceInfo) => {
      this.emit('hardware-event', {
        type: 'device-disconnected',
        device
      } as HardwareEvent)
    })

    this.printerService.on('printer-error', (data: any) => {
      this.emit('hardware-event', {
        type: 'device-error',
        data
      } as HardwareEvent)
    })

    // Scanner events
    this.scannerService.on('scanner-connected', (device: DeviceInfo) => {
      this.emit('hardware-event', {
        type: 'device-connected',
        device
      } as HardwareEvent)
    })

    this.scannerService.on('scanner-disconnected', (device: DeviceInfo) => {
      this.emit('hardware-event', {
        type: 'device-disconnected',
        device
      } as HardwareEvent)
    })

    this.scannerService.on('scan-data', (data: any) => {
      this.emit('hardware-event', {
        type: 'scan-data',
        data
      } as HardwareEvent)
    })

    this.scannerService.on('scanner-error', (data: any) => {
      this.emit('hardware-event', {
        type: 'device-error',
        data
      } as HardwareEvent)
    })
  }

  /**
   * Scan for all devices
   */
  async scanAllDevices(): Promise<{
    usb: DeviceInfo[]
    printers: DeviceInfo[]
    scanners: DeviceInfo[]
  }> {
    const usbDevices = this.usbService.scanDevices()
    const printers = await this.printerService.scanPrinters()
    const scanners = this.scannerService.scanScanners()

    return {
      usb: usbDevices,
      printers,
      scanners
    }
  }

  /**
   * Get all devices
   */
  getAllDevices(): DeviceInfo[] {
    return this.usbService.getDevices()
  }

  /**
   * Get devices by type
   */
  getDevicesByType(type: DeviceType): DeviceInfo[] {
    return this.usbService.getDevicesByType(type)
  }

  /**
   * Connect to printer
   */
  async connectPrinter(config: PrinterConfig): Promise<boolean> {
    return await this.printerService.connect(config)
  }

  /**
   * Disconnect printer
   */
  disconnectPrinter(): void {
    this.printerService.disconnect()
  }

  /**
   * Print data
   */
  async print(data: Buffer | string): Promise<boolean> {
    return await this.printerService.print(data)
  }

  /**
   * Test printer
   */
  async testPrinter(): Promise<boolean> {
    return await this.printerService.testPrint()
  }

  /**
   * Get printer status
   */
  async getPrinterStatus() {
    return await this.printerService.getStatus()
  }

  /**
   * Get active printer
   */
  getActivePrinter(): DeviceInfo | null {
    return this.printerService.getActivePrinter()
  }

  /**
   * Connect to scanner
   */
  connectScanner(config: ScannerConfig): boolean {
    return this.scannerService.connect(config)
  }

  /**
   * Disconnect scanner
   */
  disconnectScanner(): void {
    this.scannerService.disconnect()
  }

  /**
   * Test scanner
   */
  testScanner(): boolean {
    return this.scannerService.testScanner()
  }

  /**
   * Get active scanner
   */
  getActiveScanner(): DeviceInfo | null {
    return this.scannerService.getActiveScanner()
  }

  /**
   * Get all printers
   */
  getPrinters(): DeviceInfo[] {
    return this.printerService.getConnectedPrinters()
  }

  /**
   * Get all scanners
   */
  getScanners(): DeviceInfo[] {
    return this.scannerService.getConnectedScanners()
  }

  /**
   * Shutdown hardware manager
   */
  shutdown(): void {
    this.usbService.destroy()
    this.printerService.destroy()
    this.scannerService.destroy()
    this.removeAllListeners()
    this.isInitialized = false
    console.log('Hardware Manager shut down')
  }
}

// Singleton instance
let instance: HardwareManager | null = null

export function getHardwareManager(): HardwareManager {
  if (!instance) {
    instance = new HardwareManager()
  }
  return instance
}
