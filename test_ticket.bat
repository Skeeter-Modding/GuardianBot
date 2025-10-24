@echo off
echo ==========================================
echo     TESTING DISCORD GUARDIAN BOT
echo ==========================================
echo.

:: Check if Node.js is available
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js not found in PATH
    echo Please install Node.js or add it to your PATH
    echo.
    echo Looking for Node.js in common locations...
    
    if exist "C:\Program Files\nodejs\node.exe" (
        echo ✅ Found Node.js at: C:\Program Files\nodejs\node.exe
        set "NODE_PATH=C:\Program Files\nodejs"
        goto :run_with_path
    )
    
    if exist "C:\Program Files (x86)\nodejs\node.exe" (
        echo ✅ Found Node.js at: C:\Program Files (x86)\nodejs\node.exe
        set "NODE_PATH=C:\Program Files (x86)\nodejs"
        goto :run_with_path
    )
    
    echo ❌ Node.js not found in common locations
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:run_with_path
if defined NODE_PATH (
    echo Using Node.js from: %NODE_PATH%
    set "PATH=%NODE_PATH%;%PATH%"
)

echo ✅ Node.js found! Checking version...
node --version

echo.
echo 🔧 Installing dependencies...
npm install

echo.
echo 🚀 Starting Discord Guardian Bot with Ticket System...
echo.
echo ==========================================
echo  TICKET SYSTEM COMMANDS AVAILABLE:
echo ==========================================
echo  /ticket           - Opens modal to create ticket
echo  /claim-ticket     - Staff claim a ticket
echo  /close-ticket     - Close a ticket
echo  /ticket-panel     - Create ticket panel with button
echo  /ticket-stats     - View ticket statistics
echo ==========================================
echo.

node bot.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Bot crashed or stopped with error code: %ERRORLEVEL%
    echo Check the error messages above for troubleshooting
) else (
    echo.
    echo ✅ Bot stopped normally
)

echo.
pause