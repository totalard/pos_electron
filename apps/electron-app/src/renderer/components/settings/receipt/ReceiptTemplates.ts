import { ReceiptSettings } from '../../../stores/settingsStore'

/**
 * Receipt Template Definitions
 * 
 * Pre-built templates with optimized configurations for different use cases
 */

export interface ReceiptTemplate {
  id: string
  name: string
  description: string
  config: Partial<ReceiptSettings>
}

export const RECEIPT_TEMPLATES: ReceiptTemplate[] = [
  {
    id: 'standard',
    name: 'Standard',
    description: 'Balanced layout with all essential information',
    config: {
      // Header
      showLogo: true,
      customHeaderText: 'Thank you for your purchase!',
      
      // Item Display
      showItemName: true,
      showItemQuantity: true,
      showItemPrice: true,
      showItemDiscount: true,
      showItemTax: true,
      itemColumnAlignment: 'left',
      itemSpacing: 'normal',
      
      // Totals
      showSubtotal: true,
      showTaxBreakdown: true,
      showDiscountTotal: true,
      showGrandTotal: true,
      
      // Footer
      customFooterText: 'Please come again!',
      showBarcode: false,
      showQRCode: false,
      
      // Layout
      headerFontSize: 14,
      itemFontSize: 12,
      totalFontSize: 13,
      footerFontSize: 11,
      lineSpacing: 'normal',
      sectionSpacing: 10,
      marginTop: 5,
      marginBottom: 5,
      marginLeft: 5,
      marginRight: 5
    }
  },
  {
    id: 'compact',
    name: 'Compact',
    description: 'Minimal layout to save paper, shows only critical info',
    config: {
      // Header
      showLogo: false,
      customHeaderText: '',
      
      // Item Display
      showItemName: true,
      showItemQuantity: true,
      showItemPrice: true,
      showItemDiscount: false,
      showItemTax: false,
      itemColumnAlignment: 'left',
      itemSpacing: 'compact',
      
      // Totals
      showSubtotal: false,
      showTaxBreakdown: false,
      showDiscountTotal: false,
      showGrandTotal: true,
      
      // Footer
      customFooterText: '',
      showBarcode: false,
      showQRCode: false,
      
      // Layout
      headerFontSize: 12,
      itemFontSize: 10,
      totalFontSize: 11,
      footerFontSize: 9,
      lineSpacing: 'compact',
      sectionSpacing: 5,
      marginTop: 3,
      marginBottom: 3,
      marginLeft: 3,
      marginRight: 3
    }
  },
  {
    id: 'detailed',
    name: 'Detailed',
    description: 'Comprehensive layout with all available details',
    config: {
      // Header
      showLogo: true,
      customHeaderText: 'Thank you for your purchase!',
      
      // Item Display
      showItemName: true,
      showItemQuantity: true,
      showItemPrice: true,
      showItemDiscount: true,
      showItemTax: true,
      itemColumnAlignment: 'left',
      itemSpacing: 'spacious',
      
      // Totals
      showSubtotal: true,
      showTaxBreakdown: true,
      showDiscountTotal: true,
      showGrandTotal: true,
      
      // Footer
      customFooterText: 'Please come again!',
      showBarcode: true,
      showQRCode: true,
      
      // Layout
      headerFontSize: 16,
      itemFontSize: 13,
      totalFontSize: 14,
      footerFontSize: 12,
      lineSpacing: 'relaxed',
      sectionSpacing: 15,
      marginTop: 8,
      marginBottom: 8,
      marginLeft: 8,
      marginRight: 8
    }
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Ultra-compact layout for quick transactions',
    config: {
      // Header
      showLogo: false,
      customHeaderText: '',
      
      // Item Display
      showItemName: true,
      showItemQuantity: true,
      showItemPrice: true,
      showItemDiscount: false,
      showItemTax: false,
      itemColumnAlignment: 'left',
      itemSpacing: 'compact',
      
      // Totals
      showSubtotal: false,
      showTaxBreakdown: false,
      showDiscountTotal: false,
      showGrandTotal: true,
      
      // Footer
      customFooterText: '',
      showBarcode: false,
      showQRCode: false,
      
      // Layout
      headerFontSize: 11,
      itemFontSize: 9,
      totalFontSize: 10,
      footerFontSize: 8,
      lineSpacing: 'compact',
      sectionSpacing: 3,
      marginTop: 2,
      marginBottom: 2,
      marginLeft: 2,
      marginRight: 2
    }
  }
]

/**
 * Get template by ID
 */
export function getTemplate(id: string): ReceiptTemplate | undefined {
  return RECEIPT_TEMPLATES.find(t => t.id === id)
}

/**
 * Apply template to current settings
 */
export function applyTemplate(
  currentSettings: ReceiptSettings,
  templateId: string
): ReceiptSettings {
  const template = getTemplate(templateId)
  if (!template) return currentSettings

  return {
    ...currentSettings,
    ...template.config,
    activeTemplate: templateId as any
  }
}

/**
 * Paper size presets
 */
export const PAPER_SIZES = {
  thermal: [
    { value: '58mm', label: '58mm (2.28")', widthMm: 58, heightMm: 0 },
    { value: '80mm', label: '80mm (3.15")', widthMm: 80, heightMm: 0 },
    { value: '110mm', label: '110mm (4.33")', widthMm: 110, heightMm: 0 }
  ],
  standard: [
    { value: 'A4', label: 'A4 (210 × 297mm)', widthMm: 210, heightMm: 297 },
    { value: 'Letter', label: 'Letter (8.5" × 11")', widthMm: 215.9, heightMm: 279.4 }
  ]
}

/**
 * Font families suitable for thermal printers
 */
export const FONT_FAMILIES = [
  { value: 'monospace', label: 'Monospace (Recommended for thermal)' },
  { value: 'sans-serif', label: 'Sans-serif' },
  { value: 'serif', label: 'Serif' }
]

