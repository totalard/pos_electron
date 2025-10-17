import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { settingsAPI } from '../services/api'

// Business mode types
export type BusinessMode = 'restaurant' | 'retail'

// Settings section types
export type SettingsSection =
  | 'general'
  | 'business'
  | 'taxes'
  | 'hardware'
  | 'receipts'
  | 'inventory'
  | 'integration'
  | 'backup'
  | 'display'
  | 'security'
  | 'users'
  | 'about'

// Settings data interfaces
export interface GeneralSettings {
  storeName: string
  businessName: string
  storeAddress: string
  storeCity: string
  storeState: string
  storeZip: string
  storeCountry: string
  storePhone: string
  storeEmail: string
  storeWebsite: string
  logoUrl: string
  operatingHours: Record<string, { open: string; close: string; closed: boolean }>
  currency: string
  language: string
  timezone: string
}

export interface BusinessSettings {
  mode: BusinessMode
  enableTableManagement: boolean // Restaurant mode
  enableReservations: boolean // Restaurant mode
  enableKitchenDisplay: boolean // Restaurant mode
  enableBarcodeScanner: boolean // Retail mode
  enableLoyaltyProgram: boolean // Retail mode
  enableQuickCheckout: boolean // Retail mode
  currencyConfig: {
    code: string
    symbol: string
    symbolPosition: 'before' | 'after'
    decimalPlaces: number
    thousandSeparator: string
    decimalSeparator: string
    showCurrencyCode: boolean
    regionSpecific: {
      india: {
        enabled: boolean
        gstEnabled: boolean
        showPaisa: boolean
        useIndianNumbering: boolean
      }
      middleEast: {
        enabled: boolean
        currency: string
        decimalPlaces: number
      }
    }
  }
}

export interface TaxSettings {
  defaultTaxRate: number
  taxInclusive: boolean
  taxLabel: string
  enableMultipleTaxRates: boolean
}

export interface HardwareSettings {
  printerEnabled: boolean
  printerName: string
  cashDrawerEnabled: boolean
  barcodeReaderEnabled: boolean
  displayEnabled: boolean
}

export interface ReceiptSettings {
  showLogo: boolean
  logoUrl: string
  headerText: string
  footerText: string
  customHeader: string
  customFooter: string
  showTaxBreakdown: boolean
  showBarcode: boolean
  showQRCode: boolean
  paperSize: string
}

export interface InventorySettings {
  // Stock Tracking Configuration
  enableStockTracking: boolean
  trackBySerialNumber: boolean
  trackByBatchNumber: boolean
  trackByExpiryDate: boolean

  // Alert & Notification Settings
  enableLowStockAlerts: boolean
  lowStockThreshold: number
  lowStockThresholdType: 'absolute' | 'percentage'
  enableOutOfStockAlerts: boolean
  alertRecipients: string[]

  // Stock Deduction Settings
  stockDeductionMode: 'automatic' | 'manual'
  allowNegativeStock: boolean
  deductOnSale: boolean
  deductOnOrder: boolean

  // Reorder Point Settings
  enableAutoReorder: boolean
  autoReorderThreshold: number
  autoReorderQuantity: number
  enableReorderPointCalculation: boolean

  // Unit of Measurement Settings
  defaultUOM: string
  enableMultipleUOM: boolean
  uomConversionEnabled: boolean

  // Barcode Settings
  enableBarcodeScanning: boolean
  barcodeFormat: string
  autoGenerateBarcode: boolean
  barcodePrefix: string

  // Multi-Location Settings
  enableMultiLocation: boolean
  defaultLocation: string
  transferBetweenLocations: boolean

  // Stock Valuation Method
  valuationMethod: 'FIFO' | 'LIFO' | 'Weighted Average'
  enableCostTracking: boolean

  // Waste & Adjustment Tracking
  enableWasteTracking: boolean
  wasteReasons: string[]
  requireWasteApproval: boolean
  enableStockAdjustment: boolean
  requireAdjustmentReason: boolean

  // Restaurant-Specific Settings
  enableRecipeManagement: boolean
  enablePortionControl: boolean
  enablePrepItemTracking: boolean
  ingredientCostTracking: boolean

  // Retail-Specific Settings
  enableVariantTracking: boolean
  enableSKUManagement: boolean
  enableSizeColorTracking: boolean
}

export interface IntegrationSettings {
  enableCloudSync: boolean
  cloudSyncInterval: number
  enableEmailReceipts: boolean
  smtpServer: string
  smtpPort: number
  smtpUsername: string
}

export interface BackupSettings {
  enableAutoBackup: boolean
  backupInterval: number
  backupLocation: string
  lastBackupDate: string | null
}

export interface DisplaySettings {
  theme: 'light' | 'dark'
  fontSize: 'small' | 'medium' | 'large'
  screenTimeout: number
}

export interface SecuritySettings {
  sessionTimeout: number
  requirePinForRefunds: boolean
  requirePinForVoids: boolean
  requirePinForDiscounts: boolean
}

export interface AboutInfo {
  appVersion: string
  buildNumber: string
  lastUpdateCheck: string | null
  databaseVersion: string
}

// Define the store state interface
export interface SettingsState {
  // Current selected section
  selectedSection: SettingsSection

  // Loading state
  isLoading: boolean
  error: string | null

  // Settings data
  general: GeneralSettings
  business: BusinessSettings
  taxes: TaxSettings
  hardware: HardwareSettings
  receipts: ReceiptSettings
  inventory: InventorySettings
  integration: IntegrationSettings
  backup: BackupSettings
  display: DisplaySettings
  security: SecuritySettings
  about: AboutInfo

  // Actions
  setSelectedSection: (section: SettingsSection) => void
  loadSettings: () => Promise<void>
  updateGeneralSettings: (settings: Partial<GeneralSettings>) => Promise<void>
  updateBusinessSettings: (settings: Partial<BusinessSettings>) => Promise<void>
  updateTaxSettings: (settings: Partial<TaxSettings>) => Promise<void>
  updateHardwareSettings: (settings: Partial<HardwareSettings>) => Promise<void>
  updateReceiptSettings: (settings: Partial<ReceiptSettings>) => Promise<void>
  updateInventorySettings: (settings: Partial<InventorySettings>) => Promise<void>
  updateIntegrationSettings: (settings: Partial<IntegrationSettings>) => Promise<void>
  updateBackupSettings: (settings: Partial<BackupSettings>) => Promise<void>
  updateDisplaySettings: (settings: Partial<DisplaySettings>) => Promise<void>
  updateSecuritySettings: (settings: Partial<SecuritySettings>) => Promise<void>
  setBusinessMode: (mode: BusinessMode) => void
  checkForUpdates: () => Promise<void>
  performBackup: () => Promise<void>
  restoreBackup: (filePath: string) => Promise<void>
  reset: () => void
}

// Initial state
const initialState = {
  selectedSection: 'general' as SettingsSection,
  isLoading: false,
  error: null,

  general: {
    storeName: 'MidLogic POS',
    businessName: '',
    storeAddress: '',
    storeCity: '',
    storeState: '',
    storeZip: '',
    storeCountry: '',
    storePhone: '',
    storeEmail: '',
    storeWebsite: '',
    logoUrl: '',
    operatingHours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '10:00', close: '16:00', closed: false },
      sunday: { open: '10:00', close: '16:00', closed: true }
    },
    currency: 'USD',
    language: 'en',
    timezone: 'UTC'
  },

  business: {
    mode: 'retail' as BusinessMode,
    enableTableManagement: false,
    enableReservations: false,
    enableKitchenDisplay: false,
    enableBarcodeScanner: true,
    enableLoyaltyProgram: false,
    enableQuickCheckout: true,
    currencyConfig: {
      code: 'USD',
      symbol: '$',
      symbolPosition: 'before' as const,
      decimalPlaces: 2,
      thousandSeparator: ',',
      decimalSeparator: '.',
      showCurrencyCode: false,
      regionSpecific: {
        india: {
          enabled: false,
          gstEnabled: true,
          showPaisa: true,
          useIndianNumbering: true
        },
        middleEast: {
          enabled: false,
          currency: 'AED',
          decimalPlaces: 2
        }
      }
    }
  },

  taxes: {
    defaultTaxRate: 0,
    taxInclusive: false,
    taxLabel: 'Tax',
    enableMultipleTaxRates: false
  },

  hardware: {
    printerEnabled: false,
    printerName: '',
    cashDrawerEnabled: false,
    barcodeReaderEnabled: false,
    displayEnabled: false
  },

  receipts: {
    showLogo: false,
    logoUrl: '',
    headerText: 'Thank you for your purchase!',
    footerText: 'Please come again!',
    customHeader: '',
    customFooter: '',
    showTaxBreakdown: true,
    showBarcode: false,
    showQRCode: false,
    paperSize: 'A4'
  },

  inventory: {
    // Stock Tracking Configuration
    enableStockTracking: true,
    trackBySerialNumber: false,
    trackByBatchNumber: false,
    trackByExpiryDate: false,

    // Alert & Notification Settings
    enableLowStockAlerts: true,
    lowStockThreshold: 10,
    lowStockThresholdType: 'absolute' as const,
    enableOutOfStockAlerts: true,
    alertRecipients: [],

    // Stock Deduction Settings
    stockDeductionMode: 'automatic' as const,
    allowNegativeStock: false,
    deductOnSale: true,
    deductOnOrder: false,

    // Reorder Point Settings
    enableAutoReorder: false,
    autoReorderThreshold: 5,
    autoReorderQuantity: 20,
    enableReorderPointCalculation: false,

    // Unit of Measurement Settings
    defaultUOM: 'pieces',
    enableMultipleUOM: false,
    uomConversionEnabled: false,

    // Barcode Settings
    enableBarcodeScanning: true,
    barcodeFormat: 'EAN13',
    autoGenerateBarcode: false,
    barcodePrefix: '',

    // Multi-Location Settings
    enableMultiLocation: false,
    defaultLocation: 'Main Warehouse',
    transferBetweenLocations: false,

    // Stock Valuation Method
    valuationMethod: 'FIFO' as const,
    enableCostTracking: true,

    // Waste & Adjustment Tracking
    enableWasteTracking: false,
    wasteReasons: ['Damaged', 'Expired', 'Lost', 'Other'],
    requireWasteApproval: false,
    enableStockAdjustment: true,
    requireAdjustmentReason: true,

    // Restaurant-Specific Settings
    enableRecipeManagement: false,
    enablePortionControl: false,
    enablePrepItemTracking: false,
    ingredientCostTracking: true,

    // Retail-Specific Settings
    enableVariantTracking: true,
    enableSKUManagement: true,
    enableSizeColorTracking: false
  },

  integration: {
    enableCloudSync: false,
    cloudSyncInterval: 60,
    enableEmailReceipts: false,
    smtpServer: '',
    smtpPort: 587,
    smtpUsername: ''
  },

  backup: {
    enableAutoBackup: false,
    backupInterval: 24,
    backupLocation: '',
    lastBackupDate: null
  },

  display: {
    theme: 'light' as 'light' | 'dark',
    fontSize: 'medium' as 'small' | 'medium' | 'large',
    screenTimeout: 0
  },

  security: {
    sessionTimeout: 0,
    requirePinForRefunds: true,
    requirePinForVoids: true,
    requirePinForDiscounts: false
  },

  about: {
    appVersion: '1.0.0',
    buildNumber: '1',
    lastUpdateCheck: null,
    databaseVersion: '1.0.0'
  }
}

// Create the store with persistence
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSelectedSection: (section: SettingsSection) =>
        set({ selectedSection: section }),

      loadSettings: async () => {
        set({ isLoading: true, error: null })
        try {
          const settings = await settingsAPI.getSettings()
          set({
            general: { ...get().general, ...settings.general },
            business: { ...get().business, ...settings.business },
            taxes: { ...get().taxes, ...settings.taxes },
            hardware: { ...get().hardware, ...settings.hardware },
            receipts: { ...get().receipts, ...settings.receipts },
            inventory: { ...get().inventory, ...settings.inventory },
            integration: { ...get().integration, ...settings.integration },
            backup: { ...get().backup, ...settings.backup },
            display: { ...get().display, ...settings.display },
            security: { ...get().security, ...settings.security },
            about: { ...get().about, ...settings.about },
            isLoading: false
          })
        } catch (error) {
          console.error('Failed to load settings:', error)
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to load settings'
          })
        }
      },

      updateGeneralSettings: async (settings: Partial<GeneralSettings>) => {
        const currentState = get()
        const updatedGeneral = { ...currentState.general, ...settings }
        set({ general: updatedGeneral })

        try {
          await settingsAPI.updateSettings({ general: updatedGeneral })
        } catch (error) {
          console.error('Failed to update general settings:', error)
          set({ general: currentState.general }) // Rollback on error
        }
      },

      updateBusinessSettings: async (settings: Partial<BusinessSettings>) => {
        const currentState = get()
        const updatedBusiness = { ...currentState.business, ...settings }
        set({ business: updatedBusiness })

        try {
          await settingsAPI.updateSettings({ business: updatedBusiness })
        } catch (error) {
          console.error('Failed to update business settings:', error)
          set({ business: currentState.business })
        }
      },

      updateTaxSettings: async (settings: Partial<TaxSettings>) => {
        const currentState = get()
        const updatedTaxes = { ...currentState.taxes, ...settings }
        set({ taxes: updatedTaxes })

        try {
          await settingsAPI.updateSettings({ taxes: updatedTaxes })
        } catch (error) {
          console.error('Failed to update tax settings:', error)
          set({ taxes: currentState.taxes })
        }
      },

      updateHardwareSettings: async (settings: Partial<HardwareSettings>) => {
        const currentState = get()
        const updatedHardware = { ...currentState.hardware, ...settings }
        set({ hardware: updatedHardware })

        try {
          await settingsAPI.updateSettings({ hardware: updatedHardware })
        } catch (error) {
          console.error('Failed to update hardware settings:', error)
          set({ hardware: currentState.hardware })
        }
      },

      updateReceiptSettings: async (settings: Partial<ReceiptSettings>) => {
        const currentState = get()
        const updatedReceipts = { ...currentState.receipts, ...settings }
        set({ receipts: updatedReceipts })

        try {
          await settingsAPI.updateSettings({ receipts: updatedReceipts })
        } catch (error) {
          console.error('Failed to update receipt settings:', error)
          set({ receipts: currentState.receipts })
        }
      },

      updateInventorySettings: async (settings: Partial<InventorySettings>) => {
        const currentState = get()
        const updatedInventory = { ...currentState.inventory, ...settings }
        set({ inventory: updatedInventory })

        try {
          await settingsAPI.updateSettings({ inventory: updatedInventory })
        } catch (error) {
          console.error('Failed to update inventory settings:', error)
          set({ inventory: currentState.inventory })
        }
      },

      updateIntegrationSettings: async (settings: Partial<IntegrationSettings>) => {
        const currentState = get()
        const updatedIntegration = { ...currentState.integration, ...settings }
        set({ integration: updatedIntegration })

        try {
          await settingsAPI.updateSettings({ integration: updatedIntegration })
        } catch (error) {
          console.error('Failed to update integration settings:', error)
          set({ integration: currentState.integration })
        }
      },

      updateBackupSettings: async (settings: Partial<BackupSettings>) => {
        const currentState = get()
        const updatedBackup = { ...currentState.backup, ...settings }
        set({ backup: updatedBackup })

        try {
          await settingsAPI.updateSettings({ backup: updatedBackup })
        } catch (error) {
          console.error('Failed to update backup settings:', error)
          set({ backup: currentState.backup })
        }
      },

      updateDisplaySettings: async (settings: Partial<DisplaySettings>) => {
        const currentState = get()
        const updatedDisplay = { ...currentState.display, ...settings }
        set({ display: updatedDisplay })

        try {
          await settingsAPI.updateSettings({ display: updatedDisplay })
        } catch (error) {
          console.error('Failed to update display settings:', error)
          set({ display: currentState.display })
        }
      },

      updateSecuritySettings: async (settings: Partial<SecuritySettings>) => {
        const currentState = get()
        const updatedSecurity = { ...currentState.security, ...settings }
        set({ security: updatedSecurity })

        try {
          await settingsAPI.updateSettings({ security: updatedSecurity })
        } catch (error) {
          console.error('Failed to update security settings:', error)
          set({ security: currentState.security })
        }
      },

      setBusinessMode: (mode: BusinessMode) =>
        get().updateBusinessSettings({ mode }),

      checkForUpdates: async () => {
        const currentState = get()
        const updatedAbout = {
          ...currentState.about,
          lastUpdateCheck: new Date().toISOString()
        }
        set({ about: updatedAbout })

        try {
          await settingsAPI.updateSettings({ about: updatedAbout })
        } catch (error) {
          console.error('Failed to update about info:', error)
        }
      },

      performBackup: async () => {
        try {
          const result = await settingsAPI.performBackup()
          const currentState = get()
          const updatedBackup = {
            ...currentState.backup,
            lastBackupDate: new Date().toISOString()
          }
          set({ backup: updatedBackup })

          // Update backend with new backup date
          await settingsAPI.updateSettings({ backup: updatedBackup })

          console.log('Backup created:', result.backup_file)
        } catch (error) {
          console.error('Failed to perform backup:', error)
          throw error
        }
      },

      restoreBackup: async (filePath: string) => {
        try {
          const result = await settingsAPI.restoreBackup(filePath)
          console.log('Backup restored:', result.message)

          // Reload settings after restore
          await get().loadSettings()
        } catch (error) {
          console.error('Failed to restore backup:', error)
          throw error
        }
      },

      reset: () => set(initialState)
    }),
    {
      name: 'settings-storage',
      partialize: (state) => ({
        selectedSection: state.selectedSection,
        display: state.display
      })
    }
  )
)

