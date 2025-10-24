@echo off
title Guardian Bot - Clean OAuth2 URLs
color 0A

echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                🔧 GUARDIAN BOT CLEAN OAUTH2 URLS                   ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

echo ⚠️  The generated URL has too many permissions!
echo ✅ Here are the clean, secure URLs for Guardian Bot:
echo.

echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                      🏰 GUILD INSTALL (SERVERS)                    ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.
echo Clean URL with only required permissions:
echo.
echo https://discord.com/api/oauth2/authorize?client_id=1430270570695491704^&permissions=8^&scope=bot%%20applications.commands
echo.

echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                      👤 USER INSTALL (PERSONAL)                    ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.
echo For personal DM use (NEW 2025 feature):
echo.
echo https://discord.com/api/oauth2/authorize?client_id=1430270570695491704^&scope=applications.commands
echo.

echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                      📊 DASHBOARD LOGIN                            ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.
echo For OAuth2 dashboard authentication:
echo.
echo https://discord.com/api/oauth2/authorize?client_id=1430270570695491704^&redirect_uri=http://localhost:3000/auth/callback^&response_type=code^&scope=identify%%20guilds
echo.

echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                        ⚠️  SECURITY NOTE                           ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.
echo ❌ AVOID the generated URL - it has unnecessary permissions:
echo    • guilds.members.read (privacy risk)
echo    • email (not needed)
echo    • dm_channels.read (invasive)
echo    • presences.read (privacy risk)
echo    • relationships.read (personal data)
echo    • + many others not needed
echo.
echo ✅ USE the clean URLs above instead!
echo.

echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                    📋 REQUIRED DISCORD SETUP                       ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.
echo 1. Go to: https://discord.com/developers/applications/1430270570695491704
echo 2. OAuth2 ^> General ^> Redirects
echo 3. Add: http://localhost:3000/auth/callback
echo 4. Installation ^> Installation Contexts:
echo    ✅ User Install
echo    ✅ Guild Install
echo 5. Installation ^> Default Install Settings:
echo    User Install: applications.commands
echo    Guild Install: bot + applications.commands
echo.

echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                        🎯 RECOMMENDED SCOPES                       ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.
echo For Bot Installation:
echo ✅ bot - Adds bot to server
echo ✅ applications.commands - Enables slash commands
echo.
echo For Dashboard Login:
echo ✅ identify - Get user info (username, avatar)
echo ✅ guilds - List user's servers
echo.
echo ❌ AVOID these unnecessary scopes:
echo   guilds.members.read, email, dm_channels.read,
echo   presences.read, relationships.read, voice, etc.
echo.

echo Press any key to copy clean URLs to use...
pause >nul

echo.
echo 📋 COPY THESE CLEAN URLS:
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