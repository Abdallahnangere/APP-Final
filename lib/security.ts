import bcrypt from 'bcryptjs';

/**
 * PIN Security Utility Functions
 * Handles hashing and comparison of PINs
 */

const SALT_ROUNDS = 10;

/**
 * Hash a PIN for secure storage
 * @param pin The plain 4-digit PIN
 * @returns The bcrypt hash
 */
export async function hashPin(pin: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPin = await bcrypt.hash(pin, salt);
    return hashedPin;
  } catch (error) {
    console.error('Error hashing PIN:', error);
    throw new Error('Failed to hash PIN');
  }
}

/**
 * Compare a plain PIN with a stored hash
 * @param plainPin The plain 4-digit PIN
 * @param hashedPin The bcrypt hash to compare against
 * @returns true if PIN matches, false otherwise
 */
export async function verifyPin(plainPin: string, hashedPin: string): Promise<boolean> {
  try {
    const isMatch = await bcrypt.compare(plainPin, hashedPin);
    return isMatch;
  } catch (error) {
    console.error('Error verifying PIN:', error);
    return false;
  }
}

/**
 * Validate PIN format (4 digits)
 * @param pin The PIN to validate
 * @returns true if PIN is valid 4-digit format
 */
export function isValidPinFormat(pin: string): boolean {
  return /^[0-9]{4}$/.test(pin);
}
