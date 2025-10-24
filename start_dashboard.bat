@echo off
echo ==========================================
echo    STARTING FASTAPI GUARDIAN DASHBOARD
echo ==========================================
echo.

:: Check if Python is available
python --version >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Python not found!
    echo Please install Python from https://python.org/
    echo.
    pause
    exit /b 1
)

echo ✅ Python found!
echo.

echo 🔧 Installing required packages...
pip install fastapi uvicorn jinja2 python-multipart

echo.
echo 🚀 Starting Guardian Bot Dashboard...
echo.
echo ==========================================
echo           DASHBOARD ACCESS INFO
echo ==========================================
echo 🌐 URL: http://localhost:8000
echo 👤 Username: admin  
echo 🔑 Password: guardian123
echo.
echo 📊 Available Pages:
echo   Main Dashboard: http://localhost:8000
echo   Ticket Stats:   http://localhost:8000/tickets
echo   Login Page:     http://localhost:8000/login
echo ==========================================
echo.
echo Starting server... (Press Ctrl+C to stop)
echo.

python dashboard_app.py

echo.
echo Dashboard stopped.
pause