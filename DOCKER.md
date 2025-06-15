# 🐳 NyNus Docker Containerization Guide

Hướng dẫn toàn diện về Docker containerization cho dự án NyNus monorepo.

## 📋 Tổng quan

NyNus sử dụng Docker để containerize toàn bộ stack ứng dụng, bao gồm:

- **Web Service**: Next.js 14 frontend (Port 3000)
- **API Service**: NestJS 11 backend (Port 5000)  
- **Database Service**: PostgreSQL 15 (Port 5432)
- **Redis Service**: Redis 7 cho caching (Port 6379)

## 🏗️ Kiến trúc Docker

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Network: nynus-network            │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │ Web Service │    │ API Service │    │   Database  │     │
│  │  Next.js    │◄──►│   NestJS    │◄──►│ PostgreSQL  │     │
│  │   :3000     │    │    :5000    │    │    :5432    │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│                             │                              │
│                             ▼                              │
│                    ┌─────────────┐                         │
│                    │   Redis     │                         │
│                    │   Cache     │                         │
│                    │   :6379     │                         │
│                    └─────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Khởi động nhanh

### Development Environment

```bash
# Khởi động database và Redis cho development
make dev-start

# Hoặc sử dụng PowerShell script
powershell -File scripts/docker-dev.ps1 start

# Hoặc sử dụng docker-compose trực tiếp
docker-compose -f docker-compose.dev.yml up -d
```

### Production Environment

```bash
# Khởi động toàn bộ stack production
make prod-start

# Hoặc sử dụng PowerShell script  
powershell -File scripts/docker-prod.ps1 start

# Hoặc sử dụng docker-compose trực tiếp
docker-compose --env-file .env.docker up -d
```

## 📁 Cấu trúc Files

```
├── docker-compose.yml          # Production compose file
├── docker-compose.dev.yml      # Development compose file
├── .dockerignore              # Docker ignore patterns
├── .env.docker               # Production environment variables
├── Makefile                  # Convenient commands
├── apps/
│   ├── web/
│   │   └── Dockerfile        # Next.js multi-stage build
│   └── api/
│       └── Dockerfile        # NestJS multi-stage build
└── scripts/
    ├── docker-dev.ps1        # Development management script
    ├── docker-prod.ps1       # Production management script
    └── init-db.sql          # Database initialization
```

## 🔧 Quản lý với Makefile

### Development Commands
```bash
make dev-start      # Khởi động development environment
make dev-stop       # Dừng development environment
make dev-restart    # Khởi động lại development environment
make dev-logs       # Xem logs development
make dev-clean      # Dọn dẹp development (xóa volumes)
```

### Production Commands
```bash
make prod-start     # Khởi động production environment
make prod-stop      # Dừng production environment
make prod-restart   # Khởi động lại production environment
make prod-logs      # Xem logs production
make prod-clean     # Dọn dẹp production (xóa volumes)
make deploy         # Full deployment (build + start)
```

### Build Commands
```bash
make build-all      # Build tất cả images
make build-web      # Build chỉ web service
make build-api      # Build chỉ API service
```

### Utility Commands
```bash
make health-check   # Kiểm tra health của tất cả services
make status         # Hiển thị status của services
make db-migrate     # Chạy database migrations
make db-seed        # Seed database với dữ liệu mẫu
make db-reset       # Reset database (destructive)
```

## 🔍 Health Checks

Tất cả services đều có health checks:

- **Web**: `http://localhost:3000/api/health`
- **API**: `http://localhost:5000/health`
- **Database**: `pg_isready` command
- **Redis**: `redis-cli ping` command

## 🌍 Environment Variables

### Production (.env.docker)
```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@db:5432/nynus_db?schema=public
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=nynus_db

# Redis
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=redis_password_change_this

# JWT
JWT_SECRET=your_production_secret_key_change_this
JWT_EXPIRES_IN=7d

# Application
NODE_ENV=production
PORT=5000
FRONTEND_URL=http://web:3000
CORS_ORIGIN=http://localhost:3000,http://web:3000

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:5000
API_URL=http://api:5000
NEXT_TELEMETRY_DISABLED=1
```

## 🔒 Security Best Practices

1. **Non-root users**: Tất cả containers chạy với non-root users
2. **Multi-stage builds**: Giảm thiểu attack surface
3. **Health checks**: Monitoring và auto-restart
4. **Resource limits**: Giới hạn CPU và memory
5. **Network isolation**: Services chỉ communicate qua internal network
6. **Environment variables**: Sensitive data qua environment variables

## 📊 Monitoring & Logs

### Xem logs của specific service
```bash
make logs-web       # Web service logs
make logs-api       # API service logs  
make logs-db        # Database logs
make logs-redis     # Redis logs
```

### Xem logs tất cả services
```bash
make prod-logs      # Production logs
make dev-logs       # Development logs
```

## 🛠️ Troubleshooting

### Port conflicts
```bash
# Kiểm tra ports đang sử dụng
netstat -tulpn | grep :3000
netstat -tulpn | grep :5000

# Kill processes nếu cần
sudo kill -9 $(lsof -t -i:3000)
sudo kill -9 $(lsof -t -i:5000)
```

### Container issues
```bash
# Xem container status
docker-compose ps

# Restart specific service
docker-compose restart web
docker-compose restart api

# Rebuild specific service
docker-compose build --no-cache web
```

### Database issues
```bash
# Connect to database
docker-compose exec db psql -U postgres -d nynus_db

# Reset database
make db-reset

# Run migrations manually
docker-compose exec api npx prisma migrate deploy
```

## 🚀 Deployment

### Local Production Deployment
```bash
# Full deployment
make deploy

# Manual steps
make build-all
make prod-stop
make prod-start
make health-check
```

### CI/CD Integration
```bash
# Build and test
docker-compose build
docker-compose run --rm api npm test
docker-compose run --rm web npm test

# Deploy
docker-compose --env-file .env.docker up -d
```

## 📈 Performance Optimization

1. **Layer caching**: Dependencies cached separately from source code
2. **Multi-stage builds**: Smaller production images
3. **Resource limits**: Prevent resource exhaustion
4. **Health checks**: Quick failure detection
5. **Persistent volumes**: Database data persistence

## 🔄 Updates & Maintenance

### Update dependencies
```bash
# Update base images
docker-compose pull

# Rebuild with latest dependencies
make build-all
```

### Backup & Restore
```bash
# Backup database
docker-compose exec db pg_dump -U postgres nynus_db > backup.sql

# Restore database
docker-compose exec -T db psql -U postgres nynus_db < backup.sql
```
