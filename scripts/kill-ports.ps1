# Kill processes on specific ports before starting dev server
Write-Host "[CLEANUP] Cleaning up ports before starting dev server..." -ForegroundColor Yellow

$ports = @(3000, 5000, 8386)

foreach ($port in $ports) {
    Write-Host "[CHECK] Checking port $port..." -ForegroundColor Cyan

    # Find processes using the port
    $processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess

    if ($processes) {
        foreach ($processId in $processes) {
            try {
                $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
                if ($process) {
                    Write-Host "[KILL] Killing process '$($process.ProcessName)' (PID: $processId) on port $port" -ForegroundColor Red
                    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                    Start-Sleep -Milliseconds 500
                }
            }
            catch {
                Write-Host "[WARN] Could not kill process $processId" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "[OK] Port $port is free" -ForegroundColor Green
    }
}

Write-Host "[TURBO] Stopping Turbo daemon..." -ForegroundColor Cyan
try {
    & pnpm turbo daemon stop 2>$null
    Start-Sleep -Seconds 1
} catch {
    Write-Host "[WARN] Turbo daemon was not running" -ForegroundColor Yellow
}

Write-Host "[TURBO] Starting Turbo daemon..." -ForegroundColor Cyan
try {
    & pnpm turbo daemon start
    Start-Sleep -Seconds 1
} catch {
    Write-Host "[WARN] Could not start Turbo daemon" -ForegroundColor Yellow
}

Write-Host "[SUCCESS] Cleanup completed! Ready to start dev server." -ForegroundColor Green
