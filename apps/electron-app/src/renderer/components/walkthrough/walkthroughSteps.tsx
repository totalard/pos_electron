import type { WalkthroughStep } from './Walkthrough'
import {
  WelcomeIllustration,
  DashboardIllustration,
  SalesIllustration,
  ProductsIllustration,
  CustomersIllustration,
  SettingsIllustration,
  SuccessIllustration
} from './WalkthroughIllustrations'

/**
 * Default walkthrough steps for the POS application
 * Now with custom SVG illustrations
 */
export const defaultWalkthroughSteps: WalkthroughStep[] = [
  {
    title: 'Welcome to MidLogic POS',
    description: 'Your complete point of sale solution. This quick tutorial will help you get started with the key features of the system.',
    illustration: 'welcome'
  },
  {
    title: 'Dashboard Overview',
    description: 'The dashboard is your central hub. Access sales, product management, settings, and more from the main menu. All key features are just one tap away.',
    illustration: 'dashboard'
  },
  {
    title: 'Process Sales',
    description: 'The Sale Screen lets you quickly add products, apply discounts, and process payments. Use the search bar or browse categories to find products fast.',
    illustration: 'sales'
  },
  {
    title: 'Manage Products',
    description: 'Add, edit, and organize your products with ease. Switch between tile and grid views, manage categories, and track inventory levels in real-time.',
    illustration: 'products'
  },
  {
    title: 'Customer Management',
    description: 'Build customer relationships with our customer management system. Track loyalty points, store contact information, and view purchase history.',
    illustration: 'customers'
  },
  {
    title: 'Customize Settings',
    description: 'Configure your POS to match your business needs. Set up taxes, hardware devices, receipt templates, and more from the Settings panel.',
    illustration: 'settings'
  },
  {
    title: 'You\'re All Set!',
    description: 'You\'re ready to start using MidLogic POS. Remember, you can always access help and documentation from the Settings menu. Happy selling!',
    illustration: 'success'
  }
]

/**
 * Get illustration component for a step
 */
export function getIllustrationComponent(illustration: string, theme: 'light' | 'dark') {
  const className = "w-full h-full"

  switch (illustration) {
    case 'welcome':
      return <WelcomeIllustration theme={theme} className={className} />
    case 'dashboard':
      return <DashboardIllustration theme={theme} className={className} />
    case 'sales':
      return <SalesIllustration theme={theme} className={className} />
    case 'products':
      return <ProductsIllustration theme={theme} className={className} />
    case 'customers':
      return <CustomersIllustration theme={theme} className={className} />
    case 'settings':
      return <SettingsIllustration theme={theme} className={className} />
    case 'success':
      return <SuccessIllustration theme={theme} className={className} />
    default:
      return null
  }
}

