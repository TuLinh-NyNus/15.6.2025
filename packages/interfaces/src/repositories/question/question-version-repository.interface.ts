import { QuestionData, QuestionVersionData } from './question-data.interface';

/**
 * Interface định nghĩa kết quả so sánh phiên bản
 */
export interface VersionComparisonResult {
  addedFields: string[];
  removedFields: string[];
  changedFields: Record<string, { old: unknown; new: unknown }>;
  summary: string;
}

/**
 * Interface cho repository QuestionVersion
 */
export interface IQuestionVersionRepository {
  /**
   * Tìm phiên bản câu hỏi theo ID
   * @param id ID của phiên bản
   * @returns Promise với phiên bản câu hỏi hoặc null
   */
  findById(id: string): Promise<QuestionVersionData | null>;

  /**
   * Tìm tất cả phiên bản của một câu hỏi
   * @param questionId ID của câu hỏi
   * @returns Promise với danh sách phiên bản
   */
  findAllVersionsByQuestionId(questionId: string): Promise<QuestionVersionData[]>;

  /**
   * Tạo phiên bản mới cho câu hỏi
   * @param data Dữ liệu phiên bản mới
   * @returns Promise với phiên bản đã tạo
   */
  create(data: QuestionVersionData): Promise<QuestionVersionData>;

  /**
   * Tìm phiên bản mới nhất của câu hỏi
   * @param questionId ID của câu hỏi
   * @returns Promise với phiên bản mới nhất hoặc null
   */
  findLatestVersion(questionId: string): Promise<QuestionVersionData | null>;

  /**
   * Tìm phiên bản theo số phiên bản
   * @param questionId ID của câu hỏi
   * @param version Số phiên bản
   * @returns Promise với phiên bản tìm thấy hoặc null
   */
  findByQuestionIdAndVersion(questionId: string, version: number): Promise<QuestionVersionData | null>;

  /**
   * So sánh hai phiên bản câu hỏi
   * @param versionId1 ID phiên bản thứ nhất
   * @param versionId2 ID phiên bản thứ hai
   * @returns Promise với kết quả so sánh
   */
  compareVersions(versionId1: string, versionId2: string): Promise<VersionComparisonResult>;

  /**
   * Khôi phục câu hỏi về phiên bản cũ
   * @param questionId ID của câu hỏi
   * @param versionId ID của phiên bản cần khôi phục
   * @returns Promise với câu hỏi đã cập nhật
   */
  revertToVersion(questionId: string, versionId: string): Promise<QuestionData>;

  /**
   * Cập nhật phiên bản câu hỏi
   * @param id ID của phiên bản
   * @param data Dữ liệu cần cập nhật
   * @returns Promise với phiên bản đã cập nhật
   */
  update(id: string, data: Partial<QuestionVersionData>): Promise<QuestionVersionData>;

  /**
   * Cập nhật trạng thái của phiên bản
   * @param id ID của phiên bản
   * @param status Trạng thái mới
   * @returns Promise với phiên bản đã cập nhật
   */
  updateStatus(id: string, status: string): Promise<QuestionVersionData>;

  /**
   * Kiểm tra xem phiên bản có tồn tại không
   * @param id ID của phiên bản
   * @returns Promise với boolean xác nhận tồn tại
   */
  exists(id: string): Promise<boolean>;

  /**
   * Đánh dấu phiên bản là phiên bản hiện tại của câu hỏi
   * @param id ID của phiên bản
   * @returns Promise với phiên bản đã được đánh dấu
   */
  markAsCurrent(id: string): Promise<QuestionVersionData>;
} 