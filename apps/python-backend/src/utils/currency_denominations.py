"""
Currency Denominations Configuration
Defines default bills and coins for different currencies
"""

from typing import Dict, List

# Default denominations for supported currencies
CURRENCY_DENOMINATIONS: Dict[str, Dict[str, List[float]]] = {
    # United States Dollar
    "USD": {
        "bills": [100, 50, 20, 10, 5, 1],
        "coins": [1, 0.25, 0.10, 0.05, 0.01]
    },
    
    # Euro
    "EUR": {
        "bills": [500, 200, 100, 50, 20, 10, 5],
        "coins": [2, 1, 0.50, 0.20, 0.10, 0.05, 0.02, 0.01]
    },
    
    # British Pound
    "GBP": {
        "bills": [50, 20, 10, 5],
        "coins": [2, 1, 0.50, 0.20, 0.10, 0.05, 0.02, 0.01]
    },
    
    # Indian Rupee
    "INR": {
        "bills": [2000, 500, 200, 100, 50, 20, 10, 5, 2],
        "coins": [10, 5, 2, 1, 0.50]
    },
    
    # UAE Dirham
    "AED": {
        "bills": [1000, 500, 200, 100, 50, 20, 10, 5],
        "coins": [1, 0.50, 0.25]
    },
    
    # Saudi Riyal
    "SAR": {
        "bills": [500, 100, 50, 10, 5, 1],
        "coins": [2, 1, 0.50, 0.25, 0.10, 0.05]
    },
    
    # Kuwaiti Dinar (3 decimal places)
    "KWD": {
        "bills": [20, 10, 5, 1, 0.5, 0.25],
        "coins": [0.100, 0.050, 0.020, 0.010, 0.005]
    },
    
    # Bahraini Dinar (3 decimal places)
    "BHD": {
        "bills": [20, 10, 5, 1, 0.5],
        "coins": [0.500, 0.100, 0.050, 0.025, 0.010, 0.005]
    },
    
    # Omani Rial (3 decimal places)
    "OMR": {
        "bills": [50, 20, 10, 5, 1, 0.5],
        "coins": [0.100, 0.050, 0.025, 0.010, 0.005]
    },
    
    # Qatari Riyal
    "QAR": {
        "bills": [500, 100, 50, 10, 5, 1],
        "coins": [1, 0.50, 0.25]
    }
}


def get_denominations_for_currency(currency_code: str) -> Dict[str, List[float]]:
    """
    Get denominations for a specific currency
    Returns USD as fallback if currency not found
    """
    return CURRENCY_DENOMINATIONS.get(currency_code, CURRENCY_DENOMINATIONS["USD"])


def has_denominations_config(currency_code: str) -> bool:
    """Check if a currency has custom denominations configured"""
    return currency_code in CURRENCY_DENOMINATIONS


def get_supported_currency_codes() -> List[str]:
    """Get all supported currency codes with denominations"""
    return list(CURRENCY_DENOMINATIONS.keys())


def is_valid_denomination(currency_code: str, value: float, denomination_type: str) -> bool:
    """Validate denomination value for a currency"""
    config = get_denominations_for_currency(currency_code)
    valid_values = config.get(denomination_type, [])
    return value in valid_values
