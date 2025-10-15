import { useState, useEffect } from 'react'
import { useAppStore } from '../../stores'

interface TaxRate {
  id: string
  country: string
  region: string
  rate: number
  description: string
}

export function TaxTab() {
  const { theme } = useAppStore()
  const [taxRates, setTaxRates] = useState<TaxRate[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [newTax, setNewTax] = useState({ country: '', region: '', rate: 0, description: '' })
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Load saved tax rates from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('taxRates')
    if (saved) {
      try {
        setTaxRates(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to load tax rates:', error)
      }
    } else {
      // Default tax rates
      setTaxRates([
        { id: '1', country: 'United States', region: 'Federal', rate: 0, description: 'No federal sales tax' },
        { id: '2', country: 'United States', region: 'California', rate: 7.25, description: 'State sales tax' },
      ])
    }
  }, [])

  const handleAddTax = () => {
    if (!newTax.country || !newTax.region || newTax.rate < 0) {
      setSaveMessage({ type: 'error', text: 'Please fill in all required fields' })
      return
    }

    const tax: TaxRate = {
      id: Date.now().toString(),
      ...newTax
    }

    const updated = [...taxRates, tax]
    setTaxRates(updated)
    localStorage.setItem('taxRates', JSON.stringify(updated))
    
    setNewTax({ country: '', region: '', rate: 0, description: '' })
    setIsAdding(false)
    setSaveMessage({ type: 'success', text: 'Tax rate added successfully!' })
    setTimeout(() => setSaveMessage(null), 3000)
  }

  const handleDeleteTax = (id: string) => {
    const updated = taxRates.filter(t => t.id !== id)
    setTaxRates(updated)
    localStorage.setItem('taxRates', JSON.stringify(updated))
    setSaveMessage({ type: 'success', text: 'Tax rate deleted successfully!' })
    setTimeout(() => setSaveMessage(null), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Tax Settings
          </h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Configure tax rates for different countries and regions
          </p>
        </div>
        {/* Touch-safe button: 56px height */}
        <button
          onClick={() => setIsAdding(!isAdding)}
          className={`
            px-6 py-4 rounded-lg font-medium transition-colors flex items-center gap-2 text-base min-h-[56px]
            ${theme === 'dark'
              ? 'bg-primary-600 hover:bg-primary-700 text-white'
              : 'bg-primary-500 hover:bg-primary-600 text-white'
            }
          `}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Tax Rate
        </button>
      </div>

      {/* Add Tax Form */}
      {isAdding && (
        <div className={`
          p-6 rounded-lg space-y-4
          ${theme === 'dark'
            ? 'bg-gray-700/30 border border-gray-600'
            : 'bg-gray-50 border border-gray-200'
          }
        `}>
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            New Tax Rate
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Country *
              </label>
              {/* Touch-safe input: 56px height */}
              <input
                type="text"
                value={newTax.country}
                onChange={(e) => setNewTax({ ...newTax, country: e.target.value })}
                placeholder="United States"
                className={`
                  w-full px-4 py-4 rounded-lg border text-base min-h-[56px]
                  ${theme === 'dark'
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-primary-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-primary-500'
                  }
                  focus:outline-none focus:ring-2 focus:ring-primary-500/20
                `}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Region/State *
              </label>
              {/* Touch-safe input: 56px height */}
              <input
                type="text"
                value={newTax.region}
                onChange={(e) => setNewTax({ ...newTax, region: e.target.value })}
                placeholder="California"
                className={`
                  w-full px-4 py-4 rounded-lg border text-base min-h-[56px]
                  ${theme === 'dark'
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-primary-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-primary-500'
                  }
                  focus:outline-none focus:ring-2 focus:ring-primary-500/20
                `}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Tax Rate (%) *
              </label>
              {/* Touch-safe input: 56px height */}
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={newTax.rate}
                onChange={(e) => setNewTax({ ...newTax, rate: parseFloat(e.target.value) || 0 })}
                placeholder="7.25"
                className={`
                  w-full px-4 py-4 rounded-lg border text-base min-h-[56px]
                  ${theme === 'dark'
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-primary-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-primary-500'
                  }
                  focus:outline-none focus:ring-2 focus:ring-primary-500/20
                `}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Description
              </label>
              {/* Touch-safe input: 56px height */}
              <input
                type="text"
                value={newTax.description}
                onChange={(e) => setNewTax({ ...newTax, description: e.target.value })}
                placeholder="State sales tax"
                className={`
                  w-full px-4 py-4 rounded-lg border text-base min-h-[56px]
                  ${theme === 'dark'
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-primary-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-primary-500'
                  }
                  focus:outline-none focus:ring-2 focus:ring-primary-500/20
                `}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            {/* Touch-safe buttons: 56px height */}
            <button
              onClick={() => setIsAdding(false)}
              className={`
                px-6 py-4 rounded-lg font-medium transition-colors text-base min-h-[56px]
                ${theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }
              `}
            >
              Cancel
            </button>
            <button
              onClick={handleAddTax}
              className={`
                px-6 py-4 rounded-lg font-medium transition-colors text-base min-h-[56px]
                ${theme === 'dark'
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-primary-500 hover:bg-primary-600 text-white'
                }
              `}
            >
              Add Tax Rate
            </button>
          </div>
        </div>
      )}

      {/* Tax Rates List */}
      <div className="space-y-3">
        {taxRates.map((tax) => (
          <div
            key={tax.id}
            className={`
              p-4 rounded-lg flex items-center justify-between
              ${theme === 'dark'
                ? 'bg-gray-700/30 border border-gray-600'
                : 'bg-gray-50 border border-gray-200'
              }
            `}
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {tax.country} - {tax.region}
                </h4>
                <span className={`
                  px-3 py-1 rounded-full text-sm font-medium
                  ${theme === 'dark'
                    ? 'bg-primary-900/30 text-primary-400'
                    : 'bg-primary-100 text-primary-700'
                  }
                `}>
                  {tax.rate}%
                </span>
              </div>
              {tax.description && (
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {tax.description}
                </p>
              )}
            </div>
            {/* Touch-safe delete button: 48x48px */}
            <button
              onClick={() => handleDeleteTax(tax.id)}
              className={`
                p-3 rounded-lg transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center
                ${theme === 'dark'
                  ? 'hover:bg-red-900/30 text-red-400'
                  : 'hover:bg-red-50 text-red-600'
                }
              `}
              title="Delete"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`
          p-4 rounded-lg flex items-center gap-3
          ${saveMessage.type === 'success'
            ? theme === 'dark'
              ? 'bg-green-900/20 border border-green-700 text-green-400'
              : 'bg-green-50 border border-green-200 text-green-700'
            : theme === 'dark'
              ? 'bg-red-900/20 border border-red-700 text-red-400'
              : 'bg-red-50 border border-red-200 text-red-700'
          }
        `}>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            {saveMessage.type === 'success' ? (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            )}
          </svg>
          <span className="text-sm font-medium">{saveMessage.text}</span>
        </div>
      )}
    </div>
  )
}

