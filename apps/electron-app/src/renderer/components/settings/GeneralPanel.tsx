import { useState } from 'react'
import { useAppStore, useSettingsStore } from '../../stores'
import { Toast } from '../common'
import { FormSection, TextInput, TouchSelect } from '../forms'

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

      <FormSection
        title="Business Information"
        description="Enter your business details"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput
            label="Store Name"
            type="text"
            value={general.storeName}
            onChange={(e) => handleInputChange('storeName', e.target.value)}
            placeholder="Enter store name"
          />
          <TextInput
            label="Business Name"
            type="text"
            value={general.businessName}
            onChange={(e) => handleInputChange('businessName', e.target.value)}
            placeholder="Enter business name"
          />
          <div className="md:col-span-2">
            <TextInput
              label="Street Address"
              type="text"
              value={general.storeAddress}
              onChange={(e) => handleInputChange('storeAddress', e.target.value)}
              placeholder="Enter street address"
            />
          </div>
          <TextInput
            label="City"
            type="text"
            value={general.storeCity}
            onChange={(e) => handleInputChange('storeCity', e.target.value)}
            placeholder="Enter city"
          />
          <TextInput
            label="State/Province"
            type="text"
            value={general.storeState}
            onChange={(e) => handleInputChange('storeState', e.target.value)}
            placeholder="Enter state/province"
          />
          <TextInput
            label="ZIP/Postal Code"
            type="text"
            value={general.storeZip}
            onChange={(e) => handleInputChange('storeZip', e.target.value)}
            placeholder="Enter ZIP/postal code"
          />
          <TextInput
            label="Country"
            type="text"
            value={general.storeCountry}
            onChange={(e) => handleInputChange('storeCountry', e.target.value)}
            placeholder="Enter country"
          />
        </div>
      </FormSection>

      <FormSection
        title="Contact Information"
        description="Enter your contact details"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextInput
            label="Phone Number"
            type="tel"
            value={general.storePhone}
            onChange={(e) => handleInputChange('storePhone', e.target.value)}
            placeholder="Enter phone number"
          />
          <TextInput
            label="Email Address"
            type="email"
            value={general.storeEmail}
            onChange={(e) => handleInputChange('storeEmail', e.target.value)}
            placeholder="Enter email address"
          />
          <TextInput
            label="Website"
            type="url"
            value={general.storeWebsite}
            onChange={(e) => handleInputChange('storeWebsite', e.target.value)}
            placeholder="Enter website URL"
          />
        </div>
      </FormSection>

      <FormSection
        title="Regional Settings"
        description="Configure language preferences"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TouchSelect
            label="Language"
            value={general.language}
            options={[
              { value: 'en', label: 'English' },
              { value: 'es', label: 'Spanish' },
              { value: 'fr', label: 'French' },
              { value: 'ar', label: 'Arabic' }
            ]}
            onChange={(value) => handleInputChange('language', value as string)}
            placeholder="Select language"
          />
          <div className="flex items-center">
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              💡 Currency and Timezone settings are available in the Business section
            </p>
          </div>
        </div>
      </FormSection>

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
