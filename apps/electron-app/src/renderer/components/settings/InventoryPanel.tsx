import { useAppStore, useSettingsStore } from '../../stores'
import { Toggle, Input } from '../common'
import { FormSection, Select } from '../forms'

/**
 * Comprehensive Inventory Settings Panel
 *
 * Supports both restaurant and retail business types with features including:
 * - Stock tracking configuration
 * - Alert and notification settings
 * - Stock deduction and valuation methods
 * - Barcode and scanning options
 * - Advanced features (batch tracking, multi-location, waste tracking)
 */
export function InventoryPanel() {
  const { theme } = useAppStore()
  const { inventory, business, updateInventorySettings } = useSettingsStore()

  const isRestaurant = business.mode === 'restaurant'
  const isRetail = business.mode === 'retail'

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Inventory Settings
        </h2>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Configure comprehensive inventory management for {isRestaurant ? 'restaurant' : 'retail'} operations
        </p>
      </div>

      {/* Stock Tracking Configuration */}
      <FormSection
        title="Stock Tracking Configuration"
        description="Configure how inventory is tracked in your system"
      >
        <div className="space-y-4">
          <Toggle
            checked={inventory.enableStockTracking}
            onChange={(checked) => updateInventorySettings({ enableStockTracking: checked })}
            label="Enable Stock Tracking"
            description="Enable global inventory tracking across all products"
          />

          {inventory.enableStockTracking && (
            <>
              <Toggle
                checked={inventory.trackBySerialNumber}
                onChange={(checked) => updateInventorySettings({ trackBySerialNumber: checked })}
                label="Track by Serial Number"
                description="Track individual items by unique serial numbers"
              />

              <Toggle
                checked={inventory.trackByBatchNumber}
                onChange={(checked) => updateInventorySettings({ trackByBatchNumber: checked })}
                label="Track by Batch/Lot Number"
                description="Track items by batch or lot numbers for quality control"
              />

              <Toggle
                checked={inventory.trackByExpiryDate}
                onChange={(checked) => updateInventorySettings({ trackByExpiryDate: checked })}
                label="Track by Expiry Date"
                description="Monitor and alert on product expiry dates"
              />
            </>
          )}
        </div>
      </FormSection>

      {/* Alert & Notification Settings */}
      <FormSection
        title="Alert & Notification Settings"
        description="Configure stock alerts and notifications"
      >
        <div className="space-y-4">
          <Toggle
            checked={inventory.enableLowStockAlerts}
            onChange={(checked) => updateInventorySettings({ enableLowStockAlerts: checked })}
            label="Low Stock Alerts"
            description="Get notified when stock levels are low"
          />

          {inventory.enableLowStockAlerts && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="number"
                  label="Low Stock Threshold"
                  value={inventory.lowStockThreshold.toString()}
                  onChange={(e) => updateInventorySettings({ lowStockThreshold: parseInt(e.target.value) || 0 })}
                  helperText="Threshold value for low stock alerts"
                  min="0"
                />

                <Select
                  label="Threshold Type"
                  value={inventory.lowStockThresholdType}
                  onChange={(e) => updateInventorySettings({ lowStockThresholdType: e.target.value as 'absolute' | 'percentage' })}
                  options={[
                    { value: 'absolute', label: 'Absolute Quantity' },
                    { value: 'percentage', label: 'Percentage (%)' }
                  ]}
                />
              </div>
            </>
          )}

          <Toggle
            checked={inventory.enableOutOfStockAlerts}
            onChange={(checked) => updateInventorySettings({ enableOutOfStockAlerts: checked })}
            label="Out of Stock Alerts"
            description="Get notified when items are completely out of stock"
          />
        </div>
      </FormSection>

      {/* Stock Deduction & Valuation Methods */}
      <FormSection
        title="Stock Deduction & Valuation"
        description="Configure how stock is deducted and valued"
      >
        <div className="space-y-4">
          <Select
            label="Stock Deduction Mode"
            value={inventory.stockDeductionMode}
            onChange={(e) => updateInventorySettings({ stockDeductionMode: e.target.value as 'automatic' | 'manual' })}
            options={[
              { value: 'automatic', label: 'Automatic Deduction' },
              { value: 'manual', label: 'Manual Adjustment' }
            ]}
            helperText="Choose when stock should be deducted"
          />

          {inventory.stockDeductionMode === 'automatic' && (
            <>
              <Toggle
                checked={inventory.deductOnSale}
                onChange={(checked) => updateInventorySettings({ deductOnSale: checked })}
                label="Deduct on Sale Completion"
                description="Automatically deduct stock when a sale is completed"
              />

              <Toggle
                checked={inventory.deductOnOrder}
                onChange={(checked) => updateInventorySettings({ deductOnOrder: checked })}
                label="Deduct on Order Placement"
                description="Reserve stock when an order is placed (before payment)"
              />
            </>
          )}

          <Toggle
            checked={inventory.allowNegativeStock}
            onChange={(checked) => updateInventorySettings({ allowNegativeStock: checked })}
            label="Allow Negative Stock"
            description="Allow selling items even when stock is zero or negative"
          />

          <Select
            label="Stock Valuation Method"
            value={inventory.valuationMethod}
            onChange={(e) => updateInventorySettings({ valuationMethod: e.target.value as 'FIFO' | 'LIFO' | 'Weighted Average' })}
            options={[
              { value: 'FIFO', label: 'FIFO (First In, First Out)' },
              { value: 'LIFO', label: 'LIFO (Last In, First Out)' },
              { value: 'Weighted Average', label: 'Weighted Average' }
            ]}
            helperText="Method used for inventory cost calculation"
          />

          <Toggle
            checked={inventory.enableCostTracking}
            onChange={(checked) => updateInventorySettings({ enableCostTracking: checked })}
            label="Enable Cost Tracking"
            description="Track purchase costs and calculate profit margins"
          />
        </div>
      </FormSection>

      {/* Reorder Point Settings */}
      <FormSection
        title="Reorder Point Settings"
        description="Configure automatic reorder suggestions"
      >
        <div className="space-y-4">
          <Toggle
            checked={inventory.enableAutoReorder}
            onChange={(checked) => updateInventorySettings({ enableAutoReorder: checked })}
            label="Enable Auto Reorder Suggestions"
            description="Automatically suggest reorders when stock is low"
          />

          {inventory.enableAutoReorder && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="number"
                  label="Reorder Threshold"
                  value={inventory.autoReorderThreshold.toString()}
                  onChange={(e) => updateInventorySettings({ autoReorderThreshold: parseInt(e.target.value) || 0 })}
                  helperText="Trigger reorder when stock reaches this level"
                  min="0"
                />

                <Input
                  type="number"
                  label="Default Reorder Quantity"
                  value={inventory.autoReorderQuantity.toString()}
                  onChange={(e) => updateInventorySettings({ autoReorderQuantity: parseInt(e.target.value) || 1 })}
                  helperText="Default quantity to reorder"
                  min="1"
                />
              </div>

              <Toggle
                checked={inventory.enableReorderPointCalculation}
                onChange={(checked) => updateInventorySettings({ enableReorderPointCalculation: checked })}
                label="Automatic Reorder Point Calculation"
                description="Calculate optimal reorder points based on sales velocity"
              />
            </>
          )}
        </div>
      </FormSection>

      {/* Unit of Measurement Settings */}
      <FormSection
        title="Unit of Measurement"
        description="Configure units for inventory tracking"
      >
        <div className="space-y-4">
          <Select
            label="Default Unit of Measurement"
            value={inventory.defaultUOM}
            onChange={(e) => updateInventorySettings({ defaultUOM: e.target.value })}
            options={[
              { value: 'pieces', label: 'Pieces (pcs)' },
              { value: 'kg', label: 'Kilograms (kg)' },
              { value: 'grams', label: 'Grams (g)' },
              { value: 'liters', label: 'Liters (L)' },
              { value: 'ml', label: 'Milliliters (ml)' },
              { value: 'meters', label: 'Meters (m)' },
              { value: 'boxes', label: 'Boxes' },
              { value: 'cartons', label: 'Cartons' },
              { value: 'dozens', label: 'Dozens' }
            ]}
          />

          <Toggle
            checked={inventory.enableMultipleUOM}
            onChange={(checked) => updateInventorySettings({ enableMultipleUOM: checked })}
            label="Enable Multiple Units"
            description="Allow products to have multiple units of measurement"
          />

          {inventory.enableMultipleUOM && (
            <Toggle
              checked={inventory.uomConversionEnabled}
              onChange={(checked) => updateInventorySettings({ uomConversionEnabled: checked })}
              label="Enable UOM Conversion"
              description="Automatically convert between different units"
            />
          )}
        </div>
      </FormSection>

      {/* Barcode & Scanning Options */}
      <FormSection
        title="Barcode & Scanning"
        description="Configure barcode scanning and generation"
      >
        <div className="space-y-4">
          <Toggle
            checked={inventory.enableBarcodeScanning}
            onChange={(checked) => updateInventorySettings({ enableBarcodeScanning: checked })}
            label="Enable Barcode Scanning"
            description="Use barcode scanners for quick product lookup"
          />

          {inventory.enableBarcodeScanning && (
            <>
              <Select
                label="Barcode Format"
                value={inventory.barcodeFormat}
                onChange={(e) => updateInventorySettings({ barcodeFormat: e.target.value })}
                options={[
                  { value: 'EAN13', label: 'EAN-13 (European)' },
                  { value: 'UPC', label: 'UPC (Universal Product Code)' },
                  { value: 'CODE128', label: 'Code 128' },
                  { value: 'QR', label: 'QR Code' }
                ]}
              />

              <Toggle
                checked={inventory.autoGenerateBarcode}
                onChange={(checked) => updateInventorySettings({ autoGenerateBarcode: checked })}
                label="Auto-Generate Barcodes"
                description="Automatically generate barcodes for new products"
              />

              {inventory.autoGenerateBarcode && (
                <Input
                  type="text"
                  label="Barcode Prefix"
                  value={inventory.barcodePrefix}
                  onChange={(e) => updateInventorySettings({ barcodePrefix: e.target.value })}
                  helperText="Prefix for auto-generated barcodes (optional)"
                  placeholder="e.g., STORE-"
                />
              )}
            </>
          )}
        </div>
      </FormSection>

      {/* Business-Specific Features */}
      <FormSection
        title="Business-Specific Features"
        description="Restaurant and retail specific inventory settings"
      >
        <div className="space-y-4">

          {/* Restaurant-Specific Settings */}
          {isRestaurant && (
            <div className={`p-4 rounded-lg border-2 ${theme === 'dark' ? 'bg-orange-900/20 border-orange-700' : 'bg-orange-50 border-orange-200'}`}>
              <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-orange-300' : 'text-orange-900'}`}>
                Restaurant-Specific Features
              </h4>
              <div className="space-y-4">
                <Toggle
                  checked={inventory.enableRecipeManagement}
                  onChange={(checked) => updateInventorySettings({ enableRecipeManagement: checked })}
                  label="Recipe Management"
                  description="Manage recipes and ingredient requirements"
                />

                <Toggle
                  checked={inventory.enablePortionControl}
                  onChange={(checked) => updateInventorySettings({ enablePortionControl: checked })}
                  label="Portion Control"
                  description="Track and control portion sizes"
                />

                <Toggle
                  checked={inventory.enablePrepItemTracking}
                  onChange={(checked) => updateInventorySettings({ enablePrepItemTracking: checked })}
                  label="Prep Item Tracking"
                  description="Track prepared items and ingredients"
                />

                <Toggle
                  checked={inventory.ingredientCostTracking}
                  onChange={(checked) => updateInventorySettings({ ingredientCostTracking: checked })}
                  label="Ingredient Cost Tracking"
                  description="Track costs of individual ingredients"
                />
              </div>
            </div>
          )}

          {/* Retail-Specific Settings */}
          {isRetail && (
            <div className={`p-4 rounded-lg border-2 ${theme === 'dark' ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
              <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-900'}`}>
                Retail-Specific Features
              </h4>
              <div className="space-y-4">
                <Toggle
                  checked={inventory.enableVariantTracking}
                  onChange={(checked) => updateInventorySettings({ enableVariantTracking: checked })}
                  label="Product Variant Tracking"
                  description="Track different variants of the same product"
                />

                <Toggle
                  checked={inventory.enableSKUManagement}
                  onChange={(checked) => updateInventorySettings({ enableSKUManagement: checked })}
                  label="SKU Management"
                  description="Manage Stock Keeping Units (SKUs)"
                />

                <Toggle
                  checked={inventory.enableSizeColorTracking}
                  onChange={(checked) => updateInventorySettings({ enableSizeColorTracking: checked })}
                  label="Size/Color Tracking"
                  description="Track inventory by size and color variants"
                />
              </div>
            </div>
          )}
        </div>
      </FormSection>
    </div>
  )
}
