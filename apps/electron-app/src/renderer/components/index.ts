/**
 * Central export file for all reusable components
 * 
 * This file provides a single import point for all components,
 * making it easier to import multiple components at once.
 * 
 * @example
 * ```tsx
 * import { Button, Input, Card, Modal } from './components'
 * ```
 */

// Common components
export * from './common'

// Form components
export * from './forms'

// Layout components
export * from './layout'

// POS-specific components
export * from './pos'

// Page components
export { Dashboard } from './Dashboard'
export { Login } from './Login'
export { Settings } from './Settings'
export { SaleScreen } from './SaleScreen'
export { SplashScreen } from './SplashScreen'
export { WelcomeScreen } from './WelcomeScreen'
export { FeatureCarousel } from './FeatureCarousel'
export { NumericKeypad } from './NumericKeypad'
export { PINInput } from './PINInput'
export { PinEntryPanel } from './PinEntryPanel'

