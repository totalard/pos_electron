import { useAppStore } from '../../stores'
import { useInternetConnection } from '../../hooks'

export interface InternetStatusIndicatorProps {
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
}

export function InternetStatusIndicator({ 
  showLabel = false, 
  size = 'md',
  showTooltip = true
}: InternetStatusIndicatorProps) {
  const { theme } = useAppStore()
  const { isOnline, isChecking } = useInternetConnection()

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  const getTooltipText = () => {
    if (isChecking) return 'Checking connection...'
    if (isOnline) return 'Internet connected'
    return 'No internet connection'
  }

  const containerClasses = `flex items-center gap-2 transition-all duration-200 ${
    showLabel ? 'px-3 py-1.5 rounded-lg' : ''
  } ${
    showLabel ? (theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100/50') : ''
  } ${
    showTooltip ? 'cursor-help' : ''
  }`

  return (
    <div 
      className={containerClasses}
      title={showTooltip ? getTooltipText() : undefined}
    >
      {isChecking ? (
        <>
          <div className={`${sizeClasses[size]} rounded-full bg-yellow-500 animate-pulse`} />
          {showLabel && (
            <span className={`${textSizeClasses[size]} ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Checking...
            </span>
          )}
        </>
      ) : isOnline ? (
        <>
          <svg 
            className={`${iconSizeClasses[size]} ${theme === 'dark' ? 'text-green-400' : 'text-green-600'} transition-colors duration-200`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" 
            />
          </svg>
          {showLabel && (
            <span className={`${textSizeClasses[size]} font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
              Online
            </span>
          )}
        </>
      ) : (
        <>
          <svg 
            className={`${iconSizeClasses[size]} ${theme === 'dark' ? 'text-red-400' : 'text-red-600'} transition-colors duration-200`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3" 
            />
          </svg>
          {showLabel && (
            <span className={`${textSizeClasses[size]} font-medium ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
              Offline
            </span>
          )}
        </>
      )}
    </div>
  )
}
