@echo off
title Fix Discord OAuth2 Redirect URI
color 0E

echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║              🔧 DISCORD OAUTH2 REDIRECT URI FIXER                 ║
echo ║                   Quick Configuration Update                       ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

echo 🚨 CURRENT ISSUE: 
echo You set redirect URI to: http://discord.gg/guardianbot
echo.
echo ❌ This won't work because:
echo    • Discord.gg URLs are for server invites, not OAuth2
echo    • No server running to handle OAuth2 response
echo    • Authentication will fail after user authorization
echo.

echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                        📋 SOLUTION MENU                            ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

echo 1. 🎯 NO OAUTH2 - Use direct bot invites (RECOMMENDED)
echo 2. 🏠 PLACEHOLDER - Set safe placeholder URL
echo 3. 🖥️  LOCAL SETUP - Configure for local development
echo 4. 🌐 SERVER SETUP - Configure for remote server
echo 5. 📖 MANUAL INSTRUCTIONS - Show step-by-step guide
echo.

set /p choice="Choose option (1-5): "

if "%choice%"=="1" (
    echo.
    echo ╔════════════════════════════════════════════════════════════════════╗
    echo ║              🎯 NO OAUTH2 DASHBOARD SETUP                          ║
    echo ╚════════════════════════════════════════════════════════════════════╝
    echo.
    echo ✅ This option disables OAuth2 and uses direct bot invites
    echo.
    echo 📋 DISCORD PORTAL STEPS:
    echo 1. Go to: https://discord.com/developers/applications/1430270570695491704
    echo 2. Click "OAuth2" in left sidebar
    echo 3. Click "General" 
    echo 4. In "Redirects" section, REMOVE: http://discord.gg/guardianbot
    echo 5. Add this instead: https://discord.com/
    echo 6. Click "Save Changes"
    echo.
    echo 🔗 USE THESE BOT INVITE URLS:
    echo.
    echo Guild Install ^(Add to Server^):
    echo https://discord.com/api/oauth2/authorize?client_id=1430270570695491704^&permissions=8^&scope=bot%%20applications.commands
    echo.
    echo User Install:
    echo https://discord.com/api/oauth2/authorize?client_id=1430270570695491704^&scope=applications.commands
    echo.
    echo ✅ Your bot will have ALL features EXCEPT the web dashboard
    echo.
)

if "%choice%"=="2" (
    echo.
    echo ╔════════════════════════════════════════════════════════════════════╗
    echo ║              🏠 PLACEHOLDER REDIRECT SETUP                         ║
    echo ╚════════════════════════════════════════════════════════════════════╝
    echo.
    echo 📋 DISCORD PORTAL STEPS:
    echo 1. Go to: https://discord.com/developers/applications/1430270570695491704
    echo 2. OAuth2 ^> General ^> Redirects
    echo 3. REMOVE: http://discord.gg/guardianbot
    echo 4. ADD ONE OF THESE SAFE PLACEHOLDERS:
    echo    • https://discord.com/
    echo    • https://example.com/callback
    echo    • https://httpbin.org/get
    echo 5. Save Changes
    echo.
    echo ⚠️  OAuth2 won't work until you have a real server
    echo ✅ But it prevents errors during authorization
    echo.
)

if "%choice%"=="3" (
    echo.
    echo ╔════════════════════════════════════════════════════════════════════╗
    echo ║              🖥️  LOCAL DEVELOPMENT SETUP                           ║
    echo ╚════════════════════════════════════════════════════════════════════╝
    echo.
    echo ⚠️  REQUIREMENTS: Node.js must be installed and working
    echo.
    echo 📋 DISCORD PORTAL STEPS:
    echo 1. Go to: https://discord.com/developers/applications/1430270570695491704
    echo 2. OAuth2 ^> General ^> Redirects
    echo 3. REMOVE: http://discord.gg/guardianbot
    echo 4. ADD: http://localhost:3000/auth/callback
    echo 5. Save Changes
    echo.
    echo 💻 LOCAL SETUP:
    echo 1. Install Node.js from: https://nodejs.org/
    echo 2. Restart computer
    echo 3. Open new command prompt
    echo 4. Run: npm install
    echo 5. Run: node dashboard_oauth2.js
    echo 6. Test: http://localhost:3000
    echo.
)

if "%choice%"=="4" (
    echo.
    echo ╔════════════════════════════════════════════════════════════════════╗
    echo ║              🌐 SERVER SETUP                                       ║
    echo ╚════════════════════════════════════════════════════════════════════╝
    echo.
    echo 📋 DISCORD PORTAL STEPS:
    echo 1. Go to: https://discord.com/developers/applications/1430270570695491704
    echo 2. OAuth2 ^> General ^> Redirects
    echo 3. REMOVE: http://discord.gg/guardianbot
    echo 4. ADD: http://YOUR_SERVER_IP:3000/auth/callback
    echo    ^(Replace YOUR_SERVER_IP with actual IP^)
    echo 5. Save Changes
    echo.
    echo 🖥️  SERVER SETUP:
    echo 1. Transfer all bot files to server
    echo 2. On server: npm install
    echo 3. On server: node dashboard_oauth2.js
    echo 4. Test: http://YOUR_SERVER_IP:3000
    echo.
    echo 📦 FILES TO TRANSFER:
    echo    • bot.js, config.json, package.json
    echo    • oauth2.js, dashboard_oauth2.js
    echo    • All other bot files
    echo.
)

if "%choice%"=="5" (
    echo.
    echo ╔════════════════════════════════════════════════════════════════════╗
    echo ║              📖 MANUAL DISCORD PORTAL STEPS                        ║
    echo ╚════════════════════════════════════════════════════════════════════╝
    echo.
    echo STEP 1: Open Discord Developer Portal
    echo • Go to: https://discord.com/developers/applications/1430270570695491704
    echo.
    echo STEP 2: Navigate to OAuth2 Settings
    echo • Click "OAuth2" in the left sidebar
    echo • Click "General" if not already selected
    echo.
    echo STEP 3: Fix Redirect URIs
    echo • Find the "Redirects" section
    echo • You should see: http://discord.gg/guardianbot
    echo • Click the "X" button to DELETE this URL
    echo.
    echo STEP 4: Add Correct Redirect
    echo • Click "Add Redirect"
    echo • For NO DASHBOARD: Enter https://discord.com/
    echo • For LOCAL DEV: Enter http://localhost:3000/auth/callback
    echo • For SERVER: Enter http://YOUR_SERVER:3000/auth/callback
    echo.
    echo STEP 5: Save Changes
    echo • Click "Save Changes" button at bottom
    echo • Green checkmark should appear
    echo.
    echo STEP 6: Test Bot Invites
    echo • Use direct URLs provided in Option 1
    echo • Bot should work without OAuth2 errors
    echo.
)

echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                    ⚡ QUICK REFERENCE                               ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

echo 🎯 RECOMMENDED: Option 1 ^(No OAuth2^)
echo    • Fastest solution
echo    • All bot features work
echo    • No server setup needed
echo.

echo 🔗 DIRECT BOT INVITES ^(Work immediately^):
echo Guild: https://discord.com/api/oauth2/authorize?client_id=1430270570695491704^&permissions=8^&scope=bot%%20applications.commands
echo User: https://discord.com/api/oauth2/authorize?client_id=1430270570695491704^&scope=applications.commands
echo.

echo 📋 PORTAL URL: https://discord.com/developers/applications/1430270570695491704
echo.

pause