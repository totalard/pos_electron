import { ButtonHTMLAttributes, ReactNode } from 'react'
import { useAppStore } from '../../stores'

/**
 * SettingsTile component props
 */
export interface SettingsTileProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Tile title */
  title: string
  /** Tile description */
  description: string
  /** Icon element */
  icon: ReactNode
  /** Color theme */
  color: string
  /** Selected state */
  selected?: boolean
}

/**
 * Reusable SettingsTile component for settings navigation
 * 
 * @example
 * ```tsx
 * <SettingsTile
 *   title="General"
 *   description="General application settings"
 *   icon={<SettingsIcon />}
 *   color="blue"
 *   selected={selectedSection === 'general'}
 *   onClick={() => setSelectedSection('general')}
 * />
 * ```
 */
export function SettingsTile({
  title,
  description,
  icon,
  color,
  selected = false,
  className = '',
  ...props
}: SettingsTileProps) {
  const { theme } = useAppStore()

  // Color mapping for different themes
  const getColorClasses = (colorName: string, isSelected: boolean) => {
    const colors: Record<string, { light: string; dark: string; selected: string }> = {
      blue: {
        light: 'bg-blue-50 text-blue-600 border-blue-200',
        dark: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        selected: 'bg-blue-500 text-white border-blue-600'
      },
      green: {
        light: 'bg-green-50 text-green-600 border-green-200',
        dark: 'bg-green-500/10 text-green-400 border-green-500/30',
        selected: 'bg-green-500 text-white border-green-600'
      },
      purple: {
        light: 'bg-purple-50 text-purple-600 border-purple-200',
        dark: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
        selected: 'bg-purple-500 text-white border-purple-600'
      },
      orange: {
        light: 'bg-orange-50 text-orange-600 border-orange-200',
        dark: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
        selected: 'bg-orange-500 text-white border-orange-600'
      },
      pink: {
        light: 'bg-pink-50 text-pink-600 border-pink-200',
        dark: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
        selected: 'bg-pink-500 text-white border-pink-600'
      },
      cyan: {
        light: 'bg-cyan-50 text-cyan-600 border-cyan-200',
        dark: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
        selected: 'bg-cyan-500 text-white border-cyan-600'
      },
      indigo: {
        light: 'bg-indigo-50 text-indigo-600 border-indigo-200',
        dark: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
        selected: 'bg-indigo-500 text-white border-indigo-600'
      },
      amber: {
        light: 'bg-amber-50 text-amber-600 border-amber-200',
        dark: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        selected: 'bg-amber-500 text-white border-amber-600'
      },
      red: {
        light: 'bg-red-50 text-red-600 border-red-200',
        dark: 'bg-red-500/10 text-red-400 border-red-500/30',
        selected: 'bg-red-500 text-white border-red-600'
      },
      teal: {
        light: 'bg-teal-50 text-teal-600 border-teal-200',
        dark: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
        selected: 'bg-teal-500 text-white border-teal-600'
      },
      violet: {
        light: 'bg-violet-50 text-violet-600 border-violet-200',
        dark: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
        selected: 'bg-violet-500 text-white border-violet-600'
      },
      gray: {
        light: 'bg-gray-50 text-gray-600 border-gray-200',
        dark: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
        selected: 'bg-gray-500 text-white border-gray-600'
      }
    }

    const colorScheme = colors[colorName] || colors.blue

    if (isSelected) {
      return colorScheme.selected
    }

    return theme === 'dark' ? colorScheme.dark : colorScheme.light
  }

  const colorClasses = getColorClasses(color, selected)

  return (
    <button
      className={`
        w-full p-4 rounded-lg border-2
        min-h-[80px]
        transition-all duration-200
        hover:scale-102 active:scale-98
        hover:shadow-md
        flex items-center gap-4 text-left
        ${colorClasses}
        ${className}
      `}
      {...props}
    >
      {/* Icon */}
      <div className="flex-shrink-0">
        {icon}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold mb-1 truncate">
          {title}
        </h4>
        <p className={`
          text-xs truncate
          ${selected ? 'text-white/80' : 'opacity-75'}
        `}>
          {description}
        </p>
      </div>

      {/* Selected indicator */}
      {selected && (
        <div className="flex-shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      )}
    </button>
  )
}

