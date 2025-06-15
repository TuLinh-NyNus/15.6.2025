import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { diffChars } from 'diff';

// Khai báo một kiểu tạm thời để sử dụng với transaction
export interface QuestionVersionData {
  questionId: string;
  version: number;
  content: string;
  explanation?: string;
  options?: string[];
  correctOptions?: string[];
  createdById?: string;
  revertedFromVersionId?: string;
}

@Injectable()
export class QuestionVersionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tìm phiên bản câu hỏi theo ID
   * @param id ID của phiên bản
   * @returns Phiên bản câu hỏi hoặc null
   */
  async findById(id: string) {
    // Sử dụng prisma.$queryRaw để thực hiện truy vấn thay vì truy cập trực tiếp
    const result = await this.prisma.$queryRaw`
      SELECT * FROM "question_versions" WHERE id = ${id}
    `;
    return result[0] || null;
  }

  /**
   * Tìm tất cả phiên bản của một câu hỏi
   * @param questionId ID của câu hỏi
   * @returns Danh sách phiên bản
   */
  async findAllVersionsByQuestionId(questionId: string) {
    // Sử dụng prisma.$queryRaw để thực hiện truy vấn
    return this.prisma.$queryRaw`
      SELECT qv.*, u.id as "createdById", u.email, u."fullName"
      FROM "question_versions" qv
      LEFT JOIN "users" u ON qv."createdById" = u.id
      WHERE qv."questionId" = ${questionId}
      ORDER BY qv.version DESC
    `;
  }

  /**
   * Tìm phiên bản mới nhất của câu hỏi
   * @param questionId ID của câu hỏi
   * @returns Phiên bản mới nhất
   */
  async findLatestVersion(questionId: string) {
    // Sử dụng prisma.$queryRaw để thực hiện truy vấn
    const results = await this.prisma.$queryRaw`
      SELECT qv.*, u.id as "createdById", u.email, u."fullName"
      FROM "question_versions" qv
      LEFT JOIN "users" u ON qv."createdById" = u.id
      WHERE qv."questionId" = ${questionId}
      ORDER BY qv.version DESC
      LIMIT 1
    `;
    return results[0] || null;
  }

  /**
   * Tìm phiên bản theo số phiên bản
   * @param questionId ID của câu hỏi
   * @param version Số phiên bản
   * @returns Phiên bản tìm thấy hoặc null
   */
  async findByQuestionIdAndVersion(questionId: string, version: number) {
    // Sử dụng prisma.$queryRaw để thực hiện truy vấn
    const results = await this.prisma.$queryRaw`
      SELECT qv.*, u.id as "createdById", u.email, u."fullName"
      FROM "question_versions" qv
      LEFT JOIN "users" u ON qv."createdById" = u.id
      WHERE qv."questionId" = ${questionId} AND qv.version = ${version}
      LIMIT 1
    `;
    return results[0] || null;
  }

  /**
   * So sánh hai phiên bản câu hỏi
   * @param versionId1 ID phiên bản thứ nhất
   * @param versionId2 ID phiên bản thứ hai
   * @returns Kết quả so sánh
   */
  async compareVersions(versionId1: string, versionId2: string) {
    // Tìm các phiên bản bằng raw query
    const version1Results = await this.prisma.$queryRaw`
      SELECT * FROM "question_versions" WHERE id = ${versionId1}
    `;
    const version2Results = await this.prisma.$queryRaw`
      SELECT * FROM "question_versions" WHERE id = ${versionId2}
    `;

    const version1 = version1Results[0];
    const version2 = version2Results[0];

    if (!version1 || !version2) {
      throw new Error('Không tìm thấy một hoặc cả hai phiên bản');
    }

    // So sánh nội dung
    const contentDiff = diffChars(version1.content, version2.content);

    // So sánh giải thích
    const explanationDiff = diffChars(
      version1.explanation || '',
      version2.explanation || ''
    );

    // So sánh các tùy chọn
    const optionsDiff = {
      added: version2.options.filter(
        (option: string) => !version1.options.includes(option)
      ),
      removed: version1.options.filter(
        (option: string) => !version2.options.includes(option)
      ),
      unchanged: version1.options.filter((option: string) =>
        version2.options.includes(option)
      ),
    };

    // So sánh các đáp án đúng
    const correctOptionsDiff = {
      added: version2.correctOptions.filter(
        (option: string) => !version1.correctOptions.includes(option)
      ),
      removed: version1.correctOptions.filter(
        (option: string) => !version2.correctOptions.includes(option)
      ),
      unchanged: version1.correctOptions.filter((option: string) =>
        version2.correctOptions.includes(option)
      ),
    };

    return {
      contentDiff,
      explanationDiff,
      optionsDiff,
      correctOptionsDiff,
      version1: {
        id: version1.id,
        version: version1.version,
        createdAt: version1.createdAt,
      },
      version2: {
        id: version2.id,
        version: version2.version,
        createdAt: version2.createdAt,
      },
    };
  }

  /**
   * Khôi phục câu hỏi về phiên bản cũ
   * @param questionId ID của câu hỏi
   * @param versionId ID của phiên bản cần khôi phục
   * @param userId ID của người thực hiện khôi phục
   * @returns Câu hỏi đã cập nhật
   */
  async revertToVersion(questionId: string, versionId: string, userId: string): Promise<QuestionVersionData> {
    // Tìm phiên bản bằng raw query
    const versionResults = await this.prisma.$queryRaw`
      SELECT * FROM "question_versions" WHERE id = ${versionId}
    `;
    const versionToRevert = versionResults[0];

    if (!versionToRevert) {
      throw new Error('Không tìm thấy phiên bản cần khôi phục');
    }

    return this.prisma.$transaction(async (tx) => {
      // Tìm phiên bản mới nhất
      const latestVersionResults = await tx.$queryRaw`
        SELECT * FROM "question_versions"
        WHERE "questionId" = ${questionId}
        ORDER BY version DESC
        LIMIT 1
      `;
      const latestVersion = latestVersionResults[0];

      // Tạo dữ liệu cho phiên bản mới
      const versionData: QuestionVersionData = {
        questionId,
        version: (latestVersion?.version || 0) + 1,
        content: versionToRevert.content,
        explanation: versionToRevert.explanation,
        options: versionToRevert.options,
        correctOptions: versionToRevert.correctOptions,
        createdById: userId,
        revertedFromVersionId: versionId
      };

      // Tạo phiên bản mới bằng raw query
      await tx.$executeRaw`
        INSERT INTO "question_versions" (
          "questionId", version, content, explanation, options, "correctOptions",
          "createdById", "revertedFromVersionId", "createdAt", "updatedAt"
        ) VALUES (
          ${versionData.questionId}, ${versionData.version}, ${versionData.content},
          ${versionData.explanation}, ${versionData.options}, ${versionData.correctOptions},
          ${versionData.createdById}, ${versionData.revertedFromVersionId}, NOW(), NOW()
        ) RETURNING *
      `;

      // Cập nhật câu hỏi
      await tx.$executeRaw`
        UPDATE "questions" SET
          content = ${versionToRevert.content},
          explanation = ${versionToRevert.explanation},
          options = ${versionToRevert.options},
          "correctOptions" = ${versionToRevert.correctOptions},
          "updatedAt" = NOW(),
          "updatedById" = ${userId}
        WHERE id = ${questionId}
      `;

      // Trả về phiên bản mới được tạo
      return versionData;
    });
  }
}
