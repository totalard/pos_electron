/**
 * Payment and order splitting types
 */

/**
 * Split type for bill splitting
 */
export type SplitType = 'equal' | 'amount' | 'percentage' | 'items'

/**
 * Payment split definition
 */
export interface PaymentSplit {
  id: string
  name: string // e.g., "Person 1", "John", "Card 1"
  splitType: SplitType
  amount: number
  percentage?: number
  itemIds?: string[] // For item-based splits
  paymentMethod?: string
  isPaid: boolean
  paidAt?: Date
}

/**
 * Split payment configuration
 */
export interface SplitPaymentConfig {
  enabled: boolean
  splits: PaymentSplit[]
  totalAmount: number
  remainingAmount: number
}
