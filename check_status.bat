@echo off
title Guardian Bot - OAuth2 Status Check
color 0E

echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║              🔐 GUARDIAN BOT OAUTH2 STATUS CHECK                    ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

:: Check configuration
echo 📋 Configuration Status:
echo.

if exist "config.json" (
    echo ✅ config.json - Found
    findstr "clientSecret" config.json >nul && echo ✅ Client Secret - Configured || echo ❌ Client Secret - Missing
    findstr "1430270570695491704" config.json >nul && echo ✅ Client ID - Configured || echo ❌ Client ID - Missing
    findstr "redirectUri" config.json >nul && echo ✅ Redirect URI - Configured || echo ❌ Redirect URI - Missing
) else (
    echo ❌ config.json - Missing
)

echo.
echo 📦 Files Status:
echo.

if exist "bot.js" (echo ✅ bot.js - Found) else (echo ❌ bot.js - Missing)
if exist "oauth2.js" (echo ✅ oauth2.js - Found) else (echo ❌ oauth2.js - Missing)  
if exist "dashboard_oauth2.js" (echo ✅ dashboard_oauth2.js - Found) else (echo ❌ dashboard_oauth2.js - Missing)
if exist "register_commands.js" (echo ✅ register_commands.js - Found) else (echo ❌ register_commands.js - Missing)
if exist "package.json" (echo ✅ package.json - Found) else (echo ❌ package.json - Missing)

echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                     🔗 YOUR OAUTH2 URLS                            ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

echo 🏰 Guild Install (Add to Servers):
echo https://discord.com/api/oauth2/authorize?client_id=1430270570695491704^&permissions=8^&scope=bot%%20applications.commands
echo.

echo 👤 User Install (Personal DMs):
echo https://discord.com/api/oauth2/authorize?client_id=1430270570695491704^&scope=applications.commands
echo.

echo 📊 Dashboard Login:
echo https://discord.com/api/oauth2/authorize?client_id=1430270570695491704^&redirect_uri=http://localhost:3000/auth/callback^&response_type=code^&scope=identify%%20guilds
echo.

echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                   📋 NEXT STEPS FOR SERVER                         ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

echo 1. 🔧 Discord Developer Portal Setup:
echo    - Go to: https://discord.com/developers/applications/1430270570695491704
echo    - OAuth2 ^> General ^> Redirects
echo    - Add: http://localhost:3000/auth/callback
echo    - Save Changes
echo.

echo 2. 📦 Install Dependencies on Server:
echo    npm install discord.js express express-session axios
echo.

echo 3. 🚀 Launch Bot:
echo    launch_configured.bat
echo.

echo 4. 🌐 Access Dashboard:
echo    http://localhost:3000
echo.

echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                        🎫 FEATURES READY                           ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

echo ✅ Advanced Ticket System (Modal-based)
echo ✅ Trump AI Entertainment
echo ✅ Skeeter Protection Security  
echo ✅ OAuth2 Dashboard Authentication
echo ✅ User ^& Guild Installable (2025)
echo ✅ Real-time Statistics
echo ✅ Secure Session Management
echo.

echo Press any key to continue...
pause >nul