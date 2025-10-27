# Cash Denomination Management Feature

## Overview
This feature allows users to configure bills and coins for different currencies, with pre-configured defaults for Middle East and Indian currencies.

## Supported Currencies

### Middle East Currencies
- **UAE Dirham (AED)**: Bills: 1000, 500, 200, 100, 50, 20, 10, 5 | Coins: 1, 0.50, 0.25
- **Saudi Riyal (SAR)**: Bills: 500, 100, 50, 10, 5, 1 | Coins: 2, 1, 0.50, 0.25, 0.10, 0.05
- **Kuwaiti Dinar (KWD)**: Bills: 20, 10, 5, 1, 0.5, 0.25 | Coins: 0.100, 0.050, 0.020, 0.010, 0.005
- **Bahraini Dinar (BHD)**: Bills: 20, 10, 5, 1, 0.5 | Coins: 0.500, 0.100, 0.050, 0.025, 0.010, 0.005
- **Omani Rial (OMR)**: Bills: 50, 20, 10, 5, 1, 0.5 | Coins: 0.100, 0.050, 0.025, 0.010, 0.005
- **Qatari Riyal (QAR)**: Bills: 500, 100, 50, 10, 5, 1 | Coins: 1, 0.50, 0.25

### Indian Currency
- **Indian Rupee (INR)**: Bills: 2000, 500, 200, 100, 50, 20, 10, 5, 2 | Coins: 10, 5, 2, 1, 0.50

### Other Supported Currencies
- **US Dollar (USD)**: Bills: 100, 50, 20, 10, 5, 1 | Coins: 1, 0.25, 0.10, 0.05, 0.01
- **Euro (EUR)**: Bills: 500, 200, 100, 50, 20, 10, 5 | Coins: 2, 1, 0.50, 0.20, 0.10, 0.05, 0.02, 0.01
- **British Pound (GBP)**: Bills: 50, 20, 10, 5 | Coins: 2, 1, 0.50, 0.20, 0.10, 0.05, 0.02, 0.01

## Features

### 1. Currency-Specific Denominations
- Each currency has its own set of bills and coins
- Defaults are based on official central bank data
- Automatically loads correct denominations when currency is changed

### 2. Customizable Configuration
- Enable/disable specific denominations
- Add custom denominations if needed
- Remove denominations that are not used
- Reset to defaults at any time

### 3. Integration with POS Sessions
- Session creation uses configured denominations
- Session closure uses configured denominations
- Automatic calculation of totals
- Variance tracking between expected and actual cash

## Usage

### Accessing Denomination Management
1. Navigate to **Settings**
2. Click on **Cash Denominations** in the navigation menu
3. The panel will show denominations for the currently selected currency

### Configuring Denominations
1. **Toggle Denominations**: Click the toggle switch to enable/disable specific bills or coins
2. **Add Custom Denomination**: Click "Add Custom Bill/Coin" and enter the value
3. **Remove Denomination**: Click the trash icon next to a denomination
4. **Reset to Defaults**: Click "Reset to Defaults" to restore original configuration
5. **Save Changes**: Click "Save Changes" when done

### Using in POS Sessions
1. **Session Creation**: When opening a session, count cash using the configured denominations
2. **Session Closure**: When closing a session, count cash using the same denominations
3. The system automatically calculates totals and variance

## Technical Implementation

### Frontend Components
- **`currencyDenominations.ts`**: Configuration module with defaults for all currencies
- **`DenominationManagementPanel.tsx`**: Settings panel for managing denominations
- **`SessionCreationSidebar.tsx`**: Updated to use currency-specific denominations
- **`SessionClosureDialog.tsx`**: Updated to use currency-specific denominations

### Backend
- **`currency_denominations.py`**: Python utility for denomination defaults
- **`settings_defaults.py`**: Database defaults for denomination configuration

### Data Structure
```typescript
interface DenominationConfig {
  value: number          // Denomination value (e.g., 100, 0.25)
  enabled: boolean       // Whether this denomination is active
  label?: string         // Display label
}

interface CurrencyDenominationsConfig {
  bills: DenominationConfig[]
  coins: DenominationConfig[]
  useDefaults: boolean   // Whether using default or custom config
}

// Stored per currency code
denominationsConfig: Record<string, CurrencyDenominationsConfig>
```

## Configuration Storage
- Denominations are stored in the settings database
- Configuration is per currency (e.g., USD, INR, AED)
- Changes persist across sessions
- Synced between frontend and backend

## Best Practices

### For Retailers
1. Enable only denominations commonly used in your region
2. Disable rarely used denominations to simplify cash counting
3. Review and update configuration when currency changes

### For Multi-Currency Operations
1. Configure denominations for each currency you accept
2. Ensure staff are trained on different currency denominations
3. Regularly verify cash counts match expected amounts

### For Cash Management
1. Use denomination counts to track cash drawer composition
2. Monitor variance reports to identify discrepancies
3. Adjust denominations based on actual usage patterns

## Troubleshooting

### Denominations Not Showing
- Ensure currency is properly configured in Business Settings
- Check that denomination configuration is saved
- Verify browser cache is cleared after updates

### Custom Denominations Not Saving
- Ensure value is greater than 0
- Check that denomination doesn't already exist
- Verify you clicked "Save Changes"

### Session Creation Shows Wrong Denominations
- Verify correct currency is selected in Business Settings
- Check denomination configuration for that currency
- Try resetting to defaults and reconfiguring

## Future Enhancements
- Import/export denomination configurations
- Denomination usage analytics
- Automatic denomination suggestions based on transaction history
- Multi-denomination cash drawer tracking
- Integration with cash counting machines

## Related Documentation
- [Currency Configuration Guide](./apps/electron-app/README.md)
- [POS Session Management](./apps/python-backend/docs/POS_SESSIONS.md)
- [Settings Management](./apps/python-backend/docs/SETTINGS_REFACTORING_SUMMARY.md)
