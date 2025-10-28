import { useState, useEffect } from 'react'
import { useAppStore } from '../../stores'
import { Button } from '../common'
import { ThemeToggle } from '../common/ThemeToggle'
import { getIllustrationComponent } from './walkthroughSteps'

const API_BASE_URL = 'http://localhost:8000/api'

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
        w-screen h-screen overflow-hidden relative
        ${theme === 'dark'
          ? 'bg-gray-900'
          : 'bg-gray-50'
        }
        transition-colors duration-300
      `}
      role="dialog"
      aria-modal="true"
      aria-labelledby="walkthrough-title"
      style={{
        animation: 'smooth-fade-in 300ms cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* CSS Animations - Minimal & Fluid */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
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

      <div className="w-full h-full max-w-6xl mx-auto px-8 py-12 flex flex-col relative z-10">
        {/* Top Bar - Skip Button and Theme Toggle */}
        <div className="flex justify-between items-center mb-8 animate-smooth-fade-in">
          <div className="w-10" /> {/* Spacer for centering */}
          <Button
            variant="ghost"
            size="md"
            onClick={handleSkip}
            aria-label="Skip walkthrough"
            className="hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Skip Tutorial
          </Button>
          <ThemeToggle size="md" className="rounded-lg p-2 hover:scale-105 active:scale-95 transition-all duration-200" />
        </div>

        {/* Main Content Card - Minimal */}
        <div
          className={`
            flex-1 rounded-2xl overflow-hidden
            ${theme === 'dark'
              ? 'bg-gray-800 border border-gray-700'
              : 'bg-white border border-gray-200'
            }
          `}
          style={{ animation: 'scaleIn 250ms cubic-bezier(0.4, 0, 0.2, 1) both' }}
        >
          {/* Step Indicators - Minimal */}
          <div className={`
            flex items-center justify-center gap-2 py-6 border-b
            ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
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
                  h-2 rounded-full transition-all duration-300 cursor-pointer
                  hover:scale-110
                  ${index === currentStep
                    ? 'w-8 bg-blue-500'
                    : index < currentStep
                      ? 'w-2 bg-blue-400 hover:bg-blue-500'
                      : 'w-2 bg-gray-300 hover:bg-gray-400'
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
                  ? 'slideInRight 300ms cubic-bezier(0.4, 0, 0.2, 1)'
                  : 'slideInLeft 300ms cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {getIllustrationComponent(currentStepData.illustration, theme)}
            </div>

            {/* Title - Minimal */}
            <h2
              id="walkthrough-title"
              className={`
                text-4xl font-bold text-center mb-4
                ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
              `}
              style={{ animation: 'fadeIn 300ms cubic-bezier(0.4, 0, 0.2, 1) 100ms both' }}
            >
              {currentStepData.title}
            </h2>

            {/* Description - Minimal */}
            <p
              className={`
                text-lg text-center mb-12 leading-relaxed max-w-2xl
                ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
              `}
              style={{ animation: 'fadeIn 300ms cubic-bezier(0.4, 0, 0.2, 1) 150ms both' }}
            >
              {currentStepData.description}
            </p>

            {/* Don't Show Again Checkbox (Last Step Only) */}
            {isLastStep && showDontShowAgain && (
              <div
                className="flex items-center justify-center"
                style={{ animation: 'fadeIn 300ms cubic-bezier(0.4, 0, 0.2, 1) 200ms both' }}
              >
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={dontShowAgain}
                    onChange={(e) => setDontShowAgain(e.target.checked)}
                    className={`
                      w-5 h-5 rounded cursor-pointer transition-all duration-200
                      ${theme === 'dark'
                        ? 'bg-gray-700 border-gray-600'
                        : 'bg-white border-gray-300'
                      }
                      text-blue-600 focus:ring-2 focus:ring-blue-500/40
                      group-hover:scale-105
                    `}
                  />
                  <span className={`
                    text-sm font-medium
                    ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                    group-hover:text-blue-500 transition-colors duration-200
                  `}>
                    Don't show this tutorial again
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Navigation - Minimal */}
          <div className={`
            flex items-center justify-between px-12 py-6 border-t
            ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
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
              className="hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Previous
            </Button>

            {/* Step Counter - Minimal */}
            <div className="flex flex-col items-center gap-1">
              <span className={`
                text-base font-semibold
                ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
              `}>
                {currentStep + 1} / {steps.length}
              </span>
              <span className={`
                text-xs font-medium
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
                className="hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
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
                className="hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
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

