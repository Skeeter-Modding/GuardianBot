@echo off
title Guardian Bot System Checker
color 0A

echo.
echo   ╔══════════════════════════════════════════════════════════════╗
echo   ║                 🛡️  GUARDIAN BOT SYSTEM                    ║
echo   ║                                                              ║
echo   ║              🎫 Discord Ticket System                       ║
echo   ║              🤖 Trump AI Integration                        ║
echo   ║              🌐 Web Dashboard                               ║
echo   ║                                                              ║
echo   ╚══════════════════════════════════════════════════════════════╝
echo.

echo 🔍 SYSTEM REQUIREMENTS CHECK
echo =============================

echo.
echo [1/3] Checking Python installation...

python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is NOT installed
    echo.
    echo 📥 SOLUTION: Install Python to use the ticket system
    echo    1. Go to: https://www.python.org/downloads/
    echo    2. Download Python 3.8 or newer
    echo    3. ⚠️  IMPORTANT: Check "Add Python to PATH" during installation
    echo    4. Restart this script after installation
    echo.
    echo 💡 ALTERNATIVE: Use the original Node.js version
    echo    - Install Node.js from: https://nodejs.org/
    echo    - Run: npm install
    echo    - Start with: node bot.js
    echo.
    pause
    goto :end
) else (
    python --version
    echo ✅ Python is installed
)

echo.
echo [2/3] Checking Discord bot token...

if not exist "config.json" (
    echo ❌ config.json not found
    echo 📝 Please configure your bot token first
    pause
    goto :end
)

findstr /C:"YOUR_BOT_TOKEN_HERE" config.json >nul
if not errorlevel 1 (
    echo ❌ Bot token not configured
    echo 📝 Please update config.json with your actual bot token
    pause
    goto :end
) else (
    echo ✅ Bot token configured
)

echo.
echo [3/3] Installing Python packages...

python -m pip install --quiet --upgrade pip
python -m pip install --quiet -r requirements.txt

if errorlevel 1 (
    echo ❌ Failed to install packages
    echo 🔧 Try running as administrator
    pause
    goto :end
) else (
    echo ✅ All packages installed
)

echo.
echo ✅ ALL CHECKS PASSED!
echo.
echo 🚀 Starting Guardian Bot System...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🤖 Discord Bot: Starting...
echo 🌐 Web Dashboard: http://localhost:8000
echo 🔑 Username: admin
echo 🔑 Password: admin123
echo.
echo Press Ctrl+C to stop the system
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

python start_system.py

:end
echo.
echo 🛑 Guardian Bot System stopped
pause