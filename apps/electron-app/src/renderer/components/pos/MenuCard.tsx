import { ButtonHTMLAttributes, ReactNode } from 'react'
import { useAppStore } from '../../stores'

/**
 * MenuCard component props
 */
export interface MenuCardProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Card title */
  title: string
  /** Card description */
  description: string
  /** Icon element */
  icon: ReactNode
  /** Gradient color (from-to) */
  gradient: string
  /** Available/enabled state */
  available?: boolean
}

/**
 * Reusable MenuCard component for dashboard menu items
 * 
 * @example
 * ```tsx
 * <MenuCard
 *   title="Point of Sale"
 *   description="Process sales and transactions"
 *   icon={<CartIcon />}
 *   gradient="from-blue-500 to-blue-700"
 *   onClick={() => navigate('sales')}
 * />
 * ```
 */
export function MenuCard({
  title,
  description,
  icon,
  gradient,
  available = true,
  className = '',
  ...props
}: MenuCardProps) {
  const { theme } = useAppStore()

  return (
    <button
      disabled={!available}
      className={`
        group relative overflow-hidden rounded-xl p-8 min-h-[180px]
        transition-all duration-200
        ${available
          ? 'hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
          : 'opacity-50 cursor-not-allowed'
        }
        ${theme === 'dark'
          ? 'bg-gray-800 border border-gray-700 hover:border-blue-600'
          : 'bg-white border border-gray-200 hover:border-blue-500'
        }
        ${className}
      `}
      {...props}
    >
      {/* Subtle hover background */}
      <div
        className={`
          absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-200
          ${theme === 'dark' ? 'bg-blue-500' : 'bg-blue-500'}
        `}
      />

      {/* Content */}
      <div className="relative flex flex-col items-center text-center gap-4">
        {/* Icon with flat color */}
        <div className={`
          w-20 h-20 rounded-xl flex items-center justify-center
          ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'}
          transform group-hover:scale-[1.05] transition-transform duration-200
        `}>
          <div className="text-white">
            {icon}
          </div>
        </div>

        {/* Text */}
        <div>
          <h3 className={`
            text-xl font-bold mb-2
            ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
          `}>
            {title}
          </h3>
          <p className={`
            text-sm
            ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
          `}>
            {description}
          </p>
        </div>

        {/* Coming Soon Badge */}
        {!available && (
          <div className={`
            absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium
            ${theme === 'dark'
              ? 'bg-amber-500/20 text-amber-400'
              : 'bg-amber-100 text-amber-600'
            }
          `}>
            Coming Soon
          </div>
        )}
      </div>
    </button>
  )
}

