import { useAppStore } from '../../stores'
import { Button, Badge, CurrencyDisplay } from '../common'
import type { Customer } from '../../services/api'

interface CustomerCardProps {
  customer: Customer
  viewMode: 'tile' | 'grid'
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}

export function CustomerCard({ customer, viewMode, onView, onEdit, onDelete }: CustomerCardProps) {
  const { theme } = useAppStore()

  // Get credit status color
  const getCreditStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'exceeded':
        return 'bg-orange-500'
      case 'blocked':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  // Get credit status text
  const getCreditStatusText = (status: string) => {
    switch (status) {
      case 'good':
        return 'Good Standing'
      case 'warning':
        return 'Near Limit'
      case 'exceeded':
        return 'Limit Exceeded'
      case 'blocked':
        return 'Blocked'
      default:
        return status
    }
  }

  if (viewMode === 'grid') {
    // Grid view - compact list item
    return (
      <div
        className={`
          p-4 rounded-lg transition-all duration-200
          hover:shadow-lg cursor-pointer
          ${theme === 'dark'
            ? 'bg-gray-800/50 hover:bg-gray-800/70 border border-gray-700'
            : 'bg-white hover:bg-gray-50 border border-gray-200'
          }
        `}
        onClick={onView}
      >
        <div className="flex items-center justify-between gap-4">
          {/* Customer Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center text-white font-bold
                ${getCreditStatusColor(customer.credit_status)}
              `}>
                {customer.name.charAt(0).toUpperCase()}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <h3 className={`
                  font-semibold truncate
                  ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
                `}>
                  {customer.name}
                </h3>
                <p className={`
                  text-sm truncate
                  ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                `}>
                  {customer.phone || customer.email || 'No contact'}
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6">
            {/* Credit Balance */}
            <div className="text-right">
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Credit Balance
              </p>
              <CurrencyDisplay
                amount={customer.credit_balance}
                className={`
                  font-bold
                  ${customer.credit_balance > 0
                    ? 'text-orange-500'
                    : theme === 'dark' ? 'text-green-400' : 'text-green-600'
                  }
                `}
              />
            </div>

            {/* Loyalty Points */}
            <div className="text-right">
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Loyalty Points
              </p>
              <p className={`font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                {customer.loyalty_points}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit()
                }}
                className="min-h-[44px] min-w-[44px]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="min-h-[44px] min-w-[44px]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Tile view - card layout
  return (
    <div
      className={`
        p-6 rounded-xl transition-all duration-200
        hover:shadow-xl cursor-pointer
        ${theme === 'dark'
          ? 'bg-gray-800/50 hover:bg-gray-800/70 border border-gray-700'
          : 'bg-white hover:bg-gray-50 border border-gray-200'
        }
      `}
      onClick={onView}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        {/* Avatar */}
        <div className={`
          w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold
          ${getCreditStatusColor(customer.credit_status)}
        `}>
          {customer.name.charAt(0).toUpperCase()}
        </div>

        {/* Status Badge */}
        <Badge
          text={getCreditStatusText(customer.credit_status)}
          variant={customer.credit_status === 'good' ? 'success' : customer.credit_status === 'warning' ? 'warning' : 'danger'}
        />
      </div>

      {/* Customer Info */}
      <div className="mb-4">
        <h3 className={`
          text-lg font-bold mb-1
          ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
        `}>
          {customer.name}
        </h3>
        <p className={`
          text-sm
          ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
        `}>
          {customer.phone || customer.email || 'No contact'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className={`
          p-3 rounded-lg
          ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}
        `}>
          <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Credit Balance
          </p>
          <CurrencyDisplay
            amount={customer.credit_balance}
            className={`
              text-2xl font-bold
              ${customer.credit_balance > 0
                ? 'text-orange-500'
                : theme === 'dark' ? 'text-green-400' : 'text-green-600'
              }
            `}
          />
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
            Limit: <CurrencyDisplay amount={customer.credit_limit} className="inline" />
          </p>
        </div>

        <div className={`
          p-3 rounded-lg
          ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}
        `}>
          <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Loyalty Points
          </p>
          <p className={`
            text-lg font-bold
            ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}
          `}>
            {customer.loyalty_points}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
          className="flex-1 min-h-[44px]"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="min-h-[44px] min-w-[44px]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </Button>
      </div>
    </div>
  )
}

