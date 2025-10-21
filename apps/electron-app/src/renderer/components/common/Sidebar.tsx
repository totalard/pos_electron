import { HTMLAttributes, ReactNode, useEffect, useRef } from 'react'
import { useAppStore } from '../../stores'

/**
 * Content padding variants for different use cases
 */
export type SidebarContentVariant = 'default' | 'form' | 'list' | 'compact' | 'none'

/**
 * Sidebar component props
 */
export interface SidebarProps extends HTMLAttributes<HTMLDivElement> {
  /** Sidebar open state */
  isOpen: boolean
  /** Close handler */
  onClose: () => void
  /** Sidebar title */
  title?: string
  /** Sidebar width size */
  width?: 'sm' | 'md' | 'lg' | 'xl'
  /** Show close button */
  showCloseButton?: boolean
  /** Close on backdrop click */
  closeOnBackdrop?: boolean
  /** Auto-focus the sidebar on open */
  autoFocus?: boolean
  /** Content padding variant */
  contentVariant?: SidebarContentVariant
  /** Custom header content (replaces default header) */
  headerContent?: ReactNode
  /** Footer content */
  footerContent?: ReactNode
  /** Children content */
  children: ReactNode
}

/**
 * Get padding classes based on content variant
 */
const getContentPadding = (variant: SidebarContentVariant): string => {
  switch (variant) {
    case 'form':
      return 'p-6' // More padding for forms
    case 'list':
      return 'py-2' // Vertical padding only for lists
    case 'compact':
      return 'p-4' // Compact padding
    case 'none':
      return '' // No padding
    case 'default':
    default:
      return 'p-6' // Default comfortable padding
  }
}

/**
 * Reusable Sidebar component with consistent padding and UX patterns
 * 
 * **Features:**
 * - Smooth slide-in animation from right
 * - Backdrop overlay with blur
 * - Touch-safe close button (44x44px minimum)
 * - Keyboard navigation (Escape to close)
 * - Focus management and trap
 * - Body scroll prevention when open
 * - Theme-aware styling
 * - Configurable content padding variants
 * - Optional header and footer sections
 * 
 * **Content Variants:**
 * - `default`: Standard padding (24px) for general content
 * - `form`: Extra padding (24px) optimized for form layouts
 * - `list`: Vertical padding only (8px) for list items with full-width items
 * - `compact`: Reduced padding (16px) for dense content
 * - `none`: No padding, full control to children
 * 
 * @example
 * ```tsx
 * // Form sidebar
 * <Sidebar
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Add User"
 *   width="md"
 *   contentVariant="form"
 * >
 *   <form>...</form>
 * </Sidebar>
 * 
 * // List sidebar
 * <Sidebar
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Select Option"
 *   contentVariant="list"
 * >
 *   <div className="space-y-2 px-4">...</div>
 * </Sidebar>
 * ```
 */
export function Sidebar({
  isOpen,
  onClose,
  title,
  width = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  autoFocus = true,
  contentVariant = 'default',
  headerContent,
  footerContent,
  className = '',
  children,
  ...props
}: SidebarProps) {
  const { theme } = useAppStore()
  const sidebarRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<Element | null>(null)

  // Width classes for different sidebar sizes
  const widthClasses = {
    sm: 'w-80',       // 320px - Compact
    md: 'w-[480px]',  // 480px - Standard
    lg: 'w-[640px]',  // 640px - Wide
    xl: 'w-[800px]'   // 800px - Extra Wide
  }

  // Handle escape key and body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when sidebar is open
      document.body.style.overflow = 'hidden'
      
      // Store current focus
      previousFocusRef.current = document.activeElement
      
      // Focus the sidebar only if autoFocus is enabled
      if (autoFocus) {
        setTimeout(() => {
          sidebarRef.current?.focus()
        }, 100)
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
      
      // Restore focus when sidebar closes
      if (!isOpen && previousFocusRef.current && 'focus' in previousFocusRef.current) {
        (previousFocusRef.current as { focus: () => void }).focus()
      }
    }
  }, [isOpen, onClose, autoFocus])

  // Focus trap - keep focus within sidebar
  useEffect(() => {
    if (!isOpen || !sidebarRef.current) return

    const handleFocusTrap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const focusableElements = sidebarRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )

      if (!focusableElements || focusableElements.length === 0) return

      const firstElement = focusableElements[0] as Element | undefined
      const lastElement = focusableElements[focusableElements.length - 1] as Element | undefined

      if (!firstElement || !lastElement) return

      // Type guard to ensure elements have focus method
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

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'sidebar-title' : undefined}
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
        {headerContent ? (
          <div className="flex-shrink-0">
            {headerContent}
          </div>
        ) : (title || showCloseButton) ? (
          <div className={`
            flex items-center justify-between px-6 py-4 border-b flex-shrink-0
            ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
          `}>
            {title && (
              <h2
                id="sidebar-title"
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
                aria-label="Close sidebar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ) : null}

        {/* Content */}
        <div className={`
          flex-1 overflow-y-auto
          ${getContentPadding(contentVariant)}
        `}>
          {children}
        </div>

        {/* Footer */}
        {footerContent && (
          <div className={`
            flex-shrink-0 border-t
            ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
          `}>
            {footerContent}
          </div>
        )}
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

Sidebar.displayName = 'Sidebar'
