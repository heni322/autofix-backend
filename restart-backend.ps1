# Backend Restart Script
Write-Host "Stopping backend server..." -ForegroundColor Yellow
# Kill any running Node.js processes on port 3000
$processes = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($processes) {
    foreach ($proc in $processes) {
        Stop-Process -Id $proc -Force -ErrorAction SilentlyContinue
        Write-Host "Killed process $proc" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Starting backend server..." -ForegroundColor Green
Write-Host ""

# Navigate to backend directory and start
Set-Location -Path "D:\garage-platform\backend"
npm run start:dev
