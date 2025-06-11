import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IQuestionTagRepository, QuestionTagData } from '@project/interfaces';

@Injectable()
export class QuestionTagRepository implements IQuestionTagRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tìm tag câu hỏi theo ID
   * @param id ID của tag
   * @returns Promise với tag câu hỏi hoặc null
   */
  async findById(id: string): Promise<QuestionTagData | null> {
    const tag = await this.prisma.$queryRaw`
      SELECT * FROM "question_tags" WHERE id = ${id}
    `;
    
    // Check if array is empty
    if (Array.isArray(tag) && tag.length === 0) {
      return null;
    }
    
    return Array.isArray(tag) ? tag[0] as QuestionTagData : tag as QuestionTagData;
  }

  /**
   * Tìm tất cả tag của một câu hỏi
   * @param questionId ID của câu hỏi
   * @returns Promise với danh sách tag
   */
  async findAllByQuestionId(questionId: string): Promise<QuestionTagData[]> {
    // Sử dụng raw query để lấy tags của một câu hỏi
    const tags = await this.prisma.$queryRaw`
      SELECT qt.* 
      FROM "question_tags" qt
      JOIN "_QuestionToTags" qtags ON qtags."B" = qt.id
      WHERE qtags."A" = ${questionId}
    `;
    return tags as QuestionTagData[];
  }

  /**
   * Tìm tag theo tên
   * @param name Tên tag cần tìm
   * @returns Promise với tag tìm thấy hoặc null
   */
  async findByName(name: string): Promise<QuestionTagData | null> {
    const tag = await this.prisma.$queryRaw`
      SELECT * FROM "question_tags" WHERE name = ${name} LIMIT 1
    `;
    
    // Check if array is empty
    if (Array.isArray(tag) && tag.length === 0) {
      return null;
    }
    
    return Array.isArray(tag) ? tag[0] as QuestionTagData : tag as QuestionTagData;
  }

  /**
   * Tạo mới tag
   * @param data Dữ liệu tag mới
   * @returns Promise với tag đã tạo
   */
  async create(data: QuestionTagData): Promise<QuestionTagData> {
    const tag = await this.prisma.$queryRaw`
      INSERT INTO "question_tags" (name, description)
      VALUES (${data.name}, ${data.description || null})
      RETURNING *
    `;
    
    return Array.isArray(tag) ? tag[0] as QuestionTagData : tag as QuestionTagData;
  }

  /**
   * Cập nhật tag
   * @param id ID của tag
   * @param data Dữ liệu cần cập nhật
   * @returns Promise với tag đã cập nhật
   */
  async update(id: string, data: Partial<QuestionTagData>): Promise<QuestionTagData> {
    const tag = await this.prisma.$queryRaw`
      UPDATE "question_tags"
      SET 
        name = ${data.name || null},
        description = ${data.description || null},
        "updatedAt" = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    
    return Array.isArray(tag) ? tag[0] as QuestionTagData : tag as QuestionTagData;
  }

  /**
   * Xóa tag
   * @param id ID của tag
   * @returns Promise với boolean xác nhận đã xóa
   */
  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`
        DELETE FROM "question_tags" WHERE id = ${id}
      `;
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Tìm hoặc tạo tag nếu chưa tồn tại
   * @param name Tên tag
   * @returns Promise với tag tìm thấy hoặc đã tạo mới
   */
  async findOrCreate(name: string): Promise<QuestionTagData> {
    let tag = await this.findByName(name);
    
    if (!tag) {
      tag = await this.create({ name });
    }
    
    return tag;
  }
} 