/**
 * Interface mô tả các tuỳ chọn cho việc tìm kiếm tất cả các bản ghi
 * @template T Kiểu dữ liệu của entity
 */
export interface FindAllOptions<T> {
  skip?: number;
  take?: number;
  orderBy?: OrderByOptions<T>;
  filter?: FilterOptions<T>;
  include?: IncludeOptions<T>;
}

/**
 * Interface mô tả kết quả phân trang
 * @template T Kiểu dữ liệu của entity
 */
export interface PaginatedResult<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
  };
}

/**
 * Kiểu dữ liệu cho các tuỳ chọn filter
 * @template T Kiểu dữ liệu của entity
 */
export type FilterOptions<T> = Partial<{ [K in keyof T]: unknown }>;

/**
 * Kiểu dữ liệu cho các tuỳ chọn sắp xếp
 * @template T Kiểu dữ liệu của entity
 */
export type OrderByOptions<T> = Partial<{ [K in keyof T]: 'asc' | 'desc' }>;

/**
 * Kiểu dữ liệu cho các tuỳ chọn include (eager loading)
 * @template T Kiểu dữ liệu của entity
 */
export type IncludeOptions<T> = Partial<{ [K in keyof T]: boolean }>;

/**
 * Interface cơ sở cho tất cả các repository
 * @template T Kiểu dữ liệu của entity
 * @template ID Kiểu dữ liệu của ID
 */
export interface IBaseRepository<T, ID> {
  /**
   * Tạo một bản ghi mới
   * @param data Dữ liệu để tạo bản ghi
   * @returns Promise chứa bản ghi đã tạo
   */
  create(data: Partial<T>): Promise<T>;

  /**
   * Tìm bản ghi theo ID
   * @param id ID của bản ghi cần tìm
   * @returns Promise chứa bản ghi hoặc null nếu không tìm thấy
   */
  findById(id: ID): Promise<T | null>;

  /**
   * Tìm tất cả các bản ghi theo tuỳ chọn
   * @param options Tuỳ chọn tìm kiếm, bao gồm phân trang, sắp xếp, lọc
   * @returns Promise chứa kết quả phân trang
   */
  findAll(options?: FindAllOptions<T>): Promise<PaginatedResult<T>>;

  /**
   * Cập nhật bản ghi theo ID
   * @param id ID của bản ghi cần cập nhật
   * @param data Dữ liệu cập nhật
   * @returns Promise chứa bản ghi đã cập nhật
   */
  update(id: ID, data: Partial<T>): Promise<T>;

  /**
   * Xoá bản ghi theo ID
   * @param id ID của bản ghi cần xoá
   * @returns Promise void
   */
  remove(id: ID): Promise<void>;

  /**
   * Đếm số lượng bản ghi theo filter
   * @param filter Điều kiện lọc
   * @returns Promise chứa số lượng bản ghi
   */
  count(filter?: FilterOptions<T>): Promise<number>;

  /**
   * Kiểm tra sự tồn tại của bản ghi theo filter
   * @param filter Điều kiện lọc
   * @returns Promise boolean
   */
  exists(filter: FilterOptions<T>): Promise<boolean>;

  /**
   * Thực hiện một hàm trong transaction
   * @param fn Hàm cần thực hiện trong transaction
   * @returns Promise với kết quả từ hàm đã thực hiện
   */
  transaction<R>(fn: (repo: this) => Promise<R>): Promise<R>;
} 