# DANH SÁCH CHỨC NĂNG DỰ ÁN NYNUS
## "Dự án NyNus có thể làm được gì?"

## 📋 TỔNG QUAN

**NyNus** là nền tảng học tập trực tuyến toán học tích hợp AI với kiến trúc monorepo hiện đại. Hệ thống cung cấp đầy đủ các chức năng từ cơ bản đến nâng cao cho 3 nhóm người dùng chính:

### 🎯 Khả năng chính của hệ thống:
- **Quản lý khóa học hoàn chỉnh**: Tạo, quản lý, đăng ký và theo dõi tiến độ
- **Hệ thống câu hỏi mạnh mẽ**: LaTeX support, import/export, versioning, MapID
- **Thi trực tuyến**: 4 loại câu hỏi (MC, TF, SA, ES) với chấm điểm tự động
- **Admin panel chuyên nghiệp**: 13 trang quản trị với theme support
- **AI-ready architecture**: Entities sẵn sàng cho personalization và recommendation
- **Security cao**: JWT, RBAC, input validation, rate limiting
- **Modern tech stack**: Next.js 14, NestJS 11, PostgreSQL, Prisma, TypeScript

Dưới đây là tất cả những gì người dùng có thể làm được trên hệ thống:

---

## 👤 DÀNH CHO HỌC SINH (STUDENT)

### 🔐 Quản lý tài khoản
- 🔄 **Đăng ký tài khoản** với email và mật khẩu (API: POST /auth/register)
- 🔄 **Đăng nhập/đăng xuất** an toàn (API: POST /auth/login, /auth/logout)
- 🔄 **Cập nhật thông tin cá nhân** (tên, avatar, thông tin liên hệ) (API: PATCH /users/:id)
- 🔄 **Đổi mật khẩu** và quản lý bảo mật tài khoản (API: POST /auth/change-password)
- 🔄 **Reset mật khẩu** qua email (API: POST /auth/reset-password)
- 🔄 **Xác thực email** (API: POST /auth/verify-email)
- 🔄 **Xem lịch sử hoạt động** học tập của mình (Backend có UserActivityLog entity)

### 📚 Học tập và khóa học
- 🔄 **Xem danh sách tất cả khóa học** có sẵn (API: GET /courses)
- 🔄 **Tìm kiếm khóa học** theo tên, mô tả, giảng viên (API có CourseFiltersDto)
- 🔄 **Lọc khóa học** theo danh mục, giá, độ khó, đánh giá (API: GET /courses với filters)
- 🔄 **Xem chi tiết khóa học** (mô tả, giảng viên, nội dung, đánh giá) (API: GET /courses/:id)
- 🔄 **Xem khóa học nổi bật** (API: GET /courses/featured)
- 🔄 **Xem khóa học theo danh mục** (API: GET /courses/category/:id)
- 🔄 **Xem trước bài học miễn phí** trước khi đăng ký (Backend có lesson preview logic)
- 🔄 **Đăng ký khóa học** (miễn phí hoặc trả phí) (API: POST /enrollments)
- 🔄 **Xem danh sách khóa học đã đăng ký** (API: GET /enrollments/my-courses)
- 🔄 **Học các bài học** theo thứ tự hoặc tự do (API: GET /lessons)
- 🔄 **Theo dõi tiến độ học tập** của từng khóa học (Backend có Progress entity)
- 🔄 **Đánh giá và nhận xét khóa học** sau khi hoàn thành (API: POST /courses/:id/rate)

### 📖 Học bài và nội dung
- 🔄 **Xem video bài giảng** với player tích hợp (API: GET /lessons/:id)
- 🔄 **Đọc nội dung văn bản** với định dạng rich text (Backend có content field)
- 🔄 **Tải xuống tài liệu** đính kèm (PDF, slides, etc.) (Backend có attachments support)
- 🔄 **Đánh dấu bài học đã hoàn thành** (API: POST /enrollments/:id/lessons/:lessonId/complete)
- 🔄 **Xem bài học theo khóa học** (API: GET /lessons/course/:courseId)
- 🔄 **Quản lý thứ tự bài học** (Backend có order field)
- 🔄 **Thiết lập thời lượng bài học** (Backend có duration field)
- 🔄 **Bài học preview miễn phí** (Backend có isPreview field)
- 🔄 **Nhiều loại bài học** (Video, Text, Quiz, Assignment, Interactive)
- 🔄 **Ghi chú cá nhân** cho từng bài học (Backend có note system)
- 🔄 **Tua nhanh/chậm video** và điều khiển phát (Frontend video player)
- 🔄 **Xem lại bài học** không giới hạn số lần (API: GET /lessons/:id)

### ❓ Làm bài tập và kiểm tra
- 🔄 **Làm bài kiểm tra trắc nghiệm** (Multiple Choice) (API: POST /exam-attempts/start/:examId)
- 🔄 **Làm bài kiểm tra đúng/sai** (True/False) (Backend hỗ trợ TF question type)
- 🔄 **Trả lời câu hỏi ngắn** (Short Answer) (Backend hỗ trợ SA question type)
- 🔄 **Viết bài luận** (Essay Questions) (Backend hỗ trợ ES question type)
- 🔄 **Xem công thức toán học** được render từ LaTeX (API: LaTeXRendererController, LaTeXParserController)
- 🔄 **Làm bài thi có thời gian giới hạn** (API: POST /exam-attempts/start/:examId với timer)
- 🔄 **Nộp bài thi và tính điểm** (API: POST /exam-attempts/:attemptId/submit)
- 🔄 **Xem kết quả chi tiết** ngay sau khi nộp bài (API: ExamResultsController)
- 🔄 **Xem giải thích đáp án** chi tiết (Backend có solution field trong Question)
- 🔄 **Theo dõi lịch sử làm bài** và cải thiện điểm số (API: GET /exam-attempts/my-results)
- 🔄 **Xem thống kê kết quả** (điểm trung bình, xu hướng cải thiện) (API: ExamStatsController)
- 🔄 **Quản lý phiên làm bài** (start, pause, resume, submit) (API: ExamAttemptController)
- 🔄 **Random questions** cho mỗi lần thi (Backend có random question selection)
- 🔄 **Phân loại câu hỏi theo độ khó** (Backend có difficulty field)

### 🤖 Tính năng AI cá nhân hóa
- Chưa làm gì hết

### 📊 Theo dõi tiến độ
- 🔄 **Xem dashboard cá nhân** với tổng quan tiến độ (Frontend có user dashboard structure)
- 🔄 **Theo dõi phần trăm hoàn thành** từng khóa học (API: GET /enrollments/my-courses)
- 🔄 **Đánh dấu bài học hoàn thành** (API: POST /enrollments/:id/lessons/:lessonId/complete)
- 🔄 **Cập nhật tiến độ học tập** (API: EnrollmentsController với progress tracking)
- 🔄 **Xem thời gian đã học** và thời gian còn lại (Backend có duration tracking)
- 🔄 **Theo dõi trạng thái enrollment** (ACTIVE, COMPLETED, CANCELLED)
- 🔄 **Nhận huy hiệu thành tích** khi đạt milestone (Backend có achievement system structure)
- 🔄 **Xem biểu đồ tiến độ** theo thời gian (Frontend có chart components)
- 🔄 **So sánh kết quả** với các học sinh khác (nếu cho phép) (Backend có comparative analytics)

### 🔍 Tìm kiếm và khám phá
- 🔄 **Tìm kiếm khóa học** bằng từ khóa (API: GET /courses với search parameter)
- 🔄 **Lọc theo danh mục** (Đại số, Hình học, Giải tích, etc.) (API: GET /categories, GET /courses/category/:id)
- 🔄 **Lọc theo mức độ** (Cơ bản, Trung bình, Nâng cao) (API có difficulty filtering)
- 🔄 **Lọc theo giá** (Miễn phí, Trả phí) (API có price filtering trong CourseFiltersDto)
- 🔄 **Sắp xếp kết quả** theo độ phổ biến, đánh giá, ngày tạo (API có sorting options)
- 🔄 **Xem khóa học nổi bật** do hệ thống đề xuất (API: GET /courses/featured)
- 🔄 **Xem khóa học phổ biến** nhất (API có popularity sorting)
- 🔄 **Tìm kiếm câu hỏi nâng cao** (API: QuestionSearchController)
- 🔄 **Tìm kiếm theo tags** (API: QuestionTagsController)

### 💻 Giao diện người dùng
- 🔄 **Trang chủ responsive** với Hero, Features, AI Learning, Featured Courses, FAQ
- 🔄 **Trang khóa học** (/khoa-hoc) với CourseCategories, CourseList, CourseHero
- 🔄 **Dark/Light theme** với theme switching
- 🔄 **Mobile-first design** với Tailwind CSS
- 🔄 **Component library** với Shadcn UI + Radix UI
- 🔄 **Loading states** và error handling
- 🔄 **SEO optimization** với metadata và structured data


## �👨‍💼 DÀNH CHO QUẢN TRỊ VIÊN (ADMIN)

### 👥 Quản lý người dùng
- 🔄 **Xem danh sách tất cả người dùng** trong hệ thống (API: GET /users - Role: ADMIN)
- 🔄 **Tạo tài khoản người dùng mới** với role tùy chọn (API: POST /users - Role: ADMIN)
- 🔄 **Cập nhật thông tin người dùng** bất kỳ (API: PATCH /users/:id - Role: ADMIN)
- 🔄 **Thay đổi role người dùng** (Student ↔ Instructor ↔ Admin) (Backend có UserRole enum)
- 🔄 **Khóa/mở khóa tài khoản** người dùng (Backend có user status management)
- 🔄 **Xóa tài khoản người dùng** khi cần thiết (API: DELETE /users/:id - Role: ADMIN)
- 🔄 **Xem lịch sử hoạt động** của người dùng (Backend có UserActivityLog entity)
- 🔄 **Reset mật khẩu** cho người dùng (API: POST /auth/reset-password)
- 🔄 **Trang quản lý người dùng** (/3141592654/admin/users)
- 🔄 **Phân quyền chi tiết** với middleware authentication

### 📚 Quản lý nội dung
- 🔄 **Duyệt và phê duyệt khóa học** trước khi publish (Backend có course approval workflow)
- 🔄 **Chỉnh sửa bất kỳ khóa học nào** trong hệ thống (API: PATCH /courses/:id - Role: ADMIN)
- 🔄 **Xóa khóa học vi phạm** chính sách (API: DELETE /courses/:id - Role: ADMIN)
- 🔄 **Quản lý danh mục khóa học** (tạo, sửa, xóa) (API: POST/PATCH/DELETE /categories - Role: ADMIN)
- 🔄 **Thiết lập khóa học nổi bật** trên trang chủ (Backend có featured course system)
- 🔄 **Kiểm duyệt nội dung** câu hỏi và bài thi (API: QuestionsModule với admin access)
- 🔄 **Quản lý tags và metadata** của nội dung (API: QuestionTagsController)
- 🔄 **Trang quản lý khóa học** (/3141592654/admin/courses)
- 🔄 **Trang quản lý sách & tài liệu** (/3141592654/admin/books)
- 🔄 **Quản lý bài học** (API: PATCH /lessons/:id - Role: ADMIN, INSTRUCTOR)

### 📊 Thống kê và báo cáo
- 🔄 **Xem dashboard tổng quan** hệ thống (Frontend: /3141592654/admin/dashboard)
- 🔄 **Thống kê người dùng** (đăng ký mới, hoạt động) (Backend có user analytics)
- 🔄 **Thống kê khóa học** (phổ biến nhất, doanh thu) (Backend có course analytics)
- 🔄 **Phân tích hiệu suất hệ thống** (tốc độ, lỗi) (Backend có performance monitoring)
- 🔄 **Xuất báo cáo** theo nhiều định dạng (Backend có export capabilities)
- 🔄 **Theo dõi xu hướng** sử dụng platform (Backend có trend analysis)

### 📝 Quản lý câu hỏi và đề thi nâng cao
- 🔄 **Ngân hàng câu hỏi** (/3141592654/admin/questions) với tìm kiếm nâng cao
- 🔄 **Tạo câu hỏi mới** (/3141592654/admin/questions/inputques) với LaTeX support
- 🔄 **Import câu hỏi từ LaTeX** (API: POST /questions/import)
- 🔄 **Quản lý version câu hỏi** (API: QuestionVersionController)
- 🔄 **Tìm kiếm câu hỏi nâng cao** (API: QuestionSearchController)
- 🔄 **Quản lý tags câu hỏi** (API: QuestionTagsController)
- 🔄 **Tra cứu MapID** (/3141592654/admin/questions/map-id) - hệ thống phân cấp ID
- 🔄 **Quản lý trạng thái câu hỏi** (/3141592654/admin/questions/status)
- 🔄 **Ngân hàng đề thi** (/3141592654/admin/exam-bank)
- 🔄 **Tạo và quản lý đề thi** (API: POST/PUT/DELETE /exams - Role: ADMIN, INSTRUCTOR)
- 🔄 **Quản lý câu hỏi trong đề thi** (API: ExamQuestionsController)
- 🔄 **Thống kê đề thi** (API: ExamStatsController)

### ⚙️ Cấu hình hệ thống
- 🔄 **Cấu hình thông số** hệ thống (Backend có system configuration)
- 🔄 **Quản lý permissions** và roles (Backend có RBAC với UserRole enum)
- 🔄 **Thiết lập email templates** cho notifications (Backend có email system structure)
- 🔄 **Cấu hình payment gateways** cho thanh toán (Backend có payment integration structure)
- 🔄 **Quản lý backup** và restore dữ liệu (Docker có database backup)
- 🔄 **Monitor logs** và troubleshooting (Backend có Winston logging)
- 🔄 **Trang cấu hình hệ thống** (/3141592654/admin/settings)
- 🔄 **Health check API** (GET /health) cho monitoring
- 🔄 **API documentation** tự động (Swagger/OpenAPI tại /api/docs)

### 🎯 Tính năng Admin đặc biệt
- 🔄 **Admin Panel Dashboard** (/3141592654/admin/dashboard) với stats cards
- 🔄 **Quản lý FAQ** (/3141592654/admin/faq) - Câu hỏi thường gặp
- 🔄 **ChatAI Admin** (/3141592654/admin/chat-ai) - Quản lý tính năng AI
- 🔄 **Quản lý diễn đàn** (/3141592654/admin/forum) - Moderation tools
- 🔄 **Thống kê & Analytics** (/3141592654/admin/analytics) - Báo cáo chi tiết
- 🔄 **Admin Authentication** với middleware bảo vệ routes (/3141592654/admin/*)
- 🔄 **Direct API Routes** (/api/admin/*) cho admin operations
- 🔄 **Role-based Access Control** với UserRole enum (ADMIN, INSTRUCTOR, STUDENT)
- 🔄 **Admin Sidebar Navigation** với 13 menu items
- 🔄 **Admin Theme Support** (Dark/Light mode)

---

## � 8. HỆ THỐNG KỸ THUẬT & INFRASTRUCTURE

### 8.1 Backend Architecture
- 🔄 **NestJS Framework**: v11 với TypeScript, modular architecture
- 🔄 **Database**: PostgreSQL với Prisma ORM v5.2.0
- 🔄 **Authentication**: JWT tokens với refresh token flow
- 🔄 **Authorization**: Role-based access control (RBAC) với permissions
- 🔄 **API Documentation**: Swagger/OpenAPI tự động tại `/api/docs`
- 🔄 **Health Check**: Monitoring endpoint tại `/health`
- 🔄 **Logging**: Winston logger với structured logging
- 🔄 **Error Handling**: Global exception filters với custom exceptions

### 8.2 Frontend Architecture
- 🔄 **Next.js Framework**: v14 với App Router
- 🔄 **UI Components**: Shadcn UI + Radix UI + Tailwind CSS
- 🔄 **State Management**: React Query cho server state
- 🔄 **Authentication**: NextAuth.js integration
- 🔄 **Theme Support**: Dark/Light mode với theme switching
- 🔄 **Responsive Design**: Mobile-first approach
- 🔄 **TypeScript**: Strict mode với type safety

### 8.3 Development & Deployment
- 🔄 **Monorepo**: Turborepo với PNPM workspaces
- 🔄 **Package Management**: PNPM với workspace dependencies
- 🔄 **Docker**: Multi-stage builds với development/production configs
- 🔄 **Database Migrations**: Prisma migrate với version control
- 🔄 **Environment Config**: Multiple environment support (.env.local, .env)
- 🔄 **Code Quality**: ESLint, Prettier, TypeScript strict mode

### 8.4 Security Features
- 🔄 **Input Validation**: DTO validation với class-validator
- 🔄 **SQL Injection Protection**: Prisma ORM với parameterized queries
- 🔄 **XSS Protection**: Content Security Policy headers
- 🔄 **CORS Configuration**: Proper cross-origin resource sharing
- 🔄 **Rate Limiting**: API rate limiting implementation
- 🔄 **Password Security**: Bcrypt hashing với salt
- 🔄 **Session Management**: JWT với expiration và refresh tokens

### 8.5 Shared Packages
- 🔄 **@project/entities**: Shared entity definitions và enums
- 🔄 **@project/dto**: Data Transfer Objects cho API
- 🔄 **@project/interfaces**: Type definitions và contracts
- 🔄 **@project/database**: Prisma repositories và database utilities
- 🔄 **@project/ui**: Shared UI components (Shadcn UI based)
- 🔄 **@project/utils**: Shared utility functions
- 🔄 **Workspace dependencies**: Consistent versioning với workspace:* pattern


