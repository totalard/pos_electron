import { ReactNode } from 'react'
import { useAppStore } from '../../stores'

export interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'indigo' | 'pink' | 'orange'
  alert?: boolean
  onClick?: () => void
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    gradient: 'from-blue-500 to-blue-700'
  },
  green: {
    bg: 'bg-green-500/10',
    text: 'text-green-600 dark:text-green-400',
    gradient: 'from-green-500 to-green-700'
  },
  red: {
    bg: 'bg-red-500/10',
    text: 'text-red-600 dark:text-red-400',
    gradient: 'from-red-500 to-red-700'
  },
  yellow: {
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-600 dark:text-yellow-400',
    gradient: 'from-yellow-500 to-yellow-700'
  },
  purple: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-600 dark:text-purple-400',
    gradient: 'from-purple-500 to-purple-700'
  },
  indigo: {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-600 dark:text-indigo-400',
    gradient: 'from-indigo-500 to-indigo-700'
  },
  pink: {
    bg: 'bg-pink-500/10',
    text: 'text-pink-600 dark:text-pink-400',
    gradient: 'from-pink-500 to-pink-700'
  },
  orange: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-600 dark:text-orange-400',
    gradient: 'from-orange-500 to-orange-700'
  }
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'blue',
  alert = false,
  onClick
}: StatCardProps) {
  const { theme } = useAppStore()
  const colors = colorClasses[color]

  const CardWrapper = onClick ? 'button' : 'div'

  return (
    <CardWrapper
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-xl p-5 border transition-all duration-300
        ${theme === 'dark'
          ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70'
          : 'bg-white border-gray-200 hover:shadow-lg'
        }
        ${alert ? 'ring-2 ring-offset-2 ' + (theme === 'dark' ? 'ring-yellow-500/50 ring-offset-gray-900' : 'ring-yellow-500/30 ring-offset-white') : ''}
        ${onClick ? 'cursor-pointer' : ''}
        w-full text-left
      `}
    >
      {/* Background Icon */}
      {icon && (
        <div className={`absolute top-4 right-4 ${colors.bg} rounded-lg p-3`}>
          <div className={colors.text}>
            {icon}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative">
        <div className="flex items-start justify-between mb-2">
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {title}
          </p>
          {alert && (
            <div className={`
              px-2 py-1 rounded-full text-xs font-semibold
              ${theme === 'dark' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'}
            `}>
              Alert
            </div>
          )}
        </div>

        <div className="flex items-baseline gap-2">
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
          {trend && (
            <div className={`
              flex items-center text-sm font-medium
              ${trend.isPositive 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
              }
            `}>
              <svg 
                className={`w-4 h-4 ${trend.isPositive ? '' : 'rotate-180'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>

        {subtitle && (
          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
            {subtitle}
          </p>
        )}
      </div>
    </CardWrapper>
  )
}
