# 🚀 PebbleHost Deployment Guide

## 🌐 **Your New Hosting Details:**
- **Host**: PebbleHost (www.pebblehost.com)
- **Domain**: `guardianbot.my.pebble.host`
- **Protocol**: HTTPS (secure)

## ✅ **Configuration Updates Applied:**

### 📝 **config.json Updates:**
```json
{
  "redirectUri": "https://guardianbot.my.pebble.host/auth/callback"
}
```

### 🐍 **Flask Dashboard Updates:**
```python
# Updated fallback URL
DISCORD_REDIRECT_URI = 'https://guardianbot.my.pebble.host/auth/callback'

# Updated startup messages
📍 Dashboard: https://guardianbot.my.pebble.host
🔗 Callback: https://guardianbot.my.pebble.host/auth/callback
```

## 🔧 **Discord Developer Portal Updates Required:**

### 🎯 **OAuth2 Redirect URIs:**
**YOU MUST UPDATE YOUR DISCORD APPLICATION:**

1. Go to: https://discord.com/developers/applications
2. Select your Guardian Bot application
3. Navigate to: **OAuth2 > General**
4. **REMOVE**: `http://localhost:5000/auth/callback`
5. **ADD**: `https://guardianbot.my.pebble.host/auth/callback`
6. **Save Changes**

### 🌐 **Application URLs (Optional):**
- **Privacy Policy URL**: `https://guardianbot.my.pebble.host/privacy`
- **Terms of Service URL**: `https://guardianbot.my.pebble.host/terms`

## 📁 **File Structure for PebbleHost:**

```
guardian-bot/
├── bot.js              # Main Discord bot
├── config.json         # Updated with new domain
├── package.json        # Dependencies
├── src/                # Bot modules
└── flask-dashboard/    # Web dashboard
    ├── app.py          # Flask app (updated)
    ├── requirements.txt
    └── start.bat
```

## 🚀 **Deployment Steps:**

### 1. **Upload Files to PebbleHost:**
- Upload entire `guardian-bot` folder to your server
- Ensure file permissions are correct

### 2. **Install Dependencies:**
```bash
# Node.js dependencies (for bot)
npm install

# Python dependencies (for dashboard)
cd flask-dashboard
pip install -r requirements.txt
```

### 3. **Environment Setup:**
- Ensure Node.js 16+ is installed
- Ensure Python 3.8+ is installed
- Set up process manager (PM2 recommended)

### 4. **Start Services:**
```bash
# Start Discord bot
node bot.js

# Start Flask dashboard (in separate terminal)
cd flask-dashboard
python app.py
```

## 🔐 **Security Notes:**

### ✅ **HTTPS Only:**
- All URLs now use HTTPS for security
- OAuth2 callbacks are encrypted
- Session data is secure

### 🛡️ **Environment Variables:**
Consider moving sensitive data to environment variables:
```bash
export DISCORD_TOKEN="your_token"
export DISCORD_CLIENT_SECRET="your_secret"
```

## 🧪 **Testing Your Deployment:**

### 1. **Bot Functionality:**
- Test Discord commands: `/ping`, `/ticket-panel`
- Verify ticket system works
- Check logging functionality

### 2. **Dashboard Access:**
- Visit: `https://guardianbot.my.pebble.host`
- Test OAuth2 login flow
- Verify dashboard displays correctly

### 3. **OAuth2 Callback:**
- Login via Discord should redirect properly
- No SSL/certificate errors
- User data displays correctly

## 📊 **Monitoring:**

### 🔍 **Health Checks:**
- `https://guardianbot.my.pebble.host/health`
- `https://guardianbot.my.pebble.host/status`

### 📝 **Logs:**
- Bot logs: Check console output
- Dashboard logs: Flask debug output
- Discord logs: Developer portal

## 🚨 **Important Reminders:**

1. **✅ Update Discord OAuth2 URLs** - Critical for login to work
2. **🔐 Keep config.json secure** - Contains sensitive tokens
3. **📦 Install all dependencies** - Both Node.js and Python
4. **🔄 Restart services** after config changes
5. **🌐 Test HTTPS access** - Ensure SSL works properly

## 🎯 **Next Steps:**

1. Deploy files to PebbleHost
2. Update Discord Developer Portal
3. Start both bot and dashboard services
4. Test all functionality
5. Monitor for any issues

**Your Guardian Bot is ready for production hosting!** 🔥🚀