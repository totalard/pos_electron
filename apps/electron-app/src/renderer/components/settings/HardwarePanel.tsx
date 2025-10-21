import { useAppStore, useSettingsStore } from '../../stores'
import { FormSection, TouchSelect, Toggle, TextInput } from '../forms'

/**
 * Comprehensive Hardware Configuration Panel
 *
 * Supports configuration for:
 * - Receipt, Kitchen, and Label Printers
 * - Cash Drawer
 * - Barcode Scanner
 * - Customer Display
 * - Scale/Weight Device
 * - Payment Terminal
 */
export function HardwarePanel() {
  const { theme } = useAppStore()
  const { hardware, updateHardwareSettings } = useSettingsStore()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Hardware Configuration
        </h2>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Configure peripheral devices and hardware connections
        </p>
      </div>

      {/* Receipt Printer Configuration */}
      <FormSection
        title="Receipt Printer"
        description="Configure receipt printer settings"
      >
        <div className="space-y-4">
          <Toggle
            checked={hardware.receiptPrinterEnabled}
            onChange={(checked) => updateHardwareSettings({ receiptPrinterEnabled: checked })}
            label="Enable Receipt Printer"
            description="Enable printing of customer receipts"
          />

          {hardware.receiptPrinterEnabled && (
            <>
              <TouchSelect
                label="Connection Type"
                value={hardware.receiptPrinterConnection}
                onChange={(value) => updateHardwareSettings({ receiptPrinterConnection: value as 'USB' | 'Network' | 'COM' })}
                options={[
                  { value: 'USB', label: 'USB' },
                  { value: 'Network', label: 'Network (IP)' },
                  { value: 'COM', label: 'Serial Port (COM)' }
                ]}
                helperText="How the printer is connected to the system"
              />

              <TextInput
                type="text"
                label="Port/Address"
                value={hardware.receiptPrinterPort}
                onChange={(e) => updateHardwareSettings({ receiptPrinterPort: e.target.value })}
                placeholder={hardware.receiptPrinterConnection === 'Network' ? '192.168.1.100' : hardware.receiptPrinterConnection === 'COM' ? 'COM1' : '/dev/usb/lp0'}
                helperText={hardware.receiptPrinterConnection === 'Network' ? 'IP address of the printer' : 'Port name or device path'}
              />

              {hardware.receiptPrinterConnection === 'COM' && (
                <TouchSelect
                  label="Baud Rate"
                  value={hardware.receiptPrinterBaudRate.toString()}
                  onChange={(value) => updateHardwareSettings({ receiptPrinterBaudRate: parseInt(value as string) })}
                  options={[
                    { value: '9600', label: '9600' },
                    { value: '19200', label: '19200' },
                    { value: '38400', label: '38400' },
                    { value: '57600', label: '57600' },
                    { value: '115200', label: '115200' }
                  ]}
                  helperText="Serial communication speed"
                />
              )}

              <TouchSelect
                label="Paper Size"
                value={hardware.receiptPrinterPaperSize}
                onChange={(value) => updateHardwareSettings({ receiptPrinterPaperSize: value as '58mm' | '80mm' })}
                options={[
                  { value: '58mm', label: '58mm (2.25 inches)' },
                  { value: '80mm', label: '80mm (3.15 inches)' }
                ]}
                helperText="Width of the receipt paper"
              />
            </>
          )}
        </div>
      </FormSection>

      {/* Kitchen Printer Configuration */}
      <FormSection
        title="Kitchen Printer"
        description="Configure kitchen order printer (for restaurants)"
      >
        <div className="space-y-4">
          <Toggle
            checked={hardware.kitchenPrinterEnabled}
            onChange={(checked) => updateHardwareSettings({ kitchenPrinterEnabled: checked })}
            label="Enable Kitchen Printer"
            description="Print orders directly to kitchen"
          />

          {hardware.kitchenPrinterEnabled && (
            <>
              <TouchSelect
                label="Connection Type"
                value={hardware.kitchenPrinterConnection}
                onChange={(value) => updateHardwareSettings({ kitchenPrinterConnection: value as 'USB' | 'Network' | 'COM' })}
                options={[
                  { value: 'USB', label: 'USB' },
                  { value: 'Network', label: 'Network (IP)' },
                  { value: 'COM', label: 'Serial Port (COM)' }
                ]}
              />

              <TextInput
                type="text"
                label="Port/Address"
                value={hardware.kitchenPrinterPort}
                onChange={(e) => updateHardwareSettings({ kitchenPrinterPort: e.target.value })}
                placeholder={hardware.kitchenPrinterConnection === 'Network' ? '192.168.1.101' : hardware.kitchenPrinterConnection === 'COM' ? 'COM2' : '/dev/usb/lp1'}
              />

              {hardware.kitchenPrinterConnection === 'COM' && (
                <TouchSelect
                  label="Baud Rate"
                  value={hardware.kitchenPrinterBaudRate.toString()}
                  onChange={(value) => updateHardwareSettings({ kitchenPrinterBaudRate: parseInt(value as string) })}
                  options={[
                    { value: '9600', label: '9600' },
                    { value: '19200', label: '19200' },
                    { value: '38400', label: '38400' },
                    { value: '57600', label: '57600' },
                    { value: '115200', label: '115200' }
                  ]}
                />
              )}
            </>
          )}
        </div>
      </FormSection>

      {/* Label Printer Configuration */}
      <FormSection
        title="Label Printer"
        description="Configure label/barcode printer for product labels"
      >
        <div className="space-y-4">
          <Toggle
            checked={hardware.labelPrinterEnabled}
            onChange={(checked) => updateHardwareSettings({ labelPrinterEnabled: checked })}
            label="Enable Label Printer"
            description="Print product labels and barcodes"
          />

          {hardware.labelPrinterEnabled && (
            <>
              <TouchSelect
                label="Connection Type"
                value={hardware.labelPrinterConnection}
                onChange={(value) => updateHardwareSettings({ labelPrinterConnection: value as 'USB' | 'Network' | 'COM' })}
                options={[
                  { value: 'USB', label: 'USB' },
                  { value: 'Network', label: 'Network (IP)' },
                  { value: 'COM', label: 'Serial Port (COM)' }
                ]}
              />

              <TextInput
                type="text"
                label="Port/Address"
                value={hardware.labelPrinterPort}
                onChange={(e) => updateHardwareSettings({ labelPrinterPort: e.target.value })}
                placeholder={hardware.labelPrinterConnection === 'Network' ? '192.168.1.102' : hardware.labelPrinterConnection === 'COM' ? 'COM3' : '/dev/usb/lp2'}
              />

              {hardware.labelPrinterConnection === 'COM' && (
                <TouchSelect
                  label="Baud Rate"
                  value={hardware.labelPrinterBaudRate.toString()}
                  onChange={(value) => updateHardwareSettings({ labelPrinterBaudRate: parseInt(value as string) })}
                  options={[
                    { value: '9600', label: '9600' },
                    { value: '19200', label: '19200' },
                    { value: '38400', label: '38400' },
                    { value: '57600', label: '57600' },
                    { value: '115200', label: '115200' }
                  ]}
                />
              )}
            </>
          )}
        </div>
      </FormSection>

      {/* Cash Drawer Configuration */}
      <FormSection
        title="Cash Drawer"
        description="Configure cash drawer settings"
      >
        <div className="space-y-4">
          <Toggle
            checked={hardware.cashDrawerEnabled}
            onChange={(checked) => updateHardwareSettings({ cashDrawerEnabled: checked })}
            label="Enable Cash Drawer"
            description="Control cash drawer opening"
          />

          {hardware.cashDrawerEnabled && (
            <>
              <TouchSelect
                label="Connection Type"
                value={hardware.cashDrawerConnection}
                onChange={(value) => updateHardwareSettings({ cashDrawerConnection: value as 'Printer' | 'USB' | 'COM' })}
                options={[
                  { value: 'Printer', label: 'Connected to Printer' },
                  { value: 'USB', label: 'USB' },
                  { value: 'COM', label: 'Serial Port (COM)' }
                ]}
                helperText="How the cash drawer is connected"
              />

              <TouchSelect
                label="Trigger Method"
                value={hardware.cashDrawerTrigger}
                onChange={(value) => updateHardwareSettings({ cashDrawerTrigger: value as 'Manual' | 'Auto' })}
                options={[
                  { value: 'Manual', label: 'Manual (Button)' },
                  { value: 'Auto', label: 'Automatic' }
                ]}
                helperText="When to open the cash drawer"
              />

              <Toggle
                checked={hardware.cashDrawerAutoOpen}
                onChange={(checked) => updateHardwareSettings({ cashDrawerAutoOpen: checked })}
                label="Auto-Open on Cash Payment"
                description="Automatically open drawer when cash payment is selected"
              />
            </>
          )}
        </div>
      </FormSection>

      {/* Barcode Scanner Configuration */}
      <FormSection
        title="Barcode Scanner"
        description="Configure barcode scanner settings"
      >
        <div className="space-y-4">
          <Toggle
            checked={hardware.barcodeScannerEnabled}
            onChange={(checked) => updateHardwareSettings({ barcodeScannerEnabled: checked })}
            label="Enable Barcode Scanner"
            description="Scan product barcodes for quick entry"
          />

          {hardware.barcodeScannerEnabled && (
            <>
              <TouchSelect
                label="Connection Type"
                value={hardware.barcodeScannerConnection}
                onChange={(value) => updateHardwareSettings({ barcodeScannerConnection: value as 'USB' | 'Bluetooth' | 'COM' })}
                options={[
                  { value: 'USB', label: 'USB (HID)' },
                  { value: 'Bluetooth', label: 'Bluetooth' },
                  { value: 'COM', label: 'Serial Port (COM)' }
                ]}
              />

              <TouchSelect
                label="Scan Mode"
                value={hardware.barcodeScannerMode}
                onChange={(value) => updateHardwareSettings({ barcodeScannerMode: value as 'Continuous' | 'Trigger' })}
                options={[
                  { value: 'Continuous', label: 'Continuous Scan' },
                  { value: 'Trigger', label: 'Trigger/Button Scan' }
                ]}
                helperText="How the scanner operates"
              />

              <TextInput
                type="text"
                label="Prefix Characters"
                value={hardware.barcodeScannerPrefix}
                onChange={(e) => updateHardwareSettings({ barcodeScannerPrefix: e.target.value })}
                placeholder="Optional prefix"
                helperText="Characters added before scanned barcode"
              />

              <TextInput
                type="text"
                label="Suffix Characters"
                value={hardware.barcodeScannerSuffix}
                onChange={(e) => updateHardwareSettings({ barcodeScannerSuffix: e.target.value })}
                placeholder="Optional suffix (e.g., Enter)"
                helperText="Characters added after scanned barcode"
              />
            </>
          )}
        </div>
      </FormSection>

      {/* Customer Display Configuration */}
      <FormSection
        title="Customer Display"
        description="Configure customer-facing display settings"
      >
        <div className="space-y-4">
          <Toggle
            checked={hardware.customerDisplayEnabled}
            onChange={(checked) => updateHardwareSettings({ customerDisplayEnabled: checked })}
            label="Enable Customer Display"
            description="Show transaction details to customers"
          />

          {hardware.customerDisplayEnabled && (
            <>
              <TouchSelect
                label="Display Type"
                value={hardware.customerDisplayType}
                onChange={(value) => updateHardwareSettings({ customerDisplayType: value as 'Monitor' | 'Pole Display' | 'Tablet' })}
                options={[
                  { value: 'Monitor', label: 'Secondary Monitor' },
                  { value: 'Pole Display', label: 'Pole Display (VFD/LCD)' },
                  { value: 'Tablet', label: 'Tablet/Mobile Device' }
                ]}
                helperText="Type of customer-facing display"
              />

              <TouchSelect
                label="Connection Type"
                value={hardware.customerDisplayConnection}
                onChange={(value) => updateHardwareSettings({ customerDisplayConnection: value as 'HDMI' | 'USB' | 'Network' })}
                options={[
                  { value: 'HDMI', label: 'HDMI/DisplayPort' },
                  { value: 'USB', label: 'USB' },
                  { value: 'Network', label: 'Network (IP)' }
                ]}
              />

              <TextInput
                type="text"
                label="Port/Address"
                value={hardware.customerDisplayPort}
                onChange={(e) => updateHardwareSettings({ customerDisplayPort: e.target.value })}
                placeholder={hardware.customerDisplayConnection === 'Network' ? '192.168.1.200' : 'Display 2'}
                helperText={hardware.customerDisplayConnection === 'Network' ? 'IP address of the display device' : 'Display identifier'}
              />

              <div className={`p-4 rounded-lg border-2 ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Display Content
                </h4>
                <div className="space-y-4">
                  <Toggle
                    checked={hardware.customerDisplayShowItems}
                    onChange={(checked) => updateHardwareSettings({ customerDisplayShowItems: checked })}
                    label="Show Item Details"
                    description="Display item names, quantities, and prices"
                  />

                  <Toggle
                    checked={hardware.customerDisplayShowTotal}
                    onChange={(checked) => updateHardwareSettings({ customerDisplayShowTotal: checked })}
                    label="Show Total Amount"
                    description="Display running total and final amount"
                  />

                  <Toggle
                    checked={hardware.customerDisplayShowPromo}
                    onChange={(checked) => updateHardwareSettings({ customerDisplayShowPromo: checked })}
                    label="Show Promotional Messages"
                    description="Display marketing messages and promotions"
                  />
                </div>
              </div>

              <TouchSelect
                label="Font Size"
                value={hardware.customerDisplayFontSize}
                onChange={(value) => updateHardwareSettings({ customerDisplayFontSize: value as 'Small' | 'Medium' | 'Large' })}
                options={[
                  { value: 'Small', label: 'Small' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'Large', label: 'Large (Recommended)' }
                ]}
                helperText="Text size for customer display"
              />
            </>
          )}
        </div>
      </FormSection>

      {/* Scale/Weight Device Configuration */}
      <FormSection
        title="Scale/Weight Device"
        description="Configure electronic scale for weighing products"
      >
        <div className="space-y-4">
          <Toggle
            checked={hardware.scaleEnabled}
            onChange={(checked) => updateHardwareSettings({ scaleEnabled: checked })}
            label="Enable Scale"
            description="Use electronic scale for weight-based pricing"
          />

          {hardware.scaleEnabled && (
            <>
              <TouchSelect
                label="Connection Type"
                value={hardware.scaleConnection}
                onChange={(value) => updateHardwareSettings({ scaleConnection: value as 'USB' | 'COM' | 'Network' })}
                options={[
                  { value: 'USB', label: 'USB' },
                  { value: 'COM', label: 'Serial Port (COM)' },
                  { value: 'Network', label: 'Network (IP)' }
                ]}
              />

              <TextInput
                type="text"
                label="Port/Address"
                value={hardware.scalePort}
                onChange={(e) => updateHardwareSettings({ scalePort: e.target.value })}
                placeholder={hardware.scaleConnection === 'Network' ? '192.168.1.150' : hardware.scaleConnection === 'COM' ? 'COM4' : '/dev/ttyUSB0'}
              />

              {hardware.scaleConnection === 'COM' && (
                <TouchSelect
                  label="Baud Rate"
                  value={hardware.scaleBaudRate.toString()}
                  onChange={(value) => updateHardwareSettings({ scaleBaudRate: parseInt(value as string) })}
                  options={[
                    { value: '9600', label: '9600' },
                    { value: '19200', label: '19200' },
                    { value: '38400', label: '38400' },
                    { value: '57600', label: '57600' },
                    { value: '115200', label: '115200' }
                  ]}
                />
              )}

              <TouchSelect
                label="Unit of Measurement"
                value={hardware.scaleUnit}
                onChange={(value) => updateHardwareSettings({ scaleUnit: value as 'kg' | 'lb' | 'g' })}
                options={[
                  { value: 'kg', label: 'Kilograms (kg)' },
                  { value: 'lb', label: 'Pounds (lb)' },
                  { value: 'g', label: 'Grams (g)' }
                ]}
                helperText="Default weight unit for the scale"
              />
            </>
          )}
        </div>
      </FormSection>

      {/* Payment Terminal Configuration */}
      <FormSection
        title="Card Reader / Payment Terminal"
        description="Configure payment terminal for card transactions"
      >
        <div className="space-y-4">
          <Toggle
            checked={hardware.paymentTerminalEnabled}
            onChange={(checked) => updateHardwareSettings({ paymentTerminalEnabled: checked })}
            label="Enable Payment Terminal"
            description="Accept card payments through integrated terminal"
          />

          {hardware.paymentTerminalEnabled && (
            <>
              <TextInput
                type="text"
                label="Terminal Model/Type"
                value={hardware.paymentTerminalType}
                onChange={(e) => updateHardwareSettings({ paymentTerminalType: e.target.value })}
                placeholder="e.g., Ingenico iCT250, Verifone VX520"
                helperText="Model or type of payment terminal"
              />

              <TouchSelect
                label="Connection Type"
                value={hardware.paymentTerminalConnection}
                onChange={(value) => updateHardwareSettings({ paymentTerminalConnection: value as 'USB' | 'Network' | 'Bluetooth' })}
                options={[
                  { value: 'USB', label: 'USB' },
                  { value: 'Network', label: 'Network (IP)' },
                  { value: 'Bluetooth', label: 'Bluetooth' }
                ]}
              />

              <TextInput
                type="text"
                label="Port/Address"
                value={hardware.paymentTerminalPort}
                onChange={(e) => updateHardwareSettings({ paymentTerminalPort: e.target.value })}
                placeholder={hardware.paymentTerminalConnection === 'Network' ? '192.168.1.180' : 'COM5 or Bluetooth ID'}
                helperText={hardware.paymentTerminalConnection === 'Network' ? 'IP address of the terminal' : 'Port or device identifier'}
              />
            </>
          )}
        </div>
      </FormSection>
    </div>
  )
}
