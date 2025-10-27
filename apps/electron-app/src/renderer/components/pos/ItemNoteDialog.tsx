import { useState, useEffect } from 'react'
import { useAppStore } from '../../stores'
import { Modal } from '../common'

interface ItemNoteDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (note: string) => void
  currentNote?: string
  productName: string
}

export function ItemNoteDialog({
  isOpen,
  onClose,
  onSave,
  currentNote = '',
  productName
}: ItemNoteDialogProps) {
  const { theme } = useAppStore()
  const [note, setNote] = useState(currentNote)

  useEffect(() => {
    if (isOpen) {
      setNote(currentNote)
    }
  }, [isOpen, currentNote])

  const handleSave = () => {
    onSave(note)
    onClose()
  }

  const handleClear = () => {
    setNote('')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Product Note"
      size="md"
    >
      <div className="space-y-4">
        {/* Product Name */}
        <div className={`
          p-3 rounded-lg border
          ${theme === 'dark' 
            ? 'bg-gray-800/50 border-gray-700' 
            : 'bg-gray-50 border-gray-200'
          }
        `}>
          <p className={`
            text-sm font-medium
            ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
          `}>
            {productName}
          </p>
        </div>

        {/* Note Input */}
        <div>
          <label className={`
            block text-sm font-medium mb-2
            ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
          `}>
            Note / Special Instructions
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g., Extra spicy, No onions, Well done..."
            rows={4}
            className={`
              w-full px-3 py-2 rounded-lg border resize-none
              focus:outline-none focus:ring-2 focus:ring-primary-500
              ${theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              }
            `}
            autoFocus
          />
          <p className={`
            text-xs mt-1
            ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}
          `}>
            Add any special instructions or customizations for this item
          </p>
        </div>

        {/* Quick Suggestions */}
        <div>
          <p className={`
            text-xs font-medium mb-2
            ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
          `}>
            Quick Suggestions:
          </p>
          <div className="flex flex-wrap gap-2">
            {['No onions', 'Extra spicy', 'Well done', 'No salt', 'Extra cheese', 'On the side'].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setNote(note ? `${note}, ${suggestion}` : suggestion)}
                className={`
                  px-3 py-1 rounded-full text-xs font-medium
                  transition-colors
                  ${theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }
                `}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className={`
              flex-1 px-4 py-2.5 rounded-lg font-medium
              transition-colors
              ${theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }
            `}
          >
            Cancel
          </button>
          {note && (
            <button
              onClick={handleClear}
              className={`
                px-4 py-2.5 rounded-lg font-medium
                transition-colors
                ${theme === 'dark'
                  ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400'
                  : 'bg-red-50 hover:bg-red-100 text-red-600'
                }
              `}
            >
              Clear
            </button>
          )}
          <button
            onClick={handleSave}
            className={`
              flex-1 px-4 py-2.5 rounded-lg font-medium
              transition-colors
              ${theme === 'dark'
                ? 'bg-primary-600 hover:bg-primary-700 text-white'
                : 'bg-primary-600 hover:bg-primary-700 text-white'
              }
            `}
          >
            Save Note
          </button>
        </div>
      </div>
    </Modal>
  )
}
