import { HTMLAttributes, ReactNode, useEffect } from 'react'
import { useAppStore } from '../../stores'

/**
 * Toast component props
 */
export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  /** Toast open state */
  isOpen: boolean
  /** Close handler */
  onClose: () => void
  /** Toast message */
  message: string
  /** Toast type */
  type?: 'success' | 'error' | 'warning' | 'info'
  /** Auto-close duration in milliseconds (0 to disable) */
  duration?: number
  /** Position */
  position?: 'top' | 'bottom'
  /** Icon to display */
  icon?: ReactNode
}

/**
 * Reusable Toast notification component
 * 
 * Touch-friendly alternative to browser alert() with:
 * - Non-blocking notification
 * - Auto-dismiss after duration
 * - Touch-safe close button (minimum 44x44px)
 * - Theme-aware styling
 * - Multiple types (success, error, warning, info)
 * - Smooth animations
 * 
 * @example
 * ```tsx
 * <Toast
 *   isOpen={showToast}
 *   onClose={() => setShowToast(false)}
 *   message="User deleted successfully"
 *   type="success"
 *   duration={3000}
 * />
 * ```
 */
export function Toast({
  isOpen,
  onClose,
  message,
  type = 'info',
  duration = 3000,
  position = 'top',
  icon,
  className = '',
  ...props
}: ToastProps) {
  const { theme } = useAppStore()

  // Auto-close after duration
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isOpen, duration, onClose])

  if (!isOpen) return null

  const typeStyles = {
    success: {
      bg: theme === 'dark' ? 'bg-green-600' : 'bg-green-500',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    error: {
      bg: theme === 'dark' ? 'bg-red-600' : 'bg-red-500',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    },
    warning: {
      bg: theme === 'dark' ? 'bg-amber-600' : 'bg-amber-500',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    info: {
      bg: theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  }

  const positionClasses = position === 'top'
    ? 'top-4 animate-slide-down'
    : 'bottom-4 animate-slide-up'

  return (
    <div
      className={`
        fixed left-1/2 -translate-x-1/2 z-50
        ${positionClasses}
      `}
      role="alert"
      aria-live="polite"
    >
      <div
        className={`
          flex items-center gap-3 px-6 py-4 rounded-lg shadow-2xl
          min-h-[60px] max-w-md
          ${typeStyles[type].bg}
          text-white
          ${className}
        `}
        {...props}
      >
        {/* Icon */}
        <div className="flex-shrink-0">
          {icon || typeStyles[type].icon}
        </div>

        {/* Message */}
        <p className="flex-1 font-medium text-base">
          {message}
        </p>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="
            flex-shrink-0 p-2 rounded-lg
            hover:bg-white/20 active:bg-white/30
            transition-colors min-w-[44px] min-h-[44px]
            flex items-center justify-center
          "
          aria-label="Close notification"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

