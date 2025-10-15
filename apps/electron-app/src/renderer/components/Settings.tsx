import { useState, useEffect } from 'react'
import { useAppStore, usePinStore } from '../stores'
import { GeneralTab } from './settings/GeneralTab'
import { CompanyTab } from './settings/CompanyTab'
import { TaxTab } from './settings/TaxTab'
import { InventoryTab } from './settings/InventoryTab'
import { AccessibilityTab } from './settings/AccessibilityTab'
import { PINChangeTab } from './settings/PINChangeTab'
import { AboutTab } from './settings/AboutTab'
import { PaymentTab } from './settings/PaymentTab'
import { ReceiptTab } from './settings/ReceiptTab'
import { HardwareTab } from './settings/HardwareTab'
import { TableManagementTab } from './settings/TableManagementTab'
import { Navbar } from './Navbar'

interface SettingsProps {
  onBack: () => void
  onLogout?: () => void
}

type SettingsTab = 'general' | 'company' | 'payment' | 'receipt' | 'hardware' | 'tables' | 'tax' | 'inventory' | 'accessibility' | 'pin' | 'about'

export function Settings({ onBack, onLogout }: SettingsProps) {
  const { theme } = useAppStore()
  const { currentUser } = usePinStore()
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
  const [businessType, setBusinessType] = useState<'restaurant' | 'retail'>('retail')

  // Load business type from general settings
  useEffect(() => {
    const loadBusinessType = () => {
      const saved = localStorage.getItem('generalSettings')
      if (saved) {
        try {
          const settings = JSON.parse(saved)
          setBusinessType(settings.businessType || 'retail')
        } catch (error) {
          console.error('Failed to load business type:', error)
        }
      }
    }

    // Load initially
    loadBusinessType()

    // Listen for storage changes (when settings are updated)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'generalSettings') {
        loadBusinessType()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    // Also listen for custom event when settings change in same window
    const handleSettingsChange = () => {
      loadBusinessType()
    }
    window.addEventListener('generalSettingsChanged', handleSettingsChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('generalSettingsChanged', handleSettingsChange)
    }
  }, [])

  const tabs = [
    {
      id: 'general' as SettingsTab,
      name: 'General',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      id: 'company' as SettingsTab,
      name: 'Business Info',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      id: 'payment' as SettingsTab,
      name: 'Payments',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      )
    },
    {
      id: 'receipt' as SettingsTab,
      name: 'Receipts',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'hardware' as SettingsTab,
      name: 'Hardware',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'tables' as SettingsTab,
      name: 'Tables',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'tax' as SettingsTab,
      name: 'Tax',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'inventory' as SettingsTab,
      name: 'Inventory',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      id: 'accessibility' as SettingsTab,
      name: 'Accessibility',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )
    },
    {
      id: 'pin' as SettingsTab,
      name: 'PIN Change',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    {
      id: 'about' as SettingsTab,
      name: 'About',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ]

  return (
    <div className={`
      h-screen flex flex-col overflow-hidden
      ${theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
      }
    `}>
      {/* Header */}
      <Navbar
        title="Settings"
        subtitle="Configure your system preferences"
        icon={
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        }
        onBack={onBack}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full w-full px-8 py-8 overflow-y-auto">
          <div className="flex gap-6 min-h-full">
            {/* Sidebar Navigation */}
            <aside className={`
              w-64 flex-shrink-0
              ${theme === 'dark'
                ? 'bg-gray-800/50 border border-gray-700'
                : 'bg-white border border-gray-200'
              }
              rounded-xl p-4
              h-fit sticky top-0
            `}>
            <nav className="space-y-2">
              {tabs
                .filter(tab => {
                  // Only show Tables tab for restaurant business type
                  if (tab.id === 'tables') {
                    return businessType === 'restaurant'
                  }
                  return true
                })
                .map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-center gap-4 px-5 py-4 rounded-lg transition-colors text-left min-h-[56px]
                      ${activeTab === tab.id
                        ? theme === 'dark'
                          ? 'bg-primary-600 text-white'
                          : 'bg-primary-500 text-white'
                        : theme === 'dark'
                          ? 'text-gray-300 hover:bg-gray-700/50'
                          : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    {tab.icon}
                    <span className="text-base font-medium">{tab.name}</span>
                  </button>
                ))}
            </nav>
          </aside>

            {/* Content Area */}
            <div className="flex-1 min-w-0">
              <div className={`
                ${theme === 'dark'
                  ? 'bg-gray-800/50 border border-gray-700'
                  : 'bg-white border border-gray-200'
                }
                rounded-xl p-8
              `}>
                {activeTab === 'general' && <GeneralTab />}
                {activeTab === 'company' && <CompanyTab />}
                {activeTab === 'payment' && <PaymentTab />}
                {activeTab === 'receipt' && <ReceiptTab />}
                {activeTab === 'hardware' && <HardwareTab />}
                {activeTab === 'tables' && <TableManagementTab />}
                {activeTab === 'tax' && <TaxTab />}
                {activeTab === 'inventory' && <InventoryTab />}
                {activeTab === 'accessibility' && <AccessibilityTab />}
                {activeTab === 'pin' && <PINChangeTab />}
                {activeTab === 'about' && <AboutTab />}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

