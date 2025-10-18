@echo off
title Powerful CRM Launcher
color 0B

echo.
echo ============================================
echo    Starting Powerful CRM Application
echo ============================================
echo.

REM Kill existing Node processes
echo [1/4] Cleaning up...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo       Done!
echo.

REM Start Backend
echo [2/4] Starting Backend (Port 8000)...
start "Backend Server" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul
echo       Done!
echo.

REM Start Frontend
echo [3/4] Starting Frontend (Port 3000)...
start "Frontend Server" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul
echo       Done!
echo.

echo [4/4] Waiting for initialization...
timeout /t 5 /nobreak >nul

echo.
echo ============================================
echo    Application Started Successfully!
echo ============================================
echo.
echo  Backend:  http://localhost:8000
echo  Frontend: http://localhost:3000
echo.
echo  Open your browser to: http://localhost:3000
echo.
echo  Press any key to exit...
pause >nul
