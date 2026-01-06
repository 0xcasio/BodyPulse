/**
 * Utility functions for age calculation
 * 
 * These functions help calculate age from birthday and scan date,
 * ensuring accurate age across different years.
 */

/**
 * Calculate age from birthday and a reference date (usually scan date)
 * @param birthday - Birthday as ISO date string (YYYY-MM-DD) or Date object
 * @param referenceDate - Reference date to calculate age at (defaults to today)
 * @returns Age in years, or null if birthday is invalid
 */
export function calculateAge(
  birthday: string | Date | null | undefined,
  referenceDate?: string | Date
): number | null {
  if (!birthday) return null;

  try {
    const birthDate = typeof birthday === 'string' ? new Date(birthday) : birthday;
    const refDate = referenceDate 
      ? (typeof referenceDate === 'string' ? new Date(referenceDate) : referenceDate)
      : new Date();

    // Validate dates
    if (isNaN(birthDate.getTime()) || isNaN(refDate.getTime())) {
      return null;
    }

    // Check if birthday is in the future
    if (birthDate > refDate) {
      return null;
    }

    // Calculate age
    let age = refDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = refDate.getMonth() - birthDate.getMonth();
    
    // Adjust if birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && refDate.getDate() < birthDate.getDate())) {
      age--;
    }

    return age >= 0 ? age : null;
  } catch (error) {
    console.error('Error calculating age:', error);
    return null;
  }
}

/**
 * Calculate age for a scan based on user's birthday and scan date
 * Falls back to stored age if birthday is not available
 * @param birthday - User's birthday
 * @param scanDate - Scan date
 * @param storedAge - Age stored in the scan (fallback)
 * @returns Calculated age or stored age
 */
export function getAgeForScan(
  birthday: string | Date | null | undefined,
  scanDate: string | Date | null | undefined,
  storedAge?: number | null
): number | null {
  // If we have birthday and scan date, calculate age
  if (birthday && scanDate) {
    const calculatedAge = calculateAge(birthday, scanDate);
    if (calculatedAge !== null) {
      return calculatedAge;
    }
  }

  // Fall back to stored age
  return storedAge ?? null;
}


