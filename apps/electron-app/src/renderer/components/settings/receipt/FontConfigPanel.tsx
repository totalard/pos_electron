import { useAppStore, useSettingsStore } from '../../../stores'
import { Input } from '../../common'
import { FormSection, Select } from '../../forms'
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
            <Input
              type="number"
              label="Font Size (px)"
              value={receipts.headerFontSize.toString()}
              onChange={(e) => updateReceiptSettings({ headerFontSize: parseInt(e.target.value) || 14 })}
              placeholder="14"
              min={8}
              max={32}
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
            <Input
              type="number"
              label="Font Size (px)"
              value={receipts.itemFontSize.toString()}
              onChange={(e) => updateReceiptSettings({ itemFontSize: parseInt(e.target.value) || 12 })}
              placeholder="12"
              min={8}
              max={24}
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
            <Input
              type="number"
              label="Font Size (px)"
              value={receipts.totalFontSize.toString()}
              onChange={(e) => updateReceiptSettings({ totalFontSize: parseInt(e.target.value) || 13 })}
              placeholder="13"
              min={8}
              max={28}
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
            <Input
              type="number"
              label="Font Size (px)"
              value={receipts.footerFontSize.toString()}
              onChange={(e) => updateReceiptSettings({ footerFontSize: parseInt(e.target.value) || 11 })}
              placeholder="11"
              min={8}
              max={20}
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
            <Input
              type="number"
              label="Character Spacing (px)"
              value={receipts.characterSpacing.toString()}
              onChange={(e) => updateReceiptSettings({ characterSpacing: parseFloat(e.target.value) || 0 })}
              placeholder="0"
              helperText="Letter spacing for thermal printers"
              min={-2}
              max={5}
              step={0.1}
            />
            <Input
              type="number"
              label="Line Height"
              value={receipts.lineHeight.toString()}
              onChange={(e) => updateReceiptSettings({ lineHeight: parseFloat(e.target.value) || 1.2 })}
              placeholder="1.2"
              helperText="Multiplier for line spacing"
              min={0.8}
              max={2.0}
              step={0.1}
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

