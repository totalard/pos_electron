import { useState, useEffect } from 'react'
import { useAppStore } from '../../stores'
import { Button } from '../common'

const API_BASE_URL = 'http://localhost:8001/api'

/**
 * Walkthrough step interface
 */
export interface WalkthroughStep {
  /** Step title */
  title: string
  /** Step description */
  description: string
  /** Icon for the step */
  icon: React.ReactNode
  /** Optional image/illustration */
  image?: string
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
    if (!isLastStep) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1)
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
        fixed inset-0 z-50 flex items-center justify-center
        ${theme === 'dark'
          ? 'bg-gray-900/95'
          : 'bg-white/95'
        }
        backdrop-blur-sm
      `}
      role="dialog"
      aria-modal="true"
      aria-labelledby="walkthrough-title"
    >
      <div className="w-full max-w-3xl mx-4">
        {/* Skip Button */}
        <div className="flex justify-end mb-4">
          <Button
            variant="ghost"
            size="md"
            onClick={handleSkip}
            aria-label="Skip walkthrough"
          >
            Skip Tutorial
          </Button>
        </div>

        {/* Main Content Card */}
        <div className={`
          rounded-2xl shadow-2xl overflow-hidden
          ${theme === 'dark'
            ? 'bg-gray-800 border border-gray-700'
            : 'bg-white border border-gray-200'
          }
        `}>
          {/* Step Indicators */}
          <div className={`
            flex items-center justify-center gap-2 py-6 border-b
            ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
          `}>
            {steps.map((_, index) => (
              <div
                key={index}
                className={`
                  h-2 rounded-full transition-all duration-300
                  ${index === currentStep
                    ? 'w-8 bg-primary-500'
                    : index < currentStep
                      ? 'w-2 bg-primary-300'
                      : 'w-2 bg-gray-300'
                  }
                `}
                aria-label={`Step ${index + 1} of ${steps.length}`}
                aria-current={index === currentStep ? 'step' : undefined}
              />
            ))}
          </div>

          {/* Content */}
          <div className="p-12">
            {/* Icon */}
            <div className={`
              w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center
              ${theme === 'dark'
                ? 'bg-primary-900/30 text-primary-400'
                : 'bg-primary-100 text-primary-600'
              }
            `}>
              {currentStepData.icon}
            </div>

            {/* Title */}
            <h2
              id="walkthrough-title"
              className={`
                text-3xl font-bold text-center mb-4
                ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
              `}
            >
              {currentStepData.title}
            </h2>

            {/* Description */}
            <p className={`
              text-lg text-center mb-8 leading-relaxed
              ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}
            `}>
              {currentStepData.description}
            </p>

            {/* Optional Image */}
            {currentStepData.image && (
              <div className="mb-8">
                <img
                  src={currentStepData.image}
                  alt={currentStepData.title}
                  className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                />
              </div>
            )}

            {/* Don't Show Again Checkbox (Last Step Only) */}
            {isLastStep && showDontShowAgain && (
              <div className="flex items-center justify-center mb-8">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dontShowAgain}
                    onChange={(e) => setDontShowAgain(e.target.checked)}
                    className={`
                      w-5 h-5 rounded cursor-pointer
                      ${theme === 'dark'
                        ? 'bg-gray-700 border-gray-600'
                        : 'bg-white border-gray-300'
                      }
                      text-primary-600 focus:ring-2 focus:ring-primary-500
                    `}
                  />
                  <span className={`
                    text-sm
                    ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
                  `}>
                    Don't show this tutorial again
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className={`
            flex items-center justify-between px-12 py-6 border-t
            ${theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}
          `}>
            {/* Previous Button */}
            <Button
              variant="ghost"
              size="lg"
              onClick={handlePrevious}
              disabled={isFirstStep}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              }
              aria-label="Previous step"
            >
              Previous
            </Button>

            {/* Step Counter */}
            <span className={`
              text-sm font-medium
              ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
            `}>
              {currentStep + 1} of {steps.length}
            </span>

            {/* Next/Finish Button */}
            {isLastStep ? (
              <Button
                variant="primary"
                size="lg"
                onClick={handleFinish}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                }
                aria-label="Finish walkthrough"
              >
                Get Started
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={handleNext}
                aria-label="Next step"
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

