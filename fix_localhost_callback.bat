@echo off
title Guardian Bot - OAuth2 Callback Fix
color 0C

echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║              🔧 LOCALHOST CALLBACK CANNOT BE REACHED               ║
echo ║                        Troubleshooting Guide                       ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

echo 🚨 PROBLEM: http://localhost:3000/auth/callback cannot be reached
echo.
echo This happens when:
echo ❌ Guardian Bot dashboard server is not running
echo ❌ Node.js is not installed/working
echo ❌ Port 3000 is blocked or in use
echo ❌ OAuth2 dashboard files are missing
echo.

echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                        🔍 DIAGNOSIS                                ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

echo Checking Node.js availability...
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Node.js found
    node --version
) else (
    echo ❌ Node.js not found or not working
    echo    This is likely the main problem!
)

echo.
echo Checking required files...
if exist "dashboard_oauth2.js" (
    echo ✅ dashboard_oauth2.js found
) else (
    echo ❌ dashboard_oauth2.js missing
)

if exist "oauth2.js" (
    echo ✅ oauth2.js found
) else (
    echo ❌ oauth2.js missing
)

if exist "bot.js" (
    echo ✅ bot.js found
) else (
    echo ❌ bot.js missing
)

echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                          💡 SOLUTIONS                              ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

echo 🎯 SOLUTION 1 - Transfer to Working Server:
echo.
echo Since Node.js isn't working locally, transfer files to your server:
echo 1. Copy entire discord-guardian-bot folder to your server
echo 2. On server, run: npm install
echo 3. On server, run: launch_configured.bat
echo 4. Dashboard will be available at server's localhost:3000
echo.

echo 🎯 SOLUTION 2 - Use Alternative Redirect (No Dashboard):
echo.
echo If you don't need OAuth2 dashboard, use bot-only mode:
echo 1. Change redirect URI in Discord Portal to a placeholder
echo 2. Use these invite URLs directly:
echo.
echo    Guild Install:
echo    https://discord.com/api/oauth2/authorize?client_id=1430270570695491704^&permissions=8^&scope=bot%%20applications.commands
echo.
echo    User Install:
echo    https://discord.com/api/oauth2/authorize?client_id=1430270570695491704^&scope=applications.commands
echo.

echo 🎯 SOLUTION 3 - Install Node.js Locally:
echo.
echo 1. Download Node.js from: https://nodejs.org/
echo 2. Install and restart your computer
echo 3. Open new command prompt
echo 4. Run: node --version (should work)
echo 5. Run: launch_configured.bat
echo.

echo 🎯 SOLUTION 4 - Test Server Connection:
echo.
echo If you have a server with Node.js:
echo 1. Test basic web server:
echo.

echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                    🚀 RECOMMENDED QUICK FIX                        ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

echo For immediate bot functionality without OAuth2 dashboard:
echo.
echo 1. Update Discord Portal redirect URI to: https://discord.com/
echo 2. Use direct bot invite URLs:
echo.
echo    Add to Server:
echo    https://discord.com/api/oauth2/authorize?client_id=1430270570695491704^&permissions=8^&scope=bot%%20applications.commands
echo.
echo 3. Start bot in basic mode (if Node.js works on server):
echo    node bot.js
echo.

echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                    📋 DISCORD PORTAL UPDATE                        ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

echo Until you have a working server, update Discord Portal:
echo.
echo 1. Go to: https://discord.com/developers/applications/1430270570695491704
echo 2. OAuth2 ^> General ^> Redirects
echo 3. Change from: http://localhost:3000/auth/callback
echo 4. Change to: https://discord.com/ (temporary)
echo 5. Save Changes
echo.
echo This prevents OAuth2 errors while you set up the server.
echo.

set /p choice="Which solution do you want to try? (1-4): "

if "%choice%"=="1" (
    echo.
    echo 📦 Creating server transfer package...
    echo.
    echo Files to transfer to your server:
    echo ✅ bot.js
    echo ✅ config.json
    echo ✅ oauth2.js
    echo ✅ dashboard_oauth2.js
    echo ✅ register_commands.js
    echo ✅ package.json
    echo ✅ launch_configured.bat
    echo.
    echo On server, run:
    echo 1. npm install
    echo 2. launch_configured.bat
    echo.
)

if "%choice%"=="2" (
    echo.
    echo 🔗 Bot-only URLs (no dashboard needed):
    echo.
    echo Guild Install:
    echo https://discord.com/api/oauth2/authorize?client_id=1430270570695491704^&permissions=8^&scope=bot%%20applications.commands
    echo.
    echo User Install:
    echo https://discord.com/api/oauth2/authorize?client_id=1430270570695491704^&scope=applications.commands
    echo.
    echo Update Discord Portal redirect to: https://discord.com/
)

if "%choice%"=="3" (
    echo.
    echo 📥 Installing Node.js...
    echo Please download from: https://nodejs.org/
    echo Choose LTS version for stability
    echo Restart computer after installation
)

if "%choice%"=="4" (
    echo.
    echo 🧪 Creating test server script...
    echo This will test if basic web server works...
)

echo.
pause