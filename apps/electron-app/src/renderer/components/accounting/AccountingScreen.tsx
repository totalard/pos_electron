import { useState } from 'react'
import { useAppStore } from '../../stores'
import { PageHeader } from '../layout'
import { ThemeToggle } from '../common'
import { ChartOfAccountsTab } from './ChartOfAccountsTab'
import { JournalEntriesTab } from './JournalEntriesTab'
import { ReportsTab } from './ReportsTab'
import { PurchasesTab } from './PurchasesTab'
import { YearEndTab } from './YearEndTab'

interface AccountingScreenProps {
  onBack: () => void
}

type TabType = 'accounts' | 'journal' | 'reports' | 'purchases' | 'yearend'

export function AccountingScreen({ onBack }: AccountingScreenProps) {
  const { theme } = useAppStore()
  const [activeTab, setActiveTab] = useState<TabType>('accounts')

  const tabs = [
    { id: 'accounts' as TabType, label: 'Chart of Accounts', icon: '📊' },
    { id: 'journal' as TabType, label: 'Journal Entries', icon: '📝' },
    { id: 'reports' as TabType, label: 'Reports', icon: '📈' },
    { id: 'purchases' as TabType, label: 'Purchases', icon: '🛒' },
    { id: 'yearend' as TabType, label: 'Year-End', icon: '🎯' }
  ]

  return (
    <div className={`
      h-screen w-screen flex flex-col
      ${theme === 'dark'
        ? 'bg-gray-900'
        : 'bg-gray-50'
      }
    `}>
      <PageHeader
        title="Accounting"
        subtitle="Manage accounts, journal entries, and financial reports"
        showBackButton
        onBack={onBack}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        }
        actions={<ThemeToggle size="md" />}
      />

      {/* Tabs */}
      <div className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex space-x-1 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-6 py-3 font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? theme === 'dark'
                    ? 'border-b-2 border-teal-500 text-teal-400'
                    : 'border-b-2 border-teal-600 text-teal-600'
                  : theme === 'dark'
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'accounts' && <ChartOfAccountsTab />}
        {activeTab === 'journal' && <JournalEntriesTab />}
        {activeTab === 'reports' && <ReportsTab />}
        {activeTab === 'purchases' && <PurchasesTab />}
        {activeTab === 'yearend' && <YearEndTab />}
      </div>
    </div>
  )
}
