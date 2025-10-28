/**
 * Printer Management Component
 * Manages multiple kitchen printers, cashier printer, and label printer
 */

import { useState } from 'react'
import { useAppStore, useSettingsStore } from '../../stores'
import type { PrinterConfiguration } from '../../stores/settingsStore'
import { FormSection } from '../forms/FormSection'
import { TouchSelect } from '../forms/TouchSelect'
import { TextInput } from '../forms/TextInput'
import { Toggle } from '../forms/Toggle'

interface PrinterFormData {
  name: string
  connection: 'USB' | 'Network' | 'COM'
  port: string
  address: string
  baudRate: number
  paperSize: '58mm' | '80mm'
  enabled: boolean
  assignedCategories: number[]
  priority: number
}

export function PrinterManagement() {
  const { theme } = useAppStore()
  const {
    hardware,
    addKitchenPrinter,
    updateKitchenPrinter,
    removeKitchenPrinter,
    setCashierPrinter,
    setLabelPrinter
  } = useSettingsStore()

  const [showAddKitchen, setShowAddKitchen] = useState(false)
  const [editingKitchen, setEditingKitchen] = useState<string | null>(null)
  const [kitchenForm, setKitchenForm] = useState<PrinterFormData>({
    name: '',
    connection: 'USB',
    port: '',
    address: '',
    baudRate: 9600,
    paperSize: '80mm',
    enabled: true,
    assignedCategories: [],
    priority: 1
  })

  const resetKitchenForm = () => {
    setKitchenForm({
      name: '',
      connection: 'USB',
      port: '',
      address: '',
      baudRate: 9600,
      paperSize: '80mm',
      enabled: true,
      assignedCategories: [],
      priority: 1
    })
    setEditingKitchen(null)
    setShowAddKitchen(false)
  }

  const handleAddKitchen = async () => {
    await addKitchenPrinter(kitchenForm)
    resetKitchenForm()
  }

  const handleUpdateKitchen = async (id: string) => {
    await updateKitchenPrinter(id, kitchenForm)
    resetKitchenForm()
  }

  const handleEditKitchen = (printer: PrinterConfiguration) => {
    setKitchenForm({
      name: printer.name,
      connection: printer.connection,
      port: printer.port || '',
      address: printer.address || '',
      baudRate: printer.baudRate,
      paperSize: printer.paperSize || '80mm',
      enabled: printer.enabled,
      assignedCategories: printer.assignedCategories || [],
      priority: printer.priority || 1
    })
    setEditingKitchen(printer.id)
    setShowAddKitchen(true)
  }

  const handleRemoveKitchen = async (id: string) => {
    if (confirm('Are you sure you want to remove this kitchen printer?')) {
      await removeKitchenPrinter(id)
    }
  }

  const handleSetCashier = async (enabled: boolean) => {
    if (enabled && !hardware.printers.cashier) {
      await setCashierPrinter({
        name: 'Cashier Printer',
        connection: 'USB',
        baudRate: 9600,
        paperSize: '80mm',
        enabled: true
      })
    } else if (!enabled) {
      await setCashierPrinter(null)
    }
  }

  const handleSetLabel = async (enabled: boolean) => {
    if (enabled && !hardware.printers.label) {
      await setLabelPrinter({
        name: 'Label Printer',
        connection: 'USB',
        baudRate: 9600,
        enabled: true
      })
    } else if (!enabled) {
      await setLabelPrinter(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Cashier Printer */}
      <FormSection
        title="Cashier Printer"
        description="Receipt printer for customer transactions"
      >
        <div className="space-y-4">
          <Toggle
            checked={hardware.printers.cashier !== null}
            onChange={handleSetCashier}
            label="Enable Cashier Printer"
            description="Print receipts for customers"
          />

          {hardware.printers.cashier && (
            <>
              <TextInput
                type="text"
                label="Printer Name"
                value={hardware.printers.cashier.name}
                onChange={(e) => setCashierPrinter({ ...hardware.printers.cashier!, name: e.target.value })}
              />

              <TouchSelect
                label="Connection Type"
                value={hardware.printers.cashier.connection}
                onChange={(value) => setCashierPrinter({ ...hardware.printers.cashier!, connection: value as any })}
                options={[
                  { value: 'USB', label: 'USB' },
                  { value: 'Network', label: 'Network (IP)' },
                  { value: 'COM', label: 'Serial Port (COM)' }
                ]}
              />

              {hardware.printers.cashier.connection === 'Network' && (
                <TextInput
                  type="text"
                  label="IP Address"
                  value={hardware.printers.cashier.address || ''}
                  onChange={(e) => setCashierPrinter({ ...hardware.printers.cashier!, address: e.target.value })}
                  placeholder="192.168.1.100"
                />
              )}

              {hardware.printers.cashier.connection === 'COM' && (
                <>
                  <TextInput
                    type="text"
                    label="COM Port"
                    value={hardware.printers.cashier.port || ''}
                    onChange={(e) => setCashierPrinter({ ...hardware.printers.cashier!, port: e.target.value })}
                    placeholder="COM1"
                  />
                  <TextInput
                    type="number"
                    label="Baud Rate"
                    value={hardware.printers.cashier.baudRate.toString()}
                    onChange={(e) => setCashierPrinter({ ...hardware.printers.cashier!, baudRate: parseInt(e.target.value) })}
                  />
                </>
              )}

              <TouchSelect
                label="Paper Size"
                value={hardware.printers.cashier.paperSize || '80mm'}
                onChange={(value) => setCashierPrinter({ ...hardware.printers.cashier!, paperSize: value as any })}
                options={[
                  { value: '58mm', label: '58mm' },
                  { value: '80mm', label: '80mm' }
                ]}
              />
            </>
          )}
        </div>
      </FormSection>

      {/* Kitchen Printers */}
      <FormSection
        title="Kitchen Printers"
        description="Manage multiple kitchen printers for order routing"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {hardware.printers.kitchen.length} kitchen printer(s) configured
            </p>
            <button
              onClick={() => setShowAddKitchen(true)}
              className={`px-4 py-2 rounded-lg font-medium ${
                theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              + Add Kitchen Printer
            </button>
          </div>

          {/* Kitchen Printers List */}
          {hardware.printers.kitchen.map((printer, index) => (
            <div
              key={printer.id}
              className={`p-4 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {printer.name}
                    </h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      printer.enabled
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {printer.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className={`text-sm mt-2 space-y-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <p>Connection: {printer.connection}</p>
                    {printer.connection === 'Network' && printer.address && <p>Address: {printer.address}</p>}
                    {printer.connection === 'COM' && printer.port && <p>Port: {printer.port}</p>}
                    <p>Priority: {printer.priority || index + 1}</p>
                    {printer.assignedCategories && printer.assignedCategories.length > 0 && (
                      <p>Categories: {printer.assignedCategories.length} assigned</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditKitchen(printer)}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      theme === 'dark'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleRemoveKitchen(printer.id)}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      theme === 'dark'
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add/Edit Kitchen Printer Form */}
          {showAddKitchen && (
            <div className={`p-4 rounded-lg border-2 ${
              theme === 'dark' ? 'bg-gray-800 border-blue-500' : 'bg-blue-50 border-blue-500'
            }`}>
              <h4 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {editingKitchen ? 'Edit Kitchen Printer' : 'Add Kitchen Printer'}
              </h4>
              <div className="space-y-4">
                <TextInput
                  type="text"
                  label="Printer Name"
                  value={kitchenForm.name}
                  onChange={(e) => setKitchenForm({ ...kitchenForm, name: e.target.value })}
                  placeholder="e.g., Kitchen Printer 1"
                />

                <TouchSelect
                  label="Connection Type"
                  value={kitchenForm.connection}
                  onChange={(value) => setKitchenForm({ ...kitchenForm, connection: value as any })}
                  options={[
                    { value: 'USB', label: 'USB' },
                    { value: 'Network', label: 'Network (IP)' },
                    { value: 'COM', label: 'Serial Port (COM)' }
                  ]}
                />

                {kitchenForm.connection === 'Network' && (
                  <TextInput
                    type="text"
                    label="IP Address"
                    value={kitchenForm.address}
                    onChange={(e) => setKitchenForm({ ...kitchenForm, address: e.target.value })}
                    placeholder="192.168.1.100"
                  />
                )}

                {kitchenForm.connection === 'COM' && (
                  <>
                    <TextInput
                      type="text"
                      label="COM Port"
                      value={kitchenForm.port}
                      onChange={(e) => setKitchenForm({ ...kitchenForm, port: e.target.value })}
                      placeholder="COM1"
                    />
                    <TextInput
                      type="number"
                      label="Baud Rate"
                      value={kitchenForm.baudRate.toString()}
                      onChange={(e) => setKitchenForm({ ...kitchenForm, baudRate: parseInt(e.target.value) })}
                    />
                  </>
                )}

                <TextInput
                  type="number"
                  label="Priority"
                  value={kitchenForm.priority.toString()}
                  onChange={(e) => setKitchenForm({ ...kitchenForm, priority: parseInt(e.target.value) })}
                  helperText="Lower number = higher priority (1 prints first)"
                />

                <Toggle
                  checked={kitchenForm.enabled}
                  onChange={(checked) => setKitchenForm({ ...kitchenForm, enabled: checked })}
                  label="Enable Printer"
                />

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => editingKitchen ? handleUpdateKitchen(editingKitchen) : handleAddKitchen()}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                      theme === 'dark'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    {editingKitchen ? 'Update' : 'Add'} Printer
                  </button>
                  <button
                    onClick={resetKitchenForm}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </FormSection>

      {/* Label Printer */}
      <FormSection
        title="Label Printer"
        description="Printer for product labels and barcodes"
      >
        <div className="space-y-4">
          <Toggle
            checked={hardware.printers.label !== null}
            onChange={handleSetLabel}
            label="Enable Label Printer"
            description="Print product labels and barcodes"
          />

          {hardware.printers.label && (
            <>
              <TextInput
                type="text"
                label="Printer Name"
                value={hardware.printers.label.name}
                onChange={(e) => setLabelPrinter({ ...hardware.printers.label!, name: e.target.value })}
              />

              <TouchSelect
                label="Connection Type"
                value={hardware.printers.label.connection}
                onChange={(value) => setLabelPrinter({ ...hardware.printers.label!, connection: value as any })}
                options={[
                  { value: 'USB', label: 'USB' },
                  { value: 'Network', label: 'Network (IP)' },
                  { value: 'COM', label: 'Serial Port (COM)' }
                ]}
              />
            </>
          )}
        </div>
      </FormSection>
    </div>
  )
}
