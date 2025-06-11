import logger from './logger';

// Hack để đảm bảo singleton thực sự trong môi trường Next.js
// Sử dụng cách khai báo global và window tương thích với TypeScript
declare global {
  // eslint-disable-next-line no-var
  var __logCacheInstance: LogCache | undefined;
  interface Window {
    __logCacheInstance?: LogCache;
  }
}

// Cơ chế chống lặp log toàn cục cho tất cả các module
interface CacheEntry {
  lastData: string;
  timestamp: number;
  occurrences: number; // Thêm bộ đếm số lần lặp lại
}

// Singleton pattern cho cache, hoạt động trong cả môi trường server, client, API routes
class LogCache {
  private static _instance: LogCache;
  private cache: Record<string, CacheEntry> = {};
  private instanceId: string;

  // Thời gian chống lặp mặc định (milliseconds)
  private readonly DEBOUNCE_TIME = 5000; // Tăng lên thành 5s

  // Thời gian chống lặp dài hơn cho JWT và Session callbacks
  private readonly JWT_SESSION_DEBOUNCE_TIME = 30000; // Tăng lên thành 30s

  // Số lần lặp lại tối đa trước khi log lại
  private readonly MAX_OCCURRENCES = 10;

  private constructor() {
    this.instanceId = Math.random().toString(36).substring(2, 9);

    // Khởi tạo các key cơ bản
    const initialKeys = [
      'redirect', 'jwt', 'session', 'auth', 'auth_credentials', 'auth_success',
      'redirect_relative', 'redirect_admin', 'redirect_absolute'
    ];

    initialKeys.forEach(key => {
      this.cache[key] = { lastData: '', timestamp: 0, occurrences: 0 };
    });

    // Chỉ log khi không phải là hot reload
    const isHotReload = typeof window !== 'undefined' && (window as any).__NEXT_DATA__?.buildId;
    if (!isHotReload) {
      logger.debug(`LogCache singleton đã được khởi tạo [${this.instanceId}]`);
    }
  }

  public static getInstance(): LogCache {
    // Kiểm tra môi trường để sử dụng storage phù hợp
    if (typeof window !== 'undefined') {
      // Client-side: Lưu trong window
      if (!window.__logCacheInstance) {
        window.__logCacheInstance = new LogCache();
      }
      return window.__logCacheInstance;
    } else {
      // Server-side: Lưu trong global
      if (!global.__logCacheInstance) {
        global.__logCacheInstance = new LogCache();
      }
      return global.__logCacheInstance;
    }
  }

  // Kiểm tra log trùng lặp và trả về true nếu nên bỏ qua log này
  public shouldSkipLogging<T>(type: string, data: T | null | undefined): boolean {
    // Nếu data là null hoặc undefined, trả về false để không bỏ qua log
    if (data === null || data === undefined) {
      return false;
    }
    const now = Date.now();

    // Kiểm tra an toàn - nếu type không tồn tại trong cache, khởi tạo nó
    if (!this.cache[type]) {
      this.cache[type] = { lastData: '', timestamp: 0, occurrences: 0 };
      logger.debug(`[${this.instanceId}] Khởi tạo cache mới cho log type: ${type}`);
    }

    const cacheEntry = this.cache[type];

    // Chuyển đổi dữ liệu thành chuỗi để so sánh
    const dataString = JSON.stringify(data);

    // Sử dụng thời gian chống lặp dài hơn cho JWT và Session
    const debounceTime = (type === 'jwt' || type === 'session')
      ? this.JWT_SESSION_DEBOUNCE_TIME
      : this.DEBOUNCE_TIME;

    // Kiểm tra cả nội dung và thời gian
    const isSameData = dataString === cacheEntry.lastData;
    const isWithinDebounceTime = now - cacheEntry.timestamp < debounceTime;

    // Nếu dữ liệu giống nhau và trong thời gian debounce
    if (isSameData && isWithinDebounceTime) {
      // Tăng số lần lặp lại
      cacheEntry.occurrences += 1;

      // Sau mỗi MAX_OCCURRENCES lần, vẫn log một lần để biết log vẫn đang hoạt động
      if (cacheEntry.occurrences >= this.MAX_OCCURRENCES) {
        cacheEntry.occurrences = 0;
        logger.debug(`[${this.instanceId}] Log trùng lặp ${this.MAX_OCCURRENCES} lần cho type: ${type}`);
        return false; // Cho phép log sau MAX_OCCURRENCES lần lặp lại
      }

      return true; // Bỏ qua log trùng lặp
    }

    // Nếu là dữ liệu mới hoặc đã qua thời gian debounce
    cacheEntry.lastData = dataString;
    cacheEntry.timestamp = now;
    cacheEntry.occurrences = 0;

    return false; // Không bỏ qua log
  }

  // Để debug và kiểm tra
  public getInstanceId(): string {
    return this.instanceId;
  }
}

// Export singleton instance bằng cách sử dụng global
export const logCache = LogCache.getInstance();