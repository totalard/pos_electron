import { useState, useEffect } from 'react'
import { useAppStore } from '../../stores'
import { RightPanel, Input, Button, ConfirmDialog, Toast } from '../common'
import { Select } from '../forms'

interface TaxRule {
  id: number
  name: string
  description?: string
  tax_type: string
  rate: number
  hsn_code?: string
  sac_code?: string
  cgst_rate?: number
  sgst_rate?: number
  igst_rate?: number
  cess_rate?: number
  is_active: boolean
  priority: number
}

type PanelMode = 'closed' | 'add' | 'edit'

export function TaxesPanel() {
  const { theme } = useAppStore()
  const [taxRules, setTaxRules] = useState<TaxRule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [panelMode, setPanelMode] = useState<PanelMode>('closed')
  const [editingRule, setEditingRule] = useState<TaxRule | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; rule: TaxRule | null }>({ show: false, rule: null })
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' })
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tax_type: 'simple',
    rate: 0,
    hsn_code: '',
    sac_code: '',
    cgst_rate: 0,
    sgst_rate: 0,
    igst_rate: 0,
    cess_rate: 0,
    is_active: true,
    priority: 0
  })

  useEffect(() => {
    loadTaxRules()
  }, [])

  const loadTaxRules = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('http://localhost:8001/api/tax-rules/')
      const data = await response.json()
      setTaxRules(data)
    } catch (error) {
      console.error('Failed to load tax rules:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const url = editingRule
        ? `http://localhost:8001/api/tax-rules/${editingRule.id}`
        : 'http://localhost:8001/api/tax-rules/'

      const response = await fetch(url, {
        method: editingRule ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await loadTaxRules()
        closePanel()
      }
    } catch (error) {
      console.error('Failed to save tax rule:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteClick = (rule: TaxRule) => {
    setDeleteConfirm({ show: true, rule })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.rule) return

    try {
      await fetch(`http://localhost:8001/api/tax-rules/${deleteConfirm.rule.id}`, { method: 'DELETE' })
      await loadTaxRules()
      setToast({ show: true, message: 'Tax rule deleted successfully', type: 'success' })
    } catch (error) {
      console.error('Failed to delete tax rule:', error)
      setToast({ show: true, message: 'Failed to delete tax rule. Please try again.', type: 'error' })
    } finally {
      setDeleteConfirm({ show: false, rule: null })
    }
  }

  const handleToggle = async (id: number) => {
    try {
      await fetch(`http://localhost:8001/api/tax-rules/${id}/toggle`, { method: 'POST' })
      await loadTaxRules()
    } catch (error) {
      console.error('Failed to toggle tax rule:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      tax_type: 'simple',
      rate: 0,
      hsn_code: '',
      sac_code: '',
      cgst_rate: 0,
      sgst_rate: 0,
      igst_rate: 0,
      cess_rate: 0,
      is_active: true,
      priority: 0
    })
  }

  const openAddPanel = () => {
    resetForm()
    setEditingRule(null)
    setPanelMode('add')
  }

  const openEditPanel = (rule: TaxRule) => {
    setEditingRule(rule)
    setFormData({
      name: rule.name,
      description: rule.description || '',
      tax_type: rule.tax_type,
      rate: rule.rate,
      hsn_code: rule.hsn_code || '',
      sac_code: rule.sac_code || '',
      cgst_rate: rule.cgst_rate || 0,
      sgst_rate: rule.sgst_rate || 0,
      igst_rate: rule.igst_rate || 0,
      cess_rate: rule.cess_rate || 0,
      is_active: rule.is_active,
      priority: rule.priority
    })
    setPanelMode('edit')
  }

  const closePanel = () => {
    setPanelMode('closed')
    setEditingRule(null)
    resetForm()
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Tax Configuration
          </h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage tax rules with GST support
          </p>
        </div>
        <button
          onClick={openAddPanel}
          className={`px-6 py-3 rounded-lg font-medium min-h-[44px] transition-all ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
        >
          Add Tax Rule
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${theme === 'dark' ? 'border-blue-400' : 'border-blue-600'}`} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {taxRules.map((rule) => (
            <div key={rule.id} className={`p-4 rounded-lg border-2 ${theme === 'dark' ? 'bg-gray-700/30 border-gray-600' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {rule.name}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${rule.is_active ? theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600' : theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                      {rule.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                      {rule.tax_type.toUpperCase()}
                    </span>
                  </div>
                  {rule.description && (
                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {rule.description}
                    </p>
                  )}
                  <div className={`flex gap-4 mt-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span>Rate: {rule.rate}%</span>
                    {rule.cgst_rate && <span>CGST: {rule.cgst_rate}%</span>}
                    {rule.sgst_rate && <span>SGST: {rule.sgst_rate}%</span>}
                    {rule.igst_rate && <span>IGST: {rule.igst_rate}%</span>}
                    {rule.cess_rate && <span>CESS: {rule.cess_rate}%</span>}
                    {rule.hsn_code && <span>HSN: {rule.hsn_code}</span>}
                    {rule.sac_code && <span>SAC: {rule.sac_code}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggle(rule.id)}
                    className={`px-4 py-2 rounded-lg min-h-[44px] ${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
                  >
                    {rule.is_active ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => openEditPanel(rule)}
                    className={`px-4 py-2 rounded-lg min-h-[44px] ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(rule)}
                    className={`px-4 py-2 rounded-lg min-h-[44px] ${theme === 'dark' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Tax Rule Panel */}
      <RightPanel
        isOpen={panelMode !== 'closed'}
        onClose={closePanel}
        title={panelMode === 'add' ? 'Add Tax Rule' : 'Edit Tax Rule'}
        width="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <Input
            label="Tax Rule Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
            placeholder="Enter tax rule name"
          />

          {/* Description */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={2}
              className={`
                w-full px-4 py-3 rounded-lg border transition-colors resize-none
                ${theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500/20
              `}
              placeholder="Optional description"
            />
          </div>

          {/* Tax Type */}
          <Select
            label="Tax Type"
            value={formData.tax_type}
            onChange={(e) => setFormData({...formData, tax_type: e.target.value})}
            options={[
              { value: 'simple', label: 'Simple Tax' },
              { value: 'gst_cgst', label: 'GST (CGST+SGST)' },
              { value: 'gst_igst', label: 'GST (IGST)' },
              { value: 'vat', label: 'VAT' }
            ]}
          />

          {/* Rate and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tax Rate (%)"
              type="number"
              step="0.01"
              value={formData.rate.toString()}
              onChange={(e) => setFormData({...formData, rate: parseFloat(e.target.value) || 0})}
              placeholder="0.00"
            />
            <Input
              label="Priority"
              type="number"
              value={formData.priority.toString()}
              onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value) || 0})}
              placeholder="0"
            />
          </div>
          {/* GST Fields - Show only when tax type includes 'gst' */}
          {formData.tax_type.includes('gst') && (
            <div className="space-y-4">
              <h4 className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                GST Details
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="CGST Rate (%)"
                  type="number"
                  step="0.01"
                  value={formData.cgst_rate.toString()}
                  onChange={(e) => setFormData({...formData, cgst_rate: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                />
                <Input
                  label="SGST Rate (%)"
                  type="number"
                  step="0.01"
                  value={formData.sgst_rate.toString()}
                  onChange={(e) => setFormData({...formData, sgst_rate: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                />
                <Input
                  label="IGST Rate (%)"
                  type="number"
                  step="0.01"
                  value={formData.igst_rate.toString()}
                  onChange={(e) => setFormData({...formData, igst_rate: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                />
                <Input
                  label="CESS Rate (%)"
                  type="number"
                  step="0.01"
                  value={formData.cess_rate.toString()}
                  onChange={(e) => setFormData({...formData, cess_rate: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                />
                <Input
                  label="HSN Code"
                  value={formData.hsn_code}
                  onChange={(e) => setFormData({...formData, hsn_code: e.target.value})}
                  placeholder="Enter HSN code"
                />
                <Input
                  label="SAC Code"
                  value={formData.sac_code}
                  onChange={(e) => setFormData({...formData, sac_code: e.target.value})}
                  placeholder="Enter SAC code"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isSaving}
              disabled={isSaving}
            >
              {panelMode === 'add' ? 'Create Tax Rule' : 'Update Tax Rule'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={closePanel}
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>
        </form>
      </RightPanel>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, rule: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Tax Rule"
        message={`Are you sure you want to delete "${deleteConfirm.rule?.name}"? This action cannot be undone.`}
        variant="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Toast Notification */}
      <Toast
        isOpen={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
        message={toast.message}
        type={toast.type}
        duration={3000}
      />
    </div>
  )
}

