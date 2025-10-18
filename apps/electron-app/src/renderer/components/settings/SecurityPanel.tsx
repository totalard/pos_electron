import { useCallback, useState } from 'react'
import { useAppStore, useSettingsStore, usePinStore } from '../../stores'
import { authAPI } from '../../services/api'

/**
 * Enhanced Security Panel with WCAG AA Contrast Compliance
 *
 * Features:
 * - Improved visual design with better hierarchy
 * - WCAG AA compliant text contrast (4.5:1 for normal text, 3:1 for large text)
 * - Enhanced security posture overview with accessible badges
 * - Touch-safe UI elements (minimum 44x44px)
 * - Theme-aware styling with proper contrast in both light and dark modes
 * - Clear visual feedback for all interactive elements
 */

const EMPTY_PIN = ''
const MIN_PIN_LENGTH = 6

const POLICY_REQUIREMENTS = {
  requirePinForRefunds: {
    label: 'Refund Authorization',
    description: 'Prevent unauthorized refunds by enforcing manager approval.'
  },
  requirePinForVoids: {
    label: 'Void Protection',
    description: 'Ensure voided transactions are verified by a supervisor.'
  },
  requirePinForDiscounts: {
    label: 'Discount Oversight',
    description: 'Keep promotional pricing under control with manager authorization.'
  },
  sessionTimeout: {
    label: 'Session Timeout',
    description: 'Reduce unattended terminal risk by applying idle session limits.'
  }
} as const

const policyDescriptions = (Object.entries(POLICY_REQUIREMENTS) as Array<[
  keyof typeof POLICY_REQUIREMENTS,
  { label: string; description: string }
]>).map(([id, value]) => ({
  id,
  title: value.label,
  description: value.description
}))

const scoreThresholds = [
  { limit: 80, label: 'Excellent', color: { light: 'text-emerald-700', dark: 'text-emerald-300' } },
  { limit: 60, label: 'Stable', color: { light: 'text-blue-700', dark: 'text-blue-300' } },
  { limit: 40, label: 'At Risk', color: { light: 'text-amber-700', dark: 'text-amber-300' } },
  { limit: 0, label: 'Critical', color: { light: 'text-red-700', dark: 'text-red-300' } }
] as const

export function SecurityPanel() {
  const { theme } = useAppStore()
  const { security, updateSecuritySettings } = useSettingsStore()
  const { currentUser } = usePinStore()

  const [oldPin, setOldPin] = useState(EMPTY_PIN)
  const [newPin, setNewPin] = useState(EMPTY_PIN)
  const [confirmPin, setConfirmPin] = useState(EMPTY_PIN)
  const [pinError, setPinError] = useState(EMPTY_PIN)
  const [pinSuccess, setPinSuccess] = useState(EMPTY_PIN)
  const [isChangingPin, setIsChangingPin] = useState(false)

    const policyStatuses = Object.entries({
    requirePinForRefunds: security.requirePinForRefunds,
    requirePinForVoids: security.requirePinForVoids,
    requirePinForDiscounts: security.requirePinForDiscounts,
    sessionTimeout: security.sessionTimeout > 0
  }) as Array<[
    keyof typeof POLICY_REQUIREMENTS,
    boolean
  ]>

  const policyStatusMap = Object.fromEntries(policyStatuses) as Record<
    keyof typeof POLICY_REQUIREMENTS,
    boolean
  >
  const enabledCount = policyStatuses.filter(([, status]) => status).length
  const totalPolicies = policyStatuses.length
  const policyScore = totalPolicies > 0 ? Math.round((enabledCount / totalPolicies) * 100) : 0
  const scoreDefinition = scoreThresholds.find(({ limit }) => policyScore >= limit) ?? scoreThresholds.at(-1)!
  const pendingPolicies = policyStatuses
    .filter(([, status]) => !status)
    .map(([policyKey]) => POLICY_REQUIREMENTS[policyKey])
  const pendingCount = pendingPolicies.length
  const scoreColorClass = theme === 'dark' ? scoreDefinition.color.dark : scoreDefinition.color.light
  // Enhanced badge classes with better contrast
  const activeBadgeClass = theme === 'dark'
    ? 'bg-blue-900/40 text-blue-200 border border-blue-700'
    : 'bg-blue-100 text-blue-800 border border-blue-300'
  const pendingBadgeClass = pendingCount === 0
    ? theme === 'dark'
      ? 'bg-emerald-900/40 text-emerald-200 border border-emerald-700'
      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
    : theme === 'dark'
      ? 'bg-amber-900/40 text-amber-200 border border-amber-700'
      : 'bg-amber-100 text-amber-800 border border-amber-300'

  const handleSecurityChange = useCallback(async (field: keyof typeof security, value: boolean | number) => {
    await updateSecuritySettings({ [field]: value })
  }, [updateSecuritySettings])

  const handlePinChange = useCallback(async () => {
    setPinError(EMPTY_PIN)
    setPinSuccess(EMPTY_PIN)

    if (!oldPin || !newPin || !confirmPin) {
      setPinError('All fields are required')
      return
    }

    if (newPin.length !== MIN_PIN_LENGTH || !/^\d{6}$/.test(newPin)) {
      setPinError(`New PIN must be exactly ${MIN_PIN_LENGTH} digits`)
      return
    }

    if (newPin !== confirmPin) {
      setPinError('New PIN and confirmation do not match')
      return
    }

    if (oldPin === newPin) {
      setPinError('New PIN must be different from old PIN')
      return
    }

    setIsChangingPin(true)

    try {
      if (currentUser) {
        await authAPI.changePin(currentUser.id, oldPin, newPin)
        setPinSuccess('PIN changed successfully')
        setOldPin(EMPTY_PIN)
        setNewPin(EMPTY_PIN)
        setConfirmPin(EMPTY_PIN)
      }
    } catch (error) {
      setPinError(error instanceof Error ? error.message : 'Failed to change PIN')
    } finally {
      setIsChangingPin(false)
    }
  }, [confirmPin, currentUser, newPin, oldPin])

  return (
    <div className="p-6 space-y-6">
      {/* Panel Header - Enhanced contrast */}
      <div className="mb-6">
        <h2 className={`
          text-2xl font-bold mb-2
          ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
        `}>
          Security Controls
        </h2>
        <p className={`
          text-sm
          ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
        `}>
          Strengthen compliance, authentication, and account protection policies
        </p>
      </div>

      {/* Security Posture Overview - Enhanced design and contrast */}
      <div className={`
        p-5 rounded-lg border shadow-sm
        ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}
      `}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
          <div>
            <h3 className={`
              text-lg font-bold mb-1
              ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
            }`}>
              Security Posture Overview
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Summary of active policies and recommended hardening actions
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className={`px-4 py-2 rounded-lg text-sm font-medium shadow-sm ${activeBadgeClass}`}>
              <span className="font-bold">{enabledCount}</span> Active Policy{enabledCount === 1 ? '' : 'ies'}
            </div>
            <div className={`px-4 py-2 rounded-lg text-sm font-medium shadow-sm ${pendingBadgeClass}`}>
              <span className="font-bold">{pendingCount}</span> Pending Safeguard{pendingCount === 1 ? '' : 's'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className={`p-4 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-800/60 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <p className={`font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Overall Posture
            </p>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${scoreColorClass}`}>{policyScore}</span>
              <span className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>%</span>
            </div>
            <p className={`mt-2 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {scoreDefinition.label}
            </p>
          </div>

          {policyDescriptions.map(({ id, title, description }) => (
            <div
              key={id}
              className={`p-4 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-800/60 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {title}
                </p>
                <span className={`text-xs px-2 py-1 rounded-full font-medium border ${
                  policyStatusMap[id]
                    ? theme === 'dark'
                      ? 'bg-emerald-900/40 text-emerald-200 border-emerald-700'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : theme === 'dark'
                      ? 'bg-amber-900/40 text-amber-200 border-amber-700'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}>
                  {policyStatusMap[id] ? 'Active' : 'Pending'}
                </span>
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* PIN Change Section - Enhanced design */}
      <div className={`
        p-5 rounded-lg border shadow-sm
        ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}
      `}>
        <div className="flex items-center gap-3 mb-5">
          <div className={`p-3 rounded-lg ${
            theme === 'dark' ? 'bg-blue-900/40' : 'bg-blue-100'
          }`}>
            <span className="text-2xl" aria-hidden="true">🔑</span>
          </div>
          <div>
            <h3 className={`
              text-lg font-bold
              ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
            `}>
              Change PIN
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Update your personal identification number
            </p>
          </div>
        </div>

        <div className="space-y-4 max-w-md">
          {/* Old PIN */}
          <div>
            <label className={`
              block text-sm font-medium mb-2
              ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
            `}>
              Current PIN
            </label>
            <input
              type="password"
              value={oldPin}
              onChange={(e) => setOldPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className={`
                w-full px-4 py-3 rounded-lg text-lg tracking-widest
                transition-colors duration-200
                ${theme === 'dark'
                  ? 'bg-gray-800 border border-gray-600 text-white focus:border-blue-500'
                  : 'bg-white border border-gray-300 text-gray-900 focus:border-blue-500'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500/20
              `}
              placeholder="••••••"
              aria-label="Current PIN"
            />
          </div>

          {/* New PIN */}
          <div>
            <label className={`
              block text-sm font-medium mb-2
              ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
            `}>
              New PIN
            </label>
            <input
              type="password"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className={`
                w-full px-4 py-3 rounded-lg text-lg tracking-widest
                transition-colors duration-200
                ${theme === 'dark'
                  ? 'bg-gray-800 border border-gray-600 text-white focus:border-blue-500'
                  : 'bg-white border border-gray-300 text-gray-900 focus:border-blue-500'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500/20
              `}
              placeholder="••••••"
              aria-label="New PIN"
            />
          </div>

          {/* Confirm PIN */}
          <div>
            <label className={`
              block text-sm font-medium mb-2
              ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
            `}>
              Confirm New PIN
            </label>
            <input
              type="password"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className={`
                w-full px-4 py-3 rounded-lg text-lg tracking-widest
                transition-colors duration-200
                ${theme === 'dark'
                  ? 'bg-gray-800 border border-gray-600 text-white focus:border-blue-500'
                  : 'bg-white border border-gray-300 text-gray-900 focus:border-blue-500'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500/20
              `}
              placeholder="••••••"
              aria-label="Confirm New PIN"
            />
          </div>

          {/* Error/Success Messages - Enhanced contrast */}
          {pinError && (
            <div className={`p-4 rounded-lg border shadow-sm ${
              theme === 'dark'
                ? 'bg-red-900/30 border-red-700'
                : 'bg-red-50 border-red-300'
            }`}>
              <p className={`text-sm font-medium flex items-center gap-2 ${
                theme === 'dark' ? 'text-red-200' : 'text-red-800'
              }`}>
                <span aria-hidden="true">⚠️</span>
                {pinError}
              </p>
            </div>
          )}
          {pinSuccess && (
            <div className={`p-4 rounded-lg border shadow-sm ${
              theme === 'dark'
                ? 'bg-green-900/30 border-green-700'
                : 'bg-green-50 border-green-300'
            }`}>
              <p className={`text-sm font-medium flex items-center gap-2 ${
                theme === 'dark' ? 'text-green-200' : 'text-green-800'
              }`}>
                <span aria-hidden="true">✓</span>
                {pinSuccess}
              </p>
            </div>
          )}

          {/* Change PIN Button - Touch-safe 44x44px minimum with enhanced styling */}
          <button
            onClick={handlePinChange}
            disabled={isChangingPin}
            className={`
              w-full px-6 py-3 rounded-lg font-semibold text-base
              transition-all duration-200 shadow-sm
              min-h-[44px]
              ${isChangingPin
                ? theme === 'dark'
                  ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                  : 'bg-gray-300 cursor-not-allowed text-gray-500'
                : theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white'
              }
              focus:outline-none focus:ring-2 focus:ring-blue-500/50
            `}
            aria-label="Change PIN"
          >
            {isChangingPin ? 'Changing PIN...' : 'Change PIN'}
          </button>
        </div>
      </div>

      {/* Session & Access Control Section - Enhanced design */}
      <div className={`
        p-5 rounded-lg border shadow-sm
        ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}
      `}>
        <div className="flex items-center gap-3 mb-5">
          <div className={`p-3 rounded-lg ${
            theme === 'dark' ? 'bg-purple-900/40' : 'bg-purple-100'
          }`}>
            <span className="text-2xl" aria-hidden="true">⚙️</span>
          </div>
          <div>
            <h3 className={`
              text-lg font-bold
              ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
            `}>
              Session & Access Control
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Configure timeout and authorization policies
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Session Timeout - Enhanced */}
          <div>
            <label className={`
              block text-sm font-semibold mb-2
              ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}
            `}>
              Session Timeout (minutes, 0 = disabled)
            </label>
            <input
              type="number"
              value={security.sessionTimeout}
              onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value) || 0)}
              min={0}
              max={1440}
              className={`
                w-full px-4 py-3 rounded-lg text-base font-medium
                transition-colors duration-200 shadow-sm
                min-h-[44px]
                ${theme === 'dark'
                  ? 'bg-gray-700 border border-gray-600 text-white focus:border-blue-400'
                  : 'bg-white border border-gray-300 text-gray-900 focus:border-blue-600'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500/30
              `}
              aria-label="Session timeout in minutes"
            />
            <p className={`
              text-sm mt-2
              ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
            `}>
              Automatically log out after period of inactivity
            </p>
          </div>

          {/* Require PIN for Refunds - Enhanced */}
          <div className={`flex items-center justify-between min-h-[44px] p-4 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-800/40 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <div>
              <label className={`
                text-sm font-semibold
                ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}
              `}>
                Require PIN for Refunds
              </label>
              <p className={`
                text-sm mt-1
                ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
              `}>
                Require PIN verification to process refunds
              </p>
            </div>
            <button
              onClick={() => handleSecurityChange('requirePinForRefunds', !security.requirePinForRefunds)}
              className={`
                relative inline-flex h-8 w-14 items-center rounded-full flex-shrink-0
                transition-colors duration-200 shadow-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500/50
                ${security.requirePinForRefunds
                  ? 'bg-blue-600'
                  : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                }
              `}
              aria-label="Toggle require PIN for refunds"
              aria-checked={security.requirePinForRefunds}
              role="switch"
            >
              <span
                className={`
                  inline-block h-6 w-6 transform rounded-full bg-white shadow-md
                  transition-transform duration-200
                  ${security.requirePinForRefunds ? 'translate-x-7' : 'translate-x-1'}
                `}
              />
            </button>
          </div>

          {/* Require PIN for Voids - Enhanced */}
          <div className={`flex items-center justify-between min-h-[44px] p-4 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-800/40 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <div>
              <label className={`
                text-sm font-semibold
                ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}
              `}>
                Require PIN for Voids
              </label>
              <p className={`
                text-sm mt-1
                ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
              `}>
                Require PIN verification to void transactions
              </p>
            </div>
            <button
              onClick={() => handleSecurityChange('requirePinForVoids', !security.requirePinForVoids)}
              className={`
                relative inline-flex h-8 w-14 items-center rounded-full flex-shrink-0
                transition-colors duration-200 shadow-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500/50
                ${security.requirePinForVoids
                  ? 'bg-blue-600'
                  : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                }
              `}
              aria-label="Toggle require PIN for voids"
              aria-checked={security.requirePinForVoids}
              role="switch"
            >
              <span
                className={`
                  inline-block h-6 w-6 transform rounded-full bg-white shadow-md
                  transition-transform duration-200
                  ${security.requirePinForVoids ? 'translate-x-7' : 'translate-x-1'}
                `}
              />
            </button>
          </div>

          {/* Require PIN for Discounts - Enhanced */}
          <div className={`flex items-center justify-between min-h-[44px] p-4 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-800/40 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <div>
              <label className={`
                text-sm font-semibold
                ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}
              `}>
                Require PIN for Discounts
              </label>
              <p className={`
                text-sm mt-1
                ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
              `}>
                Require PIN verification to apply discounts
              </p>
            </div>
            <button
              onClick={() => handleSecurityChange('requirePinForDiscounts', !security.requirePinForDiscounts)}
              className={`
                relative inline-flex h-8 w-14 items-center rounded-full flex-shrink-0
                transition-colors duration-200 shadow-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500/50
                ${security.requirePinForDiscounts
                  ? 'bg-blue-600'
                  : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                }
              `}
              aria-label="Toggle require PIN for discounts"
              aria-checked={security.requirePinForDiscounts}
              role="switch"
            >
              <span
                className={`
                  inline-block h-6 w-6 transform rounded-full bg-white shadow-md
                  transition-transform duration-200
                  ${security.requirePinForDiscounts ? 'translate-x-7' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

