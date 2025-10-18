import { useState } from 'react'
import { useAppStore, useSettingsStore } from '../../stores'
import { Toggle, Input } from '../common'
import { FormSection, Select } from '../forms'
import { TextArea } from '../forms/TextArea'
import { ReceiptPreview } from './receipt/ReceiptPreview'
import { TemplatePanel } from './receipt/TemplatePanel'
import { PaperSizePanel } from './receipt/PaperSizePanel'
import { FontConfigPanel } from './receipt/FontConfigPanel'

/**
 * Comprehensive Receipt Configuration Panel
 *
 * Features:
 * - Receipt Templates (Standard, Compact, Detailed, Minimal, Custom)
 * - Paper Size Configuration (Thermal, Standard, Custom)
 * - Live Preview with zoom controls
 * - Font Configuration (family, size, weight, spacing)
 * - Perfect rendering with accurate text wrapping
 * - Receipt Header, Body, Footer customization
 * - Print Behavior settings
 */
export function ReceiptsPanel() {
  const { theme } = useAppStore()
  const { receipts, updateReceiptSettings } = useSettingsStore()
  const [showPreview, setShowPreview] = useState(true)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Receipt Configuration
            </h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Customize receipt design, templates, and printing options with live preview
            </p>
          </div>
        </div>
      </div>

      {/* Main Layout: Settings + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Column */}
        <div className="space-y-6">
          {/* Template Selection */}
          <TemplatePanel />

          {/* Paper Size Configuration */}
          <PaperSizePanel />

          {/* Font Configuration */}
          <FontConfigPanel />

          {/* Receipt Header Configuration */}
          <FormSection
            title="Receipt Header"
            description="Configure business information and header content"
          >
            <div className="space-y-4">
              <Toggle
                checked={receipts.showLogo}
                onChange={(checked) => updateReceiptSettings({ showLogo: checked })}
                label="Show Business Logo"
                description="Display logo at the top of receipts"
              />

              {receipts.showLogo && (
                <Input
                  type="text"
                  label="Logo URL/Path"
                  value={receipts.logoUrl}
                  onChange={(e) => updateReceiptSettings({ logoUrl: e.target.value })}
                  placeholder="Enter logo file path or URL"
                  helperText="Path to logo image file"
                />
              )}

              <Input
                type="text"
                label="Business Name"
                value={receipts.businessName}
                onChange={(e) => updateReceiptSettings({ businessName: e.target.value })}
                placeholder="Your Business Name"
                helperText="Displayed prominently on receipt"
              />

              <Input
                type="text"
                label="Business Address"
                value={receipts.businessAddress}
                onChange={(e) => updateReceiptSettings({ businessAddress: e.target.value })}
                placeholder="123 Main St, City, State ZIP"
                helperText="Full business address"
              />

              <Input
                type="text"
                label="Business Phone"
                value={receipts.businessPhone}
                onChange={(e) => updateReceiptSettings({ businessPhone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                helperText="Contact phone number"
              />

              <Input
                type="text"
                label="Business Email"
                value={receipts.businessEmail}
                onChange={(e) => updateReceiptSettings({ businessEmail: e.target.value })}
                placeholder="contact@business.com"
                helperText="Contact email address"
              />

              <Input
                type="text"
                label="Tax ID / GST Number"
                value={receipts.taxId}
                onChange={(e) => updateReceiptSettings({ taxId: e.target.value })}
                placeholder="Tax ID or GST registration number"
                helperText="Business tax identification number"
              />

              <TextArea
                label="Custom Header Text"
                value={receipts.customHeaderText}
                onChange={(e) => updateReceiptSettings({ customHeaderText: e.target.value })}
                placeholder="Thank you for your purchase!"
                rows={2}
                helperText="Additional text displayed in header"
              />
            </div>
          </FormSection>

          {/* Receipt Body Configuration */}
          <FormSection
            title="Receipt Body - Item Display"
            description="Configure how items are displayed on receipts"
          >
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border-2 ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Item Information
                </h4>
                <div className="space-y-4">
                  <Toggle
                    checked={receipts.showItemName}
                    onChange={(checked) => updateReceiptSettings({ showItemName: checked })}
                    label="Show Item Name"
                    description="Display product/item names"
                  />

                  <Toggle
                    checked={receipts.showItemQuantity}
                    onChange={(checked) => updateReceiptSettings({ showItemQuantity: checked })}
                    label="Show Quantity"
                    description="Display item quantities"
                  />

                  <Toggle
                    checked={receipts.showItemPrice}
                    onChange={(checked) => updateReceiptSettings({ showItemPrice: checked })}
                    label="Show Unit Price"
                    description="Display price per unit"
                  />

                  <Toggle
                    checked={receipts.showItemDiscount}
                    onChange={(checked) => updateReceiptSettings({ showItemDiscount: checked })}
                    label="Show Discounts"
                    description="Display item-level discounts"
                  />

                  <Toggle
                    checked={receipts.showItemTax}
                    onChange={(checked) => updateReceiptSettings({ showItemTax: checked })}
                    label="Show Tax per Item"
                    description="Display tax amount for each item"
                  />
                </div>
              </div>

              <Select
                label="Column Alignment"
                value={receipts.itemColumnAlignment}
                onChange={(e) => updateReceiptSettings({ itemColumnAlignment: e.target.value as 'left' | 'center' | 'right' })}
                options={[
                  { value: 'left', label: 'Left Aligned' },
                  { value: 'center', label: 'Center Aligned' },
                  { value: 'right', label: 'Right Aligned' }
                ]}
                helperText="Text alignment for item columns"
              />

              <Select
                label="Item Spacing"
                value={receipts.itemSpacing}
                onChange={(e) => updateReceiptSettings({ itemSpacing: e.target.value as 'compact' | 'normal' | 'spacious' })}
                options={[
                  { value: 'compact', label: 'Compact (Save Paper)' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'spacious', label: 'Spacious (More Readable)' }
                ]}
                helperText="Spacing between items"
              />
            </div>
          </FormSection>

          {/* Receipt Totals Configuration */}
          <FormSection
            title="Receipt Body - Totals & Summary"
            description="Configure total amounts and summary display"
          >
            <div className="space-y-4">
              <Toggle
                checked={receipts.showSubtotal}
                onChange={(checked) => updateReceiptSettings({ showSubtotal: checked })}
                label="Show Subtotal"
                description="Display subtotal before tax and discounts"
              />

              <Toggle
                checked={receipts.showTaxBreakdown}
                onChange={(checked) => updateReceiptSettings({ showTaxBreakdown: checked })}
                label="Show Tax Breakdown"
                description="Display detailed tax calculation"
              />

              <Toggle
                checked={receipts.showDiscountTotal}
                onChange={(checked) => updateReceiptSettings({ showDiscountTotal: checked })}
                label="Show Total Discount"
                description="Display total discount amount"
              />

              <Toggle
                checked={receipts.showGrandTotal}
                onChange={(checked) => updateReceiptSettings({ showGrandTotal: checked })}
                label="Show Grand Total"
                description="Display final total amount (always recommended)"
              />
            </div>
          </FormSection>

          {/* Receipt Footer Configuration */}
          <FormSection
            title="Receipt Footer"
            description="Configure footer content and additional information"
          >
            <div className="space-y-4">
              <TextArea
                label="Custom Footer Text"
                value={receipts.customFooterText}
                onChange={(e) => updateReceiptSettings({ customFooterText: e.target.value })}
                placeholder="Please come again!"
                rows={2}
                helperText="Thank you message or closing text"
              />

              <TextArea
                label="Return Policy"
                value={receipts.returnPolicy}
                onChange={(e) => updateReceiptSettings({ returnPolicy: e.target.value })}
                placeholder="Returns accepted within 30 days with receipt"
                rows={3}
                helperText="Store return/exchange policy"
              />

              <TextArea
                label="Promotional Message"
                value={receipts.promotionalMessage}
                onChange={(e) => updateReceiptSettings({ promotionalMessage: e.target.value })}
                placeholder="Follow us on social media for exclusive deals!"
                rows={2}
                helperText="Marketing or promotional text"
              />

              <Toggle
                checked={receipts.showBarcode}
                onChange={(checked) => updateReceiptSettings({ showBarcode: checked })}
                label="Show Barcode"
                description="Display barcode for receipt lookup"
              />

              <Toggle
                checked={receipts.showQRCode}
                onChange={(checked) => updateReceiptSettings({ showQRCode: checked })}
                label="Show QR Code"
                description="Display QR code for digital receipt or feedback"
              />

              {receipts.showQRCode && (
                <Select
                  label="QR Code Content"
                  value={receipts.qrCodeContent}
                  onChange={(e) => updateReceiptSettings({ qrCodeContent: e.target.value as 'receipt_id' | 'receipt_url' | 'custom' })}
                  options={[
                    { value: 'receipt_id', label: 'Receipt ID' },
                    { value: 'receipt_url', label: 'Receipt URL (Online Lookup)' },
                    { value: 'custom', label: 'Custom URL' }
                  ]}
                  helperText="What the QR code should contain"
                />
              )}
            </div>
          </FormSection>

          {/* Layout & Spacing */}
          <FormSection
            title="Layout & Spacing"
            description="Configure margins and section spacing"
          >
            <div className="space-y-4">
              <Select
                label="Line Spacing"
                value={receipts.lineSpacing}
                onChange={(e) => updateReceiptSettings({ lineSpacing: e.target.value as 'compact' | 'normal' | 'relaxed' })}
                options={[
                  { value: 'compact', label: 'Compact' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'relaxed', label: 'Relaxed' }
                ]}
                helperText="Space between lines"
              />

              <Input
                type="number"
                label="Section Spacing (px)"
                value={receipts.sectionSpacing.toString()}
                onChange={(e) => updateReceiptSettings({ sectionSpacing: parseInt(e.target.value) || 10 })}
                placeholder="10"
                helperText="Space between receipt sections"
                min={0}
                max={30}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  label="Top Margin (mm)"
                  value={receipts.marginTop.toString()}
                  onChange={(e) => updateReceiptSettings({ marginTop: parseInt(e.target.value) || 0 })}
                  placeholder="5"
                  min={0}
                  max={20}
                />

                <Input
                  type="number"
                  label="Bottom Margin (mm)"
                  value={receipts.marginBottom.toString()}
                  onChange={(e) => updateReceiptSettings({ marginBottom: parseInt(e.target.value) || 0 })}
                  placeholder="5"
                  min={0}
                  max={20}
                />

                <Input
                  type="number"
                  label="Left Margin (mm)"
                  value={receipts.marginLeft.toString()}
                  onChange={(e) => updateReceiptSettings({ marginLeft: parseInt(e.target.value) || 0 })}
                  placeholder="5"
                  min={0}
                  max={20}
                />

                <Input
                  type="number"
                  label="Right Margin (mm)"
                  value={receipts.marginRight.toString()}
                  onChange={(e) => updateReceiptSettings({ marginRight: parseInt(e.target.value) || 0 })}
                  placeholder="5"
                  min={0}
                  max={20}
                />
              </div>
            </div>
          </FormSection>

          {/* Print Behavior */}
          <FormSection
            title="Print Behavior"
            description="Configure automatic printing and copy settings"
          >
            <div className="space-y-4">
              <Toggle
                checked={receipts.autoPrint}
                onChange={(checked) => updateReceiptSettings({ autoPrint: checked })}
                label="Auto-Print on Sale Completion"
                description="Automatically print receipt when sale is completed"
              />

              <Input
                type="number"
                label="Number of Copies"
                value={receipts.numberOfCopies.toString()}
                onChange={(e) => updateReceiptSettings({ numberOfCopies: parseInt(e.target.value) || 1 })}
                placeholder="1"
                helperText="How many receipt copies to print"
                min={1}
                max={5}
              />

              <Toggle
                checked={receipts.printKitchenReceipt}
                onChange={(checked) => updateReceiptSettings({ printKitchenReceipt: checked })}
                label="Print Kitchen Receipt"
                description="Print order to kitchen printer (for restaurants)"
              />

              <Toggle
                checked={receipts.printCustomerCopy}
                onChange={(checked) => updateReceiptSettings({ printCustomerCopy: checked })}
                label="Print Customer Copy"
                description="Print receipt for customer"
              />

              <Toggle
                checked={receipts.printMerchantCopy}
                onChange={(checked) => updateReceiptSettings({ printMerchantCopy: checked })}
                label="Print Merchant Copy"
                description="Print receipt copy for store records"
              />
            </div>
          </FormSection>
        </div>

        {/* Preview Column */}
        {showPreview && (
          <div className="lg:sticky lg:top-6 lg:self-start">
            <ReceiptPreview settings={receipts} />
          </div>
        )}
      </div>
    </div>
  )
}

