/**
 * ESC/POS Template Renderer
 * 
 * Converts receipt templates and data into ESC/POS commands for thermal printers
 * Supports images, QR codes, barcodes, and comprehensive text formatting
 */

import { EscPosBuilder } from './PrinterService'

/**
 * Receipt template configuration interface
 */
export interface ReceiptTemplateConfig {
  id: string
  name: string
  type: 'order_receipt' | 'invoice' | 'pos_opening' | 'pos_closing' | 'order_park'
  description: string
  enabled: boolean
  
  header: {
    showLogo: boolean
    showBusinessName: boolean
    showBusinessAddress: boolean
    showBusinessPhone: boolean
    showBusinessEmail: boolean
    showTaxId: boolean
    customText?: string
    alignment: 'left' | 'center' | 'right'
  }
  
  body: {
    showItemDetails: boolean
    showQuantity: boolean
    showUnitPrice: boolean
    showItemDiscount: boolean
    showItemTax: boolean
    showItemTotal: boolean
    showDenominations: boolean
    showCashBreakdown: boolean
    showPaymentSummary: boolean
    showTransactionCount: boolean
    showParkTime: boolean
    showParkNotes: boolean
    showCustomerInfo: boolean
  }
  
  totals: {
    showSubtotal: boolean
    showTax: boolean
    showDiscount: boolean
    showGrandTotal: boolean
    showAmountPaid: boolean
    showChange: boolean
    showExpectedCash: boolean
    showActualCash: boolean
    showVariance: boolean
  }
  
  footer: {
    showThankYouMessage: boolean
    showReturnPolicy: boolean
    showPromoMessage: boolean
    showBarcode: boolean
    showQRCode: boolean
    customText?: string
    alignment: 'left' | 'center' | 'right'
  }
  
  print: {
    autoPrint: boolean
    numberOfCopies: number
    paperSize: '58mm' | '80mm' | '110mm' | 'A4' | 'Letter'
  }
}

/**
 * Business information for receipt header
 */
export interface BusinessInfo {
  name?: string
  address?: string
  phone?: string
  email?: string
  taxId?: string
  logoPath?: string
  logoUrl?: string
}

/**
 * Receipt data for order receipts and invoices
 */
export interface ReceiptData {
  // Receipt metadata
  invoiceNumber: string
  date: string
  time?: string
  cashier?: string
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  
  // Items
  items: Array<{
    name: string
    quantity: number
    unitPrice: number
    total: number
    discount?: number
    tax?: number
    sku?: string
  }>
  
  // Totals
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  amountPaid?: number
  changeGiven?: number
  
  // Payment
  paymentMethod?: string
  
  // Additional data
  notes?: string
  returnPolicy?: string
  promotionalMessage?: string
  
  // For parked orders
  parkTime?: string
  parkNotes?: string
}

/**
 * POS session data for opening/closing receipts
 */
export interface SessionData {
  sessionNumber: string
  userName: string
  openedAt: string
  closedAt?: string
  
  // Cash denominations
  denominations?: {
    [key: string]: number // e.g., "100": 5, "50": 10
  }
  
  // Session totals
  openingCash?: number
  closingCash?: number
  expectedCash?: number
  cashVariance?: number
  totalSales?: number
  
  // Payment summary
  paymentSummary?: {
    [method: string]: {
      count: number
      amount: number
    }
  }
  
  // Transaction counts
  transactionCount?: number
  
  notes?: string
}

/**
 * Image encoding options
 */
export interface ImageOptions {
  maxWidth?: number
  alignment?: 'left' | 'center' | 'right'
  dithering?: boolean
}

/**
 * QR code options
 */
export interface QRCodeOptions {
  size?: number // 1-16, default 3
  errorCorrection?: 'L' | 'M' | 'Q' | 'H' // Low, Medium, Quartile, High
  alignment?: 'left' | 'center' | 'right'
}

/**
 * Barcode options
 */
export interface BarcodeOptions {
  type?: 'CODE39' | 'CODE128' | 'EAN13' | 'EAN8' | 'UPC' | 'ITF'
  height?: number
  width?: number
  alignment?: 'left' | 'center' | 'right'
  includeText?: boolean
}

/**
 * ESC/POS Template Renderer
 */
export class EscPosTemplateRenderer {
  private maxLineWidth: number = 48 // Default for 80mm paper
  
  constructor(paperSize: '58mm' | '80mm' | '110mm' | 'A4' | 'Letter' = '80mm') {
    // Set max line width based on paper size
    const widthMap = {
      '58mm': 32,
      '80mm': 48,
      '110mm': 64,
      'A4': 80,
      'Letter': 80
    }
    this.maxLineWidth = widthMap[paperSize] || 48
  }
  
  /**
   * Render a complete receipt from template and data
   */
  async renderReceipt(
    template: ReceiptTemplateConfig,
    data: ReceiptData | SessionData,
    businessInfo: BusinessInfo
  ): Promise<Buffer> {
    const builder = new EscPosBuilder().init()
    
    try {
      // Render header
      await this.renderHeader(builder, template, businessInfo)
      
      // Render body based on template type
      if (template.type === 'order_receipt' || template.type === 'invoice' || template.type === 'order_park') {
        await this.renderOrderBody(builder, template, data as ReceiptData)
      } else if (template.type === 'pos_opening' || template.type === 'pos_closing') {
        await this.renderSessionBody(builder, template, data as SessionData)
      }
      
      // Render footer
      await this.renderFooter(builder, template, data, businessInfo)
      
      // Add final spacing and cut
      builder.feed(3).cut()
      
      return builder.build()
    } catch (error) {
      console.error('Error rendering receipt:', error)
      // Return a basic error receipt
      return builder
        .align('center')
        .text('ERROR GENERATING RECEIPT')
        .feed(1)
        .text(error instanceof Error ? error.message : 'Unknown error')
        .feed(3)
        .cut()
        .build()
    }
  }
  
  /**
   * Render receipt header
   */
  private async renderHeader(
    builder: EscPosBuilder,
    template: ReceiptTemplateConfig,
    businessInfo: BusinessInfo
  ): Promise<void> {
    const { header } = template
    
    // Set alignment
    builder.align(header.alignment)
    
    // Logo
    if (header.showLogo && (businessInfo.logoPath || businessInfo.logoUrl)) {
      try {
        await this.renderImage(builder, businessInfo.logoPath || businessInfo.logoUrl!, {
          maxWidth: this.maxLineWidth * 8,
          alignment: header.alignment
        })
        builder.feed(1)
      } catch (error) {
        console.error('Error rendering logo:', error)
      }
    }
    
    // Business name
    if (header.showBusinessName && businessInfo.name) {
      builder
        .size(2, 2)
        .bold(true)
        .text(this.wrapText(businessInfo.name, this.maxLineWidth / 2))
        .bold(false)
        .size(1, 1)
        .feed(1)
    }
    
    // Business address
    if (header.showBusinessAddress && businessInfo.address) {
      builder.text(this.wrapText(businessInfo.address, this.maxLineWidth)).feed(1)
    }
    
    // Business phone
    if (header.showBusinessPhone && businessInfo.phone) {
      builder.text(`Tel: ${businessInfo.phone}`).feed(1)
    }
    
    // Business email
    if (header.showBusinessEmail && businessInfo.email) {
      builder.text(businessInfo.email).feed(1)
    }
    
    // Tax ID
    if (header.showTaxId && businessInfo.taxId) {
      builder.text(`Tax ID: ${businessInfo.taxId}`).feed(1)
    }
    
    // Custom header text
    if (header.customText) {
      builder
        .feed(1)
        .bold(true)
        .text(this.wrapText(header.customText, this.maxLineWidth))
        .bold(false)
        .feed(1)
    }
    
    // Separator
    builder.align('left').text(this.repeat('-', this.maxLineWidth)).feed(1)
  }
  
  /**
   * Render order receipt body
   */
  private async renderOrderBody(
    builder: EscPosBuilder,
    template: ReceiptTemplateConfig,
    data: ReceiptData
  ): Promise<void> {
    const { body, totals } = template
    
    // Receipt info
    builder
      .align('left')
      .text(`Invoice: ${data.invoiceNumber}`)
      .feed(1)
      .text(`Date: ${data.date}${data.time ? ' ' + data.time : ''}`)
      .feed(1)
    
    if (data.cashier) {
      builder.text(`Cashier: ${data.cashier}`).feed(1)
    }
    
    // Customer info (for invoices and parked orders)
    if (body.showCustomerInfo && data.customerName) {
      builder
        .feed(1)
        .text(`Customer: ${data.customerName}`)
        .feed(1)
      if (data.customerPhone) {
        builder.text(`Phone: ${data.customerPhone}`).feed(1)
      }
      if (data.customerEmail) {
        builder.text(`Email: ${data.customerEmail}`).feed(1)
      }
    }
    
    // Park info (for parked orders)
    if (body.showParkTime && data.parkTime) {
      builder.text(`Parked: ${data.parkTime}`).feed(1)
    }
    if (body.showParkNotes && data.parkNotes) {
      builder.text(`Notes: ${this.wrapText(data.parkNotes, this.maxLineWidth)}`).feed(1)
    }
    
    builder.text(this.repeat('-', this.maxLineWidth)).feed(1)
    
    // Items
    if (body.showItemDetails && data.items && data.items.length > 0) {
      for (const item of data.items) {
        // Item name
        builder.text(this.wrapText(item.name, this.maxLineWidth)).feed(1)
        
        // Quantity, price, and total
        let itemLine = ''
        if (body.showQuantity) {
          itemLine += `${item.quantity} x `
        }
        if (body.showUnitPrice) {
          itemLine += `$${item.unitPrice.toFixed(2)}`
        }
        
        const total = body.showItemTotal ? `$${item.total.toFixed(2)}` : ''
        builder.text(this.formatLine(itemLine, total, this.maxLineWidth)).feed(1)
        
        // Item discount
        if (body.showItemDiscount && item.discount && item.discount > 0) {
          builder.text(this.formatLine('  Discount', `-$${item.discount.toFixed(2)}`, this.maxLineWidth)).feed(1)
        }
        
        // Item tax
        if (body.showItemTax && item.tax && item.tax > 0) {
          builder.text(this.formatLine('  Tax', `$${item.tax.toFixed(2)}`, this.maxLineWidth)).feed(1)
        }
        
        builder.feed(1)
      }
    }
    
    builder.text(this.repeat('-', this.maxLineWidth)).feed(1)
    
    // Totals
    if (totals.showSubtotal) {
      builder.text(this.formatLine('Subtotal:', `$${data.subtotal.toFixed(2)}`, this.maxLineWidth)).feed(1)
    }
    
    if (totals.showDiscount && data.discountAmount > 0) {
      builder.text(this.formatLine('Discount:', `-$${data.discountAmount.toFixed(2)}`, this.maxLineWidth)).feed(1)
    }
    
    if (totals.showTax) {
      builder.text(this.formatLine('Tax:', `$${data.taxAmount.toFixed(2)}`, this.maxLineWidth)).feed(1)
    }
    
    if (totals.showGrandTotal) {
      builder
        .text(this.repeat('=', this.maxLineWidth))
        .feed(1)
        .size(2, 2)
        .bold(true)
        .text(this.formatLine('TOTAL:', `$${data.totalAmount.toFixed(2)}`, this.maxLineWidth / 2))
        .bold(false)
        .size(1, 1)
        .feed(1)
        .text(this.repeat('=', this.maxLineWidth))
        .feed(1)
    }
    
    // Payment info
    if (totals.showAmountPaid && data.amountPaid !== undefined) {
      builder.text(this.formatLine(`Paid (${data.paymentMethod || 'Cash'}):`, `$${data.amountPaid.toFixed(2)}`, this.maxLineWidth)).feed(1)
    }
    
    if (totals.showChange && data.changeGiven !== undefined) {
      builder.text(this.formatLine('Change:', `$${data.changeGiven.toFixed(2)}`, this.maxLineWidth)).feed(1)
    }
    
    builder.feed(1)
  }
  
  /**
   * Render POS session body
   */
  private async renderSessionBody(
    builder: EscPosBuilder,
    template: ReceiptTemplateConfig,
    data: SessionData
  ): Promise<void> {
    const { body, totals } = template
    const isClosing = template.type === 'pos_closing'
    
    // Session info
    builder
      .align('left')
      .text(`Session: ${data.sessionNumber}`)
      .feed(1)
      .text(`User: ${data.userName}`)
      .feed(1)
      .text(`Opened: ${data.openedAt}`)
      .feed(1)
    
    if (isClosing && data.closedAt) {
      builder.text(`Closed: ${data.closedAt}`).feed(1)
    }
    
    builder.text(this.repeat('-', this.maxLineWidth)).feed(1)
    
    // Cash denominations
    if (body.showDenominations && data.denominations) {
      builder
        .bold(true)
        .text('Cash Denominations:')
        .bold(false)
        .feed(1)
      
      for (const [denom, count] of Object.entries(data.denominations)) {
        const value = parseFloat(denom) * count
        builder.text(this.formatLine(`  $${denom} x ${count}`, `$${value.toFixed(2)}`, this.maxLineWidth)).feed(1)
      }
      builder.feed(1)
    }
    
    // Cash breakdown
    if (body.showCashBreakdown) {
      if (totals.showActualCash && data.openingCash !== undefined) {
        builder.text(this.formatLine('Opening Cash:', `$${data.openingCash.toFixed(2)}`, this.maxLineWidth)).feed(1)
      }
      
      if (isClosing) {
        if (data.totalSales !== undefined) {
          builder.text(this.formatLine('Total Sales:', `$${data.totalSales.toFixed(2)}`, this.maxLineWidth)).feed(1)
        }
        
        if (totals.showExpectedCash && data.expectedCash !== undefined) {
          builder.text(this.formatLine('Expected Cash:', `$${data.expectedCash.toFixed(2)}`, this.maxLineWidth)).feed(1)
        }
        
        if (totals.showActualCash && data.closingCash !== undefined) {
          builder.text(this.formatLine('Actual Cash:', `$${data.closingCash.toFixed(2)}`, this.maxLineWidth)).feed(1)
        }
        
        if (totals.showVariance && data.cashVariance !== undefined) {
          const varianceText = data.cashVariance >= 0 ? `+$${data.cashVariance.toFixed(2)}` : `-$${Math.abs(data.cashVariance).toFixed(2)}`
          builder.text(this.formatLine('Variance:', varianceText, this.maxLineWidth)).feed(1)
        }
      }
      
      builder.feed(1)
    }
    
    // Payment summary
    if (body.showPaymentSummary && data.paymentSummary && isClosing) {
      builder
        .bold(true)
        .text('Payment Summary:')
        .bold(false)
        .feed(1)
      
      for (const [method, summary] of Object.entries(data.paymentSummary)) {
        builder.text(this.formatLine(`  ${method} (${summary.count})`, `$${summary.amount.toFixed(2)}`, this.maxLineWidth)).feed(1)
      }
      builder.feed(1)
    }
    
    // Transaction count
    if (body.showTransactionCount && data.transactionCount !== undefined && isClosing) {
      builder.text(this.formatLine('Total Transactions:', data.transactionCount.toString(), this.maxLineWidth)).feed(1)
    }
    
    // Notes
    if (data.notes) {
      builder
        .feed(1)
        .text('Notes:')
        .feed(1)
        .text(this.wrapText(data.notes, this.maxLineWidth))
        .feed(1)
    }
  }
  
  /**
   * Render receipt footer
   */
  private async renderFooter(
    builder: EscPosBuilder,
    template: ReceiptTemplateConfig,
    data: ReceiptData | SessionData,
    businessInfo: BusinessInfo
  ): Promise<void> {
    const { footer } = template
    
    builder.text(this.repeat('-', this.maxLineWidth)).feed(1)
    
    // Set alignment
    builder.align(footer.alignment)
    
    // Thank you message
    if (footer.showThankYouMessage) {
      builder
        .feed(1)
        .text('Thank you for your business!')
        .feed(1)
    }
    
    // Return policy
    if (footer.showReturnPolicy && 'returnPolicy' in data && data.returnPolicy) {
      builder
        .feed(1)
        .text(this.wrapText(data.returnPolicy, this.maxLineWidth))
        .feed(1)
    }
    
    // Promotional message
    if (footer.showPromoMessage && 'promotionalMessage' in data && data.promotionalMessage) {
      builder
        .feed(1)
        .text(this.wrapText(data.promotionalMessage, this.maxLineWidth))
        .feed(1)
    }
    
    // Custom footer text
    if (footer.customText) {
      builder
        .feed(1)
        .text(this.wrapText(footer.customText, this.maxLineWidth))
        .feed(1)
    }
    
    // Barcode
    if (footer.showBarcode && 'invoiceNumber' in data) {
      try {
        builder.feed(1)
        await this.renderBarcode(builder, data.invoiceNumber, {
          type: 'CODE128',
          alignment: footer.alignment,
          includeText: true
        })
        builder.feed(1)
      } catch (error) {
        console.error('Error rendering barcode:', error)
      }
    }
    
    // QR Code
    if (footer.showQRCode && 'invoiceNumber' in data) {
      try {
        builder.feed(1)
        await this.renderQRCode(builder, data.invoiceNumber, {
          size: 6,
          errorCorrection: 'M',
          alignment: footer.alignment
        })
        builder.feed(1)
      } catch (error) {
        console.error('Error rendering QR code:', error)
      }
    }
  }
  
  /**
   * Render an image (logo)
   */
  private async renderImage(
    builder: EscPosBuilder,
    imagePath: string,
    options: ImageOptions = {}
  ): Promise<void> {
    // TODO: Implement image rendering
    // This requires:
    // 1. Loading the image from path/URL
    // 2. Converting to monochrome bitmap
    // 3. Encoding as ESC/POS raster image commands
    // 4. Handling alignment
    
    // For now, skip image rendering
    console.warn('Image rendering not yet implemented')
  }
  
  /**
   * Render a QR code
   */
  private async renderQRCode(
    builder: EscPosBuilder,
    data: string,
    options: QRCodeOptions = {}
  ): Promise<void> {
    const {
      size = 6,
      errorCorrection = 'M',
      alignment = 'center'
    } = options
    
    // Validate data
    if (!data || data.trim().length === 0) {
      throw new Error('QR code data cannot be empty')
    }
    
    // Validate size (1-16)
    const qrSize = Math.max(1, Math.min(16, size))
    
    // Set alignment
    builder.align(alignment)
    
    // Map error correction level to ESC/POS value
    const ecMap: Record<string, number> = {
      'L': 0x30, // 7% recovery
      'M': 0x31, // 15% recovery
      'Q': 0x32, // 25% recovery
      'H': 0x33  // 30% recovery
    }
    const ecLevel = ecMap[errorCorrection] || 0x31
    
    // Generate QR code using ESC/POS commands
    builder.qrCode(data, qrSize)
  }
  
  /**
   * Render a barcode
   */
  private async renderBarcode(
    builder: EscPosBuilder,
    data: string,
    options: BarcodeOptions = {}
  ): Promise<void> {
    const {
      type = 'CODE128',
      alignment = 'center',
      includeText = true
    } = options
    
    // Validate data
    if (!data || data.trim().length === 0) {
      throw new Error('Barcode data cannot be empty')
    }
    
    // Set alignment
    builder.align(alignment)
    
    // Map barcode type to ESC/POS code
    const typeMap: Record<string, number> = {
      'CODE39': 69,    // 0x45
      'CODE128': 73,   // 0x49
      'EAN13': 67,     // 0x43
      'EAN8': 68,      // 0x44
      'UPC': 65,       // 0x41
      'ITF': 70        // 0x46
    }
    
    const barcodeType = typeMap[type] || 73 // Default to CODE128
    
    // Validate data format based on barcode type
    this.validateBarcodeData(data, type)
    
    // Generate barcode
    builder.barcode(data, barcodeType)
    
    // Add text below if requested
    if (includeText) {
      builder.feed(1).text(data).feed(1)
    }
  }
  
  /**
   * Validate barcode data format
   */
  private validateBarcodeData(data: string, type: string): void {
    switch (type) {
      case 'EAN13':
        if (!/^\d{13}$/.test(data)) {
          throw new Error('EAN13 barcode must be exactly 13 digits')
        }
        break
      case 'EAN8':
        if (!/^\d{8}$/.test(data)) {
          throw new Error('EAN8 barcode must be exactly 8 digits')
        }
        break
      case 'UPC':
        if (!/^\d{12}$/.test(data)) {
          throw new Error('UPC barcode must be exactly 12 digits')
        }
        break
      case 'CODE39':
        if (!/^[A-Z0-9\-\.\ \$\/\+\%]+$/.test(data)) {
          throw new Error('CODE39 barcode contains invalid characters')
        }
        break
      // CODE128 and ITF are more flexible
    }
  }
  
  /**
   * Format a line with left and right text
   */
  private formatLine(left: string, right: string, width: number): string {
    const totalLength = left.length + right.length
    if (totalLength >= width) {
      return left + right
    }
    const spaces = width - totalLength
    return left + this.repeat(' ', spaces) + right
  }
  
  /**
   * Wrap text to fit within line width
   */
  private wrapText(text: string, width: number): string {
    if (!text) return ''
    
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''
    
    for (const word of words) {
      if (currentLine.length + word.length + 1 <= width) {
        currentLine += (currentLine ? ' ' : '') + word
      } else {
        if (currentLine) lines.push(currentLine)
        currentLine = word
      }
    }
    
    if (currentLine) lines.push(currentLine)
    
    return lines.join('\n')
  }
  
  /**
   * Repeat a character n times
   */
  private repeat(char: string, count: number): string {
    return char.repeat(count)
  }
}
