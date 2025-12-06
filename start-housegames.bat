@echo off
cd /d "%~dp0"
title HouseGames Launcher

echo ========================================
echo   HOUSE GAMES - NEON ARCADE
echo ========================================
echo.

REM Check if server is already running
netstat -ano | findstr ":3000" >nul
if %errorlevel% == 0 (
    echo Server already running on port 3000!
    echo Opening browser...
    start http://localhost:3000
    exit
)

echo Starting HouseGames server...
start "HouseGames Server" cmd /k "npm run dev"

echo Waiting for server to start...
timeout /t 5 /nobreak >nul

REM Wait for server to be ready (check multiple times)
set attempts=0
:check_server
set /a attempts+=1
if %attempts% gtr 10 (
    echo Server is taking longer than expected...
    echo Opening browser anyway...
    goto open_browser
)

timeout /t 2 /nobreak >nul
netstat -ano | findstr ":3000" >nul
if %errorlevel% neq 0 (
    goto check_server
)

:open_browser
echo Server is ready!
echo Opening HouseGames in browser...
start http://localhost:3000
echo.
echo ========================================
echo   Server is running in a separate window
echo   Close that window to stop the server
echo ========================================
timeout /t 2 /nobreak >nul
exit

