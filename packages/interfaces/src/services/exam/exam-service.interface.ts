import { 
  CreateExamDto, 
  ExamFilterDto, 
  ExamStatsParamsDto, 
  UpdateExamDto,
  DetailedExamStatsDto
} from '@project/dto';

/**
 * Interface định nghĩa các phương thức cho service quản lý bài thi
 */
export interface IExamService {
  /**
   * Lấy danh sách bài thi với phân trang và lọc
   * @param filters Các tham số lọc và phân trang
   * @returns Danh sách bài thi đã phân trang
   */
  getAllExams(filters: ExamFilterDto): Promise<{ exams: unknown[]; total: number }>;

  /**
   * Lấy thông tin chi tiết bài thi theo ID
   * @param id ID của bài thi
   * @returns Bài thi nếu tìm thấy
   */
  getExamById(id: string): Promise<unknown>;

  /**
   * Tạo bài thi mới
   * @param createExamDto Dữ liệu bài thi
   * @returns Bài thi đã tạo
   */
  createExam(createExamDto: CreateExamDto): Promise<unknown>;

  /**
   * Cập nhật bài thi
   * @param id ID của bài thi
   * @param updateExamDto Dữ liệu cập nhật
   * @returns Bài thi đã cập nhật
   */
  updateExam(id: string, updateExamDto: UpdateExamDto): Promise<unknown>;

  /**
   * Xóa bài thi
   * @param id ID của bài thi
   * @returns Kết quả xóa (true/false)
   */
  deleteExam(id: string): Promise<boolean>;

  /**
   * Lấy danh sách các loại bài thi
   * @returns Danh sách các loại bài thi
   */
  getExamCategories(): Promise<{ key: string; value: string }[]>;

  /**
   * Lấy thống kê về bài thi
   * @param params Tham số cho thống kê
   * @returns Thống kê bài thi
   */
  getExamStats(params: ExamStatsParamsDto): Promise<DetailedExamStatsDto>;

  /**
   * Cập nhật điểm trung bình cho bài thi
   * @param id ID của bài thi
   * @param score Điểm trung bình mới
   * @returns Bài thi đã cập nhật
   */
  updateAverageScore(id: string, score: number): Promise<unknown>;
} 