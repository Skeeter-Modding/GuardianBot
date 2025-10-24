@echo off
echo 🛡️ Discord Guardian Bot Setup
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    echo Then run this script again.
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.

REM Install dependencies
echo 📦 Installing dependencies...
npm install

if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ✅ Dependencies installed successfully!
echo.
echo 📝 Next steps:
echo 1. Edit config.json with your bot settings
echo 2. Create a Discord bot at https://discord.com/developers/applications
echo 3. Add your bot token to config.json
echo 4. Create a log channel and add its ID to config.json
echo 5. Run: npm start
echo.
echo 📖 See README.md for detailed setup instructions
echo.
pause