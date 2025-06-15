# Docker Development Environment Script for NyNus
# This script manages the development Docker environment

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("start", "stop", "restart", "logs", "clean", "build", "status", "shell", "db", "health")]
    [string]$Action,

    [Parameter(Mandatory=$false)]
    [ValidateSet("web", "api", "db", "redis", "all")]
    [string]$Service = "all",

    [Parameter(Mandatory=$false)]
    [switch]$Follow
)

$ErrorActionPreference = "Stop"

# Docker Compose configuration
$ComposeFile = "docker-compose.dev.yml"
$EnvFile = ".env.dev"

Write-Host "🐳 NyNus Docker Development Environment Manager" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

switch ($Action) {
    "start" {
        Write-Host "🚀 Starting development environment..." -ForegroundColor Green
        
        # Kill processes on ports if they exist
        Write-Host "🔍 Checking for processes on ports 3000, 5000, 5432, 6379, 8386..." -ForegroundColor Yellow
        
        $ports = @(3000, 5000, 5432, 6379, 8386)
        foreach ($port in $ports) {
            $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "⚠️  Port $port is in use. Attempting to free it..." -ForegroundColor Yellow
                Stop-Process -Id $process.OwningProcess -Force -ErrorAction SilentlyContinue
                Start-Sleep -Seconds 2
            }
        }
        
        # Start development services
        Write-Host "🐳 Starting Docker services..." -ForegroundColor Green
        docker-compose -f $ComposeFile --env-file $EnvFile up -d
        
        Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        
        # Check service health
        Write-Host "🏥 Checking service health..." -ForegroundColor Green
        docker-compose -f $ComposeFile ps
        
        Write-Host "✅ Development environment started!" -ForegroundColor Green
        Write-Host "📊 Services available at:" -ForegroundColor Cyan
        Write-Host "   - Web (Next.js): http://localhost:3000" -ForegroundColor White
        Write-Host "   - API (NestJS): http://localhost:5000" -ForegroundColor White
        Write-Host "   - PostgreSQL: localhost:5432" -ForegroundColor White
        Write-Host "   - Redis: localhost:6379" -ForegroundColor White
        Write-Host "   - Adminer: http://localhost:8080" -ForegroundColor White
    }
    
    "stop" {
        Write-Host "🛑 Stopping development environment..." -ForegroundColor Red
        docker-compose -f $ComposeFile down
        Write-Host "✅ Development environment stopped!" -ForegroundColor Green
    }

    "restart" {
        Write-Host "🔄 Restarting development environment..." -ForegroundColor Yellow
        docker-compose -f $ComposeFile down
        Start-Sleep -Seconds 3
        docker-compose -f $ComposeFile --env-file $EnvFile up -d
        Write-Host "✅ Development environment restarted!" -ForegroundColor Green
    }
    
    "logs" {
        Write-Host "📋 Showing logs..." -ForegroundColor Blue
        if ($Service -eq "all") {
            if ($Follow) {
                docker-compose -f $ComposeFile logs -f
            } else {
                docker-compose -f $ComposeFile logs
            }
        } else {
            if ($Follow) {
                docker-compose -f $ComposeFile logs -f $Service
            } else {
                docker-compose -f $ComposeFile logs $Service
            }
        }
    }
    
    "clean" {
        Write-Host "🧹 Cleaning up development environment..." -ForegroundColor Red
        Write-Host "⚠️  This will remove all containers, volumes, and data!" -ForegroundColor Yellow
        $confirm = Read-Host "Are you sure? (y/N)"
        if ($confirm -eq "y" -or $confirm -eq "Y") {
            docker-compose -f $ComposeFile down -v --remove-orphans
            docker system prune -f
            Write-Host "✅ Development environment cleaned!" -ForegroundColor Green
        } else {
            Write-Host "❌ Operation cancelled." -ForegroundColor Yellow
        }
    }
    
    "build" {
        Write-Host "🔨 Building development environment..." -ForegroundColor Blue
        docker-compose -f $ComposeFile build --no-cache
        Write-Host "✅ Development environment built!" -ForegroundColor Green
    }

    "status" {
        Write-Host "📊 Development environment status:" -ForegroundColor Blue
        docker-compose -f $ComposeFile ps
        Write-Host ""
        Write-Host "🐳 Docker system info:" -ForegroundColor Blue
        docker system df
    }

    "shell" {
        if ($Service -eq "all") {
            Write-Host "❌ Please specify a service for shell access" -ForegroundColor Red
            Write-Host "Available services: web, api, db, redis" -ForegroundColor Yellow
            return
        }
        Write-Host "🐚 Opening shell for service: $Service" -ForegroundColor Blue
        $container = "nynus_${Service}_dev"
        docker exec -it $container /bin/sh
    }

    "db" {
        Write-Host "🗄️  Connecting to PostgreSQL..." -ForegroundColor Blue
        docker exec -it nynus_db_dev psql -U postgres -d nynus_db
    }

    "health" {
        Write-Host "🏥 Checking service health..." -ForegroundColor Blue
        $services = @("web", "api", "db", "redis")
        foreach ($service in $services) {
            $container = "nynus_${service}_dev"
            $health = docker inspect --format='{{.State.Health.Status}}' $container 2>$null
            if ($health) {
                $status = if ($health -eq "healthy") { "✅" } else { "❌" }
                Write-Host "  $status $service`: $health" -ForegroundColor White
            } else {
                Write-Host "  ❓ $service`: not running" -ForegroundColor Yellow
            }
        }
    }
}

Write-Host ""
Write-Host "🎯 Available commands:" -ForegroundColor Cyan
Write-Host "   start   - Start development environment" -ForegroundColor White
Write-Host "   stop    - Stop development environment" -ForegroundColor White
Write-Host "   restart - Restart development environment" -ForegroundColor White
Write-Host "   logs    - Show logs (use -Follow for live logs)" -ForegroundColor White
Write-Host "   clean   - Clean up everything (destructive)" -ForegroundColor White
Write-Host "   build   - Build images" -ForegroundColor White
Write-Host "   status  - Show status" -ForegroundColor White
Write-Host "   shell   - Open shell in service (specify -Service)" -ForegroundColor White
Write-Host "   db      - Connect to PostgreSQL" -ForegroundColor White
Write-Host "   health  - Check service health" -ForegroundColor White
Write-Host ""
Write-Host "📝 Examples:" -ForegroundColor Cyan
Write-Host "   .\scripts\docker-dev.ps1 start" -ForegroundColor Green
Write-Host "   .\scripts\docker-dev.ps1 logs api -Follow" -ForegroundColor Green
Write-Host "   .\scripts\docker-dev.ps1 shell web" -ForegroundColor Green
