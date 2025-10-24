@echo off
title Discord Developer Portal - Proper Configuration
color 0E

echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║           🔧 DISCORD DEVELOPER PORTAL CONFIGURATION                ║
echo ║                     Fix OAuth2 Settings                           ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

echo ⚠️  The OAuth2 URL Generator in Discord Portal includes ALL scopes by default!
echo ✅ Here's how to configure it properly for Guardian Bot:
echo.

echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                    📋 STEP-BY-STEP CONFIGURATION                   ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

echo 🔗 1. GO TO YOUR APPLICATION:
echo    https://discord.com/developers/applications/1430270570695491704
echo.

echo 🔧 2. OAUTH2 SETTINGS:
echo    • Click "OAuth2" in left sidebar
echo    • Click "General"
echo    • Under "Redirects", add: http://localhost:3000/auth/callback
echo    • Click "Save Changes"
echo    • ❌ DO NOT use "URL Generator" - it adds all scopes!
echo.

echo 🏠 3. INSTALLATION SETTINGS (IMPORTANT - NEW 2025):
echo    • Click "Installation" in left sidebar
echo    • Under "Installation Contexts":
echo      ✅ Check "User Install"
echo      ✅ Check "Guild Install"
echo.

echo ⚙️ 4. DEFAULT INSTALL SETTINGS:
echo    • For "User Install":
echo      - Scopes: applications.commands (only)
echo    • For "Guild Install":
echo      - Scopes: bot + applications.commands
echo      - Bot Permissions: Select needed permissions
echo        ✅ Send Messages
echo        ✅ Manage Messages  
echo        ✅ Manage Channels
echo        ✅ View Channels
echo        ✅ Manage Roles
echo        ✅ Administrator (recommended)
echo.

echo 💾 5. SAVE CHANGES
echo.

pause

echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                      ✅ CLEAN URLS TO USE                          ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

echo Instead of the generated URL with excessive scopes, use these:
echo.

echo 🏰 GUILD INSTALL (Add to Servers):
echo https://discord.com/api/oauth2/authorize?client_id=1430270570695491704^&permissions=8^&scope=bot%%20applications.commands
echo.

echo 👤 USER INSTALL (Personal DMs):
echo https://discord.com/api/oauth2/authorize?client_id=1430270570695491704^&scope=applications.commands
echo.

echo 📊 DASHBOARD LOGIN (OAuth2):
echo https://discord.com/api/oauth2/authorize?client_id=1430270570695491704^&redirect_uri=http://localhost:3000/auth/callback^&response_type=code^&scope=identify%%20guilds
echo.

echo 🎯 DEFAULT INSTALL LINK (Best for users):
echo https://discord.com/api/oauth2/authorize?client_id=1430270570695491704
echo.

echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                      🚨 AVOID THESE SCOPES                         ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

echo The Discord URL Generator includes these unnecessary/risky scopes:
echo ❌ guilds.members.read - Private member data
echo ❌ email - User email addresses
echo ❌ dm_channels.read - Private messages
echo ❌ presences.read - User activity tracking
echo ❌ relationships.read - Friend lists
echo ❌ messages.read - Message content
echo ❌ voice - Voice channel access
echo ❌ connections - Connected accounts
echo ❌ And 20+ others Guardian Bot doesn't need!
echo.

echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                    🔧 CONFIGURATION VERIFICATION                   ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

echo After configuring Discord Portal, verify:
echo.
echo ✅ OAuth2 Redirects: http://localhost:3000/auth/callback
echo ✅ Installation Contexts: User Install + Guild Install enabled
echo ✅ User Install Scope: applications.commands only
echo ✅ Guild Install Scopes: bot + applications.commands  
echo ✅ Bot Permissions: Selected minimal required permissions
echo ❌ URL Generator: NOT USED (has excessive scopes)
echo.

echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                        🚀 READY TO LAUNCH                          ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

echo Once Discord Portal is configured properly:
echo 1. Run: launch_configured.bat
echo 2. Use the clean URLs above
echo 3. Test OAuth2 dashboard at: http://localhost:3000
echo.

echo The properly configured bot will respect user privacy and follow
echo Discord's 2025 security best practices!
echo.

pause