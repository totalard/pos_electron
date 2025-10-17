import { HTMLAttributes, ReactNode, useEffect, useRef } from 'react'
import { useAppStore } from '../../stores'

/**
 * RightPanel component props
 */
export interface RightPanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Panel open state */
  isOpen: boolean
  /** Close handler */
  onClose: () => void
  /** Panel title */
  title?: string
  /** Panel width size */
  width?: 'sm' | 'md' | 'lg'
  /** Show close button */
  showCloseButton?: boolean
  /** Close on backdrop click */
  closeOnBackdrop?: boolean
  /** Children content */
  children: ReactNode
}

/**
 * Reusable RightPanel component that slides in from the right side
 * 
 * Touch-friendly alternative to modal dialogs with:
 * - Smooth slide-in animation from right
 * - Backdrop overlay
 * - Touch-safe close button (minimum 44x44px)
 * - Keyboard navigation (Escape to close)
 * - Focus management and trap
 * - Body scroll prevention when open
 * - Theme-aware styling
 * 
 * @example
 * ```tsx
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
export function RightPanel({
  isOpen,
  onClose,
  title,
  width = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  className = '',
  children,
  ...props
}: RightPanelProps) {
  const { theme } = useAppStore()
  const panelRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line no-undef
  const previousFocusRef = useRef<Element | null>(null)

  // Width classes for different panel sizes
  const widthClasses = {
    sm: 'w-80',      // 320px
    md: 'w-[480px]', // 480px
    lg: 'w-[640px]'  // 640px
  }

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when panel is open
      document.body.style.overflow = 'hidden'
      
      // Store current focus
      previousFocusRef.current = document.activeElement
      
      // Focus the panel
      setTimeout(() => {
        panelRef.current?.focus()
      }, 100)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
      
      // Restore focus when panel closes
      if (!isOpen && previousFocusRef.current && 'focus' in previousFocusRef.current) {
        (previousFocusRef.current as { focus: () => void }).focus()
      }
    }
  }, [isOpen, onClose])

  // Focus trap - keep focus within panel
  useEffect(() => {
    if (!isOpen || !panelRef.current) return

    const handleFocusTrap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const focusableElements = panelRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )

      if (!focusableElements || focusableElements.length === 0) return

      // eslint-disable-next-line no-undef
      const firstElement = focusableElements[0] as Element | undefined
      // eslint-disable-next-line no-undef
      const lastElement = focusableElements[focusableElements.length - 1] as Element | undefined

      if (!firstElement || !lastElement) return

      // Type guard to ensure elements have focus method
      // eslint-disable-next-line no-undef
      const canFocus = (el: Element): el is Element & { focus: () => void } => {
        return 'focus' in el && typeof (el as { focus?: unknown }).focus === 'function'
      }

      if (!canFocus(firstElement) || !canFocus(lastElement)) return

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    document.addEventListener('keydown', handleFocusTrap)
    return () => document.removeEventListener('keydown', handleFocusTrap)
  }, [isOpen])

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'panel-title' : undefined}
        tabIndex={-1}
        className={`
          fixed top-0 right-0 bottom-0 z-50
          flex flex-col
          shadow-2xl
          transform transition-transform duration-300 ease-out
          ${widthClasses[width]}
          ${theme === 'dark'
            ? 'bg-gray-800 border-l border-gray-700'
            : 'bg-white border-l border-gray-200'
          }
          ${className}
        `}
        style={{
          animation: isOpen ? 'slideInRight 0.3s ease-out' : undefined
        }}
        {...props}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className={`
            flex items-center justify-between px-6 py-4 border-b flex-shrink-0
            ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
          `}>
            {title && (
              <h2
                id="panel-title"
                className={`
                  text-2xl font-bold
                  ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
                `}
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className={`
                  p-2 rounded-lg transition-colors
                  min-w-[44px] min-h-[44px]
                  flex items-center justify-center
                  ${theme === 'dark'
                    ? 'hover:bg-gray-700 active:bg-gray-600 text-gray-400 hover:text-white'
                    : 'hover:bg-gray-100 active:bg-gray-200 text-gray-500 hover:text-gray-900'
                  }
                `}
                aria-label="Close panel"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  )
}

