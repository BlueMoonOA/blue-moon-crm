# tools/dev-check.ps1
$ok = $true

if ($PSVersionTable.PSVersion.Major -lt 7) {
  Write-Host "✖ PowerShell 7+ required" -ForegroundColor Red; $ok = $false
}

$nodeV = (node -v) 2>$null
if (-not $nodeV -or $nodeV -notmatch '^v20\.') {
  Write-Host "⚠ Node 20.x recommended (found $nodeV)" -ForegroundColor Yellow
}

$pnpmV = (pnpm -v) 2>$null
if (-not $pnpmV) {
  Write-Host "✖ pnpm not found" -ForegroundColor Red; $ok = $false
} else {
  Write-Host "✔ pnpm $pnpmV" -ForegroundColor Green
}

if ($ok) { Write-Host "✅ dev env looks good" -ForegroundColor Green }
