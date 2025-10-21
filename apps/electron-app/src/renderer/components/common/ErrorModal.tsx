/**
 * ErrorModal Component
 * Displays API errors with detailed information in development mode
 */

import { useState } from 'react'
import { useAppStore } from '../../stores'
import { useErrorStore } from '../../stores/errorStore'
import { isDevelopment } from '../../utils/env'

export function ErrorModal() {
  const { theme } = useAppStore()
  const { currentError, clearError } = useErrorStore()
  const [showDetails, setShowDetails] = useState(false)
  const [showStackTrace, setShowStackTrace] = useState(false)

  if (!currentError) return null

  const isOpen = !!currentError
  const isDev = isDevelopment()

  const handleClose = () => {
    clearError()
    setShowDetails(false)
    setShowStackTrace(false)
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  // Determine error severity color
  const getSeverityColor = () => {
    if (!currentError.code) return 'red'
    
    if (currentError.code === -32001) return 'amber' // Validation
    if (currentError.code === -32002) return 'orange' // Auth
    if (currentError.code === -32004) return 'blue' // Not found
    
    return 'red' // Default to error red
  }

  const severityColor = getSeverityColor()

  const colorClasses = {
    red: {
      light: 'bg-red-50 border-red-200 text-red-900',
      dark: 'bg-red-500/10 border-red-500/30 text-red-100',
      headerLight: 'bg-red-100 border-red-200',
      headerDark: 'bg-red-500/20 border-red-500/30',
      buttonLight: 'bg-red-600 hover:bg-red-700 text-white',
      buttonDark: 'bg-red-600 hover:bg-red-700 text-white',
      iconLight: 'text-red-600',
      iconDark: 'text-red-400'
    },
    amber: {
      light: 'bg-amber-50 border-amber-200 text-amber-900',
      dark: 'bg-amber-500/10 border-amber-500/30 text-amber-100',
      headerLight: 'bg-amber-100 border-amber-200',
      headerDark: 'bg-amber-500/20 border-amber-500/30',
      buttonLight: 'bg-amber-600 hover:bg-amber-700 text-white',
      buttonDark: 'bg-amber-600 hover:bg-amber-700 text-white',
      iconLight: 'text-amber-600',
      iconDark: 'text-amber-400'
    },
    orange: {
      light: 'bg-orange-50 border-orange-200 text-orange-900',
      dark: 'bg-orange-500/10 border-orange-500/30 text-orange-100',
      headerLight: 'bg-orange-100 border-orange-200',
      headerDark: 'bg-orange-500/20 border-orange-500/30',
      buttonLight: 'bg-orange-600 hover:bg-orange-700 text-white',
      buttonDark: 'bg-orange-600 hover:bg-orange-700 text-white',
      iconLight: 'text-orange-600',
      iconDark: 'text-orange-400'
    },
    blue: {
      light: 'bg-blue-50 border-blue-200 text-blue-900',
      dark: 'bg-blue-500/10 border-blue-500/30 text-blue-100',
      headerLight: 'bg-blue-100 border-blue-200',
      headerDark: 'bg-blue-500/20 border-blue-500/30',
      buttonLight: 'bg-blue-600 hover:bg-blue-700 text-white',
      buttonDark: 'bg-blue-600 hover:bg-blue-700 text-white',
      iconLight: 'text-blue-600',
      iconDark: 'text-blue-400'
    }
  }

  const colors = colorClasses[severityColor]

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className={`
          relative w-full max-w-2xl rounded-xl shadow-2xl
          transform transition-all duration-200
          ${theme === 'dark'
            ? 'bg-gray-800 border border-gray-700'
            : 'bg-white border border-gray-200'
          }
        `}
      >
        {/* Header */}
        <div className={`
          flex items-start gap-4 p-6 border-b rounded-t-xl
          ${theme === 'dark' ? colors.headerDark : colors.headerLight}
        `}>
          {/* Error Icon */}
          <div className={`flex-shrink-0 ${theme === 'dark' ? colors.iconDark : colors.iconLight}`}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          {/* Title */}
          <div className="flex-1">
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {currentError.title}
            </h2>
            {currentError.code && (
              <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Error Code: {currentError.code}
              </p>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className={`
              p-2 rounded-lg transition-colors
              min-w-[44px] min-h-[44px]
              ${theme === 'dark'
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
              }
            `}
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
          {/* Error Message */}
          <div className={`
            p-4 rounded-lg border mb-4
            ${theme === 'dark' ? colors.dark : colors.light}
          `}>
            <p className="text-base leading-relaxed whitespace-pre-wrap">
              {currentError.message}
            </p>
          </div>

          {/* Development Mode Details */}
          {isDev && (currentError.details || currentError.stackTrace) && (
            <div className="space-y-3">
              {/* Details Section */}
              {currentError.details && Object.keys(currentError.details).length > 0 && (
                <div>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className={`
                      w-full flex items-center justify-between p-3 rounded-lg
                      transition-colors text-left
                      ${theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                      }
                    `}
                  >
                    <span className="font-semibold">Error Details</span>
                    <svg
                      className={`w-5 h-5 transition-transform ${showDetails ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showDetails && (
                    <div className={`
                      mt-2 p-4 rounded-lg border font-mono text-sm overflow-x-auto
                      ${theme === 'dark'
                        ? 'bg-gray-900 border-gray-700 text-gray-300'
                        : 'bg-gray-50 border-gray-200 text-gray-800'
                      }
                    `}>
                      <pre>{JSON.stringify(currentError.details, null, 2)}</pre>
                    </div>
                  )}
                </div>
              )}

              {/* Stack Trace Section */}
              {currentError.stackTrace && (
                <div>
                  <button
                    onClick={() => setShowStackTrace(!showStackTrace)}
                    className={`
                      w-full flex items-center justify-between p-3 rounded-lg
                      transition-colors text-left
                      ${theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                      }
                    `}
                  >
                    <span className="font-semibold">Stack Trace</span>
                    <svg
                      className={`w-5 h-5 transition-transform ${showStackTrace ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showStackTrace && (
                    <div className={`
                      mt-2 p-4 rounded-lg border font-mono text-xs overflow-x-auto
                      ${theme === 'dark'
                        ? 'bg-gray-900 border-gray-700 text-gray-300'
                        : 'bg-gray-50 border-gray-200 text-gray-800'
                      }
                    `}>
                      <pre className="whitespace-pre-wrap">{currentError.stackTrace}</pre>
                    </div>
                  )}
                </div>
              )}

              {/* Dev Mode Badge */}
              <div className={`
                text-xs text-center p-2 rounded
                ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'}
              `}>
                Development Mode - Additional details shown
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`
          flex items-center justify-end gap-3 p-6 border-t
          ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
        `}>
          <button
            onClick={handleClose}
            className={`
              px-6 py-3 rounded-lg font-semibold
              transition-colors min-w-[120px]
              ${theme === 'dark' ? colors.buttonDark : colors.buttonLight}
            `}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
