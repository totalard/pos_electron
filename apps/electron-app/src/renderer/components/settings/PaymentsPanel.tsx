import { useState } from 'react'
import { useAppStore, useSettingsStore, PaymentMethod } from '../../stores'
import { FormSection, TextInput, Toggle, NumberInput } from '../forms'

export function PaymentsPanel() {
  const { theme } = useAppStore()
  const { payments, updatePaymentSettings } = useSettingsStore()
  const [editingMethod, setEditingMethod] = useState<string | null>(null)

  const handleMethodToggle = (methodId: string, enabled: boolean) => {
    const updatedMethods = payments.methods.map(m =>
      m.id === methodId ? { ...m, enabled } : m
    )
    updatePaymentSettings({ methods: updatedMethods })
  }

  const handleMethodUpdate = (methodId: string, updates: Partial<PaymentMethod>) => {
    const updatedMethods = payments.methods.map(m =>
      m.id === methodId ? { ...m, ...updates } : m
    )
    updatePaymentSettings({ methods: updatedMethods })
  }

  const handleReorder = (methodId: string, direction: 'up' | 'down') => {
    const currentIndex = payments.methods.findIndex(m => m.id === methodId)
    if (currentIndex === -1) return

    const newMethods = [...payments.methods]
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

    if (targetIndex < 0 || targetIndex >= newMethods.length) return

    // Swap
    const temp = newMethods[currentIndex]
    newMethods[currentIndex] = newMethods[targetIndex]
    newMethods[targetIndex] = temp

    // Update order values
    newMethods.forEach((method, index) => {
      method.order = index + 1
    })

    updatePaymentSettings({ methods: newMethods })
  }

  return (
    <div className="space-y-6">
      {/* Payment Methods */}
      <FormSection
        title="Payment Methods"
        description="Configure available payment methods for checkout"
      >
        <div className="space-y-3">
          {payments.methods.map((method, index) => (
            <div
              key={method.id}
              className={`
                p-4 rounded-lg border
                ${theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">{method.icon}</span>
                  
                  {editingMethod === method.id ? (
                    <TextInput
                      type="text"
                      value={method.name}
                      onChange={(e) => handleMethodUpdate(method.id, { name: e.target.value })}
                      onBlur={() => setEditingMethod(null)}
                      autoFocus
                      className="max-w-xs"
                    />
                  ) : (
                    <div className="flex-1">
                      <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {method.name}
                      </h4>
                      <div className="flex gap-3 mt-1">
                        {method.requiresTerminal && (
                          <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                            Requires Terminal
                          </span>
                        )}
                        {method.allowPartialPayment && (
                          <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">
                            Partial Payment
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Reorder buttons */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleReorder(method.id, 'up')}
                      disabled={index === 0}
                      className={`
                        p-1 rounded transition-colors
                        ${index === 0
                          ? 'opacity-30 cursor-not-allowed'
                          : theme === 'dark'
                            ? 'hover:bg-gray-700 text-gray-400'
                            : 'hover:bg-gray-200 text-gray-600'
                        }
                      `}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleReorder(method.id, 'down')}
                      disabled={index === payments.methods.length - 1}
                      className={`
                        p-1 rounded transition-colors
                        ${index === payments.methods.length - 1
                          ? 'opacity-30 cursor-not-allowed'
                          : theme === 'dark'
                            ? 'hover:bg-gray-700 text-gray-400'
                            : 'hover:bg-gray-200 text-gray-600'
                        }
                      `}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Edit button */}
                  <button
                    onClick={() => setEditingMethod(method.id)}
                    className={`
                      p-2 rounded transition-colors
                      ${theme === 'dark'
                        ? 'hover:bg-gray-700 text-gray-400'
                        : 'hover:bg-gray-200 text-gray-600'
                      }
                    `}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  {/* Toggle */}
                  <Toggle
                    checked={method.enabled}
                    onChange={(checked) => handleMethodToggle(method.id, checked)}
                  />
                </div>
              </div>

              {/* Additional options */}
              {editingMethod === method.id && (
                <div className="mt-4 pt-4 border-t border-gray-300 space-y-3">
                  <Toggle
                    checked={method.requiresTerminal}
                    onChange={(checked) => handleMethodUpdate(method.id, { requiresTerminal: checked })}
                    label="Requires Payment Terminal"
                    description="This payment method requires a card reader or payment terminal"
                  />
                  <Toggle
                    checked={method.allowPartialPayment}
                    onChange={(checked) => handleMethodUpdate(method.id, { allowPartialPayment: checked })}
                    label="Allow Partial Payment"
                    description="Allow customers to pay partially with this method"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </FormSection>

      {/* Split Payment */}
      <FormSection
        title="Split Payment"
        description="Allow customers to pay using multiple payment methods"
      >
        <Toggle
          checked={payments.enableSplitPayment}
          onChange={(checked) => updatePaymentSettings({ enableSplitPayment: checked })}
          label="Enable Split Payment"
          description="Allow splitting payment across multiple methods"
        />
      </FormSection>

      {/* Tipping */}
      <FormSection
        title="Tipping"
        description="Configure tipping options for customers"
      >
        <div className="space-y-4">
          <Toggle
            checked={payments.enableTipping}
            onChange={(checked) => updatePaymentSettings({ enableTipping: checked })}
            label="Enable Tipping"
            description="Allow customers to add tips to their purchase"
          />

          {payments.enableTipping && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Default Tip Percentages
              </label>
              <div className="grid grid-cols-4 gap-2">
                {payments.defaultTipPercentages.map((percentage, index) => (
                  <div key={index} className="relative">
                    <NumberInput
                      value={percentage}
                      onChange={(value) => {
                        const newPercentages = [...payments.defaultTipPercentages]
                        newPercentages[index] = value
                        updatePaymentSettings({ defaultTipPercentages: newPercentages })
                      }}
                      min={0}
                      max={100}
                      showButtons
                    />
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </FormSection>

      {/* Cash Rounding */}
      <FormSection
        title="Cash Rounding"
        description="Round cash payments to nearest denomination"
      >
        <div className="space-y-4">
          <Toggle
            checked={payments.cashRoundingEnabled}
            onChange={(checked) => updatePaymentSettings({ cashRoundingEnabled: checked })}
            label="Enable Cash Rounding"
            description="Round cash totals to the nearest specified amount"
          />

          {payments.cashRoundingEnabled && (
            <NumberInput
              label="Rounding Amount"
              value={payments.cashRoundingAmount}
              onChange={(value) => updatePaymentSettings({ cashRoundingAmount: value })}
              step={0.01}
              min={0}
              helperText="Round to nearest (e.g., 0.05 for nickel rounding)"
              showButtons
            />
          )}
        </div>
      </FormSection>
    </div>
  )
}
