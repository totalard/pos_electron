import { HTMLAttributes, ReactNode } from 'react'
import { useAppStore } from '../../stores'

/**
 * PageContainer component props
 */
export interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  /** Children content */
  children: ReactNode
  /** Maximum width */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg'
  /** Center content */
  centered?: boolean
}

/**
 * Reusable PageContainer component for consistent page layouts
 * 
 * @example
 * ```tsx
 * <PageContainer maxWidth="xl" padding="lg">
 *   <PageContent />
 * </PageContainer>
 * ```
 */
export function PageContainer({
  children,
  maxWidth = 'full',
  padding = 'md',
  centered = false,
  className = '',
  ...props
}: PageContainerProps) {
  const { theme } = useAppStore()

  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full'
  }

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  return (
    <div
      className={`
        ${maxWidthClasses[maxWidth]}
        ${paddingClasses[padding]}
        ${centered ? 'mx-auto' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

