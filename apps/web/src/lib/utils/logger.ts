/**
 * Hệ thống logging đơn giản cho ứng dụng
 * Cho phép kiểm soát mức độ log và định dạng log
 */

// Các cấp độ log
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4, // Tắt tất cả log
}

// Cấu hình mặc định
const DEFAULT_CONFIG = {
  level: process.env.NODE_ENV === 'production' ? LogLevel.ERROR : LogLevel.DEBUG,
  prefix: '[NyNus]',
  enableTimestamp: true,
};

// Lưu trữ cấu hình hiện tại
let config = { ...DEFAULT_CONFIG };

/**
 * Định dạng thời gian cho log
 */
const formatTimestamp = (): string => {
  const now = new Date();
  return `${now.toLocaleTimeString()}`;
};

/**
 * Tạo prefix cho log message
 */
const createPrefix = (): string => {
  const parts = [config.prefix];

  if (config.enableTimestamp) {
    parts.push(formatTimestamp());
  }

  return parts.join(' ');
};

/**
 * Cấu hình logger
 */
export const configureLogger = (options: Partial<typeof DEFAULT_CONFIG>): void => {
  config = { ...config, ...options };
};

/**
 * Log debug message - chỉ hiển thị trong môi trường development
 */
export const debug = (message: string, ...args: unknown[]): void => {
  if (config.level <= LogLevel.DEBUG) {
    // eslint-disable-next-line no-console
    console.log(`${createPrefix()} [DEBUG] ${message}`, ...args);
  }
};

/**
 * Log thông tin chung
 */
export const info = (message: string, ...args: unknown[]): void => {
  if (config.level <= LogLevel.INFO) {
    // eslint-disable-next-line no-console
    console.info(`${createPrefix()} [INFO] ${message}`, ...args);
  }
};

/**
 * Log cảnh báo
 */
export const warn = (message: string, ...args: unknown[]): void => {
  if (config.level <= LogLevel.WARN) {
    // eslint-disable-next-line no-console
    console.warn(`${createPrefix()} [WARN] ${message}`, ...args);
  }
};

/**
 * Log lỗi
 */
export const error = (message: string, ...args: unknown[]): void => {
  if (config.level <= LogLevel.ERROR) {
    // eslint-disable-next-line no-console
    console.error(`${createPrefix()} [ERROR] ${message}`, ...args);
  }
};

// Export default object để sử dụng dễ dàng
const logger = {
  debug,
  info,
  warn,
  error,
  configure: configureLogger,
  LogLevel,
};

export default logger;
