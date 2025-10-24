@echo off
echo 🚀 GUARDIAN BOT SYSTEM INSTALLER
echo ================================

echo.
echo 🔍 Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed!
    echo 📥 Please install Python from: https://www.python.org/downloads/
    echo ⚠️  Make sure to check "Add Python to PATH" during installation
    pause
    exit /b 1
)

echo ✅ Python found!
echo.

echo 📦 Installing required packages...
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

if errorlevel 1 (
    echo ❌ Failed to install packages!
    echo 🔧 Try running as administrator
    pause
    exit /b 1
)

echo.
echo ✅ Installation complete!
echo 🚀 Starting Guardian Bot System...
echo.

python start_system.py

echo.
echo 🛑 Guardian Bot System stopped
pause