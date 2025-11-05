@echo off
echo.
echo ========================================
echo   Powerful CRM - Start Servers
echo ========================================
echo.

powershell -Command "& { $frontendRunning = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue ; $backendRunning = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue ; if(-not $frontendRunning) { Write-Host 'Starting Frontend...' -ForegroundColor Yellow ; Start-Process powershell -ArgumentList '-NoExit', '-Command', 'cd ''u:\Powerful CRM'' ; npm run dev' -WindowStyle Normal ; Start-Sleep -Seconds 5 } else { Write-Host 'Frontend already running' -ForegroundColor Green } ; if(-not $backendRunning) { Write-Host 'Starting Backend...' -ForegroundColor Yellow ; Start-Process powershell -ArgumentList '-NoExit', '-Command', 'cd ''u:\Powerful CRM\backend'' ; npm run dev' -WindowStyle Normal ; Start-Sleep -Seconds 5 } else { Write-Host 'Backend already running' -ForegroundColor Green } ; Start-Sleep -Seconds 3 ; $frontendCheck = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue ; $backendCheck = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue ; Write-Host '' ; Write-Host 'Status:' -ForegroundColor Cyan ; if($frontendCheck) { Write-Host '  Frontend: RUNNING on http://localhost:3000/' -ForegroundColor Green } else { Write-Host '  Frontend: STARTING...' -ForegroundColor Yellow } ; if($backendCheck) { Write-Host '  Backend:  RUNNING on http://localhost:8000/' -ForegroundColor Green } else { Write-Host '  Backend:  STARTING...' -ForegroundColor Yellow } ; Write-Host '' }"

echo.
pause
