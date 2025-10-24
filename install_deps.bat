@echo off
echo ==========================================
echo   GUARDIAN BOT - DEPENDENCY INSTALLER
echo ==========================================
echo.

echo 📦 Installing required Node.js packages...
echo.

:: Check if package.json exists
if not exist "package.json" (
    echo 📋 Creating package.json...
    (
        echo {
        echo   "name": "guardian-bot-oauth2",
        echo   "version": "2.0.0",
        echo   "description": "Guardian Bot with OAuth2 Dashboard",
        echo   "main": "bot.js",
        echo   "scripts": {
        echo     "start": "node bot.js",
        echo     "register": "node register_commands.js",
        echo     "oauth2": "node -e \"const GuardianDashboard = require('./dashboard_oauth2.js'); const dashboard = new GuardianDashboard(); dashboard.start();\""
        echo   },
        echo   "dependencies": {
        echo     "discord.js": "^14.14.1",
        echo     "express": "^4.21.2",
        echo     "express-session": "^1.17.3",
        echo     "axios": "^1.6.2"
        echo   }
        echo }
    ) > package.json
)

echo ✅ package.json ready
echo.

echo 🔧 Install these packages on your server:
echo.
echo npm install discord.js@latest
echo npm install express@latest  
echo npm install express-session@latest
echo npm install axios@latest
echo.
echo Or simply run:
echo npm install
echo.

echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                    📋 SERVER SETUP COMMANDS                        ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.
echo Copy and run these commands on your server:
echo.
echo 1. npm install
echo 2. node register_commands.js
echo 3. launch_configured.bat
echo.

echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                      🔗 OAUTH2 SETUP REQUIRED                      ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.
echo 🎯 Discord Developer Portal Setup:
echo.
echo 1. Go to: https://discord.com/developers/applications/1430270570695491704
echo 2. Navigate to: OAuth2 ^> General  
echo 3. Add Redirect URI: http://localhost:3000/auth/callback
echo 4. Save Changes
echo.
echo 🔗 Your OAuth2 URLs:
echo.
echo Guild Install:
echo https://discord.com/api/oauth2/authorize?client_id=1430270570695491704^&permissions=8^&scope=bot%%20applications.commands
echo.
echo User Install:
echo https://discord.com/api/oauth2/authorize?client_id=1430270570695491704^&scope=applications.commands
echo.
echo Dashboard Login:
echo https://discord.com/api/oauth2/authorize?client_id=1430270570695491704^&redirect_uri=http://localhost:3000/auth/callback^&response_type=code^&scope=identify%%20guilds
echo.

pause