$ErrorActionPreference = "Stop"

$baseDir = Join-Path $env:LOCALAPPDATA "YSplan"
$installDir = Join-Path $baseDir "postgresql17"
$postgresDir = Join-Path $installDir "pgsql"
$dataDir = Join-Path $baseDir "postgresql17-data"
$logDir = Join-Path $baseDir "logs"
$zipPath = Join-Path $baseDir "postgresql-17.9-2-windows-x64-binaries.zip"
$passwordFile = Join-Path $baseDir "pg-password.txt"
$logPath = Join-Path $logDir "postgresql17.log"
$downloadUrl = "https://get.enterprisedb.com/postgresql/postgresql-17.9-2-windows-x64-binaries.zip"
$databaseUrl = "postgresql://postgres:postgres@localhost:5432/ysplan?schema=public"

New-Item -ItemType Directory -Force -Path $baseDir, $installDir, $dataDir, $logDir | Out-Null

if (-not (Test-Path $zipPath)) {
  curl.exe -L $downloadUrl -o $zipPath
}

if (-not (Test-Path (Join-Path $postgresDir "bin\\initdb.exe"))) {
  tar -xf $zipPath -C $installDir
}

$initdb = Join-Path $postgresDir "bin\\initdb.exe"
$pgCtl = Join-Path $postgresDir "bin\\pg_ctl.exe"
$psql = Join-Path $postgresDir "bin\\psql.exe"
$createdb = Join-Path $postgresDir "bin\\createdb.exe"
$pgIsReady = Join-Path $postgresDir "bin\\pg_isready.exe"

if (-not (Test-Path (Join-Path $dataDir "PG_VERSION"))) {
  Set-Content -Path $passwordFile -Value "postgres" -NoNewline
  & $initdb -D $dataDir -U postgres -A scram-sha-256 --pwfile=$passwordFile -E UTF8 | Out-Host
  Remove-Item $passwordFile -Force -ErrorAction SilentlyContinue
}

& $pgIsReady -h localhost -p 5432 -U postgres | Out-Null
if ($LASTEXITCODE -ne 0) {
  & $pgCtl -D $dataDir -l $logPath -o "-p 5432" start | Out-Host
  Start-Sleep -Seconds 2
}

$env:PGPASSWORD = "postgres"
$dbExists = & $psql -h localhost -p 5432 -U postgres -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = 'ysplan';"
if ($dbExists -ne "1") {
  & $createdb -h localhost -p 5432 -U postgres ysplan | Out-Host
}

Write-Output "PostgreSQL is ready."
Write-Output "DATABASE_URL=$databaseUrl"
