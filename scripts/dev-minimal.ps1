# Minimal dev script - just kill ports and run dev
Write-Host "=== NyNus Dev Server ===" -ForegroundColor Magenta

# Kill processes on common ports
Write-Host "Cleaning ports..." -ForegroundColor Yellow
$ports = @(3000, 5000, 8386)
foreach ($port in $ports) {
    $procs = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($procs) {
        $procs | ForEach-Object {
            $pid = $_.OwningProcess
            Write-Host "Killing PID $pid on port $port" -ForegroundColor Red
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
    }
}

# Quick turbo restart
Write-Host "Restarting turbo..." -ForegroundColor Cyan
Start-Process -FilePath "pnpm" -ArgumentList "turbo", "daemon", "stop" -Wait -NoNewWindow
Start-Process -FilePath "pnpm" -ArgumentList "turbo", "daemon", "start" -Wait -NoNewWindow

Write-Host "Starting dev server..." -ForegroundColor Green
Write-Host "========================" -ForegroundColor Magenta

# Run dev
Invoke-Expression "pnpm turbo run dev"
