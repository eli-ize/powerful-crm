# Powerful CRM - Startup Script
# This script starts both backend and frontend servers

Write-Host "`n╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║       🚀 Starting Powerful CRM Application 🚀       ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Kill any existing Node processes
Write-Host "[1/4] Cleaning up existing processes..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null | Out-Null
Start-Sleep -Seconds 2
Write-Host "      ✓ Cleanup complete`n" -ForegroundColor Green

# Start Backend
Write-Host "[2/4] Starting Backend Server (Port 8000)..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host '🔧 Backend Server' -ForegroundColor Cyan; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 3
Write-Host "      ✓ Backend started`n" -ForegroundColor Green

# Start Frontend
Write-Host "[3/4] Starting Frontend Server (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; Write-Host '⚡ Frontend Server' -ForegroundColor Magenta; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 3
Write-Host "      ✓ Frontend started`n" -ForegroundColor Green

# Wait for servers to be ready
Write-Host "[4/4] Waiting for servers to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check if servers are running
$backendRunning = Test-NetConnection -ComputerName localhost -Port 8000 -InformationLevel Quiet -WarningAction SilentlyContinue
$frontendRunning = Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet -WarningAction SilentlyContinue

Write-Host "`n╔══════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              ✓ Application Started!                 ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "Status:" -ForegroundColor Cyan
if ($backendRunning) {
    Write-Host "  🔧 Backend:  ✓ Running on http://localhost:8000" -ForegroundColor Green
} else {
    Write-Host "  🔧 Backend:  ⚠ Starting... (check backend window)" -ForegroundColor Yellow
}

if ($frontendRunning) {
    Write-Host "  ⚡ Frontend: ✓ Running on http://localhost:3000" -ForegroundColor Green
} else {
    Write-Host "  ⚡ Frontend: ⚠ Starting... (check frontend window)" -ForegroundColor Yellow
}

Write-Host "`n📱 Open your browser to: " -NoNewline -ForegroundColor White
Write-Host "http://localhost:3000" -ForegroundColor Cyan -BackgroundColor Black

Write-Host "`n💡 Tips:" -ForegroundColor Yellow
Write-Host "   • Backend and frontend are running in separate windows" -ForegroundColor Gray
Write-Host "   • Press Ctrl+C in each window to stop servers" -ForegroundColor Gray
Write-Host "   • Check terminal windows for any errors" -ForegroundColor Gray
Write-Host "   • API endpoint: http://localhost:8000/api/health`n" -ForegroundColor Gray

Write-Host "Press any key to exit this window..." -ForegroundColor DarkGray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
