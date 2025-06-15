# Simple Docker Start Script for NyNus Development

Write-Host "🐳 Starting NyNus Development Environment..." -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Kill processes on ports if they exist
Write-Host "🔍 Checking for processes on ports..." -ForegroundColor Yellow
$ports = @(3000, 5000, 5432, 6379, 8080)
foreach ($port in $ports) {
    $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "⚠️  Port $port is in use. Attempting to free it..." -ForegroundColor Yellow
        Stop-Process -Id $process.OwningProcess -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
}

# Start development services
Write-Host "🚀 Starting Docker services..." -ForegroundColor Green
docker compose -f docker-compose.dev.yml --env-file .env.dev up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Services started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Services available at:" -ForegroundColor Cyan
    Write-Host "   - Web (Next.js): http://localhost:3000" -ForegroundColor White
    Write-Host "   - API (NestJS): http://localhost:5000" -ForegroundColor White
    Write-Host "   - PostgreSQL: localhost:5432" -ForegroundColor White
    Write-Host "   - Redis: localhost:6379" -ForegroundColor White
    Write-Host "   - Adminer: http://localhost:8080" -ForegroundColor White
    Write-Host ""
    Write-Host "🔍 To check status: docker compose -f docker-compose.dev.yml ps" -ForegroundColor Yellow
    Write-Host "📋 To view logs: docker compose -f docker-compose.dev.yml logs -f" -ForegroundColor Yellow
    Write-Host "🛑 To stop: docker compose -f docker-compose.dev.yml down" -ForegroundColor Yellow
} else {
    Write-Host "❌ Failed to start services. Check the output above for errors." -ForegroundColor Red
}
