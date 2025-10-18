import { useState } from 'react'
import { useAppStore, useSettingsStore } from '../../stores'
import { Toast, Button, Card, Badge } from '../common'
import { FormSection } from '../forms'

/**
 * Redesigned About Panel
 *
 * Features:
 * - Modern card-based layout with visual hierarchy
 * - Enhanced app branding with gradient background
 * - Organized information sections
 * - Touch-safe UI elements (minimum 44x44px)
 * - Better visual presentation of version info and tech stack
 * - Theme-aware design with consistent styling
 */
export function AboutPanel() {
  const { theme } = useAppStore()
  const { about, checkForUpdates } = useSettingsStore()
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'info' }>({
    show: false,
    message: '',
    type: 'success'
  })
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false)

  const handleCheckUpdates = async () => {
    setIsCheckingUpdates(true)
    try {
      await checkForUpdates()
      setToast({ show: true, message: '✓ You are using the latest version!', type: 'success' })
    } catch (error) {
      setToast({ show: true, message: '✗ Failed to check for updates', type: 'info' })
    } finally {
      setIsCheckingUpdates(false)
    }
  }

  const currentYear = new Date().getFullYear()

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          About
        </h2>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Application information, version details, and system credits
        </p>
      </div>

      {/* App Branding Card - Enhanced with gradient */}
      <Card variant="elevated" className="overflow-hidden">
        <div className={`
          relative p-8 text-center
          ${theme === 'dark'
            ? 'bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-blue-600/20'
            : 'bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50'
          }
        `}>
          {/* App Icon */}
          <div className={`
            inline-flex p-6 rounded-2xl mb-4
            ${theme === 'dark' ? 'bg-blue-500/30' : 'bg-blue-500/20'}
          `}>
            <svg className="w-20 h-20 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>

          {/* App Name */}
          <h3 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            MidLogic POS
          </h3>
          <p className={`text-lg mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Point of Sale System
          </p>

          {/* Version Badge */}
          <Badge variant="primary" size="lg">
            Version {about.appVersion}
          </Badge>
        </div>
      </Card>

      {/* Version Information & Updates - Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Version Information Card */}
        <FormSection
          title="Version Information"
          description="Current application version details"
        >
          <div className="space-y-3">
            <div className={`flex items-center justify-between p-3 rounded-lg ${
              theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">📦</span>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Version
                </span>
              </div>
              <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {about.appVersion}
              </span>
            </div>

            <div className={`flex items-center justify-between p-3 rounded-lg ${
              theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">🔢</span>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Build Number
                </span>
              </div>
              <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {about.buildNumber}
              </span>
            </div>

            {about.lastUpdateCheck && (
              <div className={`flex items-center justify-between p-3 rounded-lg ${
                theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔄</span>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Last Check
                  </span>
                </div>
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {new Date(about.lastUpdateCheck).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </FormSection>

        {/* Updates Card */}
        <FormSection
          title="Software Updates"
          description="Check for the latest version"
        >
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border-l-4 ${
              theme === 'dark'
                ? 'bg-blue-900/20 border-l-blue-500'
                : 'bg-blue-50 border-l-blue-500'
            }`}>
              <div className="flex items-start gap-2">
                <span className="text-lg">ℹ️</span>
                <div>
                  <p className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                  }`}>
                    Stay Up to Date
                  </p>
                  <p className={`text-xs mt-1 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Regular updates include new features, improvements, and security patches
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              fullWidth
              onClick={handleCheckUpdates}
              isLoading={isCheckingUpdates}
              disabled={isCheckingUpdates}
            >
              {isCheckingUpdates ? 'Checking...' : 'Check for Updates'}
            </Button>
          </div>
        </FormSection>
      </div>

      {/* Technology Stack - Enhanced with icons and categories */}
      <FormSection
        title="Technology Stack"
        description="Built with modern, reliable technologies"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Frontend Technologies */}
          <div className={`p-4 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-800/30 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h4 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
              theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
            }`}>
              <span className="text-lg">🎨</span>
              Frontend
            </h4>
            <div className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              <div className="flex items-center gap-2">
                <span className="text-xs">⚡</span>
                <span>Electron - Desktop framework</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs">⚛️</span>
                <span>React - UI library</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs">📘</span>
                <span>TypeScript - Type safety</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs">🎨</span>
                <span>Tailwind CSS v4 - Styling</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs">🐻</span>
                <span>Zustand - State management</span>
              </div>
            </div>
          </div>

          {/* Backend Technologies */}
          <div className={`p-4 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-800/30 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h4 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
              theme === 'dark' ? 'text-green-300' : 'text-green-700'
            }`}>
              <span className="text-lg">⚙️</span>
              Backend
            </h4>
            <div className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              <div className="flex items-center gap-2">
                <span className="text-xs">🐍</span>
                <span>Python - Backend language</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs">⚡</span>
                <span>FastAPI - REST API framework</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs">🐢</span>
                <span>Tortoise ORM - Database ORM</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs">💾</span>
                <span>SQLite - Database engine</span>
              </div>
            </div>
          </div>
        </div>
      </FormSection>

      {/* System Information Card */}
      <Card variant="default">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${
              theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'
            }`}>
              <span className="text-2xl">💻</span>
            </div>
            <div>
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                System Information
              </p>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Platform: {navigator.platform} • User Agent: {navigator.userAgent.split(' ')[0]}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Credits & Copyright */}
      <Card variant="bordered" className="text-center">
        <div className="py-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">⚡</span>
            <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              MidLogic
            </p>
          </div>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            © {currentYear} MidLogic. All rights reserved.
          </p>
          <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
            Built with ❤️ for modern businesses
          </p>
        </div>
      </Card>

      {/* Toast Notification */}
      <Toast
        isOpen={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
        message={toast.message}
        type={toast.type}
        duration={3000}
      />
    </div>
  )
}

