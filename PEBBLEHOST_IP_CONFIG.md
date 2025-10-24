# 🚀 PebbleHost Server Configuration

## 🌐 **Your Server Details:**
- **IP Address**: `54.39.221.19`
- **Port**: `25619`
- **Direct URL**: `http://54.39.221.19:25619`

## ✅ **Configuration Updated:**

### 📝 **config.json:**
```json
{
  "redirectUri": "http://54.39.221.19:25619/auth/callback"
}
```

### 🐍 **Flask Dashboard (app.py):**
```python
# Updated to use your server IP and port
DISCORD_REDIRECT_URI = 'http://54.39.221.19:25619/auth/callback'

# Flask runs on port 25619
app.run(host='0.0.0.0', port=25619, debug=True)

# Updated startup messages
📍 Dashboard: http://54.39.221.19:25619
🔗 Callback: http://54.39.221.19:25619/auth/callback
```

## 🔧 **Discord Developer Portal Update:**

**⚠️ CRITICAL - UPDATE YOUR DISCORD APPLICATION:**

1. Go to: https://discord.com/developers/applications
2. Select your Guardian Bot application (ID: 1430270570695491704)
3. Navigate to: **OAuth2 → General**
4. **REMOVE OLD URLs**: 
   - `http://localhost:5000/auth/callback`
   - `https://guardianbot.my.pebble.host/auth/callback`
5. **ADD NEW URL**: `http://54.39.221.19:25619/auth/callback`
6. **Save Changes**

## 🌐 **Your Production URLs:**

- **🏠 Dashboard Home**: http://54.39.221.19:25619
- **🔐 OAuth2 Callback**: http://54.39.221.19:25619/auth/callback
- **💊 Health Check**: http://54.39.221.19:25619/health
- **📊 Status Page**: http://54.39.221.19:25619/status
- **🔑 Login**: http://54.39.221.19:25619/auth/login

## 🚀 **Deployment Commands:**

### 1. **Upload Files to PebbleHost:**
```bash
# Upload entire discord-guardian-bot folder to your server
# Maintain folder structure
```

### 2. **Install Dependencies:**
```bash
# Main bot dependencies
npm install

# Dashboard dependencies
cd flask-dashboard
pip install -r requirements.txt
```

### 3. **Start Services:**
```bash
# Start Discord Bot (primary service)
node bot.js

# Start Flask Dashboard (secondary service)
cd flask-dashboard
python app.py
```

## 🔧 **Server Configuration:**

### 🌐 **Network Settings:**
- **Host**: `0.0.0.0` (binds to all interfaces)
- **Port**: `25619` (your assigned PebbleHost port)
- **Protocol**: HTTP (PebbleHost handles SSL termination)

### 🛡️ **Security Notes:**
- PebbleHost may provide SSL termination
- Keep your tokens secure in config.json
- Monitor server logs for any issues

## 🧪 **Testing Checklist:**

### ✅ **Discord Bot:**
- [ ] Bot comes online successfully
- [ ] Commands work: `/ping`, `/ticket-panel`, `/lockdown`
- [ ] Ticket system creates channels
- [ ] Trump AI responses function
- [ ] Skeeter protection active
- [ ] Logging to Discord channels works

### ✅ **Web Dashboard:**
- [ ] Dashboard loads at `http://54.39.221.19:25619`
- [ ] OAuth2 login redirects properly
- [ ] No connection timeouts
- [ ] User authentication completes
- [ ] All dashboard features work

### ✅ **Integration:**
- [ ] Bot and dashboard communicate
- [ ] Real-time data updates
- [ ] Ticket management works
- [ ] User permissions sync

## 📊 **Process Management:**

### 🔄 **Keep Services Running:**
```bash
# Option 1: Using screen (recommended)
screen -S guardian-bot
node bot.js
# Ctrl+A, Ctrl+D to detach

screen -S flask-dashboard
cd flask-dashboard && python app.py
# Ctrl+A, Ctrl+D to detach

# Option 2: Using nohup
nohup node bot.js > bot.log 2>&1 &
nohup python flask-dashboard/app.py > dashboard.log 2>&1 &
```

### 📝 **Log Files:**
- Bot logs: `bot.log`
- Dashboard logs: `dashboard.log`
- Discord API logs: Console output

## 🆘 **Troubleshooting:**

### 🔌 **Connection Issues:**
- Verify port 25619 is open
- Check firewall settings
- Test IP accessibility: `ping 54.39.221.19`

### 🔐 **OAuth2 Problems:**
- Ensure Discord redirect URI matches exactly
- Check client ID and secret are correct
- Verify callback URL is accessible

### 🤖 **Bot Issues:**
- Check Discord token validity
- Verify all required intents are enabled
- Monitor rate limits

## 📈 **Performance Monitoring:**

### 🔍 **Health Endpoints:**
- `http://54.39.221.19:25619/health` - Dashboard health
- Bot console output - Bot health
- Discord API status - External dependency

### 📊 **Key Metrics:**
- Response times
- Memory usage
- Active connections
- Error rates

## 🎯 **Success Indicators:**

**When everything is working:**
- ✅ Bot shows online in Discord
- ✅ Dashboard loads at IP:port
- ✅ OAuth2 flow completes
- ✅ Users can create tickets
- ✅ Staff can manage tickets
- ✅ All integrations work

**Your Guardian Bot is ready for production on IP 54.39.221.19:25619!** 🚀

**Next Steps:**
1. Deploy files to server
2. Update Discord OAuth2 settings
3. Start both services
4. Test all functionality

🔥 **REMEMBER: Update Discord Developer Portal with the new IP:PORT callback URL!** 🔥