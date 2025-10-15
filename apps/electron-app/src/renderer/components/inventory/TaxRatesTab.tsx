import { useAppStore } from '../../stores'

export function TaxRatesTab() {
  const { theme } = useAppStore()

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Tax Rates
          </h1>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Configure tax rates and HSN codes for products
          </p>
        </div>
        
        <button className={`
          px-4 py-2 rounded-lg font-medium transition-colors
          ${theme === 'dark'
            ? 'bg-primary-600 hover:bg-primary-700 text-white'
            : 'bg-primary-600 hover:bg-primary-700 text-white'
          }
        `}>
          <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Tax Rate
        </button>
      </div>

      {/* Coming Soon */}
      <div className="text-center py-12">
        <svg className={`mx-auto h-12 w-12 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <h3 className={`mt-2 text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
          Tax Rate Management
        </h3>
        <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
          Tax rate configuration with HSN code support coming soon.
        </p>
      </div>
    </div>
  )
}
