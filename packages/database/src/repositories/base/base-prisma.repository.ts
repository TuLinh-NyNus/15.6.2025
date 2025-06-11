import { PrismaService } from '../../prisma/prisma.service';
import { 
  IBaseRepository, 
  FindAllOptions, 
  PaginatedResult,
  FilterOptions,
  OrderByOptions,
  IncludeOptions
} from '@project/interfaces';

/**
 * Lớp repository cơ sở sử dụng Prisma
 * @template T Kiểu dữ liệu của entity
 * @template ID Kiểu dữ liệu của ID
 */
export abstract class BasePrismaRepository<T, ID> implements IBaseRepository<T, ID> {
  /**
   * Constructor cho BasePrismaRepository
   * @param prisma Instance của PrismaService
   * @param modelName Tên của model trong Prisma
   */
  protected constructor(
    protected readonly prisma: PrismaService,
    protected readonly modelName: string
  ) {}

  /**
   * Tạo một bản ghi mới
   * @param data Dữ liệu để tạo bản ghi
   * @returns Promise chứa bản ghi đã tạo
   */
  abstract create(data: Partial<T>): Promise<T>;

  /**
   * Tìm bản ghi theo ID
   * @param id ID của bản ghi cần tìm
   * @returns Promise chứa bản ghi hoặc null nếu không tìm thấy
   */
  abstract findById(id: ID): Promise<T | null>;

  /**
   * Tìm tất cả các bản ghi theo tuỳ chọn
   * @param options Tuỳ chọn tìm kiếm, bao gồm phân trang, sắp xếp, lọc
   * @returns Promise chứa kết quả phân trang
   */
  abstract findAll(options?: FindAllOptions<T>): Promise<PaginatedResult<T>>;

  /**
   * Cập nhật bản ghi theo ID
   * @param id ID của bản ghi cần cập nhật
   * @param data Dữ liệu cập nhật
   * @returns Promise chứa bản ghi đã cập nhật
   */
  abstract update(id: ID, data: Partial<T>): Promise<T>;

  /**
   * Xoá bản ghi theo ID
   * @param id ID của bản ghi cần xoá
   * @returns Promise void
   */
  abstract remove(id: ID): Promise<void>;

  /**
   * Đếm số lượng bản ghi theo filter
   * @param filter Điều kiện lọc
   * @returns Promise chứa số lượng bản ghi
   */
  abstract count(filter?: FilterOptions<T>): Promise<number>;

  /**
   * Kiểm tra sự tồn tại của bản ghi theo filter
   * @param filter Điều kiện lọc
   * @returns Promise boolean
   */
  abstract exists(filter: FilterOptions<T>): Promise<boolean>;

  /**
   * Thực hiện một hàm trong transaction
   * @param fn Hàm cần thực hiện trong transaction
   * @returns Promise với kết quả từ hàm đã thực hiện
   */
  async transaction<R>(fn: (repo: this) => Promise<R>): Promise<R> {
    return this.prisma.$transaction(async (prisma) => {
      // Tạo một instance mới của repository với prisma transaction
      const repoClone = Object.create(this);
      repoClone.prisma = prisma;
      return fn(repoClone);
    });
  }

  /**
   * Chuyển đổi filter options thành where clause cho Prisma
   * @param filter Filter options
   * @returns Where clause cho Prisma
   */
  protected buildWhereClause(filter?: FilterOptions<T>): Record<string, unknown> {
    if (!filter) return {};
    return filter as Record<string, unknown>;
  }

  /**
   * Chuyển đổi order by options thành order by clause cho Prisma
   * @param orderBy Order by options
   * @returns Order by clause cho Prisma
   */
  protected buildOrderByClause(orderBy?: OrderByOptions<T>): Record<string, unknown> {
    if (!orderBy) return {};
    return orderBy as Record<string, unknown>;
  }

  /**
   * Chuyển đổi include options thành include clause cho Prisma
   * @param include Include options
   * @returns Include clause cho Prisma
   */
  protected buildIncludeClause(include?: IncludeOptions<T>): Record<string, unknown> {
    if (!include) return {};
    return include as Record<string, unknown>;
  }

  /**
   * Tạo metadata cho phân trang
   * @param total Tổng số bản ghi
   * @param options Tuỳ chọn tìm kiếm
   * @returns Metadata cho phân trang
   */
  protected getPaginationMeta(
    total: number, 
    options?: FindAllOptions<T>
  ): PaginatedResult<T>['meta'] {
    const pageSize = options?.take || 10;
    const page = Math.floor((options?.skip || 0) / pageSize) + 1;
    
    return {
      total,
      page,
      pageSize,
      pageCount: Math.ceil(total / pageSize)
    };
  }
} 