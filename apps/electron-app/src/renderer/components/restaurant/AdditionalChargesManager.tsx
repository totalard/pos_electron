import { useState } from 'react'
import { useAppStore, useSettingsStore } from '../../stores'
import { RightPanel } from '../common'
import { NumberInput } from '../forms'
import type { AdditionalCharge, ChargeType, OrderType } from '../../types/restaurant'

interface AdditionalChargesManagerProps {
  isOpen: boolean
  onClose: () => void
}

export function AdditionalChargesManager({ isOpen, onClose }: AdditionalChargesManagerProps) {
  const { theme } = useAppStore()
  const { restaurant, updateRestaurantSettings } = useSettingsStore()
  
  const [showChargeDialog, setShowChargeDialog] = useState(false)
  const [editingCharge, setEditingCharge] = useState<AdditionalCharge | null>(null)

  const handleAddCharge = () => {
    setEditingCharge(null)
    setShowChargeDialog(true)
  }

  const handleEditCharge = (charge: AdditionalCharge) => {
    setEditingCharge(charge)
    setShowChargeDialog(true)
  }

  const handleSaveCharge = (chargeData: Partial<AdditionalCharge>) => {
    if (editingCharge) {
      // Update existing charge
      const updatedCharges = restaurant.additionalCharges.map(c =>
        c.id === editingCharge.id ? { ...c, ...chargeData } : c
      )
      updateRestaurantSettings({ additionalCharges: updatedCharges })
    } else {
      // Add new charge
      const newCharge: AdditionalCharge = {
        id: `charge-${Date.now()}`,
        type: chargeData.type || 'custom',
        name: chargeData.name || 'New Charge',
        amount: chargeData.amount || 0,
        isPercentage: chargeData.isPercentage || false,
        isOptional: chargeData.isOptional !== undefined ? chargeData.isOptional : true,
        applicableOrderTypes: chargeData.applicableOrderTypes || ['dine-in', 'takeaway', 'delivery', 'drive-thru'],
        isActive: chargeData.isActive !== undefined ? chargeData.isActive : true,
        description: chargeData.description
      }
      updateRestaurantSettings({ additionalCharges: [...restaurant.additionalCharges, newCharge] })
    }
    setShowChargeDialog(false)
  }

  const handleDeleteCharge = (chargeId: string) => {
    if (confirm('Are you sure you want to delete this charge?')) {
      const updatedCharges = restaurant.additionalCharges.filter(c => c.id !== chargeId)
      updateRestaurantSettings({ additionalCharges: updatedCharges })
    }
  }

  const handleToggleActive = (chargeId: string, isActive: boolean) => {
    const updatedCharges = restaurant.additionalCharges.map(c =>
      c.id === chargeId ? { ...c, isActive } : c
    )
    updateRestaurantSettings({ additionalCharges: updatedCharges })
  }

  const getChargeTypeIcon = (type: ChargeType) => {
    switch (type) {
      case 'parcel':
        return '📦'
      case 'delivery':
        return '🚚'
      case 'service':
        return '🔔'
      case 'packaging':
        return '📦'
      case 'custom':
        return '💰'
      default:
        return '💵'
    }
  }

  const getChargeTypeColor = (type: ChargeType) => {
    switch (type) {
      case 'parcel':
        return theme === 'dark' ? 'bg-orange-600/20 border-orange-600' : 'bg-orange-50 border-orange-300'
      case 'delivery':
        return theme === 'dark' ? 'bg-blue-600/20 border-blue-600' : 'bg-blue-50 border-blue-300'
      case 'service':
        return theme === 'dark' ? 'bg-green-600/20 border-green-600' : 'bg-green-50 border-green-300'
      case 'packaging':
        return theme === 'dark' ? 'bg-purple-600/20 border-purple-600' : 'bg-purple-50 border-purple-300'
      case 'custom':
        return theme === 'dark' ? 'bg-gray-600/20 border-gray-600' : 'bg-gray-50 border-gray-300'
      default:
        return theme === 'dark' ? 'bg-gray-600/20 border-gray-600' : 'bg-gray-50 border-gray-300'
    }
  }

  return (
    <>
      <RightPanel isOpen={isOpen} onClose={onClose} title="Additional Charges Manager" width="lg">
        <div className="p-6 space-y-4 overflow-y-auto h-full">
          {/* Header with Add Button */}
          <div className="flex items-center justify-between">
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage additional charges for different order types
            </p>
            <button
              onClick={handleAddCharge}
              className={`
                px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2
                ${theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
                }
              `}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Charge
            </button>
          </div>

          {/* Charges List */}
          <div className="space-y-3">
            {restaurant.additionalCharges.length > 0 ? (
              restaurant.additionalCharges.map(charge => (
                <div
                  key={charge.id}
                  className={`
                    p-4 rounded-lg border-2 transition-all
                    ${getChargeTypeColor(charge.type)}
                    ${!charge.isActive && 'opacity-50'}
                  `}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-3xl">{getChargeTypeIcon(charge.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {charge.name}
                          </h4>
                          <span className={`
                            px-2 py-0.5 rounded text-xs font-medium capitalize
                            ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}
                          `}>
                            {charge.type}
                          </span>
                          {charge.isOptional && (
                            <span className={`
                              px-2 py-0.5 rounded text-xs font-medium
                              ${theme === 'dark' ? 'bg-yellow-600/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'}
                            `}>
                              Optional
                            </span>
                          )}
                        </div>
                        
                        <div className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {charge.isPercentage ? `${charge.amount}%` : `₹${charge.amount}`}
                        </div>

                        {charge.description && (
                          <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {charge.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2">
                          {charge.applicableOrderTypes.map(orderType => (
                            <span
                              key={orderType}
                              className={`
                                px-2 py-1 rounded text-xs font-medium capitalize
                                ${theme === 'dark' ? 'bg-blue-600/30 text-blue-400' : 'bg-blue-100 text-blue-800'}
                              `}
                            >
                              {orderType.replace('-', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleToggleActive(charge.id, !charge.isActive)}
                        className={`
                          px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                          ${charge.isActive
                            ? theme === 'dark'
                              ? 'bg-green-600 hover:bg-green-500 text-white'
                              : 'bg-green-500 hover:bg-green-600 text-white'
                            : theme === 'dark'
                              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                              : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                          }
                        `}
                      >
                        {charge.isActive ? 'Active' : 'Inactive'}
                      </button>
                      <button
                        onClick={() => handleEditCharge(charge)}
                        className={`
                          px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                          ${theme === 'dark'
                            ? 'bg-blue-600 hover:bg-blue-500 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                          }
                        `}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCharge(charge.id)}
                        className={`
                          px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                          ${theme === 'dark'
                            ? 'bg-red-600 hover:bg-red-500 text-white'
                            : 'bg-red-500 hover:bg-red-600 text-white'
                          }
                        `}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={`
                text-center py-12 rounded-lg border-2 border-dashed
                ${theme === 'dark' ? 'border-gray-700 bg-gray-800/30' : 'border-gray-300 bg-gray-50'}
              `}>
                <svg className={`w-16 h-16 mx-auto mb-4 opacity-50 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  No additional charges configured
                </p>
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-500'}`}>
                  Click "Add Charge" to create one
                </p>
              </div>
            )}
          </div>
        </div>
      </RightPanel>

      {/* Charge Dialog */}
      {showChargeDialog && (
        <ChargeDialog
          isOpen={showChargeDialog}
          onClose={() => setShowChargeDialog(false)}
          onSave={handleSaveCharge}
          charge={editingCharge}
        />
      )}
    </>
  )
}

// Charge Dialog Component
interface ChargeDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (charge: Partial<AdditionalCharge>) => void
  charge: AdditionalCharge | null
}

function ChargeDialog({ isOpen, onClose, onSave, charge }: ChargeDialogProps) {
  const { theme } = useAppStore()
  const [name, setName] = useState(charge?.name || '')
  const [type, setType] = useState<ChargeType>(charge?.type || 'custom')
  const [amount, setAmount] = useState(charge?.amount || 0)
  const [isPercentage, setIsPercentage] = useState(charge?.isPercentage || false)
  const [isOptional, setIsOptional] = useState(charge?.isOptional !== undefined ? charge.isOptional : true)
  const [description, setDescription] = useState(charge?.description || '')
  const [applicableOrderTypes, setApplicableOrderTypes] = useState<OrderType[]>(
    charge?.applicableOrderTypes || ['dine-in', 'takeaway', 'delivery', 'drive-thru']
  )

  const chargeTypes: { value: ChargeType; label: string; icon: string }[] = [
    { value: 'parcel', label: 'Parcel', icon: '📦' },
    { value: 'delivery', label: 'Delivery', icon: '🚚' },
    { value: 'service', label: 'Service', icon: '🔔' },
    { value: 'packaging', label: 'Packaging', icon: '📦' },
    { value: 'custom', label: 'Custom', icon: '💰' }
  ]

  const orderTypes: { value: OrderType; label: string }[] = [
    { value: 'dine-in', label: 'Dine In' },
    { value: 'takeaway', label: 'Takeaway' },
    { value: 'delivery', label: 'Delivery' },
    { value: 'drive-thru', label: 'Drive Thru' }
  ]

  const toggleOrderType = (orderType: OrderType) => {
    if (applicableOrderTypes.includes(orderType)) {
      setApplicableOrderTypes(applicableOrderTypes.filter(t => t !== orderType))
    } else {
      setApplicableOrderTypes([...applicableOrderTypes, orderType])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      alert('Charge name is required')
      return
    }
    if (amount < 0) {
      alert('Amount must be positive')
      return
    }
    if (applicableOrderTypes.length === 0) {
      alert('Select at least one order type')
      return
    }
    onSave({
      name: name.trim(),
      type,
      amount,
      isPercentage,
      isOptional,
      description: description.trim() || undefined,
      applicableOrderTypes
    })
  }

  return (
    <RightPanel isOpen={isOpen} onClose={onClose} title={charge ? 'Edit Charge' : 'Add Charge'} width="md">
      <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto h-full">
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Charge Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            placeholder="e.g., Parcel Charge, Delivery Fee"
            required
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Charge Type *
          </label>
          <div className="grid grid-cols-5 gap-2">
            {chargeTypes.map(ct => (
              <button
                key={ct.value}
                type="button"
                onClick={() => setType(ct.value)}
                className={`
                  p-3 rounded-lg border-2 transition-all text-center
                  ${type === ct.value
                    ? theme === 'dark'
                      ? 'border-blue-500 bg-blue-600/20'
                      : 'border-blue-500 bg-blue-50'
                    : theme === 'dark'
                      ? 'border-gray-600 hover:border-gray-500'
                      : 'border-gray-300 hover:border-gray-400'
                  }
                `}
              >
                <div className="text-2xl mb-1">{ct.icon}</div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {ct.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <NumberInput
            label="Amount *"
            value={amount}
            onChange={(value) => setAmount(value)}
            min={0}
            step={0.01}
            allowDecimal
            decimalPlaces={2}
            showButtons
            fullWidth
          />

          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Type
            </label>
            <div className="flex gap-2 h-[42px]">
              <button
                type="button"
                onClick={() => setIsPercentage(false)}
                className={`
                  flex-1 px-4 py-2 rounded-lg font-medium transition-colors
                  ${!isPercentage
                    ? theme === 'dark'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500 text-white'
                    : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }
                `}
              >
                Fixed (₹)
              </button>
              <button
                type="button"
                onClick={() => setIsPercentage(true)}
                className={`
                  flex-1 px-4 py-2 rounded-lg font-medium transition-colors
                  ${isPercentage
                    ? theme === 'dark'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500 text-white'
                    : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }
                `}
              >
                Percentage (%)
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            placeholder="Optional description"
            rows={2}
          />
        </div>

        <div>
          <label className={`flex items-center gap-2 cursor-pointer`}>
            <input
              type="checkbox"
              checked={isOptional}
              onChange={(e) => setIsOptional(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Optional (can be removed from order)
            </span>
          </label>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Applicable Order Types *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {orderTypes.map(ot => (
              <button
                key={ot.value}
                type="button"
                onClick={() => toggleOrderType(ot.value)}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-all
                  ${applicableOrderTypes.includes(ot.value)
                    ? theme === 'dark'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500 text-white'
                    : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }
                `}
              >
                {ot.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t mt-6">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-lg font-medium ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-4 py-2 rounded-lg font-medium ${
              theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {charge ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </RightPanel>
  )
}
