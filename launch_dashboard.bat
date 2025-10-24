@echo off
echo ==========================================
echo     DISCORD GUARDIAN BOT DASHBOARDS
echo ==========================================
echo.
echo You have 3 dashboard options available:
echo.
echo [1] FastAPI Dashboard (Python) - Recommended
echo     - Professional web interface
echo     - Real-time statistics
echo     - Ticket management
echo     - URL: http://localhost:8000
echo.
echo [2] Express.js Dashboard (Node.js)
echo     - Simple web interface  
echo     - Basic ticket stats
echo     - URL: http://localhost:3000
echo.
echo [3] Demo Dashboard (Python)
echo     - Quick testing interface
echo     - URL: http://localhost:8080
echo.
echo ==========================================
set /p choice="Choose dashboard (1, 2, or 3): "

if "%choice%"=="1" goto fastapi
if "%choice%"=="2" goto express
if "%choice%"=="3" goto demo
echo Invalid choice!
pause
exit /b 1

:fastapi
echo.
echo 🚀 Starting FastAPI Dashboard...
echo.
echo Installing Python dependencies...
pip install fastapi uvicorn jinja2 python-multipart

echo.
echo Starting server at http://localhost:8000
echo.
echo 📋 LOGIN CREDENTIALS:
echo Username: admin
echo Password: guardian123
echo.
echo 🌐 Dashboard URLs:
echo Main Dashboard: http://localhost:8000
echo Ticket Stats:   http://localhost:8000/tickets
echo.
python dashboard_app.py
goto end

:express
echo.
echo 🚀 Starting Express.js Dashboard...
echo.
echo Make sure your Discord bot is running first!
echo The dashboard connects to the running bot.
echo.
echo Installing Node.js dependencies...
npm install express

echo.
echo Starting server at http://localhost:3000
echo.
echo 🌐 Dashboard URLs:
echo Main Dashboard: http://localhost:3000
echo Ticket Stats:   http://localhost:3000/tickets.html
echo.
node dashboard/server.js
goto end

:demo
echo.
echo 🚀 Starting Demo Dashboard...
echo.
echo Installing Python dependencies...
pip install fastapi uvicorn

echo.
echo Starting server at http://localhost:8080
echo.
python demo_dashboard.py
goto end

:end
echo.
echo Dashboard stopped.
pause