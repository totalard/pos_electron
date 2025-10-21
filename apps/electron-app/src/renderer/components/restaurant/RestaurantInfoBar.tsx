import { useAppStore, usePOSStore } from '../../stores'

interface RestaurantInfoBarProps {
  onChangeOrderType?: () => void
  onChangeTable?: () => void
}

export function RestaurantInfoBar({ onChangeOrderType, onChangeTable }: RestaurantInfoBarProps) {
  const { theme } = useAppStore()
  const { getActiveTransaction } = usePOSStore()
  
  const transaction = getActiveTransaction()
  const metadata = transaction?.restaurantMetadata

  if (!metadata) return null

  const getOrderTypeIcon = () => {
    switch (metadata.orderType) {
      case 'dine-in':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )
      case 'takeaway':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        )
      case 'delivery':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
        )
      case 'drive-thru':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        )
    }
  }

  const formatOrderType = (type: string) => {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  return (
    <div className={`
      px-4 py-3 border-b space-y-2
      ${theme === 'dark' ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50/50'}
    `}>
      {/* Order Type */}
      <button
        onClick={onChangeOrderType}
        className={`
          w-full flex items-center justify-between px-3 py-2 rounded-lg
          transition-colors
          ${theme === 'dark'
            ? 'bg-gray-700/50 hover:bg-gray-700 text-gray-300'
            : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
          }
        `}
      >
        <div className="flex items-center gap-2">
          {getOrderTypeIcon()}
          <span className="text-sm font-medium">
            {formatOrderType(metadata.orderType)}
          </span>
        </div>
        <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Table Info (for dine-in) */}
      {metadata.orderType === 'dine-in' && metadata.tableName && (
        <button
          onClick={onChangeTable}
          className={`
            w-full flex items-center justify-between px-3 py-2 rounded-lg
            transition-colors
            ${theme === 'dark'
              ? 'bg-gray-700/50 hover:bg-gray-700 text-gray-300'
              : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
            }
          `}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <div className="text-left">
              <span className="text-sm font-medium block">
                {metadata.tableName}
              </span>
              {metadata.floorName && (
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                  {metadata.floorName}
                </span>
              )}
            </div>
          </div>
          <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Guest Count */}
      {metadata.guestCount && (
        <div className={`
          flex items-center gap-2 px-3 py-2 rounded-lg text-sm
          ${theme === 'dark' ? 'bg-gray-700/30 text-gray-400' : 'bg-gray-100 text-gray-600'}
        `}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>{metadata.guestCount} {metadata.guestCount === 1 ? 'Guest' : 'Guests'}</span>
        </div>
      )}
    </div>
  )
}
