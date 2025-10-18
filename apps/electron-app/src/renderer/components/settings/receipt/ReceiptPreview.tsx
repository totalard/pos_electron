import { useState } from 'react'
import { useAppStore } from '../../../stores'
import { ReceiptSettings } from '../../../stores/settingsStore'
import { IconButton } from '../../common'

/**
 * Live Receipt Preview Component
 * 
 * Displays a real-time visual preview of the receipt with sample data
 * Updates immediately when settings change
 */

interface ReceiptPreviewProps {
  settings: ReceiptSettings
}

// Sample transaction data for preview
const SAMPLE_DATA = {
  receiptNumber: 'RCP-2024-001234',
  date: new Date().toLocaleDateString(),
  time: new Date().toLocaleTimeString(),
  cashier: 'John Doe',
  items: [
    { name: 'Coffee - Large', quantity: 2, price: 4.50, discount: 0, tax: 0.45 },
    { name: 'Croissant', quantity: 1, price: 3.00, discount: 0.30, tax: 0.27 },
    { name: 'Orange Juice', quantity: 1, price: 3.50, discount: 0, tax: 0.35 }
  ],
  subtotal: 14.50,
  discount: 0.30,
  tax: 1.07,
  total: 15.27,
  payment: {
    method: 'Cash',
    amount: 20.00,
    change: 4.73
  }
}

export function ReceiptPreview({ settings }: ReceiptPreviewProps) {
  const { theme } = useAppStore()
  const [zoom, setZoom] = useState(100)

  // Calculate paper width in pixels (assuming 96 DPI)
  const getPaperWidthPx = (): number => {
    if (settings.paperWidth === 'custom') {
      return settings.paperUnit === 'mm' 
        ? (settings.customPaperWidth * 96) / 25.4 
        : settings.customPaperWidth * 96
    }
    
    const widthMap: Record<string, number> = {
      '58mm': 220,
      '80mm': 302,
      '110mm': 416,
      'A4': 794,
      'Letter': 816
    }
    
    return widthMap[settings.paperWidth] || 302
  }

  const paperWidthPx = getPaperWidthPx()
  const scaledWidth = (paperWidthPx * zoom) / 100

  // Get font size based on settings
  const getFontSize = (section: 'header' | 'item' | 'total' | 'footer'): number => {
    const sizeMap = {
      header: settings.headerFontSize,
      item: settings.itemFontSize,
      total: settings.totalFontSize,
      footer: settings.footerFontSize
    }
    return sizeMap[section]
  }

  // Get font weight
  const getFontWeight = (section: 'header' | 'item' | 'total' | 'footer'): string => {
    const weightMap = {
      header: settings.headerFontWeight,
      item: settings.itemFontWeight,
      total: settings.totalFontWeight,
      footer: settings.footerFontWeight
    }
    return weightMap[section]
  }

  // Get line spacing
  const getLineSpacing = (): number => {
    const spacingMap = {
      compact: 1.0,
      normal: 1.2,
      relaxed: 1.5
    }
    return spacingMap[settings.lineSpacing]
  }

  // Text alignment helper
  const getAlignment = (align: string): string => {
    return align === 'left' ? 'text-left' : align === 'center' ? 'text-center' : 'text-right'
  }

  return (
    <div className={`rounded-lg border-2 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      {/* Preview Header with Zoom Controls */}
      <div className={`flex items-center justify-between p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div>
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Live Preview
          </h3>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {settings.paperWidth} • {settings.fontFamily} • {settings.activeTemplate}
          </p>
        </div>
        
        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.max(50, zoom - 10))}
            disabled={zoom <= 50}
            aria-label="Zoom out"
            className={`
              min-w-[44px] min-h-[44px] rounded-lg transition-colors
              ${theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-white disabled:bg-gray-800 disabled:text-gray-600'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-900 disabled:bg-gray-50 disabled:text-gray-400'
              }
            `}
          >
            <span className="text-lg">−</span>
          </button>
          <span className={`text-sm font-medium min-w-[60px] text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {zoom}%
          </span>
          <button
            onClick={() => setZoom(Math.min(200, zoom + 10))}
            disabled={zoom >= 200}
            aria-label="Zoom in"
            className={`
              min-w-[44px] min-h-[44px] rounded-lg transition-colors
              ${theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-white disabled:bg-gray-800 disabled:text-gray-600'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-900 disabled:bg-gray-50 disabled:text-gray-400'
              }
            `}
          >
            <span className="text-lg">+</span>
          </button>
          <button
            onClick={() => setZoom(100)}
            aria-label="Reset zoom"
            className={`
              min-w-[44px] min-h-[44px] rounded-lg transition-colors
              ${theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              }
            `}
          >
            <span className="text-xs">100%</span>
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className={`p-6 overflow-auto ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`} style={{ maxHeight: '600px' }}>
        <div className="flex justify-center">
          <div
            className={`${theme === 'dark' ? 'bg-white' : 'bg-white'} shadow-lg`}
            style={{
              width: `${scaledWidth}px`,
              fontFamily: settings.fontFamily,
              padding: `${settings.marginTop}mm ${settings.marginRight}mm ${settings.marginBottom}mm ${settings.marginLeft}mm`,
              lineHeight: settings.lineHeight
            }}
          >
            {/* Receipt Header */}
            {(settings.showLogo || settings.businessName || settings.customHeaderText) && (
              <div 
                className="text-center"
                style={{ 
                  marginBottom: `${settings.sectionSpacing}px`,
                  fontSize: `${getFontSize('header')}px`,
                  fontWeight: getFontWeight('header')
                }}
              >
                {settings.showLogo && settings.logoUrl && (
                  <div className="mb-2">
                    <div className="w-16 h-16 mx-auto bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                      LOGO
                    </div>
                  </div>
                )}
                {settings.businessName && (
                  <div className="font-bold">{settings.businessName}</div>
                )}
                {settings.businessAddress && (
                  <div className="text-xs mt-1">{settings.businessAddress}</div>
                )}
                {settings.businessPhone && (
                  <div className="text-xs">{settings.businessPhone}</div>
                )}
                {settings.businessEmail && (
                  <div className="text-xs">{settings.businessEmail}</div>
                )}
                {settings.taxId && (
                  <div className="text-xs mt-1">Tax ID: {settings.taxId}</div>
                )}
                {settings.customHeaderText && (
                  <div className="mt-2 text-sm">{settings.customHeaderText}</div>
                )}
              </div>
            )}

            {/* Receipt Info */}
            <div 
              className="border-t border-b border-black py-2 text-xs"
              style={{ marginBottom: `${settings.sectionSpacing}px` }}
            >
              <div className="flex justify-between">
                <span>Receipt: {SAMPLE_DATA.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Date: {SAMPLE_DATA.date}</span>
                <span>Time: {SAMPLE_DATA.time}</span>
              </div>
              <div>Cashier: {SAMPLE_DATA.cashier}</div>
            </div>

            {/* Items */}
            <div 
              style={{ 
                marginBottom: `${settings.sectionSpacing}px`,
                fontSize: `${getFontSize('item')}px`,
                fontWeight: getFontWeight('item')
              }}
            >
              {SAMPLE_DATA.items.map((item, index) => (
                <div key={index} className={`mb-1 ${settings.itemSpacing === 'compact' ? 'mb-0.5' : settings.itemSpacing === 'spacious' ? 'mb-2' : 'mb-1'}`}>
                  {settings.showItemName && (
                    <div className={getAlignment(settings.itemColumnAlignment)}>
                      {item.name}
                    </div>
                  )}
                  <div className="flex justify-between text-xs">
                    <span>
                      {settings.showItemQuantity && `${item.quantity} × `}
                      {settings.showItemPrice && `$${item.price.toFixed(2)}`}
                    </span>
                    <span>${(item.quantity * item.price).toFixed(2)}</span>
                  </div>
                  {settings.showItemDiscount && item.discount > 0 && (
                    <div className="text-xs text-right">Discount: -${item.discount.toFixed(2)}</div>
                  )}
                  {settings.showItemTax && item.tax > 0 && (
                    <div className="text-xs text-right">Tax: ${item.tax.toFixed(2)}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Totals */}
            <div 
              className="border-t border-black pt-2"
              style={{ 
                fontSize: `${getFontSize('total')}px`,
                fontWeight: getFontWeight('total')
              }}
            >
              {settings.showSubtotal && (
                <div className="flex justify-between mb-1">
                  <span>Subtotal:</span>
                  <span>${SAMPLE_DATA.subtotal.toFixed(2)}</span>
                </div>
              )}
              {settings.showDiscountTotal && SAMPLE_DATA.discount > 0 && (
                <div className="flex justify-between mb-1">
                  <span>Discount:</span>
                  <span>-${SAMPLE_DATA.discount.toFixed(2)}</span>
                </div>
              )}
              {settings.showTaxBreakdown && (
                <div className="flex justify-between mb-1">
                  <span>Tax:</span>
                  <span>${SAMPLE_DATA.tax.toFixed(2)}</span>
                </div>
              )}
              {settings.showGrandTotal && (
                <div className="flex justify-between font-bold text-lg border-t border-black pt-1 mt-1">
                  <span>TOTAL:</span>
                  <span>${SAMPLE_DATA.total.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Payment Info */}
            <div className="mt-2 text-xs">
              <div className="flex justify-between">
                <span>Payment ({SAMPLE_DATA.payment.method}):</span>
                <span>${SAMPLE_DATA.payment.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Change:</span>
                <span>${SAMPLE_DATA.payment.change.toFixed(2)}</span>
              </div>
            </div>

            {/* Footer */}
            <div 
              className="text-center mt-4"
              style={{ 
                fontSize: `${getFontSize('footer')}px`,
                fontWeight: getFontWeight('footer'),
                marginTop: `${settings.sectionSpacing}px`
              }}
            >
              {settings.customFooterText && (
                <div className="mb-2">{settings.customFooterText}</div>
              )}
              {settings.returnPolicy && (
                <div className="text-xs mb-2">{settings.returnPolicy}</div>
              )}
              {settings.promotionalMessage && (
                <div className="text-xs mb-2">{settings.promotionalMessage}</div>
              )}
              {settings.showBarcode && (
                <div className="mt-3 mb-2">
                  <div className="h-12 bg-black mx-auto" style={{ width: '80%', backgroundImage: 'repeating-linear-gradient(90deg, black 0px, black 2px, white 2px, white 4px)' }}></div>
                  <div className="text-xs mt-1">{SAMPLE_DATA.receiptNumber}</div>
                </div>
              )}
              {settings.showQRCode && (
                <div className="mt-3">
                  <div className="w-20 h-20 mx-auto bg-black" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Crect width=\'100\' height=\'100\' fill=\'white\'/%3E%3Cpath d=\'M10,10 h20 v20 h-20 z M40,10 h20 v20 h-20 z M70,10 h20 v20 h-20 z M10,40 h20 v20 h-20 z M70,40 h20 v20 h-20 z M10,70 h20 v20 h-20 z M40,70 h20 v20 h-20 z M70,70 h20 v20 h-20 z\' fill=\'black\'/%3E%3C/svg%3E")' }}></div>
                  <div className="text-xs mt-1">Scan for digital receipt</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

