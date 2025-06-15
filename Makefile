# =============================================================================
# NyNus Docker Management Makefile
# =============================================================================
# Convenient commands for managing NyNus Docker environment
# Usage: make <command>

.PHONY: help dev-start dev-stop dev-restart dev-logs dev-clean dev-build dev-status
.PHONY: prod-start prod-stop prod-restart prod-logs prod-clean prod-build prod-status
.PHONY: build-all build-web build-api health-check status deploy
.PHONY: db-migrate db-seed db-reset db-backup db-restore
.PHONY: logs-web logs-api logs-db logs-redis clean-all

# Default target
help:
	@echo "🐳 NyNus Docker Management Commands"
	@echo "=================================="
	@echo ""
	@echo "📋 Development Commands:"
	@echo "  dev-start     - Start development environment (DB + Redis + Prisma Studio)"
	@echo "  dev-stop      - Stop development environment"
	@echo "  dev-restart   - Restart development environment"
	@echo "  dev-logs      - Show development logs"
	@echo "  dev-clean     - Clean development environment (removes volumes)"
	@echo "  dev-build     - Build development environment"
	@echo "  dev-status    - Show development environment status"
	@echo ""
	@echo "🚀 Production Commands:"
	@echo "  prod-start    - Start production environment (all services)"
	@echo "  prod-stop     - Stop production environment"
	@echo "  prod-restart  - Restart production environment"
	@echo "  prod-logs     - Show production logs"
	@echo "  prod-clean    - Clean production environment (removes volumes)"
	@echo "  prod-build    - Build production environment"
	@echo "  prod-status   - Show production environment status"
	@echo ""
	@echo "🔨 Build Commands:"
	@echo "  build-all     - Build all Docker images"
	@echo "  build-web     - Build web service image"
	@echo "  build-api     - Build API service image"
	@echo ""
	@echo "🏥 Health & Status Commands:"
	@echo "  health-check  - Check health of all services"
	@echo "  status        - Show status of all environments"
	@echo "  deploy        - Full production deployment (build + start)"
	@echo ""
	@echo "📊 Logs Commands:"
	@echo "  logs-web      - Show web service logs"
	@echo "  logs-api      - Show API service logs"
	@echo "  logs-db       - Show database logs"
	@echo "  logs-redis    - Show Redis logs"
	@echo ""
	@echo "🗄️ Database Commands:"
	@echo "  db-migrate    - Run database migrations"
	@echo "  db-seed       - Seed database with sample data"
	@echo "  db-reset      - Reset database (destructive)"
	@echo "  db-backup     - Backup database"
	@echo "  db-restore    - Restore database from backup"
	@echo ""
	@echo "🧹 Cleanup Commands:"
	@echo "  clean-all     - Clean everything (destructive)"

# =============================================================================
# Development Environment Commands
# =============================================================================

dev-start:
	@echo "🚀 Starting development environment..."
	@docker-compose -f docker-compose.dev.yml up -d
	@echo "⏳ Waiting for services to be ready..."
	@sleep 10
	@echo "✅ Development environment started!"
	@echo "📊 Services available at:"
	@echo "   - PostgreSQL: localhost:5432"
	@echo "   - Redis: localhost:6379"
	@echo "   - Prisma Studio: http://localhost:8386"
	@echo "   - Adminer: http://localhost:8080"

dev-stop:
	@echo "🛑 Stopping development environment..."
	@docker-compose -f docker-compose.dev.yml down
	@echo "✅ Development environment stopped!"

dev-restart:
	@echo "🔄 Restarting development environment..."
	@docker-compose -f docker-compose.dev.yml down
	@sleep 3
	@docker-compose -f docker-compose.dev.yml up -d
	@echo "✅ Development environment restarted!"

dev-logs:
	@echo "📋 Showing development logs..."
	@docker-compose -f docker-compose.dev.yml logs -f

dev-clean:
	@echo "🧹 Cleaning development environment..."
	@echo "⚠️  This will remove all containers, volumes, and data!"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ] || exit 1
	@docker-compose -f docker-compose.dev.yml down -v --remove-orphans
	@echo "✅ Development environment cleaned!"

dev-build:
	@echo "🔨 Building development environment..."
	@docker-compose -f docker-compose.dev.yml build --no-cache
	@echo "✅ Development environment built!"

dev-status:
	@echo "📊 Development environment status:"
	@docker-compose -f docker-compose.dev.yml ps

# =============================================================================
# Production Environment Commands
# =============================================================================

prod-start:
	@echo "🚀 Starting production environment..."
	@docker-compose --env-file .env.docker up -d
	@echo "⏳ Waiting for services to be ready..."
	@sleep 30
	@echo "✅ Production environment started!"
	@echo "📊 Services available at:"
	@echo "   - Web App: http://localhost:3000"
	@echo "   - API: http://localhost:5000"
	@echo "   - PostgreSQL: localhost:5432"
	@echo "   - Redis: localhost:6379"

prod-stop:
	@echo "🛑 Stopping production environment..."
	@docker-compose --env-file .env.docker down
	@echo "✅ Production environment stopped!"

prod-restart:
	@echo "🔄 Restarting production environment..."
	@docker-compose --env-file .env.docker down
	@sleep 5
	@docker-compose --env-file .env.docker up -d
	@echo "✅ Production environment restarted!"

prod-logs:
	@echo "📋 Showing production logs..."
	@docker-compose --env-file .env.docker logs -f

prod-clean:
	@echo "🧹 Cleaning production environment..."
	@echo "⚠️  This will remove all containers, volumes, and data!"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ] || exit 1
	@docker-compose --env-file .env.docker down -v --remove-orphans
	@echo "✅ Production environment cleaned!"

prod-build:
	@echo "🔨 Building production environment..."
	@docker-compose --env-file .env.docker build --no-cache
	@echo "✅ Production environment built!"

prod-status:
	@echo "📊 Production environment status:"
	@docker-compose --env-file .env.docker ps

# =============================================================================
# Build Commands
# =============================================================================

build-all:
	@echo "🔨 Building all Docker images..."
	@docker-compose --env-file .env.docker build --no-cache
	@echo "✅ All images built successfully!"

build-web:
	@echo "🔨 Building web service image..."
	@docker-compose --env-file .env.docker build --no-cache web
	@echo "✅ Web service image built!"

build-api:
	@echo "🔨 Building API service image..."
	@docker-compose --env-file .env.docker build --no-cache api
	@echo "✅ API service image built!"

# =============================================================================
# Health & Status Commands
# =============================================================================

health-check:
	@echo "🏥 Checking service health..."
	@echo "Web Service:"
	@curl -f http://localhost:3000/api/health || echo "❌ Web service unhealthy"
	@echo "API Service:"
	@curl -f http://localhost:5000/health || echo "❌ API service unhealthy"
	@echo "Database:"
	@docker-compose --env-file .env.docker exec db pg_isready -U postgres || echo "❌ Database unhealthy"
	@echo "Redis:"
	@docker-compose --env-file .env.docker exec redis redis-cli ping || echo "❌ Redis unhealthy"

status:
	@echo "📊 Overall system status:"
	@echo ""
	@echo "Development Environment:"
	@docker-compose -f docker-compose.dev.yml ps
	@echo ""
	@echo "Production Environment:"
	@docker-compose --env-file .env.docker ps
	@echo ""
	@echo "Docker System Info:"
	@docker system df

deploy:
	@echo "🚀 Full production deployment..."
	@make build-all
	@make prod-stop
	@make prod-start
	@sleep 30
	@make health-check
	@echo "✅ Deployment completed!"

# =============================================================================
# Logs Commands
# =============================================================================

logs-web:
	@docker-compose --env-file .env.docker logs -f web

logs-api:
	@docker-compose --env-file .env.docker logs -f api

logs-db:
	@docker-compose --env-file .env.docker logs -f db

logs-redis:
	@docker-compose --env-file .env.docker logs -f redis

# =============================================================================
# Database Commands
# =============================================================================

db-migrate:
	@echo "🗄️ Running database migrations..."
	@docker-compose --env-file .env.docker exec api npx prisma migrate deploy
	@echo "✅ Database migrations completed!"

db-seed:
	@echo "🌱 Seeding database..."
	@docker-compose --env-file .env.docker exec api npm run seed
	@echo "✅ Database seeded!"

db-reset:
	@echo "🗄️ Resetting database..."
	@echo "⚠️  This will destroy all data!"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ] || exit 1
	@docker-compose --env-file .env.docker exec api npx prisma migrate reset --force
	@echo "✅ Database reset completed!"

db-backup:
	@echo "💾 Creating database backup..."
	@mkdir -p ./backups
	@docker-compose --env-file .env.docker exec db pg_dump -U postgres nynus_db > ./backups/backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✅ Database backup created!"

db-restore:
	@echo "📥 Restoring database..."
	@echo "Available backups:"
	@ls -la ./backups/
	@read -p "Enter backup filename: " backup && \
	docker-compose --env-file .env.docker exec -T db psql -U postgres nynus_db < ./backups/$$backup
	@echo "✅ Database restored!"

# =============================================================================
# Cleanup Commands
# =============================================================================

clean-all:
	@echo "🧹 Cleaning everything..."
	@echo "⚠️  This will remove ALL containers, volumes, images, and data!"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ] || exit 1
	@docker-compose -f docker-compose.dev.yml down -v --remove-orphans
	@docker-compose --env-file .env.docker down -v --remove-orphans
	@docker system prune -af --volumes
	@echo "✅ Everything cleaned!"
