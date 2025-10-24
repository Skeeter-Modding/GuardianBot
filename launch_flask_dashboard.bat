@echo off
title Guardian Bot - Flask Dashboard Launcher
color 0B

echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║              🐍 FLASK DASHBOARD LAUNCHER                           ║
echo ║                📁 Redirecting to flask-dashboard/                 ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

echo 🎯 Flask dashboard has been moved to a separate directory for better organization!
echo.
echo 📁 Dashboard location: flask-dashboard/
echo 🤖 Bot files remain in: discord-guardian-bot/ ^(current directory^)
echo.

echo 🔗 What's in each directory:
echo.
echo 📂 discord-guardian-bot/ ^(current^):
echo    • bot.js                - Main Discord bot
echo    • config.json           - Shared configuration  
echo    • package.json          - Node.js dependencies
echo    • oauth2.js             - Node.js OAuth2 system
echo    • All other bot files
echo.
echo 📂 flask-dashboard/:
echo    • app.py               - Flask web server
echo    • requirements.txt     - Python dependencies
echo    • start.bat           - Dashboard launcher
echo    • README.md           - Documentation
echo.

echo ✅ Benefits of separation:
echo    • Clean file organization
echo    • No mixing of bot and dashboard files
echo    • Independent deployment options
echo    • Different tech stacks ^(Node.js vs Python^)
echo.

echo 🚀 To start the Flask dashboard:
echo.
echo Option 1 - From current directory:
echo    cd flask-dashboard
echo    start.bat
echo.
echo Option 2 - Direct navigation:
echo    explorer flask-dashboard
echo    ^(then double-click start.bat^)
echo.

set /p choice="Start Flask dashboard now? (y/n): "
if /i "%choice%"=="y" (
    echo.
    echo 📁 Navigating to flask-dashboard directory...
    cd flask-dashboard
    if exist "start.bat" (
        echo ✅ Found dashboard launcher
        echo 🚀 Starting Flask dashboard...
        call start.bat
    ) else (
        echo ❌ Dashboard files not found in flask-dashboard/
        echo Please check that the directory exists and contains the required files.
    )
) else (
    echo.
    echo 📋 Manual steps to start dashboard:
    echo 1. cd flask-dashboard
    echo 2. start.bat
    echo 3. Visit http://localhost:5000
)

echo.
pause