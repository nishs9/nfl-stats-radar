// filepath: src/lib/utils.ts
/**
 * Formats a number to have at most two decimal places if it has decimals.
 * Returns the original value if it's not a number or has no decimals.
 * @param value The value to format (can be number, string, null, undefined)
 * @returns Formatted string or the original value
 */
export function formatNumber(value: string | number | null | undefined): string | number | null | undefined {
  if (typeof value !== 'number') {
    // Try converting if it's a string that looks like a number
    const num = Number(value);
    if (isNaN(num)) {
      return value; // Return original if not a number or convertible string
    }
    value = num;
  }
  
  // Check if the number has decimals
  if (value % 1 !== 0) {
    return value.toFixed(2); // Round to 2 decimal places
  }
  
  return value; // Return original integer or already rounded number
}