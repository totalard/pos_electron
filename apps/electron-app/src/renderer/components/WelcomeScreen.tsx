import { useAppStore } from '../stores'
import { useEffect, useState } from 'react'
import { Button, Card } from './common'

/**
 * WelcomeScreen component - Initial landing screen with system information
 * Displays app branding, features, and system details with theme support
 *
 * @deprecated This component is rarely used as the app goes directly to Login.
 * Kept for potential future use or development mode.
 */
export function WelcomeScreen() {
  const { currentUser, theme, setTheme } = useAppStore()
  const [systemInfo, setSystemInfo] = useState({
    platform: '',
    versions: { node: '', chrome: '', electron: '' }
  })
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // Get system information from Electron API
    if (window.electronAPI) {
      setSystemInfo({
        platform: window.electronAPI.platform,
        versions: window.electronAPI.versions
      })
    }

    // Trigger entrance animation
    const timer = setTimeout(() => setShowContent(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleGetStarted = () => {
    console.log('Get started clicked - navigation handled by parent component')
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const currentYear = new Date().getFullYear()

  return (
    <div className={`
      flex h-full w-full items-center justify-center overflow-hidden
      transition-all duration-300
      ${theme === 'dark'
        ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950'
        : 'bg-gradient-to-br from-primary-50 via-white to-blue-50'
      }
    `}>
      {/* Animated background gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`
          absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20
          blur-3xl animate-float-slow
          ${theme === 'dark' ? 'bg-primary-600/30' : 'bg-primary-400/15'}
        `} />
        <div className={`
          absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-15
          blur-3xl animate-float-medium
          ${theme === 'dark' ? 'bg-primary-500/30' : 'bg-primary-500/10'}
        `} style={{ animationDelay: '1s' }} />
      </div>

      <div className={`
        relative z-10 max-w-3xl w-full mx-8
        transform transition-all duration-700 ease-out
        ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
      `}>
        <div className={`
          rounded-2xl backdrop-blur-xl border p-8 md:p-12
          ${theme === 'dark'
            ? 'bg-gray-800/40 border-gray-700/50 shadow-2xl shadow-gray-950/50'
            : 'bg-white/40 border-white/60 shadow-2xl shadow-primary-900/10'
          }
        `}>
          {/* Header */}
          <div className="text-center mb-10">
            <div className={`
              inline-flex items-center justify-center w-20 h-20 rounded-full mb-6
              bg-gradient-to-br shadow-lg relative
              ${theme === 'dark'
                ? 'from-primary-600 to-primary-700 shadow-primary-900/50'
                : 'from-primary-500 to-primary-600 shadow-primary-500/30'
              }
            `}>
              {/* Glow effect */}
              <div className={`
                absolute inset-0 rounded-full opacity-40 blur-lg
                ${theme === 'dark'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-500'
                  : 'bg-gradient-to-r from-primary-500 to-primary-400'
                }
              `} />
              <svg
                className="w-10 h-10 text-white relative z-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h1 className={`
              text-4xl md:text-5xl font-bold mb-3 tracking-tight
              bg-gradient-to-r bg-clip-text text-transparent
              ${theme === 'dark'
                ? 'from-primary-300 to-primary-500'
                : 'from-primary-600 to-primary-700'
              }
            `}>
              Welcome to MidLogic POS
            </h1>
            <p className={`
              text-lg
              ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
            `}>
              Modern Point of Sale System built with Electron
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { icon: '⚡', title: 'Fast', desc: 'Lightning quick performance' },
              { icon: '🔒', title: 'Secure', desc: 'Enterprise-grade security' },
              { icon: '✨', title: 'Modern', desc: 'Beautiful user interface' }
            ].map((feature, index) => (
              <div
                key={feature.title}
                className={`
                  text-center p-6 rounded-xl backdrop-blur-sm border
                  transition-all duration-300 hover:scale-105
                  ${theme === 'dark'
                    ? 'bg-gray-700/30 border-gray-600/30 hover:border-primary-500/50'
                    : 'bg-white/50 border-gray-200/50 hover:border-primary-400/50'
                  }
                `}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-3xl mb-2" aria-hidden="true">{feature.icon}</div>
                <div className={`
                  font-semibold mb-1
                  ${theme === 'dark' ? 'text-primary-300' : 'text-primary-600'}
                `}>
                  {feature.title}
                </div>
                <div className={`
                  text-sm
                  ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                `}>
                  {feature.desc}
                </div>
              </div>
            ))}
          </div>

          {/* System Info */}
          {systemInfo.platform && (
            <div className={`
              mb-8 p-6 rounded-xl backdrop-blur-sm border
              ${theme === 'dark'
                ? 'bg-gray-700/30 border-gray-600/30'
                : 'bg-white/50 border-gray-200/50'
              }
            `}>
              <h3 className={`
                text-sm font-semibold mb-3
                ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
              `}>
                System Information
              </h3>
              <div className={`
                grid grid-cols-2 gap-3 text-xs
                ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
              `}>
                <div>Platform: <span className="font-mono">{systemInfo.platform}</span></div>
                <div>Electron: <span className="font-mono">{systemInfo.versions.electron}</span></div>
                <div>Node: <span className="font-mono">{systemInfo.versions.node}</span></div>
                <div>Chrome: <span className="font-mono">{systemInfo.versions.chrome}</span></div>
              </div>
            </div>
          )}

          {/* User Status */}
          {currentUser && (
            <div className={`
              mb-8 p-4 rounded-xl backdrop-blur-sm border
              ${theme === 'dark'
                ? 'bg-primary-500/20 border-primary-500/30 text-primary-300'
                : 'bg-primary-50/80 border-primary-200 text-primary-800'
              }
            `}>
              <p className="text-sm">
                Welcome back, <span className="font-semibold">{typeof currentUser === 'string' ? currentUser : currentUser.full_name}</span>!
              </p>
            </div>
          )}

          {/* Actions - Touch-safe with minimum 44x44px */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              onClick={handleGetStarted}
              className="min-h-[44px] px-6 py-3"
              aria-label="Get started with the application"
            >
              Get Started
            </Button>
            <Button
              onClick={toggleTheme}
              variant="secondary"
              className="min-h-[44px] px-6 py-3"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                {theme === 'light' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                )}
              </svg>
              {theme === 'light' ? 'Dark' : 'Light'} Mode
            </Button>
          </div>

          {/* Footer */}
          <div className={`
            pt-6 border-t text-center
            ${theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200/50'}
          `}>
            <p className={`
              text-sm mb-2
              ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
            `}>
              Built with Electron, TypeScript, Tailwind CSS v4, and Zustand
            </p>
            <p className={`
              text-xs
              ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}
            `}>
              © {currentYear} MidLogic. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

