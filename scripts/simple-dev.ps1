# Simple dev script without emoji for better compatibility
Write-Host "NyNus Development Server" -ForegroundColor Magenta
Write-Host "========================" -ForegroundColor Magenta

# Kill processes on ports using taskkill
$ports = @(3000, 5000, 8386)
Write-Host "Cleaning up ports..." -ForegroundColor Yellow

foreach ($port in $ports) {
    Write-Host "Checking port $port..." -ForegroundColor Cyan

    # Use netstat to find processes
    $netstatOutput = & netstat -ano | Select-String ":$port "

    if ($netstatOutput) {
        foreach ($line in $netstatOutput) {
            # Extract PID from netstat output
            $parts = $line.ToString().Split(' ', [StringSplitOptions]::RemoveEmptyEntries)
            if ($parts.Length -ge 5) {
                $processId = $parts[-1]
                if ($processId -match '^\d+$') {
                    Write-Host "Killing PID $processId on port $port" -ForegroundColor Red
                    & taskkill /f /pid $processId 2>$null
                }
            }
        }
    } else {
        Write-Host "Port $port is free" -ForegroundColor Green
    }
}

# Restart Turbo daemon
Write-Host "Restarting Turbo daemon..." -ForegroundColor Cyan
Write-Host "Stopping daemon..." -ForegroundColor Yellow
& pnpm turbo daemon stop
Start-Sleep -Seconds 2

Write-Host "Starting daemon..." -ForegroundColor Yellow
& pnpm turbo daemon start
Start-Sleep -Seconds 2

Write-Host "Starting development server..." -ForegroundColor Green
Write-Host "Web: http://localhost:3000" -ForegroundColor Green
Write-Host "API: http://localhost:5000" -ForegroundColor Green
Write-Host "Prisma: http://localhost:8386" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Magenta

# Start dev server
Write-Host "Executing: pnpm turbo run dev" -ForegroundColor Cyan
& pnpm turbo run dev
