import { useEffect } from 'react'
import { useAppStore, useSettingsStore } from '../stores'
import { SettingsNavigation } from './settings/SettingsNavigation'
import { GeneralPanel } from './settings/GeneralPanel'
import { BusinessPanel } from './settings/BusinessPanel'
import { TaxesPanel } from './settings/TaxesPanel'
import { PaymentsPanel } from './settings/PaymentsPanel'
import { HardwarePanel } from './settings/HardwarePanel'
import { ReceiptsPanel } from './settings/ReceiptsPanel'
import { InventoryPanel } from './settings/InventoryPanel'
import { RestaurantPanel } from './settings/RestaurantPanel'
import { IntegrationPanel } from './settings/IntegrationPanel'
import { BackupPanel } from './settings/BackupPanel'
import { DisplayPanel } from './settings/DisplayPanel'
import { SecurityPanel } from './settings/SecurityPanel'
import { UserManagementPanel } from './settings/UserManagementPanel'
import { DemoDataManager } from './settings/DemoDataManager'
import { AboutPanel } from './settings/AboutPanel'
import { PageHeader } from './layout'
import { SplitLayout } from './layout'
import { ThemeToggle } from './common'

interface SettingsProps {
  onBack: () => void
}

export function Settings({ onBack }: SettingsProps) {
  const { theme } = useAppStore()
  const { selectedSection, loadSettings } = useSettingsStore()

  // Load settings from backend on mount
  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  // Render the appropriate content panel based on selected section
  const renderContentPanel = () => {
    switch (selectedSection) {
      case 'general':
        return <GeneralPanel />
      case 'business':
        return <BusinessPanel />
      case 'taxes':
        return <TaxesPanel />
      case 'payments':
        return <PaymentsPanel />
      case 'hardware':
        return <HardwarePanel />
      case 'receipts':
        return <ReceiptsPanel />
      case 'inventory':
        return <InventoryPanel />
      case 'restaurant':
        return <RestaurantPanel />
      case 'integration':
        return <IntegrationPanel />
      case 'backup':
        return <BackupPanel />
      case 'display':
        return <DisplayPanel />
      case 'security':
        return <SecurityPanel />
      case 'users':
        return <UserManagementPanel />
      case 'demo':
        return <DemoDataManager />
      case 'about':
        return <AboutPanel />
      default:
        return <GeneralPanel />
    }
  }

  return (
    <div className={`
      h-screen w-screen flex flex-col
      ${theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
      }
    `}>
      {/* Header */}
      <PageHeader
        title="Settings"
        subtitle="Configure your POS system"
        showBackButton
        onBack={onBack}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        }
        actions={
          <div className="flex items-center gap-3">
            <div className={`
              text-sm flex items-center gap-2
              ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
            `}>
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Auto-saved</span>
            </div>
            <ThemeToggle size="md" />
          </div>
        }
      />

      {/* Main Content - Split Screen Layout */}
      <div className="flex-1 overflow-hidden p-4">
        <SplitLayout
          left={<SettingsNavigation />}
          right={renderContentPanel()}
          leftWidth={4}
          gap="md"
        />
      </div>
    </div>
  )
}

