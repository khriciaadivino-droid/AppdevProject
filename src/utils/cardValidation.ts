/**
 * Payment validation utilities
 * Luhn algorithm, card formatting, expiry validation, PH mobile number checks.
 */

// ── Card number ──────────────────────────────────────────────────────────

/** Returns true if the card number passes the Luhn algorithm check. */
export const luhnCheck = (num: string): boolean => {
    const digits = num.replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 19) return false;
    let sum = 0;
    let alternate = false;
    for (let i = digits.length - 1; i >= 0; i--) {
        let n = parseInt(digits[i], 10);
        if (alternate) {
            n *= 2;
            if (n > 9) n -= 9;
        }
        sum += n;
        alternate = !alternate;
    }
    return sum % 10 === 0;
};

/** Formats a raw digit string as "0000 0000 0000 0000". Max 16 digits. */
export const formatCardNumber = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})(?=.)/g, '$1 ').trim();
};

/** Strips spaces and returns the raw 16-digit card number. */
export const rawCardNumber = (formatted: string): string => formatted.replace(/\s/g, '');

// ── Expiry date ──────────────────────────────────────────────────────────

/**
 * Formats a raw input into "MM / YY" as the user types.
 * Only the first 4 digits are used.
 */
export const formatExpiry = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
        return digits.slice(0, 2) + ' / ' + digits.slice(2);
    }
    return digits;
};

/**
 * Parses "MM / YY" or "MM/YY" into { month, year } where year is 4-digit.
 * Returns null if the format is invalid.
 */
export const parseExpiry = (expiry: string): { month: number; year: number } | null => {
    const clean = expiry.replace(/\s/g, '');
    const parts = clean.split('/');
    if (parts.length !== 2 || parts[0].length !== 2 || parts[1].length !== 2) return null;
    const month = parseInt(parts[0], 10);
    const year = 2000 + parseInt(parts[1], 10);
    if (isNaN(month) || isNaN(year)) return null;
    return { month, year };
};

/** Returns true if the expiry date is in the future. */
export const isExpiryValid = (expiry: string): boolean => {
    const parsed = parseExpiry(expiry);
    if (!parsed) return false;
    const { month, year } = parsed;
    if (month < 1 || month > 12) return false;
    const now = new Date();
    // Card expires at the END of the given month
    const expDate = new Date(year, month, 1); // 1st of the month AFTER expiry month
    return expDate > now;
};

// ── CVC ──────────────────────────────────────────────────────────────────

/** Returns true if CVC is 3 or 4 digits (Amex uses 4). */
export const isCvcValid = (cvc: string): boolean => /^\d{3,4}$/.test(cvc.trim());

// ── Cardholder name ──────────────────────────────────────────────────────

/** Returns true if the name contains only letters, spaces, hyphens, and dots. */
export const isCardholderNameValid = (name: string): boolean =>
    /^[a-zA-Z\s.\-']{2,70}$/.test(name.trim());

// ── Philippine mobile number ─────────────────────────────────────────────

/**
 * Validates a Philippine mobile number.
 * Accepts: 09XXXXXXXXX (11 digits) or +639XXXXXXXXX (13 chars)
 */
export const isPhilippineMobile = (num: string): boolean => {
    const cleaned = num.replace(/[\s\-]/g, '');
    return /^(09\d{9}|\+639\d{9})$/.test(cleaned);
};

/** Normalizes a Philippine mobile to 09XXXXXXXXX format. */
export const normalizePHMobile = (num: string): string => {
    const cleaned = num.replace(/[\s\-]/g, '');
    if (cleaned.startsWith('+63')) return '0' + cleaned.slice(3);
    return cleaned;
};
