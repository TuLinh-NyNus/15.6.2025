# Enhanced dev script with port cleanup and turbo management
param(
    [switch]$SkipCleanup,
    [switch]$Verbose
)

$ErrorActionPreference = "SilentlyContinue"

function Write-ColoredOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Kill-ProcessOnPort {
    param([int]$Port)

    if ($Verbose) { Write-ColoredOutput "[INFO] Checking port $Port..." "Cyan" }

    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue

    if ($connections) {
        foreach ($conn in $connections) {
            $processId = $conn.OwningProcess
            try {
                $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
                if ($process) {
                    Write-ColoredOutput "[KILL] Killing '$($process.ProcessName)' (PID: $processId) on port $Port" "Red"
                    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                    Start-Sleep -Milliseconds 300
                }
            }
            catch {
                if ($Verbose) { Write-ColoredOutput "[WARN] Could not kill process $processId" "Yellow" }
            }
        }
    } else {
        if ($Verbose) { Write-ColoredOutput "[OK] Port $Port is free" "Green" }
    }
}

# Main execution
Write-ColoredOutput "=== NyNus Development Server Startup ===" "Magenta"
Write-ColoredOutput "=========================================" "Magenta"

if (-not $SkipCleanup) {
    Write-ColoredOutput "[PHASE 1] Port Cleanup" "Yellow"

    $ports = @(3000, 5000, 8386)
    foreach ($port in $ports) {
        Kill-ProcessOnPort -Port $port
    }

    Write-ColoredOutput "[PHASE 2] Turbo Daemon Management" "Yellow"

    # Stop turbo daemon
    Write-ColoredOutput "[TURBO] Stopping Turbo daemon..." "Cyan"
    & pnpm turbo daemon stop 2>$null
    Start-Sleep -Seconds 1

    # Clean stale PID files
    $turboCacheDir = "$env:LOCALAPPDATA\Temp\turbod"
    if (Test-Path $turboCacheDir) {
        if ($Verbose) { Write-ColoredOutput "[TURBO] Cleaning Turbo cache directory..." "Cyan" }
        Remove-Item $turboCacheDir -Recurse -Force -ErrorAction SilentlyContinue
    }

    # Start turbo daemon
    Write-ColoredOutput "[TURBO] Starting Turbo daemon..." "Cyan"
    & pnpm turbo daemon start 2>$null
    Start-Sleep -Seconds 1

    Write-ColoredOutput "[SUCCESS] Cleanup completed!" "Green"
} else {
    Write-ColoredOutput "[SKIP] Skipping cleanup (--SkipCleanup flag)" "Yellow"
}

Write-ColoredOutput "[PHASE 3] Starting Development Server" "Yellow"
Write-ColoredOutput "[URL] Web: http://localhost:3000" "Green"
Write-ColoredOutput "[URL] API: http://localhost:5000" "Green"
Write-ColoredOutput "[URL] Prisma Studio: http://localhost:8386" "Green"
Write-ColoredOutput "=========================================" "Magenta"

# Start the development server
& pnpm turbo run dev
