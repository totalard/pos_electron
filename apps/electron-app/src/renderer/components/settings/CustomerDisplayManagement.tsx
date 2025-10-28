/**
 * Customer Display Management Component
 * Manages multiple customer displays with carousel ads
 */

import { useState } from 'react'
import { useAppStore, useSettingsStore } from '../../stores'
import type { CustomerDisplayConfiguration, AdContent } from '../../stores/settingsStore'
import { FormSection } from '../forms/FormSection'
import { TouchSelect } from '../forms/TouchSelect'
import { TextInput } from '../forms/TextInput'
import { Toggle } from '../forms/Toggle'

export function CustomerDisplayManagement() {
  const { theme } = useAppStore()
  const {
    hardware,
    addCustomerDisplay,
    updateCustomerDisplay,
    removeCustomerDisplay,
    updateDisplayCarousel,
    addCarouselAd,
    removeCarouselAd
  } = useSettingsStore()

  const [showAddDisplay, setShowAddDisplay] = useState(false)
  const [editingDisplay, setEditingDisplay] = useState<string | null>(null)
  const [selectedDisplay, setSelectedDisplay] = useState<string | null>(null)
  const [showAddAd, setShowAddAd] = useState(false)

  const [displayForm, setDisplayForm] = useState({
    name: '',
    enabled: true,
    type: 'Monitor' as const,
    connection: 'HDMI' as const,
    port: '',
    address: '',
    showItems: true,
    showTotal: true,
    showPromo: true,
    fontSize: 'Medium' as const,
    carousel: {
      enabled: false,
      slideDuration: 5,
      transitionEffect: 'fade' as const,
      adContent: []
    }
  })

  const [adForm, setAdForm] = useState({
    type: 'image' as const,
    url: '',
    text: '',
    duration: 5,
    order: 1
  })

  const resetDisplayForm = () => {
    setDisplayForm({
      name: '',
      enabled: true,
      type: 'Monitor',
      connection: 'HDMI',
      port: '',
      address: '',
      showItems: true,
      showTotal: true,
      showPromo: true,
      fontSize: 'Medium',
      carousel: {
        enabled: false,
        slideDuration: 5,
        transitionEffect: 'fade',
        adContent: []
      }
    })
    setEditingDisplay(null)
    setShowAddDisplay(false)
  }

  const handleAddDisplay = async () => {
    await addCustomerDisplay(displayForm)
    resetDisplayForm()
  }

  const handleUpdateDisplay = async (id: string) => {
    await updateCustomerDisplay(id, displayForm)
    resetDisplayForm()
  }

  const handleEditDisplay = (display: CustomerDisplayConfiguration) => {
    setDisplayForm(display)
    setEditingDisplay(display.id)
    setShowAddDisplay(true)
  }

  const handleRemoveDisplay = async (id: string) => {
    if (confirm('Are you sure you want to remove this customer display?')) {
      await removeCustomerDisplay(id)
      if (selectedDisplay === id) {
        setSelectedDisplay(null)
      }
    }
  }

  const handleAddAd = async () => {
    if (selectedDisplay) {
      await addCarouselAd(selectedDisplay, adForm)
      setAdForm({
        type: 'image',
        url: '',
        text: '',
        duration: 5,
        order: 1
      })
      setShowAddAd(false)
    }
  }

  const handleRemoveAd = async (adId: string) => {
    if (selectedDisplay && confirm('Remove this ad from carousel?')) {
      await removeCarouselAd(selectedDisplay, adId)
    }
  }

  const currentDisplay = hardware.customerDisplays.find(d => d.id === selectedDisplay)

  return (
    <div className="space-y-6">
      {/* Customer Displays List */}
      <FormSection
        title="Customer Displays"
        description="Manage multiple customer-facing displays"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {hardware.customerDisplays.length} display(s) configured
            </p>
            <button
              onClick={() => setShowAddDisplay(true)}
              className={`px-4 py-2 rounded-lg font-medium ${
                theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              + Add Display
            </button>
          </div>

          {/* Displays Grid */}
          {hardware.customerDisplays.map((display) => (
            <div
              key={display.id}
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                selectedDisplay === display.id
                  ? theme === 'dark'
                    ? 'bg-blue-900/20 border-blue-500'
                    : 'bg-blue-50 border-blue-500'
                  : theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedDisplay(display.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {display.name}
                    </h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      display.enabled
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {display.enabled ? 'Active' : 'Disabled'}
                    </span>
                    {display.carousel.enabled && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                        Carousel: {display.carousel.adContent.length} ads
                      </span>
                    )}
                  </div>
                  <div className={`text-sm mt-2 space-y-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <p>Type: {display.type} • Connection: {display.connection}</p>
                    <p>Font: {display.fontSize} • Items: {display.showItems ? 'Yes' : 'No'}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditDisplay(display)
                    }}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      theme === 'dark'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveDisplay(display.id)
                    }}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      theme === 'dark'
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add/Edit Display Form */}
          {showAddDisplay && (
            <div className={`p-4 rounded-lg border-2 ${
              theme === 'dark' ? 'bg-gray-800 border-blue-500' : 'bg-blue-50 border-blue-500'
            }`}>
              <h4 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {editingDisplay ? 'Edit Display' : 'Add Display'}
              </h4>
              <div className="space-y-4">
                <TextInput
                  type="text"
                  label="Display Name"
                  value={displayForm.name}
                  onChange={(e: any) => setDisplayForm({ ...displayForm, name: e.target.value })}
                  placeholder="e.g., Main Customer Display"
                />

                <TouchSelect
                  label="Display Type"
                  value={displayForm.type}
                  onChange={(value: any) => setDisplayForm({ ...displayForm, type: value })}
                  options={[
                    { value: 'Monitor', label: 'Monitor/Screen' },
                    { value: 'Pole Display', label: 'Pole Display' },
                    { value: 'Tablet', label: 'Tablet' }
                  ]}
                />

                <TouchSelect
                  label="Connection"
                  value={displayForm.connection}
                  onChange={(value: any) => setDisplayForm({ ...displayForm, connection: value })}
                  options={[
                    { value: 'HDMI', label: 'HDMI' },
                    { value: 'USB', label: 'USB' },
                    { value: 'Network', label: 'Network (IP)' }
                  ]}
                />

                {displayForm.connection === 'Network' && (
                  <TextInput
                    type="text"
                    label="IP Address"
                    value={displayForm.address}
                    onChange={(e: any) => setDisplayForm({ ...displayForm, address: e.target.value })}
                    placeholder="192.168.1.100"
                  />
                )}

                <TouchSelect
                  label="Font Size"
                  value={displayForm.fontSize}
                  onChange={(value: any) => setDisplayForm({ ...displayForm, fontSize: value })}
                  options={[
                    { value: 'Small', label: 'Small' },
                    { value: 'Medium', label: 'Medium' },
                    { value: 'Large', label: 'Large' }
                  ]}
                />

                <div className="grid grid-cols-3 gap-4">
                  <Toggle
                    checked={displayForm.showItems}
                    onChange={(checked: any) => setDisplayForm({ ...displayForm, showItems: checked })}
                    label="Show Items"
                  />
                  <Toggle
                    checked={displayForm.showTotal}
                    onChange={(checked: any) => setDisplayForm({ ...displayForm, showTotal: checked })}
                    label="Show Total"
                  />
                  <Toggle
                    checked={displayForm.showPromo}
                    onChange={(checked: any) => setDisplayForm({ ...displayForm, showPromo: checked })}
                    label="Show Promos"
                  />
                </div>

                <Toggle
                  checked={displayForm.enabled}
                  onChange={(checked: any) => setDisplayForm({ ...displayForm, enabled: checked })}
                  label="Enable Display"
                />

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => editingDisplay ? handleUpdateDisplay(editingDisplay) : handleAddDisplay()}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                      theme === 'dark'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    {editingDisplay ? 'Update' : 'Add'} Display
                  </button>
                  <button
                    onClick={resetDisplayForm}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </FormSection>

      {/* Carousel Management */}
      {currentDisplay && (
        <FormSection
          title={`Carousel Settings - ${currentDisplay.name}`}
          description="Configure advertisement carousel for idle display"
        >
          <div className="space-y-4">
            <Toggle
              checked={currentDisplay.carousel.enabled}
              onChange={(checked: any) => updateDisplayCarousel(currentDisplay.id, { enabled: checked })}
              label="Enable Carousel"
              description="Show rotating ads when POS is idle"
            />

            {currentDisplay.carousel.enabled && (
              <>
                <TextInput
                  type="number"
                  label="Slide Duration (seconds)"
                  value={currentDisplay.carousel.slideDuration.toString()}
                  onChange={(e: any) => updateDisplayCarousel(currentDisplay.id, { slideDuration: parseInt(e.target.value) })}
                />

                <TouchSelect
                  label="Transition Effect"
                  value={currentDisplay.carousel.transitionEffect}
                  onChange={(value: any) => updateDisplayCarousel(currentDisplay.id, { transitionEffect: value })}
                  options={[
                    { value: 'fade', label: 'Fade' },
                    { value: 'slide', label: 'Slide' },
                    { value: 'none', label: 'None' }
                  ]}
                />

                {/* Ad Content Management */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Advertisement Content ({currentDisplay.carousel.adContent.length})
                    </h5>
                    <button
                      onClick={() => setShowAddAd(true)}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        theme === 'dark'
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-purple-500 hover:bg-purple-600 text-white'
                      }`}
                    >
                      + Add Ad
                    </button>
                  </div>

                  {/* Ad List */}
                  <div className="space-y-2">
                    {currentDisplay.carousel.adContent
                      .sort((a, b) => a.order - b.order)
                      .map((ad) => (
                        <div
                          key={ad.id}
                          className={`p-3 rounded border flex items-center justify-between ${
                            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex-1">
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {ad.type === 'image' ? '🖼️ Image' : ad.type === 'video' ? '🎥 Video' : '📝 Text'}
                            </p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {ad.url || ad.text || 'No content'} • Order: {ad.order}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveAd(ad.id)}
                            className="px-2 py-1 rounded text-xs font-medium bg-red-500 hover:bg-red-600 text-white"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                  </div>

                  {/* Add Ad Form */}
                  {showAddAd && (
                    <div className={`mt-4 p-4 rounded border-2 ${
                      theme === 'dark' ? 'bg-gray-800 border-purple-500' : 'bg-purple-50 border-purple-500'
                    }`}>
                      <h6 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Add Advertisement
                      </h6>
                      <div className="space-y-3">
                        <TouchSelect
                          label="Ad Type"
                          value={adForm.type}
                          onChange={(value: any) => setAdForm({ ...adForm, type: value })}
                          options={[
                            { value: 'image', label: 'Image' },
                            { value: 'video', label: 'Video' },
                            { value: 'text', label: 'Text' }
                          ]}
                        />

                        {(adForm.type === 'image' || adForm.type === 'video') && (
                          <TextInput
                            type="text"
                            label="URL"
                            value={adForm.url}
                            onChange={(e: any) => setAdForm({ ...adForm, url: e.target.value })}
                            placeholder="https://example.com/ad.jpg"
                          />
                        )}

                        {adForm.type === 'text' && (
                          <TextInput
                            type="text"
                            label="Text Content"
                            value={adForm.text}
                            onChange={(e: any) => setAdForm({ ...adForm, text: e.target.value })}
                            placeholder="Your promotional message"
                          />
                        )}

                        <TextInput
                          type="number"
                          label="Display Order"
                          value={adForm.order.toString()}
                          onChange={(e: any) => setAdForm({ ...adForm, order: parseInt(e.target.value) })}
                        />

                        <div className="flex gap-2">
                          <button
                            onClick={handleAddAd}
                            className={`flex-1 px-3 py-2 rounded font-medium ${
                              theme === 'dark'
                                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                : 'bg-purple-500 hover:bg-purple-600 text-white'
                            }`}
                          >
                            Add
                          </button>
                          <button
                            onClick={() => setShowAddAd(false)}
                            className={`px-3 py-2 rounded font-medium ${
                              theme === 'dark'
                                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                            }`}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </FormSection>
      )}
    </div>
  )
}
