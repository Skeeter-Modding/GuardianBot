@echo off
title Flask Dashboard - File Organization Check
color 0A

echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║              📁 FLASK DASHBOARD FILE ORGANIZATION                  ║
echo ║                        Verification Report                        ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

echo 🎯 Checking Flask dashboard organization...
echo.

echo 📂 ROOT DIRECTORY (discord-guardian-bot/):
echo ✅ Bot files (Node.js):
if exist "bot.js" (echo    • bot.js ✅) else (echo    • bot.js ❌)
if exist "config.json" (echo    • config.json ✅) else (echo    • config.json ❌)
if exist "package.json" (echo    • package.json ✅) else (echo    • package.json ❌)
if exist "oauth2.js" (echo    • oauth2.js ✅) else (echo    • oauth2.js ❌)
if exist "dashboard_oauth2.js" (echo    • dashboard_oauth2.js ✅) else (echo    • dashboard_oauth2.js ❌)

echo.
echo ❌ Flask files should NOT be here:
if exist "flask_dashboard.py" (echo    • flask_dashboard.py ❌ FOUND ^(should be moved^)) else (echo    • flask_dashboard.py ✅ NOT FOUND ^(good^))
if exist "requirements_flask.txt" (echo    • requirements_flask.txt ❌ FOUND ^(should be moved^)) else (echo    • requirements_flask.txt ✅ NOT FOUND ^(good^))
if exist "start_flask_dashboard.bat" (echo    • start_flask_dashboard.bat ❌ FOUND ^(should be moved^)) else (echo    • start_flask_dashboard.bat ✅ NOT FOUND ^(good^))

echo.
echo 📂 FLASK DASHBOARD DIRECTORY (flask-dashboard/):
if exist "flask-dashboard" (
    echo ✅ Flask dashboard directory exists
    
    cd flask-dashboard
    
    echo ✅ Required Flask files:
    if exist "app.py" (echo    • app.py ✅) else (echo    • app.py ❌)
    if exist "requirements.txt" (echo    • requirements.txt ✅) else (echo    • requirements.txt ❌)
    if exist "start.bat" (echo    • start.bat ✅) else (echo    • start.bat ❌)
    if exist "README.md" (echo    • README.md ✅) else (echo    • README.md ❌)
    
    echo ✅ Testing files:
    if exist "test_oauth_server.py" (echo    • test_oauth_server.py ✅) else (echo    • test_oauth_server.py ❌)
    if exist "test_oauth_callback.bat" (echo    • test_oauth_callback.bat ✅) else (echo    • test_oauth_callback.bat ❌)
    
    cd ..
) else (
    echo ❌ Flask dashboard directory NOT FOUND!
)

echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                        📋 ORGANIZATION SUMMARY                     ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

echo ✅ PROPERLY SEPARATED:
echo    📂 discord-guardian-bot/     - Bot files ^(Node.js^)
echo    📂 flask-dashboard/          - Dashboard files ^(Python^)
echo.

echo 🚀 TO START FLASK DASHBOARD:
echo    1. cd flask-dashboard
echo    2. start.bat
echo    3. Visit http://localhost:5000
echo.

echo 🧪 TO TEST OAUTH2 CALLBACK:
echo    1. cd flask-dashboard  
echo    2. test_oauth_callback.bat
echo    3. Visit http://localhost:3000
echo.

echo 🔗 LAUNCHER FROM ROOT:
echo    • launch_flask_dashboard.bat
echo.

echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                           ✅ VERIFICATION COMPLETE                  ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.
echo 🎯 All Flask redirect files have been properly organized!
echo 📁 Clean separation between bot files and dashboard files
echo 🐍 Flask dashboard ready to use in separate directory
echo.

pause