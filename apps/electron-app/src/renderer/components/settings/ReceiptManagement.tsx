import { useState, useEffect } from 'react'
import { useAppStore, useSettingsStore } from '../../stores'
import { ReceiptTemplateManager } from './receipt/ReceiptTemplateManager'
import { TestPrintPanel } from './receipt/TestPrintPanel'
import { ReceiptPreview } from './receipt/ReceiptPreview'
import { 
  ReceiptTemplateType, 
  ReceiptTemplateConfig,
  DEFAULT_TEMPLATE_CONFIGS
} from './receipt/ReceiptTemplateTypes'

/**
 * Receipt Management Component
 * 
 * Main component that integrates:
 * - Template creation and configuration
 * - Live preview
 * - Test print functionality
 * - Support for 5 receipt types
 */

export function ReceiptManagement() {
  const { theme } = useAppStore()
  const { receipts, updateReceiptSettings } = useSettingsStore()
  const [selectedTemplate, setSelectedTemplate] = useState<ReceiptTemplateType>('order_receipt')
  const [showPreview, setShowPreview] = useState(true)

  // Initialize templates if not present
  const [templates, setTemplates] = useState<Record<ReceiptTemplateType, ReceiptTemplateConfig>>(() => {
    const initialTemplates: Record<ReceiptTemplateType, ReceiptTemplateConfig> = {} as any
    
    Object.keys(DEFAULT_TEMPLATE_CONFIGS).forEach((key) => {
      const type = key as ReceiptTemplateType
      const defaultConfig = DEFAULT_TEMPLATE_CONFIGS[type]
      
      // Check if template exists in store, otherwise use default
      const storedTemplate = receipts.receiptTemplates?.[type]
      
      initialTemplates[type] = {
        id: type,
        ...defaultConfig,
        ...storedTemplate
      } as ReceiptTemplateConfig
    })
    
    return initialTemplates
  })

  // Save templates to store when they change
  useEffect(() => {
    const templateData: Record<string, any> = {}
    Object.keys(templates).forEach((key) => {
      templateData[key] = templates[key as ReceiptTemplateType]
    })
    
    updateReceiptSettings({
      receiptTemplates: templateData as any
    })
  }, [templates])

  const handleTemplateUpdate = (type: ReceiptTemplateType, config: Partial<ReceiptTemplateConfig>) => {
    setTemplates(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        ...config
      }
    }))
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Receipt Management
            </h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Create and configure receipt templates for different scenarios with live preview and test printing
            </p>
          </div>
          
          {/* Preview Toggle */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
            }`}
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>
      </div>

      {/* Main Layout: Configuration + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Template Configuration (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Template Manager */}
          <div className={`rounded-lg border-2 p-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Receipt Templates
            </h3>
            <ReceiptTemplateManager
              templates={templates}
              onTemplateUpdate={handleTemplateUpdate}
            />
          </div>

          {/* Test Print Panel */}
          <div className={`rounded-lg border-2 p-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <TestPrintPanel
              selectedTemplate={selectedTemplate}
              onTemplateChange={setSelectedTemplate}
            />
          </div>
        </div>

        {/* Right Column: Live Preview (1/3 width) */}
        {showPreview && (
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6">
              <div className={`rounded-lg border-2 p-4 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Live Preview
                </h3>
                <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="text-center">
                    <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Preview for: <span className="font-semibold">{templates[selectedTemplate].name}</span>
                    </p>
                    {/* Use existing ReceiptPreview component */}
                    <ReceiptPreview settings={receipts} />
                  </div>
                </div>
                
                {/* Template Info */}
                <div className={`mt-4 p-3 rounded-lg border ${theme === 'dark' ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
                  <h4 className={`text-xs font-semibold mb-2 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-900'}`}>
                    Template Info
                  </h4>
                  <div className={`text-xs space-y-1 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`}>
                    <div>Type: {templates[selectedTemplate].type}</div>
                    <div>Status: {templates[selectedTemplate].enabled ? '✓ Enabled' : '✗ Disabled'}</div>
                    <div>Paper: {templates[selectedTemplate].print?.paperSize || 'Not set'}</div>
                    <div>Auto Print: {templates[selectedTemplate].print?.autoPrint ? 'Yes' : 'No'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className={`mt-6 p-6 rounded-lg border-2 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          📚 Receipt Template Guide
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <h4 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              🧾 Order Receipt
            </h4>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Standard customer receipt printed after completing a sale. Shows items, totals, payment details, and change.
            </p>
          </div>
          
          <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <h4 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              📄 Invoice
            </h4>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Formal invoice document with detailed business information, customer details, and comprehensive item breakdown.
            </p>
          </div>
          
          <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <h4 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              🔓 POS Opening
            </h4>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Receipt printed when opening a POS session. Shows opening cash amount and denomination breakdown.
            </p>
          </div>
          
          <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <h4 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              🔒 POS Closing Summary
            </h4>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Summary receipt when closing a session. Shows sales totals, payment breakdown, cash variance, and transaction count.
            </p>
          </div>
          
          <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <h4 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              ⏸️ Order Park Receipt
            </h4>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Receipt for parked/held orders. Shows order details, park time, and instructions to complete the order later.
            </p>
          </div>
          
          <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <h4 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              💡 Quick Tips
            </h4>
            <ul className={`text-xs space-y-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              <li>• Click template to expand settings</li>
              <li>• Enable/disable templates as needed</li>
              <li>• Test print with real order data</li>
              <li>• Preview updates in real-time</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
