import { useState, useEffect } from 'react'
import { useAppStore, usePinStore, useSettingsStore } from './stores'
import { SplashScreen } from './components/SplashScreen'
import { Login } from './components/Login'
import { Dashboard } from './components/Dashboard'
import { SaleScreen } from './components/SaleScreen'
import { Settings } from './components/Settings'
import { ProductsScreen } from './components/products'
import { CustomerManagementScreen } from './components/customers'
import { InventoryScreen } from './components/inventory'
import { TransactionManagementScreen } from './components/transactions/TransactionManagementScreen'
import { RestaurantManagementScreen } from './components/restaurant'
import { Walkthrough, defaultWalkthroughSteps } from './components/walkthrough'
import { ErrorModal } from './components/common/ErrorModal'
import { LockScreen } from './components/LockScreen'

const API_BASE_URL = 'http://localhost:8000/api'

type AppScreen = 'splash' | 'walkthrough' | 'pin' | 'dashboard' | 'sales' | 'products' | 'inventory' | 'users' | 'settings' | 'customers' | 'transactions' | 'restaurant'

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('splash')
  const [walkthroughChecked, setWalkthroughChecked] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const { theme } = useAppStore()
  const { reset: resetPin, initializeSystem, currentUser } = usePinStore()
  const { loadSettings } = useSettingsStore()

  // Handle splash screen completion - check walkthrough status
  const handleSplashComplete = async () => {
    // Check if walkthrough should be shown
    try {
      const response = await fetch(`${API_BASE_URL}/settings/display/show_walkthrough`, { silent: true } as any)
      const data = await response.json()
      const shouldShowWalkthrough = data?.value !== false

      if (shouldShowWalkthrough) {
        setCurrentScreen('walkthrough')
      } else {
        setCurrentScreen('pin')
      }
    } catch {
      // If setting doesn't exist, show walkthrough by default (silent error)
      setCurrentScreen('walkthrough')
    }
    
    setWalkthroughChecked(true)
  }

  // Handle PIN authentication
  const handlePinAuthenticated = async () => {
    setCurrentScreen('dashboard')
  }

  // Handle navigation from dashboard with role-based access control
  const handleNavigate = (screen: 'sales' | 'products' | 'inventory' | 'users' | 'settings' | 'customers' | 'transactions' | 'restaurant') => {
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

  // Handle lock screen
  const handleLock = () => {
    if (currentUser) {
      setIsLocked(true)
    }
  }

  // Handle unlock
  const handleUnlock = () => {
    setIsLocked(false)
  }

  // Handle logout
  const handleLogout = () => {
    resetPin()
    setCurrentScreen('pin')
    setIsLocked(false)
  }

  // Handle walkthrough completion - proceed to login
  const handleWalkthroughComplete = () => {
    setCurrentScreen('pin')
  }

  // Handle walkthrough skip - proceed to login
  const handleWalkthroughSkip = () => {
    setCurrentScreen('pin')
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
    // Load settings from backend to ensure business mode is synced
    loadSettings().catch(console.error)
  }, [resetPin, initializeSystem, loadSettings])

  return (
    <div className="h-screen w-screen overflow-hidden">
      {/* Lock Screen Overlay */}
      {isLocked && <LockScreen onUnlock={handleUnlock} />}
      
      {/* Main App Content */}
      {currentScreen === 'splash' && (
        <SplashScreen
          onComplete={handleSplashComplete}
          duration={3000}
        />
      )}

      {currentScreen === 'walkthrough' && (
        <Walkthrough
          steps={defaultWalkthroughSteps}
          onComplete={handleWalkthroughComplete}
          onSkip={handleWalkthroughSkip}
          showDontShowAgain
        />
      )}

      {currentScreen === 'pin' && (
        <Login onAuthenticated={handlePinAuthenticated} />
      )}

      {currentScreen === 'dashboard' && (
        <Dashboard onNavigate={handleNavigate} onLock={handleLock} onLogout={handleLogout} />
      )}

      {currentScreen === 'sales' && (
        <SaleScreen onBack={handleBackToDashboard} />
      )}

      {currentScreen === 'products' && (
        <ProductsScreen onBack={handleBackToDashboard} />
      )}

      {currentScreen === 'inventory' && (
        <InventoryScreen onBack={handleBackToDashboard} />
      )}

      {currentScreen === 'customers' && (
        <CustomerManagementScreen onBack={handleBackToDashboard} />
      )}

      {currentScreen === 'transactions' && (
        <TransactionManagementScreen onBack={handleBackToDashboard} />
      )}

      {currentScreen === 'restaurant' && (
        <RestaurantManagementScreen onBack={handleBackToDashboard} />
      )}

      {currentScreen === 'users' && (
        <Settings onBack={handleBackToDashboard} />
      )}

      {currentScreen === 'settings' && (
        <Settings onBack={handleBackToDashboard} />
      )}

      {/* Global Error Modal */}
      <ErrorModal />
    </div>
  )
}

export default App

