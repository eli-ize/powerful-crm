@echo off
cls
echo.
echo ========================================
echo   Powerful CRM - Server Status
echo ========================================
echo.

powershell -Command "& { $frontendRunning = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue ; $backendRunning = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue ; Write-Host 'Frontend (3000):' -NoNewline ; if($frontendRunning) { Write-Host ' RUNNING' -ForegroundColor Green ; Write-Host '  URL: http://localhost:3000/' -ForegroundColor Yellow } else { Write-Host ' STOPPED' -ForegroundColor Red } ; Write-Host '' ; Write-Host 'Backend (8000):' -NoNewline ; if($backendRunning) { Write-Host '  RUNNING' -ForegroundColor Green ; Write-Host '  URL: http://localhost:8000/' -ForegroundColor Yellow } else { Write-Host '  STOPPED' -ForegroundColor Red } ; Write-Host '' ; if($frontendRunning -and $backendRunning) { Write-Host 'All systems operational!' -ForegroundColor Green } elseif(-not $frontendRunning -and -not $backendRunning) { Write-Host 'All servers are down - run start-servers.bat' -ForegroundColor Red } else { Write-Host 'Some servers are down - run start-servers.bat' -ForegroundColor Yellow } ; Write-Host '' }"

pause
