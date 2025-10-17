import { HTMLAttributes, ReactNode } from 'react'

/**
 * Grid component props
 */
export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  /** Number of columns */
  cols?: 1 | 2 | 3 | 4 | 5 | 6
  /** Gap size */
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  /** Responsive breakpoints */
  responsive?: {
    sm?: 1 | 2 | 3 | 4 | 5 | 6
    md?: 1 | 2 | 3 | 4 | 5 | 6
    lg?: 1 | 2 | 3 | 4 | 5 | 6
    xl?: 1 | 2 | 3 | 4 | 5 | 6
  }
  /** Children content */
  children: ReactNode
}

/**
 * Reusable Grid component for responsive layouts
 * 
 * @example
 * ```tsx
 * <Grid cols={3} gap="lg" responsive={{ sm: 1, md: 2, lg: 3 }}>
 *   <Card>Item 1</Card>
 *   <Card>Item 2</Card>
 *   <Card>Item 3</Card>
 * </Grid>
 * ```
 */
export function Grid({
  cols = 1,
  gap = 'md',
  responsive,
  children,
  className = '',
  ...props
}: GridProps) {
  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  }

  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  }

  const responsiveClasses = responsive
    ? `
      ${responsive.sm ? `sm:grid-cols-${responsive.sm}` : ''}
      ${responsive.md ? `md:grid-cols-${responsive.md}` : ''}
      ${responsive.lg ? `lg:grid-cols-${responsive.lg}` : ''}
      ${responsive.xl ? `xl:grid-cols-${responsive.xl}` : ''}
    `
    : ''

  return (
    <div
      className={`
        grid
        ${colClasses[cols]}
        ${gapClasses[gap]}
        ${responsiveClasses}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

