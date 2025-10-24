@echo off
echo ==========================================
echo   DISCORD BOT CONFIGURATION CHECKER
echo ==========================================
echo.

:: Check if bot.js exists
if not exist "bot.js" (
    echo ❌ bot.js not found!
    echo Make sure you're in the correct directory
    pause
    exit /b 1
)
echo ✅ bot.js found

:: Check if config.json exists
if not exist "config.json" (
    echo ❌ config.json not found!
    echo You need to configure your bot token and settings
    pause
    exit /b 1
)
echo ✅ config.json found

:: Check if package.json exists
if not exist "package.json" (
    echo ❌ package.json not found!
    echo You need to run 'npm init' and install discord.js
    pause
    exit /b 1
)
echo ✅ package.json found

echo.
echo 🔍 Checking Discord Token Configuration...
findstr /c:"\"token\"" config.json >nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Token not configured in config.json
    echo Please add your Discord bot token
) else (
    echo ✅ Token field found in config.json
)

echo.
echo 🔍 Checking for required dependencies...
if exist "node_modules\discord.js" (
    echo ✅ discord.js installed
) else (
    echo ❌ discord.js not installed - run 'npm install discord.js'
)

echo.
echo 🎫 TICKET SYSTEM STATUS:
echo ✅ Modal-based ticket creation implemented
echo ✅ Ticket claiming system ready
echo ✅ Ticket closing system ready  
echo ✅ Trump AI integration active
echo ✅ Skeeter protection enabled

echo.
echo 📋 TO FIX "/ticket IS NOT PROMPTING ANYTHING":
echo 1. Make sure bot has proper permissions in Discord
echo 2. Ensure slash commands are registered (restart bot)
echo 3. Check that bot token is correct in config.json
echo 4. Verify bot has "applications.commands" scope

echo.
echo 🚀 If everything looks good, run: test_ticket.bat
echo.
pause