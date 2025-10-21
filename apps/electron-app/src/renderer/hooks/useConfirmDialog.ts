import { useState, useCallback } from 'react'

export interface ConfirmDialogOptions {
  title?: string
  message?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary' | 'warning'
  isDangerous?: boolean
  closeOnBackdrop?: boolean
}

export interface ConfirmDialogState extends ConfirmDialogOptions {
  isOpen: boolean
  onConfirm: () => void
  onClose: () => void
}

/**
 * Custom hook for managing confirmation dialogs
 * 
 * Provides a simple API to show confirmation dialogs and handle user responses
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { confirmDialog, showConfirm } = useConfirmDialog()
 * 
 *   const handleDelete = async () => {
 *     const confirmed = await showConfirm({
 *       title: 'Delete Item',
 *       message: 'Are you sure you want to delete this item?',
 *       variant: 'danger',
 *       confirmText: 'Delete'
 *     })
 * 
 *     if (confirmed) {
 *       // Perform delete action
 *     }
 *   }
 * 
 *   return (
 *     <>
 *       <button onClick={handleDelete}>Delete</button>
 *       <ConfirmDialog {...confirmDialog} />
 *     </>
 *   )
 * }
 * ```
 */
export function useConfirmDialog() {
  const [dialogState, setDialogState] = useState<ConfirmDialogState>({
    isOpen: false,
    title: 'Confirm Action',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'primary',
    isDangerous: false,
    closeOnBackdrop: true,
    onConfirm: () => {},
    onClose: () => {}
  })

  const showConfirm = useCallback((options: ConfirmDialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        title: options.title || 'Confirm Action',
        message: options.message || '',
        description: options.description,
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        variant: options.variant || 'primary',
        isDangerous: options.isDangerous || false,
        closeOnBackdrop: options.closeOnBackdrop !== undefined ? options.closeOnBackdrop : true,
        onConfirm: () => {
          setDialogState(prev => ({ ...prev, isOpen: false }))
          resolve(true)
        },
        onClose: () => {
          setDialogState(prev => ({ ...prev, isOpen: false }))
          resolve(false)
        }
      })
    })
  }, [])

  const hideConfirm = useCallback(() => {
    setDialogState(prev => ({ ...prev, isOpen: false }))
  }, [])

  return {
    confirmDialog: dialogState,
    showConfirm,
    hideConfirm
  }
}
