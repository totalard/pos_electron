import { useState } from 'react'
import { useAppStore, usePOSStore } from '../../stores'
import { RightPanel } from '../common'
import { NumberInput } from '../forms'

interface GuestCountSelectorProps {
  isOpen: boolean
  onClose: () => void
}

export function GuestCountSelector({ isOpen, onClose }: GuestCountSelectorProps) {
  const { theme } = useAppStore()
  const { getActiveTransaction, setGuestCount: updateGuestCount } = usePOSStore()
  
  const transaction = getActiveTransaction()
  const currentGuestCount = transaction?.restaurantMetadata?.guestCount || 2

  const [guestCount, setGuestCount] = useState(currentGuestCount)

  const handleSave = () => {
    updateGuestCount(guestCount)
    onClose()
  }

  const presetCounts = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20]

  return (
    <RightPanel isOpen={isOpen} onClose={onClose} title="Select Guest Count" width="sm">
      <div className="space-y-6">
        {/* Preset Buttons */}
        <div>
          <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Number of Guests
          </label>
          <div className="grid grid-cols-4 gap-3">
            {presetCounts.map(count => (
              <button
                key={count}
                onClick={() => setGuestCount(count)}
                className={`
                  aspect-square rounded-xl font-bold text-lg
                  transition-all duration-200 transform hover:scale-105
                  ${guestCount === count
                    ? theme === 'dark'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-blue-500 text-white shadow-lg'
                    : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }
                `}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <NumberInput
          label="Custom Guest Count"
          value={guestCount}
          onChange={(value) => setGuestCount(Math.max(1, value))}
          min={1}
          max={999}
          step={1}
          showButtons
          fullWidth
        />

        {/* Quick Adjust Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
            className={`
              flex-1 py-3 rounded-lg font-semibold transition-colors
              ${theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }
            `}
          >
            <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <button
            onClick={() => setGuestCount(guestCount + 1)}
            className={`
              flex-1 py-3 rounded-lg font-semibold transition-colors
              ${theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }
            `}
          >
            <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

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
            Save
          </button>
        </div>
      </div>
    </RightPanel>
  )
}
