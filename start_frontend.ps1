$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontendDir = Join-Path $root 'frontend'

if (-not (Test-Path $frontendDir)) {
    throw "Frontend folder not found at $frontendDir"
}

Set-Location $frontendDir

if (-not (Test-Path 'node_modules')) {
    npm install
}

npm run dev -- --host 0.0.0.0 --port 5173
