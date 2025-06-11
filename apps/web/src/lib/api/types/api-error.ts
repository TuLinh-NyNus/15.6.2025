/**
 * Interface cho lỗi API
 */
export interface ApiError {
  response?: {
    data?: {
      message?: string;
      error?: string;
      statusCode?: number;
    };
    status?: number;
    statusText?: string;
  };
  message?: string;
  status?: number;
  code?: string;
}
