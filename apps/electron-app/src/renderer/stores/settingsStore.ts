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
  | 'demo'
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
  timezone: string // Business timezone for transactions, reporting, and scheduling
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
  // Receipt Printer Configuration
  receiptPrinterEnabled: boolean
  receiptPrinterConnection: 'USB' | 'Network' | 'COM'
  receiptPrinterPort: string
  receiptPrinterBaudRate: number
  receiptPrinterPaperSize: '58mm' | '80mm'

  // Kitchen Printer Configuration
  kitchenPrinterEnabled: boolean
  kitchenPrinterConnection: 'USB' | 'Network' | 'COM'
  kitchenPrinterPort: string
  kitchenPrinterBaudRate: number

  // Label Printer Configuration
  labelPrinterEnabled: boolean
  labelPrinterConnection: 'USB' | 'Network' | 'COM'
  labelPrinterPort: string
  labelPrinterBaudRate: number

  // Cash Drawer Configuration
  cashDrawerEnabled: boolean
  cashDrawerConnection: 'Printer' | 'USB' | 'COM'
  cashDrawerTrigger: 'Manual' | 'Auto'
  cashDrawerAutoOpen: boolean

  // Barcode Scanner Configuration
  barcodeScannerEnabled: boolean
  barcodeScannerConnection: 'USB' | 'Bluetooth' | 'COM'
  barcodeScannerMode: 'Continuous' | 'Trigger'
  barcodeScannerPrefix: string
  barcodeScannerSuffix: string

  // Customer Display Configuration
  customerDisplayEnabled: boolean
  customerDisplayType: 'Monitor' | 'Pole Display' | 'Tablet'
  customerDisplayConnection: 'HDMI' | 'USB' | 'Network'
  customerDisplayPort: string
  customerDisplayShowItems: boolean
  customerDisplayShowTotal: boolean
  customerDisplayShowPromo: boolean
  customerDisplayFontSize: 'Small' | 'Medium' | 'Large'

  // Scale/Weight Device Configuration
  scaleEnabled: boolean
  scaleConnection: 'USB' | 'COM' | 'Network'
  scalePort: string
  scaleBaudRate: number
  scaleUnit: 'kg' | 'lb' | 'g'

  // Card Reader/Payment Terminal Configuration
  paymentTerminalEnabled: boolean
  paymentTerminalType: string
  paymentTerminalConnection: 'USB' | 'Network' | 'Bluetooth'
  paymentTerminalPort: string
}

export interface ReceiptSettings {
  // Receipt Header
  showLogo: boolean
  logoUrl: string
  businessName: string
  businessAddress: string
  businessPhone: string
  businessEmail: string
  taxId: string
  customHeaderText: string

  // Receipt Body - Item Display
  showItemName: boolean
  showItemQuantity: boolean
  showItemPrice: boolean
  showItemDiscount: boolean
  showItemTax: boolean
  itemColumnAlignment: 'left' | 'center' | 'right'
  itemSpacing: 'compact' | 'normal' | 'spacious'

  // Receipt Body - Totals
  showSubtotal: boolean
  showTaxBreakdown: boolean
  showDiscountTotal: boolean
  showGrandTotal: boolean

  // Receipt Footer
  customFooterText: string
  returnPolicy: string
  promotionalMessage: string
  showBarcode: boolean
  showQRCode: boolean
  qrCodeContent: 'receipt_id' | 'receipt_url' | 'custom'

  // Paper Size Configuration
  paperType: 'thermal' | 'standard' | 'custom'
  paperWidth: '58mm' | '80mm' | '110mm' | 'A4' | 'Letter' | 'custom'
  paperHeight: 'continuous' | 'A4' | 'Letter' | 'custom'
  customPaperWidth: number
  customPaperHeight: number
  paperUnit: 'mm' | 'inches'

  // Font Configuration
  fontFamily: 'monospace' | 'sans-serif' | 'serif'
  headerFontSize: number
  itemFontSize: number
  totalFontSize: number
  footerFontSize: number
  headerFontWeight: 'normal' | 'bold'
  itemFontWeight: 'normal' | 'bold'
  totalFontWeight: 'normal' | 'bold'
  footerFontWeight: 'normal' | 'bold'
  characterSpacing: number
  lineHeight: number

  // Layout & Spacing
  lineSpacing: 'compact' | 'normal' | 'relaxed'
  marginTop: number
  marginBottom: number
  marginLeft: number
  marginRight: number
  sectionSpacing: number

  // Template Options
  activeTemplate: 'standard' | 'compact' | 'detailed' | 'minimal' | 'custom'
  customTemplates: Array<{
    id: string
    name: string
    config: Record<string, any>
  }>

  // Print Behavior
  autoPrint: boolean
  numberOfCopies: number
  printKitchenReceipt: boolean
  printCustomerCopy: boolean
  printMerchantCopy: boolean
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

  // Stock Valuation Method
  valuationMethod: 'FIFO' | 'LIFO' | 'Weighted Average'
  enableCostTracking: boolean

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

export interface BackupMetadata {
  filename: string
  created_at: string
  size_bytes: number
  size_mb: number
  database_size_bytes: number
  database_size_mb: number
  checksum: string
  compression_enabled: boolean
  encryption_enabled: boolean
  backup_type: string
  selected_tables?: string[] | null
  status: string
  error_message?: string | null
}

export interface BackupFile {
  filename: string
  path: string
  size_bytes: number
  size_mb: number
  created_at: string
  is_compressed: boolean
  metadata?: BackupMetadata | null
}

export interface BackupProgress {
  status: 'idle' | 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled'
  progress: number  // 0-100
  message: string
  operation: 'backup' | 'restore' | 'idle'
  timestamp: string
  estimatedRemaining?: number | null  // seconds
}

export interface BackupSettings {
  enableAutoBackup: boolean
  backupInterval: number
  backupLocation: string
  lastBackupDate: string | null
  
  // Advanced features
  compressionEnabled: boolean
  encryptionEnabled: boolean
  backupType: 'full' | 'incremental' | 'selective'
  retentionDays: number
  maxBackupCount: number
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

  // Backup state
  backupHistory: BackupFile[]
  backupProgress: BackupProgress
  backupCancelToken: { cancelled: boolean }

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
  performAdvancedBackup: (options: { compression: boolean; backupType: 'full' | 'incremental' | 'selective'; selectedTables?: string[] }) => Promise<void>
  restoreBackup: (filePath: string) => Promise<void>
  loadBackupHistory: () => Promise<void>
  deleteBackup: (filename: string) => Promise<void>
  verifyBackup: (filename: string) => Promise<boolean>
  cancelBackup: () => void
  updateBackupProgress: (progress: Partial<BackupProgress>) => void
  reset: () => void
}

// Initial state
const initialState = {
  selectedSection: 'general' as SettingsSection,
  isLoading: false,
  error: null,
  
  // Backup state
  backupHistory: [] as BackupFile[],
  backupProgress: {
    status: 'idle' as const,
    progress: 0,
    message: 'Ready',
    operation: 'idle' as const,
    timestamp: new Date().toISOString(),
    estimatedRemaining: null
  } as BackupProgress,
  backupCancelToken: { cancelled: false },

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
    timezone: 'UTC',
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
    // Receipt Printer Configuration
    receiptPrinterEnabled: false,
    receiptPrinterConnection: 'USB' as const,
    receiptPrinterPort: '',
    receiptPrinterBaudRate: 9600,
    receiptPrinterPaperSize: '80mm' as const,

    // Kitchen Printer Configuration
    kitchenPrinterEnabled: false,
    kitchenPrinterConnection: 'USB' as const,
    kitchenPrinterPort: '',
    kitchenPrinterBaudRate: 9600,

    // Label Printer Configuration
    labelPrinterEnabled: false,
    labelPrinterConnection: 'USB' as const,
    labelPrinterPort: '',
    labelPrinterBaudRate: 9600,

    // Cash Drawer Configuration
    cashDrawerEnabled: false,
    cashDrawerConnection: 'Printer' as const,
    cashDrawerTrigger: 'Manual' as const,
    cashDrawerAutoOpen: false,

    // Barcode Scanner Configuration
    barcodeScannerEnabled: false,
    barcodeScannerConnection: 'USB' as const,
    barcodeScannerMode: 'Continuous' as const,
    barcodeScannerPrefix: '',
    barcodeScannerSuffix: '',

    // Customer Display Configuration
    customerDisplayEnabled: false,
    customerDisplayType: 'Monitor' as const,
    customerDisplayConnection: 'HDMI' as const,
    customerDisplayPort: '',
    customerDisplayShowItems: true,
    customerDisplayShowTotal: true,
    customerDisplayShowPromo: true,
    customerDisplayFontSize: 'Medium' as const,

    // Scale/Weight Device Configuration
    scaleEnabled: false,
    scaleConnection: 'USB' as const,
    scalePort: '',
    scaleBaudRate: 9600,
    scaleUnit: 'kg' as const,

    // Card Reader/Payment Terminal Configuration
    paymentTerminalEnabled: false,
    paymentTerminalType: '',
    paymentTerminalConnection: 'USB' as const,
    paymentTerminalPort: ''
  },

  receipts: {
    // Receipt Header
    showLogo: false,
    logoUrl: '',
    businessName: '',
    businessAddress: '',
    businessPhone: '',
    businessEmail: '',
    taxId: '',
    customHeaderText: 'Thank you for your purchase!',

    // Receipt Body - Item Display
    showItemName: true,
    showItemQuantity: true,
    showItemPrice: true,
    showItemDiscount: true,
    showItemTax: true,
    itemColumnAlignment: 'left' as const,
    itemSpacing: 'normal' as const,

    // Receipt Body - Totals
    showSubtotal: true,
    showTaxBreakdown: true,
    showDiscountTotal: true,
    showGrandTotal: true,

    // Receipt Footer
    customFooterText: 'Please come again!',
    returnPolicy: '',
    promotionalMessage: '',
    showBarcode: false,
    showQRCode: false,
    qrCodeContent: 'receipt_id' as const,

    // Paper Size Configuration
    paperType: 'thermal' as const,
    paperWidth: '80mm' as const,
    paperHeight: 'continuous' as const,
    customPaperWidth: 80,
    customPaperHeight: 297,
    paperUnit: 'mm' as const,

    // Font Configuration
    fontFamily: 'monospace' as const,
    headerFontSize: 14,
    itemFontSize: 12,
    totalFontSize: 13,
    footerFontSize: 11,
    headerFontWeight: 'bold' as const,
    itemFontWeight: 'normal' as const,
    totalFontWeight: 'bold' as const,
    footerFontWeight: 'normal' as const,
    characterSpacing: 0,
    lineHeight: 1.2,

    // Layout & Spacing
    lineSpacing: 'normal' as const,
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 5,
    marginRight: 5,
    sectionSpacing: 10,

    // Template Options
    activeTemplate: 'standard' as const,
    customTemplates: [],

    // Print Behavior
    autoPrint: false,
    numberOfCopies: 1,
    printKitchenReceipt: false,
    printCustomerCopy: true,
    printMerchantCopy: false
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

    // Stock Valuation Method
    valuationMethod: 'FIFO' as const,
    enableCostTracking: true,

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
    lastBackupDate: null,
    compressionEnabled: true,
    encryptionEnabled: false,
    backupType: 'full' as const,
    retentionDays: 30,
    maxBackupCount: 10
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

      performAdvancedBackup: async (options: { compression: boolean; backupType: 'full' | 'incremental' | 'selective'; selectedTables?: string[] }) => {
        const cancelToken = { cancelled: false }
        set({ 
          backupCancelToken: cancelToken,
          backupProgress: {
            status: 'pending',
            progress: 0,
            message: 'Preparing backup...',
            operation: 'backup',
            timestamp: new Date().toISOString(),
            estimatedRemaining: null
          }
        })

        try {
          const result = await settingsAPI.performAdvancedBackup(
            {
              compression_enabled: options.compression,
              backup_type: options.backupType,
              selected_tables: options.selectedTables
            },
            (progress) => {
              if (!cancelToken.cancelled) {
                set({ 
                  backupProgress: {
                    status: progress.status as any,
                    progress: progress.progress,
                    message: progress.message,
                    operation: 'backup',
                    timestamp: new Date().toISOString(),
                    estimatedRemaining: progress.estimatedRemaining
                  }
                })
              }
            }
          )

          const currentState = get()
          const updatedBackup = {
            ...currentState.backup,
            lastBackupDate: new Date().toISOString()
          }
          set({ backup: updatedBackup })

          await settingsAPI.updateSettings({ backup: updatedBackup })
          await get().loadBackupHistory()

          set({
            backupProgress: {
              status: 'idle',
              progress: 0,
              message: 'Backup completed successfully',
              operation: 'backup',
              timestamp: new Date().toISOString(),
              estimatedRemaining: null
            }
          })

          console.log('Advanced backup created:', result.backup_file)
        } catch (error) {
          if (cancelToken.cancelled) {
            set({
              backupProgress: {
                status: 'cancelled',
                progress: 0,
                message: 'Backup cancelled',
                operation: 'backup',
                timestamp: new Date().toISOString(),
                estimatedRemaining: null
              }
            })
          } else {
            console.error('Failed to perform advanced backup:', error)
            set({
              backupProgress: {
                status: 'failed',
                progress: 0,
                message: error instanceof Error ? error.message : 'Backup failed',
                operation: 'backup',
                timestamp: new Date().toISOString(),
                estimatedRemaining: null
              }
            })
            throw error
          }
        }
      },

      restoreBackup: async (filePath: string) => {
        const cancelToken = { cancelled: false }
        set({ 
          backupCancelToken: cancelToken,
          backupProgress: {
            status: 'pending',
            progress: 0,
            message: 'Preparing restore...',
            operation: 'restore',
            timestamp: new Date().toISOString(),
            estimatedRemaining: null
          }
        })

        try {
          const result = await settingsAPI.restoreBackup(
            filePath,
            (progress) => {
              if (!cancelToken.cancelled) {
                set({
                  backupProgress: {
                    status: progress.status as any,
                    progress: progress.progress,
                    message: progress.message,
                    operation: 'restore',
                    timestamp: new Date().toISOString(),
                    estimatedRemaining: progress.estimatedRemaining
                  }
                })
              }
            }
          )
          
          console.log('Backup restored:', result.message)

          set({
            backupProgress: {
              status: 'idle',
              progress: 0,
              message: 'Restore completed successfully',
              operation: 'restore',
              timestamp: new Date().toISOString(),
              estimatedRemaining: null
            }
          })

          // Reload settings after restore
          await get().loadSettings()
        } catch (error) {
          if (cancelToken.cancelled) {
            set({
              backupProgress: {
                status: 'cancelled',
                progress: 0,
                message: 'Restore cancelled',
                operation: 'restore',
                timestamp: new Date().toISOString(),
                estimatedRemaining: null
              }
            })
          } else {
            console.error('Failed to restore backup:', error)
            set({
              backupProgress: {
                status: 'failed',
                progress: 0,
                message: error instanceof Error ? error.message : 'Restore failed',
                operation: 'restore',
                timestamp: new Date().toISOString(),
                estimatedRemaining: null
              }
            })
            throw error
          }
        }
      },

      loadBackupHistory: async () => {
        try {
          const backups = await settingsAPI.listBackups()
          set({ backupHistory: backups as BackupFile[] })
        } catch (error) {
          console.error('Failed to load backup history:', error)
        }
      },

      deleteBackup: async (filename: string) => {
        try {
          await settingsAPI.deleteBackup(filename)
          await get().loadBackupHistory()
        } catch (error) {
          console.error('Failed to delete backup:', error)
          throw error
        }
      },

      verifyBackup: async (filename: string) => {
        try {
          const result = await settingsAPI.verifyBackup(filename)
          return result.verified === true
        } catch (error) {
          console.error('Failed to verify backup:', error)
          return false
        }
      },

      cancelBackup: () => {
        const currentState = get()
        set({ backupCancelToken: { cancelled: true } })
      },

      updateBackupProgress: (progress: Partial<BackupProgress>) => {
        const currentState = get()
        set({
          backupProgress: {
            ...currentState.backupProgress,
            ...progress,
            timestamp: new Date().toISOString()
          }
        })
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

