import { HTMLAttributes, ReactNode } from 'react'
import { useAppStore } from '../../stores'

/**
 * SplitLayout component props
 */
export interface SplitLayoutProps extends HTMLAttributes<HTMLDivElement> {
  /** Left panel content */
  left: ReactNode
  /** Right panel content */
  right: ReactNode
  /** Left panel width ratio (1-11, right will be 12-ratio) */
  leftWidth?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11
  /** Gap between panels */
  gap?: 'none' | 'sm' | 'md' | 'lg'
  /** Show borders */
  bordered?: boolean
}

/**
 * Reusable SplitLayout component for two-column layouts
 * 
 * @example
 * ```tsx
 * <SplitLayout
 *   left={<Navigation />}
 *   right={<Content />}
 *   leftWidth={4}
 *   gap="md"
 * />
 * ```
 */
export function SplitLayout({
  left,
  right,
  leftWidth = 4,
  gap = 'md',
  bordered = true,
  className = '',
  ...props
}: SplitLayoutProps) {
  const { theme } = useAppStore()

  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  }

  const widthClasses = {
    1: 'w-1/12',
    2: 'w-2/12',
    3: 'w-3/12',
    4: 'w-4/12',
    5: 'w-5/12',
    6: 'w-6/12',
    7: 'w-7/12',
    8: 'w-8/12',
    9: 'w-9/12',
    10: 'w-10/12',
    11: 'w-11/12'
  }

  const borderClass = bordered
    ? theme === 'dark'
      ? 'border border-gray-700'
      : 'border border-gray-200'
    : ''

  return (
    <div
      className={`
        flex
        ${gapClasses[gap]}
        ${className}
      `}
      {...props}
    >
      {/* Left Panel */}
      <div
        className={`
          ${widthClasses[leftWidth]}
          rounded-xl overflow-hidden
          ${borderClass}
          ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'}
        `}
      >
        {left}
      </div>

      {/* Right Panel */}
      <div
        className={`
          flex-1
          rounded-xl overflow-hidden
          ${borderClass}
          ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'}
        `}
      >
        {right}
      </div>
    </div>
  )
}

