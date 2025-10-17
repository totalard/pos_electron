import { HTMLAttributes, ReactNode, useEffect } from 'react'
import { useAppStore } from '../../stores'

/**
 * Modal component props
 */
export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  /** Modal open state */
  isOpen: boolean
  /** Close handler */
  onClose: () => void
  /** Modal title */
  title?: string
  /** Modal size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  /** Show close button */
  showCloseButton?: boolean
  /** Close on backdrop click */
  closeOnBackdrop?: boolean
  /** Children content */
  children: ReactNode
}

/**
 * Reusable Modal component with backdrop and animations
 *
 * @deprecated This component is deprecated. Use RightPanel for better touch-friendly UX.
 * RightPanel provides a slide-in panel from the right side which is more suitable
 * for touch interfaces and provides better mobile experience.
 *
 * @example
 * ```tsx
 * // Old (deprecated):
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Add User"
 *   size="md"
 * >
 *   <form>...</form>
 * </Modal>
 *
 * // New (recommended):
 * <RightPanel
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Add User"
 *   width="md"
 * >
 *   <form>...</form>
 * </RightPanel>
 * ```
 */
export function Modal({
  isOpen,
  onClose,
  title,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  className = '',
  children,
  ...props
}: ModalProps) {
  const { theme } = useAppStore()

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className={`
          relative w-full rounded-xl shadow-2xl
          transform transition-all duration-200
          ${sizeClasses[size]}
          ${theme === 'dark'
            ? 'bg-gray-800 border border-gray-700'
            : 'bg-white border border-gray-200'
          }
          ${className}
        `}
        {...props}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className={`
            flex items-center justify-between p-6 border-b
            ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
          `}>
            {title && (
              <h2 className={`
                text-2xl font-bold
                ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
              `}>
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className={`
                  p-2 rounded-lg transition-colors
                  min-w-[44px] min-h-[44px]
                  ${theme === 'dark'
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                  }
                `}
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

