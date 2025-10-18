import { useState, useEffect } from 'react'
import { useAppStore, usePinStore } from './stores'
import { SplashScreen } from './components/SplashScreen'
import { Login } from './components/Login'
import { Dashboard } from './components/Dashboard'
import { SaleScreen } from './components/SaleScreen'
import { Settings } from './components/Settings'
import { ProductsScreen } from './components/products'
import { Walkthrough, defaultWalkthroughSteps } from './components/walkthrough'

const API_BASE_URL = 'http://localhost:8001/api'

type AppScreen = 'splash' | 'pin' | 'dashboard' | 'sales' | 'products' | 'inventory' | 'users' | 'settings'

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('splash')
  const [showWalkthrough, setShowWalkthrough] = useState(false)
  const { theme } = useAppStore()
  const { reset: resetPin, initializeSystem, currentUser } = usePinStore()

  // Handle splash screen completion
  const handleSplashComplete = () => {
    setCurrentScreen('pin')
  }

  // Handle PIN authentication
  const handlePinAuthenticated = async () => {
    setCurrentScreen('dashboard')

    // Check if walkthrough should be shown
    try {
      const response = await fetch(`${API_BASE_URL}/settings/display/show_walkthrough`)
      const data = await response.json()
      const shouldShowWalkthrough = data?.value !== false

      if (shouldShowWalkthrough) {
        // Show walkthrough after a short delay
        setTimeout(() => {
          setShowWalkthrough(true)
        }, 500)
      }
    } catch {
      // If setting doesn't exist, show walkthrough by default
      setTimeout(() => {
        setShowWalkthrough(true)
      }, 500)
    }
  }

  // Handle navigation from dashboard with role-based access control
  const handleNavigate = (screen: 'sales' | 'products' | 'inventory' | 'users' | 'settings') => {
    // Restrict admin-only screens
    if ((screen === 'users' || screen === 'settings') && currentUser?.role !== 'admin') {
      console.warn(`Access denied: ${screen} is only available to admin users`)
      return
    }
    setCurrentScreen(screen)
  }

  // Handle back to dashboard
  const handleBackToDashboard = () => {
    setCurrentScreen('dashboard')
  }

  // Handle walkthrough completion
  const handleWalkthroughComplete = () => {
    setShowWalkthrough(false)
  }

  // Handle walkthrough skip
  const handleWalkthroughSkip = () => {
    setShowWalkthrough(false)
  }

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  // Initialize system and reset PIN store when app starts
  useEffect(() => {
    resetPin()
    // Initialize the system (create primary user if needed)
    initializeSystem().catch(console.error)
  }, [resetPin, initializeSystem])

  return (
    <div className="h-screen w-screen overflow-hidden">
      {currentScreen === 'splash' && (
        <SplashScreen
          onComplete={handleSplashComplete}
          duration={3000}
        />
      )}

      {currentScreen === 'pin' && (
        <Login onAuthenticated={handlePinAuthenticated} />
      )}

      {currentScreen === 'dashboard' && (
        <Dashboard onNavigate={handleNavigate} />
      )}

      {currentScreen === 'sales' && (
        <SaleScreen onBack={handleBackToDashboard} />
      )}

      {currentScreen === 'products' && (
        <ProductsScreen onBack={handleBackToDashboard} />
      )}

      {currentScreen === 'inventory' && (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Inventory Management</h1>
            <p className="text-gray-600 mb-4">Coming soon...</p>
            <button
              onClick={handleBackToDashboard}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}

      {currentScreen === 'users' && (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">User Management</h1>
            <p className="text-gray-600 mb-4">Coming soon...</p>
            <button
              onClick={handleBackToDashboard}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}

      {currentScreen === 'settings' && (
        <Settings onBack={handleBackToDashboard} />
      )}

      {/* Walkthrough Overlay */}
      {showWalkthrough && (
        <Walkthrough
          steps={defaultWalkthroughSteps}
          onComplete={handleWalkthroughComplete}
          onSkip={handleWalkthroughSkip}
          showDontShowAgain
        />
      )}
    </div>
  )
}

export default App

