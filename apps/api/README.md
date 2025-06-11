# NyNus API

Backend API cho nền tảng học tập trực tuyến NyNus.

## Công nghệ

- NestJS v11.0.13
- PostgreSQL
- Prisma v5.2.0
- TypeScript
- JWT Authentication
- Winston Logger
- Swagger Documentation

## Yêu cầu

- Node.js (v18+)
- pnpm (7.24.2+)
- PostgreSQL server running

## Cài đặt

```bash
# Cài đặt dependencies
pnpm install

# Tạo file .env từ mẫu
cp .env.example .env

# Chỉnh sửa thông tin kết nối database trong .env

# Chạy migration để tạo schema database
npx prisma migrate dev

# Khởi động ứng dụng
pnpm run dev
```

## Cấu trúc thư mục

```
src/
├── common/                   # Các tiện ích dùng chung
│   ├── exceptions/           # Custom exception classes
│   ├── filters/              # Global filters
│   └── logging/              # Logging configuration
├── modules/                  # Các module chức năng
│   ├── users/                # User module
│   ├── courses/              # Course module
│   └── ...                   # Các module khác
├── prisma/                   # Prisma ORM
│   └── schema.prisma         # Database schema
├── app.module.ts             # Root module
└── main.ts                   # Entry point
```

## API Documentation

Sau khi khởi động ứng dụng, API documentation có thể được truy cập tại:

```
http://localhost:3001/api/docs
```

## Database Schema

### Các Entity chính

- User: Người dùng (Student, Instructor, Admin)
- Course: Khóa học
- Lesson: Bài học trong khóa học
- Enrollment: Đăng ký khóa học
- Progress: Tiến độ học tập
- Category: Danh mục khóa học
- Assessment: Bài kiểm tra

## Chạy ứng dụng

```bash
# Development mode
pnpm run dev

# Production mode
pnpm run build
pnpm run start:prod
```

## Testing

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
``` 