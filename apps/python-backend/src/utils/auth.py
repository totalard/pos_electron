"""
Authentication utilities for PIN-based authentication
"""
import hashlib
import secrets


def hash_pin(pin: str) -> str:
    """
    Hash a PIN using SHA-256 with a salt.
    
    Args:
        pin: The PIN to hash (as a string)
    
    Returns:
        The hashed PIN in the format: salt$hash
    """
    # Generate a random salt
    salt = secrets.token_hex(16)
    
    # Combine salt and PIN, then hash
    pin_with_salt = f"{salt}{pin}"
    pin_hash = hashlib.sha256(pin_with_salt.encode()).hexdigest()
    
    # Return in format: salt$hash
    return f"{salt}${pin_hash}"


def verify_pin(pin: str, pin_hash: str) -> bool:
    """
    Verify a PIN against a stored hash.
    
    Args:
        pin: The PIN to verify (as a string)
        pin_hash: The stored hash in format: salt$hash
    
    Returns:
        True if the PIN matches, False otherwise
    """
    try:
        # Split the stored hash into salt and hash
        salt, stored_hash = pin_hash.split('$')
        
        # Hash the provided PIN with the same salt
        pin_with_salt = f"{salt}{pin}"
        computed_hash = hashlib.sha256(pin_with_salt.encode()).hexdigest()
        
        # Compare hashes using constant-time comparison to prevent timing attacks
        return secrets.compare_digest(computed_hash, stored_hash)
    except (ValueError, AttributeError):
        # Invalid hash format
        return False

