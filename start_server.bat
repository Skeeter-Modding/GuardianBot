@echo off
echo ================================================
echo 🛡️  GUARDIAN BOT SERVER STARTUP
echo ================================================
echo.

echo 🔍 Checking for Node.js installation...

REM Try common Node.js installation paths
set NODE_PATHS="C:\Program Files\nodejs\node.exe" "C:\Program Files (x86)\nodejs\node.exe" "%PROGRAMFILES%\nodejs\node.exe" "%PROGRAMFILES(X86)%\nodejs\node.exe" "%LOCALAPPDATA%\Programs\nodejs\node.exe"

set NODE_FOUND=0
for %%i in (%NODE_PATHS%) do (
    if exist %%i (
        set NODE_EXE=%%i
        set NODE_FOUND=1
        goto :found_node
    )
)

REM Try to find node in PATH
where node >nul 2>&1
if %errorlevel% == 0 (
    set NODE_EXE=node
    set NODE_FOUND=1
    goto :found_node
)

REM If not found, show error
if %NODE_FOUND% == 0 (
    echo ❌ Node.js not found!
    echo.
    echo 📥 Please install Node.js from: https://nodejs.org/
    echo 💡 Or if already installed, ensure it's in your PATH
    echo.
    pause
    exit /b 1
)

:found_node
echo ✅ Node.js found: %NODE_EXE%

REM Get Node.js version
%NODE_EXE% --version
echo.

echo 📦 Installing/updating dependencies...
%NODE_EXE% "%~dp0check_npm.js"

echo.
echo 🚀 Starting Guardian Bot...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🤖 Discord Bot: Starting...
echo 🎫 Ticket System: Active
echo 🤖 Trump AI: Loaded
echo 🌐 Dashboard: http://localhost:3000
echo.
echo Commands available after startup:
echo   /ticket [subject] [priority]
echo   /claim-ticket [assign-to]
echo   /close-ticket [reason]
echo   /ticket-panel [channel]
echo.
echo Press Ctrl+C to stop the bot
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

%NODE_EXE% bot.js

echo.
echo 🛑 Guardian Bot stopped
pause