import { ReactNode } from 'react'
import { useAppStore, useSessionStore } from '../../stores'
import { usePinStore } from '../../stores'
import { TabBar, Tab } from './TabBar'
import { Avatar, Button, InternetStatusIndicator } from '../common'

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
  /** Close session handler */
  onCloseSession?: () => void
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
  actions,
  onCloseSession
}: POSHeaderProps) {
  const { theme } = useAppStore()
  const { currentUser } = usePinStore()
  const { activeSession } = useSessionStore()

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

        {/* Center: Session Info */}
        <div className="flex items-center gap-6">
          {/* Session Info */}
          {activeSession && (
            <div className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg
              ${theme === 'dark' ? 'bg-primary-900/30 border border-primary-700' : 'bg-primary-50 border border-primary-200'}
            `}>
              <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex flex-col">
                <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-primary-400' : 'text-primary-700'}`}>
                  Session: {activeSession.session_number}
                </span>
                <span className={`text-xs ${theme === 'dark' ? 'text-primary-500' : 'text-primary-600'}`}>
                  Opening: ${activeSession.opening_cash.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Connection Status & Actions */}
        <div className="flex items-center gap-4">
          {/* Internet Connection Status */}
          <InternetStatusIndicator showLabel={true} size="sm" />

          {/* Close Session Button */}
          {activeSession && onCloseSession && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onCloseSession}
              className="text-xs"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Close Session
            </Button>
          )}

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

