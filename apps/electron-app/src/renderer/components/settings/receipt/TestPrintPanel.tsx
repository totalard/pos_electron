import { useState, useEffect } from 'react'
import { useAppStore, useSettingsStore } from '../../../stores'
import { useHardwareStore } from '../../../stores/hardwareStore'
import { FormSection, Select } from '../../forms'
import { Button } from '../../common'
import { salesAPI, Sale } from '../../../services/api'
import { ReceiptTemplateType } from './ReceiptTemplateTypes'
import { Printer, RefreshCw } from 'lucide-react'
import type { DeviceInfo } from '../../../../preload/preload'

/**
 * Test Print Panel Component
 *
 * Allows users to test print receipt templates using actual order data
 * Supports printer selection for test printing
 */

interface TestPrintPanelProps {
  selectedTemplate: ReceiptTemplateType
  onTemplateChange: (template: ReceiptTemplateType) => void
}

export function TestPrintPanel({ selectedTemplate, onTemplateChange }: TestPrintPanelProps) {
  const { theme } = useAppStore()
  const { printers, scanPrinters, testPrinter, activePrinter } = useHardwareStore()
  const [sales, setSales] = useState<Sale[]>([])
  const [selectedSale, setSelectedSale] = useState<number | null>(null)
  const [selectedPrinter, setSelectedPrinter] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [loadingPrinters, setLoadingPrinters] = useState(false)
  const [printing, setPrinting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch recent sales for test printing
  useEffect(() => {
    fetchSales()
    fetchPrinters()
  }, [])

  // Set default printer when printers are loaded
  useEffect(() => {
    if (printers.length > 0 && !selectedPrinter) {
      // Default to active printer if available, otherwise first printer
      const defaultPrinter = activePrinter?.id || printers[0].id
      setSelectedPrinter(defaultPrinter)
    }
  }, [printers, activePrinter, selectedPrinter])

  const fetchSales = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await salesAPI.getAllSales({ limit: 20, status: 'completed' })
      setSales(data)
      if (data.length > 0 && !selectedSale) {
        setSelectedSale(data[0].id)
      }
    } catch (err) {
      setError('Failed to fetch sales data')
      console.error('Error fetching sales:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchPrinters = async () => {
    setLoadingPrinters(true)
    try {
      await scanPrinters()
    } catch (err) {
      console.error('Error fetching printers:', err)
    } finally {
      setLoadingPrinters(false)
    }
  }

  const handleTestPrint = async () => {
    if (!selectedSale) {
      setError('Please select an order to print')
      return
    }

    if (!selectedPrinter) {
      setError('Please select a printer')
      return
    }

    setPrinting(true)
    setError(null)

    try {
      // Get the full sale details
      const sale = await salesAPI.getSale(selectedSale)

      // Get the selected printer info
      const printer = printers.find(p => p.id === selectedPrinter)

      if (!printer) {
        setError('Selected printer not found')
        return
      }

      // Connect to the printer if not already connected
      const activePrinter = await window.electronAPI.printer.getActive()
      if (!activePrinter.data || activePrinter.data.id !== selectedPrinter) {
        const connectResult = await window.electronAPI.printer.connect({
          connection: printer.connection as 'USB' | 'Network' | 'Serial',
          vendorId: printer.vendorId,
          productId: printer.productId,
          port: printer.port,
          address: printer.address
        })

        if (!connectResult.success) {
          setError(`Failed to connect to printer: ${connectResult.error}`)
          return
        }
      }

      // Get template configuration and business info from settings store
      const { receipts, general } = useSettingsStore.getState()
      const template = receipts.receiptTemplates?.[selectedTemplate] || {}

      // Prepare receipt data
      const receiptData = {
        invoiceNumber: sale.invoice_number,
        date: new Date(sale.sale_date).toLocaleDateString(),
        time: new Date(sale.sale_date).toLocaleTimeString(),
        cashier: sale.sold_by_name || 'Unknown',
        customerName: sale.customer_name || undefined,
        items: sale.items.map(item => ({
          name: item.product_name,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          total: item.total,
          discount: item.discount || 0,
          tax: item.tax || 0
        })),
        subtotal: sale.subtotal,
        taxAmount: sale.tax_amount,
        discountAmount: sale.discount_amount,
        totalAmount: sale.total_amount,
        amountPaid: sale.amount_paid,
        changeGiven: sale.change_given,
        paymentMethod: sale.payment_method
      }

      // Get business info from settings
      const businessInfo = {
        name: receipts.businessName || general.businessName || general.storeName,
        address: receipts.businessAddress || `${general.storeAddress}, ${general.storeCity}, ${general.storeState}`.trim(),
        phone: receipts.businessPhone || general.storePhone,
        email: receipts.businessEmail || general.storeEmail,
        taxId: receipts.taxId,
        logoUrl: receipts.logoUrl
      }

      // Print using template-based rendering
      const printResult = await window.electronAPI.printer.printTemplate(
        template,
        receiptData,
        businessInfo
      )

      if (printResult.success) {
        // Also open print preview window for visual confirmation
        const printWindow = window.open('', '_blank', 'width=800,height=600')
        if (printWindow) {
          printWindow.document.write(generatePrintHTML(sale, selectedTemplate))
          printWindow.document.close()

          // Trigger print dialog after a short delay
          setTimeout(() => {
            printWindow.print()
          }, 250)
        }
      } else {
        setError(`Failed to print receipt: ${printResult.error}`)
      }
    } catch (err) {
      setError('Failed to print receipt')
      console.error('Error printing:', err)
    } finally {
      setPrinting(false)
    }
  }

  const generatePrintHTML = (sale: Sale, templateType: ReceiptTemplateType): string => {
    // This is a simplified version - in production, this would use the actual template configuration
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${sale.invoice_number}</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              max-width: 300px;
              margin: 20px auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px dashed #000;
              padding-bottom: 10px;
            }
            .title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .subtitle {
              font-size: 14px;
              margin-bottom: 3px;
            }
            .section {
              margin: 15px 0;
            }
            .item-row {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              font-weight: bold;
              margin: 5px 0;
              padding-top: 5px;
              border-top: 1px solid #000;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              border-top: 2px dashed #000;
              padding-top: 10px;
            }
            @media print {
              body {
                margin: 0;
                padding: 10px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${getTemplateTitle(templateType)}</div>
            <div class="subtitle">Invoice: ${sale.invoice_number}</div>
            <div class="subtitle">Date: ${new Date(sale.sale_date).toLocaleString()}</div>
            ${sale.customer_name ? `<div class="subtitle">Customer: ${sale.customer_name}</div>` : ''}
          </div>

          <div class="section">
            <div style="font-weight: bold; margin-bottom: 10px;">Items:</div>
            ${sale.items.map(item => `
              <div class="item-row">
                <span>${item.quantity}x ${item.product_name}</span>
                <span>$${item.total.toFixed(2)}</span>
              </div>
            `).join('')}
          </div>

          <div class="section">
            <div class="item-row">
              <span>Subtotal:</span>
              <span>$${sale.subtotal.toFixed(2)}</span>
            </div>
            ${sale.tax_amount > 0 ? `
              <div class="item-row">
                <span>Tax:</span>
                <span>$${sale.tax_amount.toFixed(2)}</span>
              </div>
            ` : ''}
            ${sale.discount_amount > 0 ? `
              <div class="item-row">
                <span>Discount:</span>
                <span>-$${sale.discount_amount.toFixed(2)}</span>
              </div>
            ` : ''}
            <div class="total-row">
              <span>TOTAL:</span>
              <span>$${sale.total_amount.toFixed(2)}</span>
            </div>
            ${templateType === 'order_receipt' ? `
              <div class="item-row">
                <span>Paid:</span>
                <span>$${sale.amount_paid.toFixed(2)}</span>
              </div>
              <div class="item-row">
                <span>Change:</span>
                <span>$${sale.change_given.toFixed(2)}</span>
              </div>
            ` : ''}
          </div>

          <div class="footer">
            <div>Thank you for your business!</div>
            ${sale.sold_by_name ? `<div style="margin-top: 5px; font-size: 12px;">Served by: ${sale.sold_by_name}</div>` : ''}
          </div>
        </body>
      </html>
    `
  }

  const getTemplateTitle = (type: ReceiptTemplateType): string => {
    const titles: Record<ReceiptTemplateType, string> = {
      order_receipt: 'ORDER RECEIPT',
      invoice: 'INVOICE',
      pos_opening: 'POS OPENING',
      pos_closing: 'POS CLOSING SUMMARY',
      order_park: 'PARKED ORDER'
    }
    return titles[type]
  }

  return (
    <FormSection
      title="Test Print"
      description="Test your receipt templates with actual order data"
    >
      <div className="space-y-4">
        {/* Template Selector */}
        <Select
          label="Receipt Template"
          value={selectedTemplate}
          onChange={(e) => onTemplateChange(e.target.value as ReceiptTemplateType)}
          options={[
            { value: 'order_receipt', label: '🧾 Order Receipt' },
            { value: 'invoice', label: '📄 Invoice' },
            { value: 'pos_opening', label: '🔓 POS Opening' },
            { value: 'pos_closing', label: '🔒 POS Closing Summary' },
            { value: 'order_park', label: '⏸️ Order Park Receipt' }
          ]}
          helperText="Select the template type to test"
        />

        {/* Printer Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Select Printer
            </label>
            <button
              onClick={fetchPrinters}
              disabled={loadingPrinters}
              className={`p-1 rounded transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-gray-700 text-gray-400'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Refresh printers"
            >
              <RefreshCw className={`w-4 h-4 ${loadingPrinters ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loadingPrinters ? (
            <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Scanning for printers...
              </p>
            </div>
          ) : printers.length === 0 ? (
            <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                No printers found. Click the refresh button to scan for printers.
              </p>
            </div>
          ) : (
            <Select
              label=""
              value={selectedPrinter}
              onChange={(e) => setSelectedPrinter(e.target.value)}
              options={printers.map(printer => ({
                value: printer.id,
                label: `${printer.name} ${printer.id === activePrinter?.id ? '(Active)' : ''} - ${printer.connection}`
              }))}
              helperText={`${printers.length} printer(s) available`}
            />
          )}
        </div>

        {/* Order Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Select Order
            </label>
            <button
              onClick={fetchSales}
              disabled={loading}
              className={`p-1 rounded transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-gray-700 text-gray-400'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Refresh orders"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          {loading ? (
            <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Loading orders...
              </p>
            </div>
          ) : sales.length === 0 ? (
            <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                No orders found. Complete a sale to test printing.
              </p>
            </div>
          ) : (
            <Select
              label=""
              value={selectedSale?.toString() || ''}
              onChange={(e) => setSelectedSale(Number(e.target.value))}
              options={sales.map(sale => ({
                value: sale.id.toString(),
                label: `${sale.invoice_number} - $${sale.total_amount.toFixed(2)} - ${new Date(sale.sale_date).toLocaleDateString()}`
              }))}
              helperText={`${sales.length} order(s) available`}
            />
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className={`p-3 rounded-lg border ${theme === 'dark' ? 'bg-red-900/20 border-red-700 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}`}>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Test Print Button */}
        <Button
          onClick={handleTestPrint}
          disabled={!selectedSale || !selectedPrinter || printing || loading || loadingPrinters}
          variant="primary"
          className="w-full"
        >
          <Printer className="w-4 h-4 mr-2" />
          {printing ? 'Printing...' : 'Test Print Receipt'}
        </Button>

        {/* Info Box */}
        <div className={`p-4 rounded-lg border-2 ${theme === 'dark' ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
          <h4 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-900'}`}>
            💡 Test Print Tips
          </h4>
          <ul className={`text-xs space-y-1 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`}>
            <li>• Select a printer from the available printers list</li>
            <li>• Choose a recent order from the dropdown</li>
            <li>• Select the template type you want to test</li>
            <li>• Click "Test Print" to send to the selected printer</li>
            <li>• A print preview will also open in a new window</li>
            <li>• Test prints do not affect actual order records</li>
            <li>• Use the refresh button to rescan for printers</li>
          </ul>
        </div>
      </div>
    </FormSection>
  )
}
