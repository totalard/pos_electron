import { useSettingsStore } from '../stores'

export interface CurrencyFormatOptions {
  showSymbol?: boolean
  showCode?: boolean
  useIndianNumbering?: boolean
}

/**
 * Custom hook for currency formatting based on business settings
 * Supports multiple currencies, decimal places, separators, and Indian numbering system
 */
export function useCurrency() {
  const { business } = useSettingsStore()
  const { currencyConfig } = business

  /**
   * Format a number as currency based on configured settings
   * @param amount - The numeric amount to format
   * @param options - Optional formatting overrides
   * @returns Formatted currency string
   */
  const formatCurrency = (
    amount: number,
    options: CurrencyFormatOptions = {}
  ): string => {
    const {
      showSymbol = true,
      showCode = currencyConfig.showCurrencyCode,
      useIndianNumbering = currencyConfig.regionSpecific.india.enabled &&
        currencyConfig.regionSpecific.india.useIndianNumbering
    } = options

    // Handle decimal places based on region-specific settings
    let decimalPlaces = currencyConfig.decimalPlaces
    
    // For Indian currency, check if paisa should be shown
    if (
      currencyConfig.code === 'INR' &&
      currencyConfig.regionSpecific.india.enabled &&
      !currencyConfig.regionSpecific.india.showPaisa
    ) {
      decimalPlaces = 0
    }

    // Format the number with decimal places
    const fixedAmount = amount.toFixed(decimalPlaces)
    const [integerPart, decimalPart] = fixedAmount.split('.')

    // Apply thousand separator based on numbering system
    let formattedInteger: string
    
    if (useIndianNumbering && currencyConfig.code === 'INR') {
      // Indian numbering system: 1,23,45,678.00
      formattedInteger = formatIndianNumbering(integerPart)
    } else {
      // Western numbering system: 1,234,567.00
      formattedInteger = integerPart.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        currencyConfig.thousandSeparator
      )
    }

    // Combine integer and decimal parts
    const formattedValue = decimalPart
      ? `${formattedInteger}${currencyConfig.decimalSeparator}${decimalPart}`
      : formattedInteger

    // Build final string with symbol and code
    let result = formattedValue

    if (showSymbol) {
      if (currencyConfig.symbolPosition === 'before') {
        result = `${currencyConfig.symbol}${result}`
      } else {
        result = `${result}${currencyConfig.symbol}`
      }
    }

    if (showCode) {
      result = `${result} ${currencyConfig.code}`
    }

    return result
  }

  /**
   * Format number using Indian numbering system (lakhs and crores)
   * @param integerStr - String representation of integer part
   * @returns Formatted string with Indian separators
   */
  const formatIndianNumbering = (integerStr: string): string => {
    const { thousandSeparator } = currencyConfig
    
    // For numbers less than 1000, no separator needed
    if (integerStr.length <= 3) {
      return integerStr
    }

    // Split into last 3 digits and the rest
    const lastThree = integerStr.slice(-3)
    const remaining = integerStr.slice(0, -3)

    // Add separator every 2 digits for the remaining part
    const formattedRemaining = remaining.replace(
      /\B(?=(\d{2})+(?!\d))/g,
      thousandSeparator
    )

    return `${formattedRemaining}${thousandSeparator}${lastThree}`
  }

  /**
   * Parse a formatted currency string back to a number
   * @param formattedAmount - Formatted currency string
   * @returns Numeric value
   */
  const parseCurrency = (formattedAmount: string): number => {
    // Remove currency symbol and code
    let cleaned = formattedAmount
      .replace(currencyConfig.symbol, '')
      .replace(currencyConfig.code, '')
      .trim()

    // Replace thousand separators
    cleaned = cleaned.replace(new RegExp(`\\${currencyConfig.thousandSeparator}`, 'g'), '')

    // Replace decimal separator with standard dot
    cleaned = cleaned.replace(currencyConfig.decimalSeparator, '.')

    return parseFloat(cleaned) || 0
  }

  /**
   * Get currency symbol
   */
  const getCurrencySymbol = (): string => {
    return currencyConfig.symbol
  }

  /**
   * Get currency code
   */
  const getCurrencyCode = (): string => {
    return currencyConfig.code
  }

  /**
   * Get decimal places for current currency
   */
  const getDecimalPlaces = (): number => {
    if (
      currencyConfig.code === 'INR' &&
      currencyConfig.regionSpecific.india.enabled &&
      !currencyConfig.regionSpecific.india.showPaisa
    ) {
      return 0
    }
    return currencyConfig.decimalPlaces
  }

  return {
    formatCurrency,
    parseCurrency,
    getCurrencySymbol,
    getCurrencyCode,
    getDecimalPlaces,
    currencyConfig
  }
}
