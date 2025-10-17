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
        group relative overflow-hidden rounded-2xl p-8 min-h-[180px]
        transition-all duration-200
        ${available
          ? 'hover:scale-105 active:scale-100 hover:shadow-2xl active:shadow-lg cursor-pointer'
          : 'opacity-50 cursor-not-allowed'
        }
        ${theme === 'dark'
          ? 'bg-gray-800/50 border border-gray-700 hover:border-gray-600 active:border-gray-500'
          : 'bg-white border border-gray-200 hover:border-gray-300 active:border-gray-400'
        }
        ${className}
      `}
      {...props}
    >
      {/* Gradient Background */}
      <div
        className={`
          absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-200
          bg-gradient-to-br ${gradient}
        `}
      />

      {/* Content */}
      <div className="relative flex flex-col items-center text-center gap-4">
        {/* Icon with gradient */}
        <div className={`
          w-20 h-20 rounded-2xl flex items-center justify-center
          bg-gradient-to-br ${gradient}
          transform group-hover:scale-110 transition-transform duration-200
          shadow-lg
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

