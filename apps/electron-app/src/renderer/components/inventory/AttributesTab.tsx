import { useAppStore } from '../../stores'

export function AttributesTab() {
  const { theme } = useAppStore()

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Product Attributes
          </h1>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Define attributes like size, color for product variations
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
          Add Attribute
        </button>
      </div>

      {/* Coming Soon */}
      <div className="text-center py-12">
        <svg className={`mx-auto h-12 w-12 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        <h3 className={`mt-2 text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
          Attribute Management
        </h3>
        <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
          Product attribute and variation management coming soon.
        </p>
      </div>
    </div>
  )
}
