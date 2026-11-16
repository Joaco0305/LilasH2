# Removes only anonymous identities recorded by the integration tests.
$ErrorActionPreference = 'Stop'
$root = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$record = Join-Path $root 'supabase/.temp/test-users.txt'
if (!(Test-Path -LiteralPath $record)) { Write-Output 'No recorded test users.'; exit 0 }
$ids = @(Get-Content -LiteralPath $record | Where-Object { $_ } | Sort-Object -Unique)
if (!$ids.Count) { Write-Output 'No recorded test users.'; exit 0 }
foreach ($id in $ids) {
  if ($id -notmatch '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$') { throw 'Invalid test identity; nothing deleted.' }
}
$quoted = ($ids | ForEach-Object { "'$_'::uuid" }) -join ','
$sqlPath = Join-Path $root 'supabase/.temp/cleanup-tests.sql'
"with removed as (delete from auth.users where is_anonymous = true and id in ($quoted) returning id) select count(*) as removed_test_users from removed;" | Set-Content -LiteralPath $sqlPath
$env:npm_config_loglevel = 'silent'
Push-Location (Join-Path $root 'react-app')
try {
  & npx.cmd --no-install supabase db query --linked --file $sqlPath --workdir $root
  if ($LASTEXITCODE -ne 0) { throw 'Cleanup failed; test identity list retained.' }
  Remove-Item -LiteralPath $record, $sqlPath
} finally { Pop-Location }
