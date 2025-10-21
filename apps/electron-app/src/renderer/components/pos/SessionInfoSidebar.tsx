import { useAppStore, useSessionStore, usePinStore } from '../../stores'
import { Sidebar } from '../common'
import { Button } from '../common'

interface SessionInfoSidebarProps {
  isOpen: boolean
  onClose: () => void
  onCloseSession: () => void
}

/**
 * SessionInfoSidebar - Displays current session information with close session option
 * 
 * Features:
 * - Shows session number, opening cash, and user info
 * - Displays session statistics (sales, cash in/out)
 * - Close session button that triggers PIN confirmation
 */
export function SessionInfoSidebar({
  isOpen,
  onClose,
  onCloseSession
}: SessionInfoSidebarProps) {
  const { theme } = useAppStore()
  const { activeSession } = useSessionStore()
  const { currentUser } = usePinStore()

  if (!activeSession) return null

  const handleCloseSessionClick = () => {
    onClose() // Close sidebar first
    onCloseSession() // Trigger PIN confirmation
  }

  // Calculate session duration
  const sessionStart = new Date(activeSession.opened_at)
  const now = new Date()
  const durationMs = now.getTime() - sessionStart.getTime()
  const hours = Math.floor(durationMs / (1000 * 60 * 60))
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))

  return (
    <Sidebar
      isOpen={isOpen}
      onClose={onClose}
      title="Session Information"
      width="md"
      contentVariant="default"
    >
      <div className="space-y-6">
        {/* Session Details Card */}
        <div className={`
          p-6 rounded-xl border
          ${theme === 'dark'
            ? 'bg-gray-700/30 border-gray-600'
            : 'bg-gray-50 border-gray-200'
          }
        `}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`
              p-3 rounded-lg
              ${theme === 'dark' ? 'bg-primary-900/30' : 'bg-primary-100'}
            `}>
              <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Session {activeSession.session_number}
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Active Session
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Cashier
              </span>
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {currentUser?.full_name || 'Unknown'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Started At
              </span>
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {sessionStart.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Duration
              </span>
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {hours}h {minutes}m
              </span>
            </div>

            <div className={`
              pt-3 mt-3 border-t flex justify-between items-center
              ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}
            `}>
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Opening Cash
              </span>
              <span className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                ${activeSession.opening_cash.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Session Statistics */}
        <div>
          <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Session Statistics
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {/* Total Sales */}
            <div className={`
              p-4 rounded-lg border
              ${theme === 'dark'
                ? 'bg-gray-700/50 border-gray-600'
                : 'bg-white border-gray-200'
              }
            `}>
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className={`text-xs uppercase ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Sales
                </span>
              </div>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                ${activeSession.total_sales.toFixed(2)}
              </p>
            </div>

            {/* Cash In */}
            <div className={`
              p-4 rounded-lg border
              ${theme === 'dark'
                ? 'bg-gray-700/50 border-gray-600'
                : 'bg-white border-gray-200'
              }
            `}>
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className={`text-xs uppercase ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Cash In
                </span>
              </div>
              <p className={`text-xl font-bold text-green-500`}>
                +${activeSession.total_cash_in.toFixed(2)}
              </p>
            </div>

            {/* Cash Out */}
            <div className={`
              p-4 rounded-lg border
              ${theme === 'dark'
                ? 'bg-gray-700/50 border-gray-600'
                : 'bg-white border-gray-200'
              }
            `}>
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
                <span className={`text-xs uppercase ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Cash Out
                </span>
              </div>
              <p className={`text-xl font-bold text-red-500`}>
                -${activeSession.total_cash_out.toFixed(2)}
              </p>
            </div>

            {/* Expected Cash */}
            <div className={`
              p-4 rounded-lg border
              ${theme === 'dark'
                ? 'bg-gray-700/50 border-gray-600'
                : 'bg-white border-gray-200'
              }
            `}>
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className={`text-xs uppercase ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Expected Cash
                </span>
              </div>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                ${(activeSession.opening_cash + activeSession.total_sales + activeSession.total_cash_in - activeSession.total_cash_out).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Session Status */}
        <div className={`
          p-4 rounded-lg border
          ${theme === 'dark'
            ? 'bg-green-900/20 border-green-700'
            : 'bg-green-50 border-green-200'
          }
        `}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-700'}`}>
              Session is currently active
            </span>
          </div>
        </div>

        {/* Close Session Button */}
        <div className={`
          p-6 rounded-xl border-2 border-dashed
          ${theme === 'dark'
            ? 'bg-red-900/10 border-red-700'
            : 'bg-red-50 border-red-300'
          }
        `}>
          <div className="flex items-start gap-3 mb-4">
            <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h4 className={`text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-red-400' : 'text-red-700'}`}>
                Close Session
              </h4>
              <p className={`text-xs ${theme === 'dark' ? 'text-red-300' : 'text-red-600'}`}>
                Closing the session will require PIN verification and cash counting. This action will end your current session.
              </p>
            </div>
          </div>
          <Button
            variant="danger"
            onClick={handleCloseSessionClick}
            className="w-full"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Close Session
          </Button>
        </div>
      </div>
    </Sidebar>
  )
}
