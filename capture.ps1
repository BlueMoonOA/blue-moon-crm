param(
  [string]$Out = "snapshot.txt",
  [int]$MaxBytes = 150000
)

$ErrorActionPreference = "Continue"

# ---- What to include (adjust if you need more/less) ----
$globs = @(
  "package*.json", "pnpm-lock.yaml", "yarn.lock", "package-lock.json",
  "next.config.*", "tsconfig.*", ".eslintrc*", ".prettier*",
  "prisma/**",
  "src/app/layout.tsx",
  "src/components/SiteNav.tsx",
  "src/app/**/*.tsx", "src/app/**/*.ts",
  "src/lib/**/*.ts", "src/lib/**/*.tsx",
  "src/api/**/*.ts", "src/api/**/*.tsx",
  "src/server/**/*.ts", "src/server/**/*.tsx"
)

# ---- Collect files from all globs, then sort/unique ----
$files = @()
foreach ($g in $globs) {
  $files += Get-ChildItem -Path $g -Recurse -File -ErrorAction SilentlyContinue
}
$files = $files | Sort-Object FullName -Unique

# ---- Write a readable snapshot header ----
"Snapshot created $(Get-Date -Format u)" | Out-File -FilePath $Out -Encoding utf8
"Root: $((Get-Location).Path)"         | Out-File -FilePath $Out -Append -Encoding utf8
"Files: $($files.Count)"               | Out-File -FilePath $Out -Append -Encoding utf8

# ---- Dump each file (truncated) ----
foreach ($f in $files) {
  $rel = Resolve-Path $f.FullName -Relative
  "===== FILE: $rel =====" | Out-File -FilePath $Out -Append -Encoding utf8
  try {
    $content = Get-Content -Path $f.FullName -Raw -ErrorAction Stop
    if ($content.Length -gt $MaxBytes) {
      $content = $content.Substring(0, $MaxBytes) + "`n--- TRUNCATED ---"
    }
    $content | Out-File -FilePath $Out -Append -Encoding utf8
  }
  catch {
    "*** ERROR reading ${($f.FullName)}: $($_.Exception.Message) ***" | Out-File -FilePath $Out -Append -Encoding utf8
  }
}