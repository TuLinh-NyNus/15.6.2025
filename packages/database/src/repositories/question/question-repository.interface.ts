import { Question, QuestionImage, QuestionTag, QuestionVersion } from '../../entities';

/**
 * Interface cho Question repository
 */
export interface IQuestionRepository {
  /**
   * Tìm câu hỏi theo ID
   */
  findById(id: string): Promise<Question | null>;

  /**
   * Tìm nhiều câu hỏi theo các điều kiện tìm kiếm
   */
  findMany(params: {
    skip?: number;
    take?: number;
    where?: Partial<Question>;
    orderBy?: { [key: string]: 'asc' | 'desc' };
  }): Promise<Question[]>;

  /**
   * Đếm số lượng câu hỏi theo điều kiện
   */
  count(where?: Partial<Question>): Promise<number>;

  /**
   * Tạo câu hỏi mới
   */
  create(data: Partial<Question>): Promise<Question>;

  /**
   * Cập nhật câu hỏi
   */
  update(id: string, data: Partial<Question>): Promise<Question>;

  /**
   * Xóa câu hỏi
   */
  delete(id: string): Promise<Question>;

  /**
   * Tìm các phiên bản của câu hỏi
   */
  findVersions(questionId: string): Promise<QuestionVersion[]>;

  /**
   * Tạo phiên bản mới cho câu hỏi
   */
  createVersion(data: Partial<QuestionVersion>): Promise<QuestionVersion>;

  /**
   * Tìm hình ảnh của câu hỏi
   */
  findImages(questionId: string): Promise<QuestionImage[]>;

  /**
   * Thêm hình ảnh cho câu hỏi
   */
  addImage(data: Partial<QuestionImage>): Promise<QuestionImage>;

  /**
   * Xóa hình ảnh
   */
  deleteImage(id: string): Promise<QuestionImage>;

  /**
   * Tìm tất cả các tag
   */
  findAllTags(): Promise<QuestionTag[]>;

  /**
   * Thêm tags cho câu hỏi
   */
  addTagsToQuestion(questionId: string, tagIds: string[]): Promise<Question>;

  /**
   * Xóa tags khỏi câu hỏi
   */
  removeTagsFromQuestion(questionId: string, tagIds: string[]): Promise<Question>;
} 