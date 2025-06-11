import { Injectable } from '@nestjs/common';
// @ts-expect-error - PrismaService sẽ được cung cấp trong runtime
import { PrismaService } from '../../prisma.service';
import { 
  ExamAttempt, 
  ExamAttemptCreateData, 
  ExamAttemptFilters, 
  ExamAttemptUpdateData, 
  IExamAttemptRepository 
} from '@project/interfaces';

/**
 * Implementation of ExamAttemptRepository using Prisma
 */
@Injectable()
export class PrismaExamAttemptRepository implements IExamAttemptRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all attempts with optional filters
   */
  async findAll(filters?: ExamAttemptFilters): Promise<ExamAttempt[]> {
    const { userId, examId, isCompleted, limit = 10, offset = 0 } = filters || {};
    
    const attempts = await this.prisma.examAttempt.findMany({
      where: {
        ...(userId && { userId }),
        ...(examId && { examId }),
        ...(isCompleted !== undefined && { isCompleted }),
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        exam: true
      }
    });
    
    return attempts.map(attempt => this.mapPrismaAttemptToEntity(attempt));
  }

  /**
   * Find an attempt by ID
   */
  async findById(id: string): Promise<ExamAttempt | null> {
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id },
      include: {
        exam: true
      }
    });
    
    return attempt ? this.mapPrismaAttemptToEntity(attempt) : null;
  }

  /**
   * Find all attempts by user ID
   */
  async findByUserId(userId: string): Promise<ExamAttempt[]> {
    const attempts = await this.prisma.examAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        exam: true
      }
    });
    
    return attempts.map(attempt => this.mapPrismaAttemptToEntity(attempt));
  }

  /**
   * Find all attempts by exam ID
   */
  async findByExamId(examId: string): Promise<ExamAttempt[]> {
    const attempts = await this.prisma.examAttempt.findMany({
      where: { examId },
      orderBy: { createdAt: 'desc' },
      include: {
        exam: true
      }
    });
    
    return attempts.map(attempt => this.mapPrismaAttemptToEntity(attempt));
  }

  /**
   * Find the latest incomplete attempt for a user and exam
   */
  async findIncompleteAttempt(userId: string, examId: string): Promise<ExamAttempt | null> {
    const attempt = await this.prisma.examAttempt.findFirst({
      where: {
        userId,
        examId,
        isCompleted: false
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        exam: true
      }
    });
    
    return attempt ? this.mapPrismaAttemptToEntity(attempt) : null;
  }

  /**
   * Create a new attempt
   */
  async create(data: ExamAttemptCreateData): Promise<ExamAttempt> {
    const attempt = await this.prisma.examAttempt.create({
      data: {
        examId: data.examId,
        userId: data.userId,
        startedAt: data.startedAt,
        isCompleted: data.isCompleted,
        answers: data.answers || {},
      },
      include: {
        exam: true
      }
    });
    
    return this.mapPrismaAttemptToEntity(attempt);
  }

  /**
   * Update an existing attempt
   */
  async update(id: string, data: ExamAttemptUpdateData): Promise<ExamAttempt> {
    const attempt = await this.prisma.examAttempt.update({
      where: { id },
      data: {
        ...(data.completedAt && { completedAt: data.completedAt }),
        ...(data.isCompleted !== undefined && { isCompleted: data.isCompleted }),
        ...(data.answers && { answers: data.answers }),
        ...(data.score !== undefined && { score: data.score }),
        ...(data.timeSpent !== undefined && { timeSpent: data.timeSpent }),
        ...(data.passed !== undefined && { passed: data.passed }),
      },
      include: {
        exam: true
      }
    });
    
    return this.mapPrismaAttemptToEntity(attempt);
  }

  /**
   * Update answers for an attempt
   */
  async updateAnswers(id: string, answers: Record<string, unknown>): Promise<ExamAttempt> {
    // Chuyển đổi các giá trị không phải string sang JSON string
    const processedAnswers: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(answers)) {
      if (typeof value === 'string') {
        processedAnswers[key] = value;
      } else {
        // Chuyển đổi đối tượng phức tạp hoặc mảng sang JSON string
        processedAnswers[key] = JSON.stringify(value);
      }
    }
    
    const attempt = await this.prisma.examAttempt.update({
      where: { id },
      data: {
        answers: processedAnswers,
      },
      include: {
        exam: true
      }
    });
    
    return this.mapPrismaAttemptToEntity(attempt);
  }

  /**
   * Complete an attempt and calculate the score
   */
  async completeAttempt(id: string, endTime: Date): Promise<ExamAttempt> {
    const attempt = await this.prisma.examAttempt.update({
      where: { id },
      data: {
        completedAt: endTime,
        isCompleted: true,
      },
      include: {
        exam: true
      }
    });
    
    return this.mapPrismaAttemptToEntity(attempt);
  }

  /**
   * Calculate the score for an attempt
   */
  async calculateScore(id: string): Promise<number> {
    // Tìm attempt dựa trên ID
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id },
      include: {
        exam: true
      }
    });

    if (!attempt) {
      throw new Error(`Không tìm thấy phiên làm bài với ID: ${id}`);
    }

    // Nếu không có câu trả lời, trả về điểm 0
    if (!attempt.answers || Object.keys(attempt.answers).length === 0) {
      return 0;
    }

    // Lấy tất cả câu hỏi trong bài thi
    const examQuestions = await this.prisma.examQuestion.findMany({
      where: {
        examId: attempt.examId
      }
    });

    if (!examQuestions || examQuestions.length === 0) {
      return 0;
    }

    let totalScore = 0;
    let maxPossibleScore = 0;
    const answers = attempt.answers as Record<string, unknown>;

    // Duyệt qua từng câu hỏi để tính điểm
    for (const question of examQuestions) {
      const questionId = question.id.toString();
      maxPossibleScore += question.score || 0;

      // Nếu người dùng không trả lời câu hỏi này, bỏ qua
      if (!answers[questionId]) {
        continue;
      }

      let userAnswer: unknown;
      try {
        // Thử parse JSON nếu câu trả lời được lưu dưới dạng chuỗi JSON
        const answerValue = answers[questionId];
        if (typeof answerValue === 'string') {
          try {
            userAnswer = JSON.parse(answerValue);
          } catch {
            userAnswer = answerValue;
          }
        } else {
          userAnswer = answerValue;
        }
      } catch (error) {
        console.error(`Error parsing answer for question ${questionId}:`, error);
        continue;
      }

      // Tùy thuộc vào loại câu hỏi, tính điểm khác nhau
      switch (question.questionType) {
        case 'SINGLE_CHOICE': {
          // Đối với trắc nghiệm một đáp án
          if (typeof userAnswer === 'object' && userAnswer !== null) {
            const answer = userAnswer as Record<string, unknown>;
            if (answer.isCorrect === true) {
              totalScore += question.score || 0;
            }
          } else if (typeof userAnswer === 'string') {
            // Trường hợp câu trả lời lưu trực tiếp là ID của lựa chọn
            const correctAnswer = Array.isArray(question.correctAnswer) 
              ? question.correctAnswer[0] 
              : question.correctAnswer;
            if (userAnswer === correctAnswer) {
              totalScore += question.score || 0;
            }
          }
          break;
        }
        
        case 'MULTIPLE_CHOICE': {
          // Đối với trắc nghiệm nhiều đáp án
          if (typeof userAnswer === 'object' && userAnswer !== null) {
            const answer = userAnswer as Record<string, unknown>;
            if (answer.isCorrect === true) {
              totalScore += question.score || 0;
            } else if (Array.isArray(answer.selectedOptions) && Array.isArray(question.correctAnswer)) {
              // So sánh mảng các lựa chọn đã chọn với mảng đáp án đúng
              const selectedOptions = answer.selectedOptions as string[];
              const correctOptions = question.correctAnswer as string[];
              
              // Kiểm tra nếu người dùng chọn đúng tất cả các đáp án
              const allCorrect = correctOptions.every(opt => selectedOptions.includes(opt)) &&
                                selectedOptions.every(opt => correctOptions.includes(opt));
              
              if (allCorrect) {
                totalScore += question.score || 0;
              } else if (selectedOptions.some(opt => correctOptions.includes(opt))) {
                // Nếu chọn đúng một phần, cho điểm một phần
                const correctCount = selectedOptions.filter(opt => correctOptions.includes(opt)).length;
                const partialScore = (correctCount / correctOptions.length) * (question.score || 0);
                totalScore += partialScore;
              }
            }
          }
          break;
        }
        
        case 'TRUE_FALSE': {
          // Đối với câu hỏi Đúng/Sai
          if (typeof userAnswer === 'object' && userAnswer !== null) {
            const answer = userAnswer as Record<string, unknown>;
            if (answer.isCorrect === true) {
              totalScore += question.score || 0;
            }
          } else if (typeof userAnswer === 'boolean' || typeof userAnswer === 'string') {
            // Trường hợp câu trả lời lưu trực tiếp là true/false hoặc 'true'/'false'
            const userBool = typeof userAnswer === 'string' 
              ? userAnswer.toLowerCase() === 'true' 
              : userAnswer;
            
            const correctBool = typeof question.correctAnswer === 'string'
              ? question.correctAnswer.toLowerCase() === 'true'
              : question.correctAnswer === true;
            
            if (userBool === correctBool) {
              totalScore += question.score || 0;
            }
          }
          break;
        }
        
        case 'SHORT_ANSWER': {
          // Đối với câu trả lời ngắn
          if (typeof userAnswer === 'string' && typeof question.correctAnswer === 'string') {
            // Loại bỏ khoảng trắng và chuyển thành chữ thường để so sánh
            const normalizedUserAnswer = userAnswer.trim().toLowerCase();
            const normalizedCorrectAnswer = question.correctAnswer.trim().toLowerCase();
            
            if (normalizedUserAnswer === normalizedCorrectAnswer) {
              totalScore += question.score || 0;
            }
          } else if (typeof userAnswer === 'object' && userAnswer !== null) {
            const answer = userAnswer as Record<string, unknown>;
            if (answer.isCorrect === true || answer.score) {
              const score = typeof answer.score === 'number' ? answer.score : question.score || 0;
              totalScore += score;
            }
          }
          break;
        }
        
        case 'FILL_IN_BLANK': {
          // Đối với điền vào chỗ trống
          if (typeof userAnswer === 'string' && typeof question.correctAnswer === 'string') {
            // Loại bỏ khoảng trắng và chuyển thành chữ thường để so sánh
            const normalizedUserAnswer = userAnswer.trim().toLowerCase();
            const normalizedCorrectAnswer = question.correctAnswer.trim().toLowerCase();
            
            if (normalizedUserAnswer === normalizedCorrectAnswer) {
              totalScore += question.score || 0;
            }
          } else if (typeof userAnswer === 'object' && userAnswer !== null) {
            const answer = userAnswer as Record<string, unknown>;
            if (answer.isCorrect === true || answer.score) {
              const score = typeof answer.score === 'number' ? answer.score : question.score || 0;
              totalScore += score;
            }
          }
          break;
        }

        case 'ESSAY': {
          // Đối với câu hỏi tự luận, cần có người chấm điểm
          if (typeof userAnswer === 'object' && userAnswer !== null) {
            const answer = userAnswer as Record<string, unknown>;
            // Nếu đã có điểm được chấm (từ giáo viên), sử dụng điểm đó
            if (answer.score !== undefined && typeof answer.score === 'number') {
              totalScore += answer.score;
            } else if (answer.autoScore !== undefined && typeof answer.autoScore === 'number') {
              // Nếu có điểm tự động (từ AI hoặc so khớp từ khóa), sử dụng điểm đó
              totalScore += answer.autoScore;
            }
          }
          break;
        }

        case 'MATCHING': {
          // Đối với nối câu
          if (typeof userAnswer === 'object' && userAnswer !== null) {
            const answer = userAnswer as Record<string, unknown>;
            if (answer.isCorrect === true) {
              totalScore += question.score || 0;
            } else if (typeof answer.matches === 'object' && answer.matches !== null) {
              // So sánh các cặp nối
              const userMatches = answer.matches as Record<string, string>;
              const correctMatches = typeof question.correctAnswer === 'object' && question.correctAnswer !== null
                ? question.correctAnswer as Record<string, string>
                : {};
              
              // Đếm số cặp nối đúng
              let correctCount = 0;
              const totalPairs = Object.keys(correctMatches).length;
              
              for (const [key, value] of Object.entries(userMatches)) {
                if (correctMatches[key] === value) {
                  correctCount++;
                }
              }
              
              if (totalPairs > 0) {
                // Tính điểm tỷ lệ theo số cặp đúng
                const partialScore = (correctCount / totalPairs) * (question.score || 0);
                totalScore += partialScore;
              }
            }
          }
          break;
        }

        default: {
          // Các loại câu hỏi khác hoặc từ ngân hàng câu hỏi
          if (typeof userAnswer === 'object' && userAnswer !== null) {
            const answer = userAnswer as Record<string, unknown>;
            if (answer.isCorrect === true) {
              totalScore += question.score || 0;
            } else if (answer.score !== undefined && typeof answer.score === 'number') {
              totalScore += answer.score;
            }
          }
          break;
        }
      }
    }

    // Tính điểm dựa trên thang điểm 10
    const finalScore = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 10 : 0;
    
    // Cập nhật điểm cho bài làm
    await this.prisma.examAttempt.update({
      where: { id },
      data: {
        score: finalScore,
        maxScore: 10, // Thang điểm tối đa là 10
        timeSpent: attempt.completedAt 
          ? Math.floor((attempt.completedAt.getTime() - attempt.startedAt.getTime()) / 1000)
          : undefined,
        // Người dùng đạt nếu điểm >= 5/10
        passed: finalScore >= 5
      }
    });

    return finalScore;
  }

  /**
   * Delete an attempt
   */
  async delete(id: string): Promise<boolean> {
    await this.prisma.examAttempt.delete({
      where: { id },
    });
    
    return true;
  }

  /**
   * Count attempts for a specific user or exam
   */
  async count(filters?: ExamAttemptFilters): Promise<number> {
    const { userId, examId, isCompleted } = filters || {};
    
    return await this.prisma.examAttempt.count({
      where: {
        ...(userId && { userId }),
        ...(examId && { examId }),
        ...(isCompleted !== undefined && { isCompleted }),
      },
    });
  }

  /**
   * Map Prisma ExamAttempt to ExamAttempt entity
   */
  private mapPrismaAttemptToEntity(prismaAttempt: unknown): ExamAttempt {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attempt = prismaAttempt as any;
    
    return {
      id: attempt.id,
      examId: attempt.examId,
      userId: attempt.userId,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt || undefined,
      isCompleted: attempt.isCompleted,
      answers: attempt.answers || {},
      score: attempt.score,
      maxScore: attempt.maxScore,
      passed: attempt.passed,
      timeSpent: attempt.timeSpent,
      createdAt: attempt.createdAt,
      updatedAt: attempt.updatedAt,
      exam: attempt.exam || undefined
    };
  }
} 