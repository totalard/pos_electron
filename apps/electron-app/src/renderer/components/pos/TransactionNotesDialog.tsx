import { useState } from 'react'
import { useAppStore } from '../../stores'
import { Modal, Button } from '../common'

interface TransactionNotesDialogProps {
  isOpen: boolean
  onClose: () => void
  initialNotes?: string
  onSave: (notes: string) => void
}

/**
 * Dialog for adding/editing transaction notes
 */
export function TransactionNotesDialog({ 
  isOpen, 
  onClose, 
  initialNotes = '', 
  onSave 
}: TransactionNotesDialogProps) {
  const { theme } = useAppStore()
  const [notes, setNotes] = useState(initialNotes)

  const handleSave = () => {
    onSave(notes)
    onClose()
  }

  const handleCancel = () => {
    setNotes(initialNotes)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title="Transaction Notes" size="md">
      <div className="space-y-6">
        {/* Notes Input */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Add notes to this transaction
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter transaction notes..."
            rows={6}
            className={`
              w-full px-4 py-3 rounded-lg border resize-none
              ${theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }
              focus:outline-none focus:ring-2 focus:ring-primary-500
            `}
          />
          <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {notes.length} / 500 characters
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Notes
          </Button>
        </div>
      </div>
    </Modal>
  )
}
