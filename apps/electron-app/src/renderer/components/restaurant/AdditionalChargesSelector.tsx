import { useAppStore, useSettingsStore, usePOSStore } from '../../stores'
import { RightPanel } from '../common'
import type { AdditionalCharge } from '../../types/restaurant'

interface AdditionalChargesSelectorProps {
  isOpen: boolean
  onClose: () => void
}

export function AdditionalChargesSelector({ isOpen, onClose }: AdditionalChargesSelectorProps) {
  const { theme } = useAppStore()
  const { restaurant } = useSettingsStore()
  const { getActiveTransaction, addAdditionalCharge, removeAdditionalCharge } = usePOSStore()
  
  const transaction = getActiveTransaction()
  const orderType = transaction?.restaurantMetadata?.orderType
  const appliedCharges = transaction?.restaurantMetadata?.additionalCharges || []

  // Filter charges applicable to current order type
  const availableCharges = restaurant.additionalCharges.filter(charge => 
    charge.isActive && 
    orderType && 
    charge.applicableOrderTypes.includes(orderType)
  )

  const isChargeApplied = (chargeId: string) => {
    return appliedCharges.some(c => c.chargeId === chargeId)
  }

  const handleToggleCharge = (charge: AdditionalCharge) => {
    if (isChargeApplied(charge.id)) {
      removeAdditionalCharge(charge.id)
    } else {
      const amount = charge.isPercentage 
        ? (transaction?.subtotal || 0) * (charge.amount / 100)
        : charge.amount
      addAdditionalCharge(charge.id, charge.name, amount)
    }
  }

  const getChargeTypeIcon = (type: string) => {
    switch (type) {
      case 'parcel': return '📦'
      case 'delivery': return '🚚'
      case 'service': return '🔔'
      case 'packaging': return '📦'
      default: return '💰'
    }
  }

  return (
    <RightPanel isOpen={isOpen} onClose={onClose} title="Additional Charges" width="sm">
      <div className="space-y-4">
        {availableCharges.length > 0 ? (
          <div className="space-y-2">
            {availableCharges.map(charge => {
              const applied = isChargeApplied(charge.id)
              const displayAmount = charge.isPercentage 
                ? `${charge.amount}%`
                : `$${charge.amount.toFixed(2)}`

              return (
                <button
                  key={charge.id}
                  onClick={() => handleToggleCharge(charge)}
                  className={`
                    w-full p-4 rounded-lg border-2 transition-all duration-200
                    transform hover:scale-[1.02] active:scale-[0.98]
                    ${applied
                      ? theme === 'dark'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                        : 'bg-blue-50 border-blue-500 text-blue-600'
                      : theme === 'dark'
                        ? 'bg-gray-800/50 border-gray-600 hover:border-gray-500 text-gray-300'
                        : 'bg-white border-gray-300 hover:border-gray-400 text-gray-700'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getChargeTypeIcon(charge.type)}</span>
                      <div className="text-left">
                        <div className="font-semibold">{charge.name}</div>
                        {charge.description && (
                          <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {charge.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{displayAmount}</span>
                      {applied && (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <div className={`
            text-center py-12
            ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}
          `}>
            <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium">No charges available</p>
            <p className="text-xs mt-1">Configure charges in restaurant settings</p>
          </div>
        )}

        {/* Summary */}
        {appliedCharges.length > 0 && (
          <div className={`
            p-4 rounded-lg border-t-2
            ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}
          `}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Total Charges
              </span>
              <span className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                ${appliedCharges.reduce((sum, c) => sum + c.amount, 0).toFixed(2)}
              </span>
            </div>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
              {appliedCharges.length} {appliedCharges.length === 1 ? 'charge' : 'charges'} applied
            </p>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={onClose}
          className={`
            w-full px-6 py-3 rounded-lg font-semibold transition-colors
            bg-blue-600 hover:bg-blue-700 text-white
          `}
        >
          Done
        </button>
      </div>
    </RightPanel>
  )
}
