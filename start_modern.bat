@echo off
echo ==========================================
echo    GUARDIAN BOT 2025 - MODERN DISCORD
echo ==========================================
echo.

echo 🚀 Starting Guardian Bot with 2025 Discord API features...
echo.

:: Check if Node.js is available
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js not found in PATH
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js found!
node --version
echo.

echo 🔧 Installing/updating dependencies...
npm install discord.js@latest express

echo.
echo 📋 REGISTERING MODERN SLASH COMMANDS...
echo.
echo 🌟 2025 Discord Features:
echo   ✅ User-installable apps (works in DMs)
echo   ✅ Guild-installable apps (works in servers)  
echo   ✅ Context-aware commands
echo   ✅ Modern permission handling
echo   ✅ Interactive components
echo.

node register_commands.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Command registration failed!
    echo 💡 Make sure your config.json has the correct:
    echo    • token (Bot Token)
    echo    • clientId (Application ID)
    echo.
    echo 🔧 Check Discord Developer Portal:
    echo    • Bot has "applications.commands" scope
    echo    • Bot token is valid
    echo    • Application ID is correct
    echo.
    pause
    exit /b 1
)

echo.
echo ==========================================
echo         STARTING GUARDIAN BOT
echo ==========================================
echo.
echo 🎫 TICKET SYSTEM: Modal-based creation ready
echo 🇺🇸 TRUMP AI: Entertainment responses loaded
echo 🛡️ SKEETER PROTECTION: Security enabled
echo 📊 DASHBOARD: Web interface available
echo.
echo 🌐 INSTALLATION LINKS GENERATED:
echo.
echo Guild Install (Servers):
echo https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot+applications.commands
echo.
echo User Install (DMs):  
echo https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=applications.commands
echo.
echo ==========================================
echo           BOT STARTING...
echo ==========================================
echo.

node bot.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Bot crashed or stopped with error code: %ERRORLEVEL%
    echo.
    echo 🔧 TROUBLESHOOTING:
    echo   1. Check Discord token in config.json
    echo   2. Verify bot permissions in Discord Developer Portal
    echo   3. Ensure privileged intents are enabled if needed
    echo   4. Check for any missing dependencies
    echo.
) else (
    echo.
    echo ✅ Guardian Bot stopped normally
)

echo.
echo Press any key to exit...
pause >nul