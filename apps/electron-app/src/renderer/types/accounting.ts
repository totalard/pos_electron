/**
 * TypeScript types for Accounting module
 */

export interface Account {
  id: number
  account_code: string
  account_name: string
  account_type: AccountType
  account_subtype?: AccountSubType
  description?: string
  current_balance: number
  is_active: boolean
  is_system: boolean
  parent_account_id?: number
  parent_account_name?: string
  created_by_id?: number
  created_by_name?: string
  created_at: string
  updated_at: string
}

export type AccountType = 'asset' | 'liability' | 'equity' | 'income' | 'expense'

export type AccountSubType =
  | 'cash'
  | 'bank'
  | 'inventory'
  | 'accounts_receivable'
  | 'accounts_payable'
  | 'owners_capital'
  | 'retained_earnings'
  | 'sales_revenue'
  | 'other_income'
  | 'cost_of_goods_sold'
  | 'operating_expenses'
  | 'rent'
  | 'utilities'
  | 'salaries'
  | 'supplies'
  | 'marketing'
  | 'maintenance'
  | 'transportation'
  | 'insurance'
  | 'taxes'
  | 'other_expenses'

export interface AccountCreate {
  account_code: string
  account_name: string
  account_type: AccountType
  account_subtype?: AccountSubType
  description?: string
  current_balance?: number
  is_active?: boolean
  parent_account_id?: number
}

export interface JournalEntry {
  id: number
  entry_number: string
  entry_date: string
  entry_type: JournalEntryType
  description: string
  reference_type?: string
  reference_id?: number
  reference_number?: string
  status: JournalEntryStatus
  posted_at?: string
  total_debit: number
  total_credit: number
  created_by_id?: number
  created_by_name?: string
  posted_by_id?: number
  posted_by_name?: string
  notes?: string
  lines: JournalEntryLine[]
  created_at: string
  updated_at: string
}

export type JournalEntryType = 'general' | 'sales' | 'purchase' | 'payment' | 'receipt' | 'adjustment' | 'closing' | 'opening'
export type JournalEntryStatus = 'draft' | 'posted' | 'void'

export interface JournalEntryLine {
  id: number
  account_id: number
  account_code?: string
  account_name?: string
  description?: string
  debit_amount: number
  credit_amount: number
  line_number: number
}

export interface JournalEntryLineCreate {
  account_id: number
  description?: string
  debit_amount: number
  credit_amount: number
}

export interface JournalEntryCreate {
  entry_date: string
  entry_type: JournalEntryType
  description: string
  reference_type?: string
  reference_id?: number
  reference_number?: string
  notes?: string
  lines: JournalEntryLineCreate[]
  auto_post?: boolean
}

export interface Purchase {
  id: number
  purchase_number: string
  vendor_name: string
  vendor_contact?: string
  vendor_address?: string
  purchase_date: string
  expected_delivery_date?: string
  actual_delivery_date?: string
  subtotal: number
  tax_amount: number
  shipping_cost: number
  total_amount: number
  payment_method?: string
  payment_status: string
  amount_paid: number
  status: PurchaseStatus
  items: PurchaseItem[]
  invoice_number?: string
  notes?: string
  created_by_id?: number
  received_by_id?: number
  created_at: string
  updated_at: string
}

export type PurchaseStatus = 'draft' | 'ordered' | 'received' | 'partial' | 'cancelled'

export interface PurchaseItem {
  product_id: number
  product_name: string
  barcode?: string
  quantity: number
  unit_cost: number
  total_cost: number
}

export interface PurchaseCreate {
  vendor_name: string
  vendor_contact?: string
  vendor_address?: string
  purchase_date: string
  expected_delivery_date?: string
  subtotal: number
  tax_amount: number
  shipping_cost: number
  total_amount: number
  payment_method?: string
  items: PurchaseItem[]
  invoice_number?: string
  notes?: string
}

export interface FiscalYear {
  id: number
  year_name: string
  start_date: string
  end_date: string
  status: FiscalYearStatus
  opening_balance: number
  closing_balance: number
  total_income: number
  total_expenses: number
  net_profit_loss: number
  closed_at?: string
  closed_by_id?: number
  closed_by_name?: string
  closing_notes?: string
  created_at: string
}

export type FiscalYearStatus = 'open' | 'closed' | 'locked'

export interface FinancialReport {
  report_type: string
  start_date: string
  end_date: string
  total_income: number
  total_expenses: number
  net_profit: number
  income_items?: ReportItem[]
  expense_items?: ReportItem[]
}

export interface ReportItem {
  account_code: string
  account_name: string
  amount: number
}

export interface TrialBalance {
  as_of_date: string
  accounts: AccountBalance[]
  total_debit: number
  total_credit: number
  is_balanced: boolean
}

export interface AccountBalance {
  account_id: number
  account_code: string
  account_name: string
  account_type: AccountType
  current_balance: number
  total_debit: number
  total_credit: number
  transaction_count: number
}
