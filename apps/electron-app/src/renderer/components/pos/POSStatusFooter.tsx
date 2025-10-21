import { useState, useEffect } from 'react'
import { useAppStore } from '../../stores'
import { useInternetConnection } from '../../hooks'

export interface POSStatusFooterProps {
  className?: string
}

/**
 * POS Status Footer - Displays system info, printer status, date/time
 * Fixed height of 40px with compact design
 */
export function POSStatusFooter({ className = '' }: POSStatusFooterProps) {
  const { theme } = useAppStore()
  const { isOnline } = useInternetConnection()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [systemInfo, setSystemInfo] = useState({
    platform: 'Unknown',
    memory: 'N/A'
  })

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Get system information
  useEffect(() => {
    const getSystemInfo = () => {
      const platform = navigator.platform || 'Unknown'
      const memory = (navigator as any).deviceMemory 
        ? `${(navigator as any).deviceMemory}GB RAM` 
        : 'N/A'
      
      setSystemInfo({ platform, memory })
    }
    
    getSystemInfo()
  }, [])

  const dateStr = currentTime.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric'
  })
  
  const timeStr = currentTime.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  })

  // Mock printer status - in production, this would check actual printer connection
  const printerStatus = 'Ready'
  const printerConnected = true

  return (
    <div className={`
      h-10 px-4 flex items-center justify-between border-t
      ${theme === 'dark' 
        ? 'bg-gray-900 border-gray-700' 
        : 'bg-gray-50 border-gray-200'
      }
      ${className}
    `}>
      {/* Left: System Info */}
      <div className="flex items-center gap-4">
        {/* Hardware Info */}
        <div className="flex items-center gap-2">
          <svg className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className={`text-xs font-mono ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {systemInfo.platform}
          </span>
        </div>

        {/* Memory */}
        {systemInfo.memory !== 'N/A' && (
          <div className="flex items-center gap-2">
            <svg className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            <span className={`text-xs font-mono ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {systemInfo.memory}
            </span>
          </div>
        )}

        {/* Printer Status */}
        <div className="flex items-center gap-2">
          <svg 
            className={`w-3.5 h-3.5 ${printerConnected 
              ? (theme === 'dark' ? 'text-green-400' : 'text-green-600') 
              : (theme === 'dark' ? 'text-red-400' : 'text-red-600')
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          <span className={`text-xs font-mono ${
            printerConnected 
              ? (theme === 'dark' ? 'text-green-400' : 'text-green-600')
              : (theme === 'dark' ? 'text-red-400' : 'text-red-600')
          }`}>
            {printerStatus}
          </span>
        </div>

        {/* Internet Status */}
        <div className="flex items-center gap-2">
          {isOnline ? (
            <>
              <svg className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>
              <span className={`text-xs font-mono ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                Online
              </span>
            </>
          ) : (
            <>
              <svg className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3" />
              </svg>
              <span className={`text-xs font-mono ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                Offline
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right: Date & Time */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <svg className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className={`text-xs font-mono ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {dateStr}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <svg className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className={`text-xs font-mono font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
            {timeStr}
          </span>
        </div>
      </div>
    </div>
  )
}
