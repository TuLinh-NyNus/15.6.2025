# Model Exam

## Tổng quan

Model Exam trong hệ thống NyNus đại diện cho các bài kiểm tra, bài thi và đề thi. Hệ thống sử dụng PostgreSQL để lưu trữ thông tin về bài thi.

## Mô hình dữ liệu


### PostgreSQL Schema

```typescript
// Trong Prisma schema
model Exam {
  id            String      @id @default(uuid())
  title         String
  description   Json?       // Chứa thông tin năm học, tỉnh/thành phố, trường
  questions     Int[]       // Mảng ID của các câu hỏi
  duration      Int
  difficulty    Difficulty
  subject       String
  grade         Int
  form          ExamForm    @default(TRAC_NGHIEM)
  createdBy     String
  averageScore  Float?
  updatedAt     DateTime    @updatedAt
  createdAt     DateTime    @default(now())
  tags          String[]
  examCategory  ExamCategory

  // Relations
  creator       User        @relation("ExamCreator", fields: [createdBy], references: [id])
  examResults   ExamResult[]
  lessons       Lesson[]
}
```

## Interface trong TypeScript

```typescript
// Interface cho model Exam
export interface Exam {
  id: string;
  title: string;
  description: JsonValue; // Chứa thông tin năm học, tỉnh/thành phố, trường
  questions: number[];
  duration: number;
  difficulty: Difficulty;
  subject: string;
  grade: number;
  type: ExamType;
  createdBy: string;
  averageScore?: number | null;
  updatedAt: Date;
  createdAt: Date;
  tags: string[];
  form?: ExamForm | null;
  examCategory: ExamCategory;
}
```

## Cấu trúc mô tả trong description

Field `description` dạng JSON thường có cấu trúc như sau:

```typescript
interface ExamDescription {
  schoolYear?: string; // Năm học (VD: "2023-2024")
  schoolName?: string; // Tên trường
  province?: string; // Tỉnh/thành phố
  examName?: string; // Tên kỳ thi
  examDate?: string; // Ngày thi
  examTime?: string; // Thời gian thi
  examClass?: string; // Lớp thi
  instructions?: string; // Hướng dẫn làm bài
  additionalInfo?: Record<string, any>; // Thông tin bổ sung
}
```

## Enum và Types

### Difficulty

```typescript
enum Difficulty {
  easy
  medium
  hard
}
```

### ExamType

```typescript
export enum ExamType {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}
```

### ExamCategory

```typescript
enum ExamCategory {
  THUONG_XUYEN_MIENG
  GIUA_KI_I
  CUOI_KI_I
  GIUA_KI_II
  CUOI_KI_II
  KHAO_SAT
  DE_CUONG
  HOC_SINH_GIOI
  TUYEN_SINH
  KHAO_SAT_THI_THU
}
```

### ExamForm

```typescript
enum ExamForm {
  TRAC_NGHIEM
  TU_LUAN
  KET_HOP
  FORM_2018
  FORM_2025
}
```

## DTO và Input Types

### CreateExamDto/Input

```typescript
export interface CreateExamDto {
  title: string;
  description?: Prisma.InputJsonValue;
  questions: number[];
  duration: number;
  difficulty: Difficulty;
  subject: string;
  grade: number;
  type?: ExamType;
  createdById: string;
  tags?: string[];
  form?: ExamForm;
  examCategory: ExamCategory;
}
```

### UpdateExamDto/Input

```typescript
export interface UpdateExamDto {
  title?: string;
  description?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
  questions?: number[];
  duration?: number;
  difficulty?: Difficulty;
  subject?: string;
  grade?: number;
  type?: ExamType;
  averageScore?: number | null;
  tags?: string[];
  form?: ExamForm | null;
  examCategory?: ExamCategory;
}
```

### ExamFilter

```typescript
export interface ExamFilter {
  subject?: string;
  grade?: number;
  difficulty?: Difficulty;
  examCategory?: ExamCategory;
  form?: ExamForm;
  createdBy?: string;
  search?: string;
}
```

## Kết quả thi (ExamResult)

```typescript
// Trong Prisma schema
model ExamResult {
  id          String   @id @default(uuid())
  userId      String
  examId      String
  score       Float
  maxScore    Float
  startedAt   DateTime
  completedAt DateTime
  duration    Int      // Thời gian làm bài tính bằng giây
  answers     Json?    // Chi tiết câu trả lời

  user        User     @relation(fields: [userId], references: [id])
  exam        Exam     @relation(fields: [examId], references: [id])
}
```

```typescript
// Interface TypeScript
export interface ExamResult {
  id: string;
  userId: string;
  examId: string;
  score: number;
  maxScore: number;
  startedAt: Date;
  completedAt: Date;
  duration: number;
  answers?: Record<string, any> | null;
}
```

### Cấu trúc answers

Field `answers` trong ExamResult thường có dạng:

```typescript
type ExamResultAnswers = {
  [questionId: string]: {
    selectedOptionIds?: number[]; // ID các lựa chọn đã chọn (trắc nghiệm)
    textAnswer?: string; // Câu trả lời dạng text (tự luận)
    isCorrect: boolean; // Đúng/sai
    score: number; // Điểm cho câu này
    maxScore: number; // Điểm tối đa có thể đạt
    timeSpent?: number; // Thời gian làm câu này (giây)
    feedback?: string; // Phản hồi từ hệ thống/giáo viên
  };
};
```

## Câu hỏi trong Exam

Cấu trúc cơ bản của câu hỏi trong Exam:

```typescript
export interface ExamQuestion {
  id: number;
  content: string; // Nội dung câu hỏi
  type: 'MULTIPLE_CHOICE' | 'SINGLE_CHOICE' | 'TRUE_FALSE' | 'ESSAY'; // Loại câu hỏi
  options?: ExamQuestionOption[]; // Các lựa chọn (cho câu trắc nghiệm)
  correctAnswers?: number[]; // ID các đáp án đúng
  explanation?: string; // Giải thích đáp án
  score: number; // Điểm tối đa cho câu hỏi
  difficultyLevel?: Difficulty; // Độ khó
  tags?: string[]; // Thẻ phân loại
  subject?: string; // Môn học
  grade?: number; // Lớp
}

export interface ExamQuestionOption {
  id: number;
  content: string; // Nội dung lựa chọn
  isCorrect: boolean; // Đáp án đúng/sai
}
```

## API Endpoints

Hệ thống cung cấp các API endpoint sau để thao tác với Exam:

- `GET /exams`: Lấy danh sách các bài thi theo bộ lọc
- `GET /exams/:id`: Lấy thông tin chi tiết một bài thi
- `POST /exams`: Tạo mới một bài thi (yêu cầu quyền admin hoặc teacher)
- `PUT /exams/:id`: Cập nhật thông tin bài thi (yêu cầu quyền admin hoặc teacher)
- `DELETE /exams/:id`: Xóa bài thi (yêu cầu quyền admin hoặc teacher)
- `GET /exams/:id/questions`: Lấy danh sách câu hỏi của bài thi
- `POST /exams/:id/questions`: Thêm câu hỏi vào bài thi (yêu cầu quyền admin hoặc teacher)
- `PUT /exams/:id/questions/:questionId`: Cập nhật câu hỏi trong bài thi
- `DELETE /exams/:id/questions/:questionId`: Xóa câu hỏi khỏi bài thi
- `POST /exams/:id/attempts`: Tạo một lần thi mới
- `GET /exams/:id/attempts`: Lấy danh sách các lần thi của bài thi
- `GET /exams/:id/stats`: Lấy thống kê về bài thi (yêu cầu quyền admin hoặc teacher)
- `GET /exams/:id/performance`: Lấy thông tin về hiệu suất làm bài thi của người dùng
- `GET /exams/categories`: Lấy danh sách các loại bài thi

### Tham số request cho API GET /exams

```typescript
interface GetExamsQuery {
  page?: number; // Số trang (mặc định: 1)
  limit?: number; // Số lượng kết quả mỗi trang (mặc định: 10)
  subject?: string; // Lọc theo môn học
  grade?: number; // Lọc theo khối lớp
  difficulty?: Difficulty; // Lọc theo độ khó
  examCategory?: ExamCategory; // Lọc theo loại đề thi
  form?: ExamForm; // Lọc theo hình thức
  createdBy?: string; // Lọc theo người tạo
  search?: string; // Tìm kiếm theo từ khóa
  sortBy?: string; // Sắp xếp theo trường (title, createdAt, etc.)
  sortOrder?: 'asc' | 'desc'; // Thứ tự sắp xếp
}
```

## Mối quan hệ với các model khác

- `Exam` có quan hệ 1-n với `ExamResult`: Một bài thi có thể có nhiều kết quả thi từ nhiều người dùng
- `Exam` có quan hệ n-1 với `User`: Một bài thi được tạo bởi một người dùng (teacher hoặc admin)
- `Exam` có quan hệ 1-n với `Lesson`: Một bài thi có thể được sử dụng trong nhiều bài học

## Thống kê và phân tích

### ExamStats Interface

```typescript
export interface ExamStats {
  id: string; // ID bài thi
  title: string; // Tiêu đề
  totalAttempts: number; // Tổng số lần làm bài
  averageScore: number; // Điểm trung bình
  highestScore: number; // Điểm cao nhất
  lowestScore: number; // Điểm thấp nhất
  passingRate: number; // Tỷ lệ đạt (%)
  averageCompletionTime: number; // Thời gian hoàn thành trung bình (giây)
  questionStats: {
    // Thống kê theo câu hỏi
    [questionId: string]: {
      correct: number; // Số lần trả lời đúng
      incorrect: number; // Số lần trả lời sai
      correctRate: number; // Tỷ lệ đúng (%)
      averageTimeSpent: number; // Thời gian trung bình (giây)
    };
  };
  scoreDistribution: {
    // Phân phối điểm
    range: string; // Khoảng điểm
    count: number; // Số lượng
  }[];
  timeDistribution: {
    // Phân phối thời gian
    range: string; // Khoảng thời gian
    count: number; // Số lượng
  }[];
}
```

### ExamPerformance Interface

```typescript
export interface ExamPerformance {
  userId: string; // ID người dùng
  examId: string; // ID bài thi
  attempts: number; // Số lần làm bài
  bestScore: number; // Điểm cao nhất
  lastScore: number; // Điểm lần gần nhất
  averageScore: number; // Điểm trung bình
  lastCompletionTime: number; // Thời gian hoàn thành lần gần nhất (giây)
  bestCompletionTime: number; // Thời gian hoàn thành nhanh nhất (giây)
  weakestQuestions: string[]; // Danh sách ID câu hỏi yếu nhất
  strongestQuestions: string[]; // Danh sách ID câu hỏi mạnh nhất
  progress: {
    // Tiến độ qua các lần
    attemptId: string; // ID lần làm
    date: Date; // Ngày làm
    score: number; // Điểm số
  }[];
}
```

## Quy trình làm bài thi

1. **Bắt đầu làm bài**

   - Gọi API `POST /exams/:id/attempts` để tạo một lần thi mới
   - Lưu thời gian bắt đầu và chuẩn bị giao diện hiển thị câu hỏi

2. **Làm bài thi**

   - Hiển thị câu hỏi và cho phép người dùng chọn/nhập câu trả lời
   - Có thể lưu tạm câu trả lời qua API `PUT /exams/attempts/:attemptId`
   - Theo dõi thời gian làm bài và cảnh báo khi gần hết thời gian

3. **Nộp bài**

   - Gọi API `PUT /exams/attempts/:attemptId` với trạng thái hoàn thành
   - Lưu thời gian kết thúc và tính toán điểm số
   - Hiển thị kết quả và phản hồi

4. **Xem lại bài làm**
   - Người dùng có thể xem lại câu trả lời và đáp án đúng (nếu được phép)
   - Xem nhận xét và phản hồi từ hệ thống/giáo viên

