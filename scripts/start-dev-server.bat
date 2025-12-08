@echo off
title House Games - Development Server
color 0A

echo ========================================
echo   HOUSE GAMES - DEVELOPMENT SERVER
echo ========================================
echo.

REM Check if server is already running on any port
set port=0
netstat -ano | findstr ":3000" >nul
if %errorlevel% == 0 (
    set port=3000
)
netstat -ano | findstr ":3001" >nul
if %errorlevel% == 0 (
    set port=3001
)
netstat -ano | findstr ":3002" >nul
if %errorlevel% == 0 (
    set port=3002
)

if %port% neq 0 (
    echo Server already running on port %port%!
    echo Opening browser...
    start http://localhost:%port%
    timeout /t 2 /nobreak >nul
    exit
)

echo Checking dependencies...
cd /d "%~dp0\.."

REM Check if node_modules exists, if not install dependencies
if not exist "node_modules" (
    echo Installing dependencies (this may take a minute)...
    call npm install
    echo.
)

REM Clear Next.js cache to fix module resolution issues
if exist ".next" (
    echo Clearing Next.js cache...
    rmdir /s /q .next 2>nul
    echo Cache cleared.
    echo.
)

echo Starting Next.js development server...
echo.
echo The server will be available at:
echo   http://localhost:3000
echo.
echo Waiting for server to start, then opening browser...
echo Press Ctrl+C in the server window to stop
echo ========================================
echo.

REM Start server in a new window
start "House Games Dev Server" cmd /k "cd /d %~dp0\.. && npm run dev"

REM Wait for server to be ready and detect port
echo Waiting for server to start...
set attempts=0
set port=3000
:check_server
set /a attempts+=1
if %attempts% gtr 20 (
    echo Server is taking longer than expected...
    echo Opening browser anyway...
    goto open_browser
)

timeout /t 3 /nobreak >nul

REM Check which port is being used (3000, 3001, or 3002)
netstat -ano | findstr ":3000" >nul
if %errorlevel% == 0 (
    set port=3000
    goto open_browser
)
netstat -ano | findstr ":3001" >nul
if %errorlevel% == 0 (
    set port=3001
    goto open_browser
)
netstat -ano | findstr ":3002" >nul
if %errorlevel% == 0 (
    set port=3002
    goto open_browser
)

goto check_server

:open_browser
echo.
echo Server is ready on port %port%!
echo Opening House Games in browser...
start http://localhost:%port%
echo.
echo ========================================
echo   Server is running in a separate window
echo   Close that window to stop the server
echo ========================================
timeout /t 3 /nobreak >nul
exit
