import { useState, useEffect } from 'react'
import { useAppStore, usePinStore } from './stores'
import { SplashScreen } from './components/SplashScreen'
import { Login } from './components/Login'
import { Dashboard } from './components/Dashboard'
import { SaleScreen } from './components/SaleScreen'
import { Settings } from './components/Settings'

type AppScreen = 'splash' | 'pin' | 'dashboard' | 'sales' | 'products' | 'inventory' | 'users' | 'settings'

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('splash')
  const { theme } = useAppStore()
  const { reset: resetPin, initializeSystem } = usePinStore()

  // Handle splash screen completion
  const handleSplashComplete = () => {
    setCurrentScreen('pin')
  }

  // Handle PIN authentication
  const handlePinAuthenticated = () => {
    setCurrentScreen('dashboard')
  }

  // Handle navigation from dashboard
  const handleNavigate = (screen: 'sales' | 'products' | 'inventory' | 'users' | 'settings') => {
    setCurrentScreen(screen)
  }

  // Handle back to dashboard
  const handleBackToDashboard = () => {
    setCurrentScreen('dashboard')
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
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Products & Services</h1>
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
    </div>
  )
}

export default App

