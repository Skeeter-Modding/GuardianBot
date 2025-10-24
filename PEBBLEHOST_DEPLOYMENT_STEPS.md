# 🚀 PebbleHost Deployment Steps - After File Upload

## 📁 **Step 1: Verify File Upload**

After uploading your bot files to PebbleHost, ensure this structure exists:

```
/home/container/
├── bot.js                    # Main bot file
├── config.json              # Configuration (update needed)
├── package.json             # Dependencies list
├── src/                     # Bot modules
│   ├── BackupManager.js
│   ├── SecurityUtils.js
│   └── DatabaseManager.js   # MySQL integration
└── flask-dashboard/         # Web dashboard
    ├── app.py
    ├── requirements.txt
    └── start.bat
```

## ⚙️ **Step 2: Update config.json for Production**

### 🔧 **Essential Configuration Updates:**

1. **IP Address & Port** (already done):
   ```json
   {
     "redirectUri": "http://54.39.221.19:25619/auth/callback"
   }
   ```

2. **Database Configuration** (if using MySQL):
   ```json
   {
     "database": {
       "enabled": true,
       "host": "YOUR_PEBBLEHOST_MYSQL_HOST",
       "port": 3306,
       "user": "YOUR_MYSQL_USERNAME",
       "password": "YOUR_MYSQL_PASSWORD",
       "database": "YOUR_DATABASE_NAME",
       "connectionLimit": 10,
       "ssl": false
     }
   }
   ```

## 📦 **Step 3: Install Dependencies**

### 🎯 **Node.js Dependencies:**
```bash
# Navigate to bot directory
cd /home/container

# Install Node.js packages
npm install

# Verify installation
npm list
```

### 🐍 **Python Dependencies (for Flask Dashboard):**
```bash
# Navigate to Flask directory
cd flask-dashboard

# Install Python packages
pip install -r requirements.txt

# Verify installation
pip list
```

## 🔧 **Step 4: Discord Developer Portal Updates**

### 🌐 **OAuth2 Redirect URIs:**
1. Go to: https://discord.com/developers/applications
2. Select your Guardian Bot application
3. Navigate: **OAuth2 → General**
4. **REMOVE**: `http://localhost:5000/auth/callback`
5. **ADD**: `http://54.39.221.19:25619/auth/callback`
6. **Save Changes**

### 🤖 **Bot Permissions Check:**
- Ensure bot has all necessary permissions in your Discord server
- Verify bot token is still valid

## 🗄️ **Step 5: Database Setup (Optional but Recommended)**

### 📊 **Create MySQL Database:**
1. **PebbleHost Control Panel** → Databases → MySQL
2. **Create Database**:
   - Name: `guardian_bot_db`
   - Username: `guardian_user`
   - Password: (generate strong password)
3. **Update config.json** with database credentials

## 🚀 **Step 6: Start the Services**

### 🤖 **Start Discord Bot:**
```bash
# Option 1: Direct start (for testing)
node bot.js

# Option 2: Background process (production)
nohup node bot.js > bot.log 2>&1 &

# Option 3: Using screen (recommended)
screen -S guardian-bot
node bot.js
# Press Ctrl+A, then Ctrl+D to detach
```

### 🌐 **Start Flask Dashboard:**
```bash
# Option 1: Direct start (for testing)
cd flask-dashboard
python app.py

# Option 2: Background process (production)
cd flask-dashboard
nohup python app.py > dashboard.log 2>&1 &

# Option 3: Using screen (recommended)
screen -S flask-dashboard
cd flask-dashboard
python app.py
# Press Ctrl+A, then Ctrl+D to detach
```

## ✅ **Step 7: Verify Everything Works**

### 🤖 **Discord Bot Tests:**
1. **Bot Status**: Check if bot shows as online in Discord
2. **Commands**: Test `/ping`, `/ticket-panel`
3. **Ticket System**: Create and manage a test ticket
4. **Skeeter Protection**: Test @mentions (check debug logs)
5. **Security Features**: Verify anti-raid, logging, etc.

### 🌐 **Dashboard Tests:**
1. **Access**: Visit `http://54.39.221.19:25619`
2. **OAuth2**: Test Discord login flow
3. **Functionality**: Check all dashboard features
4. **Health Check**: Visit `http://54.39.221.19:25619/health`

## 📊 **Step 8: Monitor and Maintain**

### 📝 **Check Logs:**
```bash
# Bot logs
tail -f bot.log

# Dashboard logs
tail -f flask-dashboard/dashboard.log

# Real-time monitoring
screen -r guardian-bot        # Reattach to bot
screen -r flask-dashboard     # Reattach to dashboard
```

### 🔄 **Process Management:**
```bash
# Check running processes
ps aux | grep node
ps aux | grep python

# Kill processes if needed
pkill -f "node bot.js"
pkill -f "python app.py"

# Restart services
screen -S guardian-bot -dm node bot.js
screen -S flask-dashboard -dm bash -c "cd flask-dashboard && python app.py"
```

## 🆘 **Step 9: Troubleshooting Common Issues**

### ❌ **Bot Won't Start:**
```bash
# Check Node.js version
node --version

# Check for missing dependencies
npm install

# Check config.json syntax
node -e "console.log(JSON.parse(require('fs').readFileSync('config.json')))"

# Check bot token
grep -o '"token".*' config.json
```

### ❌ **Dashboard Won't Start:**
```bash
# Check Python version
python --version

# Check Flask installation
pip show flask

# Test Flask app locally
cd flask-dashboard
python -c "import app; print('Flask app loaded successfully')"

# Check port availability
netstat -tulpn | grep 25619
```

### ❌ **OAuth2 Issues:**
- Verify redirect URI matches exactly: `http://54.39.221.19:25619/auth/callback`
- Check Discord application client ID and secret
- Ensure bot has OAuth2 permissions

### ❌ **Database Connection Issues:**
```bash
# Test MySQL connection
mysql -h YOUR_HOST -u YOUR_USER -p YOUR_DATABASE

# Check database config in config.json
grep -A 10 '"database"' config.json
```

## 🎯 **Step 10: Production Optimizations**

### 🔐 **Security:**
```bash
# Set file permissions
chmod 600 config.json
chmod 755 bot.js

# Use environment variables (optional)
export DISCORD_TOKEN="your_token"
export DB_PASSWORD="your_db_password"
```

### 📈 **Performance:**
```bash
# Monitor resource usage
htop
df -h
free -h

# Set up log rotation
logrotate bot.log
logrotate flask-dashboard/dashboard.log
```

## ✅ **Final Verification Checklist:**

- [ ] Files uploaded successfully to PebbleHost
- [ ] Dependencies installed (npm install, pip install)
- [ ] config.json updated with production settings
- [ ] Discord OAuth2 redirect URI updated
- [ ] Database created and configured (if using)
- [ ] Discord bot started and online
- [ ] Flask dashboard started and accessible
- [ ] All bot commands working
- [ ] Ticket system functional
- [ ] OAuth2 login flow working
- [ ] Logs being generated properly
- [ ] Services running in background (screen/nohup)

## 🎊 **Success Indicators:**

When everything is working correctly:
- ✅ Bot shows online in Discord member list
- ✅ Dashboard loads at `http://54.39.221.19:25619`
- ✅ OAuth2 login redirects and authenticates
- ✅ Slash commands respond properly
- ✅ Ticket system creates channels
- ✅ No error messages in logs
- ✅ All integrations functional

## 🚀 **Quick Start Script:**

```bash
#!/bin/bash
# Quick deployment script

echo "🚀 Starting Guardian Bot deployment..."

# Install dependencies
npm install
cd flask-dashboard && pip install -r requirements.txt && cd ..

# Start services in background
screen -S guardian-bot -dm node bot.js
screen -S flask-dashboard -dm bash -c "cd flask-dashboard && python app.py"

echo "✅ Guardian Bot deployed!"
echo "📍 Dashboard: http://54.39.221.19:25619"
echo "📊 Check status: screen -list"
```

**Your Guardian Bot is ready for production!** 🔥🤖

**Next**: Test all functionality and monitor logs for any issues.