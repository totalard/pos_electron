import { useState } from 'react'
import { useAppStore } from '../../stores'
import { Button } from '../common'

interface BulkOperationsProps {
  onClose: () => void
  onSuccess?: () => void
}

export function BulkOperations({ onClose, onSuccess }: BulkOperationsProps) {
  const { theme } = useAppStore()
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import')
  const [isProcessing, setIsProcessing] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [exportType, setExportType] = useState<'all' | 'low-stock' | 'out-of-stock'>('all')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleImport = async () => {
    if (!file) return

    setIsProcessing(true)
    try {
      // Parse CSV file
      const text = await file.text()
      const lines = text.split('\n')
      const headers = lines[0].split(',').map(h => h.trim())
      
      // Validate headers
      const requiredHeaders = ['sku', 'name', 'quantity']
      const hasRequiredHeaders = requiredHeaders.every(h => headers.includes(h))
      
      if (!hasRequiredHeaders) {
        alert('CSV must contain columns: sku, name, quantity')
        return
      }

      // Parse data
      const data = []
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue
        
        const values = lines[i].split(',').map(v => v.trim())
        const row: any = {}
        headers.forEach((header, index) => {
          row[header] = values[index]
        })
        data.push(row)
      }

      console.log('Parsed data:', data)
      alert(`Successfully parsed ${data.length} products. Import functionality will be implemented with backend support.`)
      
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Import failed:', error)
      alert('Failed to import CSV file')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExport = async () => {
    setIsProcessing(true)
    try {
      let endpoint = '/api/products'
      if (exportType === 'low-stock') {
        endpoint = '/api/products/inventory/low-stock'
      } else if (exportType === 'out-of-stock') {
        endpoint = '/api/products/inventory/out-of-stock'
      }

      const response = await fetch(`http://localhost:8000${endpoint}`)
      if (!response.ok) throw new Error('Failed to fetch products')

      const products = await response.json()

      // Generate CSV
      const headers = ['SKU', 'Name', 'Category', 'Current Stock', 'Min Stock', 'Max Stock', 'Cost Price', 'Selling Price']
      const csvLines = [headers.join(',')]

      products.forEach((product: any) => {
        const row = [
          product.sku || '',
          `"${product.name || ''}"`,
          product.category || '',
          product.current_stock || 0,
          product.min_stock_level || 0,
          product.max_stock_level || 0,
          product.cost_price || 0,
          product.selling_price || 0
        ]
        csvLines.push(row.join(','))
      })

      const csv = csvLines.join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `inventory-${exportType}-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      alert(`Successfully exported ${products.length} products`)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export inventory')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Bulk Operations
        </h2>
        <button
          onClick={onClose}
          className={`p-2 rounded-lg transition-colors ${
            theme === 'dark'
              ? 'hover:bg-gray-700 text-gray-400'
              : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className={`flex gap-2 mb-6 p-1 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
        <button
          onClick={() => setActiveTab('import')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'import'
              ? theme === 'dark'
                ? 'bg-primary-600 text-white'
                : 'bg-primary-500 text-white'
              : theme === 'dark'
                ? 'text-gray-400 hover:text-white'
                : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Import CSV
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'export'
              ? theme === 'dark'
                ? 'bg-primary-600 text-white'
                : 'bg-primary-500 text-white'
              : theme === 'dark'
                ? 'text-gray-400 hover:text-white'
                : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Export CSV
        </button>
      </div>

      {/* Import Tab */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
            <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-900'}`}>
              CSV Format Requirements
            </h4>
            <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-blue-200' : 'text-blue-800'}`}>
              Your CSV file must include these columns:
            </p>
            <ul className={`text-sm list-disc list-inside space-y-1 ${theme === 'dark' ? 'text-blue-200' : 'text-blue-800'}`}>
              <li><strong>sku</strong> - Product SKU (required)</li>
              <li><strong>name</strong> - Product name (required)</li>
              <li><strong>quantity</strong> - Stock quantity to set (required)</li>
              <li><strong>category</strong> - Product category (optional)</li>
              <li><strong>cost_price</strong> - Cost price (optional)</li>
              <li><strong>selling_price</strong> - Selling price (optional)</li>
            </ul>
          </div>

          <div className={`border-2 border-dashed rounded-lg p-8 text-center ${
            theme === 'dark'
              ? 'border-gray-600 hover:border-gray-500'
              : 'border-gray-300 hover:border-gray-400'
          }`}>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="cursor-pointer"
            >
              <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className={`text-lg font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {file ? file.name : 'Click to upload CSV file'}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                or drag and drop
              </p>
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              size="md"
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleImport}
              disabled={!file || isProcessing}
              isLoading={isProcessing}
            >
              Import Products
            </Button>
          </div>
        </div>
      )}

      {/* Export Tab */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Export Type
            </label>
            <div className="space-y-2">
              {[
                { value: 'all', label: 'All Products', description: 'Export complete inventory' },
                { value: 'low-stock', label: 'Low Stock Products', description: 'Products below minimum stock level' },
                { value: 'out-of-stock', label: 'Out of Stock Products', description: 'Products with zero stock' }
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start p-4 rounded-lg cursor-pointer transition-colors ${
                    exportType === option.value
                      ? theme === 'dark'
                        ? 'bg-primary-900/30 border-2 border-primary-600'
                        : 'bg-primary-50 border-2 border-primary-500'
                      : theme === 'dark'
                        ? 'bg-gray-700/30 border-2 border-transparent hover:bg-gray-700/50'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="exportType"
                    value={option.value}
                    checked={exportType === option.value as any}
                    onChange={(e) => setExportType(e.target.value as any)}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {option.label}
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {option.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
            <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Export Details
            </h4>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              The CSV file will include: SKU, Name, Category, Current Stock, Min Stock, Max Stock, Cost Price, and Selling Price.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              size="md"
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleExport}
              disabled={isProcessing}
              isLoading={isProcessing}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              }
            >
              Export to CSV
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
