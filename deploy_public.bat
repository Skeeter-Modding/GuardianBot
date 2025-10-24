@echo off
echo ==========================================
echo   GUARDIAN BOT PUBLIC DASHBOARD SETUP
echo ==========================================
echo.

echo 🚀 Setting up Guardian Bot for public deployment...
echo.

:: Create requirements.txt
echo 📋 Creating requirements.txt...
(
echo fastapi==0.104.1
echo uvicorn==0.24.0
echo jinja2==3.1.2
echo python-multipart==0.0.6
) > requirements.txt

:: Create Procfile for Heroku
echo 📝 Creating Procfile...
echo web: python public_dashboard.py > Procfile

:: Create runtime.txt
echo 🐍 Creating runtime.txt...
echo python-3.11.6 > runtime.txt

echo.
echo ✅ Deployment files created!
echo.
echo 🌐 DEPLOYMENT OPTIONS:
echo.
echo [1] Railway (Recommended)
echo     • Free tier available
echo     • Custom domain: guardianbot.up.railway.app
echo     • GitHub integration
echo.
echo [2] Heroku
echo     • Free tier discontinued, but still popular
echo     • Custom domain: guardianbot-dashboard.herokuapp.com
echo.
echo [3] Render
echo     • Free tier available
echo     • Custom domain: guardianbot-dashboard.onrender.com
echo.
echo [4] DigitalOcean App Platform
echo     • Starting at $5/month
echo     • Professional hosting
echo.
echo [5] Custom VPS/Server
echo     • Full control
echo     • Your own domain: guardianbot.discord.gg
echo.
echo ==========================================
echo          QUICK DEPLOYMENT GUIDE
echo ==========================================
echo.
echo 1. Upload your files to GitHub repository
echo 2. Connect repository to hosting platform
echo 3. Set environment variables:
echo    • PORT=8000
echo    • DISCORD_CLIENT_ID=your_client_id
echo 4. Deploy and get your public URL!
echo.
echo 🔗 Your public dashboard will include:
echo    • Public stats: https://your-domain.com
echo    • Admin panel: https://your-domain.com/admin
echo    • Bot invite: https://your-domain.com/invite
echo    • API endpoint: https://your-domain.com/api/stats
echo.
echo 📱 Mobile-responsive design included!
echo 🔐 Admin panel password: guardian123
echo.

set /p deploy="Would you like to test locally first? (y/n): "
if /i "%deploy%"=="y" (
    echo.
    echo 🧪 Testing locally...
    echo Installing dependencies...
    pip install fastapi uvicorn jinja2 python-multipart
    
    echo.
    echo 🚀 Starting local server...
    echo Open http://localhost:8000 in your browser
    echo.
    python public_dashboard.py
) else (
    echo.
    echo 📤 Ready for deployment!
    echo Upload these files to your hosting platform:
    echo   • public_dashboard.py
    echo   • templates/public_dashboard.html
    echo   • templates/admin_login.html
    echo   • requirements.txt
    echo   • Procfile
    echo   • config.json
)

echo.
pause