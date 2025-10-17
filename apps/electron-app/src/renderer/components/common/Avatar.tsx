import { HTMLAttributes } from 'react'

/**
 * Avatar component props
 */
export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  /** User's full name for initials */
  name: string
  /** Avatar color */
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'cyan' | 'indigo' | 'red' | 'teal' | 'amber'
  /** Avatar size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  /** Image URL (optional) */
  src?: string
}

/**
 * Reusable Avatar component with initials and color support
 * 
 * @example
 * ```tsx
 * <Avatar name="John Doe" color="blue" size="lg" />
 * ```
 */
export function Avatar({
  name,
  color = 'blue',
  size = 'md',
  src,
  className = '',
  ...props
}: AvatarProps) {
  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const sizeClasses = {
    xs: 'w-8 h-8 text-xs',
    sm: 'w-12 h-12 text-sm',
    md: 'w-16 h-16 text-base',
    lg: 'w-20 h-20 text-lg',
    xl: 'w-24 h-24 text-xl',
    '2xl': 'w-32 h-32 text-2xl'
  }

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    pink: 'bg-pink-500',
    cyan: 'bg-cyan-500',
    indigo: 'bg-indigo-500',
    red: 'bg-red-500',
    teal: 'bg-teal-500',
    amber: 'bg-amber-500'
  }

  const baseClasses = `
    rounded-full flex items-center justify-center
    text-white font-bold
    ${sizeClasses[size]}
    ${colorClasses[color]}
    ${className}
  `

  if (src) {
    return (
      <div className={baseClasses} {...props}>
        <img
          src={src}
          alt={name}
          className="w-full h-full rounded-full object-cover"
        />
      </div>
    )
  }

  return (
    <div className={baseClasses} {...props}>
      {getInitials(name)}
    </div>
  )
}

