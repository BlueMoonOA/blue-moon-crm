# rebuild-restart.ps1
param(
  [int]$Port = 3010,
  [string]$AppName = "blue-moon-crm"
)

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

# 0) Ensure PM2 exists
if (-not (Get-Command pm2 -ErrorAction SilentlyContinue)) {
  Write-Host "PM2 not found. Installing globally..." -ForegroundColor Yellow
  npm i -g pm2 | Out-Null
}

# 1) Install deps (use npm ci if lockfile is present)
if (Test-Path .\package-lock.json) {
  Write-Host "Installing dependencies with npm ci..." -ForegroundColor Cyan
  npm ci
} else {
  Write-Host "Installing dependencies with npm install..." -ForegroundColor Cyan
  npm install
}

# 2) DB migrations + client
Write-Host "Applying Prisma migrations..." -ForegroundColor Cyan
npx prisma migrate deploy
Write-Host "Generating Prisma client..." -ForegroundColor Cyan
npx prisma generate

# 3) Build Next.js
Write-Host "Building Next.js..." -ForegroundColor Cyan
npm run build

# 4) Start or restart via PM2
# (Try restart; if it doesn't exist, start it)
try {
  pm2 describe $AppName | Out-Null
  Write-Host "Restarting PM2 process '$AppName'..." -ForegroundColor Cyan
  pm2 restart $AppName | Out-Null
} catch {
  Write-Host "Starting PM2 process '$AppName' on port $Port..." -ForegroundColor Cyan
  pm2 start npm --name $AppName -- start -- -p $Port | Out-Null
}

pm2 save | Out-Null
Write-Host "✅ Updated and running at http://localhost:$Port" -ForegroundColor Green
