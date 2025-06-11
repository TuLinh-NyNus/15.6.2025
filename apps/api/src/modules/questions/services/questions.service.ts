import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { QuestionFilterDto, CreateQuestionDto, UpdateQuestionDto } from '@project/dto';
import { QuestionStatus, QuestionType, QuestionDifficulty } from '@project/entities';
import { IQuestionRepository } from '@project/interfaces';
import { Prisma } from '@prisma/client';
import { extractAnswersFromLatex } from '../../../utils/question-answer-extractor';



@Injectable()
export class QuestionsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('IQuestionRepository') private readonly questionRepository: IQuestionRepository
  ) {}

  /**
   * Tìm tất cả câu hỏi với các tùy chọn lọc
   * @param filters Tùy chọn tìm kiếm và lọc
   * @returns Object chứa mảng câu hỏi và tổng số
   */
  async findAll(filters: QuestionFilterDto) {
    try {
      // Log để debug
      console.log('QuestionsService.findAll - Filters:', JSON.stringify(filters));

      // Trích xuất các giá trị từ filter
      const page = filters.page ?? 1;
      const limit = filters.limit ?? 10;
      const search = filters.search || '';
      const skip = (page - 1) * limit;

      // Xây dựng điều kiện lọc theo tham số trong QuestionID
      const questionIdConditions = [];

      // Lọc theo pattern matching cho từng vị trí trong QuestionID
      // Ví dụ: 0????-? sẽ lọc tất cả câu hỏi có tham số 0 ở vị trí thứ nhất

      // Lọc theo tham số lớp (vị trí 1)
      if (filters.gradeParam) {
        // Sử dụng pattern matching với LIKE và ký tự đại diện '_'
        questionIdConditions.push(Prisma.sql`"questionId" LIKE ${`${filters.gradeParam}____-%`}`);
      }

      // Lọc theo tham số môn học (vị trí 2)
      if (filters.subjectParam) {
        // Sử dụng pattern matching với LIKE và ký tự đại diện '_'
        questionIdConditions.push(Prisma.sql`"questionId" LIKE ${`_${filters.subjectParam}___-%`}`);
      }

      // Lọc theo tham số chương (vị trí 3)
      if (filters.chapterParam) {
        // Sử dụng pattern matching với LIKE và ký tự đại diện '_'
        questionIdConditions.push(Prisma.sql`"questionId" LIKE ${`__${filters.chapterParam}__-%`}`);
      }

      // Lọc theo tham số mức độ (vị trí 4)
      if (filters.levelParam) {
        // Sử dụng pattern matching với LIKE và ký tự đại diện '_'
        questionIdConditions.push(Prisma.sql`"questionId" LIKE ${`___${filters.levelParam}_-%`}`);
      }

      // Lọc theo tham số bài (vị trí 5)
      if (filters.lessonParam) {
        // Sử dụng pattern matching với LIKE và ký tự đại diện '_'
        questionIdConditions.push(Prisma.sql`"questionId" LIKE ${`____${filters.lessonParam}-%`}`);
      }

      // Lọc theo tham số dạng (vị trí 6 - sau dấu gạch ngang)
      if (filters.formParam) {
        // Sử dụng pattern matching với LIKE và ký tự đại diện '_'
        questionIdConditions.push(Prisma.sql`"questionId" LIKE ${`_____-${filters.formParam}`}`);
      }

      // Kết hợp các điều kiện lọc
      let questionIdCondition = Prisma.empty;
      if (questionIdConditions.length > 0) {
        // Nếu có nhiều điều kiện, kết hợp chúng với AND
        questionIdCondition = Prisma.sql`AND (${Prisma.join(questionIdConditions, ' AND ')})`;
      }

      // Xử lý lọc theo số lần sử dụng
      let usageCountCondition = Prisma.empty;
      if (filters.usageCount && filters.usageCount !== 'all') {
        console.log('Lọc theo số lần sử dụng:', filters.usageCount);

        if (filters.usageCount === '0') {
          // Lọc câu hỏi chưa được sử dụng
          usageCountCondition = Prisma.sql`AND "usageCount" = 0`;
        } else if (filters.usageCount === '21+') {
          // Lọc câu hỏi sử dụng trên 20 lần
          usageCountCondition = Prisma.sql`AND "usageCount" > 20`;
        } else {
          // Lọc theo khoảng (ví dụ: 1-5, 6-10, 11-20)
          const range = filters.usageCount.split('-');
          if (range.length === 2) {
            const min = parseInt(range[0], 10);
            const max = parseInt(range[1], 10);
            if (!isNaN(min) && !isNaN(max)) {
              usageCountCondition = Prisma.sql`AND "usageCount" BETWEEN ${min} AND ${max}`;
            }
          }
        }
      }

      // Log để debug
      console.log('Điều kiện lọc QuestionID:', questionIdConditions.map(c => c.sql).join(' AND '));
      console.log('Điều kiện lọc UsageCount:', usageCountCondition);

      // Sử dụng raw query để lấy dữ liệu
      const questions = await this.prisma.$queryRaw`
        SELECT
          id, content, "createdAt", "updatedAt",
          "rawContent", status, type, "creatorId", "questionId", "usageCount"
        FROM questions
        WHERE 1=1
        ${search ? Prisma.sql`AND (
          content ILIKE ${`%${search}%`} OR
          "rawContent" ILIKE ${`%${search}%`}
        )` : Prisma.empty}
        ${questionIdCondition}
        ${usageCountCondition}
        ORDER BY "createdAt" DESC
        LIMIT ${limit}
        OFFSET ${skip}
      `;

      // Đếm tổng số câu hỏi bằng raw query
      const totalResult = await this.prisma.$queryRaw`
        SELECT COUNT(*) as total
        FROM questions
        WHERE 1=1
        ${search ? Prisma.sql`AND (
          content ILIKE ${`%${search}%`} OR
          "rawContent" ILIKE ${`%${search}%`}
        )` : Prisma.empty}
        ${questionIdCondition}
        ${usageCountCondition}
      `;

      const total = parseInt(totalResult[0]?.total || '0', 10);

      return {
        questions,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Lỗi khi tìm tất cả câu hỏi:', error);
      throw error;
    }
  }



  /**
   * Tìm câu hỏi theo ID
   * @param id ID của câu hỏi
   * @returns Câu hỏi tìm thấy hoặc null
   */
  async findById(id: string) {
    return this.questionRepository.findById(id);
  }

  /**
   * Tạo câu hỏi mới
   * @param data Dữ liệu câu hỏi cần tạo
   * @param creatorId ID của người tạo
   * @returns Câu hỏi đã tạo
   */
  async create(data: CreateQuestionDto, creatorId: string) {
    const { tags = [], ...questionData } = data;

    try {
      // Tạo một Assessment mới trước
      const assessment = await this.prisma.assessment.create({
        data: {
          title: `Assessment for ${questionData.content.substring(0, 30)}...`,
          description: 'Auto-generated assessment',
          courseId: 'default-course-id', // Sử dụng một courseId mặc định
        },
      });

      // Tạo một UUID mới cho câu hỏi
      const questionUuid = await this.prisma.$queryRaw`SELECT gen_random_uuid() as id`;
      const newQuestionId = questionUuid[0]?.id;

      if (!newQuestionId) {
        throw new Error('Không thể tạo UUID cho câu hỏi');
      }

      // Sử dụng raw query để tạo câu hỏi và liên kết với assessment
      // Kiểm tra và xử lý trường answers
      let processedAnswers = questionData.answers;

      // Nếu answers là mảng rỗng hoặc mảng chứa các mảng rỗng, thì tạo mảng đáp án mặc định
      if (!processedAnswers ||
          (Array.isArray(processedAnswers) && processedAnswers.length === 0) ||
          (Array.isArray(processedAnswers) && processedAnswers.every(a => Array.isArray(a) && a.length === 0))) {

        // Tạo mảng đáp án mặc định dựa trên nội dung câu hỏi
        if (questionData.content && questionData.content.includes('\\choice')) {
          // Nếu là câu hỏi trắc nghiệm, tạo 4 đáp án mặc định
          processedAnswers = [
            { id: '1', content: 'Đáp án A', isCorrect: false },
            { id: '2', content: 'Đáp án B', isCorrect: false },
            { id: '3', content: 'Đáp án C', isCorrect: false },
            { id: '4', content: 'Đáp án D', isCorrect: false }
          ];
        }
      }

      // Nếu answers là mảng chứa các chuỗi, chuyển đổi thành đối tượng
      if (Array.isArray(processedAnswers) && processedAnswers.some(a => typeof a === 'string')) {
        processedAnswers = processedAnswers.map((a, index) => {
          if (typeof a === 'string') {
            return { id: String(index + 1), content: a, isCorrect: false };
          }
          return a;
        });
      }

      // Nếu answers là mảng chứa các mảng, chuyển đổi thành đối tượng
      if (Array.isArray(processedAnswers) && processedAnswers.some(a => Array.isArray(a))) {
        processedAnswers = processedAnswers.map((a, index) => {
          if (Array.isArray(a)) {
            // Nếu mảng có nội dung, sử dụng nội dung đó
            // Nếu không, tạo nội dung mặc định dựa trên câu hỏi
            let content = '';

            if (a.length > 0 && typeof a[0] === 'string') {
              content = a[0];
            } else if (questionData.rawContent) {
              // Trích xuất đáp án từ nội dung LaTeX gốc
              const answerMatch = new RegExp(`\\\\choice[^{]*\\{([^}]+)\\}[^{]*\\{([^}]+)\\}[^{]*\\{([^}]+)\\}[^{]*\\{([^}]+)\\}`).exec(questionData.rawContent);
              if (answerMatch && answerMatch[index + 1]) {
                content = answerMatch[index + 1].replace(/\\True\s*/, '');
              }
            }

            // Nếu vẫn không có nội dung, sử dụng nội dung mặc định
            if (!content) {
              content = `Đáp án ${String.fromCharCode(65 + index)}`;
            }

            return {
              id: String(index + 1),
              content: content,
              isCorrect: index === 3 // Mặc định đáp án cuối cùng là đúng nếu không có thông tin
            };
          }
          return a;
        });
      }

      // Xử lý phân số bị cắt trong đáp án
      if (Array.isArray(processedAnswers)) {
        const answersToRemove = [];

        for (let i = 0; i < processedAnswers.length; i++) {
          const answer = processedAnswers[i];
          if (answer && typeof answer === 'object') {
            let content = answer.content || '';

            // Kiểm tra nếu nội dung là phân số bị cắt (ví dụ: "$\\dfrac{2")
            if (content.includes('\\dfrac{') && !content.includes('}{')) {
              // Tìm vị trí của phân số trong nội dung
              const fractionPos = content.indexOf('\\dfrac{');
              // Tìm vị trí của dấu { sau \dfrac
              const openBracePos = fractionPos + 7; // 7 là độ dài của '\dfrac{'

              // Lấy phần tử số (numerator)
              const numerator = content.substring(openBracePos);

              // Tìm số tiếp theo trong mảng đáp án
              if (i + 1 < processedAnswers.length) {
                const nextAnswer = processedAnswers[i + 1];
                if (nextAnswer && typeof nextAnswer === 'object' && nextAnswer.content) {
                  // Tách phần trước và sau phân số
                  const beforeFraction = content.substring(0, fractionPos);
                  // Tạo phân số hoàn chỉnh
                  content = beforeFraction + '\\dfrac{' + numerator + '}{' + nextAnswer.content + '}$';
                  console.log("Fixed fraction:", content);

                  // Cập nhật nội dung đáp án hiện tại
                  processedAnswers[i] = {
                    ...answer,
                    content: content
                  };

                  // Đánh dấu đáp án tiếp theo để xóa
                  answersToRemove.push(i + 1);
                }
              }
            }
          }
        }

        // Lọc bỏ các đáp án đã được sử dụng làm mẫu số
        if (answersToRemove.length > 0) {
          processedAnswers = processedAnswers.filter((_, index) => !answersToRemove.includes(index));
        }
      }

      // Ép kiểu cho các trường JSON
      // Xử lý đặc biệt cho trường answers - đảm bảo mỗi phần tử là một đối tượng đầy đủ theo yêu cầu của DTO
      let filteredAnswers = [];

      if (Array.isArray(questionData.answers)) {
        console.log('Kiểm tra cấu trúc dữ liệu answers:', {
          isArray: Array.isArray(questionData.answers),
          length: questionData.answers.length,
          firstItem: questionData.answers[0],
          firstItemType: questionData.answers[0] ? typeof questionData.answers[0] : 'undefined'
        });

        // Đảm bảo answers là mảng các đối tượng có đầy đủ các thuộc tính theo yêu cầu của DTO
        filteredAnswers = questionData.answers
          .map((answer: any, index: number) => {
            // Nếu answer là chuỗi, chuyển thành đối tượng đầy đủ
            if (typeof answer === 'string') {
              return {
                id: index.toString(),
                content: answer,
                isCorrect: false
              };
            }

            // Xử lý đặc biệt cho trường hợp answer là mảng
            if (Array.isArray(answer)) {
              console.log('Phát hiện answer dạng mảng:', answer);

              // Kiểm tra xem mảng có các thuộc tính không
              const hasProperties = Object.getOwnPropertyNames(answer).some(prop =>
                isNaN(parseInt(prop)) && prop !== 'length'
              );

              if (hasProperties) {
                console.log('Mảng có thuộc tính:', Object.getOwnPropertyNames(answer));

                // Truy cập thuộc tính bằng cách sử dụng index signature
                const id = (answer as any).id;
                const content = (answer as any).content;
                const isCorrect = (answer as any).isCorrect;

                if (content) {
                  return {
                    id: id || index.toString(),
                    content: content,
                    isCorrect: isCorrect || false
                  };
                }
              }

              // Thử trích xuất dữ liệu từ mảng dựa trên vị trí
              try {
                // Giả sử mảng có dạng [id, content, isCorrect]
                if (answer.length >= 2) {
                  const extractedId = answer[0];
                  const extractedContent = answer[1];
                  const extractedIsCorrect = answer.length >= 3 ? answer[2] : false;

                  if (extractedContent && typeof extractedContent === 'string') {
                    console.log('Trích xuất dữ liệu từ mảng thành công:', {
                      id: extractedId,
                      content: extractedContent,
                      isCorrect: extractedIsCorrect
                    });

                    return {
                      id: (extractedId && typeof extractedId === 'string') ? extractedId : index.toString(),
                      content: extractedContent,
                      isCorrect: !!extractedIsCorrect
                    };
                  }
                }
              } catch (error) {
                console.error('Lỗi khi trích xuất dữ liệu từ mảng:', error);
              }

              // Nếu là mảng thông thường và không thể trích xuất dữ liệu
              console.log('Không thể xử lý answer dạng mảng:', answer);
              return null;
            }

            // Nếu answer không phải đối tượng, bỏ qua
            if (typeof answer !== 'object' || answer === null) {
              console.log('Bỏ qua answer không phải đối tượng:', answer);
              return null;
            }

            // Nếu answer là đối tượng, đảm bảo có đầy đủ các thuộc tính
            if (answer.content) {
              return {
                id: answer.id || index.toString(),
                content: answer.content,
                isCorrect: answer.isCorrect || false
              };
            }

            console.log('Bỏ qua answer không có content:', answer);
            return null;
          })
          .filter((answer: any) => answer !== null && answer.content && answer.content.trim() !== '');
      }

      console.log('Dữ liệu answers sau khi xử lý:', filteredAnswers);

      // Sử dụng let thay vì const để có thể gán lại giá trị
      let answersJson = filteredAnswers.length > 0 ? JSON.stringify(filteredAnswers) : '[]';

      // Xử lý đặc biệt cho trường correctAnswer
      const filteredCorrectAnswer = Array.isArray(questionData.correctAnswer)
        ? questionData.correctAnswer.filter((answer: any) => answer && (typeof answer === 'string' ? answer.trim() !== '' : true))
        : [];
      const correctAnswerJson = filteredCorrectAnswer.length > 0 ? JSON.stringify(filteredCorrectAnswer) : '[]';

      // Log chi tiết về dữ liệu câu hỏi để debug
      console.log('Dữ liệu câu hỏi cần lưu:', {
        content: questionData.content.substring(0, 50) + '...',
        type: questionData.type,
        answersCount: {
          original: questionData.answers?.length || 0,
          filtered: filteredAnswers.length
        },
        correctAnswerCount: {
          original: questionData.correctAnswer?.length || 0,
          filtered: filteredCorrectAnswer.length
        },
        answersJson: answersJson.substring(0, 100) + (answersJson.length > 100 ? '...' : ''),
        correctAnswerJson: correctAnswerJson
      });

      // Log chi tiết về dữ liệu answers
      console.log('Chi tiết về answers:', {
        originalAnswers: questionData.answers,
        filteredAnswers: filteredAnswers
      });

      // Log để debug loại câu hỏi
      console.log('Loại câu hỏi trước khi lưu vào database:', {
        type: questionData.type,
        content: questionData.content.substring(0, 50) + '...'
      });

      // Sử dụng utility để trích xuất answers và correctAnswer từ nội dung LaTeX
      const rawContent = questionData.rawContent || questionData.content;
      const extractedData = extractAnswersFromLatex(rawContent);

      // Sử dụng loại câu hỏi đã trích xuất
      let questionType = questionData.type as string;
      if (!questionType || !['MC', 'TF', 'SA', 'ES', 'MA'].includes(questionType)) {
        // Nếu không có type hoặc type không hợp lệ, sử dụng type đã trích xuất
        questionType = extractedData.type;
        console.log('Đã xác định lại loại câu hỏi:', questionType);
      }

      // Kiểm tra nếu không có answers từ frontend, giữ nguyên mảng rỗng
      if (filteredAnswers.length === 0) {
        console.log('Không có answers từ frontend, giữ nguyên mảng rỗng');

        // Không tạo đáp án mẫu nữa, để mảng rỗng
        // Cập nhật answersJson
        answersJson = '[]';
        console.log('Đã giữ nguyên mảng answers rỗng');
      }

      // Thử xác định tên chính xác của enum trong database
      console.log('Thử xác định tên chính xác của enum QuestionType...');

      try {
        // Kiểm tra schema của bảng questions
        const tableInfo = await this.prisma.$queryRaw`
          SELECT column_name, data_type, udt_name
          FROM information_schema.columns
          WHERE table_name = 'questions' AND column_name = 'type'
        `;
        console.log('Thông tin cột type trong bảng questions:', tableInfo);
      } catch (error) {
        console.error('Lỗi khi kiểm tra schema:', error);
      }

      // Sử dụng phép cast với tên enum chính xác và đặt trong dấu nháy kép
      // Sử dụng cast với tên enum chính xác "QuestionType" (phân biệt chữ hoa/thường)
      await this.prisma.$executeRaw`
        INSERT INTO "questions" (
          "id", "content", "type", "creatorId", "status",
          "rawContent", "solution", "source", "questionId", "subcount",
          "answers", "correctAnswer", "createdAt", "updatedAt"
        ) VALUES (
          ${newQuestionId},
          ${questionData.content},
          ${questionType}::"QuestionType",  -- Sử dụng cast với tên enum chính xác
          ${creatorId},
          'DRAFT',
          ${questionData.rawContent || questionData.content},
          ${questionData.solution || null},
          ${questionData.source || null},
          ${questionData.questionId || null},
          ${questionData.subcount || null},
          ${answersJson}::jsonb,  -- Đã xử lý đặc biệt để đảm bảo đáp án đúng định dạng
          ${correctAnswerJson}::jsonb,
          NOW(),
          NOW()
        )
      `;

      // Tạo liên kết giữa Question và Assessment
      const assessmentQuestionUuid = await this.prisma.$queryRaw`SELECT gen_random_uuid() as id`;
      const assessmentQuestionId = assessmentQuestionUuid[0]?.id;

      if (!assessmentQuestionId) {
        throw new Error('Không thể tạo UUID cho assessment_questions');
      }

      await this.prisma.$executeRaw`
        INSERT INTO "assessment_questions" (
          "id", "assessmentId", "questionId", "order", "createdAt", "updatedAt"
        ) VALUES (
          ${assessmentQuestionId},
          ${assessment.id},
          ${newQuestionId},
          1,
          NOW(),
          NOW()
        )
      `;

      // Thêm tags nếu có
      if (tags.length > 0) {
        for (const tagId of tags) {
          await this.prisma.$executeRaw`
            INSERT INTO "_QuestionToTags" ("A", "B")
            VALUES (${newQuestionId}, ${tagId})
          `;
        }
      }

      return this.findById(newQuestionId);
    } catch (error) {
      console.error('Lỗi khi tạo câu hỏi:', error);
      throw error;
    }
  }

  /**
   * Cập nhật câu hỏi
   * @param id ID của câu hỏi
   * @param data Dữ liệu cập nhật
   * @returns Câu hỏi đã cập nhật
   */
  async update(id: string, data: UpdateQuestionDto) {
    try {
      console.log('Cập nhật câu hỏi với ID:', id);

      // Loại bỏ trường images và tags khỏi updateData vì images được lưu trong bảng riêng biệt
      const { tags, images, ...updateData } = data;

      // Trích xuất type từ rawContent nếu có
      if (updateData.rawContent) {
        const extractedData = extractAnswersFromLatex(updateData.rawContent);

        // Cập nhật type nếu chưa có hoặc không hợp lệ
        if (!updateData.type || !['MC', 'TF', 'SA', 'ES', 'MA'].includes(updateData.type as string)) {
          updateData.type = extractedData.type as any;
          console.log('Đã xác định lại loại câu hỏi từ nội dung:', updateData.type);
        }
      }
      // Nếu không có rawContent, chỉ chuyển đổi type nếu cần
      else if (updateData.type && !['MC', 'TF', 'SA', 'ES', 'MA'].includes(updateData.type as string)) {
        console.log('Loại câu hỏi không hợp lệ, chuyển đổi:', updateData.type);

        // Chuyển đổi từ định dạng dài sang định dạng ngắn
        const typeStr = updateData.type as string;
        if (typeStr === 'multiple-choice') {
          updateData.type = 'MC' as any;
        } else if (typeStr === 'true-false') {
          updateData.type = 'TF' as any;
        } else if (typeStr === 'short-answer') {
          updateData.type = 'SA' as any;
        } else if (typeStr === 'matching') {
          updateData.type = 'MA' as any;
        } else if (typeStr === 'essay') {
          updateData.type = 'ES' as any;
        }

        console.log('Đã chuyển đổi loại câu hỏi thành:', updateData.type);
      }

      // Chuẩn bị dữ liệu cập nhật cho Prisma
      const prismaUpdateData: any = {};

      // Xử lý từng trường dữ liệu một cách an toàn
      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'type') {
            // Chuyển đổi type thành enum QuestionType
            prismaUpdateData[key] = value;
          } else if (key === 'answers' || key === 'correctAnswer') {
            // Xử lý đặc biệt cho các trường JSON
            prismaUpdateData[key] = value;
          } else {
            // Các trường khác
            prismaUpdateData[key] = value;
          }
        }
      });

      // Thêm trường updatedAt
      prismaUpdateData.updatedAt = new Date();

      console.log('Dữ liệu cập nhật:', JSON.stringify(prismaUpdateData, null, 2));

      return this.prisma.$transaction(async (tx) => {
        // Cập nhật câu hỏi sử dụng Prisma Client thay vì raw SQL
        if (Object.keys(prismaUpdateData).length > 0) {
          await tx.question.update({
            where: { id },
            data: prismaUpdateData
          });
          console.log('Đã cập nhật câu hỏi thành công');
        }

        // Cập nhật tags nếu có
        if (tags && tags.length > 0) {
          try {
            // Xóa tags hiện tại
            await tx.$executeRaw`
              DELETE FROM "_QuestionToTags"
              WHERE "A" = ${id}
            `;

            // Thêm tags mới
            for (const tagId of tags) {
              try {
                await tx.$executeRaw`
                  INSERT INTO "_QuestionToTags" ("A", "B")
                  VALUES (${id}, ${tagId})
                `;
                console.log(`Đã thêm tag ${tagId} cho câu hỏi ${id}`);
              } catch (tagError) {
                console.error(`Lỗi khi thêm tag ${tagId} cho câu hỏi ${id}:`, tagError.message);
                // Bỏ qua lỗi và tiếp tục với tag tiếp theo
              }
            }
          } catch (tagsError) {
            console.error(`Lỗi khi cập nhật tags cho câu hỏi ${id}:`, tagsError.message);
            // Bỏ qua lỗi và tiếp tục cập nhật câu hỏi
          }
        }

        return this.findById(id);
      });
    } catch (error) {
      console.error('Lỗi khi cập nhật câu hỏi:', error);
      throw error;
    }
  }

  /**
   * Xóa câu hỏi
   * @param id ID của câu hỏi
   * @returns Kết quả xóa
   */
  async delete(id: string) {
    try {
      // Kiểm tra ID hợp lệ
      if (!id || id === 'undefined' || id === 'null') {
        console.error('ID câu hỏi không hợp lệ:', id);
        return {
          success: false,
          message: 'ID câu hỏi không hợp lệ'
        };
      }

      console.log('Đang kiểm tra câu hỏi tồn tại với ID:', id);

      // Kiểm tra câu hỏi tồn tại
      try {
        // Sử dụng raw query để tránh lỗi schema
        let questionExists = null;

        try {
          // Thử tìm trong bảng questions (số nhiều) trước
          const result = await this.prisma.$queryRaw`
            SELECT id, content FROM questions WHERE id = ${id} LIMIT 1
          `;
          questionExists = result[0];
          console.log('Tìm thấy câu hỏi trong bảng questions:', questionExists?.id);
        } catch (err) {
          console.log('Lỗi khi tìm trong bảng questions:', err.message);

          // Thử tìm trong bảng question (số ít)
          try {
            const result = await this.prisma.$queryRaw`
              SELECT id, content FROM question WHERE id = ${id} LIMIT 1
            `;
            questionExists = result[0];
            console.log('Tìm thấy câu hỏi trong bảng question:', questionExists?.id);
          } catch (err2) {
            console.log('Lỗi khi tìm trong bảng question:', err2.message);
          }
        }

        if (!questionExists) {
          console.error('Không tìm thấy câu hỏi với ID:', id);
          return {
            success: false,
            message: `Không tìm thấy câu hỏi với ID: ${id}`
          };
        }
      } catch (findError) {
        console.error('Lỗi khi tìm câu hỏi:', findError);
        return {
          success: false,
          message: `Lỗi khi tìm câu hỏi: ${findError.message}`,
          error: findError.message
        };
      }

      console.log('Đang xóa câu hỏi với ID:', id);

      try {
        // Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
        console.log('Bắt đầu transaction xóa câu hỏi');

        // Kiểm tra các liên kết trước khi xóa
        let assessmentCount = 0;
        try {
          assessmentCount = await this.prisma.assessment_questions.count({
            where: { questionId: id }
          });
        } catch (err) {
          console.log('Không thể đếm assessment_questions:', err.message);
        }

        if (assessmentCount > 0) {
          console.warn(`Câu hỏi có ${assessmentCount} liên kết với assessment_questions`);
        }

        // Thử xóa trực tiếp trước khi dùng transaction
        try {
          console.log('Đang thử xóa câu hỏi trực tiếp...');

          // Xóa câu hỏi trực tiếp
          try {
            await this.prisma.$executeRaw`
              DELETE FROM questions WHERE id = ${id}
            `;
            console.log('Đã xóa câu hỏi từ bảng questions thành công');
          } catch (err) {
            console.log('Lỗi khi xóa từ bảng questions:', err.message);
          }

          // Thử xóa từ bảng question (số ít) nếu có
          try {
            await this.prisma.$executeRaw`
              DELETE FROM question WHERE id = ${id}
            `;
            console.log('Đã xóa câu hỏi từ bảng question thành công');
          } catch (err) {
            console.log('Lỗi khi xóa từ bảng question:', err.message);
          }

          // Kiểm tra xem câu hỏi đã bị xóa chưa
          let stillExists = false;

          try {
            const checkQuestions = await this.prisma.$queryRaw`
              SELECT COUNT(*) as count FROM questions WHERE id = ${id}
            `;
            const countQuestions = parseInt(checkQuestions[0]?.count || '0', 10);
            stillExists = stillExists || countQuestions > 0;
            console.log('Kiểm tra bảng questions:', countQuestions > 0 ? 'Vẫn còn' : 'Đã xóa');
          } catch (err) {
            console.log('Lỗi khi kiểm tra bảng questions:', err.message);
          }

          try {
            const checkQuestion = await this.prisma.$queryRaw`
              SELECT COUNT(*) as count FROM question WHERE id = ${id}
            `;
            const countQuestion = parseInt(checkQuestion[0]?.count || '0', 10);
            stillExists = stillExists || countQuestion > 0;
            console.log('Kiểm tra bảng question:', countQuestion > 0 ? 'Vẫn còn' : 'Đã xóa');
          } catch (err) {
            console.log('Lỗi khi kiểm tra bảng question:', err.message);
          }

          if (!stillExists) {
            console.log('Đã xóa câu hỏi trực tiếp thành công');
            return {
              success: true,
              message: 'Câu hỏi đã được xóa thành công',
              data: { id }
            };
          }
        } catch (directError) {
          console.log('Không thể xóa trực tiếp, thử dùng transaction:', directError.message);
        }

        const result = await this.prisma.$transaction(async (tx) => {
          try {
            // Xóa tất cả liên kết với assessment_questions
            console.log('Xóa liên kết assessment_questions');
            try {
              // Sử dụng raw query thay vì Prisma model
              await tx.$executeRaw`
                DELETE FROM assessment_questions WHERE "questionId" = ${id}
              `;
              console.log(`Đã xóa liên kết assessment_questions thành công`);
            } catch (err) {
              console.log('Lỗi khi xóa liên kết assessment_questions:', err.message);

              // Thử cách khác nếu cách trên không thành công
              try {
                await this.prisma.$executeRaw`
                  DELETE FROM "assessment_questions" WHERE "questionId" = ${id}
                `;
                console.log(`Đã xóa liên kết assessment_questions thành công (cách 2)`);
              } catch (err2) {
                console.log('Lỗi khi xóa liên kết assessment_questions (cách 2):', err2.message);
              }
            }

            // Xóa tất cả liên kết với exam_questions
            console.log('Xóa liên kết exam_questions');
            try {
              await tx.$executeRaw`
                DELETE FROM exam_questions WHERE "questionId" = ${id}
              `;
              console.log(`Đã xóa liên kết exam_questions thành công`);
            } catch (err) {
              console.log('Lỗi khi xóa liên kết exam_questions:', err.message);

              try {
                await this.prisma.$executeRaw`
                  DELETE FROM "exam_questions" WHERE "questionId" = ${id}
                `;
                console.log(`Đã xóa liên kết exam_questions thành công (cách 2)`);
              } catch (err2) {
                console.log('Lỗi khi xóa liên kết exam_questions (cách 2):', err2.message);
              }
            }

            // Xóa tất cả các phiên bản
            console.log('Xóa các phiên bản câu hỏi');
            try {
              // Sử dụng raw query thay vì Prisma model
              await tx.$executeRaw`
                DELETE FROM question_versions WHERE "questionId" = ${id}
              `;
              console.log(`Đã xóa phiên bản câu hỏi thành công`);
            } catch (err) {
              console.log('Lỗi khi xóa phiên bản câu hỏi:', err.message);

              // Thử cách khác nếu cách trên không thành công
              try {
                await this.prisma.$executeRaw`
                  DELETE FROM "question_versions" WHERE "questionId" = ${id}
                `;
                console.log(`Đã xóa phiên bản câu hỏi thành công (cách 2)`);
              } catch (err2) {
                console.log('Lỗi khi xóa phiên bản câu hỏi (cách 2):', err2.message);
              }
            }

            // Xóa tất cả liên kết tags
            console.log('Xóa liên kết tags');
            try {
              // Sử dụng raw query thay vì Prisma model
              await tx.$executeRaw`
                DELETE FROM "questionToTags" WHERE "A" = ${id}
              `;
              console.log(`Đã xóa liên kết tags thành công`);
            } catch (err) {
              console.log('Lỗi khi xóa liên kết tags:', err.message);

              // Thử cách khác nếu cách trên không thành công
              try {
                await this.prisma.$executeRaw`
                  DELETE FROM "questionToTags" WHERE "A" = ${id}
                `;
                console.log(`Đã xóa liên kết tags thành công (cách 2)`);
              } catch (err2) {
                console.log('Lỗi khi xóa liên kết tags (cách 2):', err2.message);
              }
            }

            // Xóa tất cả hình ảnh
            console.log('Xóa hình ảnh câu hỏi');
            try {
              // Sử dụng raw query thay vì Prisma model
              await tx.$executeRaw`
                DELETE FROM question_images WHERE "questionId" = ${id}
              `;
              console.log(`Đã xóa hình ảnh câu hỏi thành công`);
            } catch (err) {
              console.log('Lỗi khi xóa hình ảnh câu hỏi:', err.message);

              // Thử cách khác nếu cách trên không thành công
              try {
                await this.prisma.$executeRaw`
                  DELETE FROM "question_images" WHERE "questionId" = ${id}
                `;
                console.log(`Đã xóa hình ảnh câu hỏi thành công (cách 2)`);
              } catch (err2) {
                console.log('Lỗi khi xóa hình ảnh câu hỏi (cách 2):', err2.message);
              }
            }

            // Xóa câu hỏi
            console.log('Xóa câu hỏi chính');
            try {
              // Thử xóa trực tiếp không qua transaction trước
              try {
                await this.prisma.$executeRaw`
                  DELETE FROM questions WHERE id = ${id}
                `;
                console.log('Đã xóa câu hỏi trực tiếp từ bảng questions thành công');
              } catch (err) {
                console.log('Không thể xóa trực tiếp từ bảng questions:', err.message);
              }

              // Thử xóa từ bảng question (số ít)
              try {
                await this.prisma.$executeRaw`
                  DELETE FROM question WHERE id = ${id}
                `;
                console.log('Đã xóa câu hỏi trực tiếp từ bảng question thành công');
              } catch (err) {
                console.log('Không thể xóa trực tiếp từ bảng question:', err.message);
              }

              // Thử xóa từ bảng question trong transaction
              try {
                await tx.question.delete({
                  where: {
                    id: id
                  }
                });
                console.log('Đã xóa câu hỏi chính từ bảng question thành công');
              } catch (err) {
                console.log('Không thể xóa từ bảng question trong transaction:', err.message);

                // Nếu không thành công, thử xóa từ bảng questions (số nhiều) trong transaction
                try {
                  await tx.$executeRaw`
                    DELETE FROM questions WHERE id = ${id}
                  `;
                  console.log('Đã xóa câu hỏi chính từ bảng questions thành công');
                } catch (err2) {
                  console.log('Không thể xóa từ bảng questions trong transaction:', err2.message);
                }
              }

              // Kiểm tra xem câu hỏi đã thực sự bị xóa chưa
              let stillExists = false;

              try {
                const checkQuestions = await this.prisma.$queryRaw`
                  SELECT COUNT(*) as count FROM questions WHERE id = ${id}
                `;
                const countQuestions = parseInt(checkQuestions[0]?.count || '0', 10);
                stillExists = stillExists || countQuestions > 0;
                console.log('Kiểm tra bảng questions:', countQuestions > 0 ? 'Vẫn còn' : 'Đã xóa');
              } catch (err) {
                console.log('Lỗi khi kiểm tra bảng questions:', err.message);
              }

              try {
                const checkQuestion = await this.prisma.$queryRaw`
                  SELECT COUNT(*) as count FROM question WHERE id = ${id}
                `;
                const countQuestion = parseInt(checkQuestion[0]?.count || '0', 10);
                stillExists = stillExists || countQuestion > 0;
                console.log('Kiểm tra bảng question:', countQuestion > 0 ? 'Vẫn còn' : 'Đã xóa');
              } catch (err) {
                console.log('Lỗi khi kiểm tra bảng question:', err.message);
              }

              if (stillExists) {
                console.error(`Câu hỏi vẫn còn tồn tại sau khi xóa, ID: ${id}`);
                // Thử xóa lần cuối
                try {
                  await this.prisma.$executeRaw`
                    DELETE FROM questions WHERE id = ${id}
                  `;
                  console.log('Đã thử xóa lần cuối từ bảng questions');
                } catch (err) {
                  console.log('Không thể xóa lần cuối từ bảng questions:', err.message);
                }
              } else {
                console.log('Đã xóa câu hỏi chính thành công');
              }

              console.log('Đã xóa câu hỏi chính thành công');
            } catch (deleteError) {
              console.error('Lỗi khi xóa câu hỏi chính:', deleteError);
              return {
                success: false,
                message: `Lỗi khi xóa câu hỏi chính: ${deleteError.message}`,
                error: deleteError.message
              };
            }

            console.log('Transaction xóa câu hỏi thành công');
            return {
              success: true,
              message: 'Câu hỏi đã được xóa thành công',
              data: {
                id: id
              }
            };
          } catch (txError) {
            console.error('Lỗi trong transaction khi xóa câu hỏi:', txError);
            return {
              success: false,
              message: `Lỗi trong transaction: ${txError.message}`,
              error: txError.message
            };
          }
        });

        console.log('Đã xóa câu hỏi thành công với ID:', id);
        return result;
      } catch (txError) {
        console.error('Lỗi khi thực hiện transaction xóa câu hỏi:', txError);

        // Kiểm tra lỗi liên quan đến khóa ngoại
        if (txError.message && txError.message.includes('foreign key constraint')) {
          console.log('Phát hiện lỗi khóa ngoại, thử xóa liên kết trước');

          try {
            // Xóa liên kết assessment_questions trước
            await this.prisma.$executeRaw`
              DELETE FROM assessment_questions WHERE "questionId" = ${id}
            `;
            console.log('Đã xóa liên kết assessment_questions thành công');

            // Xóa liên kết exam_questions
            await this.prisma.$executeRaw`
              DELETE FROM exam_questions WHERE "questionId" = ${id}
            `;
            console.log('Đã xóa liên kết exam_questions thành công');

            // Xóa liên kết question_images
            await this.prisma.$executeRaw`
              DELETE FROM question_images WHERE "questionId" = ${id}
            `;
            console.log('Đã xóa liên kết question_images thành công');

            // Xóa liên kết question_versions
            await this.prisma.$executeRaw`
              DELETE FROM question_versions WHERE "questionId" = ${id}
            `;
            console.log('Đã xóa liên kết question_versions thành công');

            // Xóa liên kết _QuestionToTags
            await this.prisma.$executeRaw`
              DELETE FROM "_QuestionToTags" WHERE "A" = ${id}
            `;
            console.log('Đã xóa liên kết _QuestionToTags thành công');

            // Thử xóa câu hỏi lần nữa
            await this.prisma.$executeRaw`
              DELETE FROM questions WHERE id = ${id}
            `;
            console.log('Đã xóa câu hỏi thành công sau khi xử lý khóa ngoại');

            return {
              success: true,
              message: 'Câu hỏi đã được xóa thành công sau khi xử lý khóa ngoại',
              data: { id }
            };
          } catch (fkError) {
            console.error('Không thể xử lý lỗi khóa ngoại:', fkError.message);

            return {
              success: false,
              message: 'Không thể xóa câu hỏi vì nó đang được sử dụng trong bài thi hoặc bài học. Vui lòng xóa các liên kết trước.',
              error: txError.message
            };
          }
        }

        return {
          success: false,
          message: `Lỗi khi xóa câu hỏi: ${txError.message}`,
          error: txError.message
        };
      }
    } catch (error) {
      console.error('Lỗi khi xóa câu hỏi:', error);

      // Trả về lỗi chi tiết hơn
      if (error instanceof NotFoundException) {
        return {
          success: false,
          message: error.message,
          error: 'NOT_FOUND'
        };
      }

      return {
        success: false,
        message: `Không thể xóa câu hỏi: ${error.message || 'Lỗi không xác định'}`,
        error: error.name || 'UNKNOWN_ERROR'
      };
    }
  }

  /**
   * Xóa câu hỏi dựa trên nội dung
   * @param content Nội dung câu hỏi
   * @returns Kết quả xóa
   */
  async deleteByContent(content: string) {
    try {
      // Kiểm tra nội dung hợp lệ
      if (!content) {
        console.error('Nội dung câu hỏi không hợp lệ');
        return {
          success: false,
          message: 'Nội dung câu hỏi không hợp lệ'
        };
      }

      console.log('Đang tìm câu hỏi với nội dung:', content.substring(0, 30));

      // Tìm câu hỏi dựa trên nội dung
      try {
        // Thử tìm trong bảng questions (số nhiều) trước
        let questions = [];
        try {
          const result = await this.prisma.$queryRaw`
            SELECT id FROM questions
            WHERE content LIKE ${`%${content.substring(0, 50)}%`}
            LIMIT 1
          `;
          questions = Array.isArray(result) ? result : [result].filter(Boolean);
          console.log('Tìm thấy câu hỏi trong bảng questions:', questions.length > 0);
        } catch (err) {
          console.log('Lỗi khi tìm trong bảng questions:', err.message);

          // Thử tìm trong bảng question (số ít)
          try {
            const result = await this.prisma.$queryRaw`
              SELECT id FROM question
              WHERE content LIKE ${`%${content.substring(0, 50)}%`}
              LIMIT 1
            `;
            questions = Array.isArray(result) ? result : [result].filter(Boolean);
            console.log('Tìm thấy câu hỏi trong bảng question:', questions.length > 0);
          } catch (err2) {
            console.log('Lỗi khi tìm trong bảng question:', err2.message);
          }
        }

        if (!questions || questions.length === 0) {
          console.error('Không tìm thấy câu hỏi với nội dung này');
          return {
            success: false,
            message: 'Không tìm thấy câu hỏi với nội dung này'
          };
        }

        const questionId = questions[0].id;
        console.log('Đã tìm thấy câu hỏi với ID:', questionId);

        // Xóa câu hỏi bằng ID
        return this.delete(questionId);
      } catch (findError) {
        console.error('Lỗi khi tìm câu hỏi:', findError);
        return {
          success: false,
          message: `Lỗi khi tìm câu hỏi: ${findError.message}`,
          error: findError.message
        };
      }
    } catch (error) {
      console.error('Lỗi khi xóa câu hỏi theo nội dung:', error);
      return {
        success: false,
        message: `Không thể xóa câu hỏi: ${error.message || 'Lỗi không xác định'}`,
        error: error.name || 'UNKNOWN_ERROR'
      };
    }
  }

  /**
   * Cập nhật trạng thái câu hỏi
   * @param id ID của câu hỏi
   * @param status Trạng thái mới
   * @returns Câu hỏi đã cập nhật
   */
  async updateStatus(id: string, status: QuestionStatus) {
    await this.prisma.$executeRaw`
      UPDATE "questions"
      SET status = ${status}, "updatedAt" = NOW()
      WHERE id = ${id}
    `;

    return this.findById(id);
  }

  /**
   * Tìm câu hỏi theo QuestionID (định dạng XXXXX-X)
   * @param questionId QuestionID cần tìm
   * @returns Câu hỏi tìm thấy hoặc throw NotFoundException
   */
  async findByQuestionId(questionId: string) {
    const question = await this.questionRepository.findByQuestionId(questionId);

    if (!question) {
      throw new NotFoundException(`Không tìm thấy câu hỏi với QuestionID: ${questionId}`);
    }

    return question;
  }

  /**
   * Tìm câu hỏi theo Subcount (định dạng XX.N)
   * @param subcount Subcount cần tìm
   * @returns Câu hỏi tìm thấy hoặc throw NotFoundException
   */
  async findBySubcount(subcount: string) {
    try {
      console.log(`Tìm câu hỏi theo subcount: ${subcount}`);

      // Sử dụng raw query để tìm câu hỏi theo subcount
      const questions = await this.prisma.$queryRaw`
        SELECT id, content, "createdAt", "updatedAt", "rawContent", status, type, "creatorId", "questionId", subcount, source
        FROM questions
        WHERE subcount = ${subcount}
        LIMIT 1
      `;

      console.log(`Kết quả tìm kiếm:`, questions);

      if (!questions || (Array.isArray(questions) && questions.length === 0)) {
        throw new NotFoundException(`Không tìm thấy câu hỏi với Subcount: ${subcount}`);
      }

      return questions[0];
    } catch (error) {
      console.error(`Lỗi khi tìm câu hỏi theo subcount ${subcount}:`, error);
      throw error;
    }
  }

  /**
   * Tìm câu hỏi có chứa các tags
   * @param tagIds Mảng IDs của các tag
   * @returns Danh sách câu hỏi
   */
  async findByTags(tagIds: string[]) {
    return this.prisma.$transaction(async (tx) => {
      // Xây dựng mệnh đề WHERE IN cho các tag IDs
      const tagIdsClause = tagIds.map(id => `'${id}'`).join(',');

      // Sử dụng raw query để tìm câu hỏi có chứa ít nhất một trong các tag
      const questions = await tx.$queryRaw`
        SELECT DISTINCT q.*
        FROM "questions" q
        JOIN "_QuestionToTags" qt ON q.id = qt."A"
        WHERE qt."B" IN (${Prisma.raw(tagIdsClause)})
        ORDER BY q."createdAt" DESC
      `;

      return questions;
    });
  }

  /**
   * Tăng số lần sử dụng của câu hỏi
   * @param questionId ID của câu hỏi
   * @returns Câu hỏi đã cập nhật
   */
  async incrementUsageCount(questionId: string) {
    await this.prisma.$executeRaw`
      UPDATE "questions"
      SET "usageCount" = "usageCount" + 1, "updatedAt" = NOW()
      WHERE id = ${questionId}
    `;

    return this.findById(questionId);
  }

  /**
   * Tăng số lượng feedback cho câu hỏi
   * @param questionId ID của câu hỏi
   * @returns Câu hỏi đã cập nhật
   */
  async incrementFeedbackCount(questionId: string) {
    await this.prisma.$executeRaw`
      UPDATE "questions"
      SET "feedback" = "feedback" + 1, "updatedAt" = NOW()
      WHERE id = ${questionId}
    `;

    return this.findById(questionId);
  }

  /**
   * Tìm kiếm câu hỏi theo văn bản
   * @param searchText Văn bản tìm kiếm
   * @returns Danh sách câu hỏi
   */
  async searchByText(searchText: string) {
    return this.prisma.$transaction(async (tx) => {
      // Sử dụng raw query với ILIKE để tìm kiếm không phân biệt hoa thường
      const questions = await tx.$queryRaw`
        SELECT q.*, u.id as "creatorId", u.email, u."fullName"
        FROM "questions" q
        LEFT JOIN "users" u ON q."creatorId" = u.id
        WHERE
          q.content ILIKE ${`%${searchText}%`} OR
          q."rawContent" ILIKE ${`%${searchText}%`}
        ORDER BY q."createdAt" DESC
        LIMIT 50
      `;

      return questions;
    });
  }

  /**
   * Tìm câu hỏi theo người tạo
   * @param creatorId ID của người tạo
   * @returns Danh sách câu hỏi
   */
  async findByCreator(creatorId: string) {
    return this.prisma.$transaction(async (tx) => {
      // Sử dụng raw query để tìm câu hỏi theo người tạo
      const questions = await tx.$queryRaw`
        SELECT q.*, u.id as "creatorId", u.email, u."fullName"
        FROM "questions" q
        LEFT JOIN "users" u ON q."creatorId" = u.id
        WHERE q."creatorId" = ${creatorId}
        ORDER BY q."createdAt" DESC
      `;

      return questions;
    });
  }

  /**
   * Phân tích LaTeX và trích xuất thông tin câu hỏi
   * @param rawContent Nội dung LaTeX
   * @returns Thông tin đã trích xuất
   */
  async parseLatexContent(rawContent: string) {
    // Triển khai logic phân tích LaTeX để trích xuất thông tin câu hỏi
    try {
      // Logic cơ bản để trích xuất thông tin từ LaTeX
      const questionData: Partial<{
        content: string;
        options: string[];
        correctOptions: string[];
        explanation?: string;
      }> = {
        content: '',
        options: [],
        correctOptions: []
      };

      // Trích xuất content
      const contentMatch = rawContent.match(/\\question\{(.*?)\}/s);
      if (contentMatch && contentMatch[1]) {
        questionData.content = contentMatch[1].trim();
      }

      // Trích xuất options
      const optionsMatches = Array.from(rawContent.matchAll(/\\choice\{(.*?)\}/gs));
      if (optionsMatches.length > 0) {
        questionData.options = optionsMatches.map(match => match[1].trim());
      }

      // Trích xuất correct options
      const correctOptionsMatches = Array.from(rawContent.matchAll(/\\correctchoice\{(.*?)\}/gs));
      if (correctOptionsMatches.length > 0) {
        questionData.correctOptions = correctOptionsMatches.map(match => match[1].trim());
      }

      // Trích xuất giải thích
      const explanationMatch = rawContent.match(/\\explanation\{(.*?)\}/s);
      if (explanationMatch && explanationMatch[1]) {
        questionData.explanation = explanationMatch[1].trim();
      }

      return questionData;
    } catch (error) {
      throw new Error(`Không thể phân tích nội dung LaTeX: ${error.message}`);
    }
  }

  /**
   * Xử lý và chuẩn hóa câu hỏi Multiple Choice
   * @param data Dữ liệu câu hỏi
   * @returns Dữ liệu đã được chuẩn hóa
   */
  processMultipleChoiceQuestion(data: Partial<{
    content: string;
    options: string[];
    correctOptions: string[];
    explanation?: string;
  }>) {
    // Validate dữ liệu
    if (!data.content) {
      throw new Error('Câu hỏi Multiple Choice phải có nội dung');
    }

    if (!data.options || data.options.length < 2) {
      throw new Error('Câu hỏi Multiple Choice phải có ít nhất 2 lựa chọn');
    }

    if (!data.correctOptions || data.correctOptions.length === 0) {
      throw new Error('Câu hỏi Multiple Choice phải có ít nhất 1 đáp án đúng');
    }

    // Xác nhận tất cả đáp án đúng có trong danh sách lựa chọn
    const invalidOptions = data.correctOptions.filter(opt => !data.options.includes(opt));
    if (invalidOptions.length > 0) {
      throw new Error(`Đáp án đúng phải nằm trong danh sách lựa chọn: ${invalidOptions.join(', ')}`);
    }

    // Chuẩn hóa dữ liệu
    return {
      ...data,
      type: 'MULTIPLE_CHOICE',
      metadata: {
        optionCount: data.options.length,
        correctOptionCount: data.correctOptions.length,
        isMultiAnswer: data.correctOptions.length > 1
      }
    };
  }

  /**
   * Xử lý và chuẩn hóa câu hỏi True/False
   * @param data Dữ liệu câu hỏi
   * @returns Dữ liệu đã được chuẩn hóa
   */
  processTrueFalseQuestion(data: Partial<{
    content: string;
    isTrue?: boolean;
    explanation?: string;
  }>) {
    // Validate dữ liệu
    if (!data.content) {
      throw new Error('Câu hỏi True/False phải có nội dung');
    }

    if (data.isTrue === undefined) {
      throw new Error('Câu hỏi True/False phải có giá trị đúng/sai được xác định');
    }

    // Chuẩn hóa dữ liệu
    return {
      ...data,
      type: 'TRUE_FALSE',
      options: ['True', 'False'],
      correctOptions: [data.isTrue ? 'True' : 'False'],
      metadata: {
        isTrue: data.isTrue
      }
    };
  }

  /**
   * Xử lý và chuẩn hóa câu hỏi Short Answer
   * @param data Dữ liệu câu hỏi
   * @returns Dữ liệu đã được chuẩn hóa
   */
  processShortAnswerQuestion(data: Partial<{
    content: string;
    correctAnswers: string[];
    caseSensitive?: boolean;
    explanation?: string;
  }>) {
    // Validate dữ liệu
    if (!data.content) {
      throw new Error('Câu hỏi Short Answer phải có nội dung');
    }

    if (!data.correctAnswers || data.correctAnswers.length === 0) {
      throw new Error('Câu hỏi Short Answer phải có ít nhất một đáp án đúng');
    }

    // Chuẩn hóa dữ liệu
    const caseSensitive = data.caseSensitive ?? false;

    // Chuẩn hóa đáp án nếu không phân biệt hoa thường
    const normalizedAnswers = caseSensitive
      ? data.correctAnswers
      : data.correctAnswers.map(ans => ans.toLowerCase());

    return {
      ...data,
      type: 'SHORT_ANSWER',
      correctAnswers: normalizedAnswers,
      metadata: {
        answerCount: normalizedAnswers.length,
        caseSensitive: caseSensitive
      }
    };
  }

  /**
   * Xử lý và chuẩn hóa câu hỏi Essay
   * @param data Dữ liệu câu hỏi
   * @returns Dữ liệu đã được chuẩn hóa
   */
  processEssayQuestion(data: Partial<{
    content: string;
    wordLimit?: number;
    rubric?: string;
    keywords?: string[];
    explanation?: string;
  }>) {
    // Validate dữ liệu
    if (!data.content) {
      throw new Error('Câu hỏi Essay phải có nội dung');
    }

    // Chuẩn hóa dữ liệu
    return {
      ...data,
      type: 'ESSAY',
      metadata: {
        wordLimit: data.wordLimit || 0,
        hasRubric: !!data.rubric,
        keywordCount: data.keywords?.length || 0
      }
    };
  }

  /**
   * Xử lý dữ liệu câu hỏi theo từng loại
   * @param data Dữ liệu câu hỏi
   * @param type Loại câu hỏi
   * @returns Dữ liệu đã được xử lý
   */
  processQuestionByType(data: Partial<{
    content: string;
    options?: string[];
    correctOptions?: string[];
    isTrue?: boolean;
    correctAnswers?: string[];
    caseSensitive?: boolean;
    wordLimit?: number;
    rubric?: string;
    keywords?: string[];
    explanation?: string;
  }>, type: string) {
    switch (type.toUpperCase()) {
      case 'MULTIPLE_CHOICE':
      case 'MC':
        return this.processMultipleChoiceQuestion(data);
      case 'TRUE_FALSE':
      case 'TF':
        return this.processTrueFalseQuestion(data);
      case 'SHORT_ANSWER':
      case 'SA':
        return this.processShortAnswerQuestion(data);
      case 'ESSAY':
      case 'ES':
        return this.processEssayQuestion(data);
      default:
        throw new Error(`Không hỗ trợ loại câu hỏi: ${type}`);
    }
  }

  /**
   * Kiểm tra đáp án cho câu hỏi
   * @param question Câu hỏi
   * @param answer Đáp án của người dùng
   * @returns Kết quả kiểm tra (đúng/sai và điểm)
   */
  checkAnswer(
    question: {
      type: string;
      correctOptions?: string[];
      options?: string[];
      isTrue?: boolean;
      correctAnswers?: string[];
      metadata?: {
        caseSensitive?: boolean;
        [key: string]: unknown;
      };
    },
    answer: string | string[]
  ) {
    const type = question.type.toUpperCase();
    let isCorrect = false;
    let score = 0;
    let feedback = '';

    switch (type) {
      case 'MULTIPLE_CHOICE': {
        if (Array.isArray(answer)) {
          // Kiểm tra câu hỏi nhiều đáp án
          const correctOptions = question.correctOptions || [];
          const hasAllCorrect = correctOptions.every(opt => answer.includes(opt));
          const hasNoIncorrect = answer.every(ans => correctOptions.includes(ans));
          isCorrect = hasAllCorrect && hasNoIncorrect;

          // Tính điểm theo tỷ lệ
          if (hasAllCorrect && hasNoIncorrect) {
            score = 1; // Đúng hoàn toàn
          } else if (hasAllCorrect) {
            // Có tất cả đáp án đúng nhưng chọn thừa
            score = Math.max(0, 1 - (answer.length - correctOptions.length) / (question.options?.length || 1));
          } else {
            // Số đáp án đúng / tổng số đáp án đúng
            const correctCount = answer.filter(ans => correctOptions.includes(ans)).length;
            score = correctCount / correctOptions.length;
          }
        } else {
          // Kiểm tra câu hỏi một đáp án
          isCorrect = question.correctOptions?.includes(answer) || false;
          score = isCorrect ? 1 : 0;
        }
        break;
      }

      case 'TRUE_FALSE': {
        const correctAnswer = question.isTrue ? 'True' : 'False';
        isCorrect = answer === correctAnswer;
        score = isCorrect ? 1 : 0;
        break;
      }

      case 'SHORT_ANSWER': {
        const correctAnswers = question.correctAnswers || [];
        const caseSensitive = question.metadata?.caseSensitive || false;

        if (!Array.isArray(answer)) {
          if (caseSensitive) {
            isCorrect = correctAnswers.includes(answer);
          } else {
            isCorrect = correctAnswers.map(ans => ans.toLowerCase())
              .includes(answer.toLowerCase());
          }
          score = isCorrect ? 1 : 0;
        }
        break;
      }

      case 'ESSAY': {
        // Câu hỏi Essay không thể tự động chấm điểm
        isCorrect = null;
        score = null;
        feedback = 'Câu hỏi tự luận cần được chấm điểm thủ công';
        break;
      }

      default:
        throw new Error(`Không hỗ trợ kiểm tra đáp án cho loại câu hỏi: ${type}`);
    }

    return {
      isCorrect,
      score,
      feedback
    };
  }

  /**
   * Tìm câu hỏi theo loại
   * @param type Loại câu hỏi cần tìm
   * @param options Các tùy chọn bổ sung
   * @returns Danh sách câu hỏi
   */
  async findByType(type: QuestionType, options?: {
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const limit = options?.limit || 20;
    const offset = options?.offset || 0;
    const sortBy = options?.sortBy || 'createdAt';
    const sortOrder = options?.sortOrder || 'desc';

    return this.prisma.$transaction(async (tx) => {
      // Đếm tổng số câu hỏi thỏa mãn điều kiện
      const countResult = await tx.$queryRaw<[{ count: string }]>`
        SELECT COUNT(*) as count FROM "questions"
        WHERE type = ${type}
      `;

      const total = parseInt(countResult[0]?.count || '0', 10);

      // Tạo mệnh đề ORDER BY
      const orderByClause = `"${sortBy}" ${sortOrder.toUpperCase()}`;

      // Truy vấn câu hỏi
      const questions = await tx.$queryRaw`
        SELECT q.*, u.id as "creatorId", u.email, u."fullName"
        FROM "questions" q
        LEFT JOIN "users" u ON q."creatorId" = u.id
        WHERE q.type = ${type}
        ORDER BY ${Prisma.raw(orderByClause)}
        LIMIT ${limit} OFFSET ${offset}
      `;

      return {
        questions,
        total,
        limit,
        offset,
        page: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(total / limit)
      };
    });
  }

  /**
   * Tìm câu hỏi theo phân cấp (lớp, môn, chương, bài)
   * @param hierarchy Đối tượng chứa thông tin phân cấp
   * @param options Các tùy chọn bổ sung
   * @returns Danh sách câu hỏi
   */
  async findByHierarchy(hierarchy: {
    grade?: string;
    subject?: string;
    chapter?: string;
    lesson?: string;
  }, options?: {
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const limit = options?.limit || 20;
    const offset = options?.offset || 0;
    const sortBy = options?.sortBy || 'createdAt';
    const sortOrder = options?.sortOrder || 'desc';

    return this.prisma.$transaction(async (tx) => {
      // Xây dựng các điều kiện where từ thông tin phân cấp
      const conditions: string[] = [];

      if (hierarchy.grade) {
        conditions.push(`q.metadata->>'grade' = '${hierarchy.grade}'`);
      }

      if (hierarchy.subject) {
        conditions.push(`q.metadata->>'subject' = '${hierarchy.subject}'`);
      }

      if (hierarchy.chapter) {
        conditions.push(`q.metadata->>'chapter' = '${hierarchy.chapter}'`);
      }

      if (hierarchy.lesson) {
        conditions.push(`q.metadata->>'lesson' = '${hierarchy.lesson}'`);
      }

      // Nếu không có điều kiện nào, trả về kết quả rỗng
      if (conditions.length === 0) {
        return {
          questions: [],
          total: 0,
          limit,
          offset,
          page: 1,
          totalPages: 0
        };
      }

      // Kết hợp các điều kiện
      const whereClause = conditions.join(' AND ');

      // Đếm tổng số câu hỏi thỏa mãn điều kiện
      const countResult = await tx.$queryRaw<[{ count: string }]>`
        SELECT COUNT(*) as count FROM "questions" q
        WHERE ${Prisma.raw(whereClause)}
      `;

      const total = parseInt(countResult[0]?.count || '0', 10);

      // Tạo mệnh đề ORDER BY
      const orderByClause = `"${sortBy}" ${sortOrder.toUpperCase()}`;

      // Truy vấn câu hỏi
      const questions = await tx.$queryRaw`
        SELECT q.*, u.id as "creatorId", u.email, u."fullName"
        FROM "questions" q
        LEFT JOIN "users" u ON q."creatorId" = u.id
        WHERE ${Prisma.raw(whereClause)}
        ORDER BY ${Prisma.raw(orderByClause)}
        LIMIT ${limit} OFFSET ${offset}
      `;

      return {
        questions,
        total,
        limit,
        offset,
        page: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(total / limit)
      };
    });
  }

  /**
   * Xuất câu hỏi sang định dạng LaTeX
   * @param questionId ID của câu hỏi cần xuất
   * @returns String LaTeX
   */
  async exportToLatex(questionId: string): Promise<string> {
    // Lấy thông tin câu hỏi
    const question = await this.findById(questionId);

    if (!question) {
      throw new NotFoundException(`Không tìm thấy câu hỏi với ID: ${questionId}`);
    }

    // Cần cast dữ liệu để có thể truy cập các thuộc tính
    interface ExtendedQuestionData {
      id: string;
      title?: string;
      content: string;
      type: string;
      options?: Array<string | { content: string }>;
      correctOptions?: string[];
      isTrue?: boolean;
      correctAnswers?: string[];
      explanation?: string;
      difficulty?: string;
      status?: string;
      metadata?: Record<string, unknown>;
    }

    const questionData = question as unknown as ExtendedQuestionData;

    // Tạo mẫu LaTeX dựa trên loại câu hỏi
    const type = questionData.type?.toUpperCase() || '';
    let latexContent = '';

    // Thêm phần mở đầu LaTeX
    latexContent += `\\begin{question}{${questionData.id}}\n`;

    // Thêm tiêu đề câu hỏi
    if (questionData.title) {
      latexContent += `\\title{${this.escapeLatex(questionData.title)}}\n`;
    }

    // Thêm nội dung câu hỏi
    latexContent += `\\question{${this.escapeLatex(questionData.content || '')}}\n\n`;

    // Tùy chỉnh theo loại câu hỏi
    switch (type) {
      case 'MULTIPLE_CHOICE': {
        // Thêm phần lựa chọn
        const options = questionData.options || [];
        const correctOptions = questionData.correctOptions || [];

        latexContent += `\\begin{choices}\n`;

        for (const option of options) {
          const optionText = typeof option === 'string' ? option : option.content;

          if (correctOptions.includes(option as string)) {
            latexContent += `\\correctchoice{${this.escapeLatex(optionText)}}\n`;
          } else {
            latexContent += `\\choice{${this.escapeLatex(optionText)}}\n`;
          }
        }

        latexContent += `\\end{choices}\n\n`;
        break;
      }

      case 'TRUE_FALSE': {
        const isTrue = questionData.isTrue || false;

        latexContent += `\\truefalse{${isTrue ? 'true' : 'false'}}\n\n`;
        break;
      }

      case 'SHORT_ANSWER': {
        const correctAnswers = questionData.correctAnswers || [];

        latexContent += `\\shortanswer{${correctAnswers.map(ans => this.escapeLatex(ans)).join(', ')}}\n\n`;
        break;
      }

      case 'ESSAY': {
        const metadata = questionData.metadata || {};
        const wordLimit = metadata.wordLimit as number || 0;

        latexContent += `\\essay`;
        if (wordLimit > 0) {
          latexContent += `[${wordLimit}]`;
        }
        latexContent += `\n\n`;
        break;
      }
    }

    // Thêm giải thích nếu có
    if (questionData.explanation) {
      latexContent += `\\explanation{${this.escapeLatex(questionData.explanation)}}\n\n`;
    }

    // Thêm metadata
    latexContent += `\\metadata{\n`;
    if (questionData.difficulty) {
      latexContent += `  difficulty = ${questionData.difficulty},\n`;
    }
    if (questionData.status) {
      latexContent += `  status = ${questionData.status},\n`;
    }
    // Thêm các metadata khác nếu có
    const metadata = questionData.metadata || {};
    for (const [key, value] of Object.entries(metadata)) {
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        latexContent += `  ${key} = ${value},\n`;
      }
    }
    latexContent += `}\n\n`;

    // Kết thúc câu hỏi
    latexContent += `\\end{question}`;

    return latexContent;
  }

  /**
   * Escape các ký tự đặc biệt trong LaTeX
   * @param text Text cần escape
   * @returns Text đã escape
   */
  private escapeLatex(text: string): string {
    return text
      .replace(/\\/g, '\\textbackslash')
      .replace(/\{/g, '\\{')
      .replace(/\}/g, '\\}')
      .replace(/\$/g, '\\$')
      .replace(/&/g, '\\&')
      .replace(/#/g, '\\#')
      .replace(/_/g, '\\_')
      .replace(/%/g, '\\%')
      .replace(/~/g, '\\textasciitilde')
      .replace(/\^/g, '\\textasciicircum');
  }
}