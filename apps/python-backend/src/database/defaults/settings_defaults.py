"""
Default settings configuration for normalized Setting model.

This module defines all default settings that will be initialized
when the application starts for the first time or during migration
from the old JSON-based Settings model.
"""
import json
from typing import List, Dict, Any


def get_default_settings() -> List[Dict[str, Any]]:
    """
    Get the complete list of default settings.
    
    Returns:
        List of setting configurations with section, key, value, default_value, data_type, and description
    """
    return [
        # ===== GENERAL SETTINGS =====
        {
            'section': 'general',
            'key': 'storeName',
            'value': 'MidLogic POS',
            'default_value': 'MidLogic POS',
            'data_type': 'string',
            'description': 'Name of the store/business'
        },
        {
            'section': 'general',
            'key': 'businessName',
            'value': '',
            'default_value': '',
            'data_type': 'string',
            'description': 'Legal business name'
        },
        {
            'section': 'general',
            'key': 'storeAddress',
            'value': '',
            'default_value': '',
            'data_type': 'string',
            'description': 'Store street address'
        },
        {
            'section': 'general',
            'key': 'storeCity',
            'value': '',
            'default_value': '',
            'data_type': 'string',
            'description': 'Store city'
        },
        {
            'section': 'general',
            'key': 'storeState',
            'value': '',
            'default_value': '',
            'data_type': 'string',
            'description': 'Store state/province'
        },
        {
            'section': 'general',
            'key': 'storeZip',
            'value': '',
            'default_value': '',
            'data_type': 'string',
            'description': 'Store ZIP/postal code'
        },
        {
            'section': 'general',
            'key': 'storeCountry',
            'value': '',
            'default_value': '',
            'data_type': 'string',
            'description': 'Store country'
        },
        {
            'section': 'general',
            'key': 'storePhone',
            'value': '',
            'default_value': '',
            'data_type': 'string',
            'description': 'Store phone number'
        },
        {
            'section': 'general',
            'key': 'storeEmail',
            'value': '',
            'default_value': '',
            'data_type': 'string',
            'description': 'Store email address'
        },
        {
            'section': 'general',
            'key': 'storeWebsite',
            'value': '',
            'default_value': '',
            'data_type': 'string',
            'description': 'Store website URL'
        },
        {
            'section': 'general',
            'key': 'logoUrl',
            'value': '',
            'default_value': '',
            'data_type': 'string',
            'description': 'Store logo URL or path'
        },
        {
            'section': 'general',
            'key': 'operatingHours',
            'value': json.dumps({
                'monday': {'open': '09:00', 'close': '18:00', 'closed': False},
                'tuesday': {'open': '09:00', 'close': '18:00', 'closed': False},
                'wednesday': {'open': '09:00', 'close': '18:00', 'closed': False},
                'thursday': {'open': '09:00', 'close': '18:00', 'closed': False},
                'friday': {'open': '09:00', 'close': '18:00', 'closed': False},
                'saturday': {'open': '10:00', 'close': '16:00', 'closed': False},
                'sunday': {'open': '10:00', 'close': '16:00', 'closed': True}
            }),
            'default_value': json.dumps({
                'monday': {'open': '09:00', 'close': '18:00', 'closed': False},
                'tuesday': {'open': '09:00', 'close': '18:00', 'closed': False},
                'wednesday': {'open': '09:00', 'close': '18:00', 'closed': False},
                'thursday': {'open': '09:00', 'close': '18:00', 'closed': False},
                'friday': {'open': '09:00', 'close': '18:00', 'closed': False},
                'saturday': {'open': '10:00', 'close': '16:00', 'closed': False},
                'sunday': {'open': '10:00', 'close': '16:00', 'closed': True}
            }),
            'data_type': 'json',
            'description': 'Store operating hours for each day of the week'
        },
        {
            'section': 'general',
            'key': 'currency',
            'value': 'USD',
            'default_value': 'USD',
            'data_type': 'string',
            'description': 'Default currency code'
        },
        {
            'section': 'general',
            'key': 'language',
            'value': 'en',
            'default_value': 'en',
            'data_type': 'string',
            'description': 'Default language code'
        },
        {
            'section': 'general',
            'key': 'timezone',
            'value': 'UTC',
            'default_value': 'UTC',
            'data_type': 'string',
            'description': 'Store timezone'
        },
        
        # ===== BUSINESS SETTINGS =====
        {
            'section': 'business',
            'key': 'mode',
            'value': 'retail',
            'default_value': 'retail',
            'data_type': 'string',
            'description': 'Business mode: retail or restaurant'
        },
        {
            'section': 'business',
            'key': 'enableTableManagement',
            'value': 'false',
            'default_value': 'false',
            'data_type': 'boolean',
            'description': 'Enable table management for restaurants'
        },
        {
            'section': 'business',
            'key': 'enableReservations',
            'value': 'false',
            'default_value': 'false',
            'data_type': 'boolean',
            'description': 'Enable reservation system'
        },
        {
            'section': 'business',
            'key': 'enableKitchenDisplay',
            'value': 'false',
            'default_value': 'false',
            'data_type': 'boolean',
            'description': 'Enable kitchen display system'
        },
        {
            'section': 'business',
            'key': 'enableBarcodeScanner',
            'value': 'true',
            'default_value': 'true',
            'data_type': 'boolean',
            'description': 'Enable barcode scanner support'
        },
        {
            'section': 'business',
            'key': 'enableLoyaltyProgram',
            'value': 'false',
            'default_value': 'false',
            'data_type': 'boolean',
            'description': 'Enable customer loyalty program'
        },
        {
            'section': 'business',
            'key': 'enableQuickCheckout',
            'value': 'true',
            'default_value': 'true',
            'data_type': 'boolean',
            'description': 'Enable quick checkout mode'
        },
        {
            'section': 'business',
            'key': 'currencyConfig',
            'value': json.dumps({
                'code': 'USD',
                'symbol': '$',
                'symbolPosition': 'before',
                'decimalPlaces': 2,
                'thousandSeparator': ',',
                'decimalSeparator': '.',
                'showCurrencyCode': False,
                'regionSpecific': {
                    'india': {
                        'enabled': False,
                        'gstEnabled': True,
                        'showPaisa': True,
                        'useIndianNumbering': True
                    },
                    'middleEast': {
                        'enabled': False,
                        'currency': 'AED',
                        'decimalPlaces': 2
                    }
                }
            }),
            'default_value': json.dumps({
                'code': 'USD',
                'symbol': '$',
                'symbolPosition': 'before',
                'decimalPlaces': 2,
                'thousandSeparator': ',',
                'decimalSeparator': '.',
                'showCurrencyCode': False,
                'regionSpecific': {
                    'india': {
                        'enabled': False,
                        'gstEnabled': True,
                        'showPaisa': True,
                        'useIndianNumbering': True
                    },
                    'middleEast': {
                        'enabled': False,
                        'currency': 'AED',
                        'decimalPlaces': 2
                    }
                }
            }),
            'data_type': 'json',
            'description': 'Currency configuration and formatting options'
        },
        {
            'section': 'business',
            'key': 'denominationsConfig',
            'value': json.dumps({}),
            'default_value': json.dumps({}),
            'data_type': 'json',
            'description': 'Cash denominations configuration per currency'
        },
        
        # ===== TAX SETTINGS =====
        {
            'section': 'taxes',
            'key': 'defaultTaxRate',
            'value': '0',
            'default_value': '0',
            'data_type': 'number',
            'description': 'Default tax rate percentage'
        },
        {
            'section': 'taxes',
            'key': 'taxInclusive',
            'value': 'false',
            'default_value': 'false',
            'data_type': 'boolean',
            'description': 'Whether prices include tax'
        },
        {
            'section': 'taxes',
            'key': 'taxLabel',
            'value': 'Tax',
            'default_value': 'Tax',
            'data_type': 'string',
            'description': 'Label for tax on receipts'
        },
        {
            'section': 'taxes',
            'key': 'enableMultipleTaxRates',
            'value': 'false',
            'default_value': 'false',
            'data_type': 'boolean',
            'description': 'Enable multiple tax rates support'
        },

        # ===== HARDWARE SETTINGS =====
        {
            'section': 'hardware',
            'key': 'printerEnabled',
            'value': 'false',
            'default_value': 'false',
            'data_type': 'boolean',
            'description': 'Enable receipt printer'
        },
        {
            'section': 'hardware',
            'key': 'printerName',
            'value': '',
            'default_value': '',
            'data_type': 'string',
            'description': 'Printer device name'
        },
        {
            'section': 'hardware',
            'key': 'cashDrawerEnabled',
            'value': 'false',
            'default_value': 'false',
            'data_type': 'boolean',
            'description': 'Enable cash drawer'
        },
        {
            'section': 'hardware',
            'key': 'barcodeReaderEnabled',
            'value': 'false',
            'default_value': 'false',
            'data_type': 'boolean',
            'description': 'Enable barcode reader'
        },
        {
            'section': 'hardware',
            'key': 'displayEnabled',
            'value': 'false',
            'default_value': 'false',
            'data_type': 'boolean',
            'description': 'Enable customer display'
        },

        # ===== RECEIPT SETTINGS =====
        {
            'section': 'receipts',
            'key': 'showLogo',
            'value': 'false',
            'default_value': 'false',
            'data_type': 'boolean',
            'description': 'Show logo on receipts'
        },
        {
            'section': 'receipts',
            'key': 'logoUrl',
            'value': '',
            'default_value': '',
            'data_type': 'string',
            'description': 'Receipt logo URL or path'
        },
        {
            'section': 'receipts',
            'key': 'headerText',
            'value': 'Thank you for your purchase!',
            'default_value': 'Thank you for your purchase!',
            'data_type': 'string',
            'description': 'Receipt header text'
        },
        {
            'section': 'receipts',
            'key': 'footerText',
            'value': 'Please come again!',
            'default_value': 'Please come again!',
            'data_type': 'string',
            'description': 'Receipt footer text'
        },
        {
            'section': 'receipts',
            'key': 'customHeader',
            'value': '',
            'default_value': '',
            'data_type': 'string',
            'description': 'Custom header text'
        },
        {
            'section': 'receipts',
            'key': 'customFooter',
            'value': '',
            'default_value': '',
            'data_type': 'string',
            'description': 'Custom footer text'
        },
        {
            'section': 'receipts',
            'key': 'showTaxBreakdown',
            'value': 'true',
            'default_value': 'true',
            'data_type': 'boolean',
            'description': 'Show tax breakdown on receipts'
        },
        {
            'section': 'receipts',
            'key': 'showBarcode',
            'value': 'false',
            'default_value': 'false',
            'data_type': 'boolean',
            'description': 'Show barcode on receipts'
        },
        {
            'section': 'receipts',
            'key': 'showQRCode',
            'value': 'false',
            'default_value': 'false',
            'data_type': 'boolean',
            'description': 'Show QR code on receipts'
        },
        {
            'section': 'receipts',
            'key': 'paperSize',
            'value': 'A4',
            'default_value': 'A4',
            'data_type': 'string',
            'description': 'Receipt paper size'
        },
        # New comprehensive receipt settings
        {
            'section': 'receipts',
            'key': 'paperType',
            'value': 'thermal',
            'default_value': 'thermal',
            'data_type': 'string',
            'description': 'Paper type: thermal, standard, or custom'
        },
        {
            'section': 'receipts',
            'key': 'paperWidth',
            'value': '80mm',
            'default_value': '80mm',
            'data_type': 'string',
            'description': 'Paper width: 58mm, 80mm, 110mm, A4, Letter, or custom'
        },
        {
            'section': 'receipts',
            'key': 'paperHeight',
            'value': 'continuous',
            'default_value': 'continuous',
            'data_type': 'string',
            'description': 'Paper height: continuous, A4, Letter, or custom'
        },
        {
            'section': 'receipts',
            'key': 'customPaperWidth',
            'value': '80',
            'default_value': '80',
            'data_type': 'number',
            'description': 'Custom paper width in mm or inches'
        },
        {
            'section': 'receipts',
            'key': 'customPaperHeight',
            'value': '297',
            'default_value': '297',
            'data_type': 'number',
            'description': 'Custom paper height in mm or inches'
        },
        {
            'section': 'receipts',
            'key': 'paperUnit',
            'value': 'mm',
            'default_value': 'mm',
            'data_type': 'string',
            'description': 'Paper measurement unit: mm or inches'
        },
        {
            'section': 'receipts',
            'key': 'fontFamily',
            'value': 'monospace',
            'default_value': 'monospace',
            'data_type': 'string',
            'description': 'Font family: monospace, sans-serif, or serif'
        },
        {
            'section': 'receipts',
            'key': 'headerFontSize',
            'value': '14',
            'default_value': '14',
            'data_type': 'number',
            'description': 'Header font size in pixels'
        },
        {
            'section': 'receipts',
            'key': 'itemFontSize',
            'value': '12',
            'default_value': '12',
            'data_type': 'number',
            'description': 'Item font size in pixels'
        },
        {
            'section': 'receipts',
            'key': 'totalFontSize',
            'value': '13',
            'default_value': '13',
            'data_type': 'number',
            'description': 'Total font size in pixels'
        },
        {
            'section': 'receipts',
            'key': 'footerFontSize',
            'value': '11',
            'default_value': '11',
            'data_type': 'number',
            'description': 'Footer font size in pixels'
        },
        {
            'section': 'receipts',
            'key': 'headerFontWeight',
            'value': 'bold',
            'default_value': 'bold',
            'data_type': 'string',
            'description': 'Header font weight: normal or bold'
        },
        {
            'section': 'receipts',
            'key': 'itemFontWeight',
            'value': 'normal',
            'default_value': 'normal',
            'data_type': 'string',
            'description': 'Item font weight: normal or bold'
        },
        {
            'section': 'receipts',
            'key': 'totalFontWeight',
            'value': 'bold',
            'default_value': 'bold',
            'data_type': 'string',
            'description': 'Total font weight: normal or bold'
        },
        {
            'section': 'receipts',
            'key': 'footerFontWeight',
            'value': 'normal',
            'default_value': 'normal',
            'data_type': 'string',
            'description': 'Footer font weight: normal or bold'
        },
        {
            'section': 'receipts',
            'key': 'characterSpacing',
            'value': '0',
            'default_value': '0',
            'data_type': 'number',
            'description': 'Character spacing in pixels'
        },
        {
            'section': 'receipts',
            'key': 'lineHeight',
            'value': '1.2',
            'default_value': '1.2',
            'data_type': 'number',
            'description': 'Line height multiplier'
        },
        {
            'section': 'receipts',
            'key': 'sectionSpacing',
            'value': '10',
            'default_value': '10',
            'data_type': 'number',
            'description': 'Spacing between receipt sections in pixels'
        },
        {
            'section': 'receipts',
            'key': 'activeTemplate',
            'value': 'standard',
            'default_value': 'standard',
            'data_type': 'string',
            'description': 'Active receipt template: standard, compact, detailed, minimal, or custom'
        },

        # ===== DISPLAY SETTINGS =====
        {
            'section': 'display',
            'key': 'theme',
            'value': 'light',
            'default_value': 'light',
            'data_type': 'string',
            'description': 'UI theme: light or dark'
        },
        {
            'section': 'display',
            'key': 'fontSize',
            'value': 'medium',
            'default_value': 'medium',
            'data_type': 'string',
            'description': 'UI font size: small, medium, or large'
        },
        {
            'section': 'display',
            'key': 'screenTimeout',
            'value': '0',
            'default_value': '0',
            'data_type': 'number',
            'description': 'Screen timeout in minutes (0 = never)'
        },
        {
            'section': 'display',
            'key': 'show_walkthrough',
            'value': 'true',
            'default_value': 'true',
            'data_type': 'boolean',
            'description': 'Show walkthrough tutorial on first login'
        },

        # ===== SECURITY SETTINGS =====
        {
            'section': 'security',
            'key': 'sessionTimeout',
            'value': '0',
            'default_value': '0',
            'data_type': 'number',
            'description': 'Session timeout in minutes (0 = disabled)'
        },
        {
            'section': 'security',
            'key': 'requirePinForRefunds',
            'value': 'true',
            'default_value': 'true',
            'data_type': 'boolean',
            'description': 'Require PIN for refund transactions'
        },
        {
            'section': 'security',
            'key': 'requirePinForVoids',
            'value': 'true',
            'default_value': 'true',
            'data_type': 'boolean',
            'description': 'Require PIN for void transactions'
        },
        {
            'section': 'security',
            'key': 'requirePinForDiscounts',
            'value': 'false',
            'default_value': 'false',
            'data_type': 'boolean',
            'description': 'Require PIN for applying discounts'
        },

        # ===== INVENTORY SETTINGS - Stock Tracking =====
        {
            'section': 'inventory',
            'key': 'enableStockTracking',
            'value': 'true',
            'default_value': 'true',
            'data_type': 'boolean',
            'description': 'Enable stock tracking'
        },
        {
            'section': 'inventory',
            'key': 'trackBySerialNumber',
            'value': 'false',
            'default_value': 'false',
            'data_type': 'boolean',
            'description': 'Track inventory by serial number'
        },
        {
            'section': 'inventory',
            'key': 'trackByBatchNumber',
            'value': 'false',
            'default_value': 'false',
            'data_type': 'boolean',
            'description': 'Track inventory by batch number'
        },
        {
            'section': 'inventory',
            'key': 'trackByExpiryDate',
            'value': 'false',
            'default_value': 'false',
            'data_type': 'boolean',
            'description': 'Track inventory by expiry date'
        },

        # ===== INVENTORY SETTINGS - Alerts =====
        {
            'section': 'inventory',
            'key': 'enableLowStockAlerts',
            'value': 'true',
            'default_value': 'true',
            'data_type': 'boolean',
            'description': 'Enable low stock alerts'
        },
        {
            'section': 'inventory',
            'key': 'lowStockThreshold',
            'value': '10',
            'default_value': '10',
            'data_type': 'number',
            'description': 'Low stock threshold value'
        },
        {
            'section': 'inventory',
            'key': 'lowStockThresholdType',
            'value': 'absolute',
            'default_value': 'absolute',
            'data_type': 'string',
            'description': 'Low stock threshold type: absolute or percentage'
        },
        {
            'section': 'inventory',
            'key': 'enableOutOfStockAlerts',
            'value': 'true',
            'default_value': 'true',
            'data_type': 'boolean',
            'description': 'Enable out of stock alerts'
        },
        {
            'section': 'inventory',
            'key': 'alertRecipients',
            'value': json.dumps([]),
            'default_value': json.dumps([]),
            'data_type': 'json',
            'description': 'List of email addresses for stock alerts'
        },

        # ===== INVENTORY SETTINGS - Stock Deduction =====
        {
            'section': 'inventory',
            'key': 'stockDeductionMode',
            'value': 'automatic',
            'default_value': 'automatic',
            'data_type': 'string',
            'description': 'Stock deduction mode: automatic or manual'
        },
        {
            'section': 'inventory',
            'key': 'allowNegativeStock',
            'value': 'false',
            'default_value': 'false',
            'data_type': 'boolean',
            'description': 'Allow negative stock levels'
        },
        {
            'section': 'inventory',
            'key': 'deductOnSale',
            'value': 'true',
            'default_value': 'true',
            'data_type': 'boolean',
            'description': 'Deduct stock on sale'
        },
        {
            'section': 'inventory',
            'key': 'deductOnOrder',
            'value': 'false',
            'default_value': 'false',
            'data_type': 'boolean',
            'description': 'Deduct stock on order'
        },

        # ===== INVENTORY SETTINGS - Reorder Points =====
        {
            'section': 'inventory',
            'key': 'enableAutoReorder',
            'value': 'false',
            'default_value': 'false',
            'data_type': 'boolean',
            'description': 'Enable automatic reordering'
        },
        {
            'section': 'inventory',
            'key': 'autoReorderThreshold',
            'value': '5',
            'default_value': '5',
            'data_type': 'number',
            'description': 'Auto reorder threshold'
        },
        {
            'section': 'inventory',
            'key': 'autoReorderQuantity',
            'value': '20',
            'default_value': '20',
            'data_type': 'number',
            'description': 'Auto reorder quantity'
        },
        {
            'section': 'inventory',
            'key': 'enableReorderPointCalculation',
            'value': 'false',
            'default_value': 'false',
            'data_type': 'boolean',
            'description': 'Enable automatic reorder point calculation'
        },

        # ===== INVENTORY SETTINGS - Unit of Measurement =====
        {
            'section': 'inventory',
            'key': 'defaultUOM',
            'value': 'pieces',
            'default_value': 'pieces',
            'data_type': 'string',
            'description': 'Default unit of measurement'
        },
        {
            'section': 'inventory',
            'key': 'enableMultipleUOM',
            'value': 'false',
            'default_value': 'false',
            'data_type': 'boolean',
            'description': 'Enable multiple units of measurement'
        },
        {
            'section': 'inventory',
            'key': 'uomConversionEnabled',
            'value': 'false',
            'default_value': 'false',
            'data_type': 'boolean',
            'description': 'Enable UOM conversion'
        },

        # ===== INVENTORY SETTINGS - Barcode =====
        {
            'section': 'inventory',
            'key': 'enableBarcodeScanning',
            'value': 'true',
            'default_value': 'true',
            'data_type': 'boolean',
            'description': 'Enable barcode scanning'
        },
        {
            'section': 'inventory',
            'key': 'barcodeFormat',
            'value': 'EAN13',
            'default_value': 'EAN13',
            'data_type': 'string',
            'description': 'Barcode format: EAN13, UPC, CODE128, QR'
        },
        {
            'section': 'inventory',
            'key': 'autoGenerateBarcode',
            'value': 'false',
            'default_value': 'false',
            'data_type': 'boolean',
            'description': 'Auto-generate barcodes for new products'
        },
        {
            'section': 'inventory',
            'key': 'barcodePrefix',
            'value': '',
            'default_value': '',
            'data_type': 'string',
            'description': 'Barcode prefix for auto-generation'
        },

        # ===== INVENTORY SETTINGS - Multi-Location =====
        {
            'section': 'inventory',
            'key': 'enableMultiLocation',
            'value': 'false',
            'default_value': 'false',
            'data_type': 'boolean',
            'description': 'Enable multi-location inventory'
        },
        {
            'section': 'inventory',
            'key': 'defaultLocation',
            'value': 'Main Warehouse',
            'default_value': 'Main Warehouse',
            'data_type': 'string',
            'description': 'Default warehouse/location'
        },
        {
            'section': 'inventory',
            'key': 'transferBetweenLocations',
            'value': 'false',
            'default_value': 'false',
            'data_type': 'boolean',
            'description': 'Enable stock transfers between locations'
        },

        # ===== INVENTORY SETTINGS - Valuation =====
        {
            'section': 'inventory',
            'key': 'valuationMethod',
            'value': 'FIFO',
            'default_value': 'FIFO',
            'data_type': 'string',
            'description': 'Stock valuation method: FIFO, LIFO, Weighted Average'
        },
        {
            'section': 'inventory',
            'key': 'enableCostTracking',
            'value': 'true',
            'default_value': 'true',
            'data_type': 'boolean',
            'description': 'Enable cost tracking'
        },

        # ===== INVENTORY SETTINGS - Waste & Adjustment =====
        {
            'section': 'inventory',
            'key': 'enableWasteTracking',
            'value': 'false',
            'default_value': 'false',
            'data_type': 'boolean',
            'description': 'Enable waste tracking'
        },
        {
            'section': 'inventory',
            'key': 'wasteReasons',
            'value': json.dumps(['Damaged', 'Expired', 'Lost', 'Other']),
            'default_value': json.dumps(['Damaged', 'Expired', 'Lost', 'Other']),
            'data_type': 'json',
            'description': 'Predefined waste reasons'
        },
        {
            'section': 'inventory',
            'key': 'requireWasteApproval',
            'value': 'false',
            'default_value': 'false',
            'data_type': 'boolean',
            'description': 'Require approval for waste entries'
        },
        {
            'section': 'inventory',
            'key': 'enableStockAdjustment',
            'value': 'true',
            'default_value': 'true',
            'data_type': 'boolean',
            'description': 'Enable stock adjustments'
        },
        {
            'section': 'inventory',
            'key': 'requireAdjustmentReason',
            'value': 'true',
            'default_value': 'true',
            'data_type': 'boolean',
            'description': 'Require reason for stock adjustments'
        },

        # ===== INVENTORY SETTINGS - Restaurant-Specific =====
        {
            'section': 'inventory',
            'key': 'enableRecipeManagement',
            'value': 'false',
            'default_value': 'false',
            'data_type': 'boolean',
            'description': 'Enable recipe management'
        },
        {
            'section': 'inventory',
            'key': 'enablePortionControl',
            'value': 'false',
            'default_value': 'false',
            'data_type': 'boolean',
            'description': 'Enable portion control'
        },
        {
            'section': 'inventory',
            'key': 'enablePrepItemTracking',
            'value': 'false',
            'default_value': 'false',
            'data_type': 'boolean',
            'description': 'Enable prep item tracking'
        },
        {
            'section': 'inventory',
            'key': 'ingredientCostTracking',
            'value': 'true',
            'default_value': 'true',
            'data_type': 'boolean',
            'description': 'Enable ingredient cost tracking'
        },

        # ===== INVENTORY SETTINGS - Retail-Specific =====
        {
            'section': 'inventory',
            'key': 'enableVariantTracking',
            'value': 'true',
            'default_value': 'true',
            'data_type': 'boolean',
            'description': 'Enable product variant tracking'
        },
        {
            'section': 'inventory',
            'key': 'enableSKUManagement',
            'value': 'true',
            'default_value': 'true',
            'data_type': 'boolean',
            'description': 'Enable SKU management'
        },
        {
            'section': 'inventory',
            'key': 'enableSizeColorTracking',
            'value': 'false',
            'default_value': 'false',
            'data_type': 'boolean',
            'description': 'Enable size/color tracking'
        },

        # ===== INTEGRATION SETTINGS =====
        {
            'section': 'integration',
            'key': 'enableCloudSync',
            'value': 'false',
            'default_value': 'false',
            'data_type': 'boolean',
            'description': 'Enable cloud synchronization'
        },
        {
            'section': 'integration',
            'key': 'cloudSyncInterval',
            'value': '60',
            'default_value': '60',
            'data_type': 'number',
            'description': 'Cloud sync interval in minutes'
        },
        {
            'section': 'integration',
            'key': 'enableEmailReceipts',
            'value': 'false',
            'default_value': 'false',
            'data_type': 'boolean',
            'description': 'Enable email receipts'
        },
        {
            'section': 'integration',
            'key': 'smtpServer',
            'value': '',
            'default_value': '',
            'data_type': 'string',
            'description': 'SMTP server address'
        },
        {
            'section': 'integration',
            'key': 'smtpPort',
            'value': '587',
            'default_value': '587',
            'data_type': 'number',
            'description': 'SMTP server port'
        },
        {
            'section': 'integration',
            'key': 'smtpUsername',
            'value': '',
            'default_value': '',
            'data_type': 'string',
            'description': 'SMTP username'
        },

        # ===== BACKUP SETTINGS =====
        {
            'section': 'backup',
            'key': 'enableAutoBackup',
            'value': 'false',
            'default_value': 'false',
            'data_type': 'boolean',
            'description': 'Enable automatic backups'
        },
        {
            'section': 'backup',
            'key': 'backupInterval',
            'value': '24',
            'default_value': '24',
            'data_type': 'number',
            'description': 'Backup interval in hours'
        },
        {
            'section': 'backup',
            'key': 'backupLocation',
            'value': '',
            'default_value': '',
            'data_type': 'string',
            'description': 'Backup storage location'
        },
        {
            'section': 'backup',
            'key': 'lastBackupDate',
            'value': '',
            'default_value': '',
            'data_type': 'string',
            'description': 'Last backup date/time'
        },

        # ===== ABOUT/SYSTEM INFO =====
        {
            'section': 'about',
            'key': 'appVersion',
            'value': '1.0.0',
            'default_value': '1.0.0',
            'data_type': 'string',
            'description': 'Application version'
        },
        {
            'section': 'about',
            'key': 'buildNumber',
            'value': '1',
            'default_value': '1',
            'data_type': 'string',
            'description': 'Build number'
        },
        {
            'section': 'about',
            'key': 'lastUpdateCheck',
            'value': '',
            'default_value': '',
            'data_type': 'string',
            'description': 'Last update check date/time'
        },
        {
            'section': 'about',
            'key': 'databaseVersion',
            'value': '1.0.0',
            'default_value': '1.0.0',
            'data_type': 'string',
            'description': 'Database schema version'
        },
    ]

