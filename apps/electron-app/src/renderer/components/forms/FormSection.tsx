import { HTMLAttributes, ReactNode } from 'react'
import { useAppStore } from '../../stores'

/**
 * FormSection component props
 */
export interface FormSectionProps extends HTMLAttributes<HTMLDivElement> {
  /** Section title */
  title?: string
  /** Section description */
  description?: string
  /** Children content */
  children: ReactNode
}

/**
 * Reusable FormSection component for grouping related form fields
 * 
 * @example
 * ```tsx
 * <FormSection
 *   title="Personal Information"
 *   description="Enter your personal details"
 * >
 *   <FormField label="Name">...</FormField>
 *   <FormField label="Email">...</FormField>
 * </FormSection>
 * ```
 */
export function FormSection({
  title,
  description,
  children,
  className = '',
  ...props
}: FormSectionProps) {
  const { theme } = useAppStore()

  return (
    <div
      className={`
        p-4 rounded-lg
        ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}
        ${className}
      `}
      {...props}
    >
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className={`
              text-lg font-semibold mb-2
              ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
            `}>
              {title}
            </h3>
          )}
          {description && (
            <p className={`
              text-sm
              ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
            `}>
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}

