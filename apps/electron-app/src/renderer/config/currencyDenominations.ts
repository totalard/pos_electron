/**
 * Currency Denominations Configuration
 * Defines default bills and coins for different currencies
 */

export interface Denomination {
  value: number
  label: string
  type: 'bill' | 'coin'
}

export interface CurrencyDenominations {
  code: string
  name: string
  bills: number[]
  coins: number[]
}

/**
 * Default denominations for supported currencies
 * Based on official central bank data and common usage
 */
export const CURRENCY_DENOMINATIONS: Record<string, CurrencyDenominations> = {
  // United States Dollar
  USD: {
    code: 'USD',
    name: 'US Dollar',
    bills: [100, 50, 20, 10, 5, 1],
    coins: [1, 0.25, 0.10, 0.05, 0.01]
  },

  // Euro
  EUR: {
    code: 'EUR',
    name: 'Euro',
    bills: [500, 200, 100, 50, 20, 10, 5],
    coins: [2, 1, 0.50, 0.20, 0.10, 0.05, 0.02, 0.01]
  },

  // British Pound
  GBP: {
    code: 'GBP',
    name: 'British Pound',
    bills: [50, 20, 10, 5],
    coins: [2, 1, 0.50, 0.20, 0.10, 0.05, 0.02, 0.01]
  },

  // Indian Rupee
  INR: {
    code: 'INR',
    name: 'Indian Rupee',
    bills: [2000, 500, 200, 100, 50, 20, 10, 5, 2],
    coins: [10, 5, 2, 1, 0.50]
  },

  // UAE Dirham
  AED: {
    code: 'AED',
    name: 'UAE Dirham',
    bills: [1000, 500, 200, 100, 50, 20, 10, 5],
    coins: [1, 0.50, 0.25]
  },

  // Saudi Riyal
  SAR: {
    code: 'SAR',
    name: 'Saudi Riyal',
    bills: [500, 100, 50, 10, 5, 1],
    coins: [2, 1, 0.50, 0.25, 0.10, 0.05]
  },

  // Kuwaiti Dinar (3 decimal places)
  KWD: {
    code: 'KWD',
    name: 'Kuwaiti Dinar',
    bills: [20, 10, 5, 1, 0.5, 0.25],
    coins: [0.100, 0.050, 0.020, 0.010, 0.005]
  },

  // Bahraini Dinar (3 decimal places)
  BHD: {
    code: 'BHD',
    name: 'Bahraini Dinar',
    bills: [20, 10, 5, 1, 0.5],
    coins: [0.500, 0.100, 0.050, 0.025, 0.010, 0.005]
  },

  // Omani Rial (3 decimal places)
  OMR: {
    code: 'OMR',
    name: 'Omani Rial',
    bills: [50, 20, 10, 5, 1, 0.5],
    coins: [0.100, 0.050, 0.025, 0.010, 0.005]
  },

  // Qatari Riyal
  QAR: {
    code: 'QAR',
    name: 'Qatari Riyal',
    bills: [500, 100, 50, 10, 5, 1],
    coins: [1, 0.50, 0.25]
  }
}

/**
 * Get denominations for a specific currency
 * Returns USD as fallback if currency not found
 */
export function getDenominationsForCurrency(currencyCode: string): CurrencyDenominations {
  return CURRENCY_DENOMINATIONS[currencyCode] || CURRENCY_DENOMINATIONS.USD
}

/**
 * Check if a currency has custom denominations configured
 */
export function hasDenominationsConfig(currencyCode: string): boolean {
  return currencyCode in CURRENCY_DENOMINATIONS
}

/**
 * Get all supported currency codes with denominations
 */
export function getSupportedCurrencyCodes(): string[] {
  return Object.keys(CURRENCY_DENOMINATIONS)
}

/**
 * Validate denomination value for a currency
 */
export function isValidDenomination(currencyCode: string, value: number, type: 'bill' | 'coin'): boolean {
  const config = getDenominationsForCurrency(currencyCode)
  const validValues = type === 'bill' ? config.bills : config.coins
  return validValues.includes(value)
}

/**
 * Format denomination for display
 */
export function formatDenominationLabel(
  value: number,
  currencySymbol: string,
  symbolPosition: 'before' | 'after',
  decimalPlaces: number
): string {
  const formatted = value.toFixed(decimalPlaces)
  return symbolPosition === 'before' 
    ? `${currencySymbol}${formatted}`
    : `${formatted}${currencySymbol}`
}
