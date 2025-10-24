@echo off
title Guardian Bot 2025 - Modern Discord Setup
color 0A

echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                    🛡️  GUARDIAN BOT 2025                           ║
echo ║                   Modern Discord Implementation                    ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

:: Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js not found! Please install from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js: 
node --version
echo.

:: Check config
if not exist "config.json" (
    echo ❌ config.json not found!
    echo.
    echo 📋 Creating template config.json...
    (
        echo {
        echo     "token": "YOUR_BOT_TOKEN_HERE",
        echo     "clientId": "YOUR_APPLICATION_ID_HERE", 
        echo     "guildId": "YOUR_TEST_SERVER_ID_OPTIONAL",
        echo     "dashboardToken": "guardian123",
        echo     "supportServer": "https://discord.gg/your-support",
        echo     "ticketSystem": {
        echo         "categoryId": "",
        echo         "staffRoleIds": [],
        echo         "maxTicketsPerUser": 3,
        echo         "priorities": {
        echo             "high": {"emoji": "🔴", "color": 15158332, "pingRoles": []},
        echo             "medium": {"emoji": "🟡", "color": 16776960, "pingRoles": []},
        echo             "low": {"emoji": "🟢", "color": 5763719, "pingRoles": []}
        echo         }
        echo     }
        echo }
    ) > config.json
    echo.
    echo ✅ Template created! Please edit config.json with your bot details:
    echo    1. Bot Token from Discord Developer Portal
    echo    2. Application ID (Client ID)
    echo    3. Test Server ID (optional)
    echo.
    pause
    exit /b 1
)

echo ✅ Config file found
echo.

echo 🔧 Installing dependencies...
npm install discord.js@latest express

echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                    🌟 DISCORD 2025 FEATURES                        ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.
echo ✅ User-Installable Apps (works in DMs)
echo ✅ Guild-Installable Apps (works in servers)
echo ✅ Context-Aware Commands
echo ✅ Modern Slash Command Registration  
echo ✅ Interactive Components (buttons, modals)
echo ✅ Proper Permission Handling
echo ✅ Advanced Ticket System with Modals
echo ✅ Trump AI Entertainment
echo ✅ Skeeter Protection Security
echo ✅ Real-time Dashboard
echo.

echo 📋 Registering modern slash commands...
node register_commands.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Command registration failed!
    echo.
    echo 🔧 TROUBLESHOOTING CHECKLIST:
    echo    □ Bot token is correct in config.json
    echo    □ Application ID (clientId) is correct
    echo    □ Bot has "applications.commands" scope
    echo    □ Bot is added to Discord Developer Portal
    echo.
    echo 📖 See DISCORD_2025_SETUP.md for detailed instructions
    pause
    exit /b 1
)

echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                        🎫 TICKET SYSTEM                            ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.
echo 🎯 Commands Available:
echo    /ticket           - Create ticket (modal form)
echo    /claim-ticket     - Staff claim ticket
echo    /close-ticket     - Close ticket  
echo    /ticket-panel     - Create panel with buttons
echo    /ticket-stats     - View statistics
echo    /ticket-transcript - Generate transcript
echo.
echo 🇺🇸 Trump AI Commands:
echo    /trump           - Get Trump response
echo    /trump topic:... - Trump on specific topic  
echo.
echo 🛡️ Security Commands:
echo    /skeeter-check   - Check protection
echo    /setup           - Configure bot (Admin)
echo    /status          - Bot statistics
echo.

echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                       🌐 INSTALLATION LINKS                        ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.
echo 🏰 Guild Install (Servers):
echo https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID^&permissions=8^&scope=bot%%20applications.commands
echo.
echo 👤 User Install (DMs):
echo https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID^&scope=applications.commands
echo.
echo 💡 Replace YOUR_CLIENT_ID with your actual Application ID
echo.

echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                          🚀 STARTING BOT                           ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.
echo Guardian Bot is starting with modern Discord 2025 features...
echo Dashboard will be available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the bot
echo.

node bot.js

echo.
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Bot stopped with error code: %ERRORLEVEL%
    echo.
    echo 🔧 Check the error messages above for troubleshooting
    echo 📖 See DISCORD_2025_SETUP.md for help
) else (
    echo ✅ Bot stopped normally
)

echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║          📚 NEED HELP? Check DISCORD_2025_SETUP.md                 ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.
pause