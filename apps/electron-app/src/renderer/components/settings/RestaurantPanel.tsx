import { useState } from 'react'
import { useAppStore, useSettingsStore } from '../../stores'
import { FormSection, Toggle, TouchSelect, NumberInput } from '../forms'
import { FloorTableEditor, AdditionalChargesManager, WaiterManager, ReservationManager, AddressBookManager } from '../restaurant'

export function RestaurantPanel() {
  const { theme } = useAppStore()
  const { restaurant, updateRestaurantSettings } = useSettingsStore()
  const [showFloorTableEditor, setShowFloorTableEditor] = useState(false)
  const [showChargesManager, setShowChargesManager] = useState(false)
  const [showWaiterManager, setShowWaiterManager] = useState(false)
  const [showReservationManager, setShowReservationManager] = useState(false)
  const [showAddressBookManager, setShowAddressBookManager] = useState(false)

  const handleToggle = (field: keyof typeof restaurant, value: boolean) => {
    updateRestaurantSettings({ [field]: value })
  }

  const handleOrderTypeChange = (field: string, value: boolean) => {
    updateRestaurantSettings({ [field]: value })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Panel Header */}
      <div className="mb-6">
        <h2 className={`
          text-2xl font-bold mb-2
          ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
        `}>
          Restaurant Settings
        </h2>
        <p className={`
          text-sm
          ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
        `}>
          Configure restaurant-specific features, table management, and order types
        </p>
      </div>

      {/* Order Types Configuration */}
      <FormSection
        title="Order Types"
        description="Enable and configure different order types for your restaurant"
      >
        <div className="space-y-4">
          <Toggle
            checked={restaurant.enableDineIn}
            onChange={(checked) => handleOrderTypeChange('enableDineIn', checked)}
            label="Dine In"
            description="Enable dine-in orders with table management"
          />
          <Toggle
            checked={restaurant.enableTakeaway}
            onChange={(checked) => handleOrderTypeChange('enableTakeaway', checked)}
            label="Takeaway"
            description="Enable takeaway orders for customer pickup"
          />
          <Toggle
            checked={restaurant.enableDelivery}
            onChange={(checked) => handleOrderTypeChange('enableDelivery', checked)}
            label="Delivery"
            description="Enable delivery orders with address management"
          />
          <Toggle
            checked={restaurant.enableDriveThru}
            onChange={(checked) => handleOrderTypeChange('enableDriveThru', checked)}
            label="Drive Thru"
            description="Enable drive-thru orders"
          />

          <div className="pt-4">
            <TouchSelect
              label="Default Order Type"
              value={restaurant.defaultOrderType}
              options={[
                { value: 'dine-in', label: 'Dine In', disabled: !restaurant.enableDineIn },
                { value: 'takeaway', label: 'Takeaway', disabled: !restaurant.enableTakeaway },
                { value: 'delivery', label: 'Delivery', disabled: !restaurant.enableDelivery },
                { value: 'drive-thru', label: 'Drive Thru', disabled: !restaurant.enableDriveThru }
              ]}
              onChange={(value) => updateRestaurantSettings({ defaultOrderType: value as any })}
              helperText="Default order type when creating a new transaction"
            />
          </div>
        </div>
      </FormSection>

      {/* Product Customization */}
      <FormSection
        title="Product Customization"
        description="Enable customization options for menu items"
      >
        <div className="space-y-4">
          <Toggle
            checked={restaurant.enableProductNotes}
            onChange={(checked) => handleToggle('enableProductNotes', checked)}
            label="Product Notes"
            description="Allow adding special instructions to products"
          />
          <Toggle
            checked={restaurant.enableSpicyLevel}
            onChange={(checked) => handleToggle('enableSpicyLevel', checked)}
            label="Spicy Level"
            description="Enable spicy level selection (None, Low, Medium, High, Extra)"
          />
          <Toggle
            checked={restaurant.enableSaltLevel}
            onChange={(checked) => handleToggle('enableSaltLevel', checked)}
            label="Salt Level"
            description="Enable salt level selection (None, Low, Medium, High)"
          />
          <Toggle
            checked={restaurant.enableCookingPreferences}
            onChange={(checked) => handleToggle('enableCookingPreferences', checked)}
            label="Cooking Preferences"
            description="Enable cooking preference options (Well Done, Medium, Rare, etc.)"
          />
        </div>
      </FormSection>

      {/* Kitchen Management */}
      <FormSection
        title="Kitchen Management"
        description="Configure kitchen order management and course tracking"
      >
        <div className="space-y-4">
          <Toggle
            checked={restaurant.enableKitchenOrders}
            onChange={(checked) => handleToggle('enableKitchenOrders', checked)}
            label="Kitchen Orders"
            description="Send orders to kitchen display system"
          />
          <Toggle
            checked={restaurant.enableCourseManagement}
            onChange={(checked) => handleToggle('enableCourseManagement', checked)}
            label="Course Management"
            description="Enable course-based order management (Appetizer, Main Course, etc.)"
          />
          <NumberInput
            label="Default Prep Time (minutes)"
            value={restaurant.defaultPrepTime}
            onChange={(value) => updateRestaurantSettings({ defaultPrepTime: value })}
            min={1}
            max={120}
            step={5}
            showButtons
            helperText="Default preparation time for kitchen orders"
          />
        </div>
      </FormSection>

      {/* Table Service */}
      <FormSection
        title="Table Service"
        description="Configure table service and guest management"
      >
        <div className="space-y-4">
          <Toggle
            checked={restaurant.enableTableService}
            onChange={(checked) => handleToggle('enableTableService', checked)}
            label="Table Service"
            description="Enable table service features"
          />
          <Toggle
            checked={restaurant.enableWaiterAssignment}
            onChange={(checked) => handleToggle('enableWaiterAssignment', checked)}
            label="Waiter Assignment"
            description="Assign waiters to tables and orders"
          />
          <Toggle
            checked={restaurant.enableGuestCount}
            onChange={(checked) => handleToggle('enableGuestCount', checked)}
            label="Guest Count"
            description="Track number of guests per table"
          />
          <NumberInput
            label="Auto Release Table (minutes)"
            value={restaurant.autoReleaseTableTime}
            onChange={(value) => updateRestaurantSettings({ autoReleaseTableTime: value })}
            min={15}
            max={480}
            step={15}
            showButtons
            helperText="Automatically release tables after this duration"
          />
        </div>
      </FormSection>

      {/* Waiter Management */}
      <FormSection
        title="Waiter Management"
        description="Manage waiters/servers for your restaurant"
      >
        <div className="space-y-4">
          <div className={`
            p-4 rounded-lg border-2
            ${theme === 'dark' ? 'bg-purple-900/20 border-purple-700' : 'bg-purple-50 border-purple-200'}
          `}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <svg className={`w-6 h-6 flex-shrink-0 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <div>
                  <h4 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-900'}`}>
                    Waiters/Servers
                  </h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-purple-300' : 'text-purple-800'}`}>
                    Currently: {restaurant.waiters.length} waiter(s)
                  </p>
                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-700'}`}>
                    Active: {restaurant.waiters.filter(w => w.isActive).length}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowWaiterManager(true)}
                className={`
                  px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors
                  ${theme === 'dark'
                    ? 'bg-purple-600 hover:bg-purple-500 text-white'
                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                  }
                `}
              >
                Manage Waiters
              </button>
            </div>
          </div>
        </div>
      </FormSection>

      {/* Floor & Table Management */}
      <FormSection
        title="Floor & Table Management"
        description="Manage floors and tables for your restaurant"
      >
        <div className="space-y-4">
          <div className={`
            p-4 rounded-lg border-2
            ${theme === 'dark' ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}
          `}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <svg className={`w-6 h-6 flex-shrink-0 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <div>
                  <h4 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-900'}`}>
                    Floor & Table Configuration
                  </h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-blue-300' : 'text-blue-800'}`}>
                    Currently: {restaurant.floors.length} floor(s), {restaurant.tables.length} table(s)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFloorTableEditor(true)}
                className={`
                  px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors
                  ${theme === 'dark'
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }
                `}
              >
                Open Editor
              </button>
            </div>
          </div>
        </div>
      </FormSection>

      {/* Additional Charges */}
      <FormSection
        title="Additional Charges"
        description="Configure additional charges for different order types"
      >
        <div className="space-y-4">
          <div className={`
            p-4 rounded-lg border-2
            ${theme === 'dark' ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'}
          `}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <svg className={`w-6 h-6 flex-shrink-0 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-green-400' : 'text-green-900'}`}>
                    Additional Charges
                  </h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-green-300' : 'text-green-800'}`}>
                    Currently configured: {restaurant.additionalCharges.length} charge(s)
                  </p>
                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-green-400' : 'text-green-700'}`}>
                    Active: {restaurant.additionalCharges.filter(c => c.isActive).length}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowChargesManager(true)}
                className={`
                  px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors
                  ${theme === 'dark'
                    ? 'bg-green-600 hover:bg-green-500 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                  }
                `}
              >
                Manage Charges
              </button>
            </div>
          </div>
        </div>
      </FormSection>

      {/* Reservations Management */}
      <FormSection
        title="Reservations Management"
        description="Manage table reservations and bookings"
      >
        <div className="space-y-4">
          <div className={`
            p-4 rounded-lg border-2
            ${theme === 'dark' ? 'bg-orange-900/20 border-orange-700' : 'bg-orange-50 border-orange-200'}
          `}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <svg className={`w-6 h-6 flex-shrink-0 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <h4 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-900'}`}>
                    Table Reservations
                  </h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-orange-300' : 'text-orange-800'}`}>
                    Manage customer reservations with calendar view
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowReservationManager(true)}
                className={`
                  px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors
                  ${theme === 'dark'
                    ? 'bg-orange-600 hover:bg-orange-500 text-white'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }
                `}
              >
                Manage Reservations
              </button>
            </div>
          </div>
        </div>
      </FormSection>

      {/* Delivery Address Management */}
      <FormSection
        title="Delivery Address Management"
        description="Manage customer delivery addresses"
      >
        <div className="space-y-4">
          <div className={`
            p-4 rounded-lg border-2
            ${theme === 'dark' ? 'bg-indigo-900/20 border-indigo-700' : 'bg-indigo-50 border-indigo-200'}
          `}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <svg className={`w-6 h-6 flex-shrink-0 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <h4 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-900'}`}>
                    Address Book
                  </h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-800'}`}>
                    Manage customer delivery addresses
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddressBookManager(true)}
                className={`
                  px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors
                  ${theme === 'dark'
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                  }
                `}
              >
                Manage Addresses
              </button>
            </div>
          </div>
        </div>
      </FormSection>

      {/* Floor & Table Editor Dialog */}
      <FloorTableEditor
        isOpen={showFloorTableEditor}
        onClose={() => setShowFloorTableEditor(false)}
      />

      {/* Additional Charges Manager Dialog */}
      <AdditionalChargesManager
        isOpen={showChargesManager}
        onClose={() => setShowChargesManager(false)}
      />

      {/* Waiter Manager Dialog */}
      <WaiterManager
        isOpen={showWaiterManager}
        onClose={() => setShowWaiterManager(false)}
      />

      {/* Reservation Manager Dialog */}
      <ReservationManager
        isOpen={showReservationManager}
        onClose={() => setShowReservationManager(false)}
      />

      {/* Address Book Manager Dialog */}
      <AddressBookManager
        isOpen={showAddressBookManager}
        onClose={() => setShowAddressBookManager(false)}
      />
    </div>
  )
}
