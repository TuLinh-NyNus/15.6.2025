# Script de kiem tra va mo Prisma Studio trong trinh duyet
Write-Host "Dang kiem tra Prisma Studio o cong 8386..." -ForegroundColor Cyan

# Ham de kiem tra xem port co dang duoc su dung khong
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

# Kiem tra xem Prisma Studio da chay chua
if (Test-PortInUse -Port 8386) {
    Write-Host "Prisma Studio dang chay o cong 8386." -ForegroundColor Green
    
    # Mo trinh duyet
    Write-Host "Dang mo Prisma Studio trong trinh duyet..." -ForegroundColor Blue
    Start-Process "http://localhost:8386"
} else {
    Write-Host "Prisma Studio chua duoc khoi dong o cong 8386." -ForegroundColor Yellow
    
    # Hoi nguoi dung co muon khoi dong Prisma Studio khong
    $response = Read-Host "Ban co muon khoi dong Prisma Studio khong? (Y/N)"
    
    if ($response -eq "Y" -or $response -eq "y") {
        Write-Host "Dang khoi dong Prisma Studio..." -ForegroundColor Blue
        
        # Di chuyen den thu muc apps/api
        Set-Location -Path "$PSScriptRoot\..\apps\api"
        
        # Khoi dong Prisma Studio trong mot tab moi
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "pnpx prisma studio --port 8386"
        
        # Cho mot chut de Prisma Studio khoi dong
        Write-Host "Dang cho Prisma Studio khoi dong..." -ForegroundColor Blue
        Start-Sleep -Seconds 3
        
        # Mo trinh duyet
        Write-Host "Dang mo Prisma Studio trong trinh duyet..." -ForegroundColor Blue
        Start-Process "http://localhost:8386"
    } else {
        Write-Host "Da huy khoi dong Prisma Studio." -ForegroundColor Red
    }
}
