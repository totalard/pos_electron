import { useAppStore, useSettingsStore } from '../../../stores'
import { Input } from '../../common'
import { FormSection, Select, NumberInput } from '../../forms'
import { PAPER_SIZES } from './ReceiptTemplates'

/**
 * Paper Size Configuration Panel
 * 
 * Supports thermal printer paper widths and standard paper sizes
 */
export function PaperSizePanel() {
  const { theme } = useAppStore()
  const { receipts, updateReceiptSettings } = useSettingsStore()

  const handlePaperTypeChange = (type: 'thermal' | 'standard' | 'custom') => {
    updateReceiptSettings({ 
      paperType: type,
      paperWidth: type === 'thermal' ? '80mm' : type === 'standard' ? 'A4' : 'custom',
      paperHeight: type === 'thermal' ? 'continuous' : type === 'standard' ? 'A4' : 'custom'
    })
  }

  const handlePaperWidthChange = (width: string) => {
    const preset = [...PAPER_SIZES.thermal, ...PAPER_SIZES.standard].find(p => p.value === width)
    if (preset) {
      updateReceiptSettings({
        paperWidth: width as any,
        customPaperWidth: preset.widthMm,
        customPaperHeight: preset.heightMm
      })
    } else {
      updateReceiptSettings({ paperWidth: width as any })
    }
  }

  return (
    <FormSection
      title="Paper Size Configuration"
      description="Configure paper dimensions for receipt printing"
    >
      <div className="space-y-4">
        {/* Paper Type */}
        <Select
          label="Paper Type"
          value={receipts.paperType}
          onChange={(e) => handlePaperTypeChange(e.target.value as any)}
          options={[
            { value: 'thermal', label: 'Thermal Printer (Continuous)' },
            { value: 'standard', label: 'Standard Paper (A4/Letter)' },
            { value: 'custom', label: 'Custom Dimensions' }
          ]}
          helperText="Select the type of paper used for printing"
        />

        {/* Thermal Paper Widths */}
        {receipts.paperType === 'thermal' && (
          <Select
            label="Thermal Paper Width"
            value={receipts.paperWidth}
            onChange={(e) => handlePaperWidthChange(e.target.value)}
            options={PAPER_SIZES.thermal.map(size => ({
              value: size.value,
              label: size.label
            }))}
            helperText="Common thermal printer paper widths"
          />
        )}

        {/* Standard Paper Sizes */}
        {receipts.paperType === 'standard' && (
          <>
            <Select
              label="Paper Size"
              value={receipts.paperWidth}
              onChange={(e) => handlePaperWidthChange(e.target.value)}
              options={PAPER_SIZES.standard.map(size => ({
                value: size.value,
                label: size.label
              }))}
              helperText="Standard paper sizes for laser/inkjet printers"
            />
          </>
        )}

        {/* Custom Dimensions */}
        {receipts.paperType === 'custom' && (
          <>
            <Select
              label="Measurement Unit"
              value={receipts.paperUnit}
              onChange={(e) => updateReceiptSettings({ paperUnit: e.target.value as 'mm' | 'inches' })}
              options={[
                { value: 'mm', label: 'Millimeters (mm)' },
                { value: 'inches', label: 'Inches (in)' }
              ]}
              helperText="Unit of measurement for custom dimensions"
            />

            <div className="grid grid-cols-2 gap-4">
              <NumberInput
                label="Paper Width"
                value={receipts.customPaperWidth}
                onChange={(value) => updateReceiptSettings({ customPaperWidth: value })}
                min={10}
                max={1000}
                step={0.1}
                allowDecimal
                decimalPlaces={1}
                showButtons
                helperText={`Width in ${receipts.paperUnit}`}
              />

              <NumberInput
                label="Paper Height"
                value={receipts.customPaperHeight}
                onChange={(value) => updateReceiptSettings({ customPaperHeight: value })}
                min={0}
                max={1000}
                step={0.1}
                allowDecimal
                decimalPlaces={1}
                showButtons
                helperText={`Height in ${receipts.paperUnit} (0 for continuous)`}
              />
            </div>
          </>
        )}

        {/* Preview Info */}
        <div className={`p-4 rounded-lg border-2 ${theme === 'dark' ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
          <h4 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-900'}`}>
            Current Configuration
          </h4>
          <div className={`text-xs space-y-1 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`}>
            <div>Type: {receipts.paperType === 'thermal' ? 'Thermal (Continuous)' : receipts.paperType === 'standard' ? 'Standard Paper' : 'Custom'}</div>
            <div>
              Dimensions: {receipts.paperWidth === 'custom' 
                ? `${receipts.customPaperWidth}${receipts.paperUnit} × ${receipts.customPaperHeight === 0 ? 'continuous' : `${receipts.customPaperHeight}${receipts.paperUnit}`}`
                : receipts.paperWidth
              }
            </div>
          </div>
        </div>
      </div>
    </FormSection>
  )
}

