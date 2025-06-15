/**
 * Utility functions for safe error handling in TypeScript strict mode
 */

/**
 * Safely extracts error message from unknown error type
 * @param error - The error object (unknown type)
 * @returns Safe error message string
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return getErrorMessage(error);
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(getErrorMessage(error));
  }
  
  return 'Lỗi không xác định';
}

/**
 * Safely extracts error name from unknown error type
 * @param error - The error object (unknown type)
 * @returns Safe error name string
 */
export function getErrorName(error: unknown): string {
  if (error instanceof Error) {
    return error.name;
  }
  
  if (error && typeof error === 'object' && 'name' in error) {
    return String(error.name);
  }
  
  return 'UNKNOWN_ERROR';
}

/**
 * Checks if error is an instance of Error
 * @param error - The error object (unknown type)
 * @returns Type guard for Error instance
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Safely formats error for logging
 * @param error - The error object (unknown type)
 * @param context - Optional context string
 * @returns Formatted error string
 */
export function formatError(error: unknown, context?: string): string {
  const message = getErrorMessage(error);
  const name = getErrorName(error);
  
  if (context) {
    return `[${context}] ${name}: ${message}`;
  }
  
  return `${name}: ${message}`;
}
