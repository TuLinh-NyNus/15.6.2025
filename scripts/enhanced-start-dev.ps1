# Script khởi động cải tiến cho môi trường phát triển
Write-Host "=== KHỞI ĐỘNG DỰ ÁN NYNUS ===" -ForegroundColor Cyan
Write-Host "Đang giải phóng cổng 3000, 5000 và 8386..." -ForegroundColor Yellow

$ports = @(3000, 5000, 8386)
$maxRetries = 5  # Tăng số lần thử
$waitTime = 1000  # Tăng thời gian chờ giữa các lần thử (milliseconds)

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
    
    Write-Host "Đang kiểm tra cổng $Port..." -ForegroundColor Blue
    
    $retries = 0
    while ($retries -lt $maxRetries) {
        if (-not (Test-PortInUse -Port $Port)) {
            Write-Host "Cổng $Port không được sử dụng." -ForegroundColor Green
            return
        }
        
        Write-Host "Cổng $Port đang được sử dụng. Lần thử $($retries + 1)/$maxRetries" -ForegroundColor Yellow
        
        # Lấy tất cả các process đang sử dụng port này
        $processIds = @(Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess)
        
        if ($processIds.Count -eq 0) {
            Write-Host "Không tìm thấy process nào đang sử dụng cổng $Port." -ForegroundColor Yellow
            $retries++
            Start-Sleep -Milliseconds $waitTime
            continue
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
                
                # Thêm bước kiểm tra xem process đã thực sự bị kill chưa
                Start-Sleep -Milliseconds 500
                $processStillRunning = Get-Process -Id $pid -ErrorAction SilentlyContinue
                if ($processStillRunning) {
                    Write-Host "Process $pid vẫn đang chạy, thử dùng taskkill..." -ForegroundColor Yellow
                    # Nếu vẫn chạy, thử dùng taskkill
                    taskkill /F /PID $pid
                }
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
        
        # Chờ lâu hơn để hệ thống giải phóng port
        Start-Sleep -Milliseconds $waitTime
        
        # Kiểm tra lại xem port đã được giải phóng chưa
        if (-not (Test-PortInUse -Port $Port)) {
            Write-Host "Cổng $Port đã được giải phóng thành công." -ForegroundColor Green
            return
        }
        
        $retries++
    }
    
    # Nếu đã thử hết số lần mà vẫn không giải phóng được
    Write-Host "Không thể giải phóng cổng $Port sau $maxRetries lần thử." -ForegroundColor Red
    
    # Thử một cách cuối cùng bằng netsh (yêu cầu quyền admin)
    try {
        Write-Host "Thử giải phóng cổng $Port bằng netsh..." -ForegroundColor Yellow
        # Lệnh này yêu cầu quyền admin
        netsh interface ipv4 delete tcpconnection listenport=$Port
        
        # Kiểm tra lại một lần nữa
        Start-Sleep -Milliseconds $waitTime
        if (-not (Test-PortInUse -Port $Port)) {
            Write-Host "Cổng $Port đã được giải phóng thành công bằng netsh." -ForegroundColor Green
            return
        } else {
            Write-Host "Không thể giải phóng cổng $Port bằng netsh." -ForegroundColor Red
        }
    } catch {
        Write-Host "Lỗi khi sử dụng netsh: $_" -ForegroundColor Red
    }
}

# Giải phóng từng port
foreach ($port in $ports) {
    Free-Port -Port $port
}

# Kiểm tra lại tất cả các cổng
$allPortsFree = $true
foreach ($port in $ports) {
    if (Test-PortInUse -Port $port) {
        Write-Host "CẢNH BÁO: Cổng $port vẫn đang được sử dụng!" -ForegroundColor Red
        $allPortsFree = $false
    }
}

if (-not $allPortsFree) {
    Write-Host "Một số cổng vẫn đang bị chiếm. Bạn có muốn tiếp tục khởi động dự án? (Y/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -ne "Y" -and $response -ne "y") {
        Write-Host "Đã hủy khởi động dự án." -ForegroundColor Red
        exit
    }
}

# Khởi động dự án
Write-Host "Đang khởi động dự án..." -ForegroundColor Blue
pnpm dev
