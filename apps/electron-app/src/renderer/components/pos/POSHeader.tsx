import { ReactNode } from 'react'
import { useAppStore } from '../../stores'
import { usePinStore } from '../../stores'
import { TabBar, Tab } from './TabBar'
import { Avatar } from '../common'

/**
 * POSHeader component props
 */
export interface POSHeaderProps {
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
  /** Minimum number of tabs */
  minTabs?: number
  /** Additional actions to display in header */
  actions?: ReactNode
}

/**
 * Professional POS Header component with tab support, user info, and system status
 * 
 * @example
 * ```tsx
 * <POSHeader
 *   tabs={tabs}
 *   activeTabId={activeTabId}
 *   onTabChange={setActiveTabId}
 *   onTabClose={handleCloseTab}
 *   onAddTab={handleAddTab}
 *   closeable
 * />
 * ```
 */
export function POSHeader({
  tabs,
  activeTabId,
  onTabChange,
  onTabClose,
  onAddTab,
  closeable = false,
  minTabs = 1,
  actions
}: POSHeaderProps) {
  const { theme } = useAppStore()
  const { currentUser } = usePinStore()

  // Get current date and time
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  })
  const timeStr = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit'
  })

  // Get avatar color based on user's avatar_color
  const getAvatarColor = (): 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'cyan' | 'indigo' | 'red' | 'teal' | 'amber' => {
    if (currentUser?.avatar_color) {
      return currentUser.avatar_color as any
    }
    return 'blue'
  }

  return (
    <div className={`
      flex flex-col border-b
      ${theme === 'dark' 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
      }
    `}>
      {/* Top Bar - User Info, Date/Time, Status */}
      <div className={`
        flex items-center justify-between px-4 py-2 border-b
        ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
      `}>
        {/* Left: User Info */}
        <div className="flex items-center gap-3">
          {currentUser && (
            <>
              <Avatar
                name={currentUser.full_name}
                color={getAvatarColor()}
                size="sm"
              />
              <div className="flex flex-col">
                <span className={`
                  text-sm font-semibold
                  ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
                `}>
                  {currentUser.full_name}
                </span>
                <span className={`
                  text-xs
                  ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                `}>
                  {currentUser.role === 'admin' ? 'Administrator' : 'User'}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Center: Date & Time */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <svg className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className={`
              text-sm font-medium
              ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
            `}>
              {dateStr}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <svg className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className={`
              text-sm font-medium
              ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
            `}>
              {timeStr}
            </span>
          </div>
        </div>

        {/* Right: Connection Status & Actions */}
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className={`
              text-xs font-medium
              ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
            `}>
              Online
            </span>
          </div>

          {/* Additional Actions */}
          {actions}
        </div>
      </div>

      {/* Bottom Bar - Tabs */}
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabChange={onTabChange}
        onTabClose={onTabClose}
        onAddTab={onAddTab}
        closeable={closeable}
        minTabs={minTabs}
      />
    </div>
  )
}

