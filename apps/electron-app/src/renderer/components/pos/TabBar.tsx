import { ReactNode } from 'react'
import { useAppStore } from '../../stores'
import { IconButton } from '../common'

/**
 * Tab interface
 */
export interface Tab {
  id: string
  name: string
  icon?: ReactNode
  badge?: string | number
}

/**
 * TabBar component props
 */
export interface TabBarProps {
  /** Array of tabs */
  tabs: Tab[]
  /** Active tab ID */
  activeTabId: string
  /** Tab change handler */
  onTabChange: (tabId: string) => void
  /** Tab close handler */
  onTabClose?: (tabId: string) => void
  /** Add tab handler */
  onAddTab?: () => void
  /** Allow closing tabs */
  closeable?: boolean
  /** Minimum number of tabs (prevent closing below this) */
  minTabs?: number
}

/**
 * Reusable TabBar component for multi-tab interfaces
 * 
 * @example
 * ```tsx
 * <TabBar
 *   tabs={tabs}
 *   activeTabId={activeTabId}
 *   onTabChange={setActiveTabId}
 *   onTabClose={handleCloseTab}
 *   onAddTab={handleAddTab}
 *   closeable
 * />
 * ```
 */
export function TabBar({
  tabs,
  activeTabId,
  onTabChange,
  onTabClose,
  onAddTab,
  closeable = false,
  minTabs = 1
}: TabBarProps) {
  const { theme } = useAppStore()

  const canClose = (tabId: string) => {
    return closeable && tabs.length > minTabs
  }

  return (
    <div className={`
      flex items-center gap-2 px-4 py-2 border-b overflow-x-auto
      ${theme === 'dark' ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50'}
    `}>
      {/* Tabs */}
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId

        return (
          <div
            key={tab.id}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg
              min-h-[44px] min-w-[120px]
              transition-all duration-200
              ${isActive
                ? theme === 'dark'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-primary-500 text-white shadow-md'
                : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            {/* Tab button */}
            <button
              onClick={() => onTabChange(tab.id)}
              className="flex items-center gap-2 flex-1 min-w-0"
            >
              {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
              <span className="font-medium truncate">{tab.name}</span>
              {tab.badge && (
                <span className={`
                  px-2 py-0.5 rounded-full text-xs font-medium
                  ${isActive
                    ? 'bg-white/20 text-white'
                    : theme === 'dark'
                      ? 'bg-gray-600 text-gray-300'
                      : 'bg-gray-200 text-gray-700'
                  }
                `}>
                  {tab.badge}
                </span>
              )}
            </button>

            {/* Close button */}
            {canClose(tab.id) && onTabClose && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onTabClose(tab.id)
                }}
                className={`
                  p-1 rounded hover:bg-white/20 transition-colors
                  min-w-[24px] min-h-[24px]
                `}
                aria-label={`Close ${tab.name}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )
      })}

      {/* Add Tab Button */}
      {onAddTab && (
        <IconButton
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
          label="Add tab"
          onClick={onAddTab}
          variant="ghost"
          size="sm"
        />
      )}
    </div>
  )
}

