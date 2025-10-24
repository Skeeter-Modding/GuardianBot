# ✅ PebbleHost Configuration Checklist

## 🎯 **CRITICAL: Discord Developer Portal Update**

**⚠️ YOU MUST UPDATE THIS IMMEDIATELY OR LOGIN WON'T WORK:**

1. Visit: https://discord.com/developers/applications
2. Select your Guardian Bot application (ID: 1430270570695491704)
3. Go to: **OAuth2 → General**
4. **REMOVE**: `http://localhost:5000/auth/callback`
5. **ADD**: `https://guardianbot.my.pebble.host/auth/callback`
6. Click **Save Changes**

## ✅ **Files Updated for PebbleHost:**

### 📝 **Configuration Files:**
- ✅ `config.json` - Updated redirectUri to HTTPS domain
- ✅ `flask-dashboard/app.py` - Updated default callback URL
- ✅ `flask-dashboard/README.md` - Updated documentation
- ✅ `flask-dashboard/start.bat` - Updated startup messages

### 🌐 **New URLs:**
- **Dashboard**: `https://guardianbot.my.pebble.host`
- **OAuth2 Callback**: `https://guardianbot.my.pebble.host/auth/callback`
- **Health Check**: `https://guardianbot.my.pebble.host/health`

## 🚀 **Deployment Steps:**

### 1. **Upload to PebbleHost:**
```bash
# Upload entire discord-guardian-bot folder
# Ensure all files maintain their structure
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
# Discord Bot (main process)
node bot.js

# Flask Dashboard (secondary process)
cd flask-dashboard && python app.py
```

## 🔐 **Security Considerations:**

### ✅ **HTTPS Everywhere:**
- All URLs now use HTTPS
- Secure OAuth2 flow
- Encrypted callbacks

### 🛡️ **Token Security:**
- Keep `config.json` secure
- Consider environment variables for production
- Never commit tokens to public repos

## 🧪 **Testing Checklist:**

### Discord Bot:
- [ ] Bot comes online successfully
- [ ] Slash commands work (`/ping`, `/ticket-panel`)
- [ ] Ticket system functions properly
- [ ] Trump AI responses work
- [ ] Skeeter protection active
- [ ] Logging to Discord channels

### Web Dashboard:
- [ ] Dashboard loads at `https://guardianbot.my.pebble.host`
- [ ] OAuth2 login redirects properly
- [ ] User data displays correctly
- [ ] No SSL certificate errors
- [ ] Health endpoint responds

### Integration:
- [ ] Bot and dashboard communicate
- [ ] Ticket data syncs properly
- [ ] User authentication works
- [ ] All API endpoints respond

## 📊 **Monitoring URLs:**

- **Main Dashboard**: https://guardianbot.my.pebble.host
- **Health Check**: https://guardianbot.my.pebble.host/health
- **Status Page**: https://guardianbot.my.pebble.host/status
- **Login Test**: https://guardianbot.my.pebble.host/auth/login

## 🆘 **Troubleshooting:**

### OAuth2 Issues:
- ✅ Verify Discord redirect URI is updated
- ✅ Check HTTPS vs HTTP mismatches
- ✅ Ensure client ID/secret are correct

### Bot Connection:
- ✅ Verify token is valid
- ✅ Check internet connectivity
- ✅ Ensure all intents are enabled

### Dashboard Issues:
- ✅ Check Python/Flask installation
- ✅ Verify port 5000 is accessible
- ✅ Test local access first

## 🎯 **Success Indicators:**

When everything is working correctly:
- ✅ Bot shows as online in Discord
- ✅ Dashboard loads without errors
- ✅ OAuth2 login completes successfully  
- ✅ Users can create and manage tickets
- ✅ Staff can access dashboard features

**Your Guardian Bot is ready for production on PebbleHost!** 🚀

**REMEMBER: Update Discord OAuth2 URLs first!** ⚠️