@echo off
echo 🛡️ Starting Discord Guardian Bot...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if dependencies are installed
if not exist "node_modules" (
    echo 📦 Dependencies not found. Installing...
    npm install
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Check if config.json has been configured
findstr "YOUR_BOT_TOKEN_HERE" config.json >nul
if not errorlevel 1 (
    echo ⚠️  WARNING: config.json has not been configured!
    echo Please edit config.json with your bot settings before starting.
    echo.
    pause
)

echo 🚀 Starting bot...
node bot.js

pause