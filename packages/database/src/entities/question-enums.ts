/**
 * Enum cho các loại câu hỏi
 * Tương ứng với QuestionType trong schema.prisma
 */
export enum QuestionType {
  MC = 'MC', // Trắc nghiệm một phương án đúng (Multiple Choice)
  TF = 'TF', // Trắc nghiệm đúng/sai (True/False)
  SA = 'SA', // Trả lời ngắn (Short Answer)
  ES = 'ES', // Tự luận (Essay)
  MA = 'MA'  // Ghép đôi (Matching)
}

/**
 * Enum cho trạng thái câu hỏi
 * Tương ứng với QuestionStatus trong schema.prisma
 */
export enum QuestionStatus {
  DRAFT = 'DRAFT',         // Bản nháp
  ACTIVE = 'ACTIVE',       // Đang hoạt động
  PENDING = 'PENDING',     // Câu hỏi chờ kiểm tra
  ARCHIVED = 'ARCHIVED',   // Đã lưu trữ
  DELETED = 'DELETED'      // Đã xóa
}

/**
 * Enum cho loại hình ảnh câu hỏi
 * Tương ứng với QuestionImageType trong schema.prisma
 */
export enum QuestionImageType {
  QUESTION = 'QUESTION',   // Hình ảnh của câu hỏi
  SOLUTION = 'SOLUTION'    // Hình ảnh của lời giải
}

/**
 * Enum cho độ khó câu hỏi
 * Tương ứng với Difficulty trong schema.prisma
 */
export enum QuestionDifficulty {
  EASY = 'EASY',           // Mức độ dễ
  MEDIUM = 'MEDIUM',       // Mức độ trung bình
  HARD = 'HARD'            // Mức độ khó
}