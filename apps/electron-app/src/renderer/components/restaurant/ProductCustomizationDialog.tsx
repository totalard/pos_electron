import { useState } from 'react'
import { useAppStore, useSettingsStore } from '../../stores'
import { Modal } from '../common'
import type { ProductCustomization, CustomizationLevel } from '../../types/restaurant'

interface ProductCustomizationDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (customization: ProductCustomization, note?: string) => void
  productName: string
  initialCustomization?: ProductCustomization
  initialNote?: string
}

export function ProductCustomizationDialog({
  isOpen,
  onClose,
  onSave,
  productName,
  initialCustomization,
  initialNote
}: ProductCustomizationDialogProps) {
  const { theme } = useAppStore()
  const { restaurant } = useSettingsStore()

  const [spicyLevel, setSpicyLevel] = useState<CustomizationLevel>(
    initialCustomization?.spicyLevel || 'none'
  )
  const [saltLevel, setSaltLevel] = useState<CustomizationLevel>(
    initialCustomization?.saltLevel || 'none'
  )
  const [cookingPreference, setCookingPreference] = useState<string>(
    initialCustomization?.cookingPreference || ''
  )
  const [specialInstructions, setSpecialInstructions] = useState<string>(
    initialCustomization?.specialInstructions || initialNote || ''
  )

  const handleSave = () => {
    const customization: ProductCustomization = {
      spicyLevel: restaurant.enableSpicyLevel ? spicyLevel : undefined,
      saltLevel: restaurant.enableSaltLevel ? saltLevel : undefined,
      cookingPreference: restaurant.enableCookingPreferences && cookingPreference ? cookingPreference : undefined,
      specialInstructions: restaurant.enableProductNotes && specialInstructions ? specialInstructions : undefined
    }

    onSave(customization, specialInstructions)
    onClose()
  }

  const levelOptions: CustomizationLevel[] = ['none', 'low', 'medium', 'high', 'extra']

  const getLevelColor = (level: CustomizationLevel, selected: boolean) => {
    if (!selected) {
      return theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
    }
    
    switch (level) {
      case 'none':
        return 'bg-gray-500 text-white'
      case 'low':
        return 'bg-green-500 text-white'
      case 'medium':
        return 'bg-yellow-500 text-white'
      case 'high':
        return 'bg-orange-500 text-white'
      case 'extra':
        return 'bg-red-500 text-white'
      default:
        return 'bg-blue-500 text-white'
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Customize ${productName}`} size="lg">
      <div className="space-y-6">
        {/* Spicy Level */}
        {restaurant.enableSpicyLevel && (
          <div>
            <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              🌶️ Spicy Level
            </label>
            <div className="grid grid-cols-5 gap-2">
              {levelOptions.map(level => (
                <button
                  key={level}
                  onClick={() => setSpicyLevel(level)}
                  className={`
                    px-3 py-2 rounded-lg font-medium text-sm capitalize
                    transition-all duration-200 transform hover:scale-105
                    ${getLevelColor(level, spicyLevel === level)}
                  `}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Salt Level */}
        {restaurant.enableSaltLevel && (
          <div>
            <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              🧂 Salt Level
            </label>
            <div className="grid grid-cols-5 gap-2">
              {levelOptions.map(level => (
                <button
                  key={level}
                  onClick={() => setSaltLevel(level)}
                  className={`
                    px-3 py-2 rounded-lg font-medium text-sm capitalize
                    transition-all duration-200 transform hover:scale-105
                    ${getLevelColor(level, saltLevel === level)}
                  `}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Cooking Preferences */}
        {restaurant.enableCookingPreferences && restaurant.customizationOptions.cookingPreferences.length > 0 && (
          <div>
            <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              👨‍🍳 Cooking Preference
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {restaurant.customizationOptions.cookingPreferences.map(pref => (
                <button
                  key={pref}
                  onClick={() => setCookingPreference(cookingPreference === pref ? '' : pref)}
                  className={`
                    px-4 py-2 rounded-lg font-medium text-sm
                    transition-all duration-200 transform hover:scale-105
                    ${cookingPreference === pref
                      ? theme === 'dark'
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 text-white'
                      : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }
                  `}
                >
                  {pref}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Special Instructions */}
        {restaurant.enableProductNotes && (
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              📝 Special Instructions
            </label>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Add any special instructions (e.g., no onions, extra sauce)..."
              rows={3}
              className={`
                w-full px-4 py-3 rounded-lg border-2 transition-colors
                ${theme === 'dark'
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500/20
              `}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className={`
              flex-1 px-6 py-3 rounded-lg font-semibold transition-colors
              ${theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }
            `}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`
              flex-1 px-6 py-3 rounded-lg font-semibold transition-colors
              bg-blue-600 hover:bg-blue-700 text-white
            `}
          >
            Save Customization
          </button>
        </div>
      </div>
    </Modal>
  )
}
