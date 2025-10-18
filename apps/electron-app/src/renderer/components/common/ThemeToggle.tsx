import { useAppStore } from '../../stores'
import { IconButton } from './IconButton'

/**
 * ThemeToggle component props
 */
export interface ThemeToggleProps {
  /** Size of the toggle button */
  size?: 'sm' | 'md' | 'lg'
  /** Additional CSS classes */
  className?: string
}

/**
 * ThemeToggle component - Toggle between light and dark themes
 * 
 * Features:
 * - Compact icon button (moon/sun icon)
 * - Touch-safe (minimum 44x44px)
 * - Syncs with useAppStore theme state
 * - Smooth icon transition
 * - Accessible with aria-labels
 * 
 * @example
 * ```tsx
 * <ThemeToggle size="md" />
 * ```
 */
export function ThemeToggle({ size = 'md', className = '' }: ThemeToggleProps) {
  const { theme, setTheme } = useAppStore()

  const handleToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <IconButton
      icon={
        theme === 'dark' ? (
          // Moon icon for dark mode
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        ) : (
          // Sun icon for light mode
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        )
      }
      label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={handleToggle}
      variant="ghost"
      size={size}
      className={className}
    />
  )
}

