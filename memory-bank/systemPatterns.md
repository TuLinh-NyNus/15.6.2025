# System Patterns

## 1. Tổng quan kiến trúc

### 1.1. Kiến trúc Monorepo
- **Quản lý**: Turborepo
- **Cấu trúc chính**:
  - `apps/` - Các ứng dụng độc lập (web, api)
  - `packages/` - Shared libraries (ui, utils, config, database, dto, interfaces, entities)

### 1.2. Công nghệ chính
- **Frontend**: Next.js, React, TypeScript, TailwindCSS, Shadcn UI
- **Backend**: NestJS, Prisma ORM
- **Database**: PostgreSQL
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger OpenAPI
- **Testing**: Jest, React Testing Library, Cypress
- **CI/CD**: GitHub Actions, Docker

## 2. Kiến trúc Backend

### 2.1. Layers
1. **Controllers**: Xử lý HTTP requests và định nghĩa API endpoints
2. **Services**: Chứa business logic, tương tác với repositories
3. **Repositories**: Tương tác với database thông qua Prisma
4. **DTOs**: Định nghĩa input/output schemas
5. **Entities**: Mô hình hóa các đối tượng trong hệ thống

### 2.2. Cấu trúc Module
- Mỗi tính năng có module riêng (Users, Courses, Exams, v.v.)
- **Vị trí**: `src/modules/`
- **Cấu trúc thư mục module**:
  ```
  module-name/
  ├── module-name.module.ts
  ├── controllers/
  │   ├── module-name.controller.ts
  │   ├── module-feature.controller.ts
  ├── services/
  │   ├── module-name.service.ts
  │   ├── feature.service.ts
  ├── dto/
  ├── entities/
  ├── interfaces/
  ├── decorators/
  ├── guards/
  ├── pipes/ (nếu cần)
  └── filters/ (nếu cần)
  ```

### 2.3. Quy ước đặt tên
- **Tên module**: Dạng số nhiều (users, courses, enrollments)
- **Tên file**: Kebab-case không viết tắt
- **Class names**: PascalCase với suffix tương ứng (UsersController, UsersService)
- **Method names**: camelCase (findAll, findOne, create, update)
- **Repository naming**: Theo entity (UsersRepository, CoursesRepository)

## 3. Database Patterns

### 3.1. Công nghệ & Chiến lược
- **ORM**: Prisma
- **Migration Strategy**: Prisma migrations
- **Schema Organization**: Phân chia theo domains
- **Relationships**: References và ID relationships
- **Indexing**: Indices cho query patterns phổ biến
- **Soft Deletes**: Đánh dấu records thay vì xóa vĩnh viễn

### 3.2. Nguyên tắc Migration
1. **Backward Compatibility**: Đảm bảo không phá vỡ dữ liệu hiện có
2. **Safe Defaults**: Cung cấp giá trị mặc định cho trường mới
3. **Incremental Changes**: Chia thay đổi lớn thành nhiều migration nhỏ
4. **Rollback Plan**: Luôn có kế hoạch rollback

### 3.3. Schema Optimization
- **Indices**: Thêm cho các truy vấn phổ biến
- **Đa ngôn ngữ**: Các bảng translation riêng
- **SEO**: Các trường meta và slug
- **Tracking**: TimeSpent, status, lastLogin

## 4. Repository Pattern

### 4.1. Base Repository
```typescript
export interface IBaseRepository<T, ID> {
  create(data: Partial<T>): Promise<T>;
  findById(id: ID): Promise<T | null>;
  findAll(options?: FindAllOptions<T>): Promise<PaginatedResult<T>>;
  update(id: ID, data: Partial<T>): Promise<T>;
  remove(id: ID): Promise<void>;
  count(filter?: FilterOptions<T>): Promise<number>;
  exists(filter: FilterOptions<T>): Promise<boolean>;
  transaction<R>(fn: (repo: this) => Promise<R>): Promise<R>;
}
```

### 4.2. Cấu trúc tổ chức
**Interfaces**:
```
packages/interfaces/src/repositories/
├── base/
├── user/
├── course/
├── exam/
└── index.ts
```

**Implementations**:
```
packages/database/src/repositories/
├── base/
├── user/
├── course/
├── exam/
└── index.ts
```

### 4.3. Nguyên tắc thiết kế
- **Type Safety**: Sử dụng Generics và tránh `any`
- **Domain-Specific Methods**: Mỗi repository có phương thức đặc thù
- **Bulk Operations**: Hỗ trợ thao tác với nhiều records
- **Transaction Support**: Helper classes và phương thức hỗ trợ

### 4.4. Repository Implementation với Prisma

```typescript
export class PrismaQuestionRepository implements IQuestionRepository {
  constructor(private prisma: PrismaService) {}

  /**
   * Entity Mapping Pattern - Chuyển đổi từ Prisma model sang Domain entity
   */
  private mapToEntity(prismaQuestion: PrismaQuestion): Question {
    return new Question({
      id: prismaQuestion.id,
      rawContent: prismaQuestion.rawContent,        // 1. RawContent: Nội dung gốc LaTex của câu hỏi
      questionId: prismaQuestion.questionId,        // 2. QuestionID: Mục đích dùng để phân loại câu hỏi
      subcount: prismaQuestion.subcount,            // 3. Subcount: Mục đích dành cho học sinh dễ truy vấn câu hỏi
      type: prismaQuestion.type as unknown as QuestionType, // 4. Type: Loại câu hỏi (MC, TF, SA, ES)
      source: prismaQuestion.source,                // 5. Source: Nguồn câu hỏi
      content: prismaQuestion.content,              // 6. Content: Nội dung câu hỏi đã xử lý
      answers: prismaQuestion.answers as unknown as QuestionAnswer[], // 7. Answers: Danh sách đáp án
      correctAnswer: prismaQuestion.correctAnswer as unknown as string[], // 8. CorrectAnswer: Đáp án đúng
      solution: prismaQuestion.solution,            // 9. Solution: Lời giải câu hỏi
      images: prismaQuestion.question_images?.map(img => this.mapImageToEntity(img)), // 10. Images
      tags: prismaQuestion.QuestionToTags?.map(tag => tag.tag.name), // 11. Tags: Nhãn phân loại
      usageCount: prismaQuestion.usageCount,        // 12. UsageCount: Số lần sử dụng
      creatorId: prismaQuestion.creatorId,          // 13. Creator: ID của người tạo
      status: prismaQuestion.status as unknown as QuestionStatus, // 14. Status: Trạng thái câu hỏi
      examRefs: prismaQuestion.examRefs as unknown as string[], // 15. ExamRefs: Tham chiếu đến các bài kiểm tra
      feedback: prismaQuestion.feedback,            // 16. Feedback: Số lần câu hỏi này được feedback
      difficulty: prismaQuestion.difficulty as unknown as QuestionDifficulty, // Độ khó của câu hỏi
      createdAt: prismaQuestion.createdAt,
      updatedAt: prismaQuestion.updatedAt
    });
  }

  /**
   * Triển khai method từ interface
   */
  async findById(id: string): Promise<Question | null> {
    const question = await this.prisma.question.findUnique({
      where: { id }
    });

    return question ? this.mapToEntity(question as unknown as PrismaQuestion) : null;
  }

  /**
   * Triển khai findMany với các options tìm kiếm
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
}
```

### 4.5. Repository Registration và Dependency Injection

```typescript
// Đăng ký repositories trong module
@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: 'IUserRepository',
      useClass: PrismaUserRepository,
    },
    {
      provide: 'ICourseRepository',
      useClass: PrismaCourseRepository,
    },
    {
      provide: 'IQuestionRepository',
      useClass: PrismaQuestionRepository,
    }
  ],
  exports: [
    'IUserRepository',
    'ICourseRepository',
    'IQuestionRepository'
  ],
})
export class DatabaseModule {}

// Service sử dụng repository thông qua injection
@Injectable()
export class QuestionsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('IQuestionRepository') private readonly questionRepository: IQuestionRepository
  ) {}

  async findById(id: string) {
    return this.questionRepository.findById(id);
  }
}
```

### 4.6. Advanced Query Patterns

#### 4.6.1. Raw Query Pattern

Sử dụng raw queries khi cần performance hoặc xử lý queries phức tạp mà Prisma API không hỗ trợ đầy đủ.

```typescript
async findAll(filters: QuestionFilterDto) {
  // Trích xuất các giá trị từ filter
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;
  const skip = (page - 1) * limit;

  // Xây dựng điều kiện tìm kiếm
  const where: QuestionQueryWhere = this.buildWhereConditions(filters);

  // Thực hiện truy vấn bằng raw SQL để tối ưu performance
  const countQuery = Prisma.sql`
    SELECT COUNT(*) FROM "Question"
    WHERE ${Prisma.raw(this.buildWhereClause(where))}
  `;

  const questionsQuery = Prisma.sql`
    SELECT q.*, u.id as "creatorId", u.email, u."fullName"
    FROM "Question" q
    LEFT JOIN "User" u ON q."creatorId" = u.id
    WHERE ${Prisma.raw(this.buildWhereClause(where))}
    ORDER BY q."createdAt" DESC
    LIMIT ${limit} OFFSET ${skip}
  `;

  // Thực hiện song song các truy vấn với type cụ thể
  const [countResult, questions] = await Promise.all([
    this.prisma.$queryRaw<[{ count: string }]>(countQuery),
    this.prisma.$queryRaw<unknown[]>(questionsQuery),
  ]);

  const total = parseInt(countResult[0]?.count || '0', 10);

  return {
    questions,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// Hàm hỗ trợ xây dựng mệnh đề WHERE cho raw query
private buildWhereClause(where: QuestionQueryWhere): string {
  const conditions: string[] = [];

  if (where.OR?.length) {
    const orConditions = where.OR.map(condition => {
      const field = Object.keys(condition)[0];
      const value = condition[field]?.contains;
      return `${field} ILIKE '%${value}%'`;
    });
    conditions.push(`(${orConditions.join(' OR ')})`);
  }

  // Các điều kiện khác

  return conditions.length ? conditions.join(' AND ') : '1=1';
}
```

#### 4.6.2. Prisma Filter Builder Pattern

```typescript
// Xây dựng điều kiện tìm kiếm với Prisma API
private buildPrismaFilter(filters: QuestionFilterDto): Prisma.QuestionWhereInput {
  const where: Prisma.QuestionWhereInput = {};

  if (filters.search) {
    where.OR = [
      { content: { contains: filters.search, mode: 'insensitive' } },
      { rawContent: { contains: filters.search, mode: 'insensitive' } },
      { source: { contains: filters.search, mode: 'insensitive' } },
      { questionId: { contains: filters.search, mode: 'insensitive' } },
      { subcount: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters.types?.length) {
    where.type = { in: filters.types };
  }

  if (filters.statuses?.length) {
    where.status = { in: filters.statuses };
  }

  if (filters.difficulties?.length) {
    where.difficulty = { in: filters.difficulties };
  }

  if (filters.creatorId) {
    where.creatorId = filters.creatorId;
  }

  if (filters.tags?.length) {
    where.QuestionToTags = {
      some: {
        tagId: { in: filters.tags },
      },
    };
  }

  if (filters.questionId) {
    where.questionId = { contains: filters.questionId, mode: 'insensitive' };
  }

  if (filters.grade) {
    where.questionId = { startsWith: filters.grade, mode: 'insensitive' };
  }

  if (filters.subject) {
    where.questionId = {
      startsWith: filters.grade ? `${filters.grade}${filters.subject}` : filters.subject,
      mode: 'insensitive'
    };
  }

  if (filters.chapter) {
    const prefix = filters.grade && filters.subject
      ? `${filters.grade}${filters.subject}${filters.chapter}`
      : filters.subject
        ? `${filters.subject}${filters.chapter}`
        : filters.chapter;
    where.questionId = { startsWith: prefix, mode: 'insensitive' };
  }

  if (filters.level) {
    const prefix = filters.grade && filters.subject && filters.chapter
      ? `${filters.grade}${filters.subject}${filters.chapter}${filters.level}`
      : filters.subject && filters.chapter
        ? `${filters.subject}${filters.chapter}${filters.level}`
        : filters.chapter
          ? `${filters.chapter}${filters.level}`
          : filters.level;
    where.questionId = { startsWith: prefix, mode: 'insensitive' };
  }

  if (filters.lesson) {
    const prefix = filters.grade && filters.subject && filters.chapter && filters.level
      ? `${filters.grade}${filters.subject}${filters.chapter}${filters.level}${filters.lesson}`
      : filters.subject && filters.chapter && filters.level
        ? `${filters.subject}${filters.chapter}${filters.level}${filters.lesson}`
        : filters.chapter && filters.level
          ? `${filters.chapter}${filters.level}${filters.lesson}`
          : filters.level
            ? `${filters.level}${filters.lesson}`
            : filters.lesson;
    where.questionId = { startsWith: prefix, mode: 'insensitive' };
  }

  if (filters.form) {
    where.questionId = { endsWith: filters.form, mode: 'insensitive' };
  }

  return where;
}
```

### 4.7. Transaction Pattern

Sử dụng transactions khi cần đảm bảo tính toàn vẹn giữa nhiều thao tác database.

```typescript
async create(data: CreateQuestionDto, creatorId: string) {
  const { tags = [], images = [], ...questionData } = data;

  return this.prisma.$transaction(async (tx) => {
    // Tạo câu hỏi
    const question = await tx.question.create({
      data: {
        rawContent: questionData.rawContent,        // 1. RawContent: Nội dung gốc LaTex của câu hỏi
        questionId: questionData.questionId,        // 2. QuestionID: Mục đích dùng để phân loại câu hỏi
        subcount: questionData.subcount,            // 3. Subcount: Mục đích dành cho học sinh dễ truy vấn câu hỏi
        type: questionData.type,                    // 4. Type: Loại câu hỏi (MC, TF, SA, ES)
        source: questionData.source,                // 5. Source: Nguồn câu hỏi
        content: questionData.content,              // 6. Content: Nội dung câu hỏi đã xử lý
        answers: questionData.answers,              // 7. Answers: Danh sách đáp án
        correctAnswer: questionData.correctAnswer,  // 8. CorrectAnswer: Đáp án đúng
        solution: questionData.solution,            // 9. Solution: Lời giải câu hỏi
        usageCount: 0,                              // 12. UsageCount: Số lần sử dụng
        creatorId: creatorId,                       // 13. Creator: ID của người tạo
        status: QuestionStatus.ACTIVE,              // 14. Status: Trạng thái câu hỏi
        examRefs: [],                               // 15. ExamRefs: Tham chiếu đến các bài kiểm tra
        feedback: 0,                                // 16. Feedback: Số lần câu hỏi này được feedback
        difficulty: questionData.difficulty,        // Độ khó của câu hỏi
      }
    });

    // Thêm tags nếu có
    if (tags.length > 0) {
      await Promise.all(
        tags.map(tagId =>
          tx.questionTag.create({
            data: {
              questionId: question.id,
              tagId
            }
          })
        )
      );
    }

    // Thêm images nếu có
    if (images.length > 0) {
      await Promise.all(
        images.map(image =>
          tx.question_images.create({
            data: {
              id: crypto.randomUUID(),
              questionId: question.id,
              url: image.url,
              type: image.type
            }
          })
        )
      );
    }

    // Tạo phiên bản đầu tiên
    await tx.question_versions.create({
      data: {
        id: crypto.randomUUID(),
        questionId: question.id,
        version: 1,
        content: questionData.content,
        rawContent: questionData.rawContent,
        type: questionData.type,
        answers: questionData.answers,
        correctAnswer: questionData.correctAnswer,
        solution: questionData.solution,
        changedById: creatorId,
        changedAt: new Date()
      }
    });

    return this.questionRepository.findById(question.id);
  });
}
```

### 4.8. Entity và Data Interface Patterns

```typescript
// Domain Entity (Model trong domain)
export class Question {
  id: string;
  rawContent: string;        // 1. RawContent: Nội dung gốc LaTex của câu hỏi
  questionId?: string | null; // 2. QuestionID: Mục đích dùng để phân loại câu hỏi
  subcount?: string | null;   // 3. Subcount: Mục đích dành cho học sinh dễ truy vấn câu hỏi
  type: QuestionType;        // 4. Type: Loại câu hỏi (MC, TF, SA, ES)
  source?: string | null;     // 5. Source: Nguồn câu hỏi
  content: string;           // 6. Content: Nội dung câu hỏi đã xử lý
  answers?: QuestionAnswer[] | null; // 7. Answers: Danh sách đáp án của câu hỏi để chọn
  correctAnswer?: string[] | null;   // 8. CorrectAnswer: Đáp án đúng
  solution?: string | null;   // 9. Solution: Lời giải câu hỏi
  images?: QuestionImage[] | null; // 10. Images: Danh sách hình ảnh
  tags?: string[] | null;     // 11. Tags: Nhãn phân loại
  usageCount: number;        // 12. UsageCount: Số lần sử dụng
  creatorId: string;         // 13. Creator: ID của người tạo
  status: QuestionStatus;    // 14. Status: Trạng thái câu hỏi
  examRefs?: string[] | null; // 15. ExamRefs: Tham chiếu đến các bài kiểm tra
  feedback: number;          // 16. Feedback: Số lần câu hỏi này được feedback
  difficulty?: QuestionDifficulty | null; // Độ khó của câu hỏi (bổ sung)
  createdAt: Date;           // Thời gian tạo
  updatedAt: Date;           // Thời gian cập nhật

  constructor(partial: Partial<Question>) {
    Object.assign(this, partial);
  }
}

// Data Interface (cho repositories)
export interface QuestionData {
  id?: string;
  rawContent: string;        // 1. RawContent: Nội dung gốc LaTex của câu hỏi
  questionId?: string;       // 2. QuestionID: Mục đích dùng để phân loại câu hỏi
  subcount?: string;         // 3. Subcount: Mục đích dành cho học sinh dễ truy vấn câu hỏi
  type: QuestionType;        // 4. Type: Loại câu hỏi (MC, TF, SA, ES)
  source?: string;           // 5. Source: Nguồn câu hỏi
  content: string;           // 6. Content: Nội dung câu hỏi đã xử lý
  answers?: QuestionAnswerData[]; // 7. Answers: Danh sách đáp án của câu hỏi để chọn
  correctAnswer?: string[];  // 8. CorrectAnswer: Đáp án đúng
  solution?: string;         // 9. Solution: Lời giải câu hỏi
  images?: QuestionImageData[]; // 10. Images: Danh sách hình ảnh
  tags?: string[];           // 11. Tags: Nhãn phân loại
  usageCount?: number;       // 12. UsageCount: Số lần sử dụng
  creatorId: string;         // 13. Creator: ID của người tạo
  status?: QuestionStatus;   // 14. Status: Trạng thái câu hỏi
  examRefs?: string[];       // 15. ExamRefs: Tham chiếu đến các bài kiểm tra
  feedback?: number;         // 16. Feedback: Số lần câu hỏi này được feedback
  difficulty?: QuestionDifficulty; // Độ khó của câu hỏi (bổ sung)
}

// Repository Interface
export interface IQuestionRepository {
  findById(id: string): Promise<Question | null>;
  findAll(filters: QuestionFilterDto): Promise<{ questions: Question[]; total: number }>;
  create(data: CreateQuestionDto): Promise<Question>;
  update(id: string, data: UpdateQuestionDto): Promise<Question>;
  delete(id: string): Promise<boolean>;
  addTag(questionId: string, tagId: string): Promise<void>;
  removeTag(questionId: string, tagId: string): Promise<void>;
  addImage(data: { questionId: string; url: string; type: string }): Promise<QuestionImage>;
  removeImage(imageId: string): Promise<void>;
  createVersion(questionId: string, data: CreateQuestionVersionDto): Promise<QuestionVersion>;
  getVersions(questionId: string): Promise<QuestionVersion[]>;
  getVersionById(questionId: string, version: number): Promise<QuestionVersion | null>;
}
```

### 4.9. Repository Error Handling Patterns

```typescript
async update(id: string, data: Partial<Question>): Promise<Question> {
  try {
    const question = await this.prisma.question.update({
      where: { id },
      data: data as unknown as Prisma.QuestionUpdateInput
    });

    return this.mapToEntity(question as unknown as PrismaQuestion);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        // Record not found
        throw new EntityNotFoundException(`Question with id ${id} not found`);
      }
      if (error.code === 'P2002') {
        // Unique constraint failed
        throw new UniqueConstraintException('A question with these details already exists');
      }
      // Xử lý các Prisma error codes khác
    }

    // Nếu không phải là Prisma error đã biết, throw lỗi generic
    throw new RepositoryException('Failed to update question', error);
  }
}
```

### 4.10. Repository Testing Patterns

```typescript
describe('PrismaQuestionRepository', () => {
  let repository: PrismaQuestionRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaQuestionRepository,
        {
          provide: PrismaService,
          useValue: {
            question: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            $transaction: jest.fn((callback) => callback({
              question: {
                create: jest.fn(),
              },
              questionTag: {
                create: jest.fn(),
              },
              questionVersion: {
                create: jest.fn(),
              }
            })),
          },
        },
      ],
    }).compile();

    repository = module.get<PrismaQuestionRepository>(PrismaQuestionRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('findById', () => {
    it('should return a question when it exists', async () => {
      // Test implementation
    });

    it('should return null when question does not exist', async () => {
      // Test implementation
    });
  });
});
```

## 5. Controller Pattern

### 5.1. Nguyên tắc thiết kế API
- **Phân chia chức năng**: Controllers nhỏ, tập trung
- **Phân quyền**: Guards và Decorators để bảo vệ endpoints
- **REST Conventions**: URLs và HTTP methods sử dụng đúng mục đích
- **Documentation**: Swagger decorators cho tất cả endpoints
- **Status Codes**: Sử dụng nhất quán (200, 201, 400, 401, 403, 404)

### 5.2. Dependency Injection
- Constructor injection
- Interfaces thay vì concrete classes
- Import từ shared packages

## 6. Frontend Architecture

### 6.1. Cấu trúc dự án
- **App Router**: Định tuyến dựa trên file system
- **Feature-First Organization**:
  ```
  app/
  features/
  ├── auth/
  ├── dashboard/
  ├── courses/
  └── exams/
  components/
  ├── ui/
  ├── forms/
  └── layout/
  hooks/
  lib/
  ```
- **Shared UI**: Shadcn UI + custom components
- **Navigation**: Layout-based với client/server components phân tách

### 6.2. State Management
- **Server State**: React Query cho data fetching và caching
- **Client State**: React Context cho global state đơn giản
- **Form State**: React Hook Form + Zod cho validation
- **UI State**: Local state với useState/useReducer

### 6.3. Component Patterns
- **Composition Pattern**: Ưu tiên component composition
- **Render Props**: Sử dụng cho component flexibility
- **HOC Pattern**: Sử dụng có chọn lọc cho cross-cutting concerns
- **Custom Hooks**: Trích xuất logic phức tạp ra hooks riêng
- **Controlled vs Uncontrolled**: Ưu tiên controlled khi cần validation

### 6.4. Performance Optimizations
- **Code Splitting**: Dynamic imports và route-based splitting
- **Memoization**: React.memo, useMemo, useCallback cho expensive operations
- **Image Optimization**: Next.js Image component
- **Lazy Loading**: Lazy loading components và images
- **Virtualization**: Dùng cho danh sách dài

## 7. AI và Personalized Learning

### 7.1. Mô hình kiến trúc AI
- **Recommendation Engine**: Gợi ý khóa học và bài học dựa trên hành vi
- **Learning Style Analysis**: Phân tích phong cách học tập cá nhân
- **Content Classification**: Phân loại nội dung học tập
- **Difficulty Prediction**: Dự đoán độ khó của nội dung cho người dùng

### 7.2. User Learning Profiles
- **Learning Style Assessment**: Đánh giá VARK (Visual, Auditory, Reading, Kinesthetic)
- **Interest Tracking**: Theo dõi và cập nhật sở thích học tập
- **Progress Analytics**: Phân tích tiến độ và hiệu suất
- **Adaptive Path**: Điều chỉnh lộ trình học tập tự động

### 7.3. Recommendation System
```typescript
enum RecommendationType {
  PERSONALIZED = 'PERSONALIZED',
  SIMILAR_COURSES = 'SIMILAR_COURSES',
  TRENDING = 'TRENDING',
  NEW_RELEASES = 'NEW_RELEASES',
  BASED_ON_INTERESTS = 'BASED_ON_INTERESTS',
  CONTINUE_LEARNING = 'CONTINUE_LEARNING',
}
```

- **Personalized Recommendations**: Dựa trên lịch sử học tập và preferences
- **Content-Based Filtering**: Gợi ý nội dung tương tự
- **Collaborative Filtering**: Gợi ý dựa trên người dùng tương tự
- **Hybrid Approach**: Kết hợp content-based và collaborative

## 8. Testing Strategy

### 8.1. Testing Pyramid
- **Unit Tests**: Jest + testing-library (> 80% coverage)
- **Integration Tests**: Jest + supertest + test database
- **E2E Tests**: Cypress cho frontend, supertest cho API endpoints
- **Visual Testing**: Storybook + Chromatic

### 8.2. Testing Environments
- **In-memory Database**: Cho unit và integration tests
- **Container-based Testing**: Docker containers cho phức tạp
- **Pre-deployment Testing**: Testing trên môi trường staging

### 8.3. Test Organization
- **Tests theo structure code**: Mỗi component/module có tests riêng
- **Test Helpers**: Reusable utilities và mocks
- **Test Fixtures**: Standardized test data factories
- **Test Isolation**: Mỗi test phải độc lập và không ảnh hưởng tests khác

## 9. CI/CD Pipeline

### 9.1. Continuous Integration
```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌───────────┐    ┌──────────┐
│  Commit  │───►│   Build  │───►│   Test   │───►│  Staging  │───►│Production│
│   Code   │    │          │    │          │    │ Deployment│    │Deployment│
└──────────┘    └──────────┘    └──────────┘    └───────────┘    └──────────┘
```

- **Linting & Type Checking**: ESLint, TypeScript
- **Unit & Integration Tests**: Jest
- **Build Verification**: Turbo build caching
- **Security Scanning**: Dependency checking

### 9.2. Deployment Strategy
- **Environments**: Development, Integration, Staging, Production
- **Deployment Approaches**: Blue/Green, Canary Releases
- **Database Migrations**: Automated với rollback capability
- **Rollback Triggers**: Metrics, tests, monitors

### 9.3. Monitoring & Feedback
- **Post-deployment Testing**: Smoke tests
- **Performance Monitoring**: Response times, error rates
- **User Behavior Analytics**: Usage patterns, feature adoption
- **Error Tracking**: Centralized logging and alerting

## 10. Validation & Error Handling

### 10.1. Validation Patterns
- **Input Validation**: class-validator decorators
- **Transformation**: class-transformer
- **API Documentation**: Swagger decorators

### 10.2. Error Handling
- **Global Exception Filter**: Xử lý exceptions thống nhất
- **Custom Exceptions**: Exceptions riêng cho từng loại lỗi
- **Standardized Responses**: Format lỗi thống nhất
- **Logging**: Log lỗi với mức độ chi tiết khác nhau

## 11. Security Patterns

### 11.1. Authentication & Authorization
- **JWT Authentication**: Access và refresh tokens
- **Role-Based Access Control**: Admin, Instructor, Student
- **Permission-Based Guards**: Granular access control
- **Ownership Verification**: Resource ownership checks

### 11.2. Data Protection
- **Input Sanitization**: XSS prevention
- **Password Hashing**: Bcrypt với salt
- **Data Encryption**: Sensitive data encryption
- **CSRF Prevention**: Token-based protection

### 11.3. API Security
- **Rate Limiting**: Prevent abuse
- **CORS Policy**: Controlled cross-origin access
- **Helmet**: HTTP header security
- **Security Headers**: Content-Security-Policy, X-XSS-Protection

### 11.4. Audit & Compliance
- **User Activity Logging**: Track critical operations
- **Access Logs**: Monitor authentication attempts
- **Sensitive Action Verification**: Multi-factor for critical actions
- **Data Access Controls**: Row-level security where needed

## 12. Module Definitions

### 12.1. Module Users
```typescript
@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

### 12.2. Module Auth
```typescript
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        secret: process.env.JWT_ACCESS_SECRET,
        signOptions: {
          expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
        },
      }),
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PasswordService],
  exports: [PassportModule, JwtModule, AuthService, PasswordService],
})
export class AuthModule {}
```

### 12.3. Module Categories
```typescript
@Module({
  imports: [DatabaseModule],
  controllers: [CategoriesController],
  providers: [
    CategoriesService,
  ],
  exports: [CategoriesService],
})
export class CategoriesModule {}
```

### 12.4. Module Courses
```typescript
@Module({
  imports: [DatabaseModule],
  controllers: [CoursesController],
  providers: [CoursesService, CourseOwnershipGuard],
  exports: [CoursesService],
})
export class CoursesModule {}
```

### 12.5. Module Enrollments
```typescript
@Module({
  imports: [
    PrismaModule,
    DatabaseModule,
    CoursesModule,
  ],
  controllers: [EnrollmentsController],
  providers: [
    EnrollmentsService,
    {
      provide: 'IEnrollmentRepository',
      useClass: PrismaEnrollmentRepository,
    },
    {
      provide: 'ICourseRepository',
      useClass: PrismaCourseRepository,
    },
  ],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}
```

### 12.6. Module Lessons
```typescript
@Module({
  imports: [DatabaseModule],
  controllers: [LessonsController],
  providers: [
    LessonsService,
    {
      provide: 'ILessonRepository',
      useClass: PrismaLessonRepository,
    },
    {
      provide: 'ICourseRepository',
      useClass: PrismaCourseRepository,
    },
    {
      provide: 'IEnrollmentRepository',
      useClass: PrismaEnrollmentRepository,
    },
  ],
  exports: [LessonsService],
})
export class LessonsModule {}
```

### 12.7. Module Exams
```typescript
@Module({
  imports: [DatabaseModule],
  controllers: [
    ExamsController,
    ExamQuestionsController,
    ExamResultsController,
    ExamStatsController,
    ExamQuestionController,
    ExamAttemptController,
    LaTeXParserController,
    LaTeXRendererController
  ],
  providers: [
    ExamService,
    QuestionService,
    AttemptService,
    LaTeXParserService,
    LaTeXRendererService,
  ],
  exports: [
    ExamService,
    QuestionService,
    AttemptService,
    LaTeXParserService,
    LaTeXRendererService,
  ]
})
export class ExamsModule {}
```

### 12.8. Module Questions
```typescript
@Module({
  imports: [PrismaModule, DatabaseModule],
  controllers: [QuestionsController, QuestionTagsController],
  providers: [
    QuestionsService,
    QuestionVersionService,
    QuestionTagService
  ],
  exports: [
    QuestionsService,
    QuestionVersionService,
    QuestionTagService
  ]
})
export class QuestionsModule {}
```

### 12.9. Module AI Features
```typescript
@Module({
  imports: [
    // Các modules cần thiết
  ],
  controllers: [
    UserActivityController,
    RecommendationController,
    LearningPathController
  ],
  providers: [
    // AI services
  ],
  exports: [
    // AI providers
  ]
})
export class AiFeaturesModule {}
```

## 13. Chi tiết các Module

### 13.1. Module Users

#### 13.1.1. Vai trò
- Quản lý thông tin người dùng
- Xử lý đăng ký, cập nhật thông tin cá nhân
- Lưu trữ và quản lý quyền người dùng

#### 13.1.2. Repositories
- **IUserRepository**: Quản lý thông tin người dùng
- **IUserProfileRepository**: Quản lý thông tin profile người dùng
- **IUserPreferencesRepository**: Quản lý preferences học tập

#### 13.1.3. Controllers & Endpoints
- **UsersController**:
  - `GET /users` - Danh sách người dùng
  - `GET /users/:id` - Chi tiết người dùng
  - `POST /users` - Tạo người dùng mới
  - `PUT /users/:id` - Cập nhật thông tin người dùng
  - `DELETE /users/:id` - Xóa người dùng

#### 13.1.4. Model User
```typescript
// User model
interface User {
  id: string;
  email: string;
  username?: string;
  password: string; // hashed
  firstName: string;
  lastName: string;
  role: UserRole; // ADMIN, INSTRUCTOR, STUDENT
  isActive: boolean;
  profileId?: string;
  profile?: UserProfile;
  createdAt: Date;
  updatedAt: Date;
}
```

### 13.2. Module Auth

#### 13.2.1. Vai trò
- Xử lý authentication và authorization
- Quản lý JWT tokens
- Xác thực người dùng
- Kiểm soát quyền truy cập

#### 13.2.2. Các services chính
- **AuthService**: Xử lý login, logout, token refresh
- **PasswordService**: Mã hóa và xác thực mật khẩu
- **JwtStrategy**: Strategy xác thực JWT

#### 13.2.3. Controllers & Endpoints
- **AuthController**:
  - `POST /auth/login` - Đăng nhập
  - `POST /auth/logout` - Đăng xuất
  - `POST /auth/refresh` - Làm mới access token
  - `POST /auth/register` - Đăng ký người dùng mới
  - `POST /auth/forgot-password` - Yêu cầu reset mật khẩu
  - `POST /auth/reset-password` - Reset mật khẩu

#### 13.2.4. Chiến lược Authentication
- Sử dụng JWT với cặp access token và refresh token
- Access token hết hạn sau khoảng thời gian ngắn (15-30 phút)
- Refresh token hết hạn sau thời gian dài hơn (7-30 ngày)
- Lưu trữ refresh token trong database để có thể revoke
- Sử dụng Passport.js cho authentication

### 13.3. Module Categories

#### 13.3.1. Vai trò
- Quản lý danh mục phân loại khóa học
- Hỗ trợ cấu trúc phân cấp cho danh mục
- Cho phép phân loại nội dung học tập

#### 13.3.2. Repositories
- **ICategoryRepository**: Quản lý danh mục

#### 13.3.3. Controllers & Endpoints
- **CategoriesController**:
  - `GET /categories` - Danh sách danh mục
  - `GET /categories/:id` - Chi tiết danh mục
  - `GET /categories/:id/courses` - Danh sách khóa học trong danh mục
  - `POST /categories` - Tạo danh mục mới
  - `PUT /categories/:id` - Cập nhật danh mục
  - `DELETE /categories/:id` - Xóa danh mục

#### 13.3.4. Model Category
```typescript
// Category model
interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  courses?: CategoryCourse[];
  createdAt: Date;
  updatedAt: Date;
}
```

### 13.4. Module Courses

#### 13.4.1. Vai trò
- Quản lý khóa học
- Tổ chức nội dung học tập
- Kết nối giữa người dạy và nội dung

#### 13.4.2. Relationships
1. **User-Course**:
   - User (INSTRUCTOR) tạo nhiều Course (one-to-many)
   - User (STUDENT) đăng ký nhiều Course qua Enrollment (many-to-many)

2. **Course-Category**:
   - Course thuộc nhiều Category (many-to-many)
   - Categories có cấu trúc phân cấp (self-referencing)

3. **Course-Lesson**:
   - Course chứa nhiều Lesson (one-to-many)
   - Lessons được sắp xếp theo thứ tự

#### 13.4.3. Model Course
```typescript
// Course model
interface Course {
  id: string;
  title: string;
  description?: string;
  shortDescription?: string;
  duration?: number; // in minutes
  price: Decimal;
  isFree: boolean;
  instructorId: string;
  instructor: User;
  categories: CategoryCourse[];
  thumbnail?: string;
  introVideo?: string;
  prerequisites: string[];
  learningOutcomes: string[];
  totalStudents: number;
  totalLessons: number;
  status: CourseStatus; // DRAFT, PUBLISHED, ARCHIVED
  language?: string;
  averageRating: number;
  totalRatings: number;
  lessons: Lesson[];
  enrollments: Enrollment[];
  createdAt: Date;
  updatedAt: Date;
}
```

### 13.5. Module Enrollments

#### 13.5.1. Vai trò
- Quản lý việc đăng ký khóa học của học viên
- Theo dõi tiến trình học tập
- Cung cấp thông tin về hoàn thành khóa học

#### 13.5.2. Repositories
- **IEnrollmentRepository**: Quản lý đăng ký khóa học
- **IEnrollmentProgressRepository**: Quản lý tiến trình học tập

#### 13.5.3. Controllers & Endpoints
- **EnrollmentsController**:
  - `GET /enrollments` - Danh sách đăng ký
  - `GET /enrollments/user/:userId` - Đăng ký của người dùng
  - `GET /enrollments/course/:courseId` - Đăng ký cho khóa học
  - `POST /enrollments` - Tạo đăng ký mới
  - `PUT /enrollments/:id` - Cập nhật đăng ký
  - `DELETE /enrollments/:id` - Hủy đăng ký
  - `GET /enrollments/:id/progress` - Xem tiến trình

#### 13.5.4. Model Enrollment
```typescript
// Enrollment model
interface Enrollment {
  id: string;
  userId: string;
  user: User;
  courseId: string;
  course: Course;
  status: EnrollmentStatus; // ACTIVE, COMPLETED, CANCELLED
  completionRate: number;
  lastAccessedAt: Date;
  completedLessons: string[];
  certificate?: Certificate;
  createdAt: Date;
  updatedAt: Date;
}
```

### 13.6. Module Lessons

#### 13.6.1. Vai trò
- Quản lý bài học trong khóa học
- Tổ chức nội dung học tập
- Theo dõi tiến trình học tập của học viên

#### 13.6.2. Repositories
- **ILessonRepository**: Quản lý bài học
- **ILessonContentRepository**: Quản lý nội dung bài học
- **ILessonProgressRepository**: Quản lý tiến trình bài học

#### 13.6.3. Controllers & Endpoints
- **LessonsController**:
  - `GET /courses/:courseId/lessons` - Danh sách bài học
  - `GET /lessons/:id` - Chi tiết bài học
  - `POST /courses/:courseId/lessons` - Tạo bài học mới
  - `PUT /lessons/:id` - Cập nhật bài học
  - `DELETE /lessons/:id` - Xóa bài học
  - `POST /lessons/:id/complete` - Đánh dấu bài học hoàn thành

#### 13.6.4. Model Lesson
```typescript
// Lesson model
interface Lesson {
  id: string;
  title: string;
  description?: string;
  courseId: string;
  course: Course;
  order: number;
  type: LessonType; // VIDEO, TEXT, QUIZ, ASSIGNMENT
  duration: number; // in minutes
  videoUrl?: string;
  content?: string;
  attachments?: Attachment[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 13.7. Module Exams

#### 13.7.1. Vai trò
- Quản lý bài thi và đánh giá
- Tạo và quản lý câu hỏi
- Tính điểm và phân tích kết quả

#### 13.7.2. Repositories
- **IExamRepository**: Quản lý bài thi
- **IExamResultRepository**: Quản lý kết quả bài thi
- **IExamQuestionRepository**: Quản lý câu hỏi bài thi

#### 13.7.3. Controllers
1. **ExamsController**:
   - `GET /exams` - Danh sách bài thi
   - `GET /exams/:id` - Chi tiết bài thi
   - `POST /exams` - Tạo bài thi mới
   - `PUT /exams/:id` - Cập nhật bài thi
   - `DELETE /exams/:id` - Xóa bài thi

2. **ExamQuestionsController**:
   - `GET /exams/:examId/questions` - Danh sách câu hỏi
   - `POST /exams/:examId/questions` - Tạo câu hỏi mới
   - `POST /exams/:examId/questions/bulk` - Tạo nhiều câu hỏi

3. **ExamResultsController**:
   - `POST /exams/:examId/results/start` - Bắt đầu làm bài
   - `POST /exams/:examId/results/:attemptId/submit` - Nộp bài và tính điểm

4. **ExamStatsController**:
   - `GET /exam-stats/exams/:examId` - Thống kê tổng quan
   - `GET /exam-stats/pass-rate` - Tỷ lệ đỗ
   - `GET /exam-stats/exams/:examId/score-distribution` - Phân phối điểm

### 13.8. Module Questions

#### 13.8.1. Vai trò
- Quản lý ngân hàng câu hỏi
- Hỗ trợ nhiều loại câu hỏi khác nhau
- Quản lý các phiên bản câu hỏi
- Phân loại câu hỏi theo tags

#### 13.8.2. Services
- **QuestionsService**: Quản lý câu hỏi
- **QuestionVersionService**: Quản lý phiên bản câu hỏi
- **QuestionTagService**: Quản lý tags cho câu hỏi

#### 13.8.3. Controllers & Endpoints
- **QuestionsController**:
  - `GET /questions` - Danh sách câu hỏi
  - `GET /questions/:id` - Chi tiết câu hỏi
  - `POST /questions` - Tạo câu hỏi mới
  - `PUT /questions/:id` - Cập nhật câu hỏi
  - `DELETE /questions/:id` - Xóa câu hỏi
  - `GET /questions/:id/versions` - Lịch sử phiên bản

- **QuestionTagsController**:
  - `GET /question-tags` - Danh sách tags
  - `POST /question-tags` - Tạo tag mới
  - `PUT /question-tags/:id` - Cập nhật tag
  - `DELETE /question-tags/:id` - Xóa tag

#### 13.8.4. Enums liên quan đến Question

```typescript
/**
 * Enum cho các loại câu hỏi
 * Tương ứng với QuestionType trong schema.prisma
 */
export enum QuestionType {
  MC = 'MC', // Trắc nghiệm một phương án đúng
  TF = 'TF', // Trắc nghiệm nhiều phương án đúng
  SA = 'SA', // Trắc nghiệm trả lời ngắn
  ES = 'ES'  // Câu hỏi tự luận
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
```

#### 13.8.5. Model Question
```typescript
// Question model
interface Question {
  id: string;
  rawContent: string;        // 1. RawContent: Nội dung gốc LaTex của câu hỏi
  questionId: string;        // 2. QuestionID: Mục đích dùng để phân loại câu hỏi (dạng XXXXX-X)
  subcount: string;          // 3. Subcount: Mục đích dành cho học sinh dễ truy vấn câu hỏi (dạng XX.N)
  type: QuestionType;        // 4. Type: Loại câu hỏi (MC, TF, SA, ES)
  source: string;            // 5. Source: Nguồn câu hỏi
  content: string;           // 6. Content: Nội dung câu hỏi đã xử lý
  answers: QuestionAnswer[]; // 7. Answers: Danh sách đáp án của câu hỏi để chọn
  correctAnswer: string[];   // 8. CorrectAnswer: Đáp án đúng
  solution: string;          // 9. Solution: Lời giải câu hỏi
  images: QuestionImage[];   // 10. Images: Danh sách hình ảnh
  tags: string[];            // 11. Tags: Nhãn phân loại
  usageCount: number;        // 12. UsageCount: Số lần sử dụng
  creatorId: string;         // 13. Creator: ID của người tạo
  status: QuestionStatus;    // 14. Status: Trạng thái câu hỏi
  examRefs: string[];        // 15. ExamRefs: Tham chiếu đến các bài kiểm tra
  feedback: number;          // 16. Feedback: Số lần câu hỏi này được feedback
  difficulty: QuestionDifficulty; // Độ khó của câu hỏi (bổ sung)
  createdAt: Date;           // Thời gian tạo
  updatedAt: Date;           // Thời gian cập nhật
}
```

### 13.9. Module AI Features

#### 13.9.1. Vai trò
- Cung cấp các tính năng AI/ML cho hệ thống
- Phân tích hành vi người dùng
- Đề xuất khóa học và nội dung học tập
- Tạo lộ trình học tập cá nhân hóa

#### 13.9.2. Controllers
- **UserActivityController**: Quản lý dữ liệu hoạt động người dùng
- **RecommendationController**: Cung cấp API đề xuất nội dung
- **LearningPathController**: Quản lý lộ trình học tập cá nhân hóa

#### 13.9.3. Mô hình AI được sử dụng
- Collaborative filtering cho đề xuất khóa học
- Content-based filtering cho đề xuất nội dung tương tự
- Supervised learning cho phân tích phong cách học tập
- Reinforcement learning cho điều chỉnh lộ trình học tập
- Natural Language Processing cho phân tích nội dung

#### 13.9.4. Luồng dữ liệu AI
1. Thu thập dữ liệu người dùng (User activity tracking)
2. Tiền xử lý và làm sạch dữ liệu
3. Huấn luyện mô hình với dữ liệu hiện có
4. Tạo đề xuất và phân tích theo thời gian thực
5. Cập nhật mô hình định kỳ dựa trên dữ liệu mới

#### 13.9.5. API Endpoints
- **UserActivityController**:
  - `POST /ai/user-activity` - Ghi lại hoạt động người dùng
  - `GET /ai/user-activity/:userId` - Lấy lịch sử hoạt động

- **RecommendationController**:
  - `GET /ai/recommendations/courses` - Đề xuất khóa học
  - `GET /ai/recommendations/similar/:courseId` - Khóa học tương tự
  - `GET /ai/recommendations/next-lessons` - Bài học tiếp theo

- **LearningPathController**:
  - `GET /ai/learning-path` - Lấy lộ trình học tập
  - `POST /ai/learning-path/generate` - Tạo lộ trình học tập
  - `PUT /ai/learning-path/update` - Cập nhật lộ trình

# Controller Patterns

## RESTful API Endpoints

### MapIDController

MapIDController quản lý các endpoints liên quan đến cấu trúc QuestionID và phân cấp ID:

1. **GET /map-id/structure**:
   - Trả về cấu trúc phân cấp ID đầy đủ
   - Bao gồm thông tin về grade, subject, chapter, lesson, form và level
   - Được sử dụng cho UI hiển thị cây phân cấp câu hỏi

2. **GET /map-id/parse/:questionId**:
   - Phân giải QuestionID thành các thành phần
   - Trả về các thành phần: grade, subject, chapter, level, lesson, form
   - Cũng trả về thuộc tính isID6 để phân biệt ID5 và ID6

3. **POST /map-id/generate**:
   - Tạo QuestionID từ các thành phần được cung cấp
   - Yêu cầu các tham số: grade, subject, chapter, level, lesson
   - Tham số form là tùy chọn, nếu có sẽ tạo ID6, nếu không sẽ tạo ID5

Mô hình dữ liệu:
- QuestionID (ID5): 5 ký tự [Lớp Môn Chương Mức_độ Bài]
- QuestionID (ID6): 7 ký tự [Lớp Môn Chương Mức_độ Bài-Dạng]
- Mỗi thành phần là 1 ký tự số [0-9] hoặc chữ cái in hoa [A-Z]