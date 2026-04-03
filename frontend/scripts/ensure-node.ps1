$ErrorActionPreference = 'Stop'
$ver = 'v24.14.1'
$url = "https://nodejs.org/dist/$ver/node-$ver-win-x64.zip"
$zip = Join-Path $env:TEMP "node-$ver-win-x64.zip"
$dest = Join-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) '.nodejs'
if (Test-Path (Join-Path $dest 'node.exe')) {
  Write-Host "Node already present at $dest"
  exit 0
}
Write-Host "Downloading Node $ver ..."
Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing
if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
New-Item -ItemType Directory -Path $dest -Force | Out-Null
Expand-Archive -Path $zip -DestinationPath $dest -Force
$inner = Get-ChildItem $dest -Directory | Select-Object -First 1
if ($inner) {
  Move-Item (Join-Path $inner.FullName '*') $dest -Force
  Remove-Item $inner.FullName -Force
}
Write-Host "OK: $dest"
