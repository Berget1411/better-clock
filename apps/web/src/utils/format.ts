/**
 * Formats a duration in seconds as "Xh YYm" for use in table cells.
 * Example: 5400 → "1h 30m"
 */
export function formatDurationHM(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

/**
 * Formats a monetary amount with its currency code.
 * Example: (1234.5, "USD") → "1234.50 USD"
 */
export function formatCurrencyAmount(amount: number, currency: string | null): string {
  return `${amount.toFixed(2)} ${currency ?? "USD"}`;
}
