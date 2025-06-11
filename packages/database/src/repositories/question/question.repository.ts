import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IQuestionRepository } from '@project/interfaces';
import { QuestionData, QuestionOptionData } from '@project/interfaces';
import { QuestionFilterDto } from '@project/dto';
import {
  Question, QuestionStatus, QuestionDifficulty, QuestionTypeEnum
} from '../../entities';
import { Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

/**
 * Repository implementation cho Question
 * Triển khai đầy đủ IQuestionRepository từ interfaces package
 */
@Injectable()
export class QuestionRepository implements IQuestionRepository {
  constructor(private prisma: PrismaService) {}

  /**
   * Chuyển đổi Question entity sang QuestionData
   */
  private mapEntityToData(question: Question): QuestionData {
    // Chuyển đổi QuestionAnswer[] sang QuestionOptionData[]
    const options: QuestionOptionData[] = question.answers?.map(answer => ({
      id: answer.id,
      content: answer.content,
      isCorrect: answer.isCorrect || false,
      explanation: answer.explanation
    })) || [];

    return {
      id: question.id,
      questionId: question.questionId || undefined,
      title: question.content,
      content: question.rawContent,
      type: question.type as unknown as QuestionTypeEnum,
      difficulty: question.difficulty as QuestionDifficulty || QuestionDifficulty.MEDIUM,
      status: question.status,
      explanation: question.solution || undefined,
      createdBy: question.creatorId,
      options: options,
      tags: [], // Sẽ được điền sau khi query tags
    };
  }

  /**
   * Chuyển đổi QuestionData sang database model
   */
  private mapDataToEntity(data: QuestionData): Partial<Question> {
    // Chuyển đổi QuestionOptionData[] sang QuestionAnswer[]
    const answers = data.options?.map(option => ({
      id: option.id || uuidv4(),
      content: option.content,
      isCorrect: option.isCorrect,
      explanation: option.explanation,
      order: 0 // Giá trị mặc định
    }));

    return {
      id: data.id,
      content: data.title,
      rawContent: data.content,
      type: data.type as unknown as QuestionTypeEnum,
      questionId: data.questionId || null,
      subcount: null, // Cần tính toán từ questionId nếu cần
      solution: data.explanation || null,
      difficulty: data.difficulty as QuestionDifficulty,
      answers: answers || null,
      correctAnswer: answers?.filter(a => a.isCorrect).map(a => a.id) || null,
      status: data.status,
      usageCount: 0,
      creatorId: data.createdBy || 'system',
      feedback: 0
    };
  }

  /**
   * Tìm tất cả câu hỏi với các tùy chọn lọc nâng cao
   */
  async findAll(filters: QuestionFilterDto): Promise<{ questions: QuestionData[]; total: number }> {
    const where: Prisma.QuestionWhereInput = {};

    // Áp dụng các điều kiện lọc
    if (filters.types && filters.types.length > 0) {
      // Chuyển đổi từ QuestionType của entities sang QuestionType[] để tương thích với Prisma
      where.type = { in: filters.types as unknown as any };
    }

    if (filters.statuses && filters.statuses.length > 0) {
      where.status = { in: filters.statuses };
    }

    if (filters.search) {
      where.OR = [
        { content: { contains: filters.search, mode: 'insensitive' } },
        { rawContent: { contains: filters.search, mode: 'insensitive' } },
        { questionId: { contains: filters.search, mode: 'insensitive' } },
        { subcount: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    if (filters.creatorId) {
      where.creatorId = filters.creatorId;
    }

    // Tính toán skip và take từ page và limit
    const skip = ((filters.page || 1) - 1) * (filters.limit || 10);
    const take = filters.limit || 10;

    // Lấy dữ liệu và tổng số câu hỏi
    const [questions, total] = await Promise.all([
      this.prisma.question.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: 'desc' // Mặc định sắp xếp theo createdAt giảm dần
        }
      }),
      this.prisma.question.count({ where })
    ]);

    // Chuyển đổi dữ liệu về QuestionData
    const questionData: QuestionData[] = [];

    for (const question of questions) {
      const data = this.mapEntityToData(question as unknown as Question);

      // Lấy tags của câu hỏi
      const questionTags = await this.prisma.$queryRaw<{ id: string, name: string }[]>`
        SELECT qt.id, qt.name FROM question_tags qt
        JOIN "_QuestionToTags" rel ON qt.id = rel."B"
        WHERE rel."A" = ${question.id}
      `;

      data.tags = questionTags.map(tag => tag.id);

      questionData.push(data);
    }

    return { questions: questionData, total };
  }

  /**
   * Tìm câu hỏi theo ID
   */
  async findById(id: string): Promise<QuestionData | null> {
    const question = await this.prisma.question.findUnique({
      where: { id }
    });

    if (!question) {
      return null;
    }

    const data = this.mapEntityToData(question as unknown as Question);

    // Lấy tags
    const questionTags = await this.prisma.$queryRaw<{ id: string, name: string }[]>`
      SELECT qt.id, qt.name FROM question_tags qt
      JOIN "_QuestionToTags" rel ON qt.id = rel."B"
      WHERE rel."A" = ${question.id}
    `;

    data.tags = questionTags.map(tag => tag.id);

    return data;
  }

  /**
   * Tìm câu hỏi bằng QuestionID (định dạng XXXXX-X)
   */
  async findByQuestionId(questionId: string): Promise<QuestionData | null> {
    const question = await this.prisma.question.findFirst({
      where: { questionId }
    });

    if (!question) {
      return null;
    }

    return this.findById(question.id);
  }

  /**
   * Tìm câu hỏi bằng Subcount (định dạng XX.N)
   */
  async findBySubcount(subcount: string): Promise<QuestionData | null> {
    const question = await this.prisma.question.findFirst({
      where: { subcount }
    });

    if (!question) {
      return null;
    }

    return this.findById(question.id);
  }

  /**
   * Tìm câu hỏi có chứa các tags
   */
  async findByTags(tagIds: string[]): Promise<QuestionData[]> {
    if (!tagIds.length) {
      return [];
    }

    // Tìm tất cả câu hỏi có chứa ít nhất một trong các tag
    const questionIds = await this.prisma.$queryRaw<{ A: string }[]>`
      SELECT DISTINCT "A" FROM "_QuestionToTags"
      WHERE "B" IN (${Prisma.join(tagIds)})
    `;

    if (!questionIds.length) {
      return [];
    }

    const questions: QuestionData[] = [];

    for (const { A: id } of questionIds) {
      const question = await this.findById(id);
      if (question) {
        questions.push(question);
      }
    }

    return questions;
  }

  /**
   * Tạo câu hỏi mới
   */
  async create(data: QuestionData): Promise<QuestionData> {
    const questionData = this.mapDataToEntity(data);

    // Tạo câu hỏi mới
    const question = await this.prisma.question.create({
      data: questionData as unknown as Prisma.QuestionCreateInput
    });

    // Thêm tags nếu có
    if (data.tags && data.tags.length > 0) {
      await this.addTags(question.id, data.tags);
    }

    return this.findById(question.id) as Promise<QuestionData>;
  }

  /**
   * Cập nhật câu hỏi
   */
  async update(id: string, data: Partial<QuestionData>): Promise<QuestionData> {
    const existingQuestion = await this.findById(id);

    if (!existingQuestion) {
      throw new Error(`Question with id ${id} not found`);
    }

    // Tạo bản sao của câu hỏi hiện tại và cập nhật các trường mới
    const mergedData: QuestionData = { ...existingQuestion, ...data };
    const questionData = this.mapDataToEntity(mergedData);

    // Cập nhật câu hỏi
    await this.prisma.question.update({
      where: { id },
      data: questionData as unknown as Prisma.QuestionUpdateInput
    });

    // Cập nhật tags nếu cần
    if (data.tags) {
      // Xóa tất cả tags hiện tại
      await this.prisma.$executeRaw`
        DELETE FROM "_QuestionToTags" WHERE "A" = ${id}
      `;

      // Thêm tags mới
      if (data.tags.length > 0) {
        await this.addTags(id, data.tags);
      }
    }

    return this.findById(id) as Promise<QuestionData>;
  }

  /**
   * Xóa câu hỏi
   */
  async delete(id: string): Promise<boolean> {
    try {
      // Xóa liên kết với tags
      await this.prisma.$executeRaw`
        DELETE FROM "_QuestionToTags" WHERE "A" = ${id}
      `;

      // Xóa câu hỏi
      await this.prisma.question.delete({
        where: { id }
      });

      return true;
    } catch (error) {
      console.error(`Failed to delete question with ID ${id}:`, error);
      return false;
    }
  }

  /**
   * Thêm tags cho câu hỏi
   */
  async addTags(questionId: string, tagIds: string[]): Promise<QuestionData> {
    // Kiểm tra câu hỏi tồn tại
    const question = await this.prisma.question.findUnique({
      where: { id: questionId }
    });

    if (!question) {
      throw new Error(`Question with id ${questionId} not found`);
    }

    // Thêm liên kết với tags
    for (const tagId of tagIds) {
      await this.prisma.$executeRaw`
        INSERT INTO "_QuestionToTags" ("A", "B")
        VALUES (${questionId}, ${tagId})
        ON CONFLICT DO NOTHING
      `;
    }

    return this.findById(questionId) as Promise<QuestionData>;
  }

  /**
   * Xóa tags khỏi câu hỏi
   */
  async removeTags(questionId: string, tagIds: string[]): Promise<QuestionData> {
    // Kiểm tra câu hỏi tồn tại
    const question = await this.prisma.question.findUnique({
      where: { id: questionId }
    });

    if (!question) {
      throw new Error(`Question with id ${questionId} not found`);
    }

    // Xóa liên kết với tags
    for (const tagId of tagIds) {
      await this.prisma.$executeRaw`
        DELETE FROM "_QuestionToTags"
        WHERE "A" = ${questionId} AND "B" = ${tagId}
      `;
    }

    return this.findById(questionId) as Promise<QuestionData>;
  }

  /**
   * Cập nhật trạng thái câu hỏi
   */
  async updateStatus(questionId: string, status: QuestionStatus): Promise<QuestionData> {
    // Kiểm tra câu hỏi tồn tại
    const question = await this.prisma.question.findUnique({
      where: { id: questionId }
    });

    if (!question) {
      throw new Error(`Question with id ${questionId} not found`);
    }

    // Cập nhật trạng thái
    await this.prisma.question.update({
      where: { id: questionId },
      data: { status }
    });

    return this.findById(questionId) as Promise<QuestionData>;
  }

  /**
   * Tăng số lần sử dụng của câu hỏi
   */
  async incrementUsageCount(questionId: string): Promise<QuestionData> {
    // Kiểm tra câu hỏi tồn tại
    const question = await this.prisma.question.findUnique({
      where: { id: questionId }
    });

    if (!question) {
      throw new Error(`Question with id ${questionId} not found`);
    }

    // Tăng số lần sử dụng
    await this.prisma.question.update({
      where: { id: questionId },
      data: { usageCount: { increment: 1 } }
    });

    return this.findById(questionId) as Promise<QuestionData>;
  }

  /**
   * Tăng số lượng feedback cho câu hỏi
   */
  async incrementFeedbackCount(questionId: string): Promise<QuestionData> {
    // Kiểm tra câu hỏi tồn tại
    const question = await this.prisma.question.findUnique({
      where: { id: questionId }
    });

    if (!question) {
      throw new Error(`Question with id ${questionId} not found`);
    }

    // Tăng số lượng feedback
    await this.prisma.question.update({
      where: { id: questionId },
      data: { feedback: { increment: 1 } }
    });

    return this.findById(questionId) as Promise<QuestionData>;
  }

  /**
   * Tìm kiếm câu hỏi theo văn bản
   */
  async searchByText(searchText: string): Promise<QuestionData[]> {
    if (!searchText || searchText.trim().length === 0) {
      return [];
    }

    const questions = await this.prisma.question.findMany({
      where: {
        OR: [
          { content: { contains: searchText, mode: 'insensitive' } },
          { rawContent: { contains: searchText, mode: 'insensitive' } },
          { questionId: { contains: searchText, mode: 'insensitive' } },
          { subcount: { contains: searchText, mode: 'insensitive' } }
        ]
      }
    });

    const result: QuestionData[] = [];

    for (const question of questions) {
      const data = await this.findById(question.id);
      if (data) {
        result.push(data);
      }
    }

    return result;
  }

  /**
   * Tìm câu hỏi theo người tạo
   */
  async findByCreator(creatorId: string): Promise<QuestionData[]> {
    const questions = await this.prisma.question.findMany({
      where: { creatorId }
    });

    const result: QuestionData[] = [];

    for (const question of questions) {
      const data = await this.findById(question.id);
      if (data) {
        result.push(data);
      }
    }

    return result;
  }

  /**
   * Phân tích LaTeX và trích xuất thông tin câu hỏi
   */
  async parseLatexContent(rawContent: string): Promise<Partial<QuestionData>> {
    if (!rawContent || rawContent.trim().length === 0) {
      throw new Error('Raw content is empty');
    }

    // Phân tích nội dung LaTeX để trích xuất thông tin câu hỏi
    // Đây là logic đơn giản, cần triển khai phức tạp hơn tùy theo định dạng LaTeX

    const titleMatch = rawContent.match(/\\section\{(.*?)\}/);
    const title = titleMatch ? titleMatch[1] : 'Untitled Question';

    // Xác định loại câu hỏi dựa trên các pattern
    let type: QuestionTypeEnum;
    if (rawContent.includes('\\begin{multichoice}') || rawContent.includes('\\begin{choices}')) {
      type = QuestionTypeEnum.MC;
    } else if (rawContent.includes('\\trueFalse')) {
      type = QuestionTypeEnum.TF;
    } else if (rawContent.includes('\\shortAnswer')) {
      type = QuestionTypeEnum.SA;
    } else if (rawContent.includes('\\matching') || rawContent.includes('\\begin{matching}')) {
      type = QuestionTypeEnum.MA;
    } else {
      type = QuestionTypeEnum.ES;
    }

    // Trích xuất các lựa chọn nếu là câu hỏi trắc nghiệm
    const options: QuestionOptionData[] = [];

    if (type === QuestionTypeEnum.MC) {
      // Tìm các lựa chọn từ định dạng LaTeX
      const choicesMatch = rawContent.match(/\\begin\{choices\}([\s\S]*?)\\end\{choices\}/);
      if (choicesMatch) {
        const choicesContent = choicesMatch[1];
        const choiceItems = choicesContent.match(/\\choice(Correct)?\s+(.*?)(?=\\choice|$)/g);

        if (choiceItems) {
          for (const item of choiceItems) {
            const isCorrect = item.includes('\\choiceCorrect');
            const contentMatch = item.match(/\\choice(?:Correct)?\s+(.*?)(?=\\choice|$)/);
            if (contentMatch) {
              options.push({
                id: uuidv4(),
                content: contentMatch[1].trim(),
                isCorrect,
                explanation: ''
              });
            }
          }
        }
      }
    } else if (type === QuestionTypeEnum.TF) {
      // Xử lý câu hỏi True/False
      const tfMatch = rawContent.match(/\\trueFalse\{(.*?)\}/);
      if (tfMatch) {
        const tfValue = tfMatch[1].trim().toLowerCase();
        options.push({
          id: uuidv4(),
          content: 'True',
          isCorrect: tfValue === 'true',
          explanation: ''
        });
        options.push({
          id: uuidv4(),
          content: 'False',
          isCorrect: tfValue === 'false',
          explanation: ''
        });
      }
    } else if (type === QuestionTypeEnum.MA) {
      // Xử lý câu hỏi ghép đôi
      const matchingMatch = rawContent.match(/\\begin\{matching\}([\s\S]*?)\\end\{matching\}/);
      if (matchingMatch) {
        const matchingContent = matchingMatch[1];
        const matchItems = matchingContent.match(/\\match\{(.*?)\}\{(.*?)\}/g);

        if (matchItems) {
          for (const item of matchItems) {
            const pairMatch = item.match(/\\match\{(.*?)\}\{(.*?)\}/);
            if (pairMatch) {
              const leftSide = pairMatch[1].trim();
              const rightSide = pairMatch[2].trim();

              options.push({
                id: uuidv4(),
                content: `${leftSide} -> ${rightSide}`,
                isCorrect: true,
                explanation: ''
              });
            }
          }
        }
      }
    }

    // Trích xuất lời giải nếu có
    const explanationMatch = rawContent.match(/\\solution\{([\s\S]*?)\}/);
    const explanation = explanationMatch ? explanationMatch[1].trim() : undefined;

    // Xác định độ khó (nếu được chỉ định)
    let difficulty: QuestionDifficulty = QuestionDifficulty.MEDIUM;
    if (rawContent.includes('\\difficulty{easy}')) {
      difficulty = QuestionDifficulty.EASY;
    } else if (rawContent.includes('\\difficulty{hard}')) {
      difficulty = QuestionDifficulty.HARD;
    }

    return {
      title,
      content: rawContent,
      type,
      difficulty,
      explanation,
      options,
    };
  }
}