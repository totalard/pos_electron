import { useState } from 'react'
import { useAppStore, useSettingsStore } from '../../stores'
import { PageHeader } from '../layout'
import { ThemeToggle } from '../common'
import { FloorTableEditor, AdditionalChargesManager, WaiterManager, ReservationManager, AddressBookManager } from '../restaurant'

interface RestaurantManagementScreenProps {
  onBack: () => void
}

interface ManagementCard {
  id: string
  title: string
  description: string
  icon: JSX.Element
  color: string
  count?: number
  activeCount?: number
  onClick: () => void
}

export function RestaurantManagementScreen({ onBack }: RestaurantManagementScreenProps) {
  const { theme } = useAppStore()
  const { restaurant } = useSettingsStore()
  
  const [showFloorTableEditor, setShowFloorTableEditor] = useState(false)
  const [showChargesManager, setShowChargesManager] = useState(false)
  const [showWaiterManager, setShowWaiterManager] = useState(false)
  const [showReservationManager, setShowReservationManager] = useState(false)
  const [showAddressBookManager, setShowAddressBookManager] = useState(false)

  const managementCards: ManagementCard[] = [
    {
      id: 'waiters',
      title: 'Waiter Management',
      description: 'Manage waiters/servers',
      count: restaurant.waiters.length,
      activeCount: restaurant.waiters.filter(w => w.isActive).length,
      color: 'purple',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      onClick: () => setShowWaiterManager(true)
    },
    {
      id: 'floors',
      title: 'Floor & Table Management',
      description: 'Manage floors and tables',
      count: restaurant.tables.length,
      activeCount: restaurant.floors.length,
      color: 'blue',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      onClick: () => setShowFloorTableEditor(true)
    },
    {
      id: 'charges',
      title: 'Additional Charges',
      description: 'Configure additional charges',
      count: restaurant.additionalCharges.length,
      activeCount: restaurant.additionalCharges.filter(c => c.isActive).length,
      color: 'green',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      onClick: () => setShowChargesManager(true)
    },
    {
      id: 'reservations',
      title: 'Reservations Management',
      description: 'Manage table reservations',
      color: 'orange',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      onClick: () => setShowReservationManager(true)
    },
    {
      id: 'addresses',
      title: 'Delivery Address Management',
      description: 'Manage customer addresses',
      color: 'indigo',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      onClick: () => setShowAddressBookManager(true)
    }
  ]

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; border: string; icon: string; text: string; hover: string }> = {
      purple: { 
        bg: theme === 'dark' ? 'bg-purple-900/20' : 'bg-purple-50', 
        border: theme === 'dark' ? 'border-purple-700' : 'border-purple-200',
        icon: theme === 'dark' ? 'text-purple-400' : 'text-purple-600',
        text: theme === 'dark' ? 'text-purple-400' : 'text-purple-900',
        hover: theme === 'dark' ? 'hover:bg-purple-900/30' : 'hover:bg-purple-100'
      },
      blue: { 
        bg: theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50', 
        border: theme === 'dark' ? 'border-blue-700' : 'border-blue-200',
        icon: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
        text: theme === 'dark' ? 'text-blue-400' : 'text-blue-900',
        hover: theme === 'dark' ? 'hover:bg-blue-900/30' : 'hover:bg-blue-100'
      },
      green: { 
        bg: theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50', 
        border: theme === 'dark' ? 'border-green-700' : 'border-green-200',
        icon: theme === 'dark' ? 'text-green-400' : 'text-green-600',
        text: theme === 'dark' ? 'text-green-400' : 'text-green-900',
        hover: theme === 'dark' ? 'hover:bg-green-900/30' : 'hover:bg-green-100'
      },
      orange: { 
        bg: theme === 'dark' ? 'bg-orange-900/20' : 'bg-orange-50', 
        border: theme === 'dark' ? 'border-orange-700' : 'border-orange-200',
        icon: theme === 'dark' ? 'text-orange-400' : 'text-orange-600',
        text: theme === 'dark' ? 'text-orange-400' : 'text-orange-900',
        hover: theme === 'dark' ? 'hover:bg-orange-900/30' : 'hover:bg-orange-100'
      },
      indigo: { 
        bg: theme === 'dark' ? 'bg-indigo-900/20' : 'bg-indigo-50', 
        border: theme === 'dark' ? 'border-indigo-700' : 'border-indigo-200',
        icon: theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600',
        text: theme === 'dark' ? 'text-indigo-400' : 'text-indigo-900',
        hover: theme === 'dark' ? 'hover:bg-indigo-900/30' : 'hover:bg-indigo-100'
      }
    }
    return colorMap[color] || colorMap.blue
  }

  return (
    <div className={`
      h-screen w-screen flex flex-col
      ${theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
      }
    `}>
      {/* Header */}
      <PageHeader
        title="Restaurant Management"
        subtitle="Manage all restaurant operations"
        showBackButton
        onBack={onBack}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        }
        actions={<ThemeToggle size="md" />}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className={`
          max-w-7xl mx-auto
          ${theme === 'dark' ? 'bg-gray-800/30' : 'bg-white/50'}
          rounded-xl p-6
        `}>
          {/* Management Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {managementCards.map((card) => {
              const colors = getColorClasses(card.color)
              
              return (
                <button
                  key={card.id}
                  onClick={card.onClick}
                  className={`
                    p-6 rounded-xl border-2 transition-all duration-200
                    transform hover:scale-105 active:scale-95
                    ${colors.bg} ${colors.border} ${colors.hover}
                    shadow-md hover:shadow-xl
                  `}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    {/* Icon */}
                    <div className={`${colors.icon}`}>
                      {card.icon}
                    </div>

                    {/* Title */}
                    <h3 className={`font-semibold text-lg ${colors.text}`}>
                      {card.title}
                    </h3>

                    {/* Description */}
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {card.description}
                    </p>

                    {/* Stats */}
                    {card.count !== undefined && (
                      <div className={`
                        text-xs px-3 py-1 rounded-full
                        ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}
                      `}>
                        {card.activeCount !== undefined ? (
                          <span>
                            {card.id === 'floors' 
                              ? `${card.activeCount} floor(s), ${card.count} table(s)`
                              : `${card.count} total, ${card.activeCount} active`
                            }
                          </span>
                        ) : (
                          <span>{card.count} total</span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Management Dialogs */}
      <FloorTableEditor
        isOpen={showFloorTableEditor}
        onClose={() => setShowFloorTableEditor(false)}
      />

      <AdditionalChargesManager
        isOpen={showChargesManager}
        onClose={() => setShowChargesManager(false)}
      />

      <WaiterManager
        isOpen={showWaiterManager}
        onClose={() => setShowWaiterManager(false)}
      />

      <ReservationManager
        isOpen={showReservationManager}
        onClose={() => setShowReservationManager(false)}
      />

      <AddressBookManager
        isOpen={showAddressBookManager}
        onClose={() => setShowAddressBookManager(false)}
      />
    </div>
  )
}
