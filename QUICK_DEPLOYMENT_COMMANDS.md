# ⚡ Quick Command Reference for PebbleHost

## 🚀 **Essential Commands After Upload**

### 📦 **1. Install Dependencies**
```bash
# Navigate to bot directory
cd /home/container

# Install Node.js packages
npm install

# Install Python packages for dashboard
cd flask-dashboard
pip install -r requirements.txt
cd ..
```

### 🔧 **2. Update Discord OAuth2 (CRITICAL)**
- Go to: https://discord.com/developers/applications
- Your bot application → OAuth2 → General
- **REMOVE**: `http://localhost:5000/auth/callback`
- **ADD**: `http://54.39.221.19:25619/auth/callback`
- **SAVE CHANGES**

### 🚀 **3. Start Services**
```bash
# Start Discord Bot (background)
screen -S guardian-bot
node bot.js
# Press Ctrl+A, then Ctrl+D to detach

# Start Flask Dashboard (background)
screen -S flask-dashboard
cd flask-dashboard
python app.py
# Press Ctrl+A, then Ctrl+D to detach
```

### ✅ **4. Verify Everything Works**
```bash
# Check bot is running
screen -list

# Test URLs
curl http://54.39.221.19:25619/health

# Check Discord - bot should be online
```

## 📊 **Production URLs**
- **Dashboard**: http://54.39.221.19:25619
- **Health Check**: http://54.39.221.19:25619/health
- **OAuth2 Callback**: http://54.39.221.19:25619/auth/callback

## 🛠️ **Management Commands**

### 📝 **View Logs**
```bash
# Reattach to bot console
screen -r guardian-bot

# Reattach to dashboard console  
screen -r flask-dashboard

# View log files (if using nohup)
tail -f bot.log
tail -f flask-dashboard/dashboard.log
```

### 🔄 **Restart Services**
```bash
# Kill existing processes
screen -S guardian-bot -X quit
screen -S flask-dashboard -X quit

# Start fresh
screen -S guardian-bot -dm node bot.js
screen -S flask-dashboard -dm bash -c "cd flask-dashboard && python app.py"
```

### 🔍 **Debug Issues**
```bash
# Check Node.js version
node --version

# Check Python version
python --version

# Test config file
node -e "console.log(JSON.parse(require('fs').readFileSync('config.json')))"

# Check running processes
ps aux | grep node
ps aux | grep python
```

## 🎯 **Quick Test Checklist**

After deployment, verify:
- [ ] `npm install` completed without errors
- [ ] `pip install -r requirements.txt` completed
- [ ] Discord OAuth2 redirect URI updated
- [ ] Bot shows online in Discord
- [ ] Dashboard loads at http://54.39.221.19:25619
- [ ] `/ping` command works in Discord
- [ ] OAuth2 login flow works
- [ ] No errors in console logs

## 🆘 **Common Issues & Quick Fixes**

### ❌ **"Module not found" errors**
```bash
npm install
cd flask-dashboard && pip install -r requirements.txt
```

### ❌ **Bot offline in Discord**
- Check bot token in config.json
- Verify internet connectivity
- Check console for error messages

### ❌ **Dashboard not accessible**
- Verify Flask is running on port 25619
- Check firewall/port settings
- Test locally: `curl localhost:25619`

### ❌ **OAuth2 login fails**
- Verify redirect URI updated in Discord
- Check client ID and secret in config.json
- Ensure bot has OAuth2 scope permissions

**That's it! Your Guardian Bot should be live and running!** 🔥🚀