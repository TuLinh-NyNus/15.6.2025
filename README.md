# NyNus - Nền tảng học tập trực tuyến

## Giới thiệu

NyNus là nền tảng học tập trực tuyến thông minh, cung cấp trải nghiệm học tập được cá nhân hóa thông qua AI. Dự án sử dụng kiến trúc Monorepo với Turborepo để quản lý các packages và ứng dụng.

## 🏗️ Cấu trúc Thư mục Dự án (Siêu Chi tiết)

```
nynus/
├── .cursor/                      # Cấu hình và quy tắc riêng cho Cursor IDE.
│   └── rules/                    # Chứa các quy tắc `.mdc` tùy chỉnh cho AI.
│       ├── Core Implementation/    # Quy tắc cốt lõi về quy trình làm việc của AI.
│       ├── Extended Details/     # Ví dụ chi tiết cho các quy tắc cốt lõi.
│       ├── Templates/            # Template mẫu cho các file Memory Bank.
│       ├── ... (coding-rules, nestjs-best-practices, etc.).mdc
├── .husky/                       # Cấu hình Git hooks (vd: pre-commit).
│   └── pre-commit                # Script chạy trước khi commit.
├── .turbo/                       # Cache và logs của Turborepo (không commit).
├── apps/                         # Các ứng dụng độc lập.
│   ├── api/                      # Backend API (NestJS).
│   │   ├── dist/                 # Code đã biên dịch (không commit).
│   │   ├── logs/                 # Logs của ứng dụng (không commit).
│   │   ├── node_modules/         # Dependencies của app 'api' (không commit).
│   │   ├── prisma/               # Cấu hình và schema Prisma cho 'api'.
│   │   │   ├── migrations/       # Thư mục chứa các file migration SQL.
│   │   │   └── schema.prisma     # Định nghĩa schema database (models, relations).
│   │   ├── src/                  # Mã nguồn của 'api'.
│   │   │   ├── app.controller.ts # Controller gốc (vd: health check).
│   │   │   ├── app.module.ts     # Module gốc, import các modules khác.
│   │   │   ├── app.service.ts    # Service gốc.
│   │   │   ├── bootstrap.ts      # Logic khởi tạo ứng dụng (middleware, pipes...). 
│   │   │   ├── main.ts           # Điểm khởi chạy ứng dụng (tạo Nest app, lắng nghe port).
│   │   │   ├── common/           # Các thành phần dùng chung trong 'api'.
│   │   │   │   ├── decorators/   # Custom decorators (vd: @GetUser).
│   │   │   │   ├── enums/        # Định nghĩa các Enum.
│   │   │   │   ├── exceptions/   # Custom exception classes.
│   │   │   │   ├── filters/      # Exception filters (vd: HttpApiExceptionFilter).
│   │   │   │   ├── guards/       # Guards cho authentication/authorization (vd: JwtAuthGuard).
│   │   │   │   ├── interfaces/   # Interfaces dùng chung trong 'api'.
│   │   │   │   ├── logging/      # Cấu hình logging (Winston).
│   │   │   │   ├── mappers/      # Data mappers.
│   │   │   │   ├── types/        # Types dùng chung trong 'api'.
│   │   │   │   └── index.ts      # Export các thành phần từ 'common'.
│   │   │   ├── config/           # Cấu hình ứng dụng (hiện trống).
│   │   │   ├── database/         # Cấu hình database (hiện trống, có thể dùng package chung).
│   │   │   ├── modules/          # Các module tính năng chính.
│   │   │   │   ├── ai-features/  # Module liên quan đến tính năng AI.
│   │   │   │   ├── auth/         # Module xử lý authentication.
│   │   │   │   ├── categories/   # Module quản lý danh mục khóa học.
│   │   │   │   ├── courses/      # Module quản lý khóa học.
│   │   │   │   ├── courses-standardized/ # Module quản lý khóa học chuẩn hóa.
│   │   │   │   ├── enrollments/  # Module quản lý ghi danh.
│   │   │   │   ├── lessons/      # Module quản lý bài học.
│   │   │   │   └── users/        # Module quản lý người dùng.
│   │   │   ├── prisma/           # Dịch vụ Prisma client.
│   │   │   └── repositories/     # Implementations của Repository Pattern.
│   │   ├── .env                  # Biến môi trường cho 'api' (không commit).
│   │   ├── .env.example          # File biến môi trường mẫu.
│   │   ├── .eslintrc.js          # Cấu hình ESLint cho 'api'.
│   │   ├── docker-compose.yml    # Cấu hình Docker Compose (vd: PostgreSQL).
│   │   ├── nest-cli.json         # Cấu hình NestJS CLI (collections, sourceRoot).
│   │   ├── package.json          # Dependencies và scripts cho 'api'.
│   │   ├── tsconfig.app.json     # Kế thừa tsconfig, chỉ định files include/exclude.
│   │   ├── tsconfig.build.json   # Cấu hình TS cho build (thường chỉ exclude test files).
│   │   └── tsconfig.json         # Cấu hình TypeScript chính cho 'api'.
│   └── web/                      # Frontend (Next.js).
│       ├── .next/                # Build output của Next.js (không commit).
│       ├── app/                  # App Router của Next.js.
│       │   ├── (auth)/           # Route group cho authentication (vd: /login, /register).
│       │   ├── (dashboard)/      # Route group cho dashboard (yêu cầu đăng nhập).
│       │   ├── api/              # API routes (Next.js backend, vd: /api/users).
│       │   ├── globals.css       # CSS toàn cục, biến CSS, @tailwind directives.
│       │   ├── layout.tsx        # Layout gốc, áp dụng cho toàn bộ ứng dụng.
│       │   └── page.tsx          # Giao diện trang chủ (route '/').
│       ├── components/           # Components dùng chung trong 'web' (hiện trống).
│       │   └── ui/               # Shadcn UI components (vd: Button, Input...). 
│       ├── features/             # Các module tính năng frontend (hiện trống).
│       ├── hooks/                # Custom React hooks (hiện trống).
│       ├── lib/                  # Utilities, helpers cho frontend (hiện trống).
│       ├── public/               # Chứa các file tĩnh (images, fonts...) (hiện trống).
│       ├── .env                  # Biến môi trường cho 'web' (không commit).
│       ├── next.config.mjs       # Cấu hình Next.js (plugins, env...). 
│       ├── package.json          # Dependencies và scripts cho 'web'.
│       ├── tailwind.config.js    # Cấu hình Tailwind CSS (theme, plugins).
│       └── tsconfig.json         # Cấu hình TypeScript cho 'web'.
├── docs/                         # Tài liệu dự án.
│   ├── archive/                  # Lưu trữ task đã hoàn thành.
│   │   └── completed_tasks.md    # Chi tiết các task đã xong.
│   └── setup/                    # Hướng dẫn cài đặt chi tiết (nếu có).
├── memory-bank/                  # "Trí nhớ" của AI.
│   ├── activeContext.md, productContext.md, projectbrief.md, progress.md
│   ├── systemPatterns.md, tasks.md, techContext.md
│   └── ... (các file context/plan khác)
├── node_modules/                 # Dependencies gốc (không commit).
├── packages/                     # Các gói mã nguồn dùng chung.
│   ├── config/                   # Cấu hình dùng chung (ESLint, Prettier, TSConfig) (trống).
│   ├── database/                 # Logic và cấu hình database chung.
│   │   ├── dist/                 # Code đã biên dịch (không commit).
│   │   ├── node_modules/         # Dependencies của package (không commit).
│   │   ├── prisma/               # Schema Prisma dùng chung (nếu có).
│   │   ├── src/                  # Mã nguồn package database.
│   │   │   ├── examples/         # Code ví dụ sử dụng package.
│   │   │   ├── prisma/           # Prisma client setup.
│   │   │   ├── repositories/     # Repository implementations chung.
│   │   │   ├── types/            # Types liên quan đến database.
│   │   │   └── index.ts          # Export chính.
│   │   ├── .env                  # Biến môi trường (nếu cần, không commit).
│   │   ├── package.json          # Dependencies và scripts.
│   │   └── tsconfig.json         # Cấu hình TypeScript.
│   ├── dto/                      # Data Transfer Objects chung.
│   │   ├── dist/                 # Code đã biên dịch (không commit).
│   │   ├── node_modules/         # Dependencies của package (không commit).
│   │   ├── src/                  # Mã nguồn DTOs.
│   │   │   ├── auth/             # DTOs cho Authentication.
│   │   │   ├── categories/       # DTOs cho Categories.
│   │   │   ├── common/           # DTOs chung (vd: PaginationDto).
│   │   │   ├── course/           # DTOs cho Course (có thể là typo, nên là courses?).
│   │   │   ├── courses/          # DTOs cho Courses.
│   │   │   ├── enrollments/      # DTOs cho Enrollments.
│   │   │   ├── exams/            # DTOs cho Exams.
│   │   │   ├── lessons/          # DTOs cho Lessons.
│   │   │   ├── users/            # DTOs cho Users.
│   │   │   └── index.ts          # Export chính.
│   │   ├── package.json          # Dependencies và scripts.
│   │   └── tsconfig.json         # Cấu hình TypeScript.
│   ├── entities/                 # Entities (định nghĩa cấu trúc dữ liệu) dùng chung.
│   │   ├── dist/                 # Code đã biên dịch (không commit).
│   │   ├── src/                  # Mã nguồn Entities.
│   │   │   ├── ai/               # Entities liên quan AI.
│   │   │   ├── categories/       # Entities cho Categories.
│   │   │   ├── courses/          # Entities cho Courses.
│   │   │   ├── enrollments/      # Entities cho Enrollments.
│   │   │   ├── enums/            # Định nghĩa các Enum dùng chung.
│   │   │   ├── exams/            # Entities cho Exams.
│   │   │   ├── lessons/          # Entities cho Lessons.
│   │   │   ├── progress/         # Entities cho Progress.
│   │   │   ├── users/            # Entities cho Users.
│   │   │   └── index.ts          # Export chính.
│   │   ├── package.json          # Dependencies và scripts.
│   │   └── tsconfig.json         # Cấu hình TypeScript.
│   ├── interfaces/               # Interfaces (định nghĩa "hợp đồng") dùng chung.
│   │   ├── dist/                 # Code đã biên dịch (không commit).
│   │   ├── node_modules/         # Dependencies của package (không commit).
│   │   ├── src/                  # Mã nguồn Interfaces.
│   │   │   ├── repository/       # Interfaces cho Repository Pattern (có thể là typo, nên là repositories?).
│   │   │   ├── repositories/     # Interfaces cho Repository Pattern.
│   │   │   ├── shared/           # Interfaces dùng chung khác.
│   │   │   └── index.ts          # Export chính.
│   │   ├── package.json          # Dependencies và scripts.
│   │   └── tsconfig.json         # Cấu hình TypeScript.
│   ├── types/                    # Types dùng chung (hiện đang trống).
│   ├── ui/                       # UI Components chung (Shadcn).
│   │   ├── dist/                 # Code đã biên dịch (không commit).
│   │   ├── node_modules/         # Dependencies của package (không commit).
│   │   ├── src/                  # Mã nguồn components.
│   │   │   ├── components/       # Thư mục chứa các UI components (vd: Button, Card...). 
│   │   │   ├── styles/           # CSS/styles riêng của package UI.
│   │   │   ├── utils/            # Utilities cho UI (vd: cn function).
│   │   │   └── index.ts          # Export chính từ src.
│   │   ├── index.tsx             # Export chính của toàn bộ package UI.
│   │   ├── package.json          # Dependencies và scripts.
│   │   └── tsconfig.json         # Cấu hình TypeScript.
│   └── utils/                    # Helper functions chung.
│       ├── dist/                 # Code đã biên dịch (không commit).
│       ├── node_modules/         # Dependencies của package (không commit).
│       ├── src/                  # Mã nguồn utils.
│       │   ├── mappers/          # Data mapping functions.
│       │   └── index.tsx         # Export chính.
│       ├── package.json          # Dependencies và scripts.
│       └── tsconfig.json         # Cấu hình TypeScript.
├── backup/                       # Thư mục backup (cần xem xét mục đích).
├── .env                          # Biến môi trường gốc (không commit).
├── .eslintignore                 # Bỏ qua ESLint.
├── .eslintrc.js                  # Cấu hình ESLint gốc.
├── .gitignore                    # Bỏ qua Git.
├── .npmrc                        # Cấu hình pnpm (vd: shamefully-hoist=true).
├── .prettierignore               # Bỏ qua Prettier.
├── .prettierrc.js                # Cấu hình Prettier gốc.
├── package.json                  # Dependencies và scripts gốc cho toàn bộ monorepo.
├── pnpm-lock.yaml                # "Khóa" phiên bản dependencies chính xác.
├── pnpm-workspace.yaml           # Định nghĩa các workspaces (apps, packages).
├── README.md                     # File này.
├── tsconfig.base.json            # Cấu hình TS cơ sở (compilerOptions dùng chung).
├── tsconfig.json                 # Cấu hình TS gốc (thường chỉ để editors nhận diện).
├── tsconfig.tsbuildinfo          # Cache build TS (không commit).
├── turbo.json                    # Cấu hình Turborepo (pipeline, cache...). 
└── update-ts-packages.ps1        # Script PowerShell tùy chỉnh (vd: cập nhật TS).
```

## Yêu cầu hệ thống

- Node.js >= 18.0.0
- pnpm >= 7.24.2

## Cài đặt

1. Cài đặt dependencies:

```bash
pnpm install
```

2. Khởi chạy dự án ở chế độ development:

```bash
pnpm dev
```

## Lệnh hữu ích

- `pnpm build`: Build tất cả các ứng dụng và packages
- `pnpm dev`: Chạy tất cả các ứng dụng ở chế độ development
- `pnpm lint`: Kiểm tra lỗi linting trên toàn bộ dự án
- `pnpm format`: Format code với Prettier

## Quy trình phát triển

1. Phát triển các shared packages trong thư mục `/packages`
2. Sử dụng các shared packages trong các ứng dụng ở thư mục `/apps`
3. Chạy các lệnh Turborepo để build và test

## Quy tắc đặt tên

- **Packages**: kebab-case
- **Components**: PascalCase
- **Functions**: camelCase
- **Types/Interfaces**: PascalCase 