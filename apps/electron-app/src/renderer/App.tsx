import { useState, useEffect } from 'react'
import { useAppStore, usePinStore } from './stores'
import { SplashScreen } from './components/SplashScreen'
import { PINInput } from './components/PINInput'
import { WelcomeScreen } from './components/WelcomeScreen'

type AppScreen = 'splash' | 'pin' | 'main'

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('splash')
  const { theme } = useAppStore()
  const { reset: resetPin } = usePinStore()

  // Handle splash screen completion
  const handleSplashComplete = () => {
    setCurrentScreen('pin')
  }

  // Handle PIN authentication
  const handlePinAuthenticated = () => {
    setCurrentScreen('main')
  }

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  // Reset PIN store when app starts
  useEffect(() => {
    resetPin()
  }, [resetPin])

  return (
    <div className="h-screen w-screen overflow-hidden">
      {currentScreen === 'splash' && (
        <SplashScreen
          onComplete={handleSplashComplete}
          duration={3000}
        />
      )}

      {currentScreen === 'pin' && (
        <PINInput onAuthenticated={handlePinAuthenticated} />
      )}

      {currentScreen === 'main' && (
        <WelcomeScreen />
      )}
    </div>
  )
}

export default App

