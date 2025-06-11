# Thư mục lưu backup
$backupDir = "C:\NyNus_Backups"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "$backupDir\nynus_db_$timestamp.sql"

# Tạo thư mục backup nếu chưa tồn tại
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir
}

# Thực hiện backup
docker exec nynus_postgres pg_dump -U postgres nynus_db > $backupFile

# Giữ lại 10 bản backup gần nhất
Get-ChildItem -Path $backupDir -Filter "nynus_db_*.sql" | 
    Sort-Object -Property LastWriteTime -Descending | 
    Select-Object -Skip 10 | 
    Remove-Item

Write-Host "Database backup completed: $backupFile"
