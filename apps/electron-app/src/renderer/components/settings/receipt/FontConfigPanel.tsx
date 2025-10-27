import { useAppStore, useSettingsStore } from '../../../stores'
import { Input } from '../../common'
import { FormSection, Select, NumberInput } from '../../forms'
import { FONT_FAMILIES } from './ReceiptTemplates'

/**
 * Font Configuration Panel
 * 
 * Configure fonts for different receipt sections
 */
export function FontConfigPanel() {
  const { theme } = useAppStore()
  const { receipts, updateReceiptSettings } = useSettingsStore()

  return (
    <FormSection
      title="Font Configuration"
      description="Configure fonts for different sections of the receipt"
    >
      <div className="space-y-4">
        {/* Font Family */}
        <Select
          label="Font Family"
          value={receipts.fontFamily}
          onChange={(e) => updateReceiptSettings({ fontFamily: e.target.value as any })}
          options={FONT_FAMILIES}
          helperText="Monospace is recommended for thermal printers"
        />

        {/* Header Font */}
        <div className={`p-4 rounded-lg border-2 ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Header Font
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <NumberInput
              label="Font Size (px)"
              value={receipts.headerFontSize}
              onChange={(value) => updateReceiptSettings({ headerFontSize: value })}
              min={8}
              max={32}
              step={1}
              showButtons
            />
            <Select
              label="Font Weight"
              value={receipts.headerFontWeight}
              onChange={(e) => updateReceiptSettings({ headerFontWeight: e.target.value as any })}
              options={[
                { value: 'normal', label: 'Normal' },
                { value: 'bold', label: 'Bold' }
              ]}
            />
          </div>
        </div>

        {/* Item Font */}
        <div className={`p-4 rounded-lg border-2 ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Item Font
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <NumberInput
              label="Font Size (px)"
              value={receipts.itemFontSize}
              onChange={(value) => updateReceiptSettings({ itemFontSize: value })}
              min={8}
              max={24}
              step={1}
              showButtons
            />
            <Select
              label="Font Weight"
              value={receipts.itemFontWeight}
              onChange={(e) => updateReceiptSettings({ itemFontWeight: e.target.value as any })}
              options={[
                { value: 'normal', label: 'Normal' },
                { value: 'bold', label: 'Bold' }
              ]}
            />
          </div>
        </div>

        {/* Total Font */}
        <div className={`p-4 rounded-lg border-2 ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Total Font
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <NumberInput
              label="Font Size (px)"
              value={receipts.totalFontSize}
              onChange={(value) => updateReceiptSettings({ totalFontSize: value })}
              min={8}
              max={28}
              step={1}
              showButtons
            />
            <Select
              label="Font Weight"
              value={receipts.totalFontWeight}
              onChange={(e) => updateReceiptSettings({ totalFontWeight: e.target.value as any })}
              options={[
                { value: 'normal', label: 'Normal' },
                { value: 'bold', label: 'Bold' }
              ]}
            />
          </div>
        </div>

        {/* Footer Font */}
        <div className={`p-4 rounded-lg border-2 ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Footer Font
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <NumberInput
              label="Font Size (px)"
              value={receipts.footerFontSize}
              onChange={(value) => updateReceiptSettings({ footerFontSize: value })}
              min={8}
              max={20}
              step={1}
              showButtons
            />
            <Select
              label="Font Weight"
              value={receipts.footerFontWeight}
              onChange={(e) => updateReceiptSettings({ footerFontWeight: e.target.value as any })}
              options={[
                { value: 'normal', label: 'Normal' },
                { value: 'bold', label: 'Bold' }
              ]}
            />
          </div>
        </div>

        {/* Advanced Font Settings */}
        <div className={`p-4 rounded-lg border-2 ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Advanced Settings
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <NumberInput
              label="Character Spacing (px)"
              value={receipts.characterSpacing}
              onChange={(value) => updateReceiptSettings({ characterSpacing: value })}
              min={-2}
              max={5}
              step={0.1}
              allowDecimal
              decimalPlaces={1}
              showButtons
              helperText="Letter spacing for thermal printers"
            />
            <NumberInput
              label="Line Height"
              value={receipts.lineHeight}
              onChange={(value) => updateReceiptSettings({ lineHeight: value })}
              min={0.8}
              max={2.0}
              step={0.1}
              allowDecimal
              decimalPlaces={1}
              showButtons
              helperText="Multiplier for line spacing"
            />
          </div>
        </div>

        {/* Preview */}
        <div className={`p-4 rounded-lg border-2 ${theme === 'dark' ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
          <h4 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-900'}`}>
            Font Preview
          </h4>
          <div className="space-y-2" style={{ fontFamily: receipts.fontFamily }}>
            <div style={{ fontSize: `${receipts.headerFontSize}px`, fontWeight: receipts.headerFontWeight }}>
              Header Text Sample
            </div>
            <div style={{ fontSize: `${receipts.itemFontSize}px`, fontWeight: receipts.itemFontWeight }}>
              Item Text Sample
            </div>
            <div style={{ fontSize: `${receipts.totalFontSize}px`, fontWeight: receipts.totalFontWeight }}>
              Total Text Sample
            </div>
            <div style={{ fontSize: `${receipts.footerFontSize}px`, fontWeight: receipts.footerFontWeight }}>
              Footer Text Sample
            </div>
          </div>
        </div>
      </div>
    </FormSection>
  )
}

