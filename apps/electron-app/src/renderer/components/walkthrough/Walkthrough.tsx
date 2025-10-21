import { useState, useEffect } from 'react'
import { useAppStore } from '../../stores'
import { Button } from '../common'
import { getIllustrationComponent } from './walkthroughSteps'

const API_BASE_URL = 'http://localhost:8001/api'

/**
 * Walkthrough step interface
 */
export interface WalkthroughStep {
  /** Step title */
  title: string
  /** Step description */
  description: string
  /** Illustration type */
  illustration: string
}

/**
 * Walkthrough component props
 */
export interface WalkthroughProps {
  /** Array of walkthrough steps */
  steps: WalkthroughStep[]
  /** Callback when walkthrough is completed */
  onComplete: () => void
  /** Callback when walkthrough is skipped */
  onSkip: () => void
  /** Whether to show "Don't show again" checkbox on final step */
  showDontShowAgain?: boolean
}

/**
 * Walkthrough component - Multi-step onboarding tutorial
 * 
 * Features:
 * - Full-screen overlay with step indicators
 * - Skip button on each page
 * - "Don't show again" checkbox on final page
 * - Touch-friendly navigation (Next, Previous, Skip)
 * - Keyboard navigable (Arrow keys, Enter, Escape)
 * - Accessible with aria-labels
 * - Smooth transitions between steps
 * 
 * @example
 * ```tsx
 * <Walkthrough
 *   steps={walkthroughSteps}
 *   onComplete={handleComplete}
 *   onSkip={handleSkip}
 *   showDontShowAgain
 * />
 * ```
 */
export function Walkthrough({
  steps,
  onComplete,
  onSkip,
  showDontShowAgain = true
}: WalkthroughProps) {
  const { theme } = useAppStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const [isAnimating, setIsAnimating] = useState(false)

  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && !isLastStep) {
        handleNext()
      } else if (e.key === 'ArrowLeft' && !isFirstStep) {
        handlePrevious()
      } else if (e.key === 'Enter' && isLastStep) {
        handleFinish()
      } else if (e.key === 'Escape') {
        handleSkip()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentStep, isFirstStep, isLastStep, dontShowAgain])

  const handleNext = () => {
    if (!isLastStep && !isAnimating) {
      setIsAnimating(true)
      setDirection('forward')
      setTimeout(() => {
        setCurrentStep(prev => prev + 1)
        setIsAnimating(false)
      }, 300)
    }
  }

  const handlePrevious = () => {
    if (!isFirstStep && !isAnimating) {
      setIsAnimating(true)
      setDirection('backward')
      setTimeout(() => {
        setCurrentStep(prev => prev - 1)
        setIsAnimating(false)
      }, 300)
    }
  }

  const handleSkip = () => {
    onSkip()
  }

  const handleFinish = () => {
    if (dontShowAgain) {
      // Save preference to backend
      saveDontShowAgainPreference()
    }
    onComplete()
  }

  const saveDontShowAgainPreference = async () => {
    try {
      await fetch(`${API_BASE_URL}/settings/display/show_walkthrough`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ value: false })
      })
    } catch (error) {
      console.error('Failed to save walkthrough preference:', error)
    }
  }

  const currentStepData = steps[currentStep]

  return (
    <div
      className={`
        fixed inset-0 z-[9999] flex items-center justify-center
        w-screen h-screen overflow-hidden
        ${theme === 'dark'
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
          : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
        }
        transition-colors duration-500
      `}
      role="dialog"
      aria-modal="true"
      aria-labelledby="walkthrough-title"
      style={{
        animation: 'fadeIn 0.5s ease-out'
      }}
    >
      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        /* Respect prefers-reduced-motion */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <div className="w-full h-full max-w-6xl mx-auto px-8 py-12 flex flex-col">
        {/* Skip Button */}
        <div className="flex justify-end mb-6" style={{ animation: 'fadeIn 0.5s ease-out 0.2s both' }}>
          <Button
            variant="ghost"
            size="md"
            onClick={handleSkip}
            aria-label="Skip walkthrough"
            className="hover:scale-105 transition-transform duration-200"
          >
            Skip Tutorial
          </Button>
        </div>

        {/* Main Content Card */}
        <div
          className={`
            flex-1 rounded-3xl shadow-2xl overflow-hidden
            ${theme === 'dark'
              ? 'bg-gray-800/90 border border-gray-700/50'
              : 'bg-white/90 border border-gray-200/50'
            }
            backdrop-blur-xl
          `}
          style={{ animation: 'scaleIn 0.5s ease-out 0.3s both' }}
        >
          {/* Step Indicators */}
          <div className={`
            flex items-center justify-center gap-3 py-8 border-b
            ${theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200/50'}
          `}>
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!isAnimating) {
                    setDirection(index > currentStep ? 'forward' : 'backward')
                    setCurrentStep(index)
                  }
                }}
                className={`
                  h-3 rounded-full transition-all duration-500 cursor-pointer
                  hover:scale-110
                  ${index === currentStep
                    ? 'w-12 bg-primary-500 shadow-lg shadow-primary-500/50'
                    : index < currentStep
                      ? 'w-3 bg-primary-300 hover:bg-primary-400'
                      : 'w-3 bg-gray-300 hover:bg-gray-400'
                  }
                `}
                aria-label={`Go to step ${index + 1} of ${steps.length}`}
                aria-current={index === currentStep ? 'step' : undefined}
              />
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col items-center justify-center p-12 overflow-y-auto">
            {/* Illustration */}
            <div
              className="w-full max-w-md h-64 mb-8"
              style={{
                animation: direction === 'forward'
                  ? 'slideInRight 0.5s ease-out'
                  : 'slideInLeft 0.5s ease-out'
              }}
            >
              {getIllustrationComponent(currentStepData.illustration, theme)}
            </div>

            {/* Title */}
            <h2
              id="walkthrough-title"
              className={`
                text-4xl font-bold text-center mb-6
                ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
              `}
              style={{ animation: 'fadeIn 0.5s ease-out 0.2s both' }}
            >
              {currentStepData.title}
            </h2>

            {/* Description */}
            <p
              className={`
                text-xl text-center mb-12 leading-relaxed max-w-2xl
                ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}
              `}
              style={{ animation: 'fadeIn 0.5s ease-out 0.3s both' }}
            >
              {currentStepData.description}
            </p>

            {/* Don't Show Again Checkbox (Last Step Only) */}
            {isLastStep && showDontShowAgain && (
              <div
                className="flex items-center justify-center"
                style={{ animation: 'fadeIn 0.5s ease-out 0.4s both' }}
              >
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={dontShowAgain}
                    onChange={(e) => setDontShowAgain(e.target.checked)}
                    className={`
                      w-6 h-6 rounded cursor-pointer transition-all duration-200
                      ${theme === 'dark'
                        ? 'bg-gray-700 border-gray-600'
                        : 'bg-white border-gray-300'
                      }
                      text-primary-600 focus:ring-2 focus:ring-primary-500
                      group-hover:scale-110
                    `}
                  />
                  <span className={`
                    text-base font-medium
                    ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
                    group-hover:text-primary-500 transition-colors duration-200
                  `}>
                    Don't show this tutorial again
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className={`
            flex items-center justify-between px-12 py-8 border-t
            ${theme === 'dark' ? 'border-gray-700/50 bg-gray-800/30' : 'border-gray-200/50 bg-gray-50/50'}
            backdrop-blur-sm
          `}>
            {/* Previous Button */}
            <Button
              variant="ghost"
              size="lg"
              onClick={handlePrevious}
              disabled={isFirstStep || isAnimating}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              }
              aria-label="Previous step"
              className="hover:scale-105 transition-transform duration-200"
            >
              Previous
            </Button>

            {/* Step Counter */}
            <div className="flex flex-col items-center gap-1">
              <span className={`
                text-lg font-bold
                ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
              `}>
                {currentStep + 1} / {steps.length}
              </span>
              <span className={`
                text-xs
                ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}
              `}>
                {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
              </span>
            </div>

            {/* Next/Finish Button */}
            {isLastStep ? (
              <Button
                variant="primary"
                size="lg"
                onClick={handleFinish}
                disabled={isAnimating}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                }
                aria-label="Finish walkthrough"
                className="hover:scale-105 transition-transform duration-200"
                style={{ animation: 'bounce 2s ease-in-out infinite' }}
              >
                Get Started
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={handleNext}
                disabled={isAnimating}
                aria-label="Next step"
                className="hover:scale-105 transition-transform duration-200"
              >
                <span className="flex items-center gap-2">
                  Next
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

