# 🚀 NyNus - Hướng dẫn chạy Source Code

Tài liệu hướng dẫn chi tiết để setup và chạy dự án NyNus - Nền tảng học trực tuyến.

## 📋 Tổng quan

NyNus là một monorepo sử dụng:
- **Frontend**: Next.js 14 (Port 3000)
- **Backend**: NestJS 11 (Port 5000)
- **Database**: PostgreSQL 15 (Port 5432)
- **Cache**: Redis 7 (Port 6379)
- **Package Manager**: PNPM
- **Build System**: Turborepo

## 🔧 Yêu cầu hệ thống

### Bắt buộc
- **Node.js**: >= 18.0.0
- **PNPM**: >= 7.24.2
- **Git**: Latest version

### Tùy chọn (cho Docker)
- **Docker**: >= 20.10.0
- **Docker Compose**: >= 2.0.0

### Kiểm tra phiên bản
```bash
node --version    # >= v18.0.0
pnpm --version    # >= 7.24.2
git --version     # Latest
docker --version  # >= 20.10.0 (nếu dùng Docker)
```

## 📦 Cài đặt

### 1. Clone Repository
```bash
git clone https://github.com/TuLinh-NyNus/Hehe.git
cd Hehe
```

### 2. Cài đặt Dependencies
```bash
# Cài đặt tất cả dependencies cho monorepo
pnpm install
```

### 3. Cấu hình Environment Variables

#### Backend (.env cho apps/api)
```bash
# Copy file mẫu
cp apps/api/.env.example apps/api/.env

# Chỉnh sửa file .env
# DATABASE_URL="postgresql://postgres:admin@localhost:5432/nynus_db?schema=public"
# JWT_SECRET="your-super-secret-jwt-key"
# JWT_EXPIRES_IN="7d"
# FRONTEND_URL="http://localhost:3000"
```

#### Frontend (.env.local cho apps/web)
```bash
# Tạo file .env.local trong apps/web
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > apps/web/.env.local
echo "API_URL=http://localhost:5000" >> apps/web/.env.local
```

## 🗄️ Cấu hình Database

### Option 1: PostgreSQL Local

#### Cài đặt PostgreSQL
```bash
# Windows (với Chocolatey)
choco install postgresql

# macOS (với Homebrew)
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
```

#### Tạo Database
```sql
-- Kết nối PostgreSQL
psql -U postgres

-- Tạo database
CREATE DATABASE nynus_db;
CREATE USER nynus_user WITH PASSWORD 'admin';
GRANT ALL PRIVILEGES ON DATABASE nynus_db TO nynus_user;
\q
```

#### Chạy Migration
```bash
cd apps/api
npx prisma migrate dev
npx prisma generate
```

### Option 2: Docker Database (Khuyến nghị)
```bash
# Chạy chỉ database với Docker
docker-compose -f docker-compose.dev.yml up -d db redis

# Chờ database khởi động, sau đó chạy migration
cd apps/api
npx prisma migrate dev
npx prisma generate
```

## 🏃‍♂️ Chạy Development Mode

### Option 1: Local Development (Khuyến nghị)

#### Cách 1: Sử dụng script tự động
```bash
# Script tự động kill ports và khởi động
pnpm dev

# Hoặc sử dụng script PowerShell nâng cao
pnpm start
```

#### Cách 2: Chạy thủ công từng service
```bash
# Terminal 1: Build packages
pnpm run build:ts

# Terminal 2: Chạy API
cd apps/api
pnpm dev

# Terminal 3: Chạy Web
cd apps/web
pnpm dev

# Terminal 4: Prisma Studio (tùy chọn)
pnpm prisma:studio
```

### Option 2: Docker Development
```bash
# Khởi động toàn bộ stack với Docker
pnpm docker:dev:start

# Hoặc sử dụng script quản lý
pnpm docker:dev start

# Xem logs
docker-compose -f docker-compose.dev.yml logs -f

# Dừng services
pnpm docker:dev:stop
```

## 🌐 Truy cập ứng dụng

Sau khi khởi động thành công:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health
- **Prisma Studio**: http://localhost:8386 (nếu chạy)
- **API Documentation**: http://localhost:5000/api/docs (khi có Swagger)

## 🏭 Production Mode

### Option 1: Build và chạy local
```bash
# Build toàn bộ dự án
pnpm build

# Chạy production mode
NODE_ENV=production pnpm start
```

### Option 2: Docker Production
```bash
# Copy environment file
cp .env.docker .env

# Chỉnh sửa .env với thông tin production

# Build và khởi động
pnpm docker:prod:start

# Hoặc
docker-compose --env-file .env up -d
```

## 🔧 Các lệnh hữu ích

### Development
```bash
pnpm dev                    # Chạy development mode
pnpm build                  # Build toàn bộ dự án
pnpm lint                   # Kiểm tra linting
pnpm format                 # Format code với Prettier
pnpm test                   # Chạy tests
pnpm clean                  # Xóa build artifacts
```

### Database
```bash
pnpm prisma:studio          # Mở Prisma Studio
cd apps/api && npx prisma migrate dev    # Chạy migration
cd apps/api && npx prisma generate       # Generate Prisma client
cd apps/api && npx prisma db push        # Push schema changes
cd apps/api && npx prisma db seed        # Seed database
```

### Docker
```bash
pnpm docker:dev:start       # Khởi động Docker development
pnpm docker:dev:stop        # Dừng Docker development
pnpm docker:prod:start      # Khởi động Docker production
pnpm docker:build           # Build Docker images
pnpm docker:health          # Kiểm tra health của containers
```

### Utilities
```bash
pnpm kill-ports             # Kill processes trên ports 3000, 5000, 8386
pnpm restart                # Restart toàn bộ ứng dụng
```

## 🐛 Troubleshooting

### Lỗi thường gặp

#### 1. Port đã được sử dụng
```bash
# Kill processes trên các ports
pnpm kill-ports

# Hoặc thủ công
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

#### 2. Database connection failed
```bash
# Kiểm tra PostgreSQL đang chạy
pg_isready -h localhost -p 5432

# Kiểm tra connection string trong .env
# DATABASE_URL="postgresql://postgres:admin@localhost:5432/nynus_db?schema=public"
```

#### 3. Prisma client out of sync
```bash
cd apps/api
npx prisma generate
npx prisma migrate dev
```

#### 4. Dependencies issues
```bash
# Xóa node_modules và reinstall
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
pnpm install
```

#### 5. Build errors
```bash
# Clean và rebuild
pnpm clean
pnpm run build:ts
pnpm build
```

### Docker issues

#### 1. Container không khởi động
```bash
# Xem logs chi tiết
docker-compose -f docker-compose.dev.yml logs <service_name>

# Rebuild containers
docker-compose -f docker-compose.dev.yml build --no-cache
```

#### 2. Database không kết nối được
```bash
# Kiểm tra database container
docker-compose -f docker-compose.dev.yml ps

# Restart database
docker-compose -f docker-compose.dev.yml restart db
```

## 📁 Cấu trúc dự án

```
nynus/
├── apps/
│   ├── web/                # Next.js Frontend
│   ├── api/                # NestJS Backend
│   └── admin/              # Admin Dashboard (future)
├── packages/
│   ├── ui/                 # Shared UI components
│   ├── utils/              # Shared utilities
│   ├── database/           # Prisma repositories
│   ├── dto/                # Data Transfer Objects
│   ├── entities/           # Database entities
│   └── interfaces/         # Type definitions
├── scripts/                # Development scripts
├── docker-compose.yml      # Production Docker config
├── docker-compose.dev.yml  # Development Docker config
└── turbo.json             # Turborepo configuration
```

## 🎯 Next Steps

1. **Đọc tài liệu API**: Xem `apps/api/README.md`
2. **Tìm hiểu cấu trúc**: Xem `README.md` chính
3. **Docker setup**: Xem `DOCKER-SETUP.md`
4. **Coding conventions**: Xem `.cursor/rules/`

## 🆘 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra logs trong terminal
2. Xem phần Troubleshooting ở trên
3. Kiểm tra GitHub Issues
4. Liên hệ team development

---

**Happy Coding! 🎉**
