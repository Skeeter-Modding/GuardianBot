@echo off
title Guardian Bot OAuth2 - Ready to Launch!
color 0A

echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                 🔐 GUARDIAN BOT OAUTH2 CONFIGURED                   ║
echo ║                        Ready to Launch!                           ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

echo ✅ Client ID: 1430270570695491704
echo ✅ Client Secret: Configured
echo ✅ OAuth2 Settings: Ready
echo.

:: Install OAuth2 dependencies
echo 🔧 Installing OAuth2 dependencies...
npm install express-session axios

echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                    🔗 YOUR OAUTH2 URLS                             ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

echo 🏰 GUILD INSTALL (Add to Servers):
echo https://discord.com/api/oauth2/authorize?client_id=1430270570695491704^&permissions=8^&scope=bot%%20applications.commands
echo.

echo 👤 USER INSTALL (Personal DMs - NEW 2025):
echo https://discord.com/api/oauth2/authorize?client_id=1430270570695491704^&scope=applications.commands
echo.

echo 📊 DASHBOARD LOGIN:
echo https://discord.com/api/oauth2/authorize?client_id=1430270570695491704^&redirect_uri=http://localhost:3000/auth/callback^&response_type=code^&scope=identify%%20guilds
echo.

echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                 📋 DISCORD DEVELOPER PORTAL SETUP                  ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

echo 🔧 IMPORTANT: Add this redirect URI to your Discord app:
echo.
echo 1. Go to: https://discord.com/developers/applications/1430270570695491704
echo 2. Navigate to: OAuth2 ^> General
echo 3. In "Redirects" section, add:
echo    http://localhost:3000/auth/callback
echo 4. Click "Save Changes"
echo.

echo 🎯 OAUTH2 SCOPES (should be enabled):
echo    ✅ identify
echo    ✅ guilds  
echo    ✅ bot
echo    ✅ applications.commands
echo.

echo 🏰 INSTALLATION CONTEXTS (2025 feature):
echo    ✅ User Install
echo    ✅ Guild Install
echo.

set /p ready="Have you added the redirect URI to Discord Developer Portal? (y/n): "
if /i not "%ready%"=="y" (
    echo.
    echo ⚠️  Please complete the Discord Developer Portal setup first!
    echo    Add redirect URI: http://localhost:3000/auth/callback
    echo    Then run this script again.
    pause
    exit /b 1
)

echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                      🚀 LAUNCHING GUARDIAN BOT                     ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

echo 📋 Registering slash commands...
node register_commands.js

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Command registration failed!
    pause
    exit /b 1
)

echo.
echo ✅ Commands registered successfully!
echo.
echo 🌐 Starting Guardian Bot with OAuth2 Dashboard...
echo.
echo 📊 DASHBOARD URLS:
echo    🏠 Home: http://localhost:3000
echo    🔐 Login: http://localhost:3000/auth/login
echo    📈 Dashboard: http://localhost:3000/dashboard  
echo    🔗 Invites: http://localhost:3000/invite
echo.

echo 🎫 TICKET SYSTEM COMMANDS:
echo    /ticket - Create ticket (modal form)
echo    /claim-ticket - Staff claim ticket
echo    /close-ticket - Close ticket
echo    /ticket-stats - View statistics
echo.

echo 🇺🇸 TRUMP AI COMMANDS:
echo    /trump - Get Trump response
echo    /trump topic:discord - Trump on specific topic
echo.

echo Press Ctrl+C to stop the bot
echo.

:: Start bot with OAuth2 dashboard (if files exist)
if exist "oauth2.js" if exist "dashboard_oauth2.js" (
    echo 🔐 Starting with OAuth2 dashboard...
    node -e "
    try {
        const GuardianBot = require('./bot.js');
        const GuardianDashboard = require('./dashboard_oauth2.js');
        
        console.log('🤖 Starting Guardian Bot...');
        const bot = new GuardianBot();
        
        console.log('🌐 Starting OAuth2 Dashboard...');
        const dashboard = new GuardianDashboard(bot);
        
        bot.start();
        dashboard.start();
    } catch (error) {
        console.error('Error starting bot/dashboard:', error.message);
        console.log('🔄 Falling back to basic bot...');
        const GuardianBot = require('./bot.js');
        const bot = new GuardianBot();
        bot.start();
    }
    "
) else (
    echo 🤖 Starting basic bot (OAuth2 files not found)...
    node bot.js
)

echo.
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Bot stopped with error code: %ERRORLEVEL%
    echo.
    echo 🔧 TROUBLESHOOTING:
    echo    1. Check bot token is valid
    echo    2. Verify OAuth2 redirect URI is added to Discord
    echo    3. Ensure all dependencies are installed
    echo    4. Check Discord Developer Portal settings
) else (
    echo ✅ Guardian Bot stopped normally
)

echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                        🎯 NEXT STEPS                               ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.
echo 1. 🔗 Use guild invite URL to add bot to servers
echo 2. 👤 Use user invite URL for personal DM use
echo 3. 🌐 Visit http://localhost:3000 for dashboard
echo 4. 🔐 Login with Discord for server management
echo 5. 🎫 Test /ticket command in Discord
echo.
pause