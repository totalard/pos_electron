import { ReactNode } from 'react'
import { useAppStore, useSessionStore } from '../../stores'
import { usePinStore } from '../../stores'
import { TabBar, Tab } from './TabBar'
import { Avatar, Button, ThemeToggle } from '../common'

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
  /** Session info click handler - opens sidebar */
  onSessionInfoClick?: () => void
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
  onSessionInfoClick
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
      {/* Top Bar - Logo, Session Info, User Info, Actions */}
      <div className={`
        flex items-center justify-between px-4 py-2 border-b
        ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
      `}>
        {/* Left: Creative Logo */}
        <div className="flex items-center gap-3">
          <div className={`
            flex items-center gap-2 px-3 py-1.5 rounded-lg
            ${theme === 'dark' 
              ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30' 
              : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200'
            }
          `}>
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <div className="flex flex-col">
              <span className={`
                text-sm font-bold tracking-tight leading-none
                ${theme === 'dark' 
                  ? 'bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
                }
              `}>
                MIDLOGIC
              </span>
              <span className={`
                text-[10px] font-semibold tracking-wider
                ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
              `}>
                POS SYSTEM
              </span>
            </div>
          </div>
        </div>

        {/* Right: Session Info, User Info, Theme Toggle, Actions */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Session Info - Clickable */}
          {activeSession && (
            <button
              onClick={onSessionInfoClick}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all
                ${theme === 'dark' 
                  ? 'bg-primary-900/30 border border-primary-700 hover:bg-primary-900/50 hover:border-primary-600' 
                  : 'bg-primary-50 border border-primary-200 hover:bg-primary-100 hover:border-primary-300'
                }
                cursor-pointer active:scale-95
              `}
              aria-label="View session information"
            >
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
              <svg className="w-3 h-3 text-primary-500 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* User Info - Right Aligned */}
          {currentUser && (
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-end">
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
              <Avatar
                name={currentUser.full_name}
                color={getAvatarColor()}
                size="sm"
              />
            </div>
          )}

          {/* Theme Toggle */}
          <ThemeToggle size="sm" />

          {/* Close POS Button (X) */}
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

