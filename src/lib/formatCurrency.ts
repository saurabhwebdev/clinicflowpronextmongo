/**
 * Formats a number as currency based on the provided currency code
 * @param amount - The amount to format
 * @param currencyCode - The ISO 4217 currency code (e.g., 'USD', 'EUR', 'GBP')
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currencyCode: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
}