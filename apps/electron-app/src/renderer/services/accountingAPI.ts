/**
 * Accounting API Service
 * Handles all accounting-related API calls
 */

import type {
  Account,
  AccountCreate,
  JournalEntry,
  JournalEntryCreate,
  Purchase,
  PurchaseCreate,
  FiscalYear,
  FinancialReport,
  TrialBalance,
  AccountBalance
} from '../types/accounting'

const API_BASE_URL = 'http://localhost:8000/api'

// ============================================================================
// Chart of Accounts
// ============================================================================

export const accountingAPI = {
  // Get all accounts
  async getAccounts(filters?: {
    account_type?: string
    is_active?: boolean
  }): Promise<Account[]> {
    const params = new URLSearchParams()
    if (filters?.account_type) params.append('account_type', filters.account_type)
    if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active))
    
    const response = await fetch(`${API_BASE_URL}/accounting/accounts?${params}`)
    if (!response.ok) throw new Error('Failed to fetch accounts')
    return response.json()
  },

  // Create account
  async createAccount(data: AccountCreate): Promise<Account> {
    const response = await fetch(`${API_BASE_URL}/accounting/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to create account')
    return response.json()
  },

  // Update account
  async updateAccount(id: number, data: Partial<AccountCreate>): Promise<Account> {
    const response = await fetch(`${API_BASE_URL}/accounting/accounts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to update account')
    return response.json()
  },

  // Get account balance
  async getAccountBalance(
    accountId: number,
    startDate?: string,
    endDate?: string
  ): Promise<AccountBalance> {
    const params = new URLSearchParams()
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)
    
    const response = await fetch(`${API_BASE_URL}/accounting/accounts/${accountId}/balance?${params}`)
    if (!response.ok) throw new Error('Failed to fetch account balance')
    return response.json()
  },

  // ============================================================================
  // Journal Entries
  // ============================================================================

  // Get journal entries
  async getJournalEntries(filters?: {
    status?: string
    entry_type?: string
    start_date?: string
    end_date?: string
    page?: number
    page_size?: number
  }): Promise<JournalEntry[]> {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.entry_type) params.append('entry_type', filters.entry_type)
    if (filters?.start_date) params.append('start_date', filters.start_date)
    if (filters?.end_date) params.append('end_date', filters.end_date)
    if (filters?.page) params.append('page', String(filters.page))
    if (filters?.page_size) params.append('page_size', String(filters.page_size))
    
    const response = await fetch(`${API_BASE_URL}/accounting/journal-entries?${params}`)
    if (!response.ok) throw new Error('Failed to fetch journal entries')
    return response.json()
  },

  // Create journal entry
  async createJournalEntry(data: JournalEntryCreate): Promise<JournalEntry> {
    const response = await fetch(`${API_BASE_URL}/accounting/journal-entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to create journal entry')
    }
    return response.json()
  },

  // Post journal entry
  async postJournalEntry(entryId: number): Promise<{ message: string; entry_id: number }> {
    const response = await fetch(`${API_BASE_URL}/accounting/journal-entries/${entryId}/post`, {
      method: 'POST'
    })
    if (!response.ok) throw new Error('Failed to post journal entry')
    return response.json()
  },

  // ============================================================================
  // Financial Reports
  // ============================================================================

  // Get income statement
  async getIncomeStatement(startDate?: string, endDate?: string): Promise<FinancialReport> {
    const params = new URLSearchParams()
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)
    
    const response = await fetch(`${API_BASE_URL}/accounting/reports/income-statement?${params}`)
    if (!response.ok) throw new Error('Failed to fetch income statement')
    return response.json()
  },

  // Get balance sheet
  async getBalanceSheet(asOfDate?: string): Promise<any> {
    const params = new URLSearchParams()
    if (asOfDate) params.append('as_of_date', asOfDate)
    
    const response = await fetch(`${API_BASE_URL}/accounting/reports/balance-sheet?${params}`)
    if (!response.ok) throw new Error('Failed to fetch balance sheet')
    return response.json()
  },

  // Get trial balance
  async getTrialBalance(asOfDate?: string): Promise<TrialBalance> {
    const params = new URLSearchParams()
    if (asOfDate) params.append('as_of_date', asOfDate)
    
    const response = await fetch(`${API_BASE_URL}/accounting/reports/trial-balance?${params}`)
    if (!response.ok) throw new Error('Failed to fetch trial balance')
    return response.json()
  },

  // ============================================================================
  // Fiscal Years
  // ============================================================================

  // Get fiscal years
  async getFiscalYears(): Promise<FiscalYear[]> {
    const response = await fetch(`${API_BASE_URL}/accounting/fiscal-years`)
    if (!response.ok) throw new Error('Failed to fetch fiscal years')
    return response.json()
  },

  // Create fiscal year
  async createFiscalYear(data: {
    year_name: string
    start_date: string
    end_date: string
    opening_balance?: number
  }): Promise<FiscalYear> {
    const response = await fetch(`${API_BASE_URL}/accounting/fiscal-years`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to create fiscal year')
    return response.json()
  }
}

// ============================================================================
// Purchase API
// ============================================================================

export const purchaseAPI = {
  // Get purchases
  async getPurchases(filters?: {
    status?: string
    vendor_name?: string
    start_date?: string
    end_date?: string
  }): Promise<Purchase[]> {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.vendor_name) params.append('vendor_name', filters.vendor_name)
    if (filters?.start_date) params.append('start_date', filters.start_date)
    if (filters?.end_date) params.append('end_date', filters.end_date)
    
    const response = await fetch(`${API_BASE_URL}/purchases?${params}`)
    if (!response.ok) throw new Error('Failed to fetch purchases')
    return response.json()
  },

  // Get purchase by ID
  async getPurchase(id: number): Promise<Purchase> {
    const response = await fetch(`${API_BASE_URL}/purchases/${id}`)
    if (!response.ok) throw new Error('Failed to fetch purchase')
    return response.json()
  },

  // Create purchase
  async createPurchase(data: PurchaseCreate): Promise<Purchase> {
    const response = await fetch(`${API_BASE_URL}/purchases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to create purchase')
    return response.json()
  },

  // Receive purchase
  async receivePurchase(id: number): Promise<Purchase> {
    const response = await fetch(`${API_BASE_URL}/purchases/${id}/receive`, {
      method: 'POST'
    })
    if (!response.ok) throw new Error('Failed to receive purchase')
    return response.json()
  },

  // Update purchase
  async updatePurchase(id: number, data: Partial<PurchaseCreate>): Promise<Purchase> {
    const response = await fetch(`${API_BASE_URL}/purchases/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to update purchase')
    return response.json()
  }
}
