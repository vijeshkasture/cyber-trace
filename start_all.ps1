$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $root 'start_backend.ps1'
$frontend = Join-Path $root 'start_frontend.ps1'

Start-Process powershell -ArgumentList "-NoExit", "-File", $backend
Start-Process powershell -ArgumentList "-NoExit", "-File", $frontend
Write-Host "Backend and frontend startup scripts launched in separate terminals."
