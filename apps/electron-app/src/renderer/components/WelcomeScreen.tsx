import { useAppStore } from '../stores'
import { useEffect, useState } from 'react'

export function WelcomeScreen() {
  const { currentUser, setCurrentUser, theme, setTheme } = useAppStore()
  const [systemInfo, setSystemInfo] = useState({
    platform: '',
    versions: { node: '', chrome: '', electron: '' }
  })

  useEffect(() => {
    // Get system information from Electron API
    if (window.electronAPI) {
      setSystemInfo({
        platform: window.electronAPI.platform,
        versions: window.electronAPI.versions
      })
    }
  }, [])

  const handleGetStarted = () => {
    setCurrentUser('Demo User')
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="card max-w-2xl w-full mx-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-100 mb-4">
            <svg
              className="w-10 h-10 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to POS Application
          </h1>
          <p className="text-lg text-gray-600">
            Modern Point of Sale System built with Electron
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="text-center p-4 rounded-lg bg-gray-50">
            <div className="text-primary-600 font-semibold mb-1">Fast</div>
            <div className="text-sm text-gray-600">Lightning quick performance</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-gray-50">
            <div className="text-primary-600 font-semibold mb-1">Secure</div>
            <div className="text-sm text-gray-600">Enterprise-grade security</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-gray-50">
            <div className="text-primary-600 font-semibold mb-1">Modern</div>
            <div className="text-sm text-gray-600">Beautiful user interface</div>
          </div>
        </div>

        {/* System Info */}
        {systemInfo.platform && (
          <div className="mb-8 p-4 rounded-lg bg-gray-50 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">System Information</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div>Platform: <span className="font-mono">{systemInfo.platform}</span></div>
              <div>Electron: <span className="font-mono">{systemInfo.versions.electron}</span></div>
              <div>Node: <span className="font-mono">{systemInfo.versions.node}</span></div>
              <div>Chrome: <span className="font-mono">{systemInfo.versions.chrome}</span></div>
            </div>
          </div>
        )}

        {/* User Status */}
        {currentUser && (
          <div className="mb-6 p-4 rounded-lg bg-primary-50 border border-primary-200">
            <p className="text-sm text-primary-800">
              Welcome back, <span className="font-semibold">{currentUser}</span>!
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleGetStarted}
            className="btn-primary"
          >
            Get Started
          </button>
          <button
            onClick={toggleTheme}
            className="btn-secondary"
          >
            Toggle Theme ({theme})
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Built with Electron, TypeScript, Tailwind CSS v4, and Zustand
          </p>
        </div>
      </div>
    </div>
  )
}

