import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IQuestionTagRepository } from '@project/interfaces';
import { 
  CreateQuestionTagDto, 
  UpdateQuestionTagDto, 
  QuestionTagResponseDto,
  QuestionTagFilterDto
} from '@project/dto';
import { getErrorMessage } from '../../../utils/error-handler';

// Định nghĩa kiểu dữ liệu cho kết quả truy vấn raw
interface RawQuestionTag {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  questionCount?: string;
}

interface CountResult {
  count: string;
}

@Injectable()
export class QuestionTagService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('IQuestionTagRepository')
    private readonly questionTagRepository: IQuestionTagRepository,
  ) {}

  /**
   * Lấy danh sách tất cả tag câu hỏi
   * @param filters Các tham số lọc
   * @returns Object chứa danh sách tag và thông tin phân trang
   */
  async findAll(filters: QuestionTagFilterDto) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const search = filters.name || '';
    const questionId = filters.questionId;

    const skip = (page - 1) * limit;

    // Xây dựng điều kiện WHERE
    let whereClause = '';
    const params: unknown[] = [];

    // Tìm kiếm theo tên hoặc mô tả
    if (search) {
      whereClause = `WHERE (name ILIKE $1 OR description ILIKE $1)`;
      params.push(`%${search}%`);
    }

    // Removed questionId filtering as it doesn't exist in QuestionTagFilterDto
    // // Nếu có questionId, cần truy vấn phức tạp hơn với joins
    // let joinClause = '';
    // if (questionId) {
    //   if (whereClause === '') {
    //     whereClause = 'WHERE';
    //   } else {
    //     whereClause += ' AND';
    //   }
    //
    //   joinClause = `
    //     JOIN "_QuestionToTags" qt ON qt."B" = qt.id
    //     JOIN "questions" q ON q.id = qt."A"
    //   `;
    //   whereClause += ` q.id = $${params.length + 1}`;
    //   params.push(questionId);
    // }
    let joinClause = '';

    // Thực hiện truy vấn COUNT
    const countQuery = `
      SELECT COUNT(*) FROM "question_tags" qt
      ${joinClause}
      ${whereClause}
    `;
    
    // Thực hiện truy vấn chính
    const tagsQuery = `
      SELECT qt.*, COUNT(qtags."A") as "questionCount"
      FROM "question_tags" qt
      LEFT JOIN "_QuestionToTags" qtags ON qtags."B" = qt.id
      ${joinClause}
      ${whereClause}
      GROUP BY qt.id
      ORDER BY qt.name ASC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    // Thực thi song song các truy vấn
    const [countResult, tagsResult] = await Promise.all([
      this.prisma.$queryRawUnsafe<CountResult[]>(countQuery, ...params),
      this.prisma.$queryRawUnsafe<RawQuestionTag[]>(tagsQuery, ...params, limit, skip),
    ]);

    const total = parseInt(countResult[0]?.count || '0', 10);
    const tags = tagsResult;

    // Map kết quả sang DTO
    const formattedTags = tags.map(tag => {
      const dto = new QuestionTagResponseDto();
      Object.assign(dto, {
        ...tag,
        questionCount: parseInt(tag.questionCount || '0', 10),
      });
      return dto;
    });

    return {
      tags: formattedTags,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Tìm tag theo ID
   * @param id ID của tag
   * @returns Tag tìm thấy
   */
  async findById(id: string) {
    const tag = await this.prisma.$queryRaw<RawQuestionTag[]>`
      SELECT qt.*, COUNT(qtags."A") as "questionCount"
      FROM "question_tags" qt
      LEFT JOIN "_QuestionToTags" qtags ON qtags."B" = qt.id
      WHERE qt.id = ${id}
      GROUP BY qt.id
    `;

    if (!tag || (Array.isArray(tag) && tag.length === 0)) {
      throw new NotFoundException(`Không tìm thấy tag với ID: ${id}`);
    }

    const tagData = Array.isArray(tag) ? tag[0] : tag;

    const dto = new QuestionTagResponseDto();
    Object.assign(dto, {
      ...tagData,
      questionCount: parseInt(tagData.questionCount || '0', 10),
    });
    return dto;
  }

  /**
   * Tạo tag mới
   * @param data Dữ liệu tag mới
   * @returns Tag đã tạo
   */
  async create(data: CreateQuestionTagDto) {
    const tag = await this.prisma.$queryRaw<RawQuestionTag[]>`
      INSERT INTO "question_tags" (name, description)
      VALUES (${data.name}, ${data.description || null})
      RETURNING id, name, description, "createdAt", "updatedAt"
    `;

    const dto = new QuestionTagResponseDto();
    Object.assign(dto, {
      ...tag[0],
      questionCount: 0,
    });
    return dto;
  }

  /**
   * Cập nhật tag
   * @param id ID của tag
   * @param data Dữ liệu cập nhật
   * @returns Tag đã cập nhật
   */
  async update(id: string, data: UpdateQuestionTagDto) {
    // Kiểm tra tag tồn tại
    const existingTag = await this.prisma.$queryRaw<RawQuestionTag[]>`
      SELECT * FROM "question_tags" WHERE id = ${id}
    `;

    if (!existingTag || existingTag.length === 0) {
      throw new NotFoundException(`Không tìm thấy tag với ID: ${id}`);
    }

    // Cập nhật tag
    await this.prisma.$executeRaw`
      UPDATE "question_tags"
      SET 
        name = ${data.name ?? existingTag[0].name},
        description = ${data.description ?? existingTag[0].description},
        "updatedAt" = NOW()
      WHERE id = ${id}
    `;

    return this.findById(id);
  }

  /**
   * Xóa tag
   * @param id ID của tag
   * @returns Kết quả xóa
   */
  async delete(id: string) {
    // Kiểm tra tag tồn tại
    const existingTag = await this.prisma.$queryRaw<RawQuestionTag[]>`
      SELECT * FROM "question_tags" WHERE id = ${id}
    `;

    if (!existingTag || existingTag.length === 0) {
      throw new NotFoundException(`Không tìm thấy tag với ID: ${id}`);
    }

    try {
      // Do mối quan hệ đã được thiết lập để tự động xóa khi có CASCADE, 
      // nên chỉ cần xóa tag
      await this.prisma.$executeRaw`
        DELETE FROM "question_tags" WHERE id = ${id}
      `;

      return { success: true, message: 'Đã xóa tag thành công' };
    } catch (error) {
      return { success: false, message: 'Lỗi khi xóa tag', error };
    }
  }

  /**
   * Lấy tất cả tag của một câu hỏi
   * @param questionId ID của câu hỏi
   * @returns Danh sách tag của câu hỏi
   */
  async findAllByQuestionId(questionId: string) {
    const tags = await this.prisma.$queryRaw<RawQuestionTag[]>`
      SELECT qt.*
      FROM "question_tags" qt
      JOIN "_QuestionToTags" qtags ON qtags."B" = qt.id
      WHERE qtags."A" = ${questionId}
      ORDER BY qt.name ASC
    `;

    return tags.map(tag => {
      const dto = new QuestionTagResponseDto();
      Object.assign(dto, {
        ...tag,
        questionCount: tag.questionCount ? parseInt(tag.questionCount, 10) : 0
      });
      return dto;
    });
  }

  /**
   * Thêm tag vào câu hỏi
   * @param questionId ID của câu hỏi
   * @param tagIds Danh sách ID tag
   * @returns Số lượng tag đã thêm
   */
  async addTagsToQuestion(questionId: string, tagIds: string[]) {
    let addedCount = 0;

    for (const tagId of tagIds) {
      try {
        await this.prisma.$executeRaw`
          INSERT INTO "_QuestionToTags" ("A", "B")
          VALUES (${questionId}, ${tagId})
          ON CONFLICT DO NOTHING
        `;
        addedCount++;
      } catch (error) {
        console.error('Error adding tag to question:', error);
      }
    }

    return addedCount;
  }

  /**
   * Cập nhật danh sách tag của câu hỏi
   * @param questionId ID của câu hỏi
   * @param tagIds Danh sách ID tag mới
   * @returns Số lượng tag đã cập nhật
   */
  async updateQuestionTags(questionId: string, tagIds: string[]) {
    // Xóa tất cả liên kết hiện tại
    await this.prisma.$executeRaw`
      DELETE FROM "_QuestionToTags"
      WHERE "A" = ${questionId}
    `;

    // Thêm các liên kết mới
    return this.addTagsToQuestion(questionId, tagIds);
  }
} 
