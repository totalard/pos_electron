// Export all stores from a central location
export { useAppStore } from './appStore'
export type { AppState } from './appStore'

export { usePinStore, getPinDisplay, isPinComplete } from './pinStore'
export type { PinState } from './pinStore'

export { useErrorStore } from './errorStore'
export type { ErrorDetails } from './errorStore'

export { useSettingsStore } from './settingsStore'
export type {
  SettingsState,
  BusinessMode,
  SettingsSection,
  GeneralSettings,
  BusinessSettings,
  TaxSettings,
  PaymentMethod,
  PaymentSettings,
  HardwareSettings,
  ReceiptSettings,
  InventorySettings,
  IntegrationSettings,
  BackupSettings,
  AboutInfo
} from './settingsStore'

export { useProductStore } from './productStore'
export type { ProductState } from './productStore'

export { useCustomerStore } from './customerStore'
export type { CustomerState } from './customerStore'

export { useInventoryStore } from './inventoryStore'
export type {
  InventoryState,
  StockTransaction,
  StockAdjustment,
  StockAdjustmentLine,
  LowStockProduct,
  InventoryStats
} from './inventoryStore'

export { usePOSStore } from './posStore'
export type {
  POSState,
  CartItem,
  CartItemModifier,
  POSTransaction
} from './posStore'
