@echo off
title SkillSwitch - Full Stack Launcher
color 0A

echo ============================================
echo    SKILLSWITCH - Full Stack Launcher
echo ============================================
echo.

:: Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    pause
    exit /b 1
)

:: Install backend dependencies
echo [1/4] Installing backend dependencies...
cd /d "%~dp0backend"
if not exist node_modules (
    call npm install
) else (
    echo       Backend dependencies already installed.
)

:: Install frontend dependencies
echo [2/4] Installing frontend dependencies...
cd /d "%~dp0frontend"
if not exist node_modules (
    call npm install
) else (
    echo       Frontend dependencies already installed.
)

:: Generate Prisma client
echo [3/4] Setting up database...
cd /d "%~dp0backend"
call npx prisma generate --quiet 2>nul
call npx prisma db push --quiet 2>nul

:: Launch both servers
echo [4/4] Starting servers...
echo.
echo ============================================
echo   Backend:  http://localhost:3001
echo   Frontend: http://localhost:5173
echo ============================================
echo.

:: Start backend in new window
start "SkillSwitch Backend" cmd /k "cd /d %~dp0backend && npm run dev"

:: Wait for backend to start
timeout /t 3 /nobreak >nul

:: Start frontend and open browser
start "SkillSwitch Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

:: Wait for frontend to start then open browser
echo Waiting for frontend to start...
timeout /t 5 /nobreak >nul
start http://localhost:5173

echo.
echo Both servers are running!
echo Close this window or press Ctrl+C to stop.
echo.
pause
