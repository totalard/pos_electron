import { useState } from 'react'
import { useAppStore, useSettingsStore } from '../../stores'
import { Toast } from '../common'

export function GeneralPanel() {
  const { theme } = useAppStore()
  const { general, updateGeneralSettings } = useSettingsStore()
  const [logoPreview, setLogoPreview] = useState<string>(general.logoUrl || '')
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'warning' }>({ show: false, message: '', type: 'success' })

  const handleInputChange = (field: keyof typeof general, value: string) => {
    updateGeneralSettings({ [field]: value })
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setToast({ show: true, message: 'Please select an image file', type: 'warning' })
        return
      }
      if (file.size > 2 * 1024 * 1024) {
        setToast({ show: true, message: 'Image size should be less than 2MB', type: 'warning' })
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setLogoPreview(result)
        updateGeneralSettings({ logoUrl: result })
        setToast({ show: true, message: 'Logo uploaded successfully', type: 'success' })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          General Settings
        </h2>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Configure basic application settings and store information
        </p>
      </div>

      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Store Logo
        </h3>
        <div className="flex items-center gap-6">
          <div className={`w-32 h-32 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden ${theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'}`}>
            {logoPreview ? (
              <img src={logoPreview} alt="Store Logo" className="w-full h-full object-contain" />
            ) : (
              <svg className={`w-12 h-12 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <label className={`inline-block px-6 py-3 rounded-lg font-medium cursor-pointer min-h-[44px] transition-all duration-200 ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}>
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              Upload Logo
            </label>
            <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Recommended: PNG or JPG, max 2MB
            </p>
          </div>
        </div>
      </div>

      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Business Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Store Name</label>
            <input type="text" value={general.storeName} onChange={(e) => handleInputChange('storeName', e.target.value)} className={`w-full px-4 py-2 rounded-lg min-h-[44px] ${theme === 'dark' ? 'bg-gray-800 border border-gray-600 text-white focus:border-blue-500' : 'bg-white border border-gray-300 text-gray-900 focus:border-blue-500'} focus:outline-none focus:ring-2 focus:ring-blue-500/20`} placeholder="Enter store name" />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Business Name</label>
            <input type="text" value={general.businessName} onChange={(e) => handleInputChange('businessName', e.target.value)} className={`w-full px-4 py-2 rounded-lg min-h-[44px] ${theme === 'dark' ? 'bg-gray-800 border border-gray-600 text-white focus:border-blue-500' : 'bg-white border border-gray-300 text-gray-900 focus:border-blue-500'} focus:outline-none focus:ring-2 focus:ring-blue-500/20`} placeholder="Enter business name" />
          </div>
          <div className="md:col-span-2">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Street Address</label>
            <input type="text" value={general.storeAddress} onChange={(e) => handleInputChange('storeAddress', e.target.value)} className={`w-full px-4 py-2 rounded-lg min-h-[44px] ${theme === 'dark' ? 'bg-gray-800 border border-gray-600 text-white focus:border-blue-500' : 'bg-white border border-gray-300 text-gray-900 focus:border-blue-500'} focus:outline-none focus:ring-2 focus:ring-blue-500/20`} placeholder="Enter street address" />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>City</label>
            <input type="text" value={general.storeCity} onChange={(e) => handleInputChange('storeCity', e.target.value)} className={`w-full px-4 py-2 rounded-lg min-h-[44px] ${theme === 'dark' ? 'bg-gray-800 border border-gray-600 text-white focus:border-blue-500' : 'bg-white border border-gray-300 text-gray-900 focus:border-blue-500'} focus:outline-none focus:ring-2 focus:ring-blue-500/20`} placeholder="Enter city" />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>State/Province</label>
            <input type="text" value={general.storeState} onChange={(e) => handleInputChange('storeState', e.target.value)} className={`w-full px-4 py-2 rounded-lg min-h-[44px] ${theme === 'dark' ? 'bg-gray-800 border border-gray-600 text-white focus:border-blue-500' : 'bg-white border border-gray-300 text-gray-900 focus:border-blue-500'} focus:outline-none focus:ring-2 focus:ring-blue-500/20`} placeholder="Enter state/province" />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>ZIP/Postal Code</label>
            <input type="text" value={general.storeZip} onChange={(e) => handleInputChange('storeZip', e.target.value)} className={`w-full px-4 py-2 rounded-lg min-h-[44px] ${theme === 'dark' ? 'bg-gray-800 border border-gray-600 text-white focus:border-blue-500' : 'bg-white border border-gray-300 text-gray-900 focus:border-blue-500'} focus:outline-none focus:ring-2 focus:ring-blue-500/20`} placeholder="Enter ZIP/postal code" />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Country</label>
            <input type="text" value={general.storeCountry} onChange={(e) => handleInputChange('storeCountry', e.target.value)} className={`w-full px-4 py-2 rounded-lg min-h-[44px] ${theme === 'dark' ? 'bg-gray-800 border border-gray-600 text-white focus:border-blue-500' : 'bg-white border border-gray-300 text-gray-900 focus:border-blue-500'} focus:outline-none focus:ring-2 focus:ring-blue-500/20`} placeholder="Enter country" />
          </div>
        </div>
      </div>

      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Phone Number</label>
            <input type="tel" value={general.storePhone} onChange={(e) => handleInputChange('storePhone', e.target.value)} className={`w-full px-4 py-2 rounded-lg min-h-[44px] ${theme === 'dark' ? 'bg-gray-800 border border-gray-600 text-white focus:border-blue-500' : 'bg-white border border-gray-300 text-gray-900 focus:border-blue-500'} focus:outline-none focus:ring-2 focus:ring-blue-500/20`} placeholder="Enter phone number" />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Email Address</label>
            <input type="email" value={general.storeEmail} onChange={(e) => handleInputChange('storeEmail', e.target.value)} className={`w-full px-4 py-2 rounded-lg min-h-[44px] ${theme === 'dark' ? 'bg-gray-800 border border-gray-600 text-white focus:border-blue-500' : 'bg-white border border-gray-300 text-gray-900 focus:border-blue-500'} focus:outline-none focus:ring-2 focus:ring-blue-500/20`} placeholder="Enter email address" />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Website</label>
            <input type="url" value={general.storeWebsite} onChange={(e) => handleInputChange('storeWebsite', e.target.value)} className={`w-full px-4 py-2 rounded-lg min-h-[44px] ${theme === 'dark' ? 'bg-gray-800 border border-gray-600 text-white focus:border-blue-500' : 'bg-white border border-gray-300 text-gray-900 focus:border-blue-500'} focus:outline-none focus:ring-2 focus:ring-blue-500/20`} placeholder="Enter website URL" />
          </div>
        </div>
      </div>

      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Regional Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Language</label>
            <select value={general.language} onChange={(e) => handleInputChange('language', e.target.value)} className={`w-full px-4 py-2 rounded-lg min-h-[44px] ${theme === 'dark' ? 'bg-gray-800 border border-gray-600 text-white focus:border-blue-500' : 'bg-white border border-gray-300 text-gray-900 focus:border-blue-500'} focus:outline-none focus:ring-2 focus:ring-blue-500/20`}>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="ar">Arabic</option>
            </select>
          </div>
          <div>
            <p className={`text-sm mt-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              💡 Currency and Timezone settings are available in the Business section
            </p>
          </div>
        </div>
      </div>

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
