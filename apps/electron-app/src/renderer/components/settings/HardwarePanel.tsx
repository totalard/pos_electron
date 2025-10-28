import { useState } from 'react'
import { useAppStore, useSettingsStore } from '../../stores'
import { FormSection, TouchSelect, Toggle, TextInput } from '../forms'
import { HardwareDeviceManager } from './HardwareDeviceManager'
import { PrinterManagement } from './PrinterManagement'
import { CustomerDisplayManagement } from './CustomerDisplayManagement'

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
  const [activeView, setActiveView] = useState<'manager' | 'config'>('manager')

  return (
    <div className="space-y-6">
      {/* View Selector */}
      <div className={`flex space-x-2 p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <button
          onClick={() => setActiveView('manager')}
          className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${
            activeView === 'manager'
              ? theme === 'dark'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-500 text-white'
              : theme === 'dark'
              ? 'text-gray-400 hover:text-white'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Device Manager
        </button>
        <button
          onClick={() => setActiveView('config')}
          className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${
            activeView === 'config'
              ? theme === 'dark'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-500 text-white'
              : theme === 'dark'
              ? 'text-gray-400 hover:text-white'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Configuration
        </button>
      </div>

      {/* Device Manager View */}
      {activeView === 'manager' && <HardwareDeviceManager />}

      {/* Configuration View */}
      {activeView === 'config' && (
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

          {/* Printer Management */}
          <PrinterManagement />

          {/* Customer Display Management */}
          <CustomerDisplayManagement />

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
      )}
    </div>
  )
}
