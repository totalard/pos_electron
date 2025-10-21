import { useAppStore, useSettingsStore } from '../../stores'
import { FormSection, Toggle, TouchSelect, NumberInput } from '../forms'

export function RestaurantPanel() {
  const { theme } = useAppStore()
  const { restaurant, updateRestaurantSettings } = useSettingsStore()

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

    </div>
  )
}
