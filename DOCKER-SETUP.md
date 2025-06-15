# 🐳 NyNus Docker Setup Guide

Hướng dẫn chi tiết về Docker architecture và development workflow cho NyNus monorepo.

## 📋 Tổng quan

NyNus sử dụng Docker để containerize toàn bộ stack với 4 services chính:

- **Web**: Next.js frontend (port 3000)
- **API**: NestJS backend (port 5000)  
- **Database**: PostgreSQL 15 (port 5432)
- **Redis**: Redis cache (port 6379)

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Next.js Web   │    │   NestJS API    │
│   (Port 3000)   │◄──►│   (Port 5000)   │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────┬───────────┘
                     │
         ┌─────────────────┐    ┌─────────────────┐
         │   PostgreSQL    │    │     Redis       │
         │   (Port 5432)   │    │   (Port 6379)   │
         └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Development Environment

```powershell
# Khởi động development environment
.\scripts\docker-dev.ps1 start

# Xem logs
.\scripts\docker-dev.ps1 logs -Follow

# Dừng environment
.\scripts\docker-dev.ps1 stop
```

### Production Environment

```powershell
# Build và khởi động production
docker-compose --env-file .env.docker up -d

# Xem status
docker-compose ps

# Dừng production
docker-compose down
```

## 📁 Files Structure

```
├── docker-compose.yml              # Production compose
├── docker-compose.dev.yml          # Development compose  
├── .env.docker                     # Production environment
├── .env.dev                        # Development environment
├── .dockerignore                   # Docker ignore patterns
├── apps/
│   ├── web/
│   │   ├── Dockerfile              # Production web build
│   │   └── Dockerfile.dev          # Development web build
│   └── api/
│       ├── Dockerfile              # Production API build
│       └── Dockerfile.dev          # Development API build
└── scripts/
    └── docker-dev.ps1              # Development management script
```

## 🛠️ Development Workflow

### 1. Khởi động Development Environment

```powershell
# Khởi động tất cả services
.\scripts\docker-dev.ps1 start

# Hoặc khởi động từng service
.\scripts\docker-dev.ps1 start -Service web
.\scripts\docker-dev.ps1 start -Service api
```

### 2. Hot Reload Development

Development environment sử dụng volume mounts để enable hot reload:

- **Web**: Thay đổi code trong `apps/web/` sẽ tự động reload
- **API**: Thay đổi code trong `apps/api/` sẽ tự động restart
- **Packages**: Thay đổi trong `packages/` sẽ được detect

### 3. Debugging

```powershell
# Xem logs của service cụ thể
.\scripts\docker-dev.ps1 logs api -Follow

# Truy cập shell của container
.\scripts\docker-dev.ps1 shell web

# Kết nối PostgreSQL
.\scripts\docker-dev.ps1 db

# Kiểm tra health
.\scripts\docker-dev.ps1 health
```

### 4. Database Management

```powershell
# Truy cập PostgreSQL shell
.\scripts\docker-dev.ps1 db

# Hoặc sử dụng Adminer (GUI)
# http://localhost:8080
```

## 🔧 Management Commands

### Docker Development Script

```powershell
# Các lệnh cơ bản
.\scripts\docker-dev.ps1 start      # Khởi động
.\scripts\docker-dev.ps1 stop       # Dừng
.\scripts\docker-dev.ps1 restart    # Khởi động lại
.\scripts\docker-dev.ps1 status     # Trạng thái

# Logs và debugging
.\scripts\docker-dev.ps1 logs       # Xem logs
.\scripts\docker-dev.ps1 logs api -Follow  # Follow logs của API
.\scripts\docker-dev.ps1 shell web  # Shell vào web container
.\scripts\docker-dev.ps1 db         # PostgreSQL shell

# Build và cleanup
.\scripts\docker-dev.ps1 build      # Build lại images
.\scripts\docker-dev.ps1 clean      # Dọn dẹp (cẩn thận!)
.\scripts\docker-dev.ps1 health     # Kiểm tra health
```

## 🌐 Service URLs

### Development
- **Web**: http://localhost:3000
- **API**: http://localhost:5000
- **API Docs**: http://localhost:5000/api/docs (khi enable Swagger)
- **Database**: localhost:5432
- **Redis**: localhost:6379
- **Adminer**: http://localhost:8080

### Health Checks
- **Web Health**: http://localhost:3000/api/health
- **API Health**: http://localhost:5000/health

## 🔒 Environment Variables

### Development (.env.dev)
- Sử dụng passwords đơn giản
- Debug mode enabled
- Hot reload enabled
- Reduced security cho development

### Production (.env.docker)
- Strong passwords
- Production optimizations
- Security hardening
- Performance tuning

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**
   ```powershell
   # Script tự động kill processes trên ports
   .\scripts\docker-dev.ps1 start
   ```

2. **Build failures**
   ```powershell
   # Clean và rebuild
   .\scripts\docker-dev.ps1 clean
   .\scripts\docker-dev.ps1 build
   ```

3. **Database connection issues**
   ```powershell
   # Kiểm tra database health
   .\scripts\docker-dev.ps1 health
   
   # Restart database
   docker-compose -f docker-compose.dev.yml restart db
   ```

4. **Volume mount issues**
   ```powershell
   # Restart với fresh volumes
   .\scripts\docker-dev.ps1 stop
   docker volume prune
   .\scripts\docker-dev.ps1 start
   ```

### Logs Analysis

```powershell
# Xem logs của tất cả services
.\scripts\docker-dev.ps1 logs

# Xem logs của service cụ thể
.\scripts\docker-dev.ps1 logs api

# Follow logs real-time
.\scripts\docker-dev.ps1 logs web -Follow
```

## 📊 Performance

### Resource Limits

**Development:**
- Web: 1 CPU, 1GB RAM
- API: 1.5 CPU, 2GB RAM
- DB: 1 CPU, 1GB RAM
- Redis: 0.5 CPU, 512MB RAM

**Production:**
- Tương tự nhưng có thể scale theo nhu cầu

### Build Optimization

- Multi-stage builds để giảm image size
- Layer caching để tăng tốc builds
- .dockerignore để exclude unnecessary files
- Shared base images

## 🔄 CI/CD Integration

Docker setup sẵn sàng cho CI/CD với:
- Consistent environments
- Health checks
- Graceful shutdowns
- Environment-specific configs

## 📚 Next Steps

1. **Production Deployment**: Xem `DOCKER.md` cho production setup
2. **Monitoring**: Thêm monitoring stack (Prometheus, Grafana)
3. **Scaling**: Implement horizontal scaling với Docker Swarm/Kubernetes
4. **Security**: Enhance security với secrets management
