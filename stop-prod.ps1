# stop-prod.ps1
param([string]$AppName = "blue-moon-crm")

$ErrorActionPreference = 'SilentlyContinue'

if (Get-Command pm2 -ErrorAction SilentlyContinue) {
  pm2 stop $AppName -s | Out-Null
  pm2 delete $AppName -s | Out-Null
  pm2 save | Out-Null
  Write-Host "Stopped and removed PM2 process '$AppName'." -ForegroundColor Green
} else {
  Write-Host "PM2 is not installed; nothing to stop." -ForegroundColor Yellow
}
