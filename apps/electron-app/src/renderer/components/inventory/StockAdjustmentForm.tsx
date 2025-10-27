import { useState } from 'react'
import { useAppStore, useInventoryStore, useProductStore } from '../../stores'
import { Button, Input } from '../common'
import { TouchSelect, NumberInput } from '../forms'

interface StockAdjustmentFormProps {
  onClose: () => void
}

interface AdjustmentLine {
  product_id: number
  product_name: string
  expected_quantity: number
  actual_quantity: number
  difference: number
  notes?: string
}

export function StockAdjustmentForm({ onClose }: StockAdjustmentFormProps) {
  const { theme } = useAppStore()
  const { createAdjustment } = useInventoryStore()
  const { products } = useProductStore()

  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState<AdjustmentLine[]>([])
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [actualQuantity, setActualQuantity] = useState('')
  const [lineNotes, setLineNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const productOptions = products
    .filter(p => p.is_active && p.track_inventory)
    .map(p => ({
      value: p.id,
      label: p.name,
      description: `Current Stock: ${p.stock_quantity || 0}`
    }))

  const handleAddLine = () => {
    if (!selectedProductId || actualQuantity === '') return

    const product = products.find(p => p.id === selectedProductId)
    if (!product) return

    const expected = product.stock_quantity || 0
    const actual = parseInt(actualQuantity)
    const difference = actual - expected

    const newLine: AdjustmentLine = {
      product_id: product.id,
      product_name: product.name,
      expected_quantity: expected,
      actual_quantity: actual,
      difference,
      notes: lineNotes || undefined
    }

    setLines([...lines, newLine])
    setSelectedProductId(null)
    setActualQuantity('')
    setLineNotes('')
  }

  const handleRemoveLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!reason || lines.length === 0) return

    setIsSubmitting(true)
    try {
      await createAdjustment({
        reason,
        notes: notes || undefined,
        lines: lines as any, // Type will be handled by backend
        is_completed: false
      })
      onClose()
    } catch (error) {
      console.error('Failed to create adjustment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalDifference = lines.reduce((sum, line) => sum + line.difference, 0)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          New Stock Adjustment
        </h2>
        <button
          onClick={onClose}
          className={`
            p-2 rounded-lg transition-colors
            ${theme === 'dark'
              ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }
          `}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Adjustment Details */}
      <div className="space-y-4 mb-6">
        <Input
          type="text"
          label="Reason for Adjustment"
          placeholder="e.g., Physical inventory count, Stock correction"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />
        <Input
          type="text"
          label="Notes (Optional)"
          placeholder="Additional notes about this adjustment"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Add Product Line */}
      <div className={`
        p-4 rounded-xl mb-6
        ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}
      `}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Add Product
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TouchSelect<number | null>
            label="Product"
            value={selectedProductId}
            options={[{ value: null, label: 'Select Product' }, ...productOptions]}
            onChange={setSelectedProductId}
            searchable
            placeholder="Select Product"
          />
          <NumberInput
            label="Actual Quantity"
            value={parseInt(actualQuantity) || 0}
            onChange={(value) => setActualQuantity(value.toString())}
            min={0}
            step={1}
            showButtons
            fullWidth
          />
          <Input
            type="text"
            label="Notes (Optional)"
            placeholder="Line notes"
            value={lineNotes}
            onChange={(e) => setLineNotes(e.target.value)}
          />
        </div>
        <div className="mt-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleAddLine}
            disabled={!selectedProductId || actualQuantity === ''}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Add to Adjustment
          </Button>
        </div>
      </div>

      {/* Adjustment Lines */}
      {lines.length > 0 && (
        <div className={`
          rounded-xl overflow-hidden mb-6
          ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}
        `}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
                <tr>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Product
                  </th>
                  <th className={`px-4 py-3 text-right text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Expected
                  </th>
                  <th className={`px-4 py-3 text-right text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Actual
                  </th>
                  <th className={`px-4 py-3 text-right text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Difference
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Notes
                  </th>
                  <th className={`px-4 py-3 text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-600' : 'divide-gray-200'}`}>
                {lines.map((line, index) => (
                  <tr key={index}>
                    <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                      {line.product_name}
                    </td>
                    <td className={`px-4 py-3 text-right text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {line.expected_quantity}
                    </td>
                    <td className={`px-4 py-3 text-right text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {line.actual_quantity}
                    </td>
                    <td className={`px-4 py-3 text-right text-sm font-bold ${
                      line.difference > 0
                        ? 'text-green-600 dark:text-green-400'
                        : line.difference < 0
                        ? 'text-red-600 dark:text-red-400'
                        : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {line.difference > 0 ? '+' : ''}{line.difference}
                    </td>
                    <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {line.notes || '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleRemoveLine(index)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className={`${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
                <tr>
                  <td colSpan={3} className={`px-4 py-3 text-right text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Total Difference:
                  </td>
                  <td className={`px-4 py-3 text-right text-sm font-bold ${
                    totalDifference > 0
                      ? 'text-green-600 dark:text-green-400'
                      : totalDifference < 0
                      ? 'text-red-600 dark:text-red-400'
                      : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {totalDifference > 0 ? '+' : ''}{totalDifference}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button
          variant="ghost"
          size="md"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={handleSubmit}
          disabled={!reason || lines.length === 0 || isSubmitting}
          isLoading={isSubmitting}
        >
          Create Adjustment
        </Button>
      </div>
    </div>
  )
}
