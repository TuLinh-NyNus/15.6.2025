type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  data?: any;
}

/**
 * Logger service - Singleton pattern
 * Cung cấp các phương thức để ghi log trong ứng dụng
 */
class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private enabled = process.env.NODE_ENV !== 'production';
  private instanceId: string;
  
  private constructor() {
    this.instanceId = Math.random().toString(36).substring(2, 9);
    this.debug(`Logger singleton đã được khởi tạo với ID: ${this.instanceId}`);
  }
  
  /**
   * Lấy instance của Logger (Singleton pattern)
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }
  
  /**
   * Ghi log debug
   * @param message Nội dung log
   * @param data Dữ liệu bổ sung (optional)
   */
  debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }
  
  /**
   * Ghi log info
   * @param message Nội dung log
   * @param data Dữ liệu bổ sung (optional)
   */
  info(message: string, data?: any): void {
    this.log('info', message, data);
  }
  
  /**
   * Ghi log warning
   * @param message Nội dung log
   * @param data Dữ liệu bổ sung (optional)
   */
  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }
  
  /**
   * Ghi log error
   * @param message Nội dung log
   * @param data Dữ liệu bổ sung (optional)
   */
  error(message: string, data?: any): void {
    this.log('error', message, data);
  }
  
  /**
   * Phương thức nội bộ để ghi log
   */
  private log(level: LogLevel, message: string, data?: any): void {
    const logEntry: LogEntry = {
      level,
      message: `[NyNus] ${message}`,
      timestamp: Date.now(),
      data
    };
    
    this.logs.push(logEntry);
    
    // Giới hạn số lượng log lưu trữ
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
    
    // Log ra console trong môi trường development
    if (this.enabled) {
      const formattedTime = new Date().toLocaleTimeString();
      const formattedMessage = `[NyNus] ${formattedTime} [${level.toUpperCase()}] ${message}`;
      
      switch (level) {
        case 'debug':
          console.debug(formattedMessage, data || '');
          break;
        case 'info':
          console.info(formattedMessage, data || '');
          break;
        case 'warn':
          console.warn(formattedMessage, data || '');
          break;
        case 'error':
          console.error(formattedMessage, data || '');
          break;
      }
    }
  }
  
  /**
   * Lấy tất cả log đã ghi
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }
  
  /**
   * Xóa tất cả log
   */
  clearLogs(): void {
    this.logs = [];
    this.debug('Đã xóa tất cả log');
  }
  
  /**
   * Lấy ID của instance
   */
  getInstanceId(): string {
    return this.instanceId;
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Export types
export type { LogLevel, LogEntry };
