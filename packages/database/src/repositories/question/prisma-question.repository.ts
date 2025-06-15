import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IQuestionRepository } from './question-repository.interface';
import { Question, QuestionImage, QuestionTag, QuestionVersion, QuestionTypeEnum, QuestionStatus } from '../../entities';
import { Prisma } from '@prisma/client';

/**
 * Định nghĩa interface cho Prisma Question model
 */
interface PrismaQuestion {
  id: string;
  content: string;
  rawContent: string;
  type: string;
  questionId: string | null;
  subcount: string | null;
  source: string | null;
  answers: Prisma.JsonValue | null;
  correctAnswer: Prisma.JsonValue | null;
  solution: string | null;
  usageCount: number;
  creatorId: string;
  status: string;
  feedback: number;
  createdAt: Date;
  updatedAt: Date;
  questionTags?: PrismaQuestionTag[];
}

/**
 * Định nghĩa interface cho Prisma QuestionTag model
 */
interface PrismaQuestionTag {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Định nghĩa interface cho Prisma QuestionVersion model
 */
interface PrismaQuestionVersion {
  id: string;
  questionId: string;
  version: number;
  content: string;
  rawContent: string;
  changedAt: Date;
  changedById: string;
}

/**
 * Định nghĩa interface cho Prisma QuestionImage model
 */
interface PrismaQuestionImage {
  id: string;
  questionId: string;
  url: string;
  type: string;
  createdAt: Date;
}

/**
 * Repository implementation cho Question với Prisma
 */
@Injectable()
export class PrismaQuestionRepository implements IQuestionRepository {
  constructor(private prisma: PrismaService) {}

  /**
   * Chuyển đổi Question entity từ Prisma
   */
  private mapToEntity(question: PrismaQuestion): Question {
    return new Question({
      id: question.id,
      content: question.content,
      rawContent: question.rawContent,
      type: question.type as unknown as QuestionTypeEnum,
      questionId: question.questionId,
      subcount: question.subcount,
      source: question.source,
      answers: question.answers as unknown as Question['answers'],
      correctAnswer: question.correctAnswer as unknown as Question['correctAnswer'],
      solution: question.solution,
      usageCount: question.usageCount,
      creatorId: question.creatorId,
      status: question.status as unknown as QuestionStatus,
      feedback: question.feedback,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt
    });
  }

  /**
   * Chuyển đổi QuestionVersion entity từ Prisma
   */
  private mapVersionToEntity(version: PrismaQuestionVersion): QuestionVersion {
    return new QuestionVersion({
      id: version.id,
      questionId: version.questionId,
      version: version.version,
      content: version.content,
      rawContent: version.rawContent,
      changedAt: version.changedAt,
      changedById: version.changedById
    });
  }

  /**
   * Chuyển đổi QuestionImage entity từ Prisma
   */
  private mapImageToEntity(image: PrismaQuestionImage): QuestionImage {
    return {
      id: image.id,
      questionId: image.questionId,
      url: image.url,
      type: image.type as unknown as QuestionImage['type'],
      createdAt: image.createdAt
    } as QuestionImage;
  }

  /**
   * Chuyển đổi QuestionTag entity từ Prisma
   */
  private mapTagToEntity(tag: PrismaQuestionTag): QuestionTag {
    return new QuestionTag({
      id: tag.id,
      name: tag.name,
      description: tag.description || undefined,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt
    });
  }

  /**
   * Tìm câu hỏi theo ID
   */
  async findById(id: string): Promise<Question | null> {
    // Sử dụng raw query để tránh lỗi với trường options không tồn tại
    const questions = await this.prisma.$queryRaw<PrismaQuestion[]>`
      SELECT
        id, content, "rawContent", type, "questionId", subcount, source,
        answers, "correctAnswer", solution, "usageCount", "creatorId",
        status, feedback, "createdAt", "updatedAt"
      FROM questions
      WHERE id = ${id}
      LIMIT 1
    `;

    if (!questions || questions.length === 0) {
      return null;
    }

    return this.mapToEntity(questions[0]);
  }

  /**
   * Tìm nhiều câu hỏi theo các điều kiện tìm kiếm
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Partial<Question>;
    orderBy?: { [key: string]: 'asc' | 'desc' };
  }): Promise<Question[]> {
    const questions = await this.prisma.question.findMany({
      skip: params.skip,
      take: params.take,
      where: params.where as unknown as Prisma.QuestionWhereInput,
      orderBy: params.orderBy as unknown as Prisma.QuestionOrderByWithRelationInput
    });

    return questions.map(question => this.mapToEntity(question as unknown as PrismaQuestion));
  }

  /**
   * Đếm số lượng câu hỏi theo điều kiện
   */
  async count(where?: Partial<Question>): Promise<number> {
    return this.prisma.question.count({
      where: where as unknown as Prisma.QuestionWhereInput
    });
  }

  /**
   * Tạo câu hỏi mới
   */
  async create(data: Partial<Question>): Promise<Question> {
    const question = await this.prisma.question.create({
      data: data as unknown as Prisma.QuestionCreateInput
    });

    return this.mapToEntity(question as unknown as PrismaQuestion);
  }

  /**
   * Cập nhật câu hỏi
   */
  async update(id: string, data: Partial<Question>): Promise<Question> {
    const question = await this.prisma.question.update({
      where: { id },
      data: data as unknown as Prisma.QuestionUpdateInput
    });

    return this.mapToEntity(question as unknown as PrismaQuestion);
  }

  /**
   * Xóa câu hỏi
   */
  async delete(id: string): Promise<Question> {
    const question = await this.prisma.question.delete({
      where: { id }
    });

    return this.mapToEntity(question as unknown as PrismaQuestion);
  }

  /**
   * Tìm các phiên bản của câu hỏi
   */
  async findVersions(questionId: string): Promise<QuestionVersion[]> {
    // Sử dụng model question_versions
    const versions = await this.prisma.$queryRaw<PrismaQuestionVersion[]>`
      SELECT * FROM question_versions WHERE "questionId" = ${questionId} ORDER BY version DESC
    `;

    return versions.map(version => this.mapVersionToEntity(version));
  }

  /**
   * Tạo phiên bản mới cho câu hỏi
   */
  async createVersion(data: Partial<QuestionVersion>): Promise<QuestionVersion> {
    // Chuyển đổi dữ liệu để tương thích với model
    const { questionId, version, content, rawContent, changedById } = data;

    // Sử dụng executeRaw vì không có model QuestionVersion
    await this.prisma.$executeRaw`
      INSERT INTO question_versions ("id", "questionId", "version", "content", "rawContent", "changedAt", "changedById")
      VALUES (${crypto.randomUUID()}, ${questionId}, ${version}, ${content}, ${rawContent}, NOW(), ${changedById})
    `;

    // Truy vấn lại để lấy dữ liệu vừa tạo
    const createdVersion = await this.prisma.$queryRaw<PrismaQuestionVersion[]>`
      SELECT * FROM question_versions WHERE "questionId" = ${questionId} AND "version" = ${version} LIMIT 1
    `;

    return this.mapVersionToEntity(createdVersion[0]);
  }

  /**
   * Tìm hình ảnh của câu hỏi
   */
  async findImages(questionId: string): Promise<QuestionImage[]> {
    // Sử dụng model question_images
    const images = await this.prisma.$queryRaw<PrismaQuestionImage[]>`
      SELECT * FROM question_images WHERE "questionId" = ${questionId}
    `;

    return images.map(image => this.mapImageToEntity(image));
  }

  /**
   * Thêm hình ảnh cho câu hỏi
   */
  async addImage(data: { questionId?: string; url?: string; type?: any }): Promise<QuestionImage> {
    // Chuyển đổi dữ liệu để tương thích với model
    const { questionId, url, type } = data;

    if (!questionId || !url || !type) {
      throw new Error('questionId, url, and type are required');
    }

    // Sử dụng executeRaw vì không có model QuestionImage
    await this.prisma.$executeRaw`
      INSERT INTO question_images ("id", "questionId", "url", "type", "createdAt")
      VALUES (${crypto.randomUUID()}, ${questionId}, ${url}, ${type}, NOW())
    `;

    // Truy vấn lại để lấy dữ liệu vừa tạo
    const createdImage = await this.prisma.$queryRaw<PrismaQuestionImage[]>`
      SELECT * FROM question_images
      WHERE "questionId" = ${questionId} AND "url" = ${url}
      ORDER BY "createdAt" DESC LIMIT 1
    `;

    return this.mapImageToEntity(createdImage[0]);
  }

  /**
   * Xóa hình ảnh
   */
  async deleteImage(id: string): Promise<QuestionImage> {
    // Truy vấn hình ảnh trước khi xóa
    const image = await this.prisma.$queryRaw<PrismaQuestionImage[]>`
      SELECT * FROM question_images WHERE "id" = ${id} LIMIT 1
    `;

    if (!image || image.length === 0) {
      throw new Error(`QuestionImage with id ${id} not found`);
    }

    // Xóa hình ảnh
    await this.prisma.$executeRaw`
      DELETE FROM question_images WHERE "id" = ${id}
    `;

    return this.mapImageToEntity(image[0]);
  }

  /**
   * Tìm tất cả các tag
   */
  async findAllTags(): Promise<QuestionTag[]> {
    // Sử dụng model question_tags
    const tags = await this.prisma.$queryRaw<PrismaQuestionTag[]>`
      SELECT * FROM question_tags
    `;

    return tags.map(tag => this.mapTagToEntity(tag));
  }

  /**
   * Thêm tags cho câu hỏi
   */
  async addTagsToQuestion(questionId: string, tagIds: string[]): Promise<Question> {
    // Thêm liên kết trong bảng relationship _QuestionToTags
    for (const tagId of tagIds) {
      await this.prisma.$executeRaw`
        INSERT INTO "_QuestionToTags" ("A", "B")
        VALUES (${questionId}, ${tagId})
        ON CONFLICT DO NOTHING
      `;
    }

    // Lấy câu hỏi sử dụng raw query để tránh lỗi với trường options không tồn tại
    const questions = await this.prisma.$queryRaw<PrismaQuestion[]>`
      SELECT
        id, content, "rawContent", type, "questionId", subcount, source,
        answers, "correctAnswer", solution, "usageCount", "creatorId",
        status, feedback, "createdAt", "updatedAt"
      FROM questions
      WHERE id = ${questionId}
      LIMIT 1
    `;

    if (!questions || questions.length === 0) {
      throw new Error(`Question with id ${questionId} not found`);
    }

    const question = questions[0];

    // Lấy tag thông qua raw query
    const tags = await this.prisma.$queryRaw<PrismaQuestionTag[]>`
      SELECT qt.* FROM question_tags qt
      JOIN "_QuestionToTags" rel ON qt.id = rel."B"
      WHERE rel."A" = ${questionId}
    `;

    // Tạo câu hỏi với tags
    const questionWithTags = {
      ...question,
      questionTags: tags
    } as unknown as PrismaQuestion;

    return this.mapToEntity(questionWithTags);
  }

  /**
   * Xóa tags khỏi câu hỏi
   */
  async removeTagsFromQuestion(questionId: string, tagIds: string[]): Promise<Question> {
    // Xóa liên kết trong bảng relationship _QuestionToTags
    for (const tagId of tagIds) {
      await this.prisma.$executeRaw`
        DELETE FROM "_QuestionToTags"
        WHERE "A" = ${questionId} AND "B" = ${tagId}
      `;
    }

    // Lấy câu hỏi sử dụng raw query để tránh lỗi với trường options không tồn tại
    const questions = await this.prisma.$queryRaw<PrismaQuestion[]>`
      SELECT
        id, content, "rawContent", type, "questionId", subcount, source,
        answers, "correctAnswer", solution, "usageCount", "creatorId",
        status, feedback, "createdAt", "updatedAt"
      FROM questions
      WHERE id = ${questionId}
      LIMIT 1
    `;

    if (!questions || questions.length === 0) {
      throw new Error(`Question with id ${questionId} not found`);
    }

    const question = questions[0];

    // Lấy tag thông qua raw query
    const tags = await this.prisma.$queryRaw<PrismaQuestionTag[]>`
      SELECT qt.* FROM question_tags qt
      JOIN "_QuestionToTags" rel ON qt.id = rel."B"
      WHERE rel."A" = ${questionId}
    `;

    // Tạo câu hỏi với tags
    const questionWithTags = {
      ...question,
      questionTags: tags
    } as unknown as PrismaQuestion;

    return this.mapToEntity(questionWithTags);
  }
}