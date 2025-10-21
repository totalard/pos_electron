import { useEffect, useState } from 'react'
import { useAppStore } from '../stores'
import { ThemeToggle } from './common/ThemeToggle'

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
        ? 'bg-gradient-to-br from-slate-950 to-gray-950' 
        : 'bg-gradient-to-br from-gray-50 to-blue-50'
      }
    `}>
      {/* Theme Toggle - Top Right Corner */}
      <div className="absolute top-6 right-6 z-50 animate-fade-in">
        <ThemeToggle size="md" className="backdrop-blur-xl bg-white/10 dark:bg-gray-800/30 rounded-full p-2 shadow-lg hover:scale-110 transition-transform" />
      </div>
      {/* Animated Background Gradient - Minimal */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`
          absolute top-0 right-0 w-[400px] h-[400px] rounded-full
          ${theme === 'dark' ? 'bg-blue-600/15' : 'bg-blue-400/10'}
          blur-3xl animate-float-slow
        `} />
        <div className={`
          absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full
          ${theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-300/8'}
          blur-3xl animate-float-medium
        `} style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Grid Pattern Background - Minimal */}
      <div className={`absolute inset-0 ${theme === 'dark' ? 'opacity-[0.02]' : 'opacity-[0.03]'}`} style={{
        backgroundImage: `
          radial-gradient(circle at 1px 1px, ${theme === 'dark' ? 'rgba(148, 163, 184, 0.1)' : 'rgba(59, 130, 246, 0.08)'} 1px, transparent 0)
        `,
        backgroundSize: '40px 40px'
      }} />

      {/* Main Content Card - Enhanced */}
      <div className={`
        relative z-10 text-center px-8 max-w-2xl
        backdrop-blur-2xl rounded-3xl p-12
        border
        transform transition-all duration-1000 ease-out
        ${showContent 
          ? 'translate-y-0 scale-100 opacity-100' 
          : 'translate-y-12 scale-95 opacity-0'
        }
        ${theme === 'dark'
          ? 'bg-gray-800/50 border-gray-700/50 shadow-2xl shadow-black/20'
          : 'bg-white/80 border-white/90 shadow-2xl shadow-blue-500/10'
        }
      `}>
        {/* Logo/Icon with Glow - Enhanced */}
        <div className={`
          inline-flex items-center justify-center w-28 h-28 rounded-full mb-8
          transform transition-all duration-1000 ease-out relative
          ${showContent ? 'rotate-0 scale-100' : 'rotate-12 scale-75'}
          animate-pulse-glow
        `}>
          {/* Glow Background - Minimal */}
          <div className={`
            absolute inset-0 rounded-full opacity-40 blur-xl
            ${theme === 'dark'
              ? 'bg-blue-600'
              : 'bg-blue-500'
            }
            animate-glow-pulse
          `} />

          {/* Icon Container - Enhanced */}
          <div className={`
            relative flex items-center justify-center w-28 h-28 rounded-full
            bg-gradient-to-br
            ${theme === 'dark'
              ? 'from-blue-600 to-blue-700 shadow-2xl shadow-blue-900/50'
              : 'from-blue-500 to-blue-600 shadow-2xl shadow-blue-500/30'
            }
          `}>
            {/* Shopping cart icon for POS system - Enhanced */}
            <svg
              className="w-14 h-14 text-white animate-icon-pulse drop-shadow-lg"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
        </div>

        {/* Main Title with Gradient - Enhanced */}
        <h1 className={`
          text-6xl font-bold mb-3 tracking-tight
          bg-gradient-to-r bg-clip-text text-transparent
          transform transition-all duration-1000 ease-out
          ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}
          ${theme === 'dark' 
            ? 'from-blue-400 to-blue-300' 
            : 'from-blue-600 to-blue-700'
          }
        `} style={{ animationDelay: '300ms' }}>
          MidLogic POS
        </h1>

        {/* Subtitle Line - Enhanced */}
        <div className={`
          w-16 h-1.5 mx-auto mb-6
          rounded-full
          transform transition-all duration-1000 ease-out
          ${showContent ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'}
          ${theme === 'dark' 
            ? 'bg-blue-500 shadow-lg shadow-blue-500/30' 
            : 'bg-blue-500 shadow-lg shadow-blue-500/20'
          }
        `} style={{ animationDelay: '500ms' }} />

        {/* Descriptive Text - Enhanced */}
        <div className={`
          space-y-3 mb-10
          transform transition-all duration-1000 ease-out
          ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}
        `} style={{ animationDelay: '600ms' }}>
          <p className={`
            text-xl font-bold
            ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
          `}>
            Premium Point of Sale System
          </p>
          <p className={`
            text-base font-medium
            ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
          `}>
            Designed for MidLogic Hardware
          </p>
          <div className={`flex items-center justify-center gap-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Fast • Secure • Reliable</span>
          </div>
        </div>

        {/* Progress Bar Container - Enhanced */}
        <div className={`
          w-full space-y-4 mb-10
          transform transition-all duration-1000 ease-out
          ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}
        `} style={{ animationDelay: '700ms' }}>
          <div
            className={`
              w-full h-2 rounded-full overflow-hidden backdrop-blur-sm
              ${theme === 'dark' ? 'bg-gray-700/60 shadow-inner' : 'bg-gray-200/60 shadow-inner'}
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
                bg-gradient-to-r relative overflow-hidden
                ${theme === 'dark'
                  ? 'from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30'
                  : 'from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20'
                }
              `}
              style={{ width: `${progress}%` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className={`
              text-sm font-semibold
              ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
            `}>
              Initializing System...
            </p>
            <p className={`
              text-sm font-bold
              ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}
            `}>
              {Math.round(progress)}%
            </p>
          </div>
        </div>

        {/* Footer Info - Enhanced */}
        <div className={`
          space-y-2 text-center
          transform transition-all duration-1000 ease-out
          ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}
        `} style={{ animationDelay: '900ms' }}>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${theme === 'dark' ? 'bg-gray-700/40' : 'bg-gray-100/60'}`}>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <p className={`
              text-sm font-medium
              ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
            `}>
              Version 1.0.0
            </p>
          </div>
          <p className={`
            text-xs font-medium
            ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}
          `}>
            © {currentYear} MidLogic. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
