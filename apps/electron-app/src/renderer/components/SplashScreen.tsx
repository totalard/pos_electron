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
      transition-opacity duration-300 ease-out
      ${isVisible ? 'opacity-100' : 'opacity-0'}
      ${theme === 'dark' 
        ? 'bg-gray-900' 
        : 'bg-white'
      }
    `}>
      {/* Theme Toggle - Top Right Corner */}
      <div className="absolute top-8 right-8 z-50 animate-smooth-fade-in">
        <ThemeToggle 
          size="md" 
          className="rounded-lg p-2 transition-all duration-200 hover:scale-105 active:scale-95" 
        />
      </div>

      {/* Main Content - Minimal Flat Design */}
      <div className={`
        relative z-10 text-center px-12 max-w-2xl
        transform transition-all duration-400 ease-out
        ${showContent 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-8 opacity-0'
        }
      `}>
        {/* Logo/Icon - Minimal Flat Design */}
        <div className={`
          inline-flex items-center justify-center w-24 h-24 rounded-full mb-10
          transform transition-all duration-300 ease-out
          ${showContent ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}
          ${theme === 'dark'
            ? 'bg-blue-600'
            : 'bg-blue-500'
          }
        `}>
          {/* Shopping cart icon for POS system */}
          <svg
            className="w-12 h-12 text-white"
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

        {/* Main Title - Minimal */}
        <h1 className={`
          text-5xl font-bold mb-4 tracking-tight
          transform transition-all duration-300 ease-out
          ${showContent ? 'opacity-100' : 'opacity-0'}
          ${theme === 'dark' 
            ? 'text-white' 
            : 'text-gray-900'
          }
        `}>
          MidLogic POS
        </h1>

        {/* Subtitle Line - Minimal */}
        <div className={`
          w-12 h-1 mx-auto mb-8
          rounded-full
          transform transition-all duration-300 ease-out
          ${showContent ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'}
          ${theme === 'dark' 
            ? 'bg-blue-500' 
            : 'bg-blue-500'
          }
        `} />

        {/* Descriptive Text - Minimal */}
        <div className={`
          space-y-2 mb-12
          transform transition-all duration-300 ease-out
          ${showContent ? 'opacity-100' : 'opacity-0'}
        `}>
          <p className={`
            text-lg font-medium
            ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}
          `}>
            Premium Point of Sale System
          </p>
          <p className={`
            text-sm font-normal
            ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}
          `}>
            Designed for MidLogic Hardware
          </p>
        </div>

        {/* Progress Bar - Minimal */}
        <div className={`
          w-full max-w-md mx-auto space-y-3 mb-12
          transform transition-all duration-300 ease-out
          ${showContent ? 'opacity-100' : 'opacity-0'}
        `}>
          <div
            className={`
              w-full h-1.5 rounded-full overflow-hidden
              ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}
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
                ${theme === 'dark' ? 'bg-blue-500' : 'bg-blue-500'}
              `}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between">
            <p className={`
              text-sm font-medium
              ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
            `}>
              Initializing System...
            </p>
            <p className={`
              text-sm font-semibold
              ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}
            `}>
              {Math.round(progress)}%
            </p>
          </div>
        </div>

        {/* Footer Info - Minimal */}
        <div className={`
          space-y-2 text-center
          transform transition-all duration-300 ease-out
          ${showContent ? 'opacity-100' : 'opacity-0'}
        `}>
          <p className={`
            text-xs font-medium
            ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}
          `}>
            Version 1.0.0
          </p>
          <p className={`
            text-xs font-normal
            ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}
          `}>
            © {currentYear} MidLogic. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
