import { useCurrency, CurrencyFormatOptions } from '../../hooks/useCurrency'

export interface CurrencyDisplayProps {
  /** The numeric amount to display */
  amount: number
  /** Additional CSS classes */
  className?: string
  /** Show currency symbol (default: true) */
  showSymbol?: boolean
  /** Show currency code (default: from settings) */
  showCode?: boolean
  /** Use Indian numbering system (default: from settings) */
  useIndianNumbering?: boolean
  /** Prefix text before currency */
  prefix?: string
  /** Suffix text after currency */
  suffix?: string
}

/**
 * CurrencyDisplay Component
 * 
 * A reusable component for displaying currency values with proper formatting
 * based on business settings. Supports multiple currencies, decimal places,
 * thousand separators, and Indian numbering system.
 * 
 * @example
 * ```tsx
 * <CurrencyDisplay amount={1234.56} />
 * <CurrencyDisplay amount={1234.56} className="text-2xl font-bold" />
 * <CurrencyDisplay amount={1234.56} showCode={true} />
 * <CurrencyDisplay amount={1234.56} prefix="Total: " />
 * ```
 */
export function CurrencyDisplay({
  amount,
  className = '',
  showSymbol,
  showCode,
  useIndianNumbering,
  prefix,
  suffix
}: CurrencyDisplayProps) {
  const { formatCurrency } = useCurrency()

  const options: CurrencyFormatOptions = {}
  if (showSymbol !== undefined) options.showSymbol = showSymbol
  if (showCode !== undefined) options.showCode = showCode
  if (useIndianNumbering !== undefined) options.useIndianNumbering = useIndianNumbering

  const formattedAmount = formatCurrency(amount, options)

  return (
    <span className={className}>
      {prefix && <span>{prefix}</span>}
      {formattedAmount}
      {suffix && <span>{suffix}</span>}
    </span>
  )
}
