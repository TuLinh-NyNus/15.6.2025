# Technology Stack

## Môi trường phát triển
- Node.js v18.14.0
- pnpm v7.24.2
- VS Code với các extensions cho TypeScript và NestJS
- Git v2.45.0
- Docker (tùy chọn) v20.10

## Frontend
- Next.js v14
- React v18
- TypeScript v5.5.0
- Tailwind CSS v3.3.0
- Shadcn UI
- React Hook Form
- Zod Validation
- React Query

## Backend
- NestJS v11.0.13
- TypeScript v5.5.0
- Prisma v5.2.0 (ORM)
- PostgreSQL v15 (Database)
- class-validator & class-transformer (Validation)
- Winston (Logging)
- Swagger/OpenAPI (API Documentation)
- JWT Authentication
- Passport.js

## Database
- PostgreSQL v15
- Prisma Migrate (Schema Migrations)
- Prisma Studio (Database Management GUI)

## Testing
- Jest (Unit testing)
- Supertest (API testing)
- React Testing Library (Component testing)
- Playwright (E2E testing)

## DevOps & Deployment
- GitHub Actions (CI/CD)
- Docker & Docker Compose
- Kubernetes (Production)
- Vercel (Frontend Deployment)
- Monitoring & Logging: Prometheus, Grafana

## Project Structure
- Monorepo with Turborepo
- pnpm Workspaces
- Shared packages for common functionality
- Modular architecture

## Security
- CORS Protection
- Helmet for HTTP Headers
- Rate Limiting
- bcrypt for Password Hashing
- JWT with Refresh Tokens
- Input Validation

## Cấu hình Prisma cơ bản
```
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

## Cấu hình kết nối Database
```
DATABASE_URL="postgresql://username:password@localhost:5432/nynus?schema=public"
```

## Cấu trúc module NestJS
```
src/
├── main.ts
├── app.module.ts
├── app.controller.ts
├── app.service.ts
├── common/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   └── decorators/
├── config/
│   └── configuration.ts
├── modules/
│   ├── users/
│   ├── courses/
│   ├── lessons/
│   └── ...
└── prisma/
    └── prisma.service.ts
```

## Platform Considerations
- Operating System: win32
- Path separator: \
- Development Environment: Node.js, pnpm, Turborepo, Next.js, NestJS
- Command adaptations needed: Yes (e.g., path separators, potentially different commands if not using tools)
- Tools used primarily: `list_dir`, `edit_file`, `read_file`, `fetch_rules`, `mcp_filesystem_directory_tree`, `grep_search`
