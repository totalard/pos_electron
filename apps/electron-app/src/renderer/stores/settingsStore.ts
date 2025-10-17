import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  | 'about'

// Settings data interfaces
export interface GeneralSettings {
  storeName: string
  storeAddress: string
  storePhone: string
  storeEmail: string
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
  showTaxBreakdown: boolean
  showBarcode: boolean
}

export interface InventorySettings {
  enableLowStockAlerts: boolean
  lowStockThreshold: number
  enableAutoReorder: boolean
  autoReorderThreshold: number
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

export interface AboutInfo {
  appVersion: string
  buildNumber: string
  lastUpdateCheck: string | null
}

// Define the store state interface
export interface SettingsState {
  // Current selected section
  selectedSection: SettingsSection

  // Settings data
  general: GeneralSettings
  business: BusinessSettings
  taxes: TaxSettings
  hardware: HardwareSettings
  receipts: ReceiptSettings
  inventory: InventorySettings
  integration: IntegrationSettings
  backup: BackupSettings
  about: AboutInfo

  // Actions
  setSelectedSection: (section: SettingsSection) => void
  updateGeneralSettings: (settings: Partial<GeneralSettings>) => void
  updateBusinessSettings: (settings: Partial<BusinessSettings>) => void
  updateTaxSettings: (settings: Partial<TaxSettings>) => void
  updateHardwareSettings: (settings: Partial<HardwareSettings>) => void
  updateReceiptSettings: (settings: Partial<ReceiptSettings>) => void
  updateInventorySettings: (settings: Partial<InventorySettings>) => void
  updateIntegrationSettings: (settings: Partial<IntegrationSettings>) => void
  updateBackupSettings: (settings: Partial<BackupSettings>) => void
  setBusinessMode: (mode: BusinessMode) => void
  checkForUpdates: () => Promise<void>
  performBackup: () => Promise<void>
  restoreBackup: (filePath: string) => Promise<void>
  reset: () => void
}

// Initial state
const initialState = {
  selectedSection: 'general' as SettingsSection,
  
  general: {
    storeName: 'MidLogic POS',
    storeAddress: '',
    storePhone: '',
    storeEmail: '',
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
    enableQuickCheckout: true
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
    showTaxBreakdown: true,
    showBarcode: false
  },
  
  inventory: {
    enableLowStockAlerts: true,
    lowStockThreshold: 10,
    enableAutoReorder: false,
    autoReorderThreshold: 5
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
  
  about: {
    appVersion: '1.0.0',
    buildNumber: '1',
    lastUpdateCheck: null
  }
}

// Create the store with persistence
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSelectedSection: (section: SettingsSection) => 
        set({ selectedSection: section }),

      updateGeneralSettings: (settings: Partial<GeneralSettings>) =>
        set((state) => ({
          general: { ...state.general, ...settings }
        })),

      updateBusinessSettings: (settings: Partial<BusinessSettings>) =>
        set((state) => ({
          business: { ...state.business, ...settings }
        })),

      updateTaxSettings: (settings: Partial<TaxSettings>) =>
        set((state) => ({
          taxes: { ...state.taxes, ...settings }
        })),

      updateHardwareSettings: (settings: Partial<HardwareSettings>) =>
        set((state) => ({
          hardware: { ...state.hardware, ...settings }
        })),

      updateReceiptSettings: (settings: Partial<ReceiptSettings>) =>
        set((state) => ({
          receipts: { ...state.receipts, ...settings }
        })),

      updateInventorySettings: (settings: Partial<InventorySettings>) =>
        set((state) => ({
          inventory: { ...state.inventory, ...settings }
        })),

      updateIntegrationSettings: (settings: Partial<IntegrationSettings>) =>
        set((state) => ({
          integration: { ...state.integration, ...settings }
        })),

      updateBackupSettings: (settings: Partial<BackupSettings>) =>
        set((state) => ({
          backup: { ...state.backup, ...settings }
        })),

      setBusinessMode: (mode: BusinessMode) =>
        set((state) => ({
          business: { ...state.business, mode }
        })),

      checkForUpdates: async () => {
        // Placeholder for update check logic
        set((state) => ({
          about: {
            ...state.about,
            lastUpdateCheck: new Date().toISOString()
          }
        }))
      },

      performBackup: async () => {
        // Placeholder for backup logic
        set((state) => ({
          backup: {
            ...state.backup,
            lastBackupDate: new Date().toISOString()
          }
        }))
      },

      restoreBackup: async (filePath: string) => {
        // Placeholder for restore logic
        console.log('Restoring backup from:', filePath)
      },

      reset: () => set(initialState)
    }),
    {
      name: 'settings-storage',
      partialize: (state) => ({
        general: state.general,
        business: state.business,
        taxes: state.taxes,
        hardware: state.hardware,
        receipts: state.receipts,
        inventory: state.inventory,
        integration: state.integration,
        backup: state.backup
      })
    }
  )
)

