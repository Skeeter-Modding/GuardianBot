@echo off
title Guardian Bot OAuth2 Setup
color 0B

echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                    🔐 DISCORD OAUTH2 SETUP                         ║
echo ║                     Guardian Bot 2025                             ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

:: Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js not found! Install from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found: 
node --version
echo.

:: Install OAuth2 dependencies
echo 🔧 Installing OAuth2 dependencies...
npm install express-session axios

echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                  📋 DISCORD DEVELOPER PORTAL SETUP                 ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.
echo 1. Go to https://discord.com/developers/applications
echo 2. Select your application (or create new one)
echo 3. Copy these values:
echo.
echo    📊 General Information:
echo       • Application ID (Client ID)
echo       • Public Key
echo.
echo    🤖 Bot Section:
echo       • Bot Token (click Reset Token)
echo.
echo    🔐 OAuth2 Section:
echo       • Client Secret (click Reset Secret)
echo.
echo    🔗 OAuth2 Redirects:
echo       Add: http://localhost:3000/auth/callback
echo       Add: https://your-domain.com/auth/callback
echo.
echo    ⚙️ OAuth2 Scopes (for dashboard):
echo       ✅ identify
echo       ✅ guilds
echo       ✅ bot
echo       ✅ applications.commands
echo.
echo    🏰 Installation Settings (NEW 2025):
echo       ✅ User Install
echo       ✅ Guild Install
echo.

pause

:: Check config
if not exist "config.json" (
    echo.
    echo 📋 Creating config.json from template...
    copy config.template.json config.json >nul
    echo.
    echo ✅ Config created! Please edit config.json with your OAuth2 credentials:
    echo.
    echo    "token": "YOUR_BOT_TOKEN_HERE"
    echo    "clientId": "YOUR_APPLICATION_ID_HERE" 
    echo    "clientSecret": "YOUR_CLIENT_SECRET_HERE"
    echo.
    notepad config.json
    echo.
    echo After editing config.json, press any key to continue...
    pause >nul
)

echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                      🔗 OAUTH2 URLS GENERATED                      ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

:: Extract client ID from config for URL generation
for /f "tokens=2 delims=:" %%a in ('findstr "clientId" config.json') do (
    set "CLIENT_ID=%%a"
)
set "CLIENT_ID=%CLIENT_ID:"=%
set "CLIENT_ID=%CLIENT_ID:,=%
set "CLIENT_ID=%CLIENT_ID: =%

echo 🏰 Guild Install (Add to Servers):
echo https://discord.com/api/oauth2/authorize?client_id=%CLIENT_ID%^&permissions=8^&scope=bot%%20applications.commands
echo.
echo 👤 User Install (Personal DMs):
echo https://discord.com/api/oauth2/authorize?client_id=%CLIENT_ID%^&scope=applications.commands  
echo.
echo 📊 Dashboard Login:
echo https://discord.com/api/oauth2/authorize?client_id=%CLIENT_ID%^&redirect_uri=http://localhost:3000/auth/callback^&response_type=code^&scope=identify%%20guilds
echo.

echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                       🚀 STARTING OAUTH2 BOT                       ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

echo 📋 Registering modern slash commands...
node register_commands.js

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Command registration failed! Check your config.json
    pause
    exit /b 1
)

echo.
echo ✅ Commands registered successfully!
echo.
echo 🌐 Starting Guardian Bot with OAuth2 Dashboard...
echo.
echo 📊 Dashboard URLs:
echo    Home: http://localhost:3000
echo    Login: http://localhost:3000/auth/login  
echo    Dashboard: http://localhost:3000/dashboard
echo    Bot Invites: http://localhost:3000/invite
echo.
echo 🔐 OAuth2 Features:
echo    ✅ Discord login authentication
echo    ✅ User server management
echo    ✅ Admin permission checking
echo    ✅ Secure session handling
echo    ✅ Token refresh support
echo.

:: Start bot with OAuth2 dashboard
node -e "
const GuardianBot = require('./bot.js');
const GuardianDashboard = require('./dashboard_oauth2.js');

const bot = new GuardianBot();
const dashboard = new GuardianDashboard(bot);

bot.start();
dashboard.start();
"

echo.
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Bot/Dashboard crashed with error code: %ERRORLEVEL%
    echo.
    echo 🔧 TROUBLESHOOTING:
    echo    1. Check all OAuth2 credentials in config.json
    echo    2. Verify redirect URI in Discord Developer Portal
    echo    3. Ensure client secret is correct
    echo    4. Check bot token validity
) else (
    echo ✅ Bot and OAuth2 Dashboard stopped normally
)

echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║          📚 Need help? Check OAUTH2_SETUP.md                       ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.
pause