import { useState } from 'react'
import { useAppStore, useSettingsStore } from '../../stores'
import { Toast, Button, Card, Badge } from '../common'
import { FormSection } from '../forms'

/**
 * Enhanced About Panel with WCAG AA Contrast Compliance
 *
 * Features:
 * - Modern card-based layout with visual hierarchy
 * - Enhanced app branding with accessible gradient background
 * - Organized information sections with improved contrast
 * - Touch-safe UI elements (minimum 44x44px)
 * - Better visual presentation of version info and tech stack
 * - Theme-aware design with WCAG AA compliant text contrast
 * - All text meets 4.5:1 contrast ratio for normal text, 3:1 for large text
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
      {/* Page Header - Enhanced contrast */}
      <div className="mb-6">
        <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          About
        </h2>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          Application information, version details, and system credits
        </p>
      </div>

      {/* App Branding Card - Enhanced with accessible gradient */}
      <Card variant="elevated" className="overflow-hidden">
        <div className={`
          relative p-8 text-center
          ${theme === 'dark'
            ? 'bg-gradient-to-br from-blue-600/25 via-purple-600/25 to-blue-600/25'
            : 'bg-gradient-to-br from-blue-100 via-purple-100 to-blue-100'
          }
        `}>
          {/* App Icon - Enhanced visibility */}
          <div className={`
            inline-flex p-6 rounded-2xl mb-4 shadow-lg
            ${theme === 'dark' ? 'bg-blue-600/40' : 'bg-blue-600/30'}
          `}>
            <svg className={`w-20 h-20 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>

          {/* App Name - High contrast */}
          <h3 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            MidLogic POS
          </h3>
          <p className={`text-lg mb-4 font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
            Point of Sale System
          </p>

          {/* Version Badge */}
          <Badge variant="primary" size="lg">
            Version {about.appVersion}
          </Badge>
        </div>
      </Card>

      {/* Version Information & Updates - Two Column Layout - Enhanced contrast */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Version Information Card */}
        <FormSection
          title="Version Information"
          description="Current application version details"
        >
          <div className="space-y-3">
            <div className={`flex items-center justify-between p-3 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-800/60 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-lg" aria-hidden="true">📦</span>
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Version
                </span>
              </div>
              <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {about.appVersion}
              </span>
            </div>

            <div className={`flex items-center justify-between p-3 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-800/60 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-lg" aria-hidden="true">🔢</span>
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Build Number
                </span>
              </div>
              <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {about.buildNumber}
              </span>
            </div>

            {about.lastUpdateCheck && (
              <div className={`flex items-center justify-between p-3 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-800/60 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg" aria-hidden="true">🔄</span>
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
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

        {/* Updates Card - Enhanced contrast */}
        <FormSection
          title="Software Updates"
          description="Check for the latest version"
        >
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border-l-4 shadow-sm ${
              theme === 'dark'
                ? 'bg-blue-900/30 border-l-blue-400 border border-blue-800'
                : 'bg-blue-50 border-l-blue-600 border border-blue-200'
            }`}>
              <div className="flex items-start gap-3">
                <span className="text-xl" aria-hidden="true">ℹ️</span>
                <div>
                  <p className={`text-sm font-semibold mb-1 ${
                    theme === 'dark' ? 'text-blue-200' : 'text-blue-800'
                  }`}>
                    Stay Up to Date
                  </p>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
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

      {/* Application Details - Enhanced contrast and readability */}
      <FormSection
        title="Application Details"
        description="Key information about your installation"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Version Details - Improved contrast */}
          <div className={`p-5 rounded-lg border shadow-sm ${
            theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h4 className={`text-base font-bold mb-4 flex items-center gap-2 ${
              theme === 'dark' ? 'text-blue-300' : 'text-blue-800'
            }`}>
              <span className="text-xl" aria-hidden="true">📦</span>
              Application Overview
            </h4>
            <div className={`space-y-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <div className="flex items-center justify-between py-1">
                <span className="flex items-center gap-2 font-medium">
                  <span className="text-base" aria-hidden="true">🏷️</span>
                  <span>Application Name</span>
                </span>
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>MidLogic POS</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="flex items-center gap-2 font-medium">
                  <span className="text-base" aria-hidden="true">🔢</span>
                  <span>Version</span>
                </span>
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{about.appVersion}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="flex items-center gap-2 font-medium">
                  <span className="text-base" aria-hidden="true">🛠️</span>
                  <span>Build Number</span>
                </span>
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{about.buildNumber}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="flex items-center gap-2 font-medium">
                  <span className="text-base" aria-hidden="true">🗄️</span>
                  <span>Database Version</span>
                </span>
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{about.databaseVersion}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="flex items-center gap-2 font-medium">
                  <span className="text-base" aria-hidden="true">⏱️</span>
                  <span>Last Update Check</span>
                </span>
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {about.lastUpdateCheck ? new Date(about.lastUpdateCheck).toLocaleString() : 'Never'}
                </span>
              </div>
            </div>
          </div>

          {/* Licensing - Improved contrast */}
          <div className={`p-5 rounded-lg border shadow-sm ${
            theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h4 className={`text-base font-bold mb-4 flex items-center gap-2 ${
              theme === 'dark' ? 'text-green-300' : 'text-green-800'
            }`}>
              <span className="text-xl" aria-hidden="true">📄</span>
              Licensing & Support
            </h4>
            <div className={`space-y-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <div>
                <p className={`font-semibold mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                  License Type
                </p>
                <p>Enterprise Subscription</p>
              </div>
              <div>
                <p className={`font-semibold mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                  Support Contact
                </p>
                <p className={`font-mono ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                  support@midlogic.io
                </p>
              </div>
              <div>
                <p className={`font-semibold mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                  Account Representative
                </p>
                <p>Reach out to your MidLogic partner for personalized assistance.</p>
              </div>
            </div>
          </div>
        </div>
      </FormSection>

      {/* System Configuration Card - Enhanced contrast */}
      <Card variant="default">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg shadow-sm ${
              theme === 'dark' ? 'bg-gray-700/60' : 'bg-gray-200'
            }`}>
              <span className="text-2xl" aria-hidden="true">💻</span>
            </div>
            <div>
              <p className={`text-base font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                System Configuration
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Full snapshot of the environment powering this POS instance
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className={`p-3 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <p className={`font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                Platform
              </p>
              <p className={`font-mono text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {navigator.platform}
              </p>
            </div>
            <div className={`p-3 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <p className={`font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                User Agent
              </p>
              <p className={`font-mono text-xs break-all ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {navigator.userAgent}
              </p>
            </div>
            {window.electronAPI && (
              <>
                <div className={`p-3 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}>
                  <p className={`font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                    Electron Version
                  </p>
                  <p className={`font-mono text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {window.electronAPI.versions.electron}
                  </p>
                </div>
                <div className={`p-3 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}>
                  <p className={`font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                    Chrome Version
                  </p>
                  <p className={`font-mono text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {window.electronAPI.versions.chrome}
                  </p>
                </div>
                <div className={`p-3 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}>
                  <p className={`font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                    Node Version
                  </p>
                  <p className={`font-mono text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {window.electronAPI.versions.node}
                  </p>
                </div>
                <div className={`p-3 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}>
                  <p className={`font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                    OS Platform
                  </p>
                  <p className={`font-mono text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {window.electronAPI.platform}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Credits & Copyright - Enhanced contrast */}
      <Card variant="bordered" className="text-center">
        <div className="py-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-3xl" aria-hidden="true">⚡</span>
            <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              MidLogic
            </p>
          </div>
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            © {currentYear} MidLogic. All rights reserved.
          </p>
          <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Built with <span className="text-red-500" aria-label="love">❤️</span> for modern businesses
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

