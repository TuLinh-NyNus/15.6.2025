# Script để khởi động lại toàn bộ ứng dụng
Write-Host "=== KHỞI ĐỘNG LẠI ỨNG DỤNG NYNUS ===" -ForegroundColor Cyan

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
        return $true
    }
    
    # Kill từng process
    $allKilled = $true
    foreach ($pid in $processIds) {
        Write-Host "Đang kill process $pid sử dụng cổng $Port..." -ForegroundColor Yellow
        try {
            # Lấy thông tin về process
            $processInfo = Get-Process -Id $pid -ErrorAction SilentlyContinue
            if ($processInfo) {
                $processName = $processInfo.ProcessName
                Write-Host "Process: $processName (PID: $pid)" -ForegroundColor Yellow
            }
            
            # Thử kill process bằng Stop-Process
            Stop-Process -Id $pid -Force -ErrorAction Stop
            Write-Host "Đã kill process $pid thành công." -ForegroundColor Green
        } catch {
            Write-Host "Không thể kill process $pid bằng Stop-Process, thử dùng taskkill..." -ForegroundColor Yellow
            try {
                # Thử dùng taskkill nếu Stop-Process không thành công
                taskkill /F /PID $pid
                Write-Host "Đã kill process $pid thành công bằng taskkill." -ForegroundColor Green
            } catch {
                Write-Host "Không thể kill process $pid: $_" -ForegroundColor Red
                $allKilled = $false
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

# Dừng tất cả các ứng dụng đang chạy
$ports = @(3000, 5000, 8386)
$allPortsFreed = $true

foreach ($port in $ports) {
    $result = Free-Port -Port $port
    if (-not $result) {
        $allPortsFreed = $false
    }
}

if (-not $allPortsFreed) {
    Write-Host "Cảnh báo: Một số cổng không thể giải phóng hoàn toàn." -ForegroundColor Yellow
    Write-Host "Bạn có muốn tiếp tục khởi động lại ứng dụng? (Y/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -ne "Y" -and $response -ne "y") {
        Write-Host "Đã hủy khởi động lại ứng dụng." -ForegroundColor Red
        exit
    }
}

# Kiểm tra lại tất cả các cổng
foreach ($port in $ports) {
    if (Test-PortInUse -Port $port) {
        Write-Host "CẢNH BÁO: Cổng $port vẫn đang được sử dụng!" -ForegroundColor Red
    }
}

# Khởi động lại ứng dụng
Write-Host "Đang khởi động lại ứng dụng..." -ForegroundColor Green

# Khởi động Prisma Studio trong một tab mới
Write-Host "Đang khởi động Prisma Studio..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $PSScriptRoot\..\apps\api ; pnpx prisma studio --port 8386"

# Chờ một chút để Prisma Studio khởi động
Start-Sleep -Seconds 2

# Khởi động dự án
Write-Host "Đang khởi động dự án chính..." -ForegroundColor Blue
pnpm dev
