/**
 * Utility function để lấy error message một cách an toàn
 * @param error - Error object hoặc unknown value
 * @returns Error message string
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return getErrorMessage(error);
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  
  return String(error);
}

/**
 * Type guard để kiểm tra xem một value có phải là Error không
 * @param error - Value cần kiểm tra
 * @returns true nếu là Error instance
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}
