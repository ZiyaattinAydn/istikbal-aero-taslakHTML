# İstikbal Aerospace - isolated CMS data recovery smoke test (Windows / PostgreSQL 18)
# Connects ONLY to 127.0.0.1 using a randomly selected local TCP port.
# Never writes to Supabase or changes the original backup file.
$ErrorActionPreference = 'Stop'
$bin = Join-Path $HOME 'Downloads\pgsql\bin'
$backup = Join-Path $env:LOCALAPPDATA 'IstikbalAerospace\cms-backups\hosted-2026-11-13T01-35-49-680Z\supabase-full-logical.dump'
$expectedSha256 = '96d4e8980e97d050a206879e55af2a78dac733b6ae71b91dadf1012015ac13c0'
$root = Join-Path $env:LOCALAPPDATA ('IstikbalAerospace\cms-restore-test-' + (Get-Date -Format 'yyyyMMdd-HHmmss-fff'))
$data = Join-Path $root 'data'
$log = Join-Path $root 'postgres.log'
$passwordFile = Join-Path $root 'local-password.tmp'
$oldPgPassword = [Environment]::GetEnvironmentVariable('PGPASSWORD', 'Process')
$serverStarted = $false
$passed = $false

try {
  foreach ($name in @('initdb.exe','pg_ctl.exe','pg_restore.exe','psql.exe')) {
    if (!(Test-Path -LiteralPath (Join-Path $bin $name))) { throw "PostgreSQL araci eksik: $name" }
  }
  if (!(Test-Path -LiteralPath $backup)) { throw 'Orijinal veritabani yedegi bulunamadi.' }
  $digest = (Get-FileHash -LiteralPath $backup -Algorithm SHA256).Hash.ToLowerInvariant()
  if ($digest -ne $expectedSha256) { throw 'Yedek SHA-256 uyusmuyor. Islemi durdurdum.' }

  New-Item -ItemType Directory -Path $root -Force | Out-Null
  $randomBytes = New-Object byte[] 32
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  try { $rng.GetBytes($randomBytes) } finally { $rng.Dispose() }
  $localPassword = [Convert]::ToBase64String($randomBytes)
  [System.IO.File]::WriteAllText($passwordFile, $localPassword + [Environment]::NewLine, (New-Object System.Text.UTF8Encoding($false)))

  & (Join-Path $bin 'initdb.exe') -D $data -U postgres '--auth=scram-sha-256' '--encoding=UTF8' --pwfile $passwordFile --no-instructions | Out-Null
  if ($LASTEXITCODE -ne 0) { throw 'Yerel PostgreSQL baslatma dizini olusturulamadi (initdb).' }
  Remove-Item -LiteralPath $passwordFile -Force
  $env:PGPASSWORD = $localPassword

  $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 0)
  $listener.Start()
  try { $port = $listener.LocalEndpoint.Port } finally { $listener.Stop() }

  & (Join-Path $bin 'pg_ctl.exe') -D $data -l $log -o "-h 127.0.0.1 -p $port" -w start | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "Yerel PostgreSQL baslatilamadi. Yerel log: $log" }
  $serverStarted = $true

  $schema = @'
CREATE TABLE public.cms_documents (
  id uuid PRIMARY KEY, kind text NOT NULL, slug text NOT NULL,
  body jsonb, approval text, status text, revision integer, updated_at timestamptz,
  UNIQUE(kind, slug)
);
CREATE TABLE public.cms_page_fields (
  page_slug text NOT NULL, key text NOT NULL, kind text, label text,
  fallback text, PRIMARY KEY(page_slug, key)
);
CREATE TABLE public.cms_versions (
  document_id uuid NOT NULL, revision integer NOT NULL,
  body jsonb, actor uuid, created_at timestamptz,
  PRIMARY KEY(document_id, revision)
);
'@
  $schema | & (Join-Path $bin 'psql.exe') -X -v 'ON_ERROR_STOP=1' -h 127.0.0.1 -p "$port" -U postgres -d postgres | Out-Null
  if ($LASTEXITCODE -ne 0) { throw 'Yerel test tablolari olusturulamadi.' }

  & (Join-Path $bin 'pg_restore.exe') -h 127.0.0.1 -p "$port" -U postgres -d postgres --data-only --schema=public --table=cms_documents --table=cms_page_fields --table=cms_versions --no-owner --no-acl --exit-on-error --strict-names $backup
  if ($LASTEXITCODE -ne 0) { throw 'Yerel veri geri yukleme basarisiz.' }

  $query = "SELECT (SELECT count(*) FROM public.cms_documents WHERE kind='page') || '|' || (SELECT count(*) FROM public.cms_page_fields) || '|' || (SELECT count(*) FROM public.cms_versions);"
  $result = & (Join-Path $bin 'psql.exe') -X -A -t -v 'ON_ERROR_STOP=1' -h 127.0.0.1 -p "$port" -U postgres -d postgres -c $query
  if ($LASTEXITCODE -ne 0) { throw 'Yerel satir sayisi dogrulamasi basarisiz.' }
  $counts = ([string]($result -join '')).Trim()
  if ($counts -ne '21|537|21') { throw "Yedek sayilari uyusmuyor: $counts; beklenen 21|537|21" }
  $passed = $true
  Write-Host 'BASARILI: YEREL CMS VERI KURTARMA TESTI - 21 sayfa / 537 alan / 21 surum.' -ForegroundColor Green
  Write-Host 'NOT: Bu test tam Supabase Auth/Storage/RLS geri yuklemesi degildir.' -ForegroundColor Yellow
}
catch {
  Write-Host ('TEST BASARISIZ: ' + $_.Exception.Message) -ForegroundColor Red
  Write-Host "Yerel test dizini (inceleme icin): $root"
}
finally {
  if ($serverStarted) {
    & (Join-Path $bin 'pg_ctl.exe') -D $data -m fast -w stop | Out-Null
    if ($LASTEXITCODE -ne 0) { Write-Warning "Yerel test sunucusu durdurulamadi; $data konumunu kontrol edin." }
  }
  if (Test-Path -LiteralPath $passwordFile) { Remove-Item -LiteralPath $passwordFile -Force }
  if ($null -eq $oldPgPassword) { Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue }
  else { $env:PGPASSWORD = $oldPgPassword }
  if ($passed) { Remove-Item -LiteralPath $root -Recurse -Force }
}
if (!$passed) { exit 1 }
