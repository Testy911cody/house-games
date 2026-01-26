@echo off
echo ========================================
echo HouseGames - Nightly Update Script
echo ========================================
echo.
echo This script will:
echo 1. Pull latest changes from GitHub
echo 2. Create an empty commit
echo 3. Push to trigger automatic deployment
echo.
echo ========================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed!
    pause
    exit /b 1
)

REM Check if we're in a git repository
if not exist .git (
    echo ERROR: Not a git repository!
    echo Run setup-git.bat first.
    pause
    exit /b 1
)

echo [1/3] Pulling latest changes...
git pull
if errorlevel 1 (
    echo WARNING: Pull failed. Continuing anyway...
)

echo.
echo [2/3] Creating nightly update commit...
git commit --allow-empty -m "Nightly update - %date% %time%"
if errorlevel 1 (
    echo WARNING: Commit failed. Maybe no changes?
)

echo.
echo [3/3] Pushing to trigger deployment...
git push
if errorlevel 1 (
    echo ERROR: Push failed!
    echo Make sure you have a remote repository set up.
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✓ Nightly update pushed successfully!
echo ========================================
echo.
echo Your deployment platform (Vercel/Netlify) will
echo automatically detect the push and deploy.
echo.
pause






