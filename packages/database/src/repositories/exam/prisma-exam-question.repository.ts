import { Injectable } from '@nestjs/common';
import { IExamQuestionRepository } from '@project/interfaces';
import {
  Difficulty,
  ExamQuestion
} from '@project/entities';
import { QuestionType as QuestionEnumType } from '@project/entities/dist/enums/question-enums';
import { QuestionType } from '@project/entities/dist/enums/exam-enums';
import { ExamFilterDto } from '@project/dto';
import { Prisma, Question } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

// Định nghĩa type cho options
type QuestionOption = {
  id: string;
  text: string;
};

// Sử dụng type từ Prisma client
type PrismaQuestion = Question;

// Định nghĩa metadata type cho việc lưu các thông tin mở rộng
type QuestionMetadata = {
  difficultyLevel?: Difficulty;
  examId?: number;
  order?: number;
  score?: number;
  questionType?: QuestionType;
  tags?: string[];
  sourceQuestionId?: string; // ID của câu hỏi gốc từ ngân hàng câu hỏi
};

// Mapping giữa hai enum QuestionType
const questionTypeMapping: Record<QuestionEnumType, QuestionType> = {
  [QuestionEnumType.MC]: QuestionType.MULTIPLE_CHOICE,
  [QuestionEnumType.TF]: QuestionType.TRUE_FALSE,
  [QuestionEnumType.SA]: QuestionType.SHORT_ANSWER,
  [QuestionEnumType.ES]: QuestionType.ESSAY,
  [QuestionEnumType.MA]: QuestionType.MATCHING
};

// Mapping ngược lại
const reverseQuestionTypeMapping: Record<QuestionType, QuestionEnumType> = {
  [QuestionType.MULTIPLE_CHOICE]: QuestionEnumType.MC,
  [QuestionType.TRUE_FALSE]: QuestionEnumType.TF,
  [QuestionType.SHORT_ANSWER]: QuestionEnumType.SA,
  [QuestionType.ESSAY]: QuestionEnumType.ES,
  // Giá trị mặc định cho các trường hợp khác
  [QuestionType.SINGLE_CHOICE]: QuestionEnumType.MC,
  [QuestionType.MATCHING]: QuestionEnumType.MA,
  [QuestionType.FILL_IN_BLANK]: QuestionEnumType.SA
};

/**
 * Định nghĩa type cho create và update input
 */
interface ExamQuestionCreateData {
  examId: number;
  content: string;
  questionType: QuestionType;
  options: { id: string; text: string }[];
  correctAnswer: string | string[];
  explanation?: string;
  score: number;
  difficultyLevel: Difficulty;
  order: number;
  sourceQuestionId?: string;
}

/**
 * Định nghĩa type cho update input
 */
interface ExamQuestionUpdateData {
  content?: string;
  questionType?: QuestionType;
  options?: { id: string; text: string }[];
  correctAnswer?: string | string[];
  explanation?: string;
  score?: number;
  difficultyLevel?: Difficulty;
  order?: number;
  sourceQuestionId?: string;
}

@Injectable()
export class PrismaExamQuestionRepository implements IExamQuestionRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Chuyển đổi ID từ number sang string cho Prisma
   */
  private convertId(id: number): string {
    return id.toString();
  }

  /**
   * Lưu trữ thông tin mở rộng vào metadata
   */
  private createMetadata(data: Partial<ExamQuestionCreateData>): QuestionMetadata {
    return {
      difficultyLevel: data.difficultyLevel || Difficulty.MEDIUM,
      examId: data.examId || 0,
      order: data.order,
      score: data.score,
      questionType: data.questionType || QuestionType.MULTIPLE_CHOICE,
      sourceQuestionId: data.sourceQuestionId
    };
  }

  /**
   * Lấy metadata từ options field của question
   * Vì schema không có trường metadata, chúng ta sẽ lưu metadata vào options
   */
  private getMetadataFromOptions(options: Prisma.JsonValue): QuestionMetadata {
    const parsedOptions = options as Record<string, unknown>;
    const metadata = parsedOptions && parsedOptions._metadata
      ? parsedOptions._metadata as QuestionMetadata
      : {
          difficultyLevel: Difficulty.MEDIUM,
          examId: 0,
          questionType: QuestionType.MULTIPLE_CHOICE
        };
    return metadata;
  }

  /**
   * Thêm metadata vào options
   */
  private addMetadataToOptions(options: QuestionOption[], metadata: QuestionMetadata): Prisma.JsonValue {
    return {
      options: options,
      _metadata: metadata
    };
  }

  /**
   * Map dữ liệu từ dạng JSON sang ExamQuestion entity
   * @param prismaQuestion Dữ liệu từ Prisma
   * @returns ExamQuestion entity
   */
  private mapToExamQuestionEntity(prismaQuestion: PrismaQuestion): ExamQuestion {
    // Get metadata từ options
    const metadata = this.getMetadataFromOptions(prismaQuestion.options);
    const parsedOptions = prismaQuestion.options as Record<string, unknown>;
    const options: QuestionOption[] = parsedOptions.options ? parsedOptions.options as QuestionOption[] : [];

    const question = new ExamQuestion();
    // Chuyển đổi id từ string sang number (nếu cần)
    question.id = typeof prismaQuestion.id === 'string' ? parseInt(prismaQuestion.id) : (prismaQuestion.id as number);
    // Lấy examId từ metadata
    question.examId = metadata.examId || 0;
    question.content = prismaQuestion.content;
    question.questionType = metadata.questionType || QuestionType.MULTIPLE_CHOICE;
    question.options = options;

    // Chuyển đổi correctAnswer từ JsonValue sang string | string[]
    const correctAnswerValue = prismaQuestion.correctAnswer;
    if (typeof correctAnswerValue === 'string') {
      // Kiểm tra xem đây có phải JSON string của một array không
      try {
        const parsed = JSON.parse(correctAnswerValue);
        if (Array.isArray(parsed)) {
          question.correctAnswer = parsed;
        } else {
          question.correctAnswer = correctAnswerValue;
        }
      } catch {
        // Nếu không parse được JSON, xem như string thông thường
        question.correctAnswer = correctAnswerValue;
      }
    } else if (Array.isArray(correctAnswerValue)) {
      question.correctAnswer = correctAnswerValue as string[];
    } else {
      // Fallback mặc định nếu không phải string hoặc array
      question.correctAnswer = String(correctAnswerValue || '');
    }

    question.explanation = (prismaQuestion as unknown as { explanation?: string }).explanation || '';
    question.score = metadata.score || 0;
    // Lấy difficultyLevel từ metadata
    question.difficultyLevel = metadata.difficultyLevel || Difficulty.MEDIUM;
    question.order = metadata.order || 0;
    // Thêm sourceQuestionId từ metadata
    question.sourceQuestionId = metadata.sourceQuestionId;
    question.createdAt = prismaQuestion.createdAt;
    question.updatedAt = prismaQuestion.updatedAt;

    return question;
  }

  /**
   * Tìm kiếm tất cả câu hỏi bài thi với bộ lọc
   * @param filters Các tham số lọc và phân trang
   * @returns Danh sách câu hỏi bài thi đã phân trang
   */
  async findAll(filters: ExamFilterDto): Promise<{ examQuestions: ExamQuestion[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'id',
      sortOrder = 'desc',
      search = '',
    } = filters;

    const skip = (page - 1) * limit;

    // Xây dựng điều kiện where
    const where: Prisma.QuestionWhereInput = {};

    // Thêm các điều kiện lọc - sửa lại phù hợp với schema
    if (search) {
      where.OR = [
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Thực hiện truy vấn lấy dữ liệu
    try {
      // Phương thức findMany trả về dữ liệu từ Prisma
      const questions = await this.prisma.question.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }) as unknown as PrismaQuestion[];

      // Đếm tổng số câu hỏi thỏa mãn điều kiện where
      const total = await this.prisma.question.count({
        where,
      });

      // Map dữ liệu từ Prisma sang entity
      const examQuestions = questions.map(question =>
        this.mapToExamQuestionEntity(question)
      );

      return {
        examQuestions,
        total,
      };
    } catch (error) {
      console.error('Error in findAll:', error);
      return {
        examQuestions: [],
        total: 0,
      };
    }
  }

  /**
   * Tìm câu hỏi bài thi theo ID
   * @param id ID của câu hỏi bài thi
   * @returns Câu hỏi bài thi nếu tìm thấy, null nếu không
   */
  async findById(id: number): Promise<ExamQuestion | null> {
    try {
      const question = await this.prisma.question.findUnique({
        where: { id: this.convertId(id) },
      }) as unknown as PrismaQuestion;

      if (!question) {
        return null;
      }

      return this.mapToExamQuestionEntity(question);
    } catch (error) {
      console.error('Error in findById:', error);
      return null;
    }
  }

  /**
   * Tìm câu hỏi bài thi theo nhiều ID
   * @param ids Danh sách ID của câu hỏi bài thi
   * @returns Danh sách câu hỏi bài thi
   */
  async findByIds(ids: number[]): Promise<ExamQuestion[]> {
    if (!ids?.length) {
      return [];
    }

    try {
      const questions = await this.prisma.question.findMany({
        where: {
          id: {
            in: ids.map(id => this.convertId(id)),
          },
        },
      }) as unknown as PrismaQuestion[];

      return questions.map(question =>
        this.mapToExamQuestionEntity(question)
      );
    } catch (error) {
      console.error('Error in findByIds:', error);
      return [];
    }
  }

  /**
   * Tìm câu hỏi bài thi theo môn học
   * @param subject Môn học
   * @returns Danh sách câu hỏi bài thi
   */
  async findBySubject(subject: string): Promise<ExamQuestion[]> {
    try {
      // Giả sử chúng ta lưu trữ thông tin môn học trong metadata của câu hỏi
      const questions = await this.prisma.question.findMany() as unknown as PrismaQuestion[];

      // Lọc theo subject từ metadata sau khi lấy data
      const filteredQuestions = questions.filter(q => {
        const parsedOptions = q.options as Record<string, unknown>;
        const metadata = parsedOptions && parsedOptions._metadata ? parsedOptions._metadata as Record<string, unknown> : null;
        return metadata && metadata.subject === subject;
      });

      return filteredQuestions.map(question =>
        this.mapToExamQuestionEntity(question)
      );
    } catch (error) {
      console.error('Error in findBySubject:', error);
      return [];
    }
  }

  /**
   * Tìm câu hỏi bài thi theo độ khó
   * @param difficultyLevel Độ khó
   * @returns Danh sách câu hỏi bài thi
   */
  async findByDifficulty(difficultyLevel: Difficulty): Promise<ExamQuestion[]> {
    try {
      // Lấy tất cả câu hỏi và lọc theo difficultyLevel trong metadata
      const questions = await this.prisma.question.findMany() as unknown as PrismaQuestion[];

      // Lọc theo difficultyLevel sau khi lấy data
      const filteredQuestions = questions.filter(q => {
        const parsedOptions = q.options as Record<string, unknown>;
        const metadata = parsedOptions && parsedOptions._metadata ? parsedOptions._metadata as Record<string, unknown> : null;
        return metadata && metadata.difficultyLevel === difficultyLevel;
      });

      return filteredQuestions.map(question =>
        this.mapToExamQuestionEntity(question)
      );
    } catch (error) {
      console.error('Error in findByDifficulty:', error);
      return [];
    }
  }

  /**
   * Tìm câu hỏi bài thi theo khối lớp
   * @param grade Khối lớp
   * @returns Danh sách câu hỏi bài thi
   */
  async findByGrade(grade: number): Promise<ExamQuestion[]> {
    try {
      // Giả sử thông tin khối lớp được lưu trữ trong metadata
      const questions = await this.prisma.question.findMany() as unknown as PrismaQuestion[];

      // Lọc theo grade từ metadata sau khi lấy data
      const filteredQuestions = questions.filter(q => {
        const parsedOptions = q.options as Record<string, unknown>;
        const metadata = parsedOptions && parsedOptions._metadata ? parsedOptions._metadata as Record<string, unknown> : null;
        return metadata && metadata.grade === grade;
      });

      return filteredQuestions.map(question =>
        this.mapToExamQuestionEntity(question)
      );
    } catch (error) {
      console.error('Error in findByGrade:', error);
      return [];
    }
  }

  /**
   * Tạo câu hỏi bài thi mới
   * @param data Dữ liệu câu hỏi bài thi
   * @returns Câu hỏi bài thi đã tạo
   */
  async create(data: ExamQuestionCreateData): Promise<ExamQuestion> {
    try {
      // Tạo metadata cho các trường không có trong schema Prisma
      const metadata = this.createMetadata(data);

      // Tạo options với metadata nhúng
      const optionsWithMetadata = this.addMetadataToOptions(data.options, metadata);

      // Chuyển đổi correctAnswer thành chuỗi nếu là mảng
      const correctAnswerValue = Array.isArray(data.correctAnswer)
        ? JSON.stringify(data.correctAnswer)
        : data.correctAnswer;

      // Chuẩn bị data cần thiết cho Prisma create input với các trường bắt buộc
      const createData = {
        content: data.content,
        options: optionsWithMetadata,
        correctAnswer: correctAnswerValue as unknown as Prisma.JsonValue,
        rawContent: data.content, // Trường bắt buộc
        type: 'MC' as unknown, // Trường bắt buộc - QuestionType.MC
        creator: {
          connect: { id: '1' } // Trường bắt buộc - giả định creator ID
        }
      } as unknown as Prisma.QuestionCreateInput;

      // Thêm explanation nếu có
      if (data.explanation) {
        (createData as Prisma.QuestionCreateInput & { explanation?: string }).explanation = data.explanation;
      }

      const createdQuestion = await this.prisma.question.create({
        data: createData,
      });

      return this.mapToExamQuestionEntity(createdQuestion);
    } catch (error) {
      console.error('Error in create:', error);
      throw new Error('Không thể tạo câu hỏi bài thi');
    }
  }

  /**
   * Tạo nhiều câu hỏi bài thi mới
   * @param data Danh sách dữ liệu câu hỏi bài thi
   * @returns Danh sách câu hỏi bài thi đã tạo
   */
  async createMany(data: ExamQuestionCreateData[]): Promise<ExamQuestion[]> {
    if (!data?.length) {
      return [];
    }

    try {
      // Chuẩn bị dữ liệu tạo
      const createData = data.map(item => {
        const metadata = this.createMetadata(item);
        // Chuyển đổi correctAnswer thành chuỗi nếu là mảng
        const correctAnswerValue = Array.isArray(item.correctAnswer)
          ? JSON.stringify(item.correctAnswer)
          : item.correctAnswer;

        return {
          content: item.content,
          rawContent: item.content, // Trường bắt buộc
          type: 'MC', // Trường bắt buộc - QuestionType.MC
          creatorId: '1', // Trường bắt buộc - creator ID
          options: this.addMetadataToOptions(item.options, metadata),
          correctAnswer: correctAnswerValue as unknown as Prisma.JsonValue
        };
      });

      await this.prisma.question.createMany({
        data: createData as unknown as Prisma.QuestionCreateManyInput[],
      });

      // Lấy lại các câu hỏi vừa tạo
      const createdQuestions = await this.prisma.question.findMany({
        where: {
          content: {
            in: data.map(item => item.content),
          },
        },
        orderBy: {
          id: 'desc',
        },
        take: data.length,
      }) as unknown as PrismaQuestion[];

      return createdQuestions.map(question =>
        this.mapToExamQuestionEntity(question)
      );
    } catch (error) {
      console.error('Error in createMany:', error);
      throw new Error('Không thể tạo nhiều câu hỏi bài thi');
    }
  }

  /**
   * Cập nhật câu hỏi bài thi
   * @param id ID của câu hỏi cần cập nhật
   * @param data Dữ liệu cập nhật
   * @returns Câu hỏi bài thi đã cập nhật
   */
  async update(id: number, data: ExamQuestionUpdateData): Promise<ExamQuestion> {
    try {
      // Lấy câu hỏi hiện tại để có thể cập nhật metadata
      const existingQuestion = await this.prisma.question.findUnique({
        where: { id: this.convertId(id) },
      });

      if (!existingQuestion) {
        throw new Error('Không tìm thấy câu hỏi bài thi');
      }

      // Lấy metadata hiện tại từ options
      const currentMetadata = this.getMetadataFromOptions(existingQuestion.options);
      const parsedOptions = existingQuestion.options as Record<string, unknown>;
      const currentOptions: QuestionOption[] = parsedOptions.options ? parsedOptions.options as QuestionOption[] : [];

      // Cập nhật metadata với dữ liệu mới
      const updatedMetadata: QuestionMetadata = {
        difficultyLevel: data.difficultyLevel !== undefined ? data.difficultyLevel : currentMetadata.difficultyLevel,
        examId: currentMetadata.examId,
        order: data.order !== undefined ? data.order : currentMetadata.order,
        score: data.score !== undefined ? data.score : currentMetadata.score,
        questionType: data.questionType !== undefined ? data.questionType : currentMetadata.questionType
      };

      // Xác định rõ loại dữ liệu cập nhật cho Prisma
      const updateData = {
        content: data.content,
      } as Prisma.QuestionUpdateInput;

      // Cập nhật options nếu có
      if (data.options) {
        updateData.options = this.addMetadataToOptions(data.options, updatedMetadata);
      } else {
        // Giữ nguyên options nhưng cập nhật metadata
        updateData.options = this.addMetadataToOptions(currentOptions, updatedMetadata);
      }

      if (data.correctAnswer) {
        updateData.correctAnswer = Array.isArray(data.correctAnswer)
          ? data.correctAnswer.join(',')
          : data.correctAnswer;
      }

      if (data.explanation !== undefined) {
        (updateData as Prisma.QuestionUpdateInput & { explanation?: string }).explanation = data.explanation;
      }

      // Cập nhật câu hỏi
      const updatedQuestion = await this.prisma.question.update({
        where: { id: this.convertId(id) },
        data: updateData,
      });

      return this.mapToExamQuestionEntity(updatedQuestion);
    } catch (error) {
      console.error('Error in update:', error);
      throw new Error('Không thể cập nhật câu hỏi bài thi');
    }
  }

  /**
   * Xóa câu hỏi bài thi
   * @param id ID của câu hỏi bài thi
   * @returns Kết quả xóa (true/false)
   */
  async delete(id: number): Promise<boolean> {
    try {
      // Kiểm tra xem câu hỏi có tồn tại không
      const existingQuestion = await this.prisma.question.findUnique({
        where: { id: this.convertId(id) },
      });

      if (!existingQuestion) {
        return false;
      }

      // Xóa câu hỏi
      await this.prisma.question.delete({
        where: { id: this.convertId(id) },
      });

      return true;
    } catch (error) {
      console.error('Error in delete:', error);
      return false;
    }
  }

  /**
   * Tìm câu hỏi bài thi theo tags
   * @param tags Danh sách tags
   * @returns Danh sách câu hỏi bài thi
   */
  async findByTags(tags: string[]): Promise<ExamQuestion[]> {
    if (!tags?.length) {
      return [];
    }

    try {
      // Lấy tất cả câu hỏi và lọc theo tags trong JavaScript
      const questions = await this.prisma.question.findMany() as unknown as PrismaQuestion[];

      // Lọc câu hỏi có chứa ít nhất một tag
      const filteredQuestions = questions.filter(q => {
        const parsedOptions = q.options as Record<string, unknown>;
        const metadata = parsedOptions && parsedOptions._metadata ? parsedOptions._metadata as Record<string, unknown> : null;
        if (!metadata || !metadata.tags) return false;

        const questionTags = metadata.tags as string[];
        return tags.some(tag => questionTags.includes(tag));
      });

      return filteredQuestions.map(question =>
        this.mapToExamQuestionEntity(question)
      );
    } catch (error) {
      console.error('Error in findByTags:', error);
      return [];
    }
  }

  async findByExamId(examId: number): Promise<ExamQuestion[]> {
    try {
      // Lấy tất cả câu hỏi và lọc theo examId trong metadata
      const questions = await this.prisma.question.findMany() as unknown as PrismaQuestion[];

      // Lọc câu hỏi có examId trong metadata
      const filteredQuestions = questions.filter(q => {
        const parsedOptions = q.options as Record<string, unknown>;
        const metadata = parsedOptions && parsedOptions._metadata ? parsedOptions._metadata as Record<string, unknown> : null;
        return metadata && metadata.examId === examId;
      });

      return filteredQuestions.map(question => this.mapToExamQuestionEntity(question));
    } catch (error) {
      console.error('Error in findByExamId:', error);
      return [];
    }
  }

  async findQuestionsByDifficulty(difficulty: Difficulty): Promise<ExamQuestion[]> {
    try {
      // Lấy tất cả câu hỏi và lọc theo difficulty trong metadata
      const questions = await this.prisma.question.findMany() as unknown as PrismaQuestion[];

      // Lọc câu hỏi theo độ khó từ metadata
      const filteredQuestions = questions.filter(q => {
        const parsedOptions = q.options as Record<string, unknown>;
        const metadata = parsedOptions && parsedOptions._metadata ? parsedOptions._metadata as Record<string, unknown> : null;
        return metadata && metadata.difficultyLevel === difficulty;
      });

      return filteredQuestions.map(question => this.mapToExamQuestionEntity(question));
    } catch (error) {
      console.error('Error in findQuestionsByDifficulty:', error);
      return [];
    }
  }

  async deleteByExamId(examId: number): Promise<void> {
    try {
      // Lấy tất cả câu hỏi và lọc theo examId trong metadata
      const questions = await this.prisma.question.findMany() as unknown as PrismaQuestion[];

      // Lọc câu hỏi có examId trong metadata
      const questionIdsToDelete = questions
        .filter(q => {
          const parsedOptions = q.options as Record<string, unknown>;
          const metadata = parsedOptions && parsedOptions._metadata ? parsedOptions._metadata as Record<string, unknown> : null;
          return metadata && metadata.examId === examId;
        })
        .map(q => q.id);

      // Nếu có câu hỏi cần xóa
      if (questionIdsToDelete.length > 0) {
        await this.prisma.question.deleteMany({
          where: {
            id: {
              in: questionIdsToDelete
            }
          }
        });
      }
    } catch (error) {
      console.error('Error in deleteByExamId:', error);
    }
  }

  async bulkCreate(examId: number, questions: ExamQuestionCreateData[]): Promise<ExamQuestion[]> {
    try {
      const createdQuestions = await this.prisma.$transaction(
        questions.map((question) => {
          // Tạo metadata chứa examId và các thông tin khác
          const metadata = this.createMetadata({
            ...question,
            examId // Đảm bảo examId đúng
          });

          // Tạo options với metadata
          const optionsWithMetadata = this.addMetadataToOptions(question.options, metadata);

          // Tạo câu hỏi mới với các trường bắt buộc
          const createData = {
            content: question.content,
            rawContent: question.content, // Trường bắt buộc
            type: 'MC', // Trường bắt buộc - QuestionType.MC
            creator: {
              connect: { id: '1' } // Trường bắt buộc - giả định creator ID
            },
            options: optionsWithMetadata,
            correctAnswer: Array.isArray(question.correctAnswer)
              ? question.correctAnswer.join(',')
              : question.correctAnswer,
          } as unknown as Prisma.QuestionCreateInput;

          return this.prisma.question.create({
            data: createData
          });
        })
      );

      return createdQuestions.map(question => this.mapToExamQuestionEntity(question));
    } catch (error) {
      console.error('Error in bulkCreate:', error);
      throw new Error('Không thể tạo hàng loạt câu hỏi bài thi');
    }
  }

  async count(examId?: number): Promise<number> {
    try {
      if (examId) {
        // Đếm số câu hỏi theo examId trong metadata
        const allQuestions = await this.prisma.question.findMany() as unknown as PrismaQuestion[];
        return allQuestions.filter(q => {
          const parsedOptions = q.options as Record<string, unknown>;
          const metadata = parsedOptions && parsedOptions._metadata ? parsedOptions._metadata as Record<string, unknown> : null;
          return metadata && metadata.examId === examId;
        }).length;
      }

      // Đếm tất cả câu hỏi nếu không có examId
      return this.prisma.question.count();
    } catch (error) {
      console.error('Error in count:', error);
      return 0;
    }
  }

  async findRandomQuestions(
    count: number,
    difficultyLevel?: Difficulty,
    excludeIds: number[] = [],
  ): Promise<ExamQuestion[]> {
    try {
      // Convert các ID bị loại trừ sang string
      const excludeIdsStr = excludeIds.map(id => this.convertId(id));

      const whereCondition: Prisma.QuestionWhereInput = {
        id: { notIn: excludeIdsStr },
      };

      // Lấy tất cả câu hỏi thỏa mãn điều kiện
      const questions = await this.prisma.question.findMany({
        where: whereCondition,
      }) as unknown as PrismaQuestion[];

      // Nếu có yêu cầu lọc theo độ khó, thực hiện lọc trên metadata
      let filteredQuestions = questions;
      if (difficultyLevel) {
        filteredQuestions = questions.filter(q => {
          const parsedOptions = q.options as Record<string, unknown>;
          const metadata = parsedOptions && parsedOptions._metadata ? parsedOptions._metadata as Record<string, unknown> : null;
          return metadata && metadata.difficultyLevel === difficultyLevel;
        });
      }

      // Shuffle và lấy số lượng cần thiết
      const shuffled = this.shuffleArray([...filteredQuestions]);
      const actualCount = Math.min(count, shuffled.length);
      const selectedQuestions = shuffled.slice(0, actualCount);

      return selectedQuestions.map(question => this.mapToExamQuestionEntity(question));
    } catch (error) {
      console.error('Error in findRandomQuestions:', error);
      return [];
    }
  }

  private shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  // Hàm chuyển đổi từ QuestionEnumType sang QuestionType
  private mapToExamQuestionType(type: QuestionEnumType | QuestionType): QuestionType {
    if (Object.values(QuestionType).includes(type as QuestionType)) {
      return type as QuestionType;
    }

    return questionTypeMapping[type as QuestionEnumType] || QuestionType.MULTIPLE_CHOICE;
  }

  // Hàm chuyển đổi từ QuestionType sang QuestionEnumType
  private mapToQuestionEnumType(type: QuestionType | QuestionEnumType): QuestionEnumType {
    if (Object.values(QuestionEnumType).includes(type as QuestionEnumType)) {
      return type as QuestionEnumType;
    }

    return reverseQuestionTypeMapping[type as QuestionType] || QuestionEnumType.MC;
  }

  /**
   * Tìm câu hỏi bài thi theo ID của câu hỏi gốc từ ngân hàng câu hỏi
   * @param sourceQuestionId ID của câu hỏi gốc từ ngân hàng
   * @returns Danh sách câu hỏi bài thi liên kết với câu hỏi này
   */
  async findBySourceQuestionId(sourceQuestionId: string): Promise<ExamQuestion[]> {
    try {
      // Tìm các câu hỏi có sourceQuestionId tương ứng
      // Sử dụng truy vấn Prisma để lọc theo sourceQuestionId trong metadata
      const questions = await this.prisma.question.findMany({
        where: {
          // Sử dụng JsonFilter để tìm kiếm trong field JSON
          options: {
            path: ['_metadata', 'sourceQuestionId'],
            equals: sourceQuestionId
          }
        }
      }) as unknown as PrismaQuestion[];

      // Map dữ liệu từ Prisma sang entity
      return questions.map(question => this.mapToExamQuestionEntity(question));
    } catch (error) {
      console.error('Error in findBySourceQuestionId:', error);
      return [];
    }
  }

  /**
   * Lấy tất cả câu hỏi bài thi có tham chiếu đến câu hỏi từ ngân hàng
   * @returns Danh sách câu hỏi bài thi có nguồn gốc từ ngân hàng câu hỏi
   */
  async findAllWithSourceQuestionId(): Promise<ExamQuestion[]> {
    try {
      // Tìm tất cả câu hỏi có trường sourceQuestionId trong metadata
      const questions = await this.prisma.question.findMany({
        where: {
          // Tìm các record có path _metadata.sourceQuestionId không null
          options: {
            path: ['_metadata', 'sourceQuestionId'],
            not: null
          }
        }
      }) as unknown as PrismaQuestion[];

      // Map dữ liệu từ Prisma sang entity
      return questions.map(question => this.mapToExamQuestionEntity(question));
    } catch (error) {
      console.error('Error in findAllWithSourceQuestionId:', error);
      return [];
    }
  }
}