import { useAppStore, useSettingsStore } from '../../../stores'
import { Button } from '../../common'
import { FormSection } from '../../forms'
import { RECEIPT_TEMPLATES, applyTemplate } from './ReceiptTemplates'

/**
 * Receipt Template Selection Panel
 * 
 * Allows users to select and apply pre-built templates
 */
export function TemplatePanel() {
  const { theme } = useAppStore()
  const { receipts, updateReceiptSettings } = useSettingsStore()

  const handleTemplateSelect = (templateId: string) => {
    const updatedSettings = applyTemplate(receipts, templateId)
    updateReceiptSettings(updatedSettings)
  }

  return (
    <FormSection
      title="Receipt Templates"
      description="Choose from pre-built templates or customize your own"
    >
      <div className="space-y-4">
        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {RECEIPT_TEMPLATES.map((template) => {
            const isActive = receipts.activeTemplate === template.id
            
            return (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template.id)}
                className={`
                  p-4 rounded-lg border-2 text-left transition-all
                  min-h-[120px] flex flex-col justify-between
                  ${isActive
                    ? theme === 'dark'
                      ? 'bg-blue-900/30 border-blue-500 ring-2 ring-blue-500'
                      : 'bg-blue-50 border-blue-500 ring-2 ring-blue-500'
                    : theme === 'dark'
                      ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }
                `}
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {template.name}
                    </h4>
                    {isActive && (
                      <span className={`text-xs px-2 py-1 rounded ${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}`}>
                        Active
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {template.description}
                  </p>
                </div>

                {/* Template Features */}
                <div className={`mt-3 pt-3 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex flex-wrap gap-2">
                    {template.config.showLogo && (
                      <span className={`text-xs px-2 py-0.5 rounded ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                        Logo
                      </span>
                    )}
                    {template.config.showBarcode && (
                      <span className={`text-xs px-2 py-0.5 rounded ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                        Barcode
                      </span>
                    )}
                    {template.config.showQRCode && (
                      <span className={`text-xs px-2 py-0.5 rounded ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                        QR Code
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                      {template.config.itemSpacing || 'normal'} spacing
                    </span>
                  </div>
                </div>
              </button>
            )
          })}

          {/* Custom Template Card */}
          <button
            onClick={() => updateReceiptSettings({ activeTemplate: 'custom' })}
            className={`
              p-4 rounded-lg border-2 text-left transition-all
              min-h-[120px] flex flex-col justify-between
              ${receipts.activeTemplate === 'custom'
                ? theme === 'dark'
                  ? 'bg-purple-900/30 border-purple-500 ring-2 ring-purple-500'
                  : 'bg-purple-50 border-purple-500 ring-2 ring-purple-500'
                : theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }
            `}
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Custom
                </h4>
                {receipts.activeTemplate === 'custom' && (
                  <span className={`text-xs px-2 py-1 rounded ${theme === 'dark' ? 'bg-purple-600 text-white' : 'bg-purple-500 text-white'}`}>
                    Active
                  </span>
                )}
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Your custom configuration based on settings below
              </p>
            </div>

            <div className={`mt-3 pt-3 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Fully customizable
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Info Box */}
        <div className={`p-4 rounded-lg border-2 ${theme === 'dark' ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
          <h4 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-900'}`}>
            💡 Template Tips
          </h4>
          <ul className={`text-xs space-y-1 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`}>
            <li>• <strong>Standard:</strong> Best for most businesses - balanced and professional</li>
            <li>• <strong>Compact:</strong> Saves paper - ideal for high-volume transactions</li>
            <li>• <strong>Detailed:</strong> Shows all information - great for detailed records</li>
            <li>• <strong>Minimal:</strong> Ultra-compact - perfect for quick service</li>
            <li>• <strong>Custom:</strong> Configure every aspect to match your exact needs</li>
          </ul>
        </div>

        {/* Quick Actions */}
        {receipts.activeTemplate !== 'custom' && (
          <div className="flex gap-3">
            <Button
              onClick={() => updateReceiptSettings({ activeTemplate: 'custom' })}
              variant="secondary"
              className="flex-1"
            >
              Customize This Template
            </Button>
          </div>
        )}
      </div>
    </FormSection>
  )
}

