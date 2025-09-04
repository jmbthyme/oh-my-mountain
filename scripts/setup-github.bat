@echo off
setlocal enabledelayedexpansion

echo 🏔️  Mountain Comparison App - GitHub Setup
echo ==========================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the project root.
    pause
    exit /b 1
)

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Git is not installed. Please install Git first.
    pause
    exit /b 1
)

echo.
set /p REPO_URL="📝 Enter your GitHub repository URL (e.g., https://github.com/username/oh-my-mountain.git): "

if "!REPO_URL!"=="" (
    echo ❌ Error: Repository URL is required.
    pause
    exit /b 1
)

REM Initialize git repository if not already done
if not exist ".git" (
    echo 🔧 Initializing Git repository...
    git init
) else (
    echo ✅ Git repository already initialized
)

REM Check if there are any commits
git rev-parse --verify HEAD >nul 2>&1
if errorlevel 1 (
    echo 📦 Creating initial commit...
    git add .
    git commit -m "Initial commit: Mountain Comparison App"
) else (
    echo ✅ Repository already has commits
)

REM Add remote origin
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo 🔗 Adding remote origin...
    git remote add origin "!REPO_URL!"
) else (
    echo 🔄 Updating remote origin...
    git remote set-url origin "!REPO_URL!"
)

REM Set main branch
echo 🌿 Setting up main branch...
git branch -M main

REM Push to GitHub
echo 🚀 Pushing to GitHub...
git push -u origin main
if errorlevel 1 (
    echo ⚠️  Push failed. This might be because:
    echo    - The repository already exists and has content
    echo    - You need to authenticate with GitHub
    echo    - The repository URL is incorrect
    echo.
    echo 💡 Try running: git push -u origin main --force
    echo    ^(Only use --force if you're sure you want to overwrite remote content^)
) else (
    echo ✅ Successfully pushed to GitHub!
)

echo.
echo 🎉 GitHub setup completed!
echo.
echo 📋 Next steps:
echo    1. Go to your GitHub repository
echo    2. Set up Netlify deployment ^(see DEPLOYMENT.md^)
echo    3. Configure GitHub Actions secrets if using CI/CD
echo.
echo 📖 For detailed deployment instructions, see DEPLOYMENT.md

pause