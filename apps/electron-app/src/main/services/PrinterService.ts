/**
 * Printer Service
 * Handles printer detection, connection, and printing operations
 * Supports ESC/POS printers via USB and Network
 */

import { EventEmitter } from 'events'
import { SerialPort } from 'serialport'
import usb from 'usb'
import { DeviceInfo, DeviceType, ConnectionType, DeviceStatus, PrinterStatus, KNOWN_PRINTER_IDS } from './types'

export interface PrinterConfig {
  connection: 'USB' | 'Network' | 'Serial'
  port?: string
  address?: string
  baudRate?: number
  vendorId?: number
  productId?: number
}

export interface PrintJob {
  id: string
  data: Buffer | string
  timestamp: number
  status: 'pending' | 'printing' | 'completed' | 'failed'
  error?: string
}

/**
 * ESC/POS Command Builder
 * Provides helper methods to build ESC/POS commands
 */
export class EscPosBuilder {
  private buffer: number[] = []

  /**
   * Initialize printer
   */
  init(): this {
    this.buffer.push(0x1b, 0x40)
    return this
  }

  /**
   * Set text alignment
   */
  align(alignment: 'left' | 'center' | 'right'): this {
    const alignCode = alignment === 'left' ? 0x00 : alignment === 'center' ? 0x01 : 0x02
    this.buffer.push(0x1b, 0x61, alignCode)
    return this
  }

  /**
   * Set text size
   */
  size(width: number, height: number): this {
    const size = ((width - 1) << 4) | (height - 1)
    this.buffer.push(0x1d, 0x21, size)
    return this
  }

  /**
   * Set text bold
   */
  bold(enabled: boolean): this {
    this.buffer.push(0x1b, 0x45, enabled ? 0x01 : 0x00)
    return this
  }

  /**
   * Set text underline
   */
  underline(mode: 0 | 1 | 2): this {
    this.buffer.push(0x1b, 0x2d, mode)
    return this
  }

  /**
   * Add text
   */
  text(text: string): this {
    const textBuffer = Buffer.from(text, 'utf-8')
    this.buffer.push(...textBuffer)
    return this
  }

  /**
   * Add line feed
   */
  feed(lines: number = 1): this {
    for (let i = 0; i < lines; i++) {
      this.buffer.push(0x0a)
    }
    return this
  }

  /**
   * Cut paper
   */
  cut(mode: 'full' | 'partial' = 'full'): this {
    this.buffer.push(0x1d, 0x56, mode === 'full' ? 0x00 : 0x01)
    return this
  }

  /**
   * Open cash drawer
   */
  openDrawer(): this {
    this.buffer.push(0x1b, 0x70, 0x00, 0x19, 0xfa)
    return this
  }

  /**
   * Add barcode
   */
  barcode(data: string, type: number = 73): this {
    this.buffer.push(0x1d, 0x6b, type, data.length)
    const barcodeBuffer = Buffer.from(data, 'utf-8')
    this.buffer.push(...barcodeBuffer)
    return this
  }

  /**
   * Add QR code
   */
  qrCode(data: string, size: number = 3): this {
    // Set QR code size
    this.buffer.push(0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, size)
    // Set error correction level
    this.buffer.push(0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x45, 0x30)
    // Store data
    const dataLength = data.length + 3
    this.buffer.push(0x1d, 0x28, 0x6b, dataLength & 0xff, (dataLength >> 8) & 0xff, 0x31, 0x50, 0x30)
    const qrBuffer = Buffer.from(data, 'utf-8')
    this.buffer.push(...qrBuffer)
    // Print QR code
    this.buffer.push(0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x51, 0x30)
    return this
  }

  /**
   * Build and return the buffer
   */
  build(): Buffer {
    return Buffer.from(this.buffer)
  }
}

export class PrinterService extends EventEmitter {
  private connectedPrinters: Map<string, DeviceInfo> = new Map()
  private activePrinter: DeviceInfo | null = null
  private usbDevice: usb.Device | null = null
  private serialPort: SerialPort | null = null
  private printQueue: PrintJob[] = []
  private isPrinting = false

  constructor() {
    super()
  }

  /**
   * Scan for available printers
   */
  async scanPrinters(): Promise<DeviceInfo[]> {
    const printers: DeviceInfo[] = []

    // Scan USB printers
    const usbPrinters = this.scanUSBPrinters()
    printers.push(...usbPrinters)

    // Scan serial ports
    const serialPrinters = await this.scanSerialPrinters()
    printers.push(...serialPrinters)

    // Update connected printers map
    this.connectedPrinters.clear()
    printers.forEach((printer) => {
      this.connectedPrinters.set(printer.id, printer)
    })

    this.emit('printers-scanned', printers)
    return printers
  }

  /**
   * Scan USB printers
   */
  private scanUSBPrinters(): DeviceInfo[] {
    const devices = usb.getDeviceList()
    const printers: DeviceInfo[] = []

    devices.forEach((device) => {
      const descriptor = device.deviceDescriptor
      const vendorId = descriptor.idVendor
      const productId = descriptor.idProduct

      // Check if it's a known printer
      const knownPrinter = KNOWN_PRINTER_IDS.find((p) => p.vendorId === vendorId)
      
      if (knownPrinter) {
        let name = knownPrinter.name
        
        try {
          device.open()
          if (descriptor.iProduct) {
            const productName = device.getStringDescriptor(descriptor.iProduct)
            if (productName && typeof productName === 'string') {
              name = `${knownPrinter.name} ${productName}`
            }
          }
          device.close()
        } catch (error) {
          // Ignore errors
        }

        printers.push({
          id: `usb-printer-${vendorId}-${productId}`,
          name,
          type: DeviceType.PRINTER,
          connection: ConnectionType.USB,
          status: DeviceStatus.READY,
          vendorId,
          productId,
          manufacturer: knownPrinter.name,
          path: `USB:${vendorId.toString(16)}:${productId.toString(16)}`
        })
      }
    })

    return printers
  }

  /**
   * Scan serial port printers
   */
  private async scanSerialPrinters(): Promise<DeviceInfo[]> {
    try {
      const ports = await SerialPort.list()
      const printers: DeviceInfo[] = []

      ports.forEach((port) => {
        // Check if port might be a printer
        if (
          port.manufacturer?.toLowerCase().includes('printer') ||
          port.manufacturer?.toLowerCase().includes('pos') ||
          port.path.includes('ttyUSB') ||
          port.path.includes('COM')
        ) {
          printers.push({
            id: `serial-printer-${port.path}`,
            name: `Serial Printer (${port.path})`,
            type: DeviceType.PRINTER,
            connection: ConnectionType.SERIAL,
            status: DeviceStatus.READY,
            manufacturer: port.manufacturer || 'Unknown',
            path: port.path,
            port: port.path
          })
        }
      })

      return printers
    } catch (error) {
      console.error('Error scanning serial printers:', error)
      return []
    }
  }

  /**
   * Connect to a printer
   */
  async connect(config: PrinterConfig): Promise<boolean> {
    try {
      if (config.connection === 'USB') {
        return await this.connectUSB(config)
      } else if (config.connection === 'Serial') {
        return await this.connectSerial(config)
      } else if (config.connection === 'Network') {
        return await this.connectNetwork(config)
      }
      return false
    } catch (error) {
      console.error('Error connecting to printer:', error)
      this.emit('printer-error', { error: String(error) })
      return false
    }
  }

  /**
   * Connect to USB printer
   */
  private async connectUSB(config: PrinterConfig): Promise<boolean> {
    if (!config.vendorId || !config.productId) {
      throw new Error('Vendor ID and Product ID required for USB connection')
    }

    const device = usb.findByIds(config.vendorId, config.productId)
    if (!device) {
      throw new Error('USB printer not found')
    }

    try {
      device.open()
      this.usbDevice = device
      
      const printerInfo: DeviceInfo = {
        id: `usb-${config.vendorId}-${config.productId}`,
        name: `USB Printer`,
        type: DeviceType.PRINTER,
        connection: ConnectionType.USB,
        status: DeviceStatus.CONNECTED,
        vendorId: config.vendorId,
        productId: config.productId
      }

      this.activePrinter = printerInfo
      this.emit('printer-connected', printerInfo)
      console.log('USB printer connected')
      return true
    } catch (error) {
      console.error('Error opening USB device:', error)
      throw error
    }
  }

  /**
   * Connect to serial printer
   */
  private async connectSerial(config: PrinterConfig): Promise<boolean> {
    if (!config.port) {
      throw new Error('Port required for serial connection')
    }

    return new Promise((resolve, reject) => {
      this.serialPort = new SerialPort({
        path: config.port!,
        baudRate: config.baudRate || 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none'
      })

      this.serialPort.on('open', () => {
        const printerInfo: DeviceInfo = {
          id: `serial-${config.port}`,
          name: `Serial Printer (${config.port})`,
          type: DeviceType.PRINTER,
          connection: ConnectionType.SERIAL,
          status: DeviceStatus.CONNECTED,
          port: config.port
        }

        this.activePrinter = printerInfo
        this.emit('printer-connected', printerInfo)
        console.log('Serial printer connected')
        resolve(true)
      })

      this.serialPort.on('error', (error) => {
        console.error('Serial port error:', error)
        this.emit('printer-error', { error: String(error) })
        reject(error)
      })
    })
  }

  /**
   * Connect to network printer
   */
  private async connectNetwork(config: PrinterConfig): Promise<boolean> {
    // Network printer implementation would go here
    // This would typically use raw TCP sockets to connect to the printer
    console.log('Network printer connection not yet implemented')
    return false
  }

  /**
   * Disconnect from printer
   */
  disconnect(): void {
    if (this.usbDevice) {
      try {
        this.usbDevice.close()
      } catch (error) {
        console.error('Error closing USB device:', error)
      }
      this.usbDevice = null
    }

    if (this.serialPort && this.serialPort.isOpen) {
      this.serialPort.close()
      this.serialPort = null
    }

    if (this.activePrinter) {
      this.emit('printer-disconnected', this.activePrinter)
      this.activePrinter = null
    }

    console.log('Printer disconnected')
  }

  /**
   * Print raw data
   */
  async print(data: Buffer | string): Promise<boolean> {
    if (!this.activePrinter) {
      throw new Error('No printer connected')
    }

    const printJob: PrintJob = {
      id: `job-${Date.now()}`,
      data,
      timestamp: Date.now(),
      status: 'pending'
    }

    this.printQueue.push(printJob)
    this.processPrintQueue()

    return true
  }

  /**
   * Process print queue
   */
  private async processPrintQueue(): Promise<void> {
    if (this.isPrinting || this.printQueue.length === 0) {
      return
    }

    this.isPrinting = true
    const job = this.printQueue.shift()!

    try {
      job.status = 'printing'
      await this.executePrintJob(job)
      job.status = 'completed'
      this.emit('print-completed', job)
    } catch (error) {
      job.status = 'failed'
      job.error = String(error)
      this.emit('print-failed', job)
      console.error('Print job failed:', error)
    } finally {
      this.isPrinting = false
      // Process next job if any
      if (this.printQueue.length > 0) {
        this.processPrintQueue()
      }
    }
  }

  /**
   * Execute print job
   */
  private async executePrintJob(job: PrintJob): Promise<void> {
    const data = typeof job.data === 'string' ? Buffer.from(job.data) : job.data

    if (this.serialPort && this.serialPort.isOpen) {
      return new Promise((resolve, reject) => {
        this.serialPort!.write(data, (error) => {
          if (error) {
            reject(error)
          } else {
            this.serialPort!.drain(() => {
              resolve()
            })
          }
        })
      })
    } else if (this.usbDevice) {
      // USB printing would require finding the correct endpoint and writing to it
      // This is a simplified version
      throw new Error('USB printing not fully implemented')
    } else {
      throw new Error('No printer connection available')
    }
  }

  /**
   * Get printer status
   */
  async getStatus(): Promise<PrinterStatus> {
    if (!this.activePrinter) {
      return {
        online: false,
        paperStatus: 'unknown',
        error: 'No printer connected'
      }
    }

    // Basic status - could be enhanced with actual printer status queries
    return {
      online: this.activePrinter.status === DeviceStatus.CONNECTED,
      paperStatus: 'ok',
    }
  }

  /**
   * Get connected printers
   */
  getConnectedPrinters(): DeviceInfo[] {
    return Array.from(this.connectedPrinters.values())
  }

  /**
   * Get active printer
   */
  getActivePrinter(): DeviceInfo | null {
    return this.activePrinter
  }

  /**
   * Test print
   */
  async testPrint(useEscPos: boolean = true): Promise<boolean> {
    if (useEscPos) {
      // ESC/POS mode - use thermal printer commands
      const testData = new EscPosBuilder()
        .init()
        .align('center')
        .size(2, 2)
        .bold(true)
        .text('TEST PRINT')
        .feed(1)
        .size(1, 1)
        .bold(false)
        .text('ESC/POS Mode')
        .feed(1)
        .align('left')
        .text('Printer is working correctly!')
        .feed(1)
        .text(`Date: ${new Date().toLocaleString()}`)
        .feed(1)
        .text('This is a test receipt.')
        .feed(1)
        .align('center')
        .text('--------------------------------')
        .feed(1)
        .text('Thank you!')
        .feed(3)
        .cut()
        .build()

      return await this.print(testData)
    } else {
      // Standard mode - use plain text for regular printers
      const testText = `
========================================
           TEST PRINT
========================================

Standard Printer Mode

Printer is working correctly!
Date: ${new Date().toLocaleString()}

This is a test receipt.

----------------------------------------
           Thank you!
========================================


`
      return await this.print(testText)
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.disconnect()
    this.connectedPrinters.clear()
    this.printQueue = []
    this.removeAllListeners()
  }
}

// Singleton instance
let instance: PrinterService | null = null

export function getPrinterService(): PrinterService {
  if (!instance) {
    instance = new PrinterService()
  }
  return instance
}
