import { useState, useEffect } from 'react'
import { useAppStore, usePinStore } from '../../stores'
import { settingsAPI } from '../../services/api'

const dateFormats = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)', example: '12/31/2024' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (EU)', example: '31/12/2024' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)', example: '2024-12-31' },
  { value: 'DD MMM YYYY', label: 'DD MMM YYYY', example: '31 Dec 2024' },
]

const fontSizes = [
  { value: 'small', label: 'Small', size: '14px' },
  { value: 'medium', label: 'Medium (Default)', size: '16px' },
  { value: 'large', label: 'Large', size: '18px' },
  { value: 'xlarge', label: 'Extra Large', size: '20px' },
]

const colorBlindModes = [
  { value: 'none', label: 'None', description: 'Standard colors' },
  { value: 'protanopia', label: 'Protanopia', description: 'Red-blind' },
  { value: 'deuteranopia', label: 'Deuteranopia', description: 'Green-blind' },
  { value: 'tritanopia', label: 'Tritanopia', description: 'Blue-blind' },
]

export function AccessibilityTab() {
  const { theme, toggleTheme } = useAppStore()
  const { currentUser } = usePinStore()
  
  // Settings state
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY')
  const [fontSize, setFontSize] = useState('medium')
  const [highContrast, setHighContrast] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [colorBlindMode, setColorBlindMode] = useState('none')
  const [enableScreenReader, setEnableScreenReader] = useState(false)
  const [enableKeyboardShortcuts, setEnableKeyboardShortcuts] = useState(true)
  
  // UI state
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Load settings from backend
  useEffect(() => {
    if (currentUser) {
      loadSettings()
    }
  }, [currentUser])

  const loadSettings = async () => {
    if (!currentUser) return
    
    try {
      setIsLoading(true)
      const settings = await settingsAPI.getUserSettings(currentUser.id)
      
      setDateFormat(settings.date_format)
      setFontSize(settings.font_size)
      setHighContrast(settings.high_contrast)
      setReducedMotion(settings.reduced_motion)
      setColorBlindMode(settings.color_blind_mode)
      setEnableScreenReader(settings.enable_screen_reader)
      setEnableKeyboardShortcuts(settings.enable_keyboard_shortcuts)
      
      // Apply font size to document
      const selectedSize = fontSizes.find(f => f.value === settings.font_size)
      if (selectedSize) {
        document.documentElement.style.fontSize = selectedSize.size
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
      setSaveMessage({ type: 'error', text: 'Failed to load settings' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!currentUser) return
    
    setIsSaving(true)
    setSaveMessage(null)

    try {
      await settingsAPI.updateUserSettings(currentUser.id, {
        date_format: dateFormat,
        font_size: fontSize,
        high_contrast: highContrast,
        reduced_motion: reducedMotion,
        color_blind_mode: colorBlindMode,
        enable_screen_reader: enableScreenReader,
        enable_keyboard_shortcuts: enableKeyboardShortcuts,
      })
      
      // Apply font size to document
      const selectedSize = fontSizes.find(f => f.value === fontSize)
      if (selectedSize) {
        document.documentElement.style.fontSize = selectedSize.size
      }
      
      setSaveMessage({ type: 'success', text: 'Accessibility settings saved successfully!' })
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      console.error('Failed to save settings:', error)
      setSaveMessage({ type: 'error', text: 'Failed to save settings' })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Accessibility Settings
        </h2>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Customize the interface to suit your preferences
        </p>
      </div>

      {/* Theme Settings */}
      <div className={`p-6 rounded-lg space-y-4 ${theme === 'dark' ? 'bg-gray-700/30 border border-gray-600' : 'bg-gray-50 border border-gray-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Theme
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Dark Mode
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Use dark theme for reduced eye strain
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${theme === 'dark' ? 'bg-primary-600' : 'bg-gray-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      {/* Date Format */}
      <div className={`p-6 rounded-lg space-y-4 ${theme === 'dark' ? 'bg-gray-700/30 border border-gray-600' : 'bg-gray-50 border border-gray-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Date Format
        </h3>

        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Preferred Date Format
          </label>
          <select
            value={dateFormat}
            onChange={(e) => setDateFormat(e.target.value)}
            className={`w-full px-4 py-4 rounded-lg border text-base min-h-[56px] ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white focus:border-primary-500' : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'} focus:outline-none focus:ring-2 focus:ring-primary-500/20`}
          >
            {dateFormats.map((format) => (
              <option key={format.value} value={format.value}>
                {format.label} - {format.example}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Font Size */}
      <div className={`p-6 rounded-lg space-y-4 ${theme === 'dark' ? 'bg-gray-700/30 border border-gray-600' : 'bg-gray-50 border border-gray-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Font Size
        </h3>

        <div className="grid grid-cols-4 gap-3">
          {fontSizes.map((size) => (
            <button
              key={size.value}
              onClick={() => setFontSize(size.value)}
              className={`p-4 rounded-lg border-2 transition-all text-center ${fontSize === size.value ? theme === 'dark' ? 'border-primary-500 bg-primary-900/20' : 'border-primary-500 bg-primary-50' : theme === 'dark' ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'}`}
            >
              <p className={`font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {size.label}
              </p>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {size.size}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Color Blind Mode */}
      <div className={`p-6 rounded-lg space-y-4 ${theme === 'dark' ? 'bg-gray-700/30 border border-gray-600' : 'bg-gray-50 border border-gray-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Color Blind Mode
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {colorBlindModes.map((mode) => (
            <button
              key={mode.value}
              onClick={() => setColorBlindMode(mode.value)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${colorBlindMode === mode.value ? theme === 'dark' ? 'border-primary-500 bg-primary-900/20' : 'border-primary-500 bg-primary-50' : theme === 'dark' ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'}`}
            >
              <p className={`font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {mode.label}
              </p>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {mode.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Additional Options */}
      <div className={`p-6 rounded-lg space-y-4 ${theme === 'dark' ? 'bg-gray-700/30 border border-gray-600' : 'bg-gray-50 border border-gray-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Additional Options
        </h3>

        {[
          { label: 'High Contrast Mode', description: 'Increase contrast for better visibility', value: highContrast, onChange: setHighContrast },
          { label: 'Reduced Motion', description: 'Minimize animations and transitions', value: reducedMotion, onChange: setReducedMotion },
          { label: 'Screen Reader Support', description: 'Enable screen reader compatibility', value: enableScreenReader, onChange: setEnableScreenReader },
          { label: 'Keyboard Shortcuts', description: 'Enable keyboard shortcuts', value: enableKeyboardShortcuts, onChange: setEnableKeyboardShortcuts },
        ].map((option) => (
          <div key={option.label} className="flex items-center justify-between">
            <div>
              <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{option.label}</p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{option.description}</p>
            </div>
            <button
              onClick={() => option.onChange(!option.value)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${option.value ? 'bg-primary-600' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${option.value ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        ))}
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${saveMessage.type === 'success' ? theme === 'dark' ? 'bg-green-900/20 border border-green-700 text-green-400' : 'bg-green-50 border border-green-200 text-green-700' : theme === 'dark' ? 'bg-red-900/20 border border-red-700 text-red-400' : 'bg-red-50 border border-red-200 text-red-700'}`}>
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

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`px-8 py-4 rounded-lg font-medium transition-colors text-base min-h-[56px] ${theme === 'dark' ? 'bg-primary-600 hover:bg-primary-700 text-white' : 'bg-primary-500 hover:bg-primary-600 text-white'} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

