# Docker Production Environment Script for NyNus
# This script manages the production Docker environment

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("start", "stop", "restart", "logs", "clean", "build", "status", "deploy")]
    [string]$Action
)

$ErrorActionPreference = "Stop"

Write-Host "🐳 NyNus Docker Production Environment Manager" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

switch ($Action) {
    "start" {
        Write-Host "🚀 Starting production environment..." -ForegroundColor Green
        
        # Check if .env.docker exists
        if (-not (Test-Path ".env.docker")) {
            Write-Host "⚠️  .env.docker file not found. Creating from template..." -ForegroundColor Yellow
            Copy-Item ".env.docker" ".env" -ErrorAction SilentlyContinue
        }
        
        # Kill processes on ports if they exist
        Write-Host "🔍 Checking for processes on ports 3000, 5000, 5432, 6379..." -ForegroundColor Yellow
        
        $ports = @(3000, 5000, 5432, 6379)
        foreach ($port in $ports) {
            $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "⚠️  Port $port is in use. Attempting to free it..." -ForegroundColor Yellow
                Stop-Process -Id $process.OwningProcess -Force -ErrorAction SilentlyContinue
                Start-Sleep -Seconds 2
            }
        }
        
        # Start production services
        Write-Host "🐳 Starting Docker services..." -ForegroundColor Green
        docker-compose --env-file .env.docker up -d
        
        Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
        Start-Sleep -Seconds 30
        
        # Check service health
        Write-Host "🏥 Checking service health..." -ForegroundColor Green
        docker-compose ps
        
        Write-Host "✅ Production environment started!" -ForegroundColor Green
        Write-Host "📊 Services available at:" -ForegroundColor Cyan
        Write-Host "   - Web App: http://localhost:3000" -ForegroundColor White
        Write-Host "   - API: http://localhost:5000" -ForegroundColor White
        Write-Host "   - PostgreSQL: localhost:5432" -ForegroundColor White
        Write-Host "   - Redis: localhost:6379" -ForegroundColor White
    }
    
    "stop" {
        Write-Host "🛑 Stopping production environment..." -ForegroundColor Red
        docker-compose down
        Write-Host "✅ Production environment stopped!" -ForegroundColor Green
    }
    
    "restart" {
        Write-Host "🔄 Restarting production environment..." -ForegroundColor Yellow
        docker-compose down
        Start-Sleep -Seconds 5
        docker-compose --env-file .env.docker up -d
        Write-Host "✅ Production environment restarted!" -ForegroundColor Green
    }
    
    "logs" {
        Write-Host "📋 Showing logs..." -ForegroundColor Blue
        docker-compose logs -f
    }
    
    "clean" {
        Write-Host "🧹 Cleaning up production environment..." -ForegroundColor Red
        Write-Host "⚠️  This will remove all containers, volumes, and data!" -ForegroundColor Yellow
        $confirm = Read-Host "Are you sure? (y/N)"
        if ($confirm -eq "y" -or $confirm -eq "Y") {
            docker-compose down -v --remove-orphans
            docker system prune -f
            Write-Host "✅ Production environment cleaned!" -ForegroundColor Green
        } else {
            Write-Host "❌ Operation cancelled." -ForegroundColor Yellow
        }
    }
    
    "build" {
        Write-Host "🔨 Building production environment..." -ForegroundColor Blue
        docker-compose build --no-cache
        Write-Host "✅ Production environment built!" -ForegroundColor Green
    }
    
    "deploy" {
        Write-Host "🚀 Deploying production environment..." -ForegroundColor Green
        
        # Build images
        Write-Host "🔨 Building images..." -ForegroundColor Blue
        docker-compose build
        
        # Stop existing containers
        Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
        docker-compose down
        
        # Start new containers
        Write-Host "🚀 Starting new containers..." -ForegroundColor Green
        docker-compose --env-file .env.docker up -d
        
        # Wait and check health
        Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
        Start-Sleep -Seconds 30
        
        Write-Host "🏥 Checking service health..." -ForegroundColor Green
        docker-compose ps
        
        Write-Host "✅ Production deployment completed!" -ForegroundColor Green
    }
    
    "status" {
        Write-Host "📊 Production environment status:" -ForegroundColor Blue
        docker-compose ps
        Write-Host ""
        Write-Host "🐳 Docker system info:" -ForegroundColor Blue
        docker system df
        Write-Host ""
        Write-Host "🏥 Service health:" -ForegroundColor Blue
        docker-compose exec web curl -f http://localhost:3000/api/health 2>/dev/null || Write-Host "   Web: ❌ Not healthy" -ForegroundColor Red
        docker-compose exec api curl -f http://localhost:5000/health 2>/dev/null || Write-Host "   API: ❌ Not healthy" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎯 Available commands:" -ForegroundColor Cyan
Write-Host "   start   - Start production environment" -ForegroundColor White
Write-Host "   stop    - Stop production environment" -ForegroundColor White
Write-Host "   restart - Restart production environment" -ForegroundColor White
Write-Host "   logs    - Show logs" -ForegroundColor White
Write-Host "   clean   - Clean up everything (destructive)" -ForegroundColor White
Write-Host "   build   - Build images" -ForegroundColor White
Write-Host "   deploy  - Full deployment (build + restart)" -ForegroundColor White
Write-Host "   status  - Show status and health" -ForegroundColor White
