@echo off
echo 🔄 Cleaning up ports before starting dev server...

echo 🔍 Killing processes on port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    if not "%%a"=="0" (
        echo ❌ Killing process %%a on port 3000
        taskkill /f /pid %%a >nul 2>&1
    )
)

echo 🔍 Killing processes on port 5000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do (
    if not "%%a"=="0" (
        echo ❌ Killing process %%a on port 5000
        taskkill /f /pid %%a >nul 2>&1
    )
)

echo 🔍 Killing processes on port 8386...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8386') do (
    if not "%%a"=="0" (
        echo ❌ Killing process %%a on port 8386
        taskkill /f /pid %%a >nul 2>&1
    )
)

echo 🧹 Stopping Turbo daemon...
pnpm turbo daemon stop >nul 2>&1

timeout /t 1 /nobreak >nul

echo 🚀 Starting Turbo daemon...
pnpm turbo daemon start >nul 2>&1

echo ✅ Cleanup completed! Starting dev server...

echo 🚀 Starting development server...
pnpm turbo run dev
