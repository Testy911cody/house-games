@echo off
title House Games - Clean Start
color 0A

echo ========================================
echo   HOUSE GAMES - CLEAN START
echo ========================================
echo.
echo This will:
echo   1. Clear Next.js cache
echo   2. Reinstall dependencies
echo   3. Start the dev server
echo.
echo ========================================
echo.

cd /d "%~dp0\.."

echo Step 1: Clearing Next.js cache...
if exist ".next" (
    rmdir /s /q .next 2>nul
    echo   Cache cleared!
) else (
    echo   No cache to clear.
)
echo.

echo Step 2: Reinstalling dependencies...
call npm install
echo.

echo Step 3: Starting development server...
echo.
echo The server will be available at:
echo   http://localhost:3000 (or 3001/3002 if port is in use)
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Start server and wait a bit, then detect port and open browser
start /b npm run dev >nul 2>&1

REM Wait for server to start
echo Waiting for server to start...
timeout /t 8 /nobreak >nul

REM Detect which port is being used
set port=3000
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

:open_browser
echo.
echo Server detected on port %port%!
echo Opening browser...
start http://localhost:%port%
echo.
echo Server is running in the background.
echo Check the terminal window for server logs.
echo.

pause

