import { useState } from 'react'
import { useAppStore } from '../../../stores'
import { FormSection, Toggle, TouchSelect } from '../../forms'
import { 
  ReceiptTemplateType, 
  ReceiptTemplateConfig,
  DEFAULT_TEMPLATE_CONFIGS,
  TEMPLATE_METADATA
} from './ReceiptTemplateTypes'
import { ChevronDown, ChevronUp } from 'lucide-react'

/**
 * Receipt Template Manager Component
 * 
 * Manages configuration for 5 receipt template types with collapsible UI
 */

interface ReceiptTemplateManagerProps {
  templates: Record<ReceiptTemplateType, ReceiptTemplateConfig>
  onTemplateUpdate: (type: ReceiptTemplateType, config: Partial<ReceiptTemplateConfig>) => void
}

export function ReceiptTemplateManager({ templates, onTemplateUpdate }: ReceiptTemplateManagerProps) {
  const { theme } = useAppStore()
  const [expandedTemplate, setExpandedTemplate] = useState<ReceiptTemplateType | null>(null)

  const toggleTemplate = (type: ReceiptTemplateType) => {
    setExpandedTemplate(expandedTemplate === type ? null : type)
  }

  const renderTemplateCard = (type: ReceiptTemplateType) => {
    const template = templates[type]
    const metadata = TEMPLATE_METADATA[type]
    const isExpanded = expandedTemplate === type

    return (
      <div
        key={type}
        className={`rounded-lg border-2 transition-all ${
          theme === 'dark'
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
        }`}
      >
        {/* Template Header */}
        <button
          onClick={() => toggleTemplate(type)}
          className={`w-full p-4 flex items-center justify-between transition-colors ${
            theme === 'dark'
              ? 'hover:bg-gray-700'
              : 'hover:bg-gray-50'
          }`}
          style={{ minHeight: '44px' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{metadata.icon}</span>
            <div className="text-left">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {template.name}
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {template.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Toggle
              checked={template.enabled}
              onChange={(checked) => onTemplateUpdate(type, { enabled: checked })}
              label=""
              onClick={(e) => e.stopPropagation()}
            />
            {isExpanded ? (
              <ChevronUp className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
            ) : (
              <ChevronDown className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
            )}
          </div>
        </button>

        {/* Template Configuration (Collapsible) */}
        {isExpanded && (
          <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="space-y-6">
              {/* Header Configuration */}
              <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Header Configuration
                </h4>
                <div className="space-y-3">
                  <Toggle
                    checked={template.header.showLogo}
                    onChange={(checked) => onTemplateUpdate(type, {
                      header: { ...template.header, showLogo: checked }
                    })}
                    label="Show Logo"
                    description="Display business logo"
                  />
                  <Toggle
                    checked={template.header.showBusinessName}
                    onChange={(checked) => onTemplateUpdate(type, {
                      header: { ...template.header, showBusinessName: checked }
                    })}
                    label="Show Business Name"
                    description="Display business name"
                  />
                  <Toggle
                    checked={template.header.showBusinessAddress}
                    onChange={(checked) => onTemplateUpdate(type, {
                      header: { ...template.header, showBusinessAddress: checked }
                    })}
                    label="Show Business Address"
                    description="Display business address"
                  />
                  <Toggle
                    checked={template.header.showBusinessPhone}
                    onChange={(checked) => onTemplateUpdate(type, {
                      header: { ...template.header, showBusinessPhone: checked }
                    })}
                    label="Show Business Phone"
                    description="Display phone number"
                  />
                  <Toggle
                    checked={template.header.showBusinessEmail}
                    onChange={(checked) => onTemplateUpdate(type, {
                      header: { ...template.header, showBusinessEmail: checked }
                    })}
                    label="Show Business Email"
                    description="Display email address"
                  />
                  <Toggle
                    checked={template.header.showTaxId}
                    onChange={(checked) => onTemplateUpdate(type, {
                      header: { ...template.header, showTaxId: checked }
                    })}
                    label="Show Tax ID"
                    description="Display tax identification number"
                  />
                  <TouchSelect
                    label="Header Alignment"
                    value={template.header.alignment}
                    onChange={(value) => onTemplateUpdate(type, {
                      header: { ...template.header, alignment: value as 'left' | 'center' | 'right' }
                    })}
                    options={[
                      { value: 'left', label: 'Left' },
                      { value: 'center', label: 'Center' },
                      { value: 'right', label: 'Right' }
                    ]}
                  />
                </div>
              </div>

              {/* Body Configuration */}
              <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Body Configuration
                </h4>
                <div className="space-y-3">
                  {/* Order/Invoice specific options */}
                  {(type === 'order_receipt' || type === 'invoice' || type === 'order_park') && (
                    <>
                      <Toggle
                        checked={template.body.showItemDetails}
                        onChange={(checked) => onTemplateUpdate(type, {
                          body: { ...template.body, showItemDetails: checked }
                        })}
                        label="Show Item Details"
                        description="Display detailed item information"
                      />
                      <Toggle
                        checked={template.body.showQuantity}
                        onChange={(checked) => onTemplateUpdate(type, {
                          body: { ...template.body, showQuantity: checked }
                        })}
                        label="Show Quantity"
                        description="Display item quantities"
                      />
                      <Toggle
                        checked={template.body.showUnitPrice}
                        onChange={(checked) => onTemplateUpdate(type, {
                          body: { ...template.body, showUnitPrice: checked }
                        })}
                        label="Show Unit Price"
                        description="Display price per unit"
                      />
                      <Toggle
                        checked={template.body.showItemDiscount}
                        onChange={(checked) => onTemplateUpdate(type, {
                          body: { ...template.body, showItemDiscount: checked }
                        })}
                        label="Show Item Discount"
                        description="Display item-level discounts"
                      />
                      <Toggle
                        checked={template.body.showItemTax}
                        onChange={(checked) => onTemplateUpdate(type, {
                          body: { ...template.body, showItemTax: checked }
                        })}
                        label="Show Item Tax"
                        description="Display tax per item"
                      />
                    </>
                  )}

                  {/* POS Session specific options */}
                  {(type === 'pos_opening' || type === 'pos_closing') && (
                    <>
                      <Toggle
                        checked={template.body.showDenominations}
                        onChange={(checked) => onTemplateUpdate(type, {
                          body: { ...template.body, showDenominations: checked }
                        })}
                        label="Show Denominations"
                        description="Display cash denomination breakdown"
                      />
                      <Toggle
                        checked={template.body.showCashBreakdown}
                        onChange={(checked) => onTemplateUpdate(type, {
                          body: { ...template.body, showCashBreakdown: checked }
                        })}
                        label="Show Cash Breakdown"
                        description="Display detailed cash breakdown"
                      />
                      {type === 'pos_closing' && (
                        <>
                          <Toggle
                            checked={template.body.showPaymentSummary}
                            onChange={(checked) => onTemplateUpdate(type, {
                              body: { ...template.body, showPaymentSummary: checked }
                            })}
                            label="Show Payment Summary"
                            description="Display payment method summary"
                          />
                          <Toggle
                            checked={template.body.showTransactionCount}
                            onChange={(checked) => onTemplateUpdate(type, {
                              body: { ...template.body, showTransactionCount: checked }
                            })}
                            label="Show Transaction Count"
                            description="Display total transaction count"
                          />
                        </>
                      )}
                    </>
                  )}

                  {/* Parked order specific options */}
                  {type === 'order_park' && (
                    <>
                      <Toggle
                        checked={template.body.showParkTime}
                        onChange={(checked) => onTemplateUpdate(type, {
                          body: { ...template.body, showParkTime: checked }
                        })}
                        label="Show Park Time"
                        description="Display when order was parked"
                      />
                      <Toggle
                        checked={template.body.showParkNotes}
                        onChange={(checked) => onTemplateUpdate(type, {
                          body: { ...template.body, showParkNotes: checked }
                        })}
                        label="Show Park Notes"
                        description="Display notes about parked order"
                      />
                      <Toggle
                        checked={template.body.showCustomerInfo}
                        onChange={(checked) => onTemplateUpdate(type, {
                          body: { ...template.body, showCustomerInfo: checked }
                        })}
                        label="Show Customer Info"
                        description="Display customer information"
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Totals Configuration */}
              <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Totals Configuration
                </h4>
                <div className="space-y-3">
                  {(type === 'order_receipt' || type === 'invoice' || type === 'order_park') && (
                    <>
                      <Toggle
                        checked={template.totals.showSubtotal}
                        onChange={(checked) => onTemplateUpdate(type, {
                          totals: { ...template.totals, showSubtotal: checked }
                        })}
                        label="Show Subtotal"
                        description="Display subtotal amount"
                      />
                      <Toggle
                        checked={template.totals.showTax}
                        onChange={(checked) => onTemplateUpdate(type, {
                          totals: { ...template.totals, showTax: checked }
                        })}
                        label="Show Tax"
                        description="Display tax amount"
                      />
                      <Toggle
                        checked={template.totals.showDiscount}
                        onChange={(checked) => onTemplateUpdate(type, {
                          totals: { ...template.totals, showDiscount: checked }
                        })}
                        label="Show Discount"
                        description="Display discount amount"
                      />
                      <Toggle
                        checked={template.totals.showGrandTotal}
                        onChange={(checked) => onTemplateUpdate(type, {
                          totals: { ...template.totals, showGrandTotal: checked }
                        })}
                        label="Show Grand Total"
                        description="Display final total"
                      />
                    </>
                  )}

                  {type === 'order_receipt' && (
                    <>
                      <Toggle
                        checked={template.totals.showAmountPaid}
                        onChange={(checked) => onTemplateUpdate(type, {
                          totals: { ...template.totals, showAmountPaid: checked }
                        })}
                        label="Show Amount Paid"
                        description="Display amount paid"
                      />
                      <Toggle
                        checked={template.totals.showChange}
                        onChange={(checked) => onTemplateUpdate(type, {
                          totals: { ...template.totals, showChange: checked }
                        })}
                        label="Show Change"
                        description="Display change given"
                      />
                    </>
                  )}

                  {type === 'pos_closing' && (
                    <>
                      <Toggle
                        checked={template.totals.showExpectedCash}
                        onChange={(checked) => onTemplateUpdate(type, {
                          totals: { ...template.totals, showExpectedCash: checked }
                        })}
                        label="Show Expected Cash"
                        description="Display expected cash amount"
                      />
                      <Toggle
                        checked={template.totals.showActualCash}
                        onChange={(checked) => onTemplateUpdate(type, {
                          totals: { ...template.totals, showActualCash: checked }
                        })}
                        label="Show Actual Cash"
                        description="Display actual cash counted"
                      />
                      <Toggle
                        checked={template.totals.showVariance}
                        onChange={(checked) => onTemplateUpdate(type, {
                          totals: { ...template.totals, showVariance: checked }
                        })}
                        label="Show Variance"
                        description="Display cash variance"
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Footer Configuration */}
              <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Footer Configuration
                </h4>
                <div className="space-y-3">
                  <Toggle
                    checked={template.footer.showThankYouMessage}
                    onChange={(checked) => onTemplateUpdate(type, {
                      footer: { ...template.footer, showThankYouMessage: checked }
                    })}
                    label="Show Thank You Message"
                    description="Display thank you message"
                  />
                  <Toggle
                    checked={template.footer.showReturnPolicy}
                    onChange={(checked) => onTemplateUpdate(type, {
                      footer: { ...template.footer, showReturnPolicy: checked }
                    })}
                    label="Show Return Policy"
                    description="Display return policy"
                  />
                  <Toggle
                    checked={template.footer.showPromoMessage}
                    onChange={(checked) => onTemplateUpdate(type, {
                      footer: { ...template.footer, showPromoMessage: checked }
                    })}
                    label="Show Promotional Message"
                    description="Display promotional message"
                  />
                  <Toggle
                    checked={template.footer.showBarcode}
                    onChange={(checked) => onTemplateUpdate(type, {
                      footer: { ...template.footer, showBarcode: checked }
                    })}
                    label="Show Barcode"
                    description="Display barcode"
                  />
                  <Toggle
                    checked={template.footer.showQRCode}
                    onChange={(checked) => onTemplateUpdate(type, {
                      footer: { ...template.footer, showQRCode: checked }
                    })}
                    label="Show QR Code"
                    description="Display QR code"
                  />
                  <TouchSelect
                    label="Footer Alignment"
                    value={template.footer.alignment}
                    onChange={(value) => onTemplateUpdate(type, {
                      footer: { ...template.footer, alignment: value as 'left' | 'center' | 'right' }
                    })}
                    options={[
                      { value: 'left', label: 'Left' },
                      { value: 'center', label: 'Center' },
                      { value: 'right', label: 'Right' }
                    ]}
                  />
                </div>
              </div>

              {/* Print Settings */}
              <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Print Settings
                </h4>
                <div className="space-y-3">
                  <Toggle
                    checked={template.print.autoPrint}
                    onChange={(checked) => onTemplateUpdate(type, {
                      print: { ...template.print, autoPrint: checked }
                    })}
                    label="Auto Print"
                    description="Automatically print this receipt"
                  />
                  <TouchSelect
                    label="Paper Size"
                    value={template.print.paperSize}
                    onChange={(value) => onTemplateUpdate(type, {
                      print: { ...template.print, paperSize: value as any }
                    })}
                    options={[
                      { value: '58mm', label: '58mm (Thermal)' },
                      { value: '80mm', label: '80mm (Thermal)' },
                      { value: '110mm', label: '110mm (Thermal)' },
                      { value: 'A4', label: 'A4 (Standard)' },
                      { value: 'Letter', label: 'Letter (Standard)' }
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg border-2 ${theme === 'dark' ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
        <h4 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-900'}`}>
          📋 Receipt Template Management
        </h4>
        <p className={`text-xs ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`}>
          Configure different receipt templates for various scenarios. Click on a template to expand and customize its settings.
        </p>
      </div>

      {/* Template Cards */}
      {Object.keys(DEFAULT_TEMPLATE_CONFIGS).map((type) => 
        renderTemplateCard(type as ReceiptTemplateType)
      )}
    </div>
  )
}
