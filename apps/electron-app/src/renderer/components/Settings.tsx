import { useAppStore, useSettingsStore, SettingsSection } from '../stores'
import { SettingsNavigation } from './settings/SettingsNavigation'
import { GeneralPanel } from './settings/GeneralPanel'
import { BusinessPanel } from './settings/BusinessPanel'
import { TaxesPanel } from './settings/TaxesPanel'
import { HardwarePanel } from './settings/HardwarePanel'
import { ReceiptsPanel } from './settings/ReceiptsPanel'
import { InventoryPanel } from './settings/InventoryPanel'
import { IntegrationPanel } from './settings/IntegrationPanel'
import { BackupPanel } from './settings/BackupPanel'
import { AboutPanel } from './settings/AboutPanel'

interface SettingsProps {
  onBack: () => void
}

export function Settings({ onBack }: SettingsProps) {
  const { theme } = useAppStore()
  const { selectedSection } = useSettingsStore()

  // Render the appropriate content panel based on selected section
  const renderContentPanel = () => {
    switch (selectedSection) {
      case 'general':
        return <GeneralPanel />
      case 'business':
        return <BusinessPanel />
      case 'taxes':
        return <TaxesPanel />
      case 'hardware':
        return <HardwarePanel />
      case 'receipts':
        return <ReceiptsPanel />
      case 'inventory':
        return <InventoryPanel />
      case 'integration':
        return <IntegrationPanel />
      case 'backup':
        return <BackupPanel />
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
      <header className={`
        flex items-center justify-between
        px-4 py-3
        border-b
        ${theme === 'dark' 
          ? 'bg-gray-800/50 border-gray-700' 
          : 'bg-white/50 border-gray-200'
        }
      `}>
        {/* Back Button and Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg
              transition-all duration-200
              ${theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }
            `}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">Back</span>
          </button>

          <div className="flex items-center gap-3">
            <div className={`
              p-2 rounded-lg
              ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-500/10'}
            `}>
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className={`
                text-2xl font-bold
                ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
              `}>
                Settings
              </h1>
              <p className={`
                text-sm
                ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
              `}>
                Configure your POS system
              </p>
            </div>
          </div>
        </div>

        {/* Save Indicator (optional) */}
        <div className={`
          text-sm
          ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
        `}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>Auto-saved</span>
          </div>
        </div>
      </header>

      {/* Main Content - Split Screen Layout */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Left Pane - Navigation (1/3 width) */}
        <div className={`
          w-1/3 rounded-xl overflow-hidden
          ${theme === 'dark' 
            ? 'bg-gray-800/50 border border-gray-700' 
            : 'bg-white border border-gray-200'
          }
        `}>
          <SettingsNavigation />
        </div>

        {/* Right Pane - Content (2/3 width) */}
        <div className={`
          flex-1 rounded-xl overflow-hidden
          ${theme === 'dark' 
            ? 'bg-gray-800/50 border border-gray-700' 
            : 'bg-white border border-gray-200'
          }
        `}>
          <div className="h-full overflow-y-auto">
            {renderContentPanel()}
          </div>
        </div>
      </div>
    </div>
  )
}

