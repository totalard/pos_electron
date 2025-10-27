import { useState } from 'react'
import { useAppStore } from '../../stores'
import { PageHeader } from '../layout'
import { ChartOfAccountsTab } from './ChartOfAccountsTab'
import { JournalEntriesTab } from './JournalEntriesTab'

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
    <div className={`h-screen flex flex-col ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <PageHeader
        title="Accounting"
        subtitle="Manage accounts, journal entries, and financial reports"
        onBack={onBack}
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

function ReportsTab() {
  const { theme } = useAppStore()
  
  const reports = [
    { name: 'Income Statement', description: 'Profit & Loss report', icon: '💰' },
    { name: 'Balance Sheet', description: 'Assets, Liabilities, Equity', icon: '⚖️' },
    { name: 'Trial Balance', description: 'Verify debits equal credits', icon: '✅' },
    { name: 'Cash Flow', description: 'Cash in and out tracking', icon: '💵' }
  ]
  
  return (
    <div className="space-y-4">
      <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Financial Reports
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report) => (
          <button
            key={report.name}
            className={`
              p-6 rounded-lg border text-left transition-all hover:scale-105
              ${theme === 'dark' 
                ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                : 'bg-white border-gray-200 hover:shadow-lg'
              }
            `}
          >
            <div className="text-3xl mb-2">{report.icon}</div>
            <h3 className={`text-lg font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {report.name}
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {report.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}

function PurchasesTab() {
  const { theme } = useAppStore()
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Purchase Orders
        </h2>
        <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
          + New Purchase
        </button>
      </div>
      
      <div className={`rounded-lg border p-4 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
          Purchase orders with barcode scanning support will be displayed here.
        </p>
      </div>
    </div>
  )
}

function YearEndTab() {
  const { theme } = useAppStore()
  
  return (
    <div className="space-y-4">
      <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Year-End Closing
      </h2>
      
      <div className={`rounded-lg border p-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="space-y-4">
          <div>
            <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Year-End Wizard
            </h3>
            <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Close the fiscal year and transfer balances to the new year.
            </p>
          </div>
          
          <button className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium">
            Start Year-End Closing
          </button>
        </div>
      </div>
    </div>
  )
}
