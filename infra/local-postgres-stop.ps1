$ErrorActionPreference = "Stop"

$baseDir = Join-Path $env:LOCALAPPDATA "YSplan"
$postgresDir = Join-Path $baseDir "postgresql17\\pgsql"
$dataDir = Join-Path $baseDir "postgresql17-data"
$pgCtl = Join-Path $postgresDir "bin\\pg_ctl.exe"

if (-not (Test-Path $pgCtl) -or -not (Test-Path (Join-Path $dataDir "PG_VERSION"))) {
  Write-Output "Local PostgreSQL is not installed."
  exit 0
}

& $pgCtl -D $dataDir -m fast stop | Out-Host
