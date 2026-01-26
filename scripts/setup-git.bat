@echo off
echo ========================================
echo HouseGames - Git Setup Script
echo ========================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed!
    echo Please install Git from: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo [1/4] Initializing Git repository...
if exist .git (
    echo Git repository already exists.
) else (
    git init
    echo ✓ Git repository initialized
)

echo.
echo [2/4] Adding all files...
git add .
echo ✓ Files added

echo.
echo [3/4] Creating initial commit...
git commit -m "Initial commit - HouseGames website"
if errorlevel 1 (
    echo WARNING: No changes to commit or commit failed.
) else (
    echo ✓ Initial commit created
)

echo.
echo [4/4] Git setup complete!
echo.
echo ========================================
echo NEXT STEPS:
echo ========================================
echo.
echo 1. Create a GitHub repository:
echo    - Go to: https://github.com/new
echo    - Create a new repository (name it "house-games")
echo    - DON'T initialize with README
echo.
echo 2. Connect your local repository:
echo    git remote add origin https://github.com/YOUR_USERNAME/house-games.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 3. Deploy to Vercel:
echo    - Go to: https://vercel.com
echo    - Sign up with GitHub
echo    - Click "Add New Project"
echo    - Select your repository
echo    - Click "Deploy"
echo.
echo ========================================
pause






