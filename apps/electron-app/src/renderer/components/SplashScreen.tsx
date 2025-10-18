import { useEffect, useState } from 'react'
import { useAppStore } from '../stores'

interface SplashScreenProps {
  onComplete?: () => void
  duration?: number
}

/**
 * SplashScreen component - Initial loading screen with branding and progress
 * Displays app logo, branding, and loading progress with smooth animations
 *
 * @param onComplete - Callback function when splash screen completes
 * @param duration - Duration in milliseconds (default: 3000ms)
 */
export function SplashScreen({ onComplete, duration = 3000 }: SplashScreenProps) {
  const { theme } = useAppStore()
  const [isVisible, setIsVisible] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [progress, setProgress] = useState(0)
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    // Start animation sequence
    const timer1 = setTimeout(() => setIsVisible(true), 100)
    const timer2 = setTimeout(() => setShowContent(true), 600)

    // Animate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.random() * 30
        return next > 85 ? 85 : next
      })
    }, 200)

    // Complete splash screen after duration
    const timer3 = setTimeout(() => {
      setProgress(100)
      setIsVisible(false)
      setTimeout(() => onComplete?.(), 500)
    }, duration)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearInterval(progressInterval)
    }
  }, [duration, onComplete])

  return (
    <div className={`
      fixed inset-0 z-50 flex items-center justify-center overflow-hidden
      transition-opacity duration-500 ease-in-out
      ${isVisible ? 'opacity-100' : 'opacity-0'}
      ${theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950' 
        : 'bg-gradient-to-br from-primary-50 via-white to-blue-50'
      }
    `}>
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`
          absolute top-0 left-0 w-96 h-96 rounded-full opacity-30
          ${theme === 'dark' ? 'bg-primary-600/20' : 'bg-primary-400/10'}
          blur-3xl animate-float-slow
        `} />
        <div className={`
          absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-20
          ${theme === 'dark' ? 'bg-primary-500/20' : 'bg-primary-500/5'}
          blur-3xl animate-float-medium
        `} style={{ animationDelay: '1s' }} />
        <div className={`
          absolute top-1/2 left-1/3 w-64 h-64 rounded-full opacity-15
          ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-400/5'}
          blur-3xl animate-float-slow
        `} style={{ animationDelay: '2s' }} />
      </div>

      {/* Grid Pattern Background */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `
          linear-gradient(0deg, transparent 24%, rgba(68, 68, 68, .05) 25%, rgba(68, 68, 68, .05) 26%, transparent 27%, transparent 74%, rgba(68, 68, 68, .05) 75%, rgba(68, 68, 68, .05) 76%, transparent 77%, transparent),
          linear-gradient(90deg, transparent 24%, rgba(68, 68, 68, .05) 25%, rgba(68, 68, 68, .05) 26%, transparent 27%, transparent 74%, rgba(68, 68, 68, .05) 75%, rgba(68, 68, 68, .05) 76%, transparent 77%, transparent)
        `,
        backgroundSize: '50px 50px'
      }} />

      {/* Main Content Card */}
      <div className={`
        relative z-10 text-center px-8 max-w-2xl
        backdrop-blur-xl rounded-2xl p-12
        border
        transform transition-all duration-1000 ease-out
        ${showContent 
          ? 'translate-y-0 scale-100 opacity-100' 
          : 'translate-y-12 scale-95 opacity-0'
        }
        ${theme === 'dark'
          ? 'bg-gray-800/40 border-gray-700/50 shadow-2xl shadow-gray-950/50'
          : 'bg-white/40 border-white/60 shadow-2xl shadow-primary-900/10'
        }
      `}>
        {/* Logo/Icon with Glow */}
        <div className={`
          inline-flex items-center justify-center w-24 h-24 rounded-full mb-8
          transform transition-all duration-1000 ease-out relative
          ${showContent ? 'rotate-0 scale-100' : 'rotate-12 scale-75'}
          animate-pulse-glow
        `}>
          {/* Glow Background */}
          <div className={`
            absolute inset-0 rounded-full opacity-50 blur-lg
            ${theme === 'dark'
              ? 'bg-gradient-to-r from-primary-600 to-primary-500'
              : 'bg-gradient-to-r from-primary-500 to-primary-400'
            }
            animate-glow-pulse
          `} />

          {/* Icon Container */}
          <div className={`
            relative flex items-center justify-center w-24 h-24 rounded-full
            bg-gradient-to-br
            ${theme === 'dark'
              ? 'from-primary-600 to-primary-700 shadow-2xl shadow-primary-900/50'
              : 'from-primary-500 to-primary-600 shadow-2xl shadow-primary-500/30'
            }
          `}>
            {/* Shopping cart icon for POS system */}
            <svg
              className="w-12 h-12 text-white animate-icon-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
        </div>

        {/* Main Title with Gradient */}
        <h1 className={`
          text-5xl font-bold mb-2 tracking-tight
          bg-gradient-to-r bg-clip-text text-transparent
          transform transition-all duration-1000 ease-out
          ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}
          ${theme === 'dark' 
            ? 'from-primary-300 to-primary-500' 
            : 'from-primary-600 to-primary-700'
          }
        `} style={{ animationDelay: '300ms' }}>
          MidLogic POS
        </h1>

        {/* Subtitle Line */}
        <div className={`
          w-12 h-1 mx-auto mb-6
          rounded-full
          transform transition-all duration-1000 ease-out
          ${showContent ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'}
          ${theme === 'dark' 
            ? 'bg-gradient-to-r from-primary-500 to-primary-400' 
            : 'bg-gradient-to-r from-primary-500 to-primary-600'
          }
        `} style={{ animationDelay: '500ms' }} />

        {/* Descriptive Text */}
        <div className={`
          space-y-2 mb-8
          transform transition-all duration-1000 ease-out
          ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}
        `} style={{ animationDelay: '600ms' }}>
          <p className={`
            text-lg font-semibold
            ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}
          `}>
            Premium Point of Sale System
          </p>
          <p className={`
            text-sm
            ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
          `}>
            Designed for MidLogic Hardware
          </p>
        </div>

        {/* Progress Bar Container */}
        <div className={`
          w-full space-y-3 mb-8
          transform transition-all duration-1000 ease-out
          ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}
        `} style={{ animationDelay: '700ms' }}>
          <div
            className={`
              w-full h-1 rounded-full overflow-hidden
              ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-200/50'}
            `}
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="System initialization progress"
          >
            <div
              className={`
                h-full rounded-full transition-all duration-300 ease-out
                bg-gradient-to-r
                ${theme === 'dark'
                  ? 'from-primary-500 to-primary-400'
                  : 'from-primary-600 to-primary-500'
                }
              `}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className={`
            text-xs font-medium
            ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}
          `}>
            Initializing System... {Math.round(progress)}%
          </p>
        </div>

        {/* Footer Info */}
        <div className={`
          space-y-2 text-center
          transform transition-all duration-1000 ease-out
          ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}
        `} style={{ animationDelay: '900ms' }}>
          <p className={`
            text-sm font-light
            ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
          `}>
            Version 1.0.0
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
  )
}
