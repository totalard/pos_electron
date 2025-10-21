import { useAppStore, useSettingsStore, usePOSStore } from '../../stores'
import { RightPanel } from '../common'
import type { OrderType } from '../../types/restaurant'

interface OrderTypeSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectOrderType: (orderType: OrderType) => void
}

export function OrderTypeSelector({ isOpen, onClose, onSelectOrderType }: OrderTypeSelectorProps) {
  const { theme } = useAppStore()
  const { restaurant } = useSettingsStore()
  const { getActiveTransaction } = usePOSStore()
  
  const transaction = getActiveTransaction()
  const currentOrderType = transaction?.restaurantMetadata?.orderType

  const orderTypes: Array<{
    type: OrderType
    label: string
    icon: JSX.Element
    enabled: boolean
    description: string
  }> = [
    {
      type: 'dine-in',
      label: 'Dine In',
      enabled: restaurant.enableDineIn,
      description: 'Customer dining at the restaurant',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      type: 'takeaway',
      label: 'Takeaway',
      enabled: restaurant.enableTakeaway,
      description: 'Customer picks up the order',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      )
    },
    {
      type: 'delivery',
      label: 'Delivery',
      enabled: restaurant.enableDelivery,
      description: 'Order delivered to customer',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      )
    },
    {
      type: 'drive-thru',
      label: 'Drive Thru',
      enabled: restaurant.enableDriveThru,
      description: 'Customer picks up from vehicle',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      )
    }
  ]

  const enabledOrderTypes = orderTypes.filter(ot => ot.enabled)

  const handleSelect = (orderType: OrderType) => {
    onSelectOrderType(orderType)
    onClose()
  }

  return (
    <RightPanel isOpen={isOpen} onClose={onClose} title="Select Order Type" width="sm">
      <div className="space-y-4">
        {enabledOrderTypes.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {enabledOrderTypes.map(orderType => (
              <button
                key={orderType.type}
                onClick={() => handleSelect(orderType.type)}
                className={`
                  p-6 rounded-xl border-2 transition-all duration-200
                  flex flex-col items-center text-center gap-3
                  transform hover:scale-105 active:scale-95
                  ${currentOrderType === orderType.type
                    ? theme === 'dark'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                      : 'bg-blue-50 border-blue-500 text-blue-600'
                    : theme === 'dark'
                      ? 'bg-gray-800/50 border-gray-600 hover:border-gray-500 text-gray-300'
                      : 'bg-white border-gray-300 hover:border-gray-400 text-gray-700'
                  }
                `}
              >
                <div className={`
                  p-3 rounded-full
                  ${currentOrderType === orderType.type
                    ? theme === 'dark'
                      ? 'bg-blue-600'
                      : 'bg-blue-500 text-white'
                    : theme === 'dark'
                      ? 'bg-gray-700'
                      : 'bg-gray-200'
                  }
                `}>
                  {orderType.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    {orderType.label}
                  </h3>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {orderType.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className={`
            text-center py-12
            ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}
          `}>
            <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium">No order types enabled</p>
            <p className="text-xs mt-1">Enable order types in restaurant settings</p>
          </div>
        )}
      </div>
    </RightPanel>
  )
}
