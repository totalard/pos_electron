import { ReactNode } from 'react'
import { useAppStore } from '../../stores'
import { IconButton } from '../common'
import { useElapsedTime } from '../../hooks'

/**
 * Tab interface
 */
export interface Tab {
  id: string
  name: string
  icon?: ReactNode
  badge?: string | number
  createdAt?: Date
}

/**
 * TabItem component for individual tab rendering with elapsed time
 */
function TabItem({ 
  tab, 
  isActive, 
  theme, 
  canClose, 
  onTabChange, 
  onTabClose 
}: { 
  tab: Tab
  isActive: boolean
  theme: 'light' | 'dark'
  canClose: boolean
  onTabChange: (tabId: string) => void
  onTabClose?: (tabId: string) => void
}) {
  const elapsedTime = useElapsedTime(tab.createdAt || null)

  return (
    <div
      key={tab.id}
      className={`
        group relative flex items-center gap-2 px-4 py-2 rounded-lg
        min-h-[44px] min-w-[140px]
        transition-all duration-300 ease-out
        transform hover:scale-105 active:scale-95
        ${isActive
          ? theme === 'dark'
            ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
            : 'bg-primary-500 text-white shadow-lg shadow-primary-400/30'
          : theme === 'dark'
            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:shadow-md'
            : 'bg-white text-gray-700 hover:bg-gray-100 hover:shadow-md'
        }
      `}
    >
      {/* Tab button */}
      <button
        onClick={() => onTabChange(tab.id)}
        className="flex flex-col gap-0.5 flex-1 min-w-0 text-left"
      >
        <div className="flex items-center gap-2">
          {tab.icon && <span className="flex-shrink-0 transition-transform group-hover:scale-110">{tab.icon}</span>}
          <span className="font-medium truncate">{tab.name}</span>
          {tab.badge && (
            <span className={`
              px-2 py-0.5 rounded-full text-xs font-medium
              transition-all duration-200
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
        </div>
        {/* Elapsed Time */}
        {elapsedTime && (
          <span className={`
            text-xs font-mono
            transition-opacity duration-200
            ${isActive
              ? 'text-white/80'
              : theme === 'dark'
                ? 'text-gray-400'
                : 'text-gray-500'
            }
          `}>
            {elapsedTime}
          </span>
        )}
      </button>

      {/* Close button */}
      {canClose && onTabClose && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onTabClose(tab.id)
          }}
          className={`
            p-1 rounded transition-all duration-200
            hover:bg-white/20 hover:rotate-90
            active:scale-90
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
      transition-colors duration-200
      ${theme === 'dark' ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50'}
    `}>
      {/* Tabs */}
      {tabs.map((tab) => (
        <TabItem
          key={tab.id}
          tab={tab}
          isActive={tab.id === activeTabId}
          theme={theme}
          canClose={canClose(tab.id)}
          onTabChange={onTabChange}
          onTabClose={onTabClose}
        />
      ))}

      {/* Add Tab Button */}
      {onAddTab && (
        <div className="transition-transform duration-200 hover:scale-110 active:scale-95">
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
        </div>
      )}
    </div>
  )
}

