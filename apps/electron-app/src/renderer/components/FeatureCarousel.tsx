import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '../stores'

interface Feature {
  title: string
  description: string
  icon: JSX.Element
}

/**
 * FeatureCarousel component - Displays rotating features on the login screen
 * Shows app features with smooth transitions and keyboard navigation support
 */

const features: Feature[] = [
  {
    title: 'Fast & Efficient Sales',
    description: 'Process transactions quickly with our intuitive point-of-sale interface',
    icon: (
      <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Shopping Cart Icon */}
        <circle cx="100" cy="100" r="80" fill="url(#gradient1)" opacity="0.1"/>
        <path d="M60 60 L140 60 L130 120 L70 120 Z" fill="url(#gradient1)" opacity="0.8"/>
        <circle cx="80" cy="140" r="8" fill="url(#gradient1)"/>
        <circle cx="120" cy="140" r="8" fill="url(#gradient1)"/>
        <path d="M50 50 L60 60" stroke="url(#gradient1)" strokeWidth="4" strokeLinecap="round"/>
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6"/>
            <stop offset="100%" stopColor="#8b5cf6"/>
          </linearGradient>
        </defs>
      </svg>
    )
  },
  {
    title: 'Inventory Management',
    description: 'Track stock levels, manage products, and get low-stock alerts in real-time',
    icon: (
      <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Boxes/Inventory Icon */}
        <rect x="40" y="80" width="50" height="50" fill="url(#gradient2)" opacity="0.8" rx="4"/>
        <rect x="110" y="80" width="50" height="50" fill="url(#gradient2)" opacity="0.6" rx="4"/>
        <rect x="75" y="40" width="50" height="50" fill="url(#gradient2)" rx="4"/>
        <path d="M100 40 L100 20 M90 30 L100 20 L110 30" stroke="url(#gradient2)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <defs>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981"/>
            <stop offset="100%" stopColor="#3b82f6"/>
          </linearGradient>
        </defs>
      </svg>
    )
  },
  {
    title: 'Detailed Reports',
    description: 'Generate comprehensive sales reports and analytics to grow your business',
    icon: (
      <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Chart/Analytics Icon */}
        <rect x="40" y="120" width="30" height="50" fill="url(#gradient3)" opacity="0.8" rx="4"/>
        <rect x="85" y="90" width="30" height="80" fill="url(#gradient3)" opacity="0.9" rx="4"/>
        <rect x="130" y="60" width="30" height="110" fill="url(#gradient3)" rx="4"/>
        <path d="M50 100 L100 70 L145 85" stroke="url(#gradient3)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
        <circle cx="50" cy="100" r="5" fill="url(#gradient3)"/>
        <circle cx="100" cy="70" r="5" fill="url(#gradient3)"/>
        <circle cx="145" cy="85" r="5" fill="url(#gradient3)"/>
        <defs>
          <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b"/>
            <stop offset="100%" stopColor="#ef4444"/>
          </linearGradient>
        </defs>
      </svg>
    )
  },
  {
    title: 'Multi-User Support',
    description: 'Secure PIN-based authentication for multiple staff members with role management',
    icon: (
      <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Users Icon */}
        <circle cx="80" cy="70" r="20" fill="url(#gradient4)" opacity="0.8"/>
        <path d="M50 130 Q80 110 110 130" fill="url(#gradient4)" opacity="0.8"/>
        <circle cx="130" cy="80" r="18" fill="url(#gradient4)" opacity="0.6"/>
        <path d="M105 140 Q130 125 155 140" fill="url(#gradient4)" opacity="0.6"/>
        <defs>
          <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6"/>
            <stop offset="100%" stopColor="#ec4899"/>
          </linearGradient>
        </defs>
      </svg>
    )
  }
]

export function FeatureCarousel() {
  const { theme } = useAppStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const currentYear = new Date().getFullYear()

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % features.length)
  }, [])

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + features.length) % features.length)
  }, [])

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      goToNext()
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [goToNext])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious()
      } else if (e.key === 'ArrowRight') {
        goToNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToNext, goToPrevious])

  const currentFeature = features[currentIndex]

  return (
    <div className={`
      w-full h-full flex flex-col items-center justify-center p-12 relative overflow-hidden
      ${theme === 'dark'
        ? 'bg-gray-900'
        : 'bg-blue-600'
      }
    `}>
      {/* Subtle background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-white" />
      </div>
      {/* Logo/Brand */}
      <div className="mb-12 relative z-10">
        <h1 className="text-5xl font-bold mb-3 tracking-tight text-white">
          MidLogic POS
        </h1>
        <div className="w-12 h-1 mx-auto mb-4 rounded-full bg-white/40" />
        <p className="text-center text-lg font-medium text-white/90">
          Modern Point of Sale System
        </p>
      </div>

      {/* Feature Display */}
      <div
        className="flex-1 flex flex-col items-center justify-center max-w-md relative z-10"
        role="region"
        aria-live="polite"
        aria-atomic="true"
        id={`feature-${currentIndex}`}
      >
        {/* Icon */}
        <div className="w-64 h-64 mb-8 transition-all duration-300 ease-out transform hover:scale-[1.02]" aria-hidden="true">
          {currentFeature.icon}
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold mb-4 text-center text-white">
          {currentFeature.title}
        </h2>

        {/* Description */}
        <p className="text-center text-lg leading-relaxed font-medium text-white/90">
          {currentFeature.description}
        </p>
      </div>

      {/* Carousel Indicators - Touch-safe with minimum 44x44px */}
      <div className="flex gap-2 mt-12 relative z-10" role="tablist" aria-label="Feature carousel navigation">
        {features.map((feature, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`
              min-w-[44px] min-h-[44px] p-3 rounded-lg transition-all duration-200
              flex items-center justify-center
              hover:scale-[1.05] active:scale-[0.95]
              ${index === currentIndex
                ? 'bg-white/30'
                : 'bg-white/10 hover:bg-white/20'
              }
            `}
            role="tab"
            aria-selected={index === currentIndex}
            aria-label={`Go to ${feature.title}`}
            aria-controls={`feature-${index}`}
          >
            <div className={`
              h-2 rounded-full transition-all duration-200
              ${index === currentIndex
                ? 'w-8 bg-white'
                : 'w-2 bg-white/70'
              }
            `} />
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-8 text-sm font-medium relative z-10 text-white/80">
        © {currentYear} MidLogic. All rights reserved.
      </div>
    </div>
  )
}

