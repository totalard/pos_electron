/**
 * Receipt Template Types and Configurations
 * 
 * Defines the 5 receipt template types:
 * 1. Order Receipt - Standard customer receipt
 * 2. Invoice - Formal invoice document
 * 3. POS Opening - Session opening receipt
 * 4. POS Closing Summary - Session closing summary
 * 5. Order Park Receipt - Parked order receipt
 */

export type ReceiptTemplateType = 
  | 'order_receipt'
  | 'invoice'
  | 'pos_opening'
  | 'pos_closing'
  | 'order_park'

export interface ReceiptTemplateConfig {
  id: string
  name: string
  type: ReceiptTemplateType
  description: string
  enabled: boolean
  
  // Header Configuration
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
  
  // Body Configuration
  body: {
    // For order receipts and invoices
    showItemDetails: boolean
    showQuantity: boolean
    showUnitPrice: boolean
    showItemDiscount: boolean
    showItemTax: boolean
    showItemTotal: boolean
    
    // For POS opening/closing
    showDenominations: boolean
    showCashBreakdown: boolean
    showPaymentSummary: boolean
    showTransactionCount: boolean
    
    // For parked orders
    showParkTime: boolean
    showParkNotes: boolean
    showCustomerInfo: boolean
  }
  
  // Totals Configuration
  totals: {
    showSubtotal: boolean
    showTax: boolean
    showDiscount: boolean
    showGrandTotal: boolean
    showAmountPaid: boolean
    showChange: boolean
    
    // For POS closing
    showExpectedCash: boolean
    showActualCash: boolean
    showVariance: boolean
  }
  
  // Footer Configuration
  footer: {
    showThankYouMessage: boolean
    showReturnPolicy: boolean
    showPromoMessage: boolean
    showBarcode: boolean
    showQRCode: boolean
    customText?: string
    alignment: 'left' | 'center' | 'right'
  }
  
  // Print Settings
  print: {
    autoPrint: boolean
    numberOfCopies: number
    paperSize: '58mm' | '80mm' | '110mm' | 'A4' | 'Letter'
  }
}

/**
 * Default configurations for each template type
 */
export const DEFAULT_TEMPLATE_CONFIGS: Record<ReceiptTemplateType, Partial<ReceiptTemplateConfig>> = {
  order_receipt: {
    type: 'order_receipt',
    name: 'Order Receipt',
    description: 'Standard customer receipt for completed orders',
    enabled: true,
    header: {
      showLogo: true,
      showBusinessName: true,
      showBusinessAddress: true,
      showBusinessPhone: true,
      showBusinessEmail: false,
      showTaxId: false,
      customText: 'Thank you for your purchase!',
      alignment: 'center'
    },
    body: {
      showItemDetails: true,
      showQuantity: true,
      showUnitPrice: true,
      showItemDiscount: true,
      showItemTax: false,
      showItemTotal: true,
      showDenominations: false,
      showCashBreakdown: false,
      showPaymentSummary: false,
      showTransactionCount: false,
      showParkTime: false,
      showParkNotes: false,
      showCustomerInfo: false
    },
    totals: {
      showSubtotal: true,
      showTax: true,
      showDiscount: true,
      showGrandTotal: true,
      showAmountPaid: true,
      showChange: true,
      showExpectedCash: false,
      showActualCash: false,
      showVariance: false
    },
    footer: {
      showThankYouMessage: true,
      showReturnPolicy: false,
      showPromoMessage: false,
      showBarcode: false,
      showQRCode: false,
      customText: 'Please come again!',
      alignment: 'center'
    },
    print: {
      autoPrint: true,
      numberOfCopies: 1,
      paperSize: '80mm'
    }
  },
  
  invoice: {
    type: 'invoice',
    name: 'Invoice',
    description: 'Formal invoice document for orders',
    enabled: true,
    header: {
      showLogo: true,
      showBusinessName: true,
      showBusinessAddress: true,
      showBusinessPhone: true,
      showBusinessEmail: true,
      showTaxId: true,
      customText: 'INVOICE',
      alignment: 'center'
    },
    body: {
      showItemDetails: true,
      showQuantity: true,
      showUnitPrice: true,
      showItemDiscount: true,
      showItemTax: true,
      showItemTotal: true,
      showDenominations: false,
      showCashBreakdown: false,
      showPaymentSummary: false,
      showTransactionCount: false,
      showParkTime: false,
      showParkNotes: false,
      showCustomerInfo: true
    },
    totals: {
      showSubtotal: true,
      showTax: true,
      showDiscount: true,
      showGrandTotal: true,
      showAmountPaid: true,
      showChange: true,
      showExpectedCash: false,
      showActualCash: false,
      showVariance: false
    },
    footer: {
      showThankYouMessage: false,
      showReturnPolicy: true,
      showPromoMessage: false,
      showBarcode: true,
      showQRCode: true,
      customText: 'Terms and Conditions Apply',
      alignment: 'left'
    },
    print: {
      autoPrint: false,
      numberOfCopies: 1,
      paperSize: 'A4'
    }
  },
  
  pos_opening: {
    type: 'pos_opening',
    name: 'POS Opening',
    description: 'Receipt printed when opening a POS session',
    enabled: true,
    header: {
      showLogo: false,
      showBusinessName: true,
      showBusinessAddress: false,
      showBusinessPhone: false,
      showBusinessEmail: false,
      showTaxId: false,
      customText: 'POS SESSION OPENING',
      alignment: 'center'
    },
    body: {
      showItemDetails: false,
      showQuantity: false,
      showUnitPrice: false,
      showItemDiscount: false,
      showItemTax: false,
      showItemTotal: false,
      showDenominations: true,
      showCashBreakdown: true,
      showPaymentSummary: false,
      showTransactionCount: false,
      showParkTime: false,
      showParkNotes: false,
      showCustomerInfo: false
    },
    totals: {
      showSubtotal: false,
      showTax: false,
      showDiscount: false,
      showGrandTotal: false,
      showAmountPaid: false,
      showChange: false,
      showExpectedCash: false,
      showActualCash: true,
      showVariance: false
    },
    footer: {
      showThankYouMessage: false,
      showReturnPolicy: false,
      showPromoMessage: false,
      showBarcode: false,
      showQRCode: false,
      customText: '',
      alignment: 'center'
    },
    print: {
      autoPrint: true,
      numberOfCopies: 1,
      paperSize: '80mm'
    }
  },
  
  pos_closing: {
    type: 'pos_closing',
    name: 'POS Closing Summary',
    description: 'Summary receipt printed when closing a POS session',
    enabled: true,
    header: {
      showLogo: false,
      showBusinessName: true,
      showBusinessAddress: false,
      showBusinessPhone: false,
      showBusinessEmail: false,
      showTaxId: false,
      customText: 'POS SESSION CLOSING SUMMARY',
      alignment: 'center'
    },
    body: {
      showItemDetails: false,
      showQuantity: false,
      showUnitPrice: false,
      showItemDiscount: false,
      showItemTax: false,
      showItemTotal: false,
      showDenominations: true,
      showCashBreakdown: true,
      showPaymentSummary: true,
      showTransactionCount: true,
      showParkTime: false,
      showParkNotes: false,
      showCustomerInfo: false
    },
    totals: {
      showSubtotal: false,
      showTax: true,
      showDiscount: true,
      showGrandTotal: true,
      showAmountPaid: false,
      showChange: false,
      showExpectedCash: true,
      showActualCash: true,
      showVariance: true
    },
    footer: {
      showThankYouMessage: false,
      showReturnPolicy: false,
      showPromoMessage: false,
      showBarcode: false,
      showQRCode: false,
      customText: 'Session closed successfully',
      alignment: 'center'
    },
    print: {
      autoPrint: true,
      numberOfCopies: 2,
      paperSize: '80mm'
    }
  },
  
  order_park: {
    type: 'order_park',
    name: 'Order Park Receipt',
    description: 'Receipt for parked/held orders',
    enabled: true,
    header: {
      showLogo: false,
      showBusinessName: true,
      showBusinessAddress: false,
      showBusinessPhone: false,
      showBusinessEmail: false,
      showTaxId: false,
      customText: 'PARKED ORDER',
      alignment: 'center'
    },
    body: {
      showItemDetails: true,
      showQuantity: true,
      showUnitPrice: true,
      showItemDiscount: false,
      showItemTax: false,
      showItemTotal: true,
      showDenominations: false,
      showCashBreakdown: false,
      showPaymentSummary: false,
      showTransactionCount: false,
      showParkTime: true,
      showParkNotes: true,
      showCustomerInfo: true
    },
    totals: {
      showSubtotal: true,
      showTax: true,
      showDiscount: true,
      showGrandTotal: true,
      showAmountPaid: false,
      showChange: false,
      showExpectedCash: false,
      showActualCash: false,
      showVariance: false
    },
    footer: {
      showThankYouMessage: false,
      showReturnPolicy: false,
      showPromoMessage: false,
      showBarcode: true,
      showQRCode: true,
      customText: 'Present this receipt to complete order',
      alignment: 'center'
    },
    print: {
      autoPrint: false,
      numberOfCopies: 1,
      paperSize: '80mm'
    }
  }
}

/**
 * Template metadata for UI display
 */
export const TEMPLATE_METADATA: Record<ReceiptTemplateType, {
  icon: string
  color: string
  category: string
}> = {
  order_receipt: {
    icon: '🧾',
    color: 'blue',
    category: 'Sales'
  },
  invoice: {
    icon: '📄',
    color: 'purple',
    category: 'Sales'
  },
  pos_opening: {
    icon: '🔓',
    color: 'green',
    category: 'Session'
  },
  pos_closing: {
    icon: '🔒',
    color: 'red',
    category: 'Session'
  },
  order_park: {
    icon: '⏸️',
    color: 'orange',
    category: 'Sales'
  }
}
