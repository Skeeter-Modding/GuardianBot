#!/bin/bash
# PebbleHost Guardian Bot Startup Script

echo "🚀 Starting Guardian Bot on PebbleHost"
echo "📍 Server: 54.39.221.19:25619"
echo ""

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found! Please install Node.js 16+"
    exit 1
fi

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found! Please install Python 3.8+"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ Python version: $(python3 --version)"
echo ""

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install Node.js dependencies"
    exit 1
fi

# Install Python dependencies
echo "📦 Installing Python dependencies..."
cd flask-dashboard
pip3 install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Failed to install Python dependencies"
    exit 1
fi
cd ..

echo ""
echo "🎯 All dependencies installed successfully!"
echo ""
echo "🚀 Starting services..."
echo ""

# Start Discord Bot in background
echo "🤖 Starting Discord Bot..."
nohup node bot.js > bot.log 2>&1 &
BOT_PID=$!
echo "✅ Discord Bot started (PID: $BOT_PID)"

# Start Flask Dashboard
echo "🌐 Starting Flask Dashboard..."
cd flask-dashboard
nohup python3 app.py > dashboard.log 2>&1 &
DASHBOARD_PID=$!
cd ..
echo "✅ Flask Dashboard started (PID: $DASHBOARD_PID)"

echo ""
echo "🎉 Guardian Bot is now running!"
echo ""
echo "📍 URLs:"
echo "   Dashboard: http://54.39.221.19:25619"
echo "   Health: http://54.39.221.19:25619/health"
echo "   OAuth2: http://54.39.221.19:25619/auth/callback"
echo ""
echo "📝 Log Files:"
echo "   Bot: ./bot.log"
echo "   Dashboard: ./flask-dashboard/dashboard.log"
echo ""
echo "🔧 Process IDs:"
echo "   Bot PID: $BOT_PID"
echo "   Dashboard PID: $DASHBOARD_PID"
echo ""
echo "⚠️ REMEMBER: Update Discord OAuth2 redirect URI to:"
echo "   http://54.39.221.19:25619/auth/callback"
echo ""
echo "🛑 To stop services:"
echo "   kill $BOT_PID $DASHBOARD_PID"
echo ""
echo "✅ Setup complete! Your Guardian Bot is live! 🔥"