import { useEffect, useState } from 'react'
import { useAppStore } from '../stores'

interface SplashScreenProps {
  onComplete?: () => void
  duration?: number
}

export function SplashScreen({ onComplete, duration = 3000 }: SplashScreenProps) {
  const { theme } = useAppStore()
  const [isVisible, setIsVisible] = useState(false)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // Start animation sequence
    const timer1 = setTimeout(() => setIsVisible(true), 100)
    const timer2 = setTimeout(() => setShowContent(true), 500)
    
    // Complete splash screen after duration
    const timer3 = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onComplete?.(), 500)
    }, duration)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [duration, onComplete])

  return (
    <div className={`
      fixed inset-0 z-50 flex items-center justify-center
      transition-all duration-500 ease-in-out
      ${isVisible ? 'opacity-100' : 'opacity-0'}
      ${theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-primary-50 via-white to-primary-100'
      }
    `}>
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`
          absolute -top-1/2 -left-1/2 w-full h-full rounded-full opacity-10
          ${theme === 'dark' ? 'bg-primary-400' : 'bg-primary-200'}
          animate-pulse
        `} />
        <div className={`
          absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full opacity-5
          ${theme === 'dark' ? 'bg-primary-300' : 'bg-primary-300'}
          animate-pulse
        `} style={{ animationDelay: '1s' }} />
      </div>

      {/* Main Content */}
      <div className={`
        relative z-10 text-center px-8 max-w-2xl
        transform transition-all duration-1000 ease-out
        ${showContent 
          ? 'translate-y-0 scale-100 opacity-100' 
          : 'translate-y-8 scale-95 opacity-0'
        }
      `}>
        {/* Logo/Icon */}
        <div className={`
          inline-flex items-center justify-center w-32 h-32 rounded-full mb-8
          transform transition-all duration-1000 ease-out
          ${showContent ? 'rotate-0 scale-100' : 'rotate-12 scale-90'}
          ${theme === 'dark' 
            ? 'bg-gradient-to-br from-primary-600 to-primary-800 shadow-2xl shadow-primary-900/50' 
            : 'bg-gradient-to-br from-primary-500 to-primary-700 shadow-2xl shadow-primary-500/30'
          }
        `}>
          <svg
            className="w-16 h-16 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>

        {/* Main Title */}
        <h1 className={`
          text-6xl font-bold mb-4
          bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent
          transform transition-all duration-1000 ease-out
          ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
          ${theme === 'dark' ? 'from-primary-400 to-primary-600' : 'from-primary-600 to-primary-800'}
        `} style={{ animationDelay: '200ms' }}>
          MidLogic POS
        </h1>

        {/* Subtitle */}
        <div className={`
          space-y-3 mb-8
          transform transition-all duration-1000 ease-out
          ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        `} style={{ animationDelay: '400ms' }}>
          <p className={`
            text-xl font-medium
            ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
          `}>
            This software works only with MidLogic Device
          </p>
          <p className={`
            text-lg
            ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
          `}>
            Freely given with its own devices
          </p>
          <p className={`
            text-base font-light italic
            ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}
          `}>
            A freeware by MidLogic
          </p>
        </div>

        {/* Loading Animation */}
        <div className={`
          flex justify-center items-center space-x-2
          transform transition-all duration-1000 ease-out
          ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        `} style={{ animationDelay: '600ms' }}>
          <div className={`
            w-2 h-2 rounded-full animate-bounce
            ${theme === 'dark' ? 'bg-primary-400' : 'bg-primary-600'}
          `} />
          <div className={`
            w-2 h-2 rounded-full animate-bounce
            ${theme === 'dark' ? 'bg-primary-400' : 'bg-primary-600'}
          `} style={{ animationDelay: '0.1s' }} />
          <div className={`
            w-2 h-2 rounded-full animate-bounce
            ${theme === 'dark' ? 'bg-primary-400' : 'bg-primary-600'}
          `} style={{ animationDelay: '0.2s' }} />
        </div>

        {/* Version Info */}
        <div className={`
          mt-12 text-sm
          transform transition-all duration-1000 ease-out
          ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
          ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}
        `} style={{ animationDelay: '800ms' }}>
          Version 1.0.0
        </div>
      </div>
    </div>
  )
}
