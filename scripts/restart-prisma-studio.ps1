# Script để khởi động lại Prisma Studio
Write-Host "Đang kiểm tra và khởi động lại Prisma Studio..." -ForegroundColor Cyan

# Hàm để kiểm tra xem port có đang được sử dụng không
function Test-PortInUse {
    param (
        [Parameter(Mandatory=$true)]
        [int]$Port
    )
    
    try {
        $inUse = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        return ($null -ne $inUse)
    } catch {
        return $false
    }
}

# Hàm để giải phóng port
function Free-Port {
    param (
        [Parameter(Mandatory=$true)]
        [int]$Port
    )
    
    Write-Host "Đang giải phóng cổng $Port..." -ForegroundColor Yellow
    
    # Lấy tất cả các process đang sử dụng port này
    $processIds = @(Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess)
    
    if ($processIds.Count -eq 0) {
        Write-Host "Không tìm thấy process nào đang sử dụng cổng $Port." -ForegroundColor Yellow
        return
    }
    
    # Kill từng process
    foreach ($pid in $processIds) {
        Write-Host "Đang kill process $pid sử dụng cổng $Port..." -ForegroundColor Yellow
        try {
            Stop-Process -Id $pid -Force -ErrorAction Stop
            Write-Host "Đã kill process $pid thành công." -ForegroundColor Green
        } catch {
            Write-Host "Không thể kill process $pid: $_" -ForegroundColor Red
            try {
                # Thử dùng taskkill nếu Stop-Process không thành công
                taskkill /F /PID $pid
                Write-Host "Đã kill process $pid thành công bằng taskkill." -ForegroundColor Green
            } catch {
                Write-Host "Không thể kill process $pid bằng taskkill: $_" -ForegroundColor Red
            }
        }
    }
    
    # Chờ một chút để hệ thống giải phóng port
    Start-Sleep -Seconds 1
    
    # Kiểm tra lại xem port đã được giải phóng chưa
    if (Test-PortInUse -Port $Port) {
        Write-Host "Không thể giải phóng cổng $Port." -ForegroundColor Red
        return $false
    } else {
        Write-Host "Cổng $Port đã được giải phóng thành công." -ForegroundColor Green
        return $true
    }
}

# Kiểm tra xem Prisma Studio có đang chạy không
if (Test-PortInUse -Port 8386) {
    Write-Host "Prisma Studio đang chạy trên cổng 8386." -ForegroundColor Yellow
    Write-Host "Đang dừng Prisma Studio hiện tại..." -ForegroundColor Yellow
    
    # Giải phóng cổng 8386
    $freed = Free-Port -Port 8386
    
    if (-not $freed) {
        Write-Host "Không thể dừng Prisma Studio hiện tại. Vui lòng thử lại sau." -ForegroundColor Red
        exit
    }
}

# Khởi động lại Prisma Studio
Write-Host "Đang khởi động lại Prisma Studio..." -ForegroundColor Green

# Di chuyển đến thư mục apps/api
Set-Location -Path "$PSScriptRoot\..\apps\api"

# Khởi động Prisma Studio trong một tab mới
Start-Process powershell -ArgumentList "-NoExit", "-Command", "pnpx prisma studio --port 8386"

# Chờ một chút để Prisma Studio khởi động
Write-Host "Đang chờ Prisma Studio khởi động..." -ForegroundColor Blue
Start-Sleep -Seconds 3

# Kiểm tra xem Prisma Studio đã khởi động thành công chưa
if (Test-PortInUse -Port 8386) {
    Write-Host "Prisma Studio đã khởi động thành công trên cổng 8386." -ForegroundColor Green
    
    # Mở trình duyệt
    Write-Host "Đang mở Prisma Studio trong trình duyệt..." -ForegroundColor Blue
    Start-Process "http://localhost:8386"
} else {
    Write-Host "Không thể khởi động Prisma Studio. Vui lòng kiểm tra lại." -ForegroundColor Red
}

# Quay lại thư mục gốc
Set-Location -Path "$PSScriptRoot\.."
