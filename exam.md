# Tổng hợp Thiết kế: Tính năng Page Exam

## Giới thiệu

Đây là tài liệu tổng hợp thiết kế chi tiết cho tính năng Page Exam trong dự án NyNus. Tài liệu này tổng hợp thông tin từ các nguồn khác nhau bao gồm:
- `arch_exam.md`
- `Exam.md`
- `productContext.md`
- `projectbrief.md`
- `systemPatterns.md`
- `techContext.md`

## Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [Danh sách Module cần tạo](#2-danh-sách-module-cần-tạo)
3. [Thiết kế Database](#3-thiết-kế-database)
4. [Thiết kế Backend API](#4-thiết-kế-backend-api)
5. [Thiết kế Frontend](#5-thiết-kế-frontend)
6. [Điểm cần lưu ý khi triển khai](#6-điểm-cần-lưu-ý-khi-triển-khai)
7. [Kế hoạch triển khai](#7-kế-hoạch-triển-khai)
8. [Tài liệu tham khảo](#8-tài-liệu-tham-khảo)

## 1. Tổng quan

Tính năng Page Exam là một thành phần quan trọng trong hệ thống NyNus, cho phép quản lý và thực hiện các bài thi. Các chức năng chính bao gồm:

- Quản lý đề thi (tạo, cập nhật, xóa)
- Quản lý câu hỏi (nhiều loại câu hỏi khác nhau)
- Thực hiện bài thi (làm bài, nộp bài, chấm điểm)
- Xem kết quả và phân tích thống kê

Tính năng này phục vụ cho các đối tượng người dùng:
- Học sinh/sinh viên: Làm bài thi, xem kết quả
- Giáo viên: Tạo và quản lý đề thi, xem kết quả của học sinh
- Quản trị viên: Quản lý toàn bộ hệ thống

## 2. Danh sách Module cần tạo

### 2.1. Module Database

- Model `Exam`: Lưu trữ thông tin đề thi
- Model `Question`: Lưu trữ thông tin câu hỏi
- Model `ExamResult`: Lưu trữ kết quả làm bài
- Model `QuestionVersion` (nếu áp dụng): Lưu trữ phiên bản câu hỏi
- Model `QuestionTag` (nếu áp dụng): Lưu trữ tags cho câu hỏi

### 2.2. Module Backend

- `ExamsModule`: Quản lý CRUD, filter, phân trang, thống kê cho đề thi
- `QuestionsModule`: Quản lý CRUD, import/export, validate đáp án cho câu hỏi
- `ExamResultsModule`: Quản lý quá trình làm bài, lưu tạm, nộp bài, tính điểm
- `MapIDModule` (nếu áp dụng): Xử lý cấu trúc QuestionID và phân cấp ID
- `LaTeXModule` (nếu áp dụng): Xử lý parse và render công thức LaTeX

### 2.3. Module Frontend

- Pages: Trang danh sách đề thi, chi tiết đề thi, làm bài thi, kết quả, lịch sử làm bài...
- Components: ExamCard, QuestionDisplay, Timer, ProgressBar, AnswerSheet, ResultSummary...
- Hooks: useExams, useExam, useAttempt, useTimer, useSubmitAnswer, useExamResult...

## 3. Thiết kế Database

### 3.1. Model Exam

```prisma
model Exam {
  id            String      @id @default(uuid())
  title         String
  description   Json?       // Chứa thông tin năm học, tỉnh/thành phố, trường
  questions     Int[]       // Mảng ID của các câu hỏi
  duration      Int         // Thời gian làm bài (phút)
  difficulty    Difficulty
  subject       String
  grade         Int
  form          ExamForm    @default(TRAC_NGHIEM)
  createdBy     String
  averageScore  Float?
  status        ExamStatus  @default(DRAFT)
  type          ExamType    @default(draft)
  updatedAt     DateTime    @updatedAt
  createdAt     DateTime    @default(now())
  tags          String[]
  examCategory  ExamCategory

  // Relations
  creator       User        @relation("ExamCreator", fields: [createdBy], references: [id])
  examResults   ExamResult[]
  lessons       Lesson[]    @relation("LessonExams")
}
```

### 3.2. Model Question

```prisma
model Question {
  id            String       @id @default(uuid())
  questionId    String?      // MapID format, e.g., "12A3B-C"
  content       String       // Nội dung câu hỏi
  rawContent    String?      // Nội dung raw (có thể là LaTeX)
  type          QuestionType
  options       Json?        // Danh sách các lựa chọn
  correctAnswer Json         // Đáp án đúng (format tùy thuộc vào type)
  explanation   String?      // Giải thích đáp án
  difficulty    Difficulty   @default(medium)
  score         Float        @default(1)
  tags          String[]
  createdBy     String
  updatedAt     DateTime     @updatedAt
  createdAt     DateTime     @default(now())
  
  // Relations
  creator       User         @relation("QuestionCreator", fields: [createdBy], references: [id])
  versions      QuestionVersion[]
  questionTags  QuestionTag[]
}
```

### 3.3. Model ExamResult

```prisma
model ExamResult {
  id          String    @id @default(uuid())
  userId      String
  examId      String
  score       Float
  maxScore    Float     // Điểm tối đa của bài thi
  startedAt   DateTime
  completedAt DateTime?
  duration    Int       // Thời gian làm bài tính bằng giây
  answers     Json?     // Chi tiết câu trả lời
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  // Relations
  user        User      @relation(fields: [userId], references: [id])
  exam        Exam      @relation(fields: [examId], references: [id])
}
```

## 4. Thiết kế Backend API

### 4.1. ExamsController

- `GET /exams`: Lấy danh sách đề thi (có phân trang, lọc)
- `GET /exams/:id`: Lấy chi tiết đề thi
- `POST /exams`: Tạo đề thi mới (admin/teacher)
- `PUT /exams/:id`: Cập nhật đề thi (admin/teacher)
- `DELETE /exams/:id`: Xóa đề thi (admin/teacher)
- `GET /exams/categories`: Lấy danh sách loại đề thi

### 4.2. ExamQuestionsController

- `GET /exams/:id/questions`: Lấy danh sách câu hỏi của đề thi
- `POST /exams/:id/questions`: Thêm câu hỏi vào đề thi (admin/teacher)
- `DELETE /exams/:id/questions/:questionId`: Xóa câu hỏi khỏi đề thi (admin/teacher)

### 4.3. ExamAttemptsController

- `POST /exams/:id/attempts`: Bắt đầu làm bài thi
- `PUT /exams/attempts/:attemptId`: Lưu tạm hoặc nộp bài
- `GET /exams/attempts/:attemptId`: Lấy thông tin lượt làm bài
- `GET /exams/:id/attempts`: Lấy danh sách lượt làm bài của đề thi (admin/teacher)

### 4.4. ExamResultsController

- `GET /exams/results/:id`: Lấy kết quả bài thi
- `GET /users/me/exam-results`: Lấy lịch sử làm bài của người dùng hiện tại

### 4.5. QuestionsController

- `GET /questions`: Lấy danh sách câu hỏi (có phân trang, lọc)
- `GET /questions/:id`: Lấy chi tiết câu hỏi
- `POST /questions`: Tạo câu hỏi mới (admin/teacher)
- `PUT /questions/:id`: Cập nhật câu hỏi (admin/teacher)
- `DELETE /questions/:id`: Xóa câu hỏi (admin/teacher)

## 5. Thiết kế Frontend

### 5.1. Pages

- **ExamListPage** (`/exams`): Hiển thị danh sách đề thi
- **ExamDetailPage** (`/exams/[examId]`): Hiển thị chi tiết đề thi
- **ExamAttemptPage** (`/exams/[examId]/attempt/[attemptId]`): Trang làm bài thi
- **ExamResultPage** (`/results/[attemptId]`): Hiển thị kết quả bài thi
- **ExamHistoryPage** (`/users/me/exam-results`): Hiển thị lịch sử làm bài

### 5.2. Components

- **ExamCard**: Hiển thị thông tin tóm tắt về một đề thi
- **QuestionDisplay**: Hiển thị nội dung câu hỏi và các tùy chọn trả lời
- **Timer**: Hiển thị thời gian còn lại cho bài thi
- **ProgressBar**: Hiển thị tiến độ làm bài
- **AnswerSheet**: Hiển thị các câu hỏi đã trả lời/chưa trả lời
- **ResultSummary**: Hiển thị tóm tắt kết quả bài thi

### 5.3. Workflow

1. **Xem danh sách đề thi**:
   - User truy cập trang `/exams`
   - Xem danh sách đề thi, có thể lọc theo môn học, khối lớp...
   - Click vào một đề thi để xem chi tiết

2. **Làm bài thi**:
   - User xem chi tiết đề thi tại `/exams/[examId]`
   - Click "Bắt đầu làm bài"
   - Hệ thống tạo một lượt làm mới (attempt)
   - User làm bài tại `/exams/[examId]/attempt/[attemptId]`
   - Timer đếm ngược thời gian còn lại
   - User có thể nộp bài hoặc hết thời gian tự động nộp bài

3. **Xem kết quả**:
   - Sau khi nộp bài, user được chuyển đến trang kết quả `/results/[attemptId]`
   - Xem điểm số, câu trả lời đúng/sai, giải thích

4. **Xem lịch sử làm bài**:
   - User truy cập trang `/users/me/exam-results`
   - Xem danh sách các bài thi đã làm, điểm số, thời gian

## 6. Điểm cần lưu ý khi triển khai

### 6.1. Hiệu năng
- Sử dụng pagination và lazy loading cho danh sách dài
- Tối ưu API calls, sử dụng caching
- Xử lý nhiều người dùng cùng làm bài một lúc

### 6.2. Bảo mật
- Phân quyền chặt chẽ cho các API endpoints
- Validate input ở cả client và server
- Ngăn chặn gian lận trong khi làm bài

### 6.3. UX/UI
- Thiết kế responsive cho các thiết bị khác nhau
- Timer rõ ràng và hiển thị tiến độ
- Trải nghiệm làm bài mượt mà, tránh mất dữ liệu

### 6.4. Mở rộng
- Thiết kế hệ thống đáp án linh hoạt, dễ mở rộng
- Sử dụng JSON cho các cấu trúc dữ liệu phức tạp
- Thiết kế cấu trúc code module hóa, dễ bảo trì

## 7. Kế hoạch triển khai

Xem chi tiết trong file `memory-bank/exam_design_impl.md`.

## 8. Tài liệu tham khảo

- `memory-bank/arch_exam.md`: Kiến trúc chi tiết cho hệ thống Page Exam
- `memory-bank/Exam.md`: Chi tiết về model Exam và các API
- `memory-bank/exam_design_detailed.md`: Thiết kế chi tiết cho tính năng Page Exam
- `memory-bank/systemPatterns.md`: Các pattern được sử dụng trong hệ thống
- `memory-bank/techContext.md`: Stack công nghệ của dự án 