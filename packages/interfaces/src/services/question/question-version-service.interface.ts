/**
 * Interface cho Question Version Service - quản lý phiên bản của câu hỏi
 */
import { ExamQuestionResponseDto } from '@project/dto';

export interface IQuestionVersionService {
  /**
   * Lấy tất cả các phiên bản của một câu hỏi
   * @param questionId ID của câu hỏi
   */
  getAllVersions(questionId: string): Promise<{
    questionId: string;
    versions: {
      id: string;
      version: number;
      changedAt: Date;
      changedBy: string;
      summary: string;
    }[];
  }>;

  /**
   * Lấy chi tiết một phiên bản cụ thể
   * @param questionId ID của câu hỏi
   * @param versionId ID của phiên bản
   */
  getVersionDetail(questionId: string, versionId: string): Promise<{
    id: string;
    questionId: string;
    version: number;
    content: string;
    rawContent: string;
    changedAt: Date;
    changedBy: string;
    changes: string;
  }>;

  /**
   * Tạo phiên bản mới khi cập nhật câu hỏi
   * @param questionId ID của câu hỏi
   * @param rawContent Nội dung LaTeX gốc
   * @param content Nội dung đã xử lý
   * @param userId ID của người thay đổi
   * @param summary Tóm tắt thay đổi
   */
  createVersion(
    questionId: string,
    rawContent: string,
    content: string,
    userId: string,
    summary: string
  ): Promise<string>;

  /**
   * So sánh hai phiên bản
   * @param questionId ID của câu hỏi
   * @param versionId1 ID của phiên bản 1
   * @param versionId2 ID của phiên bản 2
   */
  compareVersions(
    questionId: string,
    versionId1: string,
    versionId2: string
  ): Promise<{
    rawContentDiff: string;
    contentDiff: string;
  }>;

  /**
   * Quay lại phiên bản cũ
   * @param questionId ID của câu hỏi
   * @param versionId ID của phiên bản muốn quay lại
   * @param userId ID của người thực hiện
   */
  revertToVersion(
    questionId: string,
    versionId: string,
    userId: string
  ): Promise<ExamQuestionResponseDto>;
}