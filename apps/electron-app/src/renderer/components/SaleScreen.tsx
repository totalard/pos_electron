import { useState } from 'react'
import { useAppStore } from '../stores'

interface Tab {
  id: string
  name: string
  items: number
}

interface SaleScreenProps {
  onBack: () => void
}

export function SaleScreen({ onBack }: SaleScreenProps) {
  const { theme } = useAppStore()
  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', name: 'Tab 1', items: 0 }
  ])
  const [activeTabId, setActiveTabId] = useState('1')

  const addNewTab = () => {
    const newTabId = String(tabs.length + 1)
    const newTab: Tab = {
      id: newTabId,
      name: `Tab ${newTabId}`,
      items: 0
    }
    setTabs([...tabs, newTab])
    setActiveTabId(newTabId)
  }

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return // Don't close the last tab
    
    const newTabs = tabs.filter(tab => tab.id !== tabId)
    setTabs(newTabs)
    
    // If closing active tab, switch to the first tab
    if (activeTabId === tabId) {
      setActiveTabId(newTabs[0].id)
    }
  }

  return (
    <div className={`
      fixed inset-0 z-50 flex flex-col
      ${theme === 'dark' 
        ? 'bg-gray-900' 
        : 'bg-gray-50'
      }
    `}>
      {/* Header with Tabs */}
      <header className={`
        flex items-center border-b
        ${theme === 'dark' 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
        }
      `}>
        {/* Back Button */}
        <button
          onClick={onBack}
          className={`
            px-6 py-4 flex items-center gap-2 border-r
            transition-colors duration-200
            ${theme === 'dark'
              ? 'border-gray-700 hover:bg-gray-700 text-gray-300'
              : 'border-gray-200 hover:bg-gray-100 text-gray-700'
            }
          `}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Back</span>
        </button>

        {/* Tabs */}
        <div className="flex-1 flex items-center overflow-x-auto">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`
                group relative flex items-center gap-2 px-6 py-4 border-r cursor-pointer
                transition-colors duration-200
                ${activeTabId === tab.id
                  ? theme === 'dark'
                    ? 'bg-gray-700 border-gray-600'
                    : 'bg-gray-100 border-gray-300'
                  : theme === 'dark'
                    ? 'border-gray-700 hover:bg-gray-700/50'
                    : 'border-gray-200 hover:bg-gray-50'
                }
              `}
              onClick={() => setActiveTabId(tab.id)}
            >
              <span className={`
                font-medium
                ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
              `}>
                {tab.name}
              </span>
              
              {tab.items > 0 && (
                <span className={`
                  px-2 py-0.5 rounded-full text-xs font-medium
                  ${theme === 'dark'
                    ? 'bg-primary-600 text-white'
                    : 'bg-primary-500 text-white'
                  }
                `}>
                  {tab.items}
                </span>
              )}

              {/* Close Button */}
              {tabs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    closeTab(tab.id)
                  }}
                  className={`
                    ml-2 p-1 rounded opacity-0 group-hover:opacity-100
                    transition-opacity duration-200
                    ${theme === 'dark'
                      ? 'hover:bg-gray-600 text-gray-400'
                      : 'hover:bg-gray-200 text-gray-600'
                    }
                  `}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}

          {/* Add Tab Button */}
          <button
            onClick={addNewTab}
            className={`
              px-6 py-4 flex items-center gap-2
              transition-colors duration-200
              ${theme === 'dark'
                ? 'hover:bg-gray-700 text-gray-400'
                : 'hover:bg-gray-100 text-gray-600'
              }
            `}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="font-medium">New Tab</span>
          </button>
        </div>
      </header>

      {/* Main Content - Coming Soon Placeholder */}
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          {/* Icon */}
          <div className={`
            inline-flex items-center justify-center w-32 h-32 rounded-full mb-8
            ${theme === 'dark' 
              ? 'bg-gradient-to-br from-primary-600 to-primary-800' 
              : 'bg-gradient-to-br from-primary-500 to-primary-700'
            }
          `}>
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>

          {/* Title */}
          <h1 className={`
            text-4xl font-bold mb-4
            ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
          `}>
            Coming Soon
          </h1>

          {/* Description */}
          <p className={`
            text-lg mb-8
            ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
          `}>
            The Point of Sale interface is currently under development. This feature will allow you to:
          </p>

          {/* Features List */}
          <ul className={`
            text-left space-y-3 mb-8
            ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
          `}>
            <li className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Process sales transactions with multiple items</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Handle multiple transactions simultaneously with tabs</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Support both keyboard and touch input</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Apply discounts and calculate taxes automatically</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Print receipts and manage payments</span>
            </li>
          </ul>

          {/* Info Badge */}
          <div className={`
            inline-flex items-center gap-2 px-4 py-2 rounded-lg
            ${theme === 'dark'
              ? 'bg-blue-900/30 border border-blue-800 text-blue-300'
              : 'bg-blue-50 border border-blue-200 text-blue-700'
            }
          `}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">
              This feature will be implemented in the next phase
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`
        border-t px-6 py-4
        ${theme === 'dark' 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
        }
      `}>
        <div className="flex items-center justify-between">
          <p className={`
            text-sm
            ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
          `}>
            Active Tab: {tabs.find(t => t.id === activeTabId)?.name}
          </p>
          <p className={`
            text-sm
            ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
          `}>
            {tabs.length} tab{tabs.length === 1 ? '' : 's'} open
          </p>
        </div>
      </footer>
    </div>
  )
}

