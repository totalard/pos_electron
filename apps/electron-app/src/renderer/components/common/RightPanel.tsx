import { HTMLAttributes, ReactNode } from 'react'
import { Sidebar } from './Sidebar'

/**
 * RightPanel component props
 * 
 * @deprecated Use Sidebar component instead for new implementations.
 * RightPanel is maintained for backward compatibility.
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
  /** Auto-focus the panel on open (disable if you want child elements to retain focus) */
  autoFocus?: boolean
  /** Children content */
  children: ReactNode
}

/**
 * RightPanel component - Backward compatibility wrapper around Sidebar
 * 
 * @deprecated Use Sidebar component instead for new implementations.
 * This component wraps the new Sidebar component to maintain backward compatibility.
 * 
 * **Migration Guide:**
 * ```tsx
 * // Old (RightPanel)
 * <RightPanel isOpen={isOpen} onClose={onClose} title="Title" width="md">
 *   <div className="p-6">Content</div>
 * </RightPanel>
 * 
 * // New (Sidebar with better padding control)
 * <Sidebar isOpen={isOpen} onClose={onClose} title="Title" width="md" contentVariant="none">
 *   <div className="p-6">Content</div>
 * </Sidebar>
 * ```
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
  autoFocus = true,
  className = '',
  children,
  ...props
}: RightPanelProps) {
  // RightPanel wraps content with no padding by default (children control their own padding)
  // This maintains backward compatibility with existing implementations
  return (
    <Sidebar
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      width={width}
      showCloseButton={showCloseButton}
      closeOnBackdrop={closeOnBackdrop}
      autoFocus={autoFocus}
      contentVariant="none"
      className={className}
      {...props}
    >
      {children}
    </Sidebar>
  )
}

