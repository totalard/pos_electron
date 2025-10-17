import { HTMLAttributes, ReactNode, useEffect, useRef } from 'react'
import { useAppStore } from '../../stores'

/**
 * ConfirmDialog component props
 */
export interface ConfirmDialogProps extends HTMLAttributes<HTMLDivElement> {
  /** Dialog open state */
  isOpen: boolean
  /** Close handler */
  onClose: () => void
  /** Confirm handler */
  onConfirm: () => void
  /** Dialog title */
  title?: string
  /** Dialog message */
  message: string
  /** Confirm button text */
  confirmText?: string
  /** Cancel button text */
  cancelText?: string
  /** Confirm button variant */
  variant?: 'danger' | 'primary' | 'warning'
  /** Close on backdrop click */
  closeOnBackdrop?: boolean
  /** Icon to display */
  icon?: ReactNode
}

/**
 * Reusable ConfirmDialog component for confirmation prompts
 * 
 * Touch-friendly alternative to browser confirm() with:
 * - Centered modal dialog
 * - Touch-safe buttons (minimum 44x44px)
 * - Keyboard navigation (Escape to cancel, Enter to confirm)
 * - Focus management
 * - Theme-aware styling
 * - Customizable variants (danger, primary, warning)
 * 
 * @example
 * ```tsx
 * <ConfirmDialog
 *   isOpen={showConfirm}
 *   onClose={() => setShowConfirm(false)}
 *   onConfirm={handleDelete}
 *   title="Delete User"
 *   message="Are you sure you want to delete this user? This action cannot be undone."
 *   variant="danger"
 *   confirmText="Delete"
 * />
 * ```
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  closeOnBackdrop = true,
  icon,
  className = '',
  ...props
}: ConfirmDialogProps) {
  const { theme } = useAppStore()
  const confirmButtonRef = useRef<HTMLButtonElement>(null)

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'Enter') {
        e.preventDefault()
        onConfirm()
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // Prevent body scroll when dialog is open
      document.body.style.overflow = 'hidden'
      
      // Focus confirm button after a short delay
      setTimeout(() => {
        confirmButtonRef.current?.focus()
      }, 100)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose, onConfirm])

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const variantStyles = {
    danger: {
      button: theme === 'dark'
        ? 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white'
        : 'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white',
      icon: theme === 'dark' ? 'text-red-400' : 'text-red-500'
    },
    primary: {
      button: theme === 'dark'
        ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white'
        : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white',
      icon: theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
    },
    warning: {
      button: theme === 'dark'
        ? 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white'
        : 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white',
      icon: theme === 'dark' ? 'text-amber-400' : 'text-amber-500'
    }
  }

  const defaultIcon = variant === 'danger' ? (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ) : (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
    >
      <div
        className={`
          relative w-full max-w-md rounded-xl shadow-2xl
          transform transition-all duration-200 animate-scale-in
          ${theme === 'dark'
            ? 'bg-gray-800 border border-gray-700'
            : 'bg-white border border-gray-200'
          }
          ${className}
        `}
        {...props}
      >
        {/* Content */}
        <div className="p-6 text-center">
          {/* Icon */}
          <div className={`mx-auto mb-4 ${variantStyles[variant].icon}`}>
            {icon || defaultIcon}
          </div>

          {/* Title */}
          <h3
            id="confirm-dialog-title"
            className={`text-xl font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
          >
            {title}
          </h3>

          {/* Message */}
          <p
            id="confirm-dialog-message"
            className={`text-base mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
          >
            {message}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`
                flex-1 px-6 py-3 rounded-lg font-medium min-h-[44px]
                transition-all duration-200
                ${theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-900'
                }
              `}
              aria-label={cancelText}
            >
              {cancelText}
            </button>
            <button
              ref={confirmButtonRef}
              type="button"
              onClick={handleConfirm}
              className={`
                flex-1 px-6 py-3 rounded-lg font-medium min-h-[44px]
                transition-all duration-200
                ${variantStyles[variant].button}
              `}
              aria-label={confirmText}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

