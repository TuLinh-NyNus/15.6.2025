import { 
  DetailedExamStatsDto, 
  ExamStatsDto, 
  ExamStatsParamsDto, 
  QuestionStatsDto 
} from '@project/dto';

/**
 * Interface định nghĩa các phương thức cho service quản lý thống kê bài thi
 */
export interface IExamStatsService {
  /**
   * Lấy thống kê tổng quan của bài thi
   * @param examId ID của bài thi
   * @returns Thống kê tổng quan
   */
  getExamStats(examId: string): Promise<ExamStatsDto>;

  /**
   * Lấy thống kê chi tiết của bài thi bao gồm các câu hỏi
   * @param params Tham số cho thống kê
   * @returns Thống kê chi tiết
   */
  getDetailedExamStats(params: ExamStatsParamsDto): Promise<DetailedExamStatsDto>;

  /**
   * Lấy thống kê của một câu hỏi cụ thể
   * @param questionId ID của câu hỏi
   * @returns Thống kê câu hỏi
   */
  getQuestionStats(questionId: number): Promise<QuestionStatsDto>;

  /**
   * Lấy thống kê về tỷ lệ đỗ của các bài thi
   * @param filters Bộ lọc (môn học, khối lớp, v.v.)
   * @returns Thống kê tỷ lệ đỗ
   */
  getPassRateStats(filters?: Record<string, unknown>): Promise<Record<string, number>>;

  /**
   * Lấy thống kê về phân phối điểm của bài thi
   * @param examId ID của bài thi
   * @returns Phân phối điểm theo khoảng
   */
  getScoreDistribution(examId: string): Promise<Record<string, number>>;

  /**
   * Cập nhật thống kê bài thi sau khi có thêm lượt làm bài
   * @param examId ID của bài thi
   * @returns Thống kê đã cập nhật
   */
  updateExamStats(examId: string): Promise<ExamStatsDto>;

  /**
   * Lấy thống kê theo thời gian (theo ngày, tuần, tháng)
   * @param examId ID của bài thi
   * @param timeRange Khoảng thời gian
   * @returns Thống kê theo thời gian
   */
  getStatsByTimeRange(examId: string, timeRange: string): Promise<Record<string, unknown>>;

  /**
   * So sánh thống kê giữa các bài thi
   * @param examIds Danh sách ID bài thi cần so sánh
   * @returns Thống kê so sánh
   */
  compareExamStats(examIds: string[]): Promise<Record<string, ExamStatsDto>>;
} 