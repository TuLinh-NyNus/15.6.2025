import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IExamRepository } from '@project/interfaces';
import { 
  Difficulty as EntityDifficulty, 
  ExamCategory as EntityExamCategory, 
  ExamForm as EntityExamForm, 
  ExamType as EntityExamType,
  Exam
} from '@project/entities';
import { ExamDescription } from '../../entities/exam.entity';
import { ExamFilterDto } from '@project/dto';
import { Prisma, Difficulty, ExamCategory, ExamForm, ExamType } from '@prisma/client';

// Define the payload type based on prisma includes
type PrismaExamPayload = Prisma.ExamGetPayload<{
  include: {
    creator: true;
    examResults: true;
    lessons: true;
  };
}>;

// Định nghĩa kiểu Question để sử dụng trong map function
interface ExamQuestion {
  id: number | string;
  [key: string]: unknown;
}

// Định nghĩa interface mở rộng cho Exam với các trường tùy chỉnh
interface ExtendedExam extends Partial<Exam> {
  createdBy?: string;
  subject?: string;
  grade?: number;
  tags?: string[];
  difficulty?: EntityDifficulty;
  form?: EntityExamForm;
  type?: EntityExamType;
}

// Interface cho dữ liệu tạo question trong exam
interface ExamQuestionData {
  examId: string;
  questionId: string;
  order: number;
  score: number;
}

// Tạo kiểu không bao gồm creator để tránh lỗi "required property missing"
type ExamCreateInputWithoutCreator = Omit<Prisma.ExamCreateInput, 'creator'>;

// Tạo local interface cho internal model 
interface ExamEntityModel {
  id: string;
  title: string;
  description: ExamDescription | null;
  questions: number[];
  duration: number;
  difficulty: EntityDifficulty;
  subject: string;
  grade: number;
  form: EntityExamForm;
  createdBy: string;
  averageScore: number | null;
  updatedAt: Date;
  createdAt: Date;
  tags: string[];
  examCategory: EntityExamCategory;
  type: EntityExamType;
}

// Helper function để chuyển đổi từ ExamEntityModel sang Exam
function mapToExternalExam(model: ExamEntityModel): Exam {
  // Tạo một đối tượng Exam từ ExamEntityModel
  const exam: Exam = {
    id: Number(model.id), // chuyển string id thành number
    userId: 0, // giá trị mặc định hoặc lấy từ createdBy
    title: model.title,
    description: model.description as unknown as Record<string, unknown> || {},
    timeLimit: model.duration, // map từ duration sang timeLimit
    passingScore: 0, // giá trị mặc định hoặc tính toán
    examCategories: [model.examCategory], // chuyển đổi từ examCategory sang mảng
    examForm: model.form,
    examType: model.type,
    isRandomized: false, // giá trị mặc định
    visibleToStudents: true, // giá trị mặc định
    startDate: undefined, // giá trị mặc định
    endDate: undefined, // giá trị mặc định
    questions: [], // giá trị mặc định, sẽ được điền sau
    createdAt: model.createdAt,
    updatedAt: model.updatedAt
  };
  return exam;
}

// Helper function để chuyển Exam thành PrismaExamData
function mapExamToPrismaData(exam: Partial<Exam>): {
  questions?: number[];
  prismaData: ExamCreateInputWithoutCreator;
} {
  // Trích xuất các giá trị cần thiết từ exam
  let questions: number[] | undefined;
  
  if (exam.questions && Array.isArray(exam.questions)) {
    // Nếu questions là array, lưu lại để xử lý riêng
    questions = exam.questions.map(q => {
      if (typeof q === 'number') return q;
      // Sử dụng cast hai bước để tránh lỗi type incompatible
      const questionObj = q as unknown;
      return Number((questionObj as ExamQuestion).id);
    });
  }
  
  // Các trường cần chuyển đổi từ exam entity sang prisma model
  const customExam = exam as ExtendedExam;
  
  // Tạo dữ liệu cho Prisma
  const prismaData: ExamCreateInputWithoutCreator = {
    title: exam.title || '',
    description: exam.description as unknown as Prisma.InputJsonValue,
    duration: exam.timeLimit || 0,
    difficulty: customExam.difficulty ? mapDifficultyToPrisma(customExam.difficulty) : 'medium',
    subject: customExam.subject || 'Unknown',
    grade: customExam.grade || 12,
    form: customExam.form ? mapExamFormToPrisma(customExam.form) : 'TRAC_NGHIEM',
    tags: customExam.tags || [],
    examCategory: exam.examCategories && exam.examCategories.length ?
      mapExamCategoryToPrisma(exam.examCategories[0]) : 'KHAO_SAT',
    type: customExam.type ? mapExamTypeToPrisma(customExam.type) : undefined
  };
  
  return { questions, prismaData };
}

// Helper functions to convert between entity enums and prisma enums
function mapDifficultyToPrisma(difficulty: EntityDifficulty): Difficulty {
  const mapping: Record<EntityDifficulty, Difficulty> = {
    [EntityDifficulty.EASY]: 'easy',
    [EntityDifficulty.MEDIUM]: 'medium',
    [EntityDifficulty.HARD]: 'hard'
  };
  return mapping[difficulty] || 'medium';
}

function mapDifficultyToEntity(difficulty: string): EntityDifficulty {
  const mapping: Record<Difficulty, EntityDifficulty> = {
    'easy': EntityDifficulty.EASY,
    'medium': EntityDifficulty.MEDIUM,
    'hard': EntityDifficulty.HARD
  };
  return mapping[difficulty as Difficulty] || EntityDifficulty.MEDIUM;
}

function mapExamFormToPrisma(form: EntityExamForm): ExamForm {
  const mapping: Record<EntityExamForm, ExamForm> = {
    [EntityExamForm.TRAC_NGHIEM]: 'TRAC_NGHIEM',
    [EntityExamForm.TU_LUAN]: 'TU_LUAN',
    [EntityExamForm.KET_HOP]: 'KET_HOP',
    [EntityExamForm.FORM_2018]: 'FORM_2018',
    [EntityExamForm.FORM_2025]: 'FORM_2025'
  };
  return mapping[form] || 'TRAC_NGHIEM';
}

function mapExamFormToEntity(form: string): EntityExamForm {
  const mapping: Record<ExamForm, EntityExamForm> = {
    'TRAC_NGHIEM': EntityExamForm.TRAC_NGHIEM,
    'TU_LUAN': EntityExamForm.TU_LUAN,
    'KET_HOP': EntityExamForm.KET_HOP,
    'FORM_2018': EntityExamForm.FORM_2018,
    'FORM_2025': EntityExamForm.FORM_2025
  };
  return mapping[form as ExamForm] || EntityExamForm.TRAC_NGHIEM;
}

function mapExamTypeToPrisma(type: EntityExamType): ExamType {
  const mapping: Record<EntityExamType, ExamType> = {
    [EntityExamType.DRAFT]: 'DRAFT',
    [EntityExamType.PUBLISHED]: 'PUBLISHED',
    [EntityExamType.ARCHIVED]: 'ARCHIVED',
    [EntityExamType.PRACTICE]: 'PRACTICE',
    [EntityExamType.ASSESSMENT]: 'ASSESSMENT'
  };
  
  return mapping[type] || 'DRAFT';
}

function mapExamTypeToEntity(type: string): EntityExamType {
  const mapping: Record<ExamType, EntityExamType> = {
    'DRAFT': EntityExamType.DRAFT,
    'PUBLISHED': EntityExamType.PUBLISHED,
    'ARCHIVED': EntityExamType.ARCHIVED,
    'PRACTICE': EntityExamType.PRACTICE,
    'ASSESSMENT': EntityExamType.ASSESSMENT
  };
  
  return mapping[type as ExamType] || EntityExamType.DRAFT;
}

function mapExamCategoryToPrisma(category: EntityExamCategory): ExamCategory {
  return category as unknown as ExamCategory;
}

function mapExamCategoryToEntity(category: string): EntityExamCategory {
  return category as unknown as EntityExamCategory;
}

@Injectable()
export class PrismaExamRepository implements IExamRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Map Prisma Exam object to internal ExamEntityModel
   * @param prismaData Prisma exam data with included relations
   * @returns ExamEntityModel
   */
  private mapToPrismaToEntityModel(prismaData: PrismaExamPayload): ExamEntityModel {
    // Convert JsonValue to ExamDescription or null
    const description: ExamDescription | null = 
      prismaData.description ? prismaData.description as unknown as ExamDescription : null;
      
    // Chuyển đổi dữ liệu từ Prisma sang Entity
    const examEntity: ExamEntityModel = {
      id: prismaData.id,
      title: prismaData.title,
      description,
      questions: [], // Sẽ được cập nhật sau khi truy vấn quan hệ exam_questions
      duration: prismaData.duration,
      difficulty: mapDifficultyToEntity(prismaData.difficulty),
      subject: prismaData.subject,
      grade: prismaData.grade,
      form: mapExamFormToEntity(prismaData.form),
      createdBy: prismaData.createdBy,
      averageScore: prismaData.averageScore,
      updatedAt: prismaData.updatedAt,
      createdAt: prismaData.createdAt,
      tags: prismaData.tags,
      examCategory: mapExamCategoryToEntity(prismaData.examCategory),
      type: mapExamTypeToEntity(prismaData.type),
    };
    
    return examEntity;
  }

  /**
   * Tìm kiếm tất cả bài thi với bộ lọc
   * @param filters Các tham số lọc và phân trang
   * @returns Danh sách bài thi đã phân trang
   */
  async findAll(filters: ExamFilterDto): Promise<{ exams: Exam[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      subject,
      grade,
      difficulty,
      examCategory,
      form,
      createdBy,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const skip = (page - 1) * limit;
    
    // Xây dựng điều kiện where
    const where: Prisma.ExamWhereInput = {};
    
    if (subject) {
      where.subject = subject;
    }
    
    if (grade !== undefined) {
      where.grade = grade;
    }
    
    if (difficulty) {
      // Chuyển đổi từ entity enum sang prisma enum
      where.difficulty = mapDifficultyToPrisma(difficulty);
    }
    
    if (examCategory) {
      // Chuyển đổi từ entity enum sang prisma enum
      where.examCategory = mapExamCategoryToPrisma(examCategory);
    }
    
    if (form) {
      // Chuyển đổi từ entity enum sang prisma enum
      where.form = mapExamFormToPrisma(form);
    }
    
    if (createdBy) {
      where.createdBy = createdBy;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }
    
    // Xác định thứ tự sắp xếp
    const orderBy: Prisma.ExamOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };
    
    // Thực hiện truy vấn với transaction để đảm bảo tính nhất quán
    const [exams, total] = await this.prisma.$transaction([
      this.prisma.exam.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          creator: true,
          examResults: true,
          lessons: true,
        },
      }),
      this.prisma.exam.count({
        where,
      }),
    ]);
    
    // Chuyển đổi từ internal model sang Exam
    const examEntities = exams.map(exam => {
      const entityModel = this.mapToPrismaToEntityModel(exam as PrismaExamPayload);
      return mapToExternalExam(entityModel);
    });
    
    return {
      exams: examEntities,
      total,
    };
  }

  /**
   * Tìm bài thi theo ID
   * @param id ID của bài thi
   * @returns Bài thi nếu tìm thấy, null nếu không
   */
  async findById(id: string): Promise<Exam | null> {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: {
        creator: true,
        examResults: true,
        lessons: true,
      },
    });
    
    if (!exam) {
      return null;
    }
    
    const entityModel = this.mapToPrismaToEntityModel(exam as PrismaExamPayload);
    return mapToExternalExam(entityModel);
  }

  /**
   * Tìm bài thi theo người tạo
   * @param creatorId ID của người tạo
   * @returns Danh sách bài thi
   */
  async findByCreator(creatorId: string): Promise<Exam[]> {
    const exams = await this.prisma.exam.findMany({
      where: { createdBy: creatorId },
      include: {
        creator: true,
        examResults: true,
        lessons: true,
      },
    });
    
    return exams.map(exam => {
      const entityModel = this.mapToPrismaToEntityModel(exam as PrismaExamPayload);
      return mapToExternalExam(entityModel);
    });
  }

  /**
   * Tìm bài thi theo môn học
   * @param subject Tên môn học
   * @returns Danh sách bài thi
   */
  async findBySubject(subject: string): Promise<Exam[]> {
    const exams = await this.prisma.exam.findMany({
      where: { subject },
      include: {
        creator: true,
        examResults: true,
        lessons: true,
      },
    });
    
    return exams.map(exam => {
      const entityModel = this.mapToPrismaToEntityModel(exam as PrismaExamPayload);
      return mapToExternalExam(entityModel);
    });
  }

  /**
   * Tìm bài thi theo khối lớp
   * @param grade Khối lớp
   * @returns Danh sách bài thi
   */
  async findByGrade(grade: number): Promise<Exam[]> {
    const exams = await this.prisma.exam.findMany({
      where: { grade },
      include: {
        creator: true,
        examResults: true,
        lessons: true,
      },
    });
    
    return exams.map(exam => {
      const entityModel = this.mapToPrismaToEntityModel(exam as PrismaExamPayload);
      return mapToExternalExam(entityModel);
    });
  }

  /**
   * Create a new exam
   * @param data Exam creation data
   * @returns Created exam entity
   */
  async create(data: Partial<Exam>): Promise<Exam> {
    try {
      // Chuyển đổi từ Exam sang dữ liệu Prisma
      const { questions, prismaData } = mapExamToPrismaData(data);
      
      // Đảm bảo có createdBy để kết nối với user
      const extendedData = data as ExtendedExam;
      const createdById = extendedData.createdBy || data.userId?.toString();
      if (!createdById) {
        throw new Error('Missing createdBy or userId');
      }
      
      // Tạo Exam với prismaData + creator
      const createdExam = await this.prisma.exam.create({
        data: {
          ...prismaData,
          creator: {
            connect: { id: createdById }
          }
        },
        include: {
          creator: true,
          examResults: true,
          lessons: true,
        },
      });
      
      // Nếu có questions, tạo các liên kết giữa exam và questions
      if (questions && questions.length > 0) {
        // Tạo đối tượng dữ liệu không kiểu
        const examQuestionsData: ExamQuestionData[] = questions.map((questionId, index) => ({
          examId: createdExam.id,
          questionId: String(questionId),
          order: index,
          score: 1.0
        }));
        
        // Thêm dữ liệu vào database
        for (const data of examQuestionsData) {
          await this.prisma.$executeRaw`
            INSERT INTO "exam_questions" ("id", "examId", "questionId", "order", "score", "createdAt", "updatedAt")
            VALUES (gen_random_uuid(), ${data.examId}, ${data.questionId}, ${data.order}, ${data.score}, NOW(), NOW())
          `;
        }
      }
      
      // Map sang entity và trả về
      const entityModel = this.mapToPrismaToEntityModel(createdExam as PrismaExamPayload);
      
      // Gán lại questions nếu có
      if (questions && questions.length > 0) {
        entityModel.questions = questions;
      }
      
      return mapToExternalExam(entityModel);
    } catch (error) {
      console.error('Error in create:', error);
      throw new Error('Could not create exam');
    }
  }

  /**
   * Update an existing exam
   * @param id Exam ID to update
   * @param data Update data
   * @returns Updated exam entity
   */
  async update(id: string, data: Partial<Exam>): Promise<Exam> {
    try {
      // Chuyển đổi từ Exam sang dữ liệu Prisma
      const { questions, prismaData } = mapExamToPrismaData(data);
      
      // dataToUpdate đã loại bỏ creator (nếu có)
      const dataToUpdate = prismaData;
      
      // Cập nhật exam (không bao gồm questions)
      const updatedExam = await this.prisma.exam.update({
        where: { id },
        data: dataToUpdate,
        include: {
          creator: true,
          examResults: true,
          lessons: true,
        },
      });
      
      // Nếu có questions, cập nhật quan hệ Exam-Question
      if (questions && questions.length > 0) {
        // Xóa tất cả các liên kết ExamQuestion hiện tại
        await this.prisma.$executeRaw`DELETE FROM "exam_questions" WHERE "examId" = ${id}`;
        
        // Tạo các liên kết mới
        const examQuestionsData: ExamQuestionData[] = questions.map((questionId, index) => ({
          examId: id,
          questionId: String(questionId),
          order: index,
          score: 1.0
        }));
        
        // Thêm dữ liệu vào database
        for (const data of examQuestionsData) {
          await this.prisma.$executeRaw`
            INSERT INTO "exam_questions" ("id", "examId", "questionId", "order", "score", "createdAt", "updatedAt")
            VALUES (gen_random_uuid(), ${data.examId}, ${data.questionId}, ${data.order}, ${data.score}, NOW(), NOW())
          `;
        }
      }
      
      // Map sang entity và trả về
      const entityModel = this.mapToPrismaToEntityModel(updatedExam as PrismaExamPayload);
      
      // Gán lại questions nếu có
      if (questions && questions.length > 0) {
        entityModel.questions = questions;
      }
      
      return mapToExternalExam(entityModel);
    } catch (error) {
      console.error('Error in update:', error);
      throw new Error('Could not update exam');
    }
  }

  /**
   * Xóa bài thi
   * @param id ID của bài thi
   * @returns true nếu xóa thành công
   */
  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.exam.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      // Xử lý trường hợp không tìm thấy bài thi hoặc lỗi khác
      console.error('Error deleting exam:', error);
      return false;
    }
  }

  /**
   * Cập nhật điểm trung bình cho bài thi
   * @param id ID của bài thi
   * @param score Điểm trung bình mới
   * @returns Bài thi đã cập nhật
   */
  async updateAverageScore(id: string, score: number): Promise<Exam> {
    const updatedExam = await this.prisma.exam.update({
      where: { id },
      data: {
        averageScore: score,
      },
      include: {
        creator: true,
        examResults: true,
        lessons: true,
      },
    });
    
    const entityModel = this.mapToPrismaToEntityModel(updatedExam as PrismaExamPayload);
    return mapToExternalExam(entityModel);
  }

  private toPrismaExam(exam: ExamEntityModel): PrismaExamPayload {
    // Chuyển đổi các trường từ model thành dữ liệu prisma
    const prismaData: Prisma.ExamCreateInput = {
      id: exam.id,
      title: exam.title,
      description: exam.description as unknown as Prisma.InputJsonValue,
      duration: exam.duration,
      difficulty: mapDifficultyToPrisma(exam.difficulty),
      subject: exam.subject,
      grade: exam.grade,
      form: mapExamFormToPrisma(exam.form),
      tags: exam.tags,
      examCategory: mapExamCategoryToPrisma(exam.examCategory),
      type: mapExamTypeToPrisma(exam.type),
      averageScore: exam.averageScore,
      // Thêm trường creator bắt buộc
      creator: {
        connect: { id: exam.createdBy }
      }
    };

    // Tạo một kết quả có cấu trúc tương tự với PrismaExamPayload
    return {
      ...prismaData,
      id: exam.id,
      createdBy: exam.createdBy,
      createdAt: exam.createdAt,
      updatedAt: exam.updatedAt,
      creator: {
        id: exam.createdBy,
        createdAt: exam.createdAt,
        updatedAt: exam.updatedAt,
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'STUDENT' as any
      },
      examResults: [],
      lessons: []
    } as unknown as PrismaExamPayload;
  }
} 