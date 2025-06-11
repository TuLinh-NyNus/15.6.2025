/**
 * Utility functions for Nynus application
 */

/**
 * Format date to locale string
 * @param date - Date to format
 * @param locale - Locale to use, defaults to 'vi-VN'
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string | number,
  locale: string = 'vi-VN'
): string => {
  const dateObject = new Date(date);
  return dateObject.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format currency with proper locale
 * @param amount - Amount to format
 * @param locale - Locale to use, defaults to 'vi-VN'
 * @param currency - Currency code, defaults to 'VND'
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number,
  locale: string = 'vi-VN',
  currency: string = 'VND'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param length - Maximum length, defaults to 100
 * @returns Truncated text
 */
export const truncateText = (text: string, length: number = 100): string => {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
};

/**
 * Create a debounced function
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Generate a random string
 * @param length - Length of string to generate, defaults to 8
 * @returns Random string
 */
export const generateRandomString = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}; 