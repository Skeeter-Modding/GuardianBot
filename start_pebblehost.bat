@echo off
REM PebbleHost Guardian Bot Startup Script (Windows)

echo 🚀 Starting Guardian Bot for PebbleHost
echo 📍 Target Server: 54.39.221.19:25619
echo.

REM Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found! Please install Node.js 16+
    pause
    exit /b 1
)

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found! Please install Python 3.8+
    pause
    exit /b 1
)

echo ✅ Node.js version:
node --version
echo ✅ Python version: 
python --version
echo.

REM Install Node.js dependencies
echo 📦 Installing Node.js dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install Node.js dependencies
    pause
    exit /b 1
)

REM Install Python dependencies
echo 📦 Installing Python dependencies...
cd flask-dashboard
call pip install -r requirements.txt
if errorlevel 1 (
    echo ❌ Failed to install Python dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo 🎯 All dependencies installed successfully!
echo.
echo 🔧 Configuration Status:
echo    ✅ config.json updated for 54.39.221.19:25619
echo    ✅ Flask app configured for port 25619
echo    ✅ OAuth2 callback set to IP:PORT
echo.
echo ⚠️ IMPORTANT: Before deploying to PebbleHost:
echo.
echo 1. 🌐 Update Discord Developer Portal:
echo    - Go to: https://discord.com/developers/applications
echo    - Select your Guardian Bot application
echo    - OAuth2 → General → Redirect URIs
echo    - REMOVE: http://localhost:5000/auth/callback
echo    - ADD: http://54.39.221.19:25619/auth/callback
echo    - SAVE CHANGES
echo.
echo 2. 📁 Upload files to PebbleHost server
echo.
echo 3. 🚀 Run startup commands on server:
echo    - npm install
echo    - cd flask-dashboard ^&^& pip install -r requirements.txt
echo    - node bot.js ^(in background^)
echo    - cd flask-dashboard ^&^& python app.py ^(in background^)
echo.
echo 📍 Your production URLs will be:
echo    🏠 Dashboard: http://54.39.221.19:25619
echo    🔐 OAuth2: http://54.39.221.19:25619/auth/callback
echo    💊 Health: http://54.39.221.19:25619/health
echo.
echo 📝 For local testing (if needed):
echo    Run: node bot.js
echo    Run: cd flask-dashboard ^&^& python app.py
echo    Note: Dashboard will still try to bind to port 25619
echo.
echo ✅ Configuration ready for PebbleHost deployment! 🔥
echo.
pause