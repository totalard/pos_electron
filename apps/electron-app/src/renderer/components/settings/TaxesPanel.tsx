import { useState, useEffect } from 'react'
import { useAppStore } from '../../stores'

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

export function TaxesPanel() {
  const { theme } = useAppStore()
  const [taxRules, setTaxRules] = useState<TaxRule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingRule, setEditingRule] = useState<TaxRule | null>(null)
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
        setShowAddModal(false)
        setEditingRule(null)
        resetForm()
      }
    } catch (error) {
      console.error('Failed to save tax rule:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this tax rule?')) return
    
    try {
      await fetch(`http://localhost:8001/api/tax-rules/${id}`, { method: 'DELETE' })
      await loadTaxRules()
    } catch (error) {
      console.error('Failed to delete tax rule:', error)
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

  const openEditModal = (rule: TaxRule) => {
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
    setShowAddModal(true)
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
          onClick={() => { resetForm(); setShowAddModal(true) }}
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
                    onClick={() => openEditModal(rule)}
                    className={`px-4 py-2 rounded-lg min-h-[44px] ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(rule.id)}
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

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {editingRule ? 'Edit Tax Rule' : 'Add Tax Rule'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className={`w-full px-4 py-2 rounded-lg min-h-[44px] ${theme === 'dark' ? 'bg-gray-700 border border-gray-600 text-white' : 'bg-white border border-gray-300 text-gray-900'}`} required />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Tax Type</label>
                  <select value={formData.tax_type} onChange={(e) => setFormData({...formData, tax_type: e.target.value})} className={`w-full px-4 py-2 rounded-lg min-h-[44px] ${theme === 'dark' ? 'bg-gray-700 border border-gray-600 text-white' : 'bg-white border border-gray-300 text-gray-900'}`}>
                    <option value="simple">Simple Tax</option>
                    <option value="gst_cgst">GST (CGST+SGST)</option>
                    <option value="gst_igst">GST (IGST)</option>
                    <option value="vat">VAT</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Rate (%)</label>
                    <input type="number" step="0.01" value={formData.rate} onChange={(e) => setFormData({...formData, rate: parseFloat(e.target.value)})} className={`w-full px-4 py-2 rounded-lg min-h-[44px] ${theme === 'dark' ? 'bg-gray-700 border border-gray-600 text-white' : 'bg-white border border-gray-300 text-gray-900'}`} />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Priority</label>
                    <input type="number" value={formData.priority} onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})} className={`w-full px-4 py-2 rounded-lg min-h-[44px] ${theme === 'dark' ? 'bg-gray-700 border border-gray-600 text-white' : 'bg-white border border-gray-300 text-gray-900'}`} />
                  </div>
                </div>
                {formData.tax_type.includes('gst') && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>CGST Rate (%)</label>
                      <input type="number" step="0.01" value={formData.cgst_rate} onChange={(e) => setFormData({...formData, cgst_rate: parseFloat(e.target.value)})} className={`w-full px-4 py-2 rounded-lg min-h-[44px] ${theme === 'dark' ? 'bg-gray-700 border border-gray-600 text-white' : 'bg-white border border-gray-300 text-gray-900'}`} />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>SGST Rate (%)</label>
                      <input type="number" step="0.01" value={formData.sgst_rate} onChange={(e) => setFormData({...formData, sgst_rate: parseFloat(e.target.value)})} className={`w-full px-4 py-2 rounded-lg min-h-[44px] ${theme === 'dark' ? 'bg-gray-700 border border-gray-600 text-white' : 'bg-white border border-gray-300 text-gray-900'}`} />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>IGST Rate (%)</label>
                      <input type="number" step="0.01" value={formData.igst_rate} onChange={(e) => setFormData({...formData, igst_rate: parseFloat(e.target.value)})} className={`w-full px-4 py-2 rounded-lg min-h-[44px] ${theme === 'dark' ? 'bg-gray-700 border border-gray-600 text-white' : 'bg-white border border-gray-300 text-gray-900'}`} />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>CESS Rate (%)</label>
                      <input type="number" step="0.01" value={formData.cess_rate} onChange={(e) => setFormData({...formData, cess_rate: parseFloat(e.target.value)})} className={`w-full px-4 py-2 rounded-lg min-h-[44px] ${theme === 'dark' ? 'bg-gray-700 border border-gray-600 text-white' : 'bg-white border border-gray-300 text-gray-900'}`} />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>HSN Code</label>
                      <input type="text" value={formData.hsn_code} onChange={(e) => setFormData({...formData, hsn_code: e.target.value})} className={`w-full px-4 py-2 rounded-lg min-h-[44px] ${theme === 'dark' ? 'bg-gray-700 border border-gray-600 text-white' : 'bg-white border border-gray-300 text-gray-900'}`} />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>SAC Code</label>
                      <input type="text" value={formData.sac_code} onChange={(e) => setFormData({...formData, sac_code: e.target.value})} className={`w-full px-4 py-2 rounded-lg min-h-[44px] ${theme === 'dark' ? 'bg-gray-700 border border-gray-600 text-white' : 'bg-white border border-gray-300 text-gray-900'}`} />
                    </div>
                  </div>
                )}
                <div className="flex gap-3 pt-4">
                  <button type="submit" className={`flex-1 px-6 py-3 rounded-lg font-medium min-h-[44px] ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}>
                    {editingRule ? 'Update' : 'Create'}
                  </button>
                  <button type="button" onClick={() => { setShowAddModal(false); setEditingRule(null); resetForm() }} className={`flex-1 px-6 py-3 rounded-lg font-medium min-h-[44px] ${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

